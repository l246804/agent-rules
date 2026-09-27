# tailor：把融合规则集裁剪成项目的 AGENTS.md

## 组成

| 文件 | 作用 |
| --- | --- |
| `tools/tailor.mjs` | 确定性裁剪器：从 `AGENTS.merged.md` 抽取小节/条款，剥离出处标签，按档输出；≥ Node 18，无依赖 |
| `tailor/snippets/*.md` | 追加片段：`monorepo`、`frontend`、`machine-block` |
| `tailor/PROMPT.md` | **给本地 agent 的完整提示词**（侦察 → 选档 → 裁决 7 个条件条款 → 生成 → 自检 → 交付说明） |
| `tailor/SKILL.md` | skill 模板（带 frontmatter），可放进 `.claude/skills/`、`~/.claude/skills/` 或等价目录 |
| `examples/AGENTS.*.md` | 三档裁剪样例（见下） |

## 三种用法

### 1) 让本地 agent 生成（零脚本）

在目标项目里打开 agent，把 `tailor/PROMPT.md` 中"---"之后的内容整段粘贴（把 `<RULES_DIR>` 换成本仓库路径）。agent 会先侦察项目、给出推荐档位并等你确认，再生成与合并。

### 2) 直接跑裁剪器（确定性强，可进 CI）

```bash
# 小项目 / 脚本
node tools/tailor.mjs --profile minimal --ci no --out /path/to/project/AGENTS.md

# 常规项目
node tools/tailor.mjs --profile full --ci yes --out /path/to/project/AGENTS.md

# 前端项目（+ 机器管理区块提醒）
node tools/tailor.mjs --profile full --add frontend,machine-block --ci yes \
  --title "AGENTS.md" --out /path/to/project/AGENTS.md

# 需要审计轨迹时保留出处标签
node tools/tailor.mjs --profile full --keep-provenance --out /tmp/AGENTS.with-provenance.md
```

选项：`--profile minimal|full`、`--add monorepo,frontend,machine-block`（可多选）、`--ci yes|no`、`--out`、`--title`、`--keep-provenance`（保留出处标签）、`--with-decisions`（附裁决记录表）、`--dry-run`。

### 3) 装成 skill（一次配置，长期复用）

把 `tailor/SKILL.md` 复制到宿主技能目录（如 `.claude/skills/tailor-agents-md/SKILL.md`），并让技能能访问本仓库（或把 `AGENTS.merged.md` 与 `tools/` 一起放进技能目录）。之后用触发语（"生成 AGENTS.md"/"裁剪规则集"）即可调用。

## 三档样例（已生成，可直接对照）

| 样例 | 档位 | 条款数 | 适用 |
| --- | --- | --- | --- |
| `examples/AGENTS.minimal.md` | `minimal` + `ci=no` | 19 | 个人小项目、脚本、原型 |
| `examples/AGENTS.frontend.md` | `full` + `frontend` + `machine-block` + `ci=yes` | 52 | 前端项目（含机器区块提醒） |
| `examples/AGENTS.monorepo.md` | `full` + `monorepo` + `ci=yes` | 52 | 多包仓库、多团队协作 |

样例由脚本生成，命令写在各自文件第 3 行的注释里；重新生成：

```bash
node tools/tailor.mjs --profile minimal --ci no --out examples/AGENTS.minimal.md
node tools/tailor.mjs --profile full --add frontend,machine-block --ci yes \
  --title "AGENTS.md（前端项目）" --out examples/AGENTS.frontend.md
node tools/tailor.mjs --profile full --add monorepo --ci yes \
  --title "AGENTS.md（monorepo）" --out examples/AGENTS.monorepo.md
```

## 合并与自检清单（项目里落地时）

1. **合并而非覆盖**：项目专属规则一条不丢；语义重复的合并成一条（保留更具体的措辞）。
2. **不动机器区间**：`<!--VITE PLUS START/END-->` 一类标记内部保持逐字节不变。
3. **软链只改真实文件**：`CLAUDE.md -> AGENTS.md` 时改 `AGENTS.md`。
4. **无残留标签**：产物里不应出现 `[P:`、`[K:`、`[H:`、`[S:`、`findings/`（除非用 `--keep-provenance`）。
5. **编号唯一**：条款无重复；追加片段按 `--add` 顺序编号为 §10、§11…
6. **一个换行结尾**；提交前用 `git diff --cached --check` 兜底。
7. **只报告实际跑过的命令**；把验证命令与结果写进 PR/提交说明。

## 说明

- 规则内容来自四源融合（Ponytail / Karpathy 插件 / DeepSeek Harness / storage-online），出处与冲突裁决见 `REPORT.md`；生成文件默认剥离出处标签，需要审计时用 `--keep-provenance`。
- `machine-block` 片段只含两条规则（人工规则不写进机器区间、机器区间不是稳定规则）；"提交钩子会改写工作区"属于项目体检项，见 `AGENTS.merged.md` 附录 B。
