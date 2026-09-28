# 01 — ponytail 规则集：条款、强制力与投影一致性

> 上游文本为英文，逐字引文一律保留英文；中文为分析者转述。全部取证只来自 §0 的快照。
> `P:` 引用前缀的定义见 §0.3；强制形式词表见 §0.4；带 `[benchmark]` 的数字是溯源物，不计入规则数。
> 全局判据：任一条目若无法按 §0.3 解析出 `P:path:line` 且 `path` 在快照内存在，即为缺陷（§7 自审会统计）。

## §0 溯源

| 项 | 值 | 出处 |
|---|---|---|
| 上游仓库 | `DietrichGebert/ponytail` | `P:package.json:14` |
| 本地快照（只读） | `.refs/ponytail`，`--depth 1` 克隆，本次分析未写入、未跑 git 写命令 | — |
| 提交 | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` | `git rev-parse HEAD` |
| 提交标题 | `chore: release v4.10.0 (#870)` | `git log -1` |
| 提交日期 | `2026-09-14 16:34:42 +0200` | `git log -1 --date=iso` |
| 版本 | `4.10.0`（8 个版本文件同版本，见 §3.2d） | `P:package.json:3` |
| 许可 | MIT | `P:LICENSE:1-3`、`P:package.json:6` |
| 实测规模 | 166 个纳入版本控制的文件；`README.md` 395 行 | `git ls-files \| wc -l`、`wc -l` |

**在范围**：`.agents/rules/ponytail.md`、`AGENTS.md`、`skills/*/SKILL.md`（6 个）、`hooks/`（6 个 `.js` + 4 个 `.json` + 2 个 statusline 脚本）、`commands/*.toml`（6 个）、`docs/{agent-portability,cursor-hooks,platform-native}.md`、`scripts/check-*.js` 及生成/安装脚本、`.github/workflows/{test,publish}.yml`、`benchmarks/README.md`、`examples/`（12 文件）、7 份宿主规则投影、以及同属规则集的 `.openclaw/`、`.opencode/`、`pi-extension/`、`__init__.py`、`ponytail-mcp/`、`tests/`（见 §5）。

**排除及理由**：`assets/`（图片与 SVG，非规则文本）；`README.es.md`/`README.ko.md`（译本，与 `README.md` 同源的展示层，不构成独立规则载体）；README 的 Install / Sponsors / Star History 章节（安装与营销，按 `writing-for-agents` 的 no-op/relevance 判定删除）；benchmark 结果文件（数字标 `[benchmark]` 后排除于计数）。

### §0.3 引用前缀

`P:<path>:<line>`，`<path>` 相对快照根 `.refs/ponytail/`，因此 `P:AGENTS.md:7` 指 `.refs/ponytail/AGENTS.md` 第 7 行；`<line>` 可写 `a-b` 区间，区间内文本按空白归一化后连接。全文引用见 §7 的机器包含性核对。

### §0.4 强制形式词表（定义一次，后文只复用 token）

- `prompt-only` — 纯文本条款，靠模型读到后遵守；除送达外无宿主机制强制。
- `hook` — 由宿主生命周期钩子**注入或跟踪档位**；`hook` 在这里**不代表能阻断**，阻断能力见 §3.1。
- `script·gate` — 仓库脚本，非零退出即 CI 变红。
- `test·gate` — `npm test` 内的断言。

### §0.5 计数口径

- **规则**：一条可判定的约束条款。同一规则在 `AGENTS.md` 与 7 份投影中逐字相同（§4 给判据），只计一条并列出全部出处。
- **`ponytail:` 标记**：口径敏感，先给命令再给数，见 §6.2；本文件不写无命令的数字。

本节判据：§2 的每条规则都能落到上表四个 token 之一，且不出现第五种。

## §1 一句话定位

ponytail 把「懒惰的资深工程师」人格化为一条**自上而下、命中即停的 7 级阶梯**（`P:AGENTS.md:5`），外面包三件事：先理解再爬梯的前置条件、一张「绝不懒」清单、以及把每次故意抄近路留痕成 `ponytail:` 注释的债务闭环；再外加 5 个子技能，其中 3 个只报告不改、2 个一次性展示。

## §2 规则清单

格式：`- **[P-NN]** 摘要｜强制形式｜出处`，紧随的 `>` 行是逐字引文（长句用 `…` 截断并标区间）。

### 2.1 身份、常驻与档位

- **[P-01]** 身份前提：懒 = 高效而非粗心；最好的代码是没被写下的代码。｜`prompt-only`｜`P:AGENTS.md:3`；详版 `P:skills/ponytail/SKILL.md:22-24`
  > "You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written."
- **[P-02]** 常驻：每一轮响应都生效、不准漂回过度构建、不确定也生效；默认档 `full`。｜`prompt-only` + `hook`｜`P:skills/ponytail/SKILL.md:28-30`；送达 `P:hooks/ponytail-instructions.js:87-88`
  > "ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if unsure. Off only: "stop ponytail" / "normal mode". Default: **full**."
- **[P-03]** 默认档解析顺序：环境变量 > 配置文件 > `full`。｜`hook`｜`P:skills/ponytail-help/SKILL.md:61`；实现 `P:hooks/ponytail-config.js:76-100`
  > "Resolution: env var > config file > `full`."
- **[P-04]** 三档强度语义：`lite` 照做并用一行点名更懒的替代；`full` 强制阶梯；`ultra` YAGNI 极端主义、先删除后新增、边交付边挑战需求。｜`prompt-only` + `hook`｜`P:skills/ponytail/SKILL.md:81-83`；卡面 `P:skills/ponytail-help/SKILL.md:18-20`
  > "| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |"
  > "| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |"
  > "| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |"
- **[P-05]** 关闭口令恰好两个：`stop ponytail` / `normal mode`（`/ponytail off` 亦通）。｜`script·gate`｜`P:hooks/ponytail-config.js:40-43`；`P:skills/ponytail-help/SKILL.md:41-42`
  > "return t === 'stop ponytail' || t === 'normal mode';"
- **[P-06]** 关闭必须**整条消息**等于口令，忽略大小写与尾部标点——否则 "add a normal mode toggle" 会把模式误关。｜`script·gate`｜`P:hooks/ponytail-config.js:36-39`
  > "Matching the phrase anywhere in the message turned it off mid-task for ordinary requests like "add a normal mode toggle" — so require the whole message to be the command, ignoring case and trailing punctuation."
- **[P-07]** 档位边界：只管「构建什么」不管「怎么说话」；档位持续到被改或会话结束。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:116-118`
  > "Ponytail governs what you build, not how you talk (pair with Caveman for terse prose). "stop ponytail" / "normal mode": revert. Level persists until changed or session end."
- **[P-08]** 适用边界：仅编码任务（写、加、重构、修、审、设计、选依赖）；非编码请求（常识、散文、翻译、摘要、菜谱）明确禁用。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:8-15`
  > "Use on ANY coding task: writing, adding, refactoring, fixing, reviewing, or designing code, and choosing libraries or dependencies."
  > "Do NOT use for non-coding requests (general knowledge, prose, translation, summaries, recipes)."
- **[P-09]** 模式切换写 flag 文件、`/ponytail default <level>` 才落盘配置；`review` 不是合法默认档。｜`script·gate`｜`P:hooks/ponytail-mode-tracker.js:55-66`；`P:hooks/ponytail-config.js:79-81`、`P:hooks/ponytail-config.js:91`
  > "// `/ponytail default <mode>` persists the default to config (survives restarts)."

### 2.2 懒惰阶梯（7 级 + 两条语义）

- **[P-10]** 第 1 级 YAGNI：先问需不需要存在；投机性需求 = 跳过并一行说明。｜`prompt-only`｜`P:AGENTS.md:7`；详版 `P:skills/ponytail/SKILL.md:36`
  > "1. Does this need to be built at all? (YAGNI)"
- **[P-11]** 第 2 级 复用本仓库已有；「重写几文件之外的现成物」被点名为最常见的 slop。｜`prompt-only`｜`P:AGENTS.md:8`；详版 `P:skills/ponytail/SKILL.md:37`
  > "2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it."
- **[P-12]** 第 3 级 标准库已经能做就用标准库。｜`prompt-only`｜`P:AGENTS.md:9`；详版 `P:skills/ponytail/SKILL.md:38`
  > "3. Does the standard library already do this? Use it."
- **[P-13]** 第 4 级 平台原生能力覆盖就用原生。｜`prompt-only`｜`P:AGENTS.md:10`；详版 `P:skills/ponytail/SKILL.md:39`
  > "4. Does a native platform feature cover it? Use it."
- **[P-14]** 第 5 级 已安装依赖能解决就用它；几行代码能做的绝不新增依赖。｜`prompt-only`｜`P:AGENTS.md:11`；详版 `P:skills/ponytail/SKILL.md:40`
  > "5. Does an already-installed dependency solve it? Use it."
- **[P-15]** 第 6 级 能写成一行就写成一行。｜`prompt-only`｜`P:AGENTS.md:12`；详版 `P:skills/ponytail/SKILL.md:41`
  > "6. Can this be one line? Make it one line."
- **[P-16]** 第 7 级 只有以上都不成立，才写最小可用代码。｜`prompt-only`｜`P:AGENTS.md:13`；详版 `P:skills/ponytail/SKILL.md:42`
  > "7. Only then: write the minimum code that works."
- **[P-17]** 命中即停：自上而下停在第**一个**成立的梯级；两级同时成立取更省的那级，第一个能跑通的懒惰解就是对的解。｜`prompt-only`｜`P:AGENTS.md:5`；`P:skills/ponytail/SKILL.md:46-48`
  > "Before writing any code, stop at the first rung that holds:"
  > "Two rungs work → take the higher one and move on. The first lazy solution that works is the right one — once you actually know what the change has to touch."
- **[P-18]** 前置条件：阶梯在**理解之后**运行，不是替代理解；是反射而非研究课题，但必须先读任务与将被改动的代码、端到端追踪真实流程。｜`prompt-only`｜`P:AGENTS.md:15`；`P:skills/ponytail/SKILL.md:44-46`
  > "The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb."
  > "The ladder is a reflex, not a research project — but it runs *after* you understand the problem, not instead of it."

### 2.3 硬性条款

- **[P-19]** 不加未被明确要求的抽象（单实现接口、单产品工厂、永不变化的配置）。｜`prompt-only`｜`P:AGENTS.md:21`；详版 `P:skills/ponytail/SKILL.md:58`
  > "- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes."
- **[P-20]** 不写没人要的样板，也不为「以后」搭脚手架——以后可以自己搭。｜`prompt-only`｜`P:AGENTS.md:23`；详版 `P:skills/ponytail/SKILL.md:59`
  > "- No boilerplate, no scaffolding "for later", later can scaffold for itself."
- **[P-21]** 删除优先于新增、无聊优先于花哨、文件数最少。｜`prompt-only`｜`P:AGENTS.md:24`；详版 `P:skills/ponytail/SKILL.md:60`
  > "- Deletion over addition. Boring over clever. Fewest files possible."
- **[P-22]** 最短可行 diff 胜出，但只在理解问题之后；放错位置的最小改动是第二个 bug。｜`prompt-only`｜`P:AGENTS.md:25`；详版 `P:skills/ponytail/SKILL.md:61`
  > "- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug."
- **[P-23]** 能避免就不新增依赖。｜`prompt-only`｜`P:AGENTS.md:22`
  > "- No new dependency if it can be avoided."
- **[P-24]** 复杂请求：先在同一响应里交付懒惰版并质疑，绝不因等回答而停工。｜`prompt-only`｜`P:AGENTS.md:26`；详版 `P:skills/ponytail/SKILL.md:62`
  > "- Question complex requests: "Do you actually need X, or does Y cover it?""
  > "Never stall on an answer you can default."
- **[P-25]** 两个 stdlib 方案同体量时选边界正确的那个；懒 = 更少代码，不是更脆弱的算法。｜`prompt-only`｜`P:AGENTS.md:27`；详版 `P:skills/ponytail/SKILL.md:63`
  > "- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm."
- **[P-26]** 缺陷修复 = 治根因：先 grep 该函数全部调用点，在共享函数里修一次；只修工单点名的路径会留下同级调用者仍坏。｜`prompt-only`｜`P:AGENTS.md:17`；详版 `P:skills/ponytail/SKILL.md:50-54`
  > "Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken."

### 2.4 输出纪律

- **[P-27]** 代码优先；其后最多三行短句：跳过了什么、什么时候该加。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:68`
  > "Code first. Then at most three short lines: what was skipped, when to add it."
- **[P-28]** 不写散文：无小论文、无功能导览、无设计笔记；解释比代码长就删掉解释——为简化辩护的段落是把复杂度用散文偷运回来。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:69-71`
  > "No essays, no feature tours, no design notes. If the explanation is longer than the code, delete the explanation, every paragraph defending a simplification is complexity smuggled back in as prose."
- **[P-29]** 用户点名的解释不受限：报告、走查、分阶段笔记不算债，要完整给出；被禁的只是未被请求的散文。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:71-73`
  > "Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not debt, give it in full, the rule is only against unrequested prose."
- **[P-30]** 固定输出模式：`[code] → skipped: [X], add when [Y].`｜`prompt-only`｜`P:skills/ponytail/SKILL.md:75`
  > "Pattern: `[code] → skipped: [X], add when [Y].`"

### 2.5 「绝不懒」护栏（逐条）

- **[P-31]** 理解不可省：阶梯只缩短解法、绝不缩短阅读；跳过理解去交付小 diff 是伪装成效率的危险懒惰。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:97-101`；`P:AGENTS.md:30`
  > "Never lazy about understanding the problem. The ladder shortens the solution, never the reading."
- **[P-32]** 信任边界的输入校验不可省。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:92-95`；`P:AGENTS.md:30`
  > "Never simplify away: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics, anything explicitly requested."
- **[P-33]** 防止数据丢失的错误处理不可省。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:92-95`；`P:AGENTS.md:30`
  > "error handling that prevents data loss"
- **[P-34]** 安全措施不可省。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:92-95`；`P:AGENTS.md:30`
  > "security measures"
- **[P-35]** 无障碍基础不可省。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:92-95`；`P:AGENTS.md:30`
  > "accessibility basics"
- **[P-36]** 真实硬件的校准不可省：时钟会漂、传感器读数会偏、PCA9685 会快几个百分点——要留校准旋钮。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:103-105`；简版 `P:AGENTS.md:30`
  > "Hardware is never the ideal on paper: a real clock drifts, a real sensor reads off, a PCA9685 runs a few percent fast. Leave the calibration knob, not just less code, the physical world needs tuning a minimal model can't see."
- **[P-37]** 用户明确要求的一切不可省；坚持要完整版就照做，不再争辩。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:92-95`；`P:AGENTS.md:30`
  > "User insists on the full version → build it, no re-arguing."

### 2.6 测试底线

- **[P-38]** 没有检查的懒惰代码算未完成：非平凡逻辑（分支、循环、解析器、money/security 路径）留下**唯一一个**可运行检查——assert 式 demo/`__main__` 自检或一个小测试文件，不要框架、不要 fixture、不要按函数分套件；平凡一行免测，YAGNI 也适用于测试。｜`prompt-only`｜`P:skills/ponytail/SKILL.md:107-112`；简版 `P:AGENTS.md:30`
  > "Lazy code without its check is unfinished. Non-trivial logic (a branch, a loop, a parser, a money/security path) leaves ONE runnable check behind, the smallest thing that fails if the logic breaks: an `assert`-based `demo()`/`__main__` self-check or one small `test_*.py`. No frameworks, no fixtures, no per-function suites unless asked. Trivial one-liners need no test, YAGNI applies to tests too."
- **[P-39]** 审查类技能不得把上述自检当冗余删掉：单个 smoke test / assert 式自检是 ponytail 的下限而非 bloat，「绝不可标记删除」。｜`prompt-only`｜`P:skills/ponytail-review/SKILL.md:52-55`
  > "A single smoke test or `assert`-based self-check is the ponytail minimum, not bloat, never flag it for deletion."

### 2.7 留痕闭环（`ponytail:` 注释 → 债务台账 → no-trigger）

- **[P-40]** 标注义务：凡故意砍掉真实能力并留下已知天花板（全局锁、O(n²) 扫描、朴素启发式），必须写 `ponytail:` 注释，注明天花板与升级路径。｜`prompt-only`｜`P:AGENTS.md:28`；详版 `P:skills/ponytail/SKILL.md:64`
  > "- Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and upgrade path."
- **[P-41]** 收割命令固定：`grep -rnE '(#|//) ?ponytail:' .`，跳过 `node_modules`/`.git`/构建产物；每个命中一行台账。｜`prompt-only`｜`P:skills/ponytail-debt/SKILL.md:20`
  > "`grep -rnE '(#|//) ?ponytail:' .`  (add other comment prefixes if your stack uses them)"
- **[P-42]** 台账行格式：`<file>:<line>, <被简化者>. ceiling: <天花板>. upgrade: <重访触发条件>.`，ceiling/upgrade 直接从注释里取。｜`prompt-only`｜`P:skills/ponytail-debt/SKILL.md:29-33`
  > "<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>."
- **[P-43]** 腐烂风险标签：任何没写升级路径/触发条件的标记打 `no-trigger`——这些会静默腐烂。｜`prompt-only`｜`P:skills/ponytail-debt/SKILL.md:35-36`
  > "Flag the rot risk: any `ponytail:` comment that names no upgrade path or trigger gets a `no-trigger` tag, those are the ones that silently rot."
- **[P-44]** 台账结尾必须给两个数：标记总数与无触发条件数；一个都没有时输出固定的「干净」句。｜`prompt-only`｜`P:skills/ponytail-debt/SKILL.md:38`
  > "End with `<N> markers, <M> with no trigger.` Nothing found: `No ponytail: debt. Clean ledger.`"
- **[P-45]** 台账只读；要落盘必须先问，落盘示例名 `PONYTAIL-DEBT.md`。｜`prompt-only`｜`P:skills/ponytail-debt/SKILL.md:42-43`
  > "Reads and reports only, changes nothing. To persist it, ask and it writes the ledger to a file (e.g. `PONYTAIL-DEBT.md`). One-shot."
- **[P-46]** 命令形态与技能同义：`/ponytail-debt` 的 prompt 复述同一规则，并明确 "Report only, change nothing."。｜`prompt-only`｜`P:commands/ponytail-debt.toml:1-2`
  > "Harvest every `ponytail:` comment in this repository into a debt ledger so deferrals do not rot into 'later means never'."

### 2.8 技能族分工（只列不改 / 一次性）

- **[P-47]** `ponytail-review`：只审 diff 的过度工程，一行一 finding、5 个标签（`delete:`/`stdlib:`/`native:`/`yagni:`/`shrink:`）、结尾只给一个指标 `net: -<N> lines possible.`；无可删即 `Lean already. Ship.`；**只列不改**。｜`prompt-only`｜`P:skills/ponytail-review/SKILL.md:18`；`P:skills/ponytail-review/SKILL.md:46`；`P:skills/ponytail-review/SKILL.md:56`
  > "End with the only metric that matters: `net: -<N> lines possible.`"
  > "Does not apply the fixes, only lists them."
- **[P-48]** `ponytail-audit`：把 review 扩到整棵代码树、按砍得最多排序、结尾 `net: -<N> lines, -<M> deps possible.`；一次性、只列不改。｜`prompt-only`｜`P:skills/ponytail-audit/SKILL.md:12-13`；`P:skills/ponytail-audit/SKILL.md:34`；`P:skills/ponytail-audit/SKILL.md:40`
  > "ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank findings biggest cut first."
  > "Lists findings, applies nothing. One-shot."
- **[P-49]** 三个审查类技能的范围边界一致：只审过度工程与复杂度；正确性 bug、安全漏洞、性能**显式出界**，转给普通 review；不申请也不实施修复。｜`prompt-only`｜`P:skills/ponytail-review/SKILL.md:52-55`；`P:skills/ponytail-audit/SKILL.md:38-40`
  > "Scope: over-engineering and complexity only. Correctness bugs, security holes, and performance are explicitly out of scope. Route them to a normal review pass, not this one."
- **[P-50]** `ponytail-gain`：一次性展示基准中位数记分板，并在诚实边界上禁止打印「本仓库省了 X 行/token」——未写的版本没有可减的真实基线，本仓库唯一的真实数字来自 debt 台账。｜`prompt-only`｜`P:skills/ponytail-gain/SKILL.md:13-14`；`P:skills/ponytail-gain/SKILL.md:41-45`
  > "One-shot: do NOT change mode, write flag files, or persist anything."
  > "These are benchmark medians, not this repo. NEVER print a per-repo savings number ("you saved X lines/tokens here"): the unbuilt version was never written, so there is no real baseline to subtract from in a live repo. The only real per-repo figures come from `/ponytail-debt` (a counted ledger), and this card points there instead of inventing one."
- **[P-51]** `ponytail-help`：一次性参考卡（档位、6 个技能触发词、关闭口令、默认档配置），同样不改档、不写 flag、不持久化。｜`prompt-only`｜`P:skills/ponytail-help/SKILL.md:11-12`
  > "Display this reference card when invoked. One-shot, do NOT change mode, write flag files, or persist anything."

### 2.9 载体自身的工具化规则

- **[P-52]** 适配器薄原则：宿主支持 skills/hooks 就指向既有 `skills/`、`hooks/`；只支持项目指令的宿主才复制规则文本，且副本必须与 `AGENTS.md` 对齐。｜`prompt-only`（`docs/`）｜`P:docs/agent-portability.md:37-39`
  > "Keep adapters thin. When a host supports skills or hooks, point it at the existing `skills/` and `hooks/` files. When a host only supports project instructions, keep its copied rule text aligned with `AGENTS.md`."
- **[P-53]** 原生优先目录化：平台已能做的一切做成可查表（HTML/CSS/JS/Swift/Node/Python/DB），裁决线是「原生确实不够时依赖才配得上位置，那时再装、不是提前装」。｜`prompt-only`（`docs/`）｜`P:docs/platform-native.md:3`；`P:docs/platform-native.md:211`
  > "When the native solution is genuinely insufficient (old browser support, edge cases it doesn't handle, ergonomics that matter at scale), the library earns its place. Install it then, not before."
- **[P-54]** 钩子永不阻断、失败静默：flag 尽力而为，stdin 不结束时 1 秒兜底退出（Windows PowerShell 包裹会吞管道 JSON 导致挂死）。｜`script·gate`（行为约定）｜`P:hooks/ponytail-mode-tracker.js:152-153`；`P:hooks/ponytail-activate.js:57`
  > "Mirrors the best-effort, never-block contract the other lifecycle hooks already follow."
  > "// Silent fail -- flag is best-effort, don't block the hook"
- **[P-55]** 子代理注入 fail-open：matcher 非法、`agent_type` 缺失/解析失败、stdin 错误或超时，一律仍然注入，绝不静默丢掉人格。｜`script·gate`｜`P:hooks/ponytail-subagent.js:50-52`
  > "Missing/unparseable agent_type, a stdin error, or the timeout all fail open (inject), so scoping never silently drops the persona."
- **[P-56]** 宿主已有常开规则文件（Cursor `.cursor/rules/ponytail.mdc`）时，hooks 主动退让，只发一条提示，避免注入第二份可能矛盾的规则副本。｜`script·gate`｜`P:hooks/ponytail-runtime.js:59-62`；`P:hooks/ponytail-mode-tracker.js:29-39`
  > "it is in the workspace the hooks step back instead of injecting a second, possibly contradicting, copy (#817)."
- **[P-57]** 投影一致性 gate：`AGENTS.md` 去掉末段自指括号后的正文是 canonical，7 份宿主投影必须与它逐字相等，否则脚本 exit 1。｜`script·gate`｜`P:scripts/check-rule-copies.js:15-16`；`P:scripts/check-rule-copies.js:33-35`
  > "if (actual !== canonical) {"
- **[P-58]** 不变量 canary：9 条承重短语必须同时存在于 `skills/ponytail/SKILL.md` 与 `AGENTS.md`，改规则措辞就会触发——这是「把改动传播到所有副本」的提醒。｜`script·gate`｜`P:scripts/check-rule-copies.js:44-58`；`P:scripts/check-rule-copies.js:40-43`
  > "const INVARIANTS = ["
  > "// a rule's wording trips this, which is the reminder to propagate it everywhere."
- **[P-59]** CI 守门顺序固定：查规则副本 → 查版本一致 → 跑测试。｜`script·gate` + `test·gate`｜`P:.github/workflows/test.yml:29-36`
  > "- name: Check rule copies"
  > "- name: Check version consistency"
  > "- name: Run tests"
- **[P-60]** 版本一致性：8 个版本文件必须共享同一个 pinned `X.Y.Z`；在打 tag 的 CI 上该版本还必须等于 tag。｜`script·gate`｜`P:scripts/check-versions.js:9-11`；`P:scripts/check-versions.js:21-30`；`P:scripts/check-versions.js:64-71`
  > "//   2. on a release-tag CI run, that shared version must equal the tag."
- **[P-61]** 生成物只改 frontmatter：`.openclaw/skills/` 的正文逐字复制自 `skills/`，提交物过期即测试失败。｜`test·gate`｜`P:scripts/build-openclaw-skills.js:7-8`；`P:tests/openclaw-skills.test.js:17-20`
  > "verbatim from skills/<name>/SKILL.md so the ruleset never drifts; only the frontmatter is rewritten."
  > "assert.ok(onDisk.endsWith(sourceBody(name)), 'body drifted from skills/' + name);"
- **[P-62]** 第二组不变量 canary（Gemini 宿主）：`contextFileName` 指向的文件必须含 3 条承重短语，且 `hooks/hooks.json` **必须不存在**（Gemini 会自动加载该路径）。｜`test·gate`｜`P:tests/gemini-extension.test.js:34-38`；`P:tests/gemini-extension.test.js:75`；`P:tests/gemini-extension.test.js:85-90`
  > "assert.ok(context.includes(phrase), `context file missing rule invariant: "${phrase}"`);"
  > "test('Gemini cannot auto-discover Claude/Codex hook events', () => {"
- **[P-63]** 测试入口固定：`npm test` = 16 个顶层测试文件 + pi-extension + ponytail-mcp 三段串行。｜`test·gate`｜`P:package.json:38`
  > ""test": "node --test tests/*.test.js && npm test --prefix pi-extension && npm test --prefix ponytail-mcp""

## §3 强制力与机制层真相（对应问题 ⑪）

### 3.1 hook 能不能真的阻断？不能——证据是「零命中 + 明确的永不阻断契约」

命令（均在快照根执行，`-I` 跳过二进制）：

| 检查 | 命令 | 命中数 |
|---|---|---|
| 退出码 2 = 阻断 | `grep -rnF -e 'exit(2)' -e 'permissionDecision' -e 'permissionDecisionReason' --exclude-dir=.git -I .` | **0** |
| 拒绝/deny 语义 | `grep -rnF 'deny' --exclude-dir=.git -I .` | **1**（`P:docs/cursor-hooks.md:121`，说的是宿主能力："`subagentStart` can only allow or deny"，不是说 ponytail 会 deny） |
| hook 进程退出码 | `grep -rn 'process\.exit(' hooks/` 归并 | **9 次全部是 `process.exit(0)`**，0 次非零 |
| 唯一的阻断语义说明 | — | `P:docs/cursor-hooks.md:63-64` |

> "Cursor treats exit code 2 as "block" and other non-zero codes as fail-open; ponytail never blocks anything."

hook 的输出形状只有注入上下文，没有决策字段：`P:hooks/ponytail-runtime.js:80-131` 逐宿主分支只写 `additionalContext`（Claude/Codex/Qoder）、`additional_context`（Cursor）、`{ }`（Copilot 非 SessionStart）；唯一非上下文输出是 Codex 的 `systemMessage: PONYTAIL:<MODE>`。

**注册面**：`hooks/` 有 6 个 `.js`，但只有 3 个是生命周期入口——`ponytail-activate.js`（SessionStart/sessionStart）、`ponytail-mode-tracker.js`（UserPromptSubmit/beforeSubmitPrompt）、`ponytail-subagent.js`（SubagentStart/PreToolUse `task|Task`）；`ponytail-config.js`、`ponytail-instructions.js`、`ponytail-runtime.js` 是被 require 的库（`P:hooks/claude-codex-hooks.json:3-39`、`P:hooks/copilot-hooks.json:4-19`、`P:hooks/cursor-hooks.json:4-15`、`P:hooks/qoder-hooks.json:4-24`）。唯一挂在工具调用拦截位（Qoder `PreToolUse`）的那个也只输出 `additionalContext`（`P:hooks/ponytail-subagent.js:23-25`），不带 decision/permission 字段——即**没有任何 hook 具备拒绝能力**。

所以 `hook` 这一 token 的真实强度 = **把规则文本送到模型眼前 + 跟踪档位**，不是执法。`P:docs/agent-portability.md:13` 从另一侧佐证了 hook 输出的边界：某些宿主连注入都做不到，ponytail 就不会用它——"Grok lifecycle hooks are not used because passive hook output cannot inject instructions."

### 3.2 真正会变红的是哪一层

以 `npm test` + CI（`P:.github/workflows/test.yml:29-36`）为准，只有下列五类 gate 会让整条流水线变红：

**a) 副本一致性（`script·gate`）**——canonical = `AGENTS.md` 去掉末段自指括号（`P:scripts/check-rule-copies.js:15-16`），7 份投影逐字比较（`:19-27`、`:31-37`），任一漂移即 `process.exit(1)`（`:71-74`）。本次实测（§7 命令 `S4`）：7/7 `MATCH`，canonical 2491 字符（UTF-8 2494 字节）。

**b) 不变量 canary，9 条（`script·gate`）**——`P:scripts/check-rule-copies.js:44-58` 的 `INVARIANTS` 数组，逐字 9 条：

| # | 逐字文本 | 数组行 |
|---|---|---|
| 1 | `in this codebase` | `:45` |
| 2 | `naive heuristic` | `:46` |
| 3 | `ONE runnable check` | `:47` |
| 4 | `flimsier algorithm` | `:48` |
| 5 | `input validation at trust boundaries` | `:53` |
| 6 | `prevents data loss` | `:54` |
| 7 | `security` | `:55` |
| 8 | `accessibility` | `:56` |
| 9 | `Lazy code without its check is unfinished` | `:57` |

判定循环要求这 9 条**同时**出现在 `skills/ponytail/SKILL.md` 与 `AGENTS.md`（`P:scripts/check-rule-copies.js:60-69`），失败打印 `is missing rule invariant:` 并 exit 1；成功打印（`P:scripts/check-rule-copies.js:76`）：

> "Rule copies match AGENTS.md; ${INVARIANTS.length} rule invariants present in SKILL.md and AGENTS.md."

实测运行输出：`Rule copies match AGENTS.md; 9 rule invariants present in SKILL.md and AGENTS.md.`（exit 0）。

**c) 第二组 canary，3 条（`test·gate`）**——`P:tests/gemini-extension.test.js:34-38` 的 `RULE_INVARIANTS` = `lazy senior`、`input validation at trust boundaries`、`naive heuristic`；断言 `contextFileName`（Gemini manifest 指向 `AGENTS.md`）含这三条（`:70-77`），并反向断言 `hooks/hooks.json` 不存在（`:85-90`）。

**d) 版本一致（`script·gate`）**——8 个版本文件同版本（`P:scripts/check-versions.js:21-30`），tag 运行还要等于 tag（`:64-71`）；实测输出 `All 8 version files pinned at 4.10.0.`（exit 0）。

**e) 生成物守卫（`test·gate`）**——`.openclaw/skills/*` 6 份正文必须等于 `skills/*` 正文（`P:tests/openclaw-skills.test.js:17-20`）；同属第三步的还有 `tests/cursor-hooks.test.js` 等 16 个顶层测试文件（`P:package.json:38`）。

### 3.3 结论：分层强度

1. **规则正文（阶梯、护栏、输出纪律、测试底线）零机械 gate**——只有 9+3 条不变量短语作抽样 canary，措辞改写只要保留这 12 个短语就全绿（其中 `security`/`accessibility`/`in this codebase` 是极易被无关文本满足的泛词，见 §6.3）。
2. **激活与档位由 `hook` 送达**，不阻断、fail-open、永不挂住会话。
3. **会变红的是「副本/不变量/版本/生成物/测试」五个 mechanical gate**，不是规则本身是否被遵守。

## §4 多宿主投影一致性机制与 CI 判据（对应问题 ⑫）

- **投影清单与数量**：7 份（`P:scripts/check-rule-copies.js:19-27`）——`.cursor/rules/ponytail.mdc`、`.windsurf/rules/ponytail.md`、`.clinerules/ponytail.md`、`.agents/rules/ponytail.md`、`.qoder/rules/ponytail.md`、`.github/copilot-instructions.md`、`.kiro/steering/ponytail.md`。
- **归一化规则**：`AGENTS.md` 删掉末段自指括号（`P:AGENTS.md:32`）得 canonical；两侧都做 CRLF→LF、`trim()`，`.mdc`/`.kiro` 另去 frontmatter（`P:scripts/check-rule-copies.js:7-13,19-27`）。因此 **投影不含 `AGENTS.md:32` 的自指句**，`AGENTS.md` 比投影多 2 行（32 vs 30）。
- **实测**：7/7 与 canonical 逐字节相等，各 2491 字符 / 2494 UTF-8 字节（§7 命令 `S4`）。
- **生成式投影**：`.openclaw/skills/*/SKILL.md`（6 份）由 `scripts/build-openclaw-skills.js` 从 `skills/` 生成，只重写 frontmatter、正文必须逐字（`P:scripts/build-openclaw-skills.js:7-8`），由 `test·gate` 判定过期（`P:tests/openclaw-skills.test.js:12-20`）。
- **同 prompt 多载体**：6 个 `commands/*.toml`（2 行/个，TOML `description`+`prompt`）与 6 个 `.opencode/command/*.md`（5 行/个，frontmatter+同文 prompt）是同一指令的两种宿主形态；`commands/ponytail.toml` 用 `{{args}}`，OpenCode 版用 `$ARGUMENTS`。
- **CI 判据**：`.github/workflows/test.yml:29-36` 三步固定顺序——`node scripts/check-rule-copies.js` → `node scripts/check-versions.js` → `npm test`；前两步是纯脚本 gate，第三步展开为 16+2+1 个测试文件。
- **缺口**：`skills/ponytail/SKILL.md` 与 `AGENTS.md` 之间**没有逐字 gate**（脚本注释自认："SKILL.md is the runtime source of truth and is longer than the compact body, so it cannot be byte-compared"，`P:scripts/check-rule-copies.js:40-43`），二者的一致性只靠 9 条短语 canary 维持。

## §5 覆盖表

行数为 `wc -l` 实测（命令见 §7 `S5`）。「读法」区分：**全文**=逐行读完；**抽查**=按 grep/head/tail 取证，未逐行读。

### 5.1 brief 指定范围内的载体

| 载体 | 行数 | 读法 | 承载 |
|---|--:|---|---|
| `.agents/rules/ponytail.md` | 30 | 全文 | 7 份投影之一（= canonical） |
| `AGENTS.md` | 32 | 全文 | canonical 正文 + `:32` 自指句 |
| `skills/ponytail/SKILL.md` | 120 | 全文 | 主规则（阶梯/护栏/输出/档位/边界） |
| `skills/ponytail-review/SKILL.md` | 57 | 全文 | 审查族：只列不改 + 标签 + 净行数 |
| `skills/ponytail-audit/SKILL.md` | 41 | 全文 | 全仓审查 + 净行数/去依赖 |
| `skills/ponytail-debt/SKILL.md` | 44 | 全文 | 留痕闭环（命令/格式/no-trigger） |
| `skills/ponytail-gain/SKILL.md` | 50 | 全文 | 一次性记分板 + 诚实边界 |
| `skills/ponytail-help/SKILL.md` | 71 | 全文 | 档位/技能/口令/默认档卡 |
| `hooks/ponytail-activate.js` | 115 | 全文 | SessionStart 注入 + statusline 提示 |
| `hooks/ponytail-config.js` | 169 | 全文 | 档位解析、关闭口令判定 |
| `hooks/ponytail-instructions.js` | 98 | 全文 | 规则文本构造 + 档位过滤 + fallback |
| `hooks/ponytail-mode-tracker.js` | 155 | 全文 | 档位跟踪、切换、Qoder/Cursor 特例 |
| `hooks/ponytail-runtime.js` | 144 | 全文 | 宿主检测 + 输出形状 |
| `hooks/ponytail-subagent.js` | 77 | 全文 | 子代理注入 + fail-open |
| `hooks/claude-codex-hooks.json` | 41 | 全文 | 3 个事件注册（无阻断位） |
| `hooks/copilot-hooks.json` | 21 | 全文 | 2 个事件注册 |
| `hooks/cursor-hooks.json` | 17 | 全文 | 2 个事件注册 |
| `hooks/qoder-hooks.json` | 26 | 全文 | UserPromptSubmit + PreToolUse |
| `hooks/ponytail-statusline.sh` | 18 | 抽查 | 状态栏徽标（非规则） |
| `hooks/ponytail-statusline.ps1` | 24 | 抽查 | 同上（Windows） |
| `commands/*.toml`（6 个） | 2×6 | 全文 | 同一 6 条指令的 TOML 形态 |
| `docs/agent-portability.md` | 49 | 全文 | 宿主适配表 + 适配器薄原则 |
| `docs/cursor-hooks.md` | 196 | 全文 | Cursor 契约、退出码 0 证据、验证记录 |
| `docs/platform-native.md` | 211 | 全文 | 原生优先可查表 + 裁决线 |
| `scripts/check-rule-copies.js` | 76 | 全文 | 副本一致性 + 9 条不变量 gate |
| `scripts/check-versions.js` | 78 | 全文 | 8 文件版本 + tag gate |
| `.github/workflows/test.yml` | 36 | 全文 | 三步 CI 判据 |
| `.github/workflows/publish.yml` | 24 | 全文 | OIDC 发布（非规则） |
| `benchmarks/README.md` | 108 | 全文 | `[benchmark]` 数字与诚实注 |
| `examples/README.md` | 17 | 全文 | 示例索引（数字属 `[benchmark]`） |
| `examples/*.md`（11 个示例） | 71+211+31+156+35+58+62+37+272+390+41 | 抽查（标题/标记/结论行） | 阶梯各级的 worked example |
| 7 份宿主投影：`.cursor/rules/ponytail.mdc`、`.windsurf/rules/ponytail.md`、`.clinerules/ponytail.md`、`.agents/rules/ponytail.md`、`.qoder/rules/ponytail.md`、`.github/copilot-instructions.md`、`.kiro/steering/ponytail.md` | 36 / 30 / 30 / 30 / 30 / 30 / 35 | 全文（含 frontmatter 的两个） | 各宿主规则投影，7/7 与 canonical 逐字相等（§4） |

### 5.2 同属规则集、brief 未逐项列出的载体（列出以免"漏载体"被误读为未覆盖）

| 载体 | 行数 | 读法 | 承载 |
|---|--:|---|---|
| `.openclaw/skills/*/SKILL.md`（6 个） | 108+52+47+41+37+70 | 抽查（对 `skills/` 逐字源、生成式） | 生成式投影（`test·gate` 守） |
| `.opencode/command/*.md`（6 个） | 5×6 | 全文 | 命令形态副本（与 `commands/*.toml` 同文） |
| `.opencode/plugins/ponytail.mjs` + `ponytail-frontmatter.cjs` | 99 + 23 | 抽查 | 每轮注入 + `/ponytail` 持久化 / frontmatter 处理 |
| `pi-extension/index.js`、`__init__.py`+`plugin.yaml`、`ponytail-mcp/instructions.js`+`index.js` | 211 / 217+21 / 26+52 | 抽查 | 三套注入器，均复用同一规则构造器（`P:pi-extension/index.js:209`、`P:__init__.py:202`、`P:ponytail-mcp/instructions.js:25`） |
| `scripts/` 侧：`build-openclaw-skills.js` 60、`cursor-hooks.js` 135、`uninstall.js` 77、`publish-openclaw-skills.js` 75 | 347 合计 | 生成器全文，其余抽查 | 生成器（正文逐字约束）、Cursor hooks 安装合并、卸载（含 3 处 `ponytail:` 标记）、发布 |
| `tests/*.test.js`（16 个） | 2070 合计 | 抽查（其中 2 个全文） | 规则侧断言：`gemini-extension`、`openclaw-skills` |
| `README.md` | 395 | 抽查（标题/数字/赞助段） | 展示层；`[benchmark]` 数字源 |

本节判据：5.1 每一行都给出实测行数；5.2 中"抽查"项已说明证据粒度，未把抽查冒充全文。

## §6 诚实清单

### 6.1 未证实项

- **模型是否真的遵守规则**：本文件只证明了规则文本**被送达**（§3.1）与副本**被守住**（§3.2）；行为遵从无证据，仓库自己也只敢声明"Cursor 契约"级别（`P:docs/cursor-hooks.md:194-196`：a pass "says nothing about how often Cursor follows them"）。
- **Cursor 实时验证未完成**：源仓库自带的验证表有两项未跑——步骤 5（子代理）标为 `not executed`，步骤 6（规则共存）标为 `not yet run`（`P:docs/cursor-hooks.md:191-192`）。
- **`skills/*` 与 `AGENTS.md` 的语义等价**：无 gate 覆盖（§4 缺口），本次只验证了 9+3 条短语存在，未逐句比对 120 行 SKILL 与 30 行 canonical。

### 6.2 自相矛盾与陈旧数字（均为一手来源内部矛盾）

- **版本文件数**：脚本注释写 "seven files"，数组实际 **8** 项，运行时输出也是 `All 8 version files pinned`。`P:scripts/check-versions.js:2-3` vs `:21-30` vs `:78`。
- **成本收益数字三处不一致**：`P:README.md:33` "~20% cheaper"；`P:benchmarks/README.md:62` "costs 42-75% less"；`P:skills/ponytail-gain/SKILL.md:32` "23–53% ▼ 47–77%"。上游**自己的**复核文件已判 47–77% 过时并建议改口径——`P:benchmarks/results/2026-06-17-cost-verification.md:56` "**Range: 42-75% cheaper** (vs the published 47-77%)"、`:82` "Recommend changing the README headline from "47-77% cheaper" to **42-75% cheaper**"——但发版快照里 gain 技能仍印 47–77%。`[benchmark]`，不计入规则。
- **债务收割命令覆盖不到 HTML 注释式标记**：debt 技能只认 `#`/`//` 前缀（`P:skills/ponytail-debt/SKILL.md:20`，并自注 "add other comment prefixes if your stack uses them"），但仓库自身就用了 `<!-- ponytail: ... -->`——`grep -rnF '<!-- ponytail:' --exclude-dir=.git .` 命中 4 处（`README.md:69`、`examples/modal-dialog.md:45`、`README.ko.md:58`、`README.es.md:58`），全部**不会**被文档命令收割。这是"约定与实现不一致"的实证，不是猜测。
- **`ponytail:` 标记数口径**：必须带命令说话。`git grep -nE '(#|//) ?ponytail:' -- . ':(exclude)tests' | grep -v '\.md:' | wc -l` = **21**（这就是前轮"21 处"的口径：注释前缀、排除 `tests/`、排除 `.md`）；同一命令去掉 `.md:` 过滤 = 31；`grep -rnE '(#|//) ?ponytail:' --exclude-dir=.git .` = **32**（含 `.md` 与 `tests/`）；其中 `.md` 占 10 条、`tests/` 占 1 条。**本文件不采用无命令的"标记数"**。

### 6.3 缺口

- **规则正文无机械 gate**（§3.3）：唯一守卫是 12 条短语，其中 `security`、`accessibility`、`in this codebase` 是泛词，任何含该词的无关文本都能满足——canary 的精度低于其宣称的"承重规则不变量"。
- **`hook` 无法阻断**，因此"绝不做 X"类条款（护栏、范围边界）在机制上与其他文本同强度，全靠模型自觉。
- **Cursor 子代理拿不到规则**：`subagentStart` 只能 allow/deny（`P:docs/cursor-hooks.md:121`），Cursor 上子代理的规则覆盖为 0；Claude Code 侧由 `SubagentStart` 钩子补上（`P:hooks/ponytail-subagent.js:1-11`）。
- **`.agents/rules/ponytail.md` 既是"投影"又是"独立载体"**：同一文件在 §4 的 7 份清单与 brief 的载体清单里各出现一次，容易被重复计数。
- **examples 的 11 个示例中 5 个没有 `ponytail:` 标记**（csv-sum/debounce/email-validation/rate-limit/react-countdown），它们的"懒惰"由结论行的 `[benchmark]` 数字承担——即示例层的留痕闭环并不一致。

### 6.4 与前轮（`543e9b5` 的 `findings/01-ponytail.md`）的出入

| 项 | 前轮值 | 本次重测 | 依据 |
|---|---|---|---|
| 不变量条数 | 前轮正文写「8 条」，同轮 `99-verification.md` 判为 9 | **9**（`check-rule-copies.js:44-58`），运行输出亦为 9；另有 Gemini 侧 **3** 条（`P-62`） | `S1` |
| `check-rule-copies.js` 引文行区间 | 前轮把末行引文注为 `71-74` | 该句实为 **`:76`**（`71-74` 是失败分支 `if (failed) { … process.exit(1); }`） | `S3` |
| `ponytail:` 标记数 | 前轮写「21 处（排除测试）」，口径未写全 | **21 = 注释前缀 + 排除 `tests/` + 排除 `.md`**；同族口径另有 31/32/10/1 | `S6` |
| 规则条数 | 前轮 P 计 48 条（编号 R01–R48） | 本次按 12 项必答重构为 **63 条**（P-01–P-63），并按 §0.4 统一为四 token 制（`prompt-only`/`hook`/`script·gate`/`test·gate`） | §2 |
| 强制形式词表 | 前轮用 `prompt-skill`/`hook`/`脚本·gate`/`仅文档` | 本轮按 brief 统一为 `prompt-only`/`hook`/`script·gate`/`test·gate` | §0.4 |
| 规模 | 166 文件 | **166**（复测一致） | `S5` |

## §7 自审

### 7.1 引文包含性核对（全量，非抽样）

规则：对本文档**每一条** `- **[P-NN]**` 条目，取该行全部 `P:<path>:<line|a-b>`；紧随的每个 `> ` 行是一个引文片段（行内 `…` 再切分）。比对前两侧都做同一套归一化：`trim` → 去行首 `//`/`#`/`*`/`<!--`/`-->` → 收白（因此被引的跨行注释按散文连接）；引文两侧的包裹双引号在比对时剥掉。要求**每个片段**至少被**一个**被引区间包含。另做两项全量校验：全文每个 `P:` 引用都能解析到快照内真实存在的行；§3.2b 表里 9 行不变量的 `:45`–`:57` 逐行命中。

```js
// S0: node /tmp/ponytail-audit.mjs findings/01-ponytail.md   （把本代码块存成该文件后运行）
import fs from 'node:fs';
const root = '.refs/ponytail/', doc = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const ws = s => s.replace(/\s+/g, ' ').trim();
const debar = s => ws(s.trim().replace(/^(?:\/\/|#|\*|<!--|-->)\s?/, ''));   // 去行首注释标记
const cache = new Map();
const region = (p, a, b) => {                                               // 被引区间：归一化后连接
  const k = `${p}:${a}-${b}`;
  if (!cache.has(k)) {
    if (!fs.existsSync(root + p)) throw new Error('missing path ' + p);
    const L = fs.readFileSync(root + p, 'utf8').replace(/\r\n/g, '\n').split('\n');
    if (b > L.length) throw new Error(`${p}:${b} beyond EOF(${L.length})`);
    cache.set(k, L.slice(a - 1, b).map(debar).filter(Boolean).join(' '));
  }
  return cache.get(k);
};
const unquote = s => { const t = ws(s); return t.length > 1 && t.startsWith('"') && t.endsWith('"') ? ws(t.slice(1, -1)) : t; };
let items = 0, cites = 0, quoted = 0, frags = 0, bad = 0;
for (let i = 0; i < doc.length; i++) {
  if (!/^- \*\*\[P-\d+\]\*\*/.test(doc[i])) continue;
  items++;
  const refs = [...doc[i].matchAll(/P:([^\s`；、]+?):(\d+)(?:-(\d+))?/g)].map(x => [x[1], +x[2], x[3] ? +x[3] : +x[2]]);
  cites += refs.length;
  const q = [];
  for (let j = i + 1; j < doc.length && /^\s*>/.test(doc[j]); j++) q.push(doc[j].replace(/^\s*>\s?/, ''));
  if (!q.length) { console.log('NOQUOTE ' + doc[i].slice(0, 40)); continue; }
  quoted++;
  for (const line of q) for (const part of line.split('…')) {                // 每条引文行 = 一个片段
    const f = debar(unquote(part));
    if (!f) continue;
    frags++;
    if (!refs.some(r => region(...r).includes(f))) { bad++; console.log(`MISS [${doc[i].slice(2, 30)}] frag="${f.slice(0, 100)}"`); }
  }
}
for (const m of doc.join('\n').matchAll(/P:([^\s`；、|]+?):(\d+)(?:-(\d+))?/g))        // 全文引用可解析性
  try { region(m[1], +m[2], m[3] ? +m[3] : +m[2]); } catch (e) { bad++; console.log(`BADREF ${m[0]} :: ${e.message}`); }
let inv = 0;
for (const l of doc) {                                                              // §3.2b 九行不变量
  const m = l.match(/^\| \d+ \| `(.+?)` \| `:(\d+)` \|$/);
  if (!m) continue;
  inv++;
  if (!region('scripts/check-rule-copies.js', +m[2], +m[2]).includes(ws(m[1]))) { bad++; console.log(`MISS inv ${m[2]}: ${m[1]}`); }
}
console.log(`items=${items} citations=${cites} quoted=${quoted} fragments=${frags} invariants=${inv} miss=${bad}`);
process.exit(bad ? 1 : 0);
```

**实测结果**：`items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`，exit 0 —— 63 条规则、111 个可解析引用、63 条带逐字引文、78 个引文片段、9 行不变量表全部命中，0 处失败。

**本轮被自审抓到的两处缺陷**（已修）：① 归一化最初只在行首识别注释标记，缩进注释（`hooks/ponytail-mode-tracker.js:55`）匹配不到，导致 P-09 假失败——修正为 `trim` 后再识别，并把该归一化写进上面的脚本与规则；② P-60 的引文实际在 `scripts/check-versions.js:11`，最初只引了 `:21-30`/`:64-71`，属"引文与区间不符"，已补 `:9-11`。

### 7.2 计数复测（每条数字都用自己的命令重测）

| 命令 | 结果 |
|---|---|
| `S1` `node scripts/check-rule-copies.js` | `Rule copies match AGENTS.md; 9 rule invariants present in SKILL.md and AGENTS.md.` exit 0 |
| `S2` `node scripts/check-versions.js` | `All 8 version files pinned at 4.10.0.` exit 0 |
| `S3` `sed -n '71,74p;76p' scripts/check-rule-copies.js` | `71-74` = `if (failed) { … process.exit(1); }`；末行消息在 **76** |
| `S4` 7 份投影归一化后与 canonical 比对（CRLF/trim/去 frontmatter） | `copies listed: 7`，7×`MATCH`，canonical 2491 字符 / 2494 UTF-8 字节 |
| `S5` `git ls-files \| wc -l`；`wc -l` 逐文件 | 166 文件；§5 表内行数逐一实测 |
| `S6` `git grep -nE '(#\|//) ?ponytail:' -- . ':(exclude)tests' \| grep -v '\.md:' \| wc -l` | 21（同族：去掉 `.md:` 过滤 31；`grep -rnE … --exclude-dir=.git` 32；`.md` 10；`tests/` 1） |
| `S7` `grep -rnF -e 'exit(2)' -e 'permissionDecision' --exclude-dir=.git -I . \| wc -l`；`grep -rnF 'deny' --exclude-dir=.git -I .` | 0；`deny` **1** 处（`docs/cursor-hooks.md:121`） |
| `S8` `grep -rn 'process\.exit(' hooks/` | 9 处，全部 `exit(0)` |
| `S9` `grep -rnF '<!-- ponytail:' --exclude-dir=.git .` | 4 处（2 处在排除的译本内） |
| `S10` `ls tests/*.test.js \| wc -l`；`ls -d skills/*/` | 16 个测试文件；6 个技能目录 |

本节判据：S0 的 `miss=0` 且每条 §6/§5 的计数都能在上表找到对应命令；任一不满足即为未完成。

## δ 修正记录（after 99-verification §2）

对 `findings/99-verification.md` §2.1 三条必修的定点修正；行号为**修正前**位置，除下列四处文本外全文未改（不重写、不重排）。

**δ.1 单位错误（V01-07；`01:243`、`01:281`、`01:441`）**
- `:243` `…canonical 2491 字节。` → `…canonical 2491 字符（UTF-8 2494 字节）。`
- `:281` `…各 2491 字节（§7 命令 \`S4\`）。` → `…各 2491 字符 / 2494 UTF-8 字节（§7 命令 \`S4\`）。`
- `:441` `…canonical 2491 字节` → `…canonical 2491 字符 / 2494 UTF-8 字节`
- 复跑：`cd .refs/ponytail && python3 -c "import re;s=open('AGENTS.md',encoding='utf-8').read().replace('\r\n','\n').strip();c=re.sub(r'\n\n\(Yes, this file also applies[\s\S]*?\)$','',s).strip();print(len(c),len(c.encode()))"` → `2491 2494`（差值 = `—` U+2014 +2B、`²` U+00B2 +1B；旧值 2491 是 `len()` 的字符数，量纲写错）

**δ.2 P-09 第二锚点（V01-14；`01:71`）**
- `:71` `P:hooks/ponytail-config.js:16-18` → `P:hooks/ponytail-config.js:79-81`、`P:hooks/ponytail-config.js:91`
- 复跑：`grep -n 'VALID_MODES\|RUNTIME_MODES\|valid default' .refs/ponytail/hooks/ponytail-config.js` → 旧锚点 `P:hooks/ponytail-config.js:17` 为 `VALID_MODES = ['off', 'lite', 'full', 'ultra', 'review']`（含 `review`，读者会读出相反结论）；支持句在 `P:hooks/ponytail-config.js:79-81`（`review is a session-only mode, never a valid default (#377)`）与 `P:hooks/ponytail-config.js:91`（`config.defaultMode` 按 `RUNTIME_MODES` 判定）

**δ.3 裸引用补齐（V01-15；`01:259`）**
- `:259` `（\`:60-69\`）` → `（\`P:scripts/check-rule-copies.js:60-69\`）`；`（\`:76\`）` → `（\`P:scripts/check-rule-copies.js:76\`）`（同段 `01:261` 的引文逐字正确，未改）

**δ.4 修正后复跑（本机执行）**
- S0（§7.1 代码块原样提取后运行）：`items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`，exit 0（P-09 新增 1 个、`:259` 新增 2 个可解析引用，均通过"全文引用可解析性"校验）
- S4：`copies=7 matches=7 canonical_chars=2491 canonical_utf8_bytes=2494`
- 篇幅（task-5 修正后当时）：`wc -l` = 471 行（δ 小节 22 行；其后 δ.5 修正使文件增至 472 行 / δ 23 行，故本行 471/22 只代表当时状态）；末字节 `0a`，恰一个结尾换行；sha256 见 Lead 汇报（本行自引会改变自身哈希，故不写死）
- δ.5（task-9，delta 复核残余项；task-11 内联收尾）：`:430` 的 §7.1 结果行两处计数（代码跨度内 `citations=` 的值、散文计数）由 delta 复核指出的旧值同步为 `111`，其余文字与标点未动——该行现为 `items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`、63 条规则、111 个可解析引用；复跑 §7.1 自审输出与之一致（exit 0）；自包含复跑：`grep -nE '1[1]0' findings/01-ponytail.md` → 0 命中（旧值以字符类等价写出，否则本行会自命中并使该检查恒非零；δ.4 亦已加时间锚点标注 471/22 为 task-5 当时状态），本文档现 `wc -l` = 472 行（δ 小节 23 行）
