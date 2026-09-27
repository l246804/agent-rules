#!/usr/bin/env node
/**
 * tailor.mjs —— 从 AGENTS.merged.md（四源融合规则集）生成按项目裁剪的 AGENTS.md
 *
 * 用法：
 *   node tools/tailor.mjs --profile full --add frontend,machine-block --ci yes --out ../my-app/AGENTS.md
 *   node tools/tailor.mjs --profile minimal --ci no --out AGENTS.md
 *   node tools/tailor.mjs --profile full --keep-provenance   # 保留 [P/K/H/S:path:line] 出处标签
 *
 * 选项：
 *   --profile=minimal|full   裁剪档（默认 full）。minimal = AGENTS.merged.md 附录 A.1
 *   --add=a,b                追加片段：monorepo / frontend / machine-block（可多选、可重复）
 *   --ci=yes|no              项目是否有 CI 矩阵，决定 R6.3 的写法（默认 yes）
 *   --out=path               输出文件（默认 ./AGENTS.generated.md）
 *   --title=...              文档一级标题（默认 "AGENTS.md"）
 *   --keep-provenance        保留出处标签（默认剥离）
 *   --with-decisions         追加"裁决记录"表（默认不加：条款正文已包含裁决结果）
 *   --dry-run                只打印统计，不写文件
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'AGENTS.merged.md');
const SNIPPETS = resolve(ROOT, 'tailor/snippets');

const argv = (() => {
  const out = {};
  const tokens = process.argv.slice(2);
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    const m = /^--([^=]+)(?:=(.*))?$/.exec(t);
    if (!m) continue;
    const key = m[1];
    if (m[2] !== undefined) {
      out[key] = m[2];
    } else if (tokens[i + 1] !== undefined && !tokens[i + 1].startsWith('--')) {
      out[key] = tokens[i + 1];
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
})();

const profile = String(argv.profile ?? 'full');
const ci = String(argv.ci ?? 'yes');
const title = String(argv.title ?? 'AGENTS.md');
const outPath = resolve(process.cwd(), String(argv.out ?? 'AGENTS.generated.md'));
const keepProvenance = argv['keep-provenance'] === true || argv['keep-provenance'] === 'true';
const withDecisions = argv['with-decisions'] === true || argv['with-decisions'] === 'true';
const adds = []
  .concat(argv.add ? String(argv.add).split(',') : [])
  .map((s) => s.trim())
  .filter(Boolean);

// ── 规则文本源 ────────────────────────────────────────────────────────────────
if (!existsSync(SRC)) {
  console.error(`找不到规则源：${SRC}`);
  process.exit(1);
}
const raw = readFileSync(SRC, 'utf8');

/** 解析 ## 顶层小节 */
function parseSections(md) {
  const out = new Map();
  const parts = md.split(/^## /m).slice(1);
  for (const part of parts) {
    const [headingLine, ...body] = part.split('\n');
    const key = headingLine.trim().split(/\s+/)[0]; // "0"、"1"… 、"附录"
    const title = headingLine.trim();
    const clauses = [];
    for (const line of body) {
      const m = /^- \*\*(R\d+\.\d+)[^*]*\*\*\s*(.*)$/.exec(line);
      if (m) clauses.push([m[1], line]); // 保留整行（含 "- " 前缀）
    }
    out.set(key, { title, clauses });
  }
  return out;
}
const sections = parseSections(raw);
const allClauseIds = [...sections.values()].flatMap((s) => s.clauses.map(([id]) => id));
if (allClauseIds.length !== 48) {
  console.error(`规则源解析异常：期望 48 条，实际 ${allClauseIds.length} 条。请检查 AGENTS.merged.md 结构。`);
  process.exit(1);
}

/** 清理条款：剥离出处标签 / ⟨条件式⟩ 标记与残留标点 */
function clean(text) {
  let t = text;
  if (!keepProvenance) {
    // 出处标签在源文件中写作 `[H:path:line]`（含反引号）或裸标签
    const TAG = String.raw`\[(?:P|K|H|S|vite-plus):[^\]]*\]|\[S\]|\[findings/[^\]]*\]`;
    t = t.replace(new RegExp('`\\s*(?:' + TAG + ')\\s*`', 'g'), '');
    t = t.replace(new RegExp(TAG, 'g'), '');
    t = t.replace(/`\s*`/g, ''); // 清理空 code span
    t = t.replace(/[ \t]{2,}/g, ' ');
    t = t.replace(/\s+([，。；：、）])/g, '$1');
    t = t.replace(/（\s*）/g, '');
  }
  t = t.replace(/⟨条件式⟩\s*/g, '');
  return t.replace(/\s+$/g, '');
}

// R6.3 需要按项目（有无 CI 矩阵）二选一
const R63 = {
  yes: '- **R6.3 测试重量级交给 CI，本地只跑最窄证据。** 覆盖与快照由 CI 守门；本地只跑会因本次回归失败的最窄检查，不重复已通过的检查。',
  no: '- **R6.3 每个行为改动配最窄检查。** 改动配一个会因其回归而失败的最小检查，检查范围与改动面匹配。',
};

// ── 裁剪档定义（对应 AGENTS.merged.md 附录 A）────────────────────────────────
const PROFILES = {
  minimal: {
    label: '最小配置（A.1）',
    note: '个人小项目/脚本：理解优先、阶梯、根因、改动范围、类型与边界、依赖、检查底线、输出纪律、安全红线与凭据。',
    sections: [
      ['1', ['R1.1', 'R1.2', 'R1.4']],
      ['2', ['R2.1', 'R2.3', 'R2.6']],
      ['3', ['R3.1', 'R3.3']],
      ['4', ['R4.1', 'R4.2']],
      ['5', ['R5.1']],
      ['6', ['R6.1', 'R6.2', 'R6.4', 'R6.6']],
      ['7', ['R7.1', 'R7.2']],
      ['9', ['R9.4', 'R9.5']],
    ],
  },
  full: {
    label: '完整集（§0–§9）',
    note: '默认档：§0–§9 全部规则；如项目有 CI 矩阵/多包结构/前端栈，用 --add 追加对应片段。',
    sections: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => [n, null]),
  },
};

const cfg = PROFILES[profile];
if (!cfg) {
  console.error(`未知 --profile=${profile}（可用：${Object.keys(PROFILES).join(' / ')}）`);
  process.exit(1);
}
if (!['yes', 'no'].includes(ci)) {
  console.error('--ci 只能是 yes 或 no');
  process.exit(1);
}

// ── 组装 ─────────────────────────────────────────────────────────────────────
const chunks = [];
chunks.push(`# ${title}`);
chunks.push('');
chunks.push(
  `<!-- 由 agent-rules 的四源融合规则集（AGENTS.merged.md）按「${cfg.label}」裁剪生成：profile=${profile} ci=${ci} add=${adds.join(',') || '-'}；出处标签用 --keep-provenance 生成。 -->`,
);
chunks.push('');

let emitted = 0;
const decisions = [
  ['R1.4', '歧义处理：高风险/不可逆先问；其余取最合理默认值继续，并在同一次回复里声明假设与质疑'],
  ['R3.2', '改动追溯：每行改动可追溯；根因修复扩大范围时在交付说明中点明'],
  ['R3.3', '孤儿 vs 既有死代码：自己改动造成的孤儿必清；既有死代码只报告不删'],
  ['R5.1', '依赖：默认爬梯；新增依赖需"能真正删掉自有代码与测试"或"原生确实不足"'],
  ['R5.3', '配置：默认值不重复声明；随部署变化的取值必须是显式可校验的配置字段'],
  ['R6.3', `测试重量级：CI 矩阵 = ${ci}`],
  ['R9.3', '兼容：已发布/持久化世代只能新增版本化后继，不移动、不覆盖、不删除'],
];

for (const [key, keep] of cfg.sections) {
  const sec = sections.get(key);
  if (!sec) continue;
  const lines = [];
  for (const [id, text] of sec.clauses) {
    if (keep && !keep.includes(id)) continue;
    if (id === 'R6.3') {
      lines.push(R63[ci]);
      emitted += 1;
      continue;
    }
    lines.push(clean(text));
    emitted += 1;
  }
  if (!lines.length) continue;
  chunks.push(`## ${sec.title}`, '');
  chunks.push(...lines, '');
}

for (const [index, add] of adds.entries()) {
  const file = resolve(SNIPPETS, `${add}.md`);
  if (!existsSync(file)) {
    console.error(`未知 --add=${add}（可用：monorepo / frontend / machine-block）`);
    process.exit(1);
  }
  const base = 10 + index;
  const extra = readFileSync(file, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => {
      const body = line.startsWith('- **') ? clean(line) : line;
      return body
        .replace(/^## \d+ /, `## ${base} `)
        .replace(/^(- \*\*R)\d+(\.\d+)/, `$1${base}$2`);
    })
    .join('\n');
  chunks.push(extra, '');
  emitted += (extra.match(/^- \*\*/gm) ?? []).length;
}

if (withDecisions) {
  chunks.push('## 附录 · 本文件的裁决记录', '');
  chunks.push('| 条款 | 取值 |', '| --- | --- |');
  for (const [id, value] of decisions) chunks.push(`| ${id} | ${value} |`);
  chunks.push('');
}

const output = chunks.join('\n');
if (argv['dry-run']) {
  console.error(`[dry-run] profile=${profile} add=${adds.join(',') || '-'} ci=${ci} 条款数=${emitted}`);
} else {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, output, 'utf8');
  console.error(`已生成 ${outPath}（profile=${profile} add=${adds.join(',') || '-'} ci=${ci} 条款数=${emitted}）`);
}
