# 02 · Karpathy 插件（karpathy-ponytail-skills）对 Claude 的规则约束提取

分析对象：`AbdullahHameedKhan/karpathy-ponytail-skills`，本地只读克隆 `.refs/karpathy-ponytail-skills`，commit `8869387dbb285d48b2582667b0f049b8d5a04a11`（`git log --oneline` 仅 1 条：`8869387 initial commit — karpathy + ponytail merge`）。全程只读采集；`git status --porcelain` 为空，`.refs` 未被写入，无 git 写操作。

## 0 溯源

### 0.1 引用约定（为压缩表格，正文用短名；完整路径如下）

| 短名 | 完整路径（相对 `.refs/karpathy-ponytail-skills/`） |
|---|---|
| `CLAUDE.md:N` | `CLAUDE.md` |
| `AGENTS.md:N` | `AGENTS.md` |
| `SKILL.md:N` | `skills/karpathy-ponytail/SKILL.md` |
| `mdc:N` | `.cursor/rules/karpathy-ponytail.mdc` |
| `README:N` | `README.md` |

### 0.2 仓库清单：全树仅 5 个文件，无任何 plugin / marketplace manifest

`find . -path ./.git -prune -o -type f -print` 与 `git show --stat HEAD`（5 files changed, 485 insertions）结果一致：`AGENTS.md`、`CLAUDE.md`、`README.md`、`.cursor/rules/karpathy-ponytail.mdc`、`skills/karpathy-ponytail/SKILL.md`。**不存在** `.claude-plugin/marketplace.json`、`.claude-plugin/plugin.json`、`hooks/`、`commands/`（`ls -la` 与 `find -name '*.json|*.yml|*.yaml|*.toml'` 均为空）。

### 0.3 度量与哈希（`wc -l` / `wc -c` / `sha256sum` / `file`）

| 文件 | 行数 | 字节 | sha256（前 8） | 换行 | 末字节 |
|---|---|---|---|---|---|
| `CLAUDE.md` | 104 | 4967 | `d17f3934` | LF, CR=0 | `0a` |
| `AGENTS.md` | 104 | 4967 | `f809fc2c` | LF, CR=0 | `0a` |
| `SKILL.md` | 121 | 5833 | `2e314f4b` | LF, CR=0 | `0a` |
| `mdc` | 84 | 3920 | `55f0dd8d` | LF, CR=0 | `0a` |
| `README.md` | 72 | 2785 | `0affe5ec` | LF, CR=0 | `0a` |

### 0.4 diff 证据（逐文件互比，全部为本节实测输出）

1. **`diff CLAUDE.md AGENTS.md` → 仅 1 处差异，第 1 行 H1 标题**：
   `1c1 / < # CLAUDE.md / --- / > # AGENTS.md`；`cmp` 报 `differ: byte 3, line 1`。正文 `sed -n '2,$p'` 两者 sha256 同为 `f474d7bb07e840ca6a04bc80252b0d1f201a0481824882aab6b74d1b58b51c08`（103 行）。**结论：CLAUDE.md 与 AGENTS.md 正文严格字节一致，唯一差异是标题字面量。**
2. **`diff CLAUDE.md SKILL.md` → 差异只在头部**：`1c1,18`，即 `CLAUDE.md:1` 的 H1 被替换为 16 行 YAML frontmatter（855 字节）+ 空行 + H1 `# Karpathy + Ponytail`。正文 `CLAUDE.md:2-104` 与 `SKILL.md:19-121` 逐字节相同（sha256 同为 `f474d7bb…`，均 103 行）。**结论：SKILL.md 正文是 CLAUDE.md 正文的超集（0 条规则被删）。**
3. **`diff CLAUDE.md mdc` → 4 处结构性删减 + 1 处改写**（`grep -vxFf mdc CLAUDE.md` 命中 11 行）：
   - 长版 `Not lazy about:` 句（`CLAUDE.md:46`）在 `mdc:48` 被改写为短版，砍掉两处子句（两处均为 `CLAUDE.md:46` 原文的连续子串）：`"read it fully and trace the real flow before picking a rung, a small diff you don't understand is just laziness dressed up as efficiency"` 与 `"the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off)"`；
   - 删除"Intensity levels"整表 + `Switch:` 行（`CLAUDE.md:48-56`，8 行）；
   - 删除 `Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.`（`CLAUDE.md:100`）；
   - 删除结尾生效判据 `**These guidelines are working if:** …`（`CLAUDE.md:104`）。
   - 另：`mdc` 去掉了正文里的全部 `---` 分隔线（实测 `^---$` 计数：`CLAUDE.md` 6 处，行 7/19/58/76/82/102；`mdc` 仅 2 处，为 frontmatter 的定界符，行 1/5）。
4. 行数核算（`diff | grep -c '^<'` / `'^>'`）：`CLAUDE.md` 独有 28 行、`mdc` 独有 8 行（frontmatter 5 行 + 空行 1 行 + 新 H1 1 行 + 改写后的 `Not lazy about:` 1 行），故 104 − 28 + 8 = 84，与实测行数一致。

### 0.5 "Claude / Anthropic" 出现位置（`grep -rIn`，全仓库）

`Claude` 仅出现于 `README.md`（第 3、29、31、49、51 行为 "Claude Code" 字样；第 40、43、45、46 行为文件名 `CLAUDE.md`；`53`、`54` 行不含 `Claude`）与文件名 `CLAUDE.md` 自身。**三份规则正文（`CLAUDE.md`、`SKILL.md`、`mdc`）零处出现 `Claude`、`Claude Code`、`Anthropic`**；正文中唯一与模型相关的措辞是 `LLM`（`CLAUDE.md:3`、`SKILL.md:20`、`mdc:9`，三者同一句）。`allowed-tools` / `model:` / `disable-model-invocation` 在**任何文件中都不存在**。

## 1 一句话定位与插件形态

**一句话**：这份仓库并不是"给 Claude 模型定制的行为规则集"，而是把 Karpathy 对 **LLM 通用**编码失败模式的观察与 Ponytail 的懒惰阶梯合成为**同一份 103 行正文**，再用 4 个载体（Claude Code 的 `CLAUDE.md`、通用的 `AGENTS.md`、Claude Code plugin skill、Cursor 的 always-on mdc）分发；其"对 Claude 的约束力"主要来自 README 的载体断言与文件名约定，规则文本本身不含任何 Claude/Anthropic 专属指向。

**插件形态（逐字取自 README，未做推断性补全）**：
- README:3 自述："A single `CLAUDE.md` merging Andrej Karpathy's LLM coding guidelines with Ponytail's laziness ladder, for use with Claude Code and other AI coding agents."
- README:21："This repo merges both into one file."
- README:29-32 声明四载体：`CLAUDE.md`（"Drop into any project root — Claude Code loads it automatically"）、`AGENTS.md`（"Same content — for Codex, OpenCode, and agents that read `AGENTS.md`"）、`skills/karpathy-ponytail/SKILL.md`（"Claude Code plugin skill with frontmatter"）、`.cursor/rules/karpathy-ponytail.mdc`（"Cursor project rule — always-on"）。
- 安装方式（README:36-55）三选项，第 3 项为 plugin 安装，逐字命令：
  `/plugin marketplace add AbdullahHameedKhan/karpathy-ponytail-skills`（README:53）
  `/plugin install karpathy-ponytail@karpathy-ponytail`（README:54）
- **marketplace / plugin 名称证据等级**：`karpathy-ponytail` 这一名称**仅由 README:54 的命令字符串**给出（`<plugin>@<marketplace>` 位置），仓库内**没有任何 manifest 佐证**（见 0.2）。故"plugin 名 = marketplace 名 = `karpathy-ponytail`"属 README 断言，非仓库内可验证事实；插件形态是否能被 Claude Code 实际安装，本快照内**未提供**可验证材料（详见 §8-U1）。

## 2 Karpathy 点名的模型失败模式 → 对应规则

失败模式 verbatim 全部来自 README 引文（README:11、13、15）；匹配强度为我的判定（直接 / 近似 / 张力）。

| ID | 失败模式（verbatim，README 行号） | 对应规则（verbatim + 出处） | 匹配强度 |
|---|---|---|---|
| F1 | "The models make wrong assumptions on your behalf and just run along with them without checking."（README:11） | "State your assumptions explicitly. If uncertain, ask."（`CLAUDE.md:14`；`SKILL.md:31`；`mdc:18`）＋ `CLAUDE.md:11` 该行首子句 Don't assume（全行 verbatim 见 K6） | 直接 |
| F2 | "They don't manage their confusion"（README:11） | "If something is unclear, stop. Name what's confusing. Ask."（`CLAUDE.md:17`；`SKILL.md:34`；`mdc:21`）＋ `CLAUDE.md:11` 第二子句 Don't hide confusion | 直接 |
| F3 | "don't seek clarifications"（README:11） | "If uncertain, ask."（`CLAUDE.md:14`）；"Name what's confusing. Ask."（`CLAUDE.md:17`） | 直接 |
| F4 | "don't surface inconsistencies"（README:11） | 无一一对应规则；最接近者为 "If multiple interpretations exist, present them - don't pick silently."（`CLAUDE.md:15`），其对象是**多解择一**而非**不一致暴露** | 近似 / 存在缺口 |
| F5 | "don't present tradeoffs"（README:11） | `CLAUDE.md:11` 末子句 Surface tradeoffs（全行 verbatim 见 K6）＋ "If a simpler approach exists, say so."（`CLAUDE.md:16`） | 直接 |
| F6 | "don't push back when they should"（README:11） | "Push back when warranted."（`CLAUDE.md:16`）＋ "Question complex requests: \"Do you actually need X, or does Y cover it?\""（`CLAUDE.md:42`） | 直接 |
| F7 | "They really like to overcomplicate code and APIs"（README:13） | "No abstractions that weren't explicitly requested."（`CLAUDE.md:37`）＋ "No boilerplate nobody asked for."（`CLAUDE.md:39`） | 直接 |
| F8 | "bloat abstractions"（README:13） | 同 F7（`CLAUDE.md:37`）；另 "Fewest files possible."（`CLAUDE.md:40`） | 直接 |
| F9 | "don't clean up dead code"（README:13） | **反向张力**：文件规定 "If you notice unrelated dead code, mention it - don't delete it."（`CLAUDE.md:68`）与 "Don't remove pre-existing dead code unless asked."（`CLAUDE.md:72`）；仅 "Deletion over addition."（`CLAUDE.md:40`）部分回到 Karpathy 的清理诉求 | 张力（见 §6-C1） |
| F10 | "implement a bloated construction over 1000 lines when 100 would do"（README:13） | 阶梯第 6/7 级："Can this be one line? Make it one line." / "Only then: write the minimum code that works."（`CLAUDE.md:31-32`；`SKILL.md:48-49`；`mdc:33-34`） | 直接 |
| F11 | "They still sometimes change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task."（README:15） | "Don't \"improve\" adjacent code, comments, or formatting."（`CLAUDE.md:65`）＋ "Match existing style, even if you'd do it differently."（`CLAUDE.md:67`）＋ "Don't refactor things that aren't broken."（`CLAUDE.md:66`） | 直接（但被泛化，见 §6-C2） |

**覆盖结论**：Karpathy 三条引文共拆出 11 个失败模式，其中 9 个有直接对应规则、1 个（F4）近似但窄化、1 个（F9）被规则反向改写。**没有任何一条规则在文本里点名 Claude 或 Anthropic**——规则是"针对 LLM 通用失败模式"的，不是 Claude 专属（判定依据见 §8-M1）。

## 3 规则清单（顶层 ID K0–K32 共 33 个；7 级阶梯展开为 K8.1–K8.7 后，表内共 41 条可引用条目）

类别：P=前言/校准，T=Think Before Coding，S=Simplicity/Ladder，X=Surgical，B=Bug Fix，G=Goal。
强制形式：禁令（Don't/No）、强制动作（Must/祈使）、启发式（judgment）、可关闭（explicit off-switch）。
Claude 列：`[通用]`＝规则文本未点名 Claude；`[通用]†`＝文本点名 `LLM`（模型泛指）但未点名 Claude。本仓库**不存在**规则级 `[Claude-specific]`（判定依据 §8-M1）。

| ID | 一句话（中文） | verbatim（英文） | 出处 | 类别 | 强制形式 | Claude |
|---|---|---|---|---|---|---|
| K0a | 定位为减少 LLM 通用编码错误，需与项目指令合并 | "Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed." | `CLAUDE.md:3`；`SKILL.md:20`；`mdc:9` | P | 声明 | [通用]† |
| K0b | 本指南偏向谨慎而非速度，琐碎任务自行判断 | "**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment." | `CLAUDE.md:5`；`SKILL.md:22`；`mdc:11` | P | 启发式/可放宽 | [通用] |
| K1 | 显式声明假设；不确定就提问 | "State your assumptions explicitly. If uncertain, ask." | `CLAUDE.md:14`；`SKILL.md:31`；`mdc:18` | T | 强制动作 | [通用] |
| K2 | 存在多种解读时全部呈现，不得静默择一 | "If multiple interpretations exist, present them - don't pick silently." | `CLAUDE.md:15`；`SKILL.md:32`；`mdc:19` | T | 禁令 | [通用] |
| K3 | 存在更简方案必须说明 | "If a simpler approach exists, say so." | `CLAUDE.md:16`；`SKILL.md:33`；`mdc:20` | T | 强制动作 | [通用] |
| K4 | 该推回时推回 | "Push back when warranted." | `CLAUDE.md:16`；`SKILL.md:33`；`mdc:20` | T | 启发式 | [通用] |
| K5 | 不清楚就停下，指出困惑点并提问 | "If something is unclear, stop. Name what's confusing. Ask." | `CLAUDE.md:17`；`SKILL.md:34`；`mdc:21` | T | 强制动作（含 stop） | [通用] |
| K6 | 三条总纲：不臆断、不藏困惑、呈现权衡 | "**Don't assume. Don't hide confusion. Surface tradeoffs.**" | `CLAUDE.md:11`；`SKILL.md:28`；`mdc:15` | T | 禁令+强制动作 | [通用] |
| K7 | 懒＝高效而非草率；最好的代码是没写的代码 | "You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written." | `CLAUDE.md:23`；`SKILL.md:40`；`mdc:25` | S | 立场/启发式 | [通用] |
| K8 | 写码前从第 1 级起停在首个成立级别（7 级阶梯） | "Before writing any code, stop at the first rung that holds:" | `CLAUDE.md:25`；`SKILL.md:42`；`mdc:27` | S | 强制流程 | [通用] |
| K8.1 | 需要建吗（YAGNI） | "Does this need to be built at all? (YAGNI)" | `CLAUDE.md:26`；`SKILL.md:43`；`mdc:28` | S | 强制流程 | [通用] |
| K8.2 | 代码库里已有？复用而非重写 | "Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it." | `CLAUDE.md:27`；`SKILL.md:44`；`mdc:29` | S | 强制流程 | [通用] |
| K8.3 | 标准库已实现？用它 | "Does the standard library already do this? Use it." | `CLAUDE.md:28`；`SKILL.md:45`；`mdc:30` | S | 强制流程 | [通用] |
| K8.4 | 平台原生特性覆盖？用它 | "Does a native platform feature cover it? Use it." | `CLAUDE.md:29`；`SKILL.md:46`；`mdc:31` | S | 强制流程 | [通用] |
| K8.5 | 已安装依赖可解？用它 | "Does an already-installed dependency solve it? Use it." | `CLAUDE.md:30`；`SKILL.md:47`；`mdc:32` | S | 强制流程 | [通用] |
| K8.6 | 能一行写完？写一行 | "Can this be one line? Make it one line." | `CLAUDE.md:31`；`SKILL.md:48`；`mdc:33` | S | 强制流程 | [通用] |
| K8.7 | 否则才写能跑的最少代码 | "Only then: write the minimum code that works." | `CLAUDE.md:32`；`SKILL.md:49`；`mdc:34` | S | 强制流程 | [通用] |
| K9 | 阶梯必须在理解问题之后运行，不得替代理解 | "The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb." | `CLAUDE.md:34`；`SKILL.md:51`；`mdc:36` | S | 前置条件 | [通用] |
| K10 | 不做未被明确请求的抽象 | "No abstractions that weren't explicitly requested." | `CLAUDE.md:37`；`SKILL.md:54`；`mdc:39` | S | 禁令 | [通用] |
| K11 | 能不新增依赖就不新增 | "No new dependency if it can be avoided." | `CLAUDE.md:38`；`SKILL.md:55`；`mdc:40` | S | 禁令 | [通用] |
| K12 | 不写没人要求的样板 | "No boilerplate nobody asked for." | `CLAUDE.md:39`；`SKILL.md:56`；`mdc:41` | S | 禁令 | [通用] |
| K13 | 删除优于新增、平淡优于取巧、文件越少越好 | "Deletion over addition. Boring over clever. Fewest files possible." | `CLAUDE.md:40`；`SKILL.md:57`；`mdc:42` | S | 偏好级强制 | [通用] |
| K14 | 最短 diff 胜出，但仅在理解之后；最小改动放错位置＝第二个 bug | "Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug." | `CLAUDE.md:41`；`SKILL.md:58`；`mdc:43` | S | 启发式+禁令 | [通用] |
| K15 | 质疑复杂需求（"真的需要 X，还是 Y 就够？"） | "Question complex requests: \"Do you actually need X, or does Y cover it?\"" | `CLAUDE.md:42`；`SKILL.md:59`；`mdc:44` | S | 强制动作 | [通用] |
| K16 | 同等代码量时选边界正确的方案（懒≠劣质算法） | "Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm." | `CLAUDE.md:43`；`SKILL.md:60`；`mdc:45` | S | 决策准则 | [通用] |
| K17 | 有意简化须用 `ponytail:` 注释标注天花板与升级路径 | "Mark intentional simplifications with a `ponytail:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment names the ceiling and the upgrade path." | `CLAUDE.md:44`；`SKILL.md:61`；`mdc:46` | S | 强制动作（可追溯性） | [通用] |
| K18 | "不偷懒"豁免清单：理解问题、信任边界输入校验、防数据丢失的错误处理、安全、可访问性、真实硬件校准、用户明确要求 | "Not lazy about: understanding the problem (…a small diff you don't understand is just laziness dressed up as efficiency), input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested." | `CLAUDE.md:46`（完整版）；`SKILL.md:63`（完整版）；`mdc:48`（**删去"理解问题"括注与"硬件校准"两项**） | S | 边界/豁免 | [通用] |
| K19 | 非平凡逻辑必须留 1 个可运行检查；琐碎一行免测 | "Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test." | `CLAUDE.md:46`；`SKILL.md:63`；`mdc:48` | S/G | 强制交付物 | [通用] |
| K20 | 三档强度 lite / full / ultra，`/ponytail` 切换、可关闭 | 三行档位表 + 开关行；因含竖线无法在表格内逐字引用，完整 verbatim 见本节末注 | `CLAUDE.md:48-56`；`SKILL.md:65-73`（**mdc 全部缺失**） | S | 交互式可调/可关闭 | [通用] |
| K21 | 不"顺手改进"相邻代码、注释、格式 | "Don't \"improve\" adjacent code, comments, or formatting." | `CLAUDE.md:65`；`SKILL.md:82`；`mdc:55` | X | 禁令 | [通用] |
| K22 | 不重构没坏的东西 | "Don't refactor things that aren't broken." | `CLAUDE.md:66`；`SKILL.md:83`；`mdc:56` | X | 禁令 | [通用] |
| K23 | 匹配既有风格，即使自己会写得不同 | "Match existing style, even if you'd do it differently." | `CLAUDE.md:67`；`SKILL.md:84`；`mdc:57` | X | 强制动作 | [通用] |
| K24 | 发现无关死代码只提及、不删除 | "If you notice unrelated dead code, mention it - don't delete it." | `CLAUDE.md:68`；`SKILL.md:85`；`mdc:58` | X | 禁令 | [通用] |
| K25 | 清理"自己改动造成的"孤儿（未用 import/变量/函数） | "Remove imports/variables/functions that YOUR changes made unused." | `CLAUDE.md:71`；`SKILL.md:88`；`mdc:61` | X | 强制动作 | [通用] |
| K26 | 未经要求不删既有死代码 | "Don't remove pre-existing dead code unless asked." | `CLAUDE.md:72`；`SKILL.md:89`；`mdc:62` | X | 禁令 | [通用] |
| K27 | 判定测试：每行改动都能直接追溯到用户请求 | "The test: Every changed line should trace directly to the user's request." | `CLAUDE.md:74`；`SKILL.md:91`；`mdc:64` | X | 验收判据 | [通用] |
| K28 | bug 修根因不修症状；grep 全部调用者，一次修好共享函数 | "Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken." | `CLAUDE.md:80`；`SKILL.md:97`；`mdc:68` | B | 强制流程 | [通用] |
| K29 | 把任务转成可验证目标（含 3 组示例映射） | "\"Add validation\" → \"Write tests for invalid inputs, then make them pass\"" 等 3 条 | `CLAUDE.md:88-91`；`SKILL.md:105-108`；`mdc:74-77` | G | 强制动作 | [通用] |
| K30 | 多步任务先给 [步骤]→verify:[检查] 计划 | "For multi-step tasks, state a brief plan:" + 三行模板 | `CLAUDE.md:93-98`；`SKILL.md:110-115`；`mdc:79-84` | G | 强制动作 | [通用] |
| K31 | 强成功标准→可独立循环；弱标准→需反复澄清 | "Strong success criteria let you loop independently. Weak criteria (\"make it work\") require constant clarification." | `CLAUDE.md:100`；`SKILL.md:117`（**mdc 缺失**） | G | 原理说明 | [通用] |
| K32 | 生效判据（diff 更少、返工更少、提问早于犯错） | "**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes." | `CLAUDE.md:104`；`SKILL.md:121`（**mdc 缺失**） | G | 验收判据 | [通用] |

**K20 完整 verbatim**（表格内无法逐字引用竖线，故独立列出；`CLAUDE.md:48-56` = `SKILL.md:65-73`，mdc 缺失）：

```
Intensity levels:

| Level | What changes |
|-------|-------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |

Switch: `/ponytail lite|full|ultra`. Off: "stop ponytail" / "normal mode".
```

## 4 README 的"五条原则"与文件内规则的对应关系

| # | 原则（README verbatim） | 文件内承载段落 | 规则 ID |
|---|---|---|---|
| 1 | "**Think Before Coding** — surface tradeoffs, ask before assuming, name confusion"（README:61） | `CLAUDE.md:9-17` | K1–K6 |
| 2 | "**Simplicity — The Ladder** — 7-rung decision ladder from YAGNI to minimum working code"（README:62） | `CLAUDE.md:21-56` | K7–K20（阶梯恰 7 级，与 "7-rung" 一致：`CLAUDE.md:26-32`） |
| 3 | "**Surgical Changes** — touch only what you must, clean up only your own mess"（README:63） | `CLAUDE.md:60-74` | K21–K27 |
| 4 | "**Bug Fixes** — root cause not symptom, grep all callers, fix the shared function once"（README:64） | `CLAUDE.md:78-80` | K28 |
| 5 | "**Goal-Driven Execution** — define success criteria, loop until verified"（README:65） | `CLAUDE.md:84-100` | K29–K31 |

对应关系成立且**无孤儿原则、无未覆盖章节**（唯一 README 未提的是 K32 结尾生效判据，属文件比 README 摘要多出的内容）。注意原则 4、5 **在 README 中没有任何引文来源**（README:9-19 只给了 Karpathy 三段、Ponytail 一段），其"属于 Karpathy 还是 Ponytail"在仓库内无据。

## 5 载体对比表（文件 × 触发机制 × 规则覆盖 × 强制强度 × 适用代理）

| 载体 | 触发/载入机制（证据） | 规则覆盖（相对 CLAUDE.md 正文） | frontmatter 字段 | 强制强度 | 适用代理 | 点名 Claude |
|---|---|---|---|---|---|---|
| `CLAUDE.md`（104 行 4967B） | README:29 断言 "Drop into any project root — Claude Code loads it automatically" ⇒ **always-on（项目级）**，但此机制为 README 单方声明，仓库内无机制证明（§8-U2） | 100%（基准，103 行正文） | 无 | 最强（无 frontmatter、无开关、无工具白名单；仅 K0b 的 judgment 放松与 K20 的档位可调） | Claude Code（README:29，点名） | 是（文件名 + README:29） |
| `AGENTS.md`（104 行 4967B） | README:30 "Same content — for Codex, OpenCode, and agents that read `AGENTS.md`" ⇒ always-on（各代理各自约定） | 100%（与 CLAUDE.md 正文逐字节相同，仅 H1 不同） | 无 | 同 CLAUDE.md | Codex/OpenCode 等（README:30） | 否 |
| `SKILL.md`（121 行 5833B） | README:31 "Claude Code plugin skill with frontmatter" ⇒ **按需**：`description` 显式枚举触发语（`SKILL.md:10-13`，该段在 YAML 中被折成 4 行，下引为折行合并后的连续文本："Use whenever the user says \"karpathy mode\", \"ponytail\", \"be lazy\", \"think before coding\", \"surgical changes\", \"simplest solution\", \"minimal solution\", or complains about over-engineering…"），并有 `argument-hint`（`SKILL.md:14`，取值 lite / full / ultra） | 100%（正文 103 行与 CLAUDE.md 逐字节相同） | `name`、`description`、`argument-hint`、`license: MIT`（共 855 字节）；**无 `allowed-tools`、无 `model`、无 `disable-model-invocation`** | 中：本体规则同强，但只有被触发进入上下文时才生效；无工具级白名单 ⇒ 全为自然语言约束 | Claude Code（README:31，点名） | 是（README:31/49/51） |
| `.cursor/rules/karpathy-ponytail.mdc`（84 行 3920B） | frontmatter `alwaysApply: true` + `globs: "**/*"`（`mdc:3-4`）+ README:32 "Cursor project rule — always-on" ⇒ always-on（全文件匹配） | 缺 K20（强度档位/开关）、K31、K32；K18 被削减（去"理解问题"括注与硬件校准两项）；无 H1，正文其余同。实测 `grep -vxFf`：`CLAUDE.md` 有 11 行在 mdc 中无逐字对应 = H1(1) + 长版 `Not lazy about:`(1) + 强度档位块 "Intensity levels:"/表头/分隔行/3 档行(6) + `Switch:` 行(1) + K31(1) + K32(1)（空行与 `---` 未被该法捕获，因 mdc 另含同名行） | `description`、`globs`、`alwaysApply`（共 116 字节）；无工具白名单 | 中偏强：always-on 但规则文本较弱（缺闭环判据与档位控制） | Cursor（README:32）；是否以 Claude 为后端模型未在仓库内说明 | 否（正文零 Claude） |
| `README.md`（72 行 2785B） | 非规则载体，是**元数据/分发说明**；Claude 相关断言的唯一来源 | 0%（仅摘要五原则） | 无 | 无约束力（文档） | 人类读者 | 是（README:3,29,31,49,51,53,54） |

**载体差异导致的约束强度差异（结论）**：
1. **always-on 三兄弟（CLAUDE.md/AGENTS.md/mdc）vs on-demand 的 skill**：三者文本几乎同一份，但 skill 的生效前提是"被触发"，故其**期望约束力低于 always-on 载体**；反过来说，skill 是唯一能在**不使用 CLAUDE.md 的项目**里注入规则的手段（README:49 称 "Claude Code plugin (all projects)"）。仓库内没有任何文件描述 skill 的加载时机，只有 `description` 的触发语清单和 `argument-hint` 作为间接内证（§8-U3）。
2. **skill 无 `allowed-tools`**：全仓库 `grep` 命中 0（§0.5）⇒ 该插件**不做工具级限制**（不禁止 Edit/Bash、不限制写入范围），所有约束都是靠模型自觉遵守的自然语言规则；因此"约束强度"只能来自 always-on 的上下文存在性与措辞强度（禁令 vs 启发式），不存在 harness 层强制。
3. **frontmatter 语义差异**：`mdc` 用 `alwaysApply: true` 显式声明 always-on，`SKILL.md` 用 `description` 声明触发条件——两者是**相反的载入策略**；而 `CLAUDE.md`/`AGENTS.md` 完全没有 frontmatter，其 always-on 性**完全依赖宿主约定而非文件自述**（这一点使 CLAUDE.md 的约束强度"看起来最强、实际最不可自查"）。
4. **mdc 的规则缺口是"静默降级"**：Cursor 用户拿到的是缺了强度档位、循环判据与生效判据的版本；由于 mdc 无 H1、无"本文是删减版"的说明，读者无从得知存在更全版本（`mdc:1-7` 对比 `CLAUDE.md:1-7`）。
5. **经验旁证（非 Claude Code 证据）**：本次分析会话中，本工作区的 harness 因 `.refs/karpathy-ponytail-skills/` 下存在 `AGENTS.md`/`CLAUDE.md` 而将两份全文以 system-reminder 形式自动注入到我的上下文——这是"根目录 AGENTS.md/CLAUDE.md ⇒ always-on 注入"在**本 harness** 上的实测旁证，可作为载体机制存在的独立佐证，但**不能**用来证明 Claude Code 的具体行为（§8-U2）。

## 6 与 Ponytail 阶梯的关系：哪些是叠加、哪些是改写

README:17-19 自述 Ponytail 的贡献，verbatim："Ponytail added the concrete decision ladder Karpathy's simplicity rule was missing:" + "\"The best code is the code never written. Stop at the first rung that holds: does this need to exist at all? Already in the codebase? Stdlib? Native platform? Existing dependency? One line? Only then: minimum code that works.\""（README:17、19）。README:21："This repo merges both into one file."。

### 6.1 直接叠加（Ponytail 引文 → 文件，1:1 逐级可对齐）

README:19 的 7 个问句与 `CLAUDE.md:26-32` 的 7 级阶梯**逐级一一对应**（YAGNI→已有→stdlib→native→dep→one line→minimum code），并额外增补 README 引文中没有的措辞（"Reuse the helper, util, or pattern that's already here, don't re-write it." `CLAUDE.md:27`）。此外 K7（`CLAUDE.md:23`）逐字含 README:19 的 "The best code is the code never written."。

### 6.2 Ponytail 侧新增（Karpathy 三段引文未覆盖的机制层）

- K17 `ponytail:` 注释协议（`CLAUDE.md:44`）——"天花板 + 升级路径"，README 引文无此内容；
- K18 不偷懒豁免清单（`CLAUDE.md:46`）——其中的"the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off)"**在 README 的 Karpathy 引文与 Ponytail 引文中均不出现**，属未署名的第三方增补；
- K19 "ONE runnable check"（`CLAUDE.md:46`）——同上，未署名；
- K20 强度档位 lite/full/ultra + `/ponytail` 开关（`CLAUDE.md:48-56`）——README 引文无，但"ponytail"词汇与 `/ponytail` 命令名指向 Ponytail 品牌；
- K10–K16 反模式清单（`CLAUDE.md:37-44`）——部分可映射到 Karpathy 的 simplicity 诉求，但具体措辞（"No boilerplate nobody asked for."、"Boring over clever."）为新增。

### 6.3 改写（同一失败模式被换成不同甚至相反的约束）

- **C1（反向改写，最重要）**：Karpathy 抱怨模型 "don't clean up dead code"（README:13），合并文件却立规 "If you notice unrelated dead code, mention it - don't delete it."（`CLAUDE.md:68`）与 "Don't remove pre-existing dead code unless asked."（`CLAUDE.md:72`）。即：**Karpathy 抱怨的"没删"，被改写成了"不许删"**。二者并非完全矛盾——`CLAUDE.md:40` "Deletion over addition." 与 `CLAUDE.md:71` 允许删除"自己造成的孤儿"——但 `CLAUDE.md:40` 与 `CLAUDE.md:72` 在同一文件内构成**规则级张力**：前者要求删除优先，后者禁止删除既有死代码。是否冲突取决于"既有死代码"是否算作"addition 的反面"，文本未澄清（§8-U4）。
- **C2（泛化改写）**：Karpathy 的限定是 "change/remove comments and code they don't sufficiently understand as side effects"（README:15，其中 "they don't sufficiently understand" 是他给 comments and code 加的定语），文件把它泛化为 "Don't \"improve\" adjacent code, comments, or formatting."（`CLAUDE.md:65`）——**丢掉了"不理解"这一判定条件**，于是即便完全理解的相邻代码也不得动。约束更强，但不再对应原始失败模式。
- **C3（降级改写）**：mdc 对 K18 的改写删去了"理解问题"的说明性括注与硬件校准项（`mdc:48`），使"不偷懒"边界变窄。
- **C4（无源新增）**：§4 Bug Fixes（K28）与 §5 Goal-Driven（K29–K31）在 README 中**没有任何引文出处**，既不属 Karpathy 三段引文，也不属 Ponytail 引文；因此"merge"一词在仓库内只对原则 1/2/3 有引文支撑。

## 7 可提炼进通用 AGENTS.md 的候选（≤10，标优先级）

| P | 候选规则 | 建议 verbatim 摘用 | 出处 | 提炼理由 |
|---|---|---|---|---|
| P0 | 显式声明假设，不确定就问 | "State your assumptions explicitly. If uncertain, ask." | `CLAUDE.md:14` | 直击 F1，模型与工具无关，零成本可执行 |
| P0 | 不清楚就停下、命名困惑点、提问 | "If something is unclear, stop. Name what's confusing. Ask." | `CLAUDE.md:17` | 直击 F2/F3；"stop" 是可观测动作 |
| P0 | 多解并存时全部呈现，不静默择一 | "If multiple interpretations exist, present them - don't pick silently." | `CLAUDE.md:15` | 直击 F4（该仓库唯一的近似覆盖），通用性强 |
| P0 | 判定测试：每行改动可追溯到用户请求 | "The test: Every changed line should trace directly to the user's request." | `CLAUDE.md:74` | 可在 review 阶段机械核查，替代"不许顺手改"的软约束 |
| P0 | bug 修根因：grep 全部调用者、一次修好共享函数 | "Bug fix = root cause, not symptom: … Grep every caller of the function you touch and fix the shared function once…" | `CLAUDE.md:80` | 高价值、可操作、通用 |
| P1 | 不做未被请求的抽象、样板、新依赖 | "No abstractions that weren't explicitly requested." / "No boilerplate nobody asked for." / "No new dependency if it can be avoided." | `CLAUDE.md:37`、`CLAUDE.md:39`、`CLAUDE.md:38` | 直击 F7/F8 |
| P1 | 不"顺手改进"相邻代码/注释/格式；匹配既有风格 | "Don't \"improve\" adjacent code, comments, or formatting." / "Match existing style, even if you'd do it differently." | `CLAUDE.md:65`、`CLAUDE.md:67` | 直击 F11；建议**补回** Karpathy 的"不理解"限定（§6-C2） |
| P1 | 非平凡逻辑留 1 个可运行检查 | "non-trivial logic leaves ONE runnable check behind… Trivial one-liners need no test." | `CLAUDE.md:46` | 让"最小改动"可验证，避免懒惰滑坡 |
| P1 | 有意的简化须写明天花板与升级路径 | "If the shortcut has a known ceiling… the comment names the ceiling and the upgrade path." | `CLAUDE.md:44` | 通用（把 `ponytail:` 注释标记**改名**为中性前缀，如 `lazy:` / `simplification:`，因品牌词不宜进通用规范） |
| P2 | 多步任务给 [步骤]→verify 计划；强标准可独立循环 | "1. [Step] → verify: [check]" / "Strong success criteria let you loop independently." | `CLAUDE.md:93-98`、`CLAUDE.md:100` | 提升自治性，但依赖宿主是否鼓励逐步输出 |

**不建议直接移植**：K20 强度档位与 `/ponytail` 开关（Claude Code slash-command 交互形态，且含品牌词）；§6-C1 的"不许删死代码"与"Deletion over addition"这对未澄清的矛盾；K18 中的"硬件校准"（领域特定）。

## 8 不确定项与方法说明

### U1 插件/marketplace 形态不可验证
仓库全树 5 文件、无任何 manifest（§0.2）。README:53-54 的 `/plugin marketplace add AbdullahHameedKhan/karpathy-ponytail-skills` 与 `/plugin install karpathy-ponytail@karpathy-ponytail` 是**仓库内唯一的安装信息来源**；`karpathy-ponytail` 作为 plugin 名与 marketplace 名仅能由该命令字符串的位置推断。本报告**未**杜撰任何 marketplace 名、plugin 名或安装命令；能否实际安装**未提供**可验证材料。

### U2 "Claude Code 自动加载 CLAUDE.md"属 README 单方断言
README:29 的 "Claude Code loads it automatically" 在仓库内无机制证明（无 hooks、无配置、无测试）。§5 第 5 条给出的"harness 自动注入"旁证来自**本工作区的 DSH/agent-rules 环境**，只能证明"根目录 AGENTS.md/CLAUDE.md 会被某些 harness 注入"这一普遍机制，**不能**外推为 Claude Code 的具体行为。

### U3 skill 的"按需触发"仅为文件自述 + 机制常识
仓库内没有任何文件说明 skill 何时进入上下文。内证只有：`SKILL.md:10-13` 的触发语清单（"Use whenever the user says…"）与 `SKILL.md:14` 的 `argument-hint`。因此 §5 中"on-demand ⇒ 期望约束强度低于 always-on"是**基于载入策略的推断**，未实测。未执行任何 skill 加载实验。

### U4 规则级张力未澄清
`CLAUDE.md:40`（"Deletion over addition."）与 `CLAUDE.md:72`（"Don't remove pre-existing dead code unless asked."）的适用边界在文本中没有交代；本报告只记录张力，不代作者消解。

### U5 上游引文无法在仓库内二次溯源
README:9 称 "Karpathy identified the core failure modes" 并给出三段引文，但**未给出任何 Karpathy 原文的 URL/时间/出处**；Karpathy 观点只能以"仓库内引文"身份使用，不能断言为 Karpathy 原话的准确转录。README:71-72 的 Sources 只给了 Ponytail 的仓库链接（`DietrichGebert/ponytail`，MIT）。本报告未联网核对上游仓库当前状态（分析固定在本地 sha `8869387`）。

### M1 判定方法：为什么全表没有 [Claude-specific]
步骤：(1) 对 5 个文件 `grep -rIn -E "Claude|Anthropic|LLM|model"`；(2) 结果——`Claude` 只出现在 `README.md:3,29,31,49,51,53,54`；`Anthropic` 出现 0 次；`LLM` 只出现在 `CLAUDE.md:3`、`SKILL.md:20`、`mdc:9` 的同一句（"reduce common LLM coding mistakes"）；规则正文中的 "The models make wrong assumptions…"（README:11）只出现在 README 引文里，不进入任何规则文本。因此：**规则级一律 [通用]**；仅当文本点名 `LLM`（模型泛指，未点名 Claude）时加 † 标记并在二元制中计入 [通用]。`[Claude-specific]` 只授予**载体层**条目（CLAUDE.md 文件名 + README:29/31/49/51 的 Claude Code 声明 + README:53-54 的 `/plugin` 命令），因为它们确实点名了 Claude/Claude Code。这与用户重点问题中"该插件对 Claude 模型的规则约束"形成关键回答：**该仓库的规则本身是模型无关的，Claude 相关性来自分发载体而非规则内容。**

### M2 证据采集方法（全部只读）
`wc -l`/`wc -c`、`sha256sum`、`md5sum`、`diff`（含 `-w`、`cat -A` 版本）、`cmp`、`grep -vxFf`（前缀差集，用于量化 mdc 覆盖缺口）、`grep -rIn`、`file`、`head -c1 | xxd`（末字节）、`find`、`git log --oneline`、`git show --stat`、`git status --porcelain`（空 ⇒ `.refs` 无改动）、`git rev-parse HEAD`。所有引用行号均为上述命令输出的实测值；`SKILL.md` 与 `CLAUDE.md` 的行号偏移恒定 +17（正文逐字节相同），`mdc` 行号经 `grep -n` 逐条核验。未运行任何测试工具（该仓库无代码/无测试）、未联网。

**更正记录（Lead 复核，依据 `findings/99-verification.md`）**
- §0.5 的 `Claude` 行号枚举有误：实测为 `README.md:3,29,31,49,51`（"Claude Code" 字样）与 `README.md:40,43,45,46`（文件名 `CLAUDE.md`）；原列出的 `:53,54` 不含 `Claude`。结论（三份规则正文零 Claude/Anthropic）不受影响，已就地更正。
