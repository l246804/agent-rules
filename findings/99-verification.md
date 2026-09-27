# 99 · 独立对抗性核验（task-6 / verifier）

> 核验者 fresh 上下文，不继承 Lead 与分析者推理；只读源仓库与同侪交付物，唯一写入 `findings/99-verification.md`。
> 核验基线：P=`e3ba2aa6`、K=`8869387d`、H=`477b4f42`、S=78 行工作树版本（均与 REPORT.md §1 一致，`git rev-parse HEAD` 实测）。
> 方法：4 源全部引用做**全量**自动包含性审计（非仅抽样）+ 32 条定种随机抽样人工复核（种子 20260927）+ 12 项头条断言反证测试。

## 0 结论摘要

- 核验条目 **41 条：PASS 28 / FAIL 12 / UNVERIFIED 1**（明细见 §1）。
- **融合件本体可落地**：`AGENTS.merged.md` 49 条规则（R0.1–R9.5）**逐条可回溯到 ≥1 源（49/49）**，0 条无源标签、0 条四源之外的新规则，7 条 ⟨条件式⟩ 与 REPORT §6 裁决一一对应（见 §2）。
- 但**交付物文档层有实质性统计错误**：REPORT.md 两处称融合件为"9 组 35 条"，实测为 **10 节 49 条**（§1 V31）；"8 条护栏不变量"实为 **9 条**（V32，错误自 findings/01 传播到 REPORT 5 处）；findings/04 有 2 处引用错误（`package.json:9`→实为 `:10`；`updateAgentInstructions`→实为 `updateExistingAgentInstructions`）。
- **未发现**：引用文本不存在、把营销/benchmark 数字当规则、四源外杜撰规则、大规模静默择一。唯一"冲突单侧落笔"是 C6→R8.3 未标 ⟨条件式⟩（低severity，REPORT §6 已显式记录两侧）。
- **总评**：规则正文（`AGENTS.merged.md`）可直接用于落地；`REPORT.md` 与 `findings/04` 必须先按 §3 修正统计与引用，否则不得作为伴随分析引用。

## 1 逐条核验表

方法列中 `CA`＝引用包含性审计脚本（归一化空白/引号/`…` 后判定逐字片段是否落在被引行区间）；`RS8`＝每源定种随机抽 8 条（种子 20260927）；`TAG`＝全量 `[P|K|H|S:path:line]` 解析与路径/行号存在性校验。

| # | 断言（核验对象） | 核验方法（命令/脚本） | 证据 path:line | 结论 |
|---|---|---|---|---|
| V01 | findings/01 每条规则带可解析 `path:line`，共 48 条 | `grep -c '^\s*-\s*\*\*\[R[0-9]*\]\*\*' findings/01-ponytail.md` → 48 | findings/01:30-147 | PASS |
| V02 | P 逐字引文落在被引行区间 | CA 全量 48 块 → 47/48 命中 | `.refs/ponytail/AGENTS.md:7-13`、`skills/ponytail/SKILL.md:34-42` 等 | PASS |
| V03 | R40 引文出处行区间准确 | `sed -n '71,74p;76p' .refs/ponytail/scripts/check-rule-copies.js` | 引文实为 `check-rule-copies.js:76`，findings/01:131 写 `71-74` | FAIL(低) |
| V04 | P 护栏清单（6 类+测试底线）逐字存在 | `sed -n '92,112p' .refs/ponytail/skills/ponytail/SKILL.md` | `SKILL.md:92-95,97-101,103-105,107-112` | PASS |
| V05 | P 营销数字未进规则 | `grep -n '54% less code' .refs/ponytail/README.md`；REPORT §9 声明 | `README.md:33`；findings/01:296 | PASS |
| V06 | P 规模统计 166 文件 / AGENTS.md 32 行 / rules 30 行 / 6 SKILL(120,41,57,44,50,71) | `git ls-files \| wc -l`、`wc -l skills/*/SKILL.md` | `.refs/ponytail/`（全部一致） | PASS |
| V07 | P 自述"21 处 `ponytail:` 标记（排除测试）" | `git grep -nE '(#\|//) ?ponytail:' -- . ':(exclude)tests' \| grep -v '\.md:'` → 21 | findings/01:202；含 `.md` 则为 31（口径未注明，非错） | PASS |
| V08 | **K 规则正文零处点名 Claude/Anthropic** | `grep -rIn -e claude -e anthropic` 4 份规则文件；`grep -ric anthropic` 全仓 | `CLAUDE.md:1` 仅 H1 `# CLAUDE.md`；`Anthropic` 全仓 0；`LLM` 仅在 `CLAUDE.md:3` | PASS |
| V09 | findings/02 §0.5 的 Claude 行号枚举完整准确 | `grep -in -e claude README.md` | 实为 3,29,31,49,51（模型名）+40,43,45,46（文件名）；`53,54` 无 Claude；findings/02:46 列出 53,54 | FAIL(低) |
| V10 | **K `CLAUDE.md` 与 `AGENTS.md` 正文逐字节相同（仅 H1）** | `sha256sum`；`diff`；`sed -n '2,$p' \| sha256sum` | 两份 `sed -n '2,$p'` 均 `f474d7bb07e840ca…b51c08`；diff 仅 `1c1` | PASS |
| V11 | `SKILL.md` 正文同一（偏移 +17）；`mdc` 静默少 11 行并削减 K18 | `sed -n '19,$p' SKILL.md \| sha256sum`；`grep -vxFf` | `SKILL.md:19-121`；`grep -vxFf` 恰 11 行 | PASS |
| V12 | K 全仓无 `allowed-tools`/`model:`/`disable-model-invocation` | `grep -rn` | 命中 0；`git ls-files`=5 文件 | PASS |
| V13 | K 41 条可引用条目 / 33 个顶层 ID | `grep -cE '^\| K[0-9]+(\.[0-9]+)?[a-z]? \|'` → 41 | findings/02:89-129 | PASS |
| V14 | K 逐字引文落在被引行区间 | CA 全量 41 行 42 片段 → 41/42（1 项为中文元注，非引文） | findings/02 全表 | PASS |
| V15 | **P 的 7 级阶梯与 K 的 7 级阶梯逐级一致** | `diff <(sed -n '7,13p' P/AGENTS.md) <(sed -n '26,32p' K/CLAUDE.md)` → 空 | `.refs/ponytail/AGENTS.md:7-13` ≡ `.refs/karpathy-ponytail-skills/CLAUDE.md:26-32`（逐字节） | PASS |
| V16 | H gate 名可在 `scripts/`/`package.json` 找到（抽 14 个） | `grep -c "\"$g\"" package.json`；`ls scripts/$g*` | `verify-no-unknown-casts`、`verify-doc-budgets`、`verify-client-ui-i18n`、`verify-package-invariants`、`verify-built-package-invariants`、`verify-md-wrap`、`verify-concrete-terms`、`verify-agent-note-format`、`verify-archived-agent-notes`、`verify-translation-pairing`、`verify-cordis-config`、`verify-export-jsdoc`、`verify-md-links` 等全部命中 | PASS |
| V17 | H `run-gates.ts` skip=failed 语义与行号 | `grep -n "status === 'skipped'" scripts/run-gates.ts` → 121 | `scripts/run-gates.ts:121-123`（findings/03:247 引用准确） | PASS |
| V18 | H lefthook pre-push 只跑 typecheck（唯一本地阻断层） | `sed -n '52,55p' lefthook.yml` | `lefthook.yml:52-55` | PASS |
| V19 | H A 层 74 条 ID 唯一且完整 A01–A74 | `grep -oE '\[A[0-9]+\]' \| sort -u \| wc -l` → 74；逐号比对无缺 | findings/03:47-241 | PASS |
| V20 | H 逐字引文落在被引行区间 | CA 全量 74 块 96 片段 → 94/96 | `A09`（加反引号属格式差异，可接受）；`A59` 删除了 `](../skills/…/SKILL.md)` 链接目标而未标 `…` | FAIL(低) |
| V21 | H "15 个 SKILL.md" | `find .agents/skills -name SKILL.md \| wc -l` → 14（目录 15，`ask-matt/` 无 SKILL.md） | findings/03:16,295；REPORT §1:26 | FAIL(低) |
| V22 | H "`scripts/` 下 267 个脚本" | `find scripts -type f`=333；`-maxdepth 1 -type f`=274；`*.ts`=271；穷举 8 种过滤均非 267 | findings/03:15；REPORT §1:26 | FAIL(中低) |
| V23 | H "17 个子树 AGENTS.md + 4 个夹具" | `git ls-files '*AGENTS.md'`=22（1 根 + 16 子树 + `snapshots/AGENTS.md` + 4 夹具） | 17 = 16 子树 + `snapshots/AGENTS.md`；夹具 4 | PASS |
| V24 | H 68 个 `verify-*.ts` / 184 npm scripts / 根 AGENTS.md 182 行 1949 词 / 预算 manifest 8 条目 | `ls scripts/verify-*.ts \| wc -l`；`python3 -c json`；`wc -lw` | 68 / 184 / 182 行 / 1949 词 / `scripts/doc-budgets.manifest.json` 8 键 | PASS |
| V25 | H 文档预算"散文 vs manifest 漂移"（U2） | `sed -n '58p' docs/AGENTS.md` + manifest | 散文 `architecture.md ≤ 2,400` vs manifest `2410`；`testing.md 1,300` vs `1350` | PASS |
| V26 | **S Vite+ 区块与包内模板 md5 相同** | `sed -n '1,27p' S/AGENTS.md \| md5sum` vs `md5sum node_modules/vite-plus/AGENTS.md` | 两侧均 `ee8ea10ff2d9fbad9e3a5254c44d3882`（各 27 行） | PASS |
| V27 | S 由 `agent.ts` 注入：标记常量与模板读取 | `sed -n '77,78p;231,250p' /home/leihaohao/workspace/vite-plus/packages/cli/src/utils/agent.ts` | `:77-78` 常量；`:237` `path.join(pkgRoot,'AGENTS.md')`；`:220-250` 注释 "No Vite+ markers → no writes" | PASS（函数名须更正，见 V28/§3） |
| V28 | S 触发点 `package.json:9` `"prepare": "vp config"` | `grep -n 'prepare' S/package.json` | 实为 `package.json:10`（`:9` 是 `"preview"`）；findings/04:22,85 | FAIL(低) |
| V29 | S 人工约定区行号 L31–L78（抽 20 处） | `sed -n "${n}p" S/AGENTS.md` 逐行比对 | L31/39/40/44-47/55/62-65/69-72/76-78 全部与 findings/04 表格一致 | PASS |
| V30 | S 项目文件抽查（vite.config.ts:16/21-23/26/29、tsconfig.json:24、settings.ts:11-15、router-plugin:46,48、src `as`=0） | `sed -n`、`grep -rEn '\bas\s+(any\|unknown\|[A-Z]\w*)'` | 全部命中；`src` 内断言 0 处 | PASS |
| V31 | **REPORT "9 组 35 条"（2 处）与 §5 "按 9 组组织"** | `grep -o 'R[0-9]\.[0-9]' \| sort -u \| wc -l`=49；`grep -c '^## '`=13（10 节+3 附录） | REPORT:11,102,175 vs `AGENTS.merged.md` §0–§9 共 10 节、49 条 | FAIL(高) |
| V32 | REPORT/findings/01 "8 条护栏不变量" | `sed -n '44,58p' .refs/ponytail/scripts/check-rule-copies.js` | `INVARIANTS` 实为 **9** 条（含 `'Lazy code without its check is unfinished'`）；findings/01:131,181、REPORT:13,44,142 | FAIL(中) |
| V33 | REPORT §4 "四源共有的骨架只有 6 条" | 对读 REPORT §4 表 8 行与各行互证来源 | 表 8 行；仅 #2、#5 引满四源；§4 自注 "#1–#5 至少两源" | FAIL(中) |
| V34 | REPORT §4 内核的互证来源指向正确规则 | 打开被引行 | #6 引 `S:L23-24`＝Vite+ review checklist（跑 check/test），非"只报告实际验证过的结论"；#8 引 `K:CLAUDE.md:11-17`＝Think Before Coding，非"输出纪律" | FAIL(中) |
| V35 | REPORT §0-5 "8 处冲突全部可条件化吸收" vs 7 条 ⟨条件式⟩ | `grep -n '⟨条件式⟩' AGENTS.merged.md` | 恰 R1.4/R3.2/R3.3/R5.1/R5.3/R6.3/R9.3 共 7；C6→R8.3 未标（REPORT §6 已记两侧，非静默） | FAIL(低) |
| V36 | REPORT §10 "findings/03（364 行）" | `wc -l findings/03-deepseek-harness.md` → 363 | REPORT:178 | FAIL(低) |
| V37 | 四源规则条数与 findings 一致：P=48、K=41 条/33 ID、H A=74、S=28（V8+P20） | 见 V01/V13/V19 与 `grep -cE '^\| (V\|P)[0-9]+ \|'` | 48 / 41 / 74 / 28 全部一致 | PASS |
| V38 | **融合件 49 条逐条可追溯到 ≥1 源** | TAG：全量解析 49 条规则的标签并校验路径/行号存在 | 49/49 通过，0 无源、0 路径缺失（明细见 §2） | PASS |
| V39 | 附录未混入"四源之外的新规则" | 通读附录 A/B/C；附录 B 自标"非源规则" | `AGENTS.merged.md:108` 显式声明；A.3/A.5 均带 S/H 出处 | PASS |
| V40 | 7 条 ⟨条件式⟩ 与 REPORT §6 裁决映射一致 | 逐条对读 §6 的 C1–C8 与 R 编号 | C1→R5.1、C2→R6.3、C3→R1.4、C4→R3.3、C5→R3.2、C7→R5.3、C8→R9.3 | PASS |
| V41 | R3.5 / 附录 C 的 `[H:scripts/verify-*.ts …]` 是否精确可回溯 | 通配符族级引用；`sed -n '149,186p' package.json` | 区间内 15 对 `gen-*/verify-*`（清单见 §2.3），族级可核，非精确 path:line | UNVERIFIED |

### 1b 覆盖缺口（核验项 4：某源是否被系统性弱化）

| 源 | 未进入融合件的重要规则（抽） | 是否可接受 | 判定 |
|---|---|---|---|
| **P** | R03/R04 三档模式与关闭开关、R05 "仅编码任务"适用范围、R38 gain 禁打印每仓库节省数字、R42–R47 hook/OpenClaw 实现细节 | 大多合理（宿主/品牌专属）；R05、R38 属通用且未记录取舍理由 | 轻微弱化（低） |
| **P** | 护栏清单（R30–R33）、review/audit 只列不改（R35/R36）、债务闭环（R22/R37） | **已被 R9.4/R8.4/R8.1 完整吸收**——"P 护栏被弱化"的假设不成立 | PASS |
| **H** | A16/A17/A18/A19/A20/A21/A24（架构不变量）、A26/A29（strict/branded id）、A49/A52/A53/A54/A56/A57（测试细则）、A62、A65–A69、A72–A74 | 多为 H 产品/基础设施专属；但 A18（Model-visible⟺logged）、A52（HMR 安全测试）、A57（完整值限额）、A74（UI 文案归 locale）通用且廉价，REPORT §3 把它们列为"独有贡献"却未在 §9 记录为何不并入 | 中等缺口（中低） |
| **S** | V1/V2/V4（Vite+ 专属）合理丢弃；P8 的泛化形式（新文件落入约定目录）缺席 | 可接受 | 轻微（低） |
| **K** | K20 档位开关、K31/K32 收尾判据 | 合理（交互/品牌专属；K31 的"弱标准需澄清"已并入 R1.6） | 可接受 |

## 2 融合件逐条可回溯性（核验项 3）

- **全量结果**：49 条规则（R0.1–R9.5）全部带 ≥1 个 `[P|K|H|S:path:line]` 标签，且每个标签的路径与起始行号在对应仓库/工作树中存在（TAG 脚本，0 issue）。标签分布：H 42、P 23、K 15、S 11（共 91 个引用点）。
- **FAIL/UNVERIFIED 清单**：无 FAIL 条款；仅 R3.5 的 H 标签与附录 C 两处为**族级通配**（`scripts/verify-*.ts（package.json:149-186）`），已核该区间确有 15 对生成器 `--check`（`verify-tsconfig-paths`/`verify-cordis-catalog`/`verify-cordis-api`/`verify-cordis-inspect-catalog`/`verify-client-catalog`/`verify-workflow-guest`/`verify-tool-catalog`/`verify-config-catalog`/`verify-plugin-packages`/`verify-dependency-catalog`/`verify-doc-graphs`/`verify-persistence-catalog`/`verify-session-format-catalog`/`verify-scoped-events`/`verify-module-graph`），故标注为 UNVERIFIED 而非 FAIL。
- **抽样明细（≥10 条，种子 20260927，每源 8 条抽自 `REPORT.md`+`AGENTS.merged.md`+findings 的引用池，全部命中）**：
  1. `R2.5` ← `P:AGENTS.md:27` = "Pick the edge-case-correct option when two stdlib approaches are the same size…" ✔
  2. `R7.1` ← `P:skills/ponytail/SKILL.md:68-75` = "Code first. Then at most three short lines…" ✔
  3. `R2.1` ← `P:skills/ponytail/SKILL.md:34-42`（7 级详版）✔；`R1.6` ← `K:CLAUDE.md:88-100`（Transform tasks into verifiable goals）✔
  4. `R3.2` ← `K:CLAUDE.md:74` = "The test: Every changed line should trace directly to the user's request." ✔
  5. `R1.2` ← `K:CLAUDE.md:14-15` = "State your assumptions explicitly…present them - don't pick silently." ✔
  6. `R3.3` ← `K:CLAUDE.md:71-72` = "Remove imports/variables/functions that YOUR changes made unused." + "Don't remove pre-existing dead code unless asked." ✔
  7. `R6.4` ← `H:.agents/skills/dsh-pre-push-checks/SKILL.md:98,105,126` ✔
  8. `R0.1` ← `H:packages/AGENTS.md:14` = "Enforce a decision in the operation that makes it…" ✔
  9. `R4.4` ← `H:AGENTS.md:134` = "Switch on discriminant tags…" ✔
  10. `R6.2` ← `H:docs/testing.md:35,40`（"assert untouched files are byte-identical" / "a guard only guards if the regression fails it"）✔
  11. `R5.4` ← `S:AGENTS.md:45`（官方最新文档核对 API）✔；`R5.3` ← `S:AGENTS.md:46` ✔
  12. `R4.1` ← `S:AGENTS.md:69`（相信类型）✔；`R4.3` ← `S:AGENTS.md:71-72` ✔
- **统计一致性**：findings/01 声明 48 条、findings/02 声明 41 条/33 ID、findings/03 声明 74 条、findings/04 声明 28 条（V8+P20），与文件实际逐条计数**全部一致**（V37）。REPORT 中"49 条/9 组/35 条/8 条"四类统计仅 49 属实（V31/V32）。

## 3 必须修正项清单（按严重度）

1. **[高] REPORT.md:11、102、175**："9 组 35 条"/"按 9 组组织" → 实际 `AGENTS.merged.md` 为 **§0–§9 共 10 节、49 条编号规则**。附带 §5 表格本身有 10 行，与表头"9 组"自相矛盾。该错误会让读者误判规则集规模与覆盖率。
2. **[中] "8 条护栏不变量" → 9 条**：findings/01:131,181、REPORT:13,44,142 均写 8；实测 `check-rule-copies.js:44-58` 的 `INVARIANTS` 数组 9 项，且脚本运行时会打印 "…9 rule invariants present…"。
3. **[中] REPORT §4 内核互证来源错配**：#6 以 `S:L23-24` 证明"只报告实际验证过的结论"（该处只说跑 check/test 与查验证入口）；#8 以 `K:CLAUDE.md:11-17` 证明"输出纪律"（该处是 Think Before Coding）。应改引 `H:AGENTS.md:110,114`+`dsh-pre-push-checks`（#6）与 `P:SKILL.md:68-75`+`H:AGENTS.md:149,172`（#8）。
4. **[中] REPORT §4 "#0-4 四源共有的骨架只有 6 条"** 与本节 8 行表、及"仅 2 行引满四源"矛盾 → 改为"§4 表列 8 条，其中 #1–#5 至少两源同向"。
5. **[中低] H 载体统计**：`findings/03:15-16,295` 与 REPORT §1 的"15 个 SKILL.md"应为 **14 个 SKILL.md（15 个技能目录，`ask-matt/` 无 SKILL.md）**；"267 个脚本"不可复现（实测 333 个 tracked 文件 / 274 个一层文件 / 271 个 `.ts`），须改口径或删数。
6. **[低] findings/04:22,85**：`package.json:9` → **`:10`**；`:85` 的函数名 `updateAgentInstructions` → **`updateExistingAgentInstructions`**（`agent.ts:231`，无同名函数）。
7. **[低] findings/01:131**：R40 引文 `check-rule-copies.js` 行区间 `71-74` → 该句实为 **`:76`**。
8. **[低] findings/02:46**：Claude 行号枚举有误——多列 53,54（无 Claude），漏 40/43/45/46（`CLAUDE.md` 文件名）。结论（规则正文零 Claude）不受影响。
9. **[低] findings/03:201（A59 引用块）**：删除了 `](../skills/dsh-archive-agent-notes/SKILL.md)` 链接目标却未按自定约定标 `…`，非逐字。
10. **[低] REPORT:178**：findings/03"364 行" → 实测 **363 行**；REPORT §6 有 8 处冲突但仅 7 条 ⟨条件式⟩，建议在 R8.3 加标记或注明 C6 按单侧表述。
11. **[中低，非错但需声明] 覆盖缺口**：A18/A52/A57/A74 等通用且被 REPORT §3 称为 H"独有贡献"的规则未进入融合件，REPORT §9 未记录取舍理由；建议补一行"未并入清单+理由"。

## 4 无法核验项与原因

- **R3.5/附录 C 的族级通配引用**（V41）：`scripts/verify-*.ts` 无法落到唯一 `path:line`；已退化为核验 `package.json:149-186` 的 15 对 gen/verify 是否真实存在（存在），故不能判定精确可回溯。
- **H 各 gate 在当前树上的红/绿**：本次核验同样未运行 `pnpm`/`tsx`/gate（只读约束 + 避免污染 H 工作树），仅验证名称、注册位置与聚合语义；findings/03 U1 的免责声明成立。
- **S 的"能否通过 check/test"**：未执行任何 `vp` 命令（与 findings/04 相同的只读约束），`src` 下亦无测试文件；该结论维持"无法验证"。
- **K 的 skill 按需触发与 Claude Code 自动加载**：仓库内无机制证明（无 manifest/hook），仅有 README 单方断言与 `description` 触发语；未做加载实验。
- **REPORT §1 "P/K 克隆后 `git status` 干净、HEAD 未变"**：本次实测两 clone HEAD 与 REPORT 快照 sha 一致、`git status --short` 为空（H 亦 0 行），但"分析期间未改动"只能由当前状态旁证，无法回溯历史。

## 5 抽样方法（核验项 1/5 的方法学说明）

- **全量优先于抽样**：对 findings/01–04、REPORT.md、AGENTS.merged.md 中的**全部** 91 个引用点（P 23/K 15/H 42/S 11）先做 `TAG` 路径/行号存在性校验，再做 `CA` 逐字包含性审计（归一化空白、全半角引号、`\"` 转义；`…` 处按片段分别判定），覆盖率 100%，远高于任务要求的"每源 ≥6 条、共 ≥24 条"。
- **独立随机抽样**：以 `random.seed(20260927)` 从四个引用池各抽 8 条（共 32 条，见 §2）人工打开原文复核；样例由脚本随机产生，未采用分析者示例。
- **对抗性定向抽查**（不以抽样为限）：所有"独有/冲突/官方强制机制/统计计数"类断言逐条反证，包括 P hook 的无阻断（`grep -rn -e 'exit(2)' -e deny -e permissionDecision hooks/ scripts/` → 0 命中，hook 内仅 `process.exit(0)`）、H gate 名与 `run-gates.ts:121-123`、S 的 md5 与 `agent.ts`、K 的字节日志与 mdc 删减、以及四源全部计数类数字的复算。
- **复现约定**：所有命令为只读（`grep`/`sed`/`wc`/`sha256sum`/`md5sum`/`diff`/`git ls-files|grep|rev-parse`/`python3` 只读脚本）；未修改 `REPORT.md`、`AGENTS.merged.md`、findings/01–04 及任何源仓库文件。

## 6 增量复核（第二轮，Lead 更正后）

**范围与方法**：复核 REPORT.md（215 行）、findings/01–04（319/238/368/141 行）、AGENTS.merged.md；对 Lead 声明的 15 项更正逐条对照，重跑 TAG 全量审计，`sha256sum` 与第一轮对比，并扫描"活文本"（排除 §9.1/文末 errata 段）的残留错误声明。第一轮 `AGENTS.merged.md` sha256 = `f851e539a56aba622e88ce9e90b810f438ffc60f215b45ffa39822447a7c4ace`。

| # | 声明更正 | 核验方法（证据） | 结论 |
|---|---|---|---|
| D01 | REPORT ① 3 处"9 组 35 条"→"§0–§9 共 10 节 49 条" | `grep -n '35 条\|9 组' REPORT.md` → 仅 §9.1 errata；REPORT:11,102,198 | PASS |
| D02 | REPORT ② 3 处"8 条护栏不变量"→"9 条不变量 canary" | REPORT:13,44,144；`check-rule-copies.js:44-58` 实测 9 元素 | PASS |
| D03 | REPORT ③ §4 #6 改 H 单源 + 注明 S 只要求"执行验证入口" | REPORT:92 vs `H:AGENTS.md:110,114`、`dsh-pre-push-checks:98,105,126`（均支持"失败即停/pending 报 pending/只报实际命令"） | PASS（微瑕：新增的 `:117` 讲"不重复已通过检查"，与本条"只报告验证过的结论"关联弱，建议删） |
| D04 | REPORT ④ §4 #8 改"沟通与呈现纪律"+ K 来源对齐 | REPORT:94；`K:CLAUDE.md:11-17` 确为"不臆断/不藏困惑/呈现权衡与多解" | PASS |
| D05 | REPORT ⑤ §0 #4 改"至少两源互证"并逐条标源数 | REPORT:14 vs §4 表（#2/#5 四源、#1/#3/#4 二至三源、#6 H 单源、#7/#8 三源） | **FAIL(残)**：标题仍称"至少两源互证的内核有 6 条（#1–#6）"，而 #6 自述 H 单源、三源的 #7/#8 被移出计数 → 与同段后文及 REPORT:96 注（"#1–#5 至少两源"）矛盾 |
| D06 | REPORT ⑥ H 载体统计 15→14 SKILL.md、267→254 TS | REPORT:26；`find scripts -maxdepth 1 -name '*.ts'`=254；`.agents/skills` SKILL.md=14 | PASS（建议补"一层"限定：全深度 `.ts`=271） |
| D07 | REPORT ⑦ §6 补条件式映射核对（C6 未标原因） | REPORT:134 vs `grep -n '⟨条件式⟩' AGENTS.merged.md`（恰 7 条 R1.4/R3.2/R3.3/R5.1/R5.3/R6.3/R9.3）；C6 理由与 R8.3 纯 H 文本一致 | PASS（第一轮 V35 关闭） |
| D08 | REPORT ⑧ §9.1（核验记录）与 §9.2（未并入取舍）新增 | REPORT:172-191 | **FAIL(残)**：§9.2 两处"A.3 已提示"不实——`AGENTS.merged.md:102`（A.3 前端项目）无 A74/locale 字样、亦无 S:51-60/P8 分层；且 A57 在 REPORT:188、189 两行重复列出 |
| D09 | REPORT ⑨ §10 findings 行数 319/238/368/141/119 | `wc -l` 逐项一致 | PASS |
| D10 | f01 四处"8 条不变量"→9 条 | f01:131(R40)、181(§3.2)、216(§4.1)、233(§4.3) 均写"9 条" | **FAIL(残)**：§3.2（:181）括号内仍只枚举 8 项，缺 `Lazy code without its check is unfinished`（读者无法据文复现"9"） |
| D11 | f01 R40 引文 `:71-74`→`:76` | f01:319；`.refs/ponytail/scripts/check-rule-copies.js:76` 逐字命中 | PASS |
| D12 | f02 §0.5 Claude 枚举更正 | f02:46 = `:3,29,31,49,51`（"Claude Code"行文）+`:40,43,45,46`（文件名），并注明 `:53,54` 不含；与 `grep -in` 实测一致 | PASS |
| D13 | f03 规模行 / 14 SKILL.md / A59 链接补回 | f03:15（下一层 274 文件含 254 `.ts`）、:16 与 :295（14 SKILL.md / 15 目录）、:201 已补 `](../skills/dsh-archive-agent-notes/SKILL.md)` | PASS |
| D14 | f04 `package.json:9`→`:10`、函数名更正 | f04:22,85 均为 `:10`；:19,85 为 `updateExistingAgentInstructions`（`agent.ts:231`） | PASS |
| D15 | merged 仅 R3.5 的 H 引用改为通配标签 | `sha256sum AGENTS.merged.md` 仍 `f851e539…`（与第一轮逐字节相同）；R3.5 当前即 `[H:scripts/verify-*.ts …（package.json:149-186）]`；全仓无指向 R3.5 的 `H:AGENTS.md:146` | UNVERIFIED（无 delta：该状态第一轮已存在，无法观测为第二轮新改动；当前内容=声明的目标态） |
| D16 | 活文本无残留错误声明（errata 段除外） | `awk` 排除 REPORT §9 后 grep `35 条\|8 条不变量\|267 个\|15 个 SKILL` → 0 命中 | PASS |
| D17 | S 触发点引用（附带项） | REPORT:65 仍写 `package.json:9 "prepare": "vp config"`（实测 `:10`） | **FAIL(残)** |
| D18 | merged 完整性重跑（49 条 / 可回溯） | TAG 全量：49 条、49/49 带可解析标签、0 issue；正文标签 H33/P22/K15/S10 + 附录 9 = 第一轮 91 | PASS |

**结论（更正后版本判定）**
- 15 项声明更正：**PASS 11 / FAIL(残) 3（D05、D08、D10）/ UNVERIFIED 1（D15）**；附加扫描 3 项：PASS 2 / FAIL(残) 1（D17）。
- `findings/01–04` 更正后版本：**通过**（唯一残项：f01:181 枚举 8 项 vs 声称 9 条）。
- `REPORT.md` 更正后版本：**有条件通过**（残项 D05 计数矛盾、D08 两处 A.3 不实 + A57 重复、D17 `package.json:9`）。
- `AGENTS.merged.md`：**通过**（49 条、49/49 可回溯、0 issue；hash 与第一轮相同 ⇒ 除声明项外无其他改动）。
- **仍有必须修正项 4 条**：① REPORT:14 的"有 6 条（#1–#6）"改为"§4 表 8 条中 #1–#5、#7、#8 至少两源互证；#6 为 H 单源"；② REPORT:65 `package.json:9`→`:10`；③ REPORT:188/190 删去"A.3 已提示"表述（A.3 无 A74/P8），并把 A57 从其中一行删除；④ findings/01:181 补第 9 项 `Lazy code without its check is unfinished`。
- 低优先建议：REPORT:92 删 `:117`；REPORT:26 补"一层"限定；REPORT:180"未修正项"措辞易误读，建议改为"findings 级未就地修正项"。
- 总评：两轮更正后统计与引用层已基本对齐，且未引入新的引用错误；上述 4 条残项属文本一致性级别，不影响 `AGENTS.merged.md` 的可用性。

## 7 最终确认（第三轮）

| # | 核验点 | 证据（命令/实测） | 结论 |
|---|---|---|---|
| F1 | §0 #4 新表述与 §4 表/表下注/§2 无矛盾 | REPORT:14 = "§4 表的 8 条内核中，#1–#5、#7、#8 至少两源互证（#2/#5 四源；#1/#3/#4 二至三源；#7/#8 三源）；#6 为 H 单源"；§4 表 8 行实测源数 3/4/2/2/4/1/3/3，逐条吻合；:96 注（"#7、#8 …三源；#1–#5 至少两源"）一致；全文源数断言仅 :14/:92/:96，无第四条异文 | PASS |
| F2 | §2.4 `package.json:9`→`:10`，无残留 | REPORT:65 = `package.json:10 "prepare": "vp config"`；REPORT 内 `package.json:9` 仅存于 :179 的 errata 记述（更正记录，非活断言） | PASS |
| F3 | §9.2 删除两处"A.3 已提示"、A57 去重、与 merged A.3 一致 | REPORT 内 `附录 A.3` 仅 :182 errata 记述；§9.2（:189–191）不再声称 A.3 覆盖；`A57` 在 §9.2 仅 1 处（:190）；`AGENTS.merged.md:102`（A.3）实际只含 S:39,40 / S:62 / S:55,64,65 / S:63 / S:11,23-24,76-78，不含 A74 或 P8 | PASS（低sev微残：:191 称 P8 泛化形式"仅作为'独有贡献'记录在 §3"，但 §3 的 S 行（REPORT:79）未列 P8 分层） |
| F4 | findings/01 §3.2 枚举 9 项且与源码一致 | `findings/01:181` 括号内 9 个短语 vs `.refs/ponytail/scripts/check-rule-copies.js:44-58` 的 `INVARIANTS` 9 元素：集合完全相同（含 `Lazy code without its check is unfinished`） | PASS |
| F5 | §4 #6 去掉 `:117` 后剩余来源仍支撑 | REPORT:92 = `AGENTS.md:110,114` + `dsh-pre-push-checks:98,105,126`；`:110` 禁绕过测试/沙箱、`:114` "report only commands run"、skill `:98` 失败即停且不"推了指望 CI"、`:105` 绕钩子需显式同意并如实报告、`:126` pending 报 pending → 逐条支撑"失败即停/pending 报 pending/附阻塞证据" | PASS |
| F6 | §1 H 行"一层"限定与实测口径 | REPORT:26 = "`scripts/` 一层 254 个 TypeScript 脚本（含 68 个 `verify-*`）"；实测 `find scripts -maxdepth 1 -name '*.ts'`=254、`verify-*`=68（全深度 `.ts`=271，已由"一层"排除歧义） | PASS |
| F7 | §9"未修正项"→"计数口径说明"，措辞自洽 | REPORT:180 为"**计数口径说明**：H 的'267 个脚本'不可复现，本文与 findings/03 均已改为实测口径（`scripts/` 一层 274 文件 / 其中 254 个 `.ts`）；四源其余计数（P=48、K=41、H A=74、S=28）经核验成立，未改。"无自相矛盾；274/254/68 与实测一致 | PASS |

**最终判定**：**7/7 PASS**（仅 1 条低severity微残：F3 中 §9.2 S 行的"§3 归属"表述——建议删除该半句或在 §3 补录 P8 分层）。`AGENTS.merged.md`（sha `f851e539…` 未变、49 条、49/49 可回溯）、`findings/01–04`、`REPORT.md` **三者均可对外引用**；该微残不构成引用障碍。

## 8 v0.2 复核（第四轮）

**基线与方法**：`AGENTS.merged.md` v0.2（124 行 / 48 条；上一轮的 v0.1 sha `f851e539…` 已被覆盖，§6/§7 的 49 条结论仅对 v0.1 有效）、`examples/*`（3 个）、`tools/tailor.mjs`(220 行)、`tailor/{README,SKILL,PROMPT}.md` + `snippets/3`、`README.md`(51)、`REPORT.md`(227)。方法：48 条全量标签/计数/产物机械审计 + 定种随机抽 12 条（seed 4041，P/K/H/S 各 3 条）语义比对 + `--dry-run` 反算 + 重复项逐对核；判据参考已加载的 `writing-for-agents`。

| # | 核验项 | 证据（命令/实测） | 结论 |
|---|---|---|---|
| V1 | **语义保真**：抽样 R1.3 R1.6 R3.2 R3.3 R5.1 R5.2 R6.3 R6.4 R6.6 R8.1 R8.3 R8.4（K 3、P 3、S 3、H 3+） | 逐条打开被引源行（`.refs/ponytail/AGENTS.md:17,24,28`、`.refs/karpathy-ponytail-skills/CLAUDE.md:16,17,71-72,74,88-100`、`H:AGENTS.md:110,114,116,117,139,174`、`H:docs/AGENTS.md:39`、`S:AGENTS.md:11,23-24,44,45,46,47,76`）比对 | **PASS**（12/12：引用均存在；无夸大、无源外新规则；3 处轻微弱化见 V1a–c） |
| V1a | R1.3 弱化了 K 的 "Ask" | `K:CLAUDE.md:17` "stop. Name what's confusing. **Ask**." → v0.2 只留"命名困惑点、说明缺什么信息" | 低（R1.2 仍保留"不确定就先问"） |
| V1b | R3.3 的来源标签与条款取向不一致 | `AGENTS.merged.md:37` 引 `[P:AGENTS.md:24]`（"Deletion over addition."），但条款只落 K 侧（既有死代码不删）；v0.1 曾用"删除优先仅适用于自造孤儿"显式限定 | 低（建议补一句限定） |
| V1c | R6.3 的"快照"无对应标签 | `AGENTS.merged.md:60` 标签 = H:116,117 + packages:7 + P:107-112；快照政策实际在 `H:AGENTS.md:155` | 低（补标签即可） |
| V2 | **系统性省略**：压缩时丢掉的源要求 | R0.3 丢 "justify the manifest diff in the PR"（`H:docs/AGENTS.md:56`）；R2.2 丢 "defensive copy"（`H:packages/AGENTS.md:11`）；R7.3 丢 "ask whether a more exact term names the subject"（`H:AGENTS.md:172`）；R9.1 丢 "never raw `--force`"（`H:AGENTS.md:159`）；R6.1 丢 "no frameworks, no fixtures"（`P:SKILL.md:107-112`） | **FAIL(低)**：多为压缩取舍，但 R9.1 丢的是硬护栏、R0.3 丢的是流程要求，建议各回补半句 |
| V2b | R3.1 的"留作建议"属轻度外推 | `K:CLAUDE.md:65-67` 只说"不要动/不要重构/匹配风格"，仅 `:68` 允许"提及"（且限于无关死代码）；v0.2 把"提及"扩到顺手重构与格式化 | 低（禁令未削弱，措辞可收敛） |
| V3 | **无悬空 R0.4** | `grep -rn 'R0\.4' REPORT.md README.md tailor tools examples AGENTS.merged.md` → 仅 `REPORT.md:200`（变更说明"R0.4（机器管理区块）与 machine-block 片段重复 → 从基座删除"）；findings/01–04 与 merged 均无 | **PASS** |
| V4 | REPORT §6 条件式映射全部仍成立 | v0.2 中 R1.4/R3.2/R3.3/R5.1/R5.3/R6.3/R9.3 各存在 1 处（`grep -c`），C6→R8.3 亦存在 | **PASS** |
| V5 | **计数一致**：merged 48；minimal 18 条/45 行；frontend 56；monorepo 53；full 48 | `node tools/tailor.mjs --dry-run` 四种配置 = 48/18/56/53；`grep -c '^- \*\*R' examples/*` = 18(45 行)/56/53；`tools/tailor.mjs:85` 硬断言 48 | **PASS** |
| V6 | README.md 与 tailor/README.md 数字 | `README.md:9` "§0–§9 共 48 条"、`:12` "18/56/53"；`tailor/README.md:45-47` 同为 18/56/53，`:35` 记录 `--with-decisions`（默认关闭） | **PASS** |
| V7 | **minimal 档是否覆盖"不可裁"约束** | A.1（`:91`）与 `PROFILES.minimal` 的 18 条一致；但 minimal 保留阶梯 R2.1 与边界 R4.1/R4.2，**缺 R9.4（安全红线不受最小化影响，`:84`）**——即"最小化不得裁掉安全/无障碍/硬件校准/用户明确要求"的唯一对冲条款；另缺 R2.5、R3.4（成本低） | **FAIL(中低)**：建议 minimal 加入 R9.4（18→19） |
| V8 | **full 档残留重复（base↔snippet）** | ① frontend R10.4 与 R2.4（S:63 页面组件/不预建层）；② R10.3 与 R3.5（生成物禁手改、排除 fmt-lint、入库策略）；③ R10.5 与 R6.6（验证入口/先确认真实来源）；④ R10.6 与 R5.4（官方最新文档/废弃迁移；其"成熟度尽调"与 R5.1 的 S:44 同源）；⑤ monorepo R10.5 与 R8.2（决策记录）重复，并与 R0.3"一个事实只有一个 home"同句。生成的 `examples/AGENTS.frontend.md` 同含两成员（R2.4=1 且 R10.4=1、R3.5=1 且 R10.3=1、R5.4=1 且 R10.6=1、R6.6=1 且 R10.5=1），monorepo 示例同 | **FAIL(中低)**：frontend 片段 6 条中 4 条重复；建议合并（保留更具体措辞）或删除重复条 |
| V9 | **生成物自检** | 0 残留标签（`grep '\[P:\|\[K:\|\[H:\|\[S:\|\[findings/\|\[vite-plus:' examples/*.md` 空）；编号唯一（`uniq -d` 全空）；恰一个结尾换行（末字节 `0a`、倒数第二字节非 `0a`）；机器区块规则只在 machine-block 片段（frontend 示例 §11 R11.1/R11.2，minimal/monorepo 无；base 仅 `AGENTS.merged.md:97` A.4 指针） | **PASS** |
| V10 | REPORT 的 v0.2 表述与统计 | `REPORT.md:196` §9.3 存在、`:102`/`:212` 均为"48 条"；"49 条"仅出现在 `:11/:174/:178/:180/:184` 的 v0.1 历史与变更语境 | PASS（`:203`"minimal 从 36 条/78 行降到 18/45"的旧值无 v0.1 产物留存 → 低 UNVERIFIED） |
| V11 | **⟨条件式⟩ 标记与 A.5 清单一致** | 正文标记 6 处（R1.4、R3.2、R5.1、R5.3、R6.3、R9.3），但 `AGENTS.merged.md:99`（A.5）列 7 条含 **R3.3**，而 `:37` 的 R3.3 无该标记（v0.1 曾有） | **FAIL(低-中)**：二者取一并同步 REPORT §6 |

**必须修正 3 条**：① V11 —— R3.3 的标记/清单不一致（补标记或从 A.5 删除）；② V7 —— minimal 补 R9.4（缺一即失去对最小化的唯一对冲）；③ V8 —— 合并 frontend/monorepo 片段与基座的 6 组重复（影响上下文负载，非正确性）。
**低优先**：V2 回补 R9.1 "不用裸 `--force`" 与 R0.3 "PR 论证"半句；V1b/V1c 补标签或限定；V2b 收敛 R3.1"留作建议"措辞；V10 的 v0.1 旧值属历史陈述，可不处理。
**最终判定**：v0.2 的 48 条**语义保真、引用可回溯、产物自检通过 → 可对外引用**；建议先修 V11（清单一致性）与 V7（minimal 缺安全红线），V8 的重复项属上下文负载优化。

## 9 收尾确认（第五轮）

**基线**：Lead 称"v0.2.1"（`AGENTS.merged.md:1` 标题仍为 v0.2）；本轮只核验其声明的 7 项修复及其连带面。

| # | 核验点 | 证据（命令/实测） | 结论 |
|---|---|---|---|
| W1 | R3.3 恢复 ⟨条件式⟩，正文 7 处 = A.5 的 7 条清单 | `grep -n '⟨条件式⟩' AGENTS.merged.md` → R1.4/R3.2/R3.3/R5.1/R5.3/R6.3/R9.3（+ `:4` 说明行，共 8 处）；`:99` A.5 列出同 7 个 ID | PASS |
| W2 | minimal 加 R9.4（18→19） | `examples/AGENTS.minimal.md` 实测 19 条/46 行，含 `:45` R9.4；`AGENTS.merged.md:91` A.1 列 19 条（…R9.4 R9.5）；`tools/tailor.mjs:126` `['9', ['R9.4','R9.5']]` | PASS |
| W3 | base↔snippet 去重 | `tailor/snippets/frontend.md` 2 条（R10.1/R10.2）、`monorepo.md` 4 条（R10.1–R10.4）、`machine-block.md` 2 条；A.2（`:93`）"规则预算见 R0.3、决策记录见 R8.2"、A.3（`:95`）"生成物、目录就近、验证入口、官方文档分别由 R3.5、R2.4、R6.6、R5.4 覆盖"，A.3 出处收窄为 `[S:AGENTS.md:39,40,62]`（与片段一致）。残留 1 处：monorepo R10.3 首句"行为改动在同一提交内更新包 README 与 JSDoc"与 base R8.3 重叠（其 Model Experience / Known Limitations 部分为新增） | PASS（1 处低残，可选优化） |
| W4 | 恢复压缩时丢掉的源要求（6 项） | R9.1 "不用裸 `--force`"（源 `H:AGENTS.md:159` "never raw `--force`"）；R0.3 "抬高要在变更说明里论证"（`H:docs/AGENTS.md:56`）；R2.2 "防御性拷贝"（`H:packages/AGENTS.md:11`）；R7.3 "用精确名词"（`H:AGENTS.md:172`）；R6.1 "不要框架与 fixture"（`P:SKILL.md:107-112`）；R6.3 增 `[H:AGENTS.md:155]`（keyless 快照政策）——逐条 grep 命中且与源文一致 | PASS |
| W5 | R3.1 去掉"留作建议" | `:35` 现为"顺手重构、无关格式化不做，需要时在交付说明里提一句"；"留作建议"已消失 | PASS（"提一句"仍是对 `K:CLAUDE.md:65-67` 的轻度外推，可接受） |
| W6 | 计数同步 | `--dry-run` 四配置 = 48/19/52/52；`examples/*` 实测 19/52/52；`README.md:12` 19/52/52、`:9` 48；`tailor/README.md:46-48` 19/52/52；`tailor/PROMPT.md:7,69` 48/19。**`REPORT.md:203` 仍写"minimal 从 36 条/78 行降到 18 条/45 行"**（实测 19 条/46 行；其 `:206` 又写"18→19 条"，自相矛盾） | **FAIL(低)**：唯一残留，须改 `REPORT.md:203` |
| W7 | tailor.mjs minimal 含 R9.4 | 见 W2（`:126`）；dry-run minimal = 19 | PASS |
| W8 | examples 卫生 + 无悬空编号 | 三个 examples：0 残留标签（`grep '\[P:\|\[K:\|\[H:\|\[S:\|\[findings/\|\[vite-plus:'` 空）、`uniq -d` 无重复编号、末字节 `0a`；frontend 含 §10+§11、monorepo 含 §10、minimal 无片段节；非片段文件 `grep -rn 'R10\.'` → 仅片段自身定义，无悬空引用 | PASS |
| W9 | 去重连带的两处孤儿源点 | `S:AGENTS.md:25`（异常时跑 `vp env doctor` 并附输出）与 `H:docs/AGENTS.md:21-22`（根文件只放常设指令）在 base 与片段中均不再出现（`grep -c 'env doctor'`=0、`'常设指令'`=0、`'docs/AGENTS.md:21'`=0；二者原仅在已删的 frontend/monorepo R10.5 中） | 低（可视为有意收窄；建议并入 R6.6/R0.3 或片段留半句） |

**最终判定**：修复后的 v0.2（Lead 称 v0.2.1）**可对外引用** —— 7 项检查全部 PASS，证据链完整；仅 `REPORT.md:203` 的"18 条/45 行"须改为"19 条/46 行"（唯一实质残项）。W3 的 monorepo R10.3 首句重叠、W9 的两处孤儿源点、`AGENTS.merged.md:1` 未标 v0.2.1 均属可选优化，不构成引用障碍。

## 10 微确认（第六轮）

| # | 核验点 | 证据（grep/读原文） | 结论 |
|---|---|---|---|
| X1 | REPORT 数字已一致 | `REPORT.md:203` = "…降到 **19 条/46 行**"；全仓 `18 条/45 行` 仅命中 `:207` 的修复记录句（"18 条/45 行 → 已改为 19 条/46 行"，属变更说明，非活断言） | PASS |
| X2 | monorepo R10.3 与 base 无重复，片段仍 4 条 | `tailor/snippets/monorepo.md:5` 现为"子包 README 记录可消费信息。包 README 记录 model/token/KV-cache 影响；持久的 consumer 缺口…`## Known Limitations and Deferred Work`"，已无与 base `AGENTS.merged.md:76`（R8.3"同一次改动内同步…更新 README 与注释契约"）同义的"同提交更新"句；片段 R10.1–R10.4 = 4 条；`examples/AGENTS.monorepo.md` 52 条且 `:87` 已同步重生成 | PASS |
| X3 | A.2 新增句的出处真实 | `AGENTS.merged.md:93` 新增"根文件只放每会话都需的常设指令，细节下沉到子树 `AGENTS.md` 并按需链接 `[H:docs/AGENTS.md:21-22]`"；源 `H:docs/AGENTS.md:21-22` 确为 tier 表（Root = "Standing orders: rules an agent needs in context in every session…"；Subtree = "Orders specific to that subtree"），逐字可对应 | PASS |
| X4 | examples/工具计数与卫生 | `--dry-run` = 48/19/52/52；examples 实测 19/52/52 条、0 残留标签、编号无重复、末字节 `0a` | PASS |
| X5 | S:25 处置（附带） | `REPORT.md:207` 记录"未采纳：`S:25`（`vp env doctor`）属 Vite+ 注入区块，按 A.4 不进入通用条款"；`AGENTS.merged.md` 内无 `S:25`/`env doctor` 字样 —— 说明落在 REPORT 的取舍记录而非 A.2（与 Lead 描述位置不同，实质结论一致） | PASS（位置差异，低） |

**最终判定**：规则源（v0.2 48 条 + 3 片段）、工具（dry-run 48/19/52/52）、示例（19/52/52，卫生全过）、文档（README / tailor README / PROMPT / REPORT 数字一致）**整仓均可对外引用**；第六轮 3 项修复全部到位，无新增残项。

## 11 重构复核（第七轮）

**基线**：`ce8ef7c`（v0.2 48 条 merged）；新结构 = `rules/base.md` 33 条 + `frontend.md` 3 条 + `monorepo.md` 6 条 = 42 条；`git status` = 预期（`D` merged/examples×3/tailor×6/tools；`M` README/REPORT；`??` rules/）。注：本节追加后全文 241 行，接近最初 ≤250 行上限，后续如需再加建议先归档历史轮次。

| # | 核验项 | 证据 | 结论 |
|---|---|---|---|
| Y1 | 无框架/依赖/工具名 | `grep -o '[A-Za-z][A-Za-z0-9._+-]*' rules/*.md` 全部拉丁 token 仅 9 个：`base.md`/`frontend.md`/`monorepo.md`（交叉引用）、`base`、`README`、`YAGNI`、`API`；自拟 60+ 词表（Vite/vite-plus/TanStack/antd/React/Vue/TypeScript/JS/node/pnpm/npm/yarn/git/GitHub/CI/eslint/vitest/pytest/docker/Cordis/deepseek/JSON/tsconfig/JSDoc/sqlite…）零命中；工具词测试仅剩"技术栈/格式化/多语言（自然语言）" | PASS |
| Y2 | 语义保真（42↔48 全量映射 + 抽 14 条比对 `git show ce8ef7c:AGENTS.merged.md`） | 泛化正确样例：`base:15`←R2.1 阶梯；`base:29`←R4.1/R4.2（parser/config…wire → "外部输入、持久化、进程与网络、外部工具"）；`base:30`←R4.3（`as` → 强制转换/断言）；`base:23`←R5.4；`base:38`←R6.1（去"框架/fixture"合理）；`frontend:5-7`←R10.1/R10.2/R2.4；`monorepo:5-9`←R10.1–R10.4 + `docs/AGENTS.md:21-22` | PASS（含下列弱化） |
| Y2a | **关键缺口（中低）** | ① **R6.3 整条缺失**（"测试重量级"0 命中）→ 建议补"检查重量级与项目现有自动化匹配：有流水线的把穷尽覆盖交给流水线，本地只跑与改动面匹配的最窄检查"；② **R6.4 升级协议缺失**（"最窄权限"/"产品沙箱"0 命中，仅剩"阻塞说阻塞、不绕过测试"）→ 建议补"被阻塞时不改命令重试一次、申请最小权限并附证据，不绕过检查"；③ **R0.1 整条缺失**（"决策即执行"/enforcement 0 命中）——删除可接受（属规则编写者元规则），但应记入 REPORT 取舍 | **FAIL(中低)** |
| Y2b | 次要弱化（低） | R1.4 丢"需求自相矛盾"、R1.5 丢"推回/先交付够用版本"（均 0 命中）；R9.3 丢"预稳定期 consumer 更新/持久化类型致谢"；R9.4 丢"硬件校准"（0 命中）；R9.2 整条缺失；R5.2 仅概念覆盖；R1.3 折入 `base:8`；R0.2"写成脚本"与 R0.3"预算处置顺序"未进 README（"脚本/预算"0 命中）——与 Lead"已移入 README 维护"的说法不符，README 只保留了"可判定性"要求 | FAIL(低) |
| Y2c | 新增要求 | `monorepo:10`"改写共享历史前先确认影响范围与**回滚方式**"——v0.2 R9.1 无"回滚"要求 | 低 |
| Y3 | 三文件间无重复 | 42 条两两 token-jaccard > 0.28 → **0 对命中**；仅两处概念邻接（`base:50` 一事实一处 ↔ `monorepo:9` 根文件只放常设指令＝去重 vs 分层；`base:17` 一次性逻辑就近 ↔ `frontend:7` 视图组件就近＝对象不同） | PASS |
| Y4 | 删条判定（覆盖） | 同意删除：R4.4（语言专属）、R8.4（细分工作流）、R3.4（被 `base:7/18` 覆盖）、R1.3/R2.2/R2.3（部分合并，枚举有裁剪）、R9.1（`monorepo:10` 泛化承接）；**不同意/需补**：Y2a 三项 | 见 Y2a |
| Y5 | README 提示词自洽性 | 步骤 1–5 可执行；`<RULES_DIR>` 说明清楚（含示例绝对路径）；三条边界（冲突跳过／项目专属保留／机器区间不动）、自检、≤8 行汇报齐备。两处歧义（低）：① 自检"条款编号连续"——本规则集无编号，新建文件时该项无意义，建议改为"若项目已有编号则保持连续"；② 并入目标只写"AGENTS.md（没有就新建）"，未处理仅有 `CLAUDE.md` 的项目（会新建出第二份文件），建议"并入现有 agent 规则文件，AGENTS.md 优先" | PASS（2 低歧义） |
| Y6 | 一致性 | README 引用的 4 个文件、rules 交叉引用（base/frontend/monorepo）均存在；`git status` 与预期一致。**循环指针（中低）**：`README:44` → "REPORT §10 附录的克隆命令"，`REPORT:31/233` → "README「来源与保障」一节"，两处均无实际 clone 命令，且 README 无该节名（实为"来源与记录"）→ `.refs` 恢复路径不可达。**过时引用（低）**：`REPORT:158`（§8"复制 AGENTS.merged.md"）、`:216`（§10 产出物未标删除）、`:104`（现在时叙述） | **FAIL(中低)** |

**最终判定**：`rules/` 三件（33+3+6）与 README 主流程**可对外引用**（框架/依赖零泄漏、无失真、无重复、提示词可执行）；建议先修 Y6 的循环指针（唯一"路径不可达"级问题）与 Y2a 的 R6.3/R6.4 补强，Y2b/Y2c 记一笔"有意收窄"即可。

## 12 收尾微确认（第八轮）

| # | 核验点 | 证据（命令/读原文） | 结论 |
|---|---|---|---|
| Z1 | 计数 + 无框架/依赖名（含 git 标志） | `grep -c '^- '`：base **35** / frontend 3 / monorepo 6 = 44；拉丁 token 仅 9 类：`base.md`/`frontend.md`/`monorepo.md`（交叉引用）、`base`、`README`、`YAGNI`、`API`、`CI`（通用缩写，非具体 CI 工具名）；git 词表（git/commit/hash/head/PR/分支/rebase/merge/force）在 `rules/` **0 命中** | PASS |
| Z2 | 新条款与 v0.2 源语义一致、无源外新要求 | `base:41`←R6.3（有 CI 交给 CI／无 CI 最窄检查）、`base:42`←R6.4（同一条命令重试一次 + 最小授权 + 阻塞证据 + 不绕过）、`base:9`←R1.4（"需求自相矛盾"已补回）、`base:10`←R1.5（"先交付够用版本"已补回）、`base:32`←R9.4（"物理设备的校准"＝硬件校准 ✓）、`monorepo:10`←R9.1+R9.2（不重写已共享历史／改写后重新核对评审与检查状态） | PASS（3 处低残见 Z2a） |
| Z2a | 低残（措辞收窄，可接受） | ① `base:41` 丢"覆盖与快照"/"两端同一判据"；② `base:42` 丢"绕本地钩子需用户明确同意"；③ `base:10` 未显式保留"推回"；④ `monorepo:10` 的"回滚路径"在 v0.2 无直接对应（源只到"远端移动即中止"）——属为去 git 术语而作的运维泛化，建议在 REPORT 取舍记录里点一笔 | 低 |
| Z3 | 恢复命令可达、无循环 | `README.md:49-50` 两条 `git clone --depth 1` 位于「来源与记录」；`REPORT.md:31` 与 `:234` 均指向 `README.md`「来源与记录」（节名正确）→ 第七轮的循环指针已解除 | PASS |
| Z4 | 无"已删文件当现役"的表述 | `grep -n 'AGENTS\.merged\|tailor\|examples' README.md rules/*.md` → 0 命中；REPORT `:104`（"该文件已删除，见顶部结构变更说明"）、`:158`（已改为 `rules/base.md` 流程）、`:217`（"**已删除**，其内容按场景拆分进 `rules/`"）均标注；其余 `:4/:136/:180/:186/:200` 属方法说明与历史核验区 | PASS（低：`:136` 可补"（v0.2，已删除）"） |
| Z5 | 三条规则文件无重复 | 44 条两两 token-jaccard > 0.28 → **0 对** | PASS |
| Z6 | REPORT"35 条"与实际一致 | `REPORT.md:210` = `rules/base.md`（35 条）+ `frontend.md`（3）+ `monorepo.md`（6）；实测 35/3/6 吻合；同条已记录 R0.1/R1.3/R2.2/R2.3/R3.4/R4.4/R8.4/R0.2/R0.3 的处置 | PASS |
| Z7 | Y5 提示词修复 | 自检项已改为"每条规则只有一个出处、没有同义重复、文件以恰好一个换行结尾、不删改无关内容"（"条款编号连续"已删）；并入目标已补"优先写进已有 `AGENTS.md` 或 `CLAUDE.md`（都有就合并进 `AGENTS.md`），没有就新建"。低：`用法二`（`README:31`）仍只写"复制进项目的 `AGENTS.md`"，未同步该回退 | PASS（1 低） |

**最终判定**：44 条规则（35+3+6）+ README（可达的恢复命令、可执行提示词）+ 溯源（REPORT/findings）**均可对外引用**；第八轮 6 项全部到位，仅剩 3 处低残（Z2a 措辞收窄、Z4 的 `:136`、Z7 的用法二），不构成引用障碍。
**口径提示**：本文件现 **257 行**，超出最初 ≤250 行的约定（追加式复核所致）；建议把 §6–§10（历史轮次）归档另存后重编号，或把该上限更新为随轮次增长的口径。
