# 01 — ponytail 规则集分析（lazy senior dev mode）

> 中文为分析者转述；`>` 引用块内为保证逐字的英文原文（跨行折行处以单空格连接，属允许的空白差异）。
> 每条规则均带 `path:line` 出处，行号已逐条复核（见 §8）。凡属基准/营销数字一律标 `[benchmark]`，不计入规则。

## 0 溯源

| 项 | 值 |
|---|---|
| 仓库 | `DietrichGebert/ponytail`（本地只读克隆 `.refs/ponytail`） |
| 提交 | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`（`git rev-parse HEAD` 实测） |
| 版本 | `package.json:3` `"version": "4.10.0"` |
| 许可 | MIT（`LICENSE:1-3`、`package.json:6`） |
| 规模 | `git ls-files` 共 166 个文件 |
| 分析范围 | 规则载体：`.agents/rules/ponytail.md`(30 行) / `AGENTS.md`(32) / `skills/ponytail/SKILL.md`(120) / 5 个子技能 SKILL.md(41+57+44+50+71) / `hooks/*.js`(115+169+98+155+144+77) / `hooks/*.json` / `commands/*.toml` / `docs/{agent-portability,platform-native}.md` / `scripts/check-*.js` / `.github/workflows/test.yml` / `benchmarks/{README.md,behavior.js}` / `examples/README.md` + 2 个示例 / 7 个宿主的规则投影 |
| 引用基线 | 行号取自本地克隆当前 commit；引用字面以 `read`/`grep -n` 复核（§8） |
| 排除 | `assets/`、`README.es.md`/`README.ko.md`、安装与赞助章节、benchmark 数字（标 `[benchmark]`） |

## 1 一句话定位

把"懒惰的资深工程师"人格化为一条**自上而下、命中即停的 7 级懒惰阶梯**，外加一份"绝不可懒"的安全护栏清单与一套只做报告不做修改的审查子技能族；核心断言是"最好的代码是没被写下的代码"（`AGENTS.md:3`）。

## 2 规则清单

分类：`简洁度阶梯` / `安全` / `依赖` / `测试` / `沟通` / `工作流` / `工具化`
强制形式：`prompt-skill`（文本规则，靠模型遵守） / `hook`（宿主生命周期注入） / `脚本·gate`（可执行校验） / `仅文档`

### A. 定位与模式

- **[R01]** 身份前提：你是懒惰的资深工程师，懒 = 高效而非粗心，最好的代码是永不写下的代码。｜工作流｜prompt-skill｜`AGENTS.md:3` ≡ `.agents/rules/ponytail.md:3`；详版 `skills/ponytail/SKILL.md:22-24`
  > "You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written."
- **[R02]** 模式常驻：每一轮响应都生效、不准漂回过度构建；默认档 `full`；仅 "stop ponytail" / "normal mode" 关闭。｜工作流｜prompt-skill + hook｜`skills/ponytail/SKILL.md:28-30`；注入实现 `hooks/ponytail-instructions.js:87-88`
  > "ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if unsure. Off only: "stop ponytail" / "normal mode". Default: **full**."
- **[R03]** 三档强度语义：`lite` 照做但用一行给出更懒的替代方案；`full` 强制阶梯；`ultra` YAGNI 极端主义、先删除后新增、边交付一行边挑战需求。｜工作流｜prompt-skill + hook｜`skills/ponytail/SKILL.md:79-83`；卡面 `skills/ponytail-help/SKILL.md:18-20`
  > "| **Full** | `/ponytail` | The ladder enforced: YAGNI → stdlib → native → one line → minimum. Default. |"
  > "| **Ultra** | `/ponytail ultra` | YAGNI extremist. Deletion before addition. Challenges requirements before building. |"
- **[R04]** 边界：只管"构建什么"不管"怎么说话"（简洁文风交给 Caveman），档位持续到被更改或会话结束。｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:116-118`
  > "Ponytail governs what you build, not how you talk (pair with Caveman for terse prose). "stop ponytail" / "normal mode": revert. Level persists until changed or session end."
- **[R05]** 适用边界：仅用于编码任务；非编码请求（常识、散文、翻译、摘要、菜谱）明确禁用。｜工作流｜prompt-skill｜`skills/ponytail/SKILL.md:13-15`
  > "Do NOT use for non-coding requests (general knowledge, prose, translation, summaries, recipes)."

### B. 懒惰阶梯（laziness ladder）

- **[R06]** 第 1 级 YAGNI：先问"这东西需要存在吗"，投机性需求直接跳过并用一行说明。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:7` ≡ `.agents/rules/ponytail.md:7`；详版 `skills/ponytail/SKILL.md:36`
  > "1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)"
- **[R07]** 第 2 级 复用本仓库已有：先看再写，别重写几文件之外的现成 helper/util/type/pattern。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:8` ≡ `.agents/rules/ponytail.md:8`；详版 `skills/ponytail/SKILL.md:37`
  > "2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it."
- **[R08]** 第 3 级 标准库能做就用标准库。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:9` ≡ `.agents/rules/ponytail.md:9`
  > "3. Does the standard library already do this? Use it."
- **[R09]** 第 4 级 平台原生能力覆盖就用原生（例：`<input type="date">` 胜过 picker 库、CSS 胜过 JS、数据库约束胜过应用层代码）。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:10` ≡ `.agents/rules/ponytail.md:10`；详版 `skills/ponytail/SKILL.md:39`
  > "4. **Native platform feature covers it?** `<input type="date">` over a picker lib, CSS over JS, DB constraint over app code."
- **[R10]** 第 5 级 已安装依赖能解决就用它；几行代码能做的绝不新增依赖。｜简洁度阶梯·依赖｜prompt-skill｜`AGENTS.md:11` ≡ `.agents/rules/ponytail.md:11`；详版 `skills/ponytail/SKILL.md:40`
  > "5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do."
- **[R11]** 第 6 级 能写成一行就写成一行。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:12` ≡ `.agents/rules/ponytail.md:12`
  > "6. Can this be one line? Make it one line."
- **[R12]** 第 7 级 以上都不成立时，才写"最小可用代码"。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:13` ≡ `.agents/rules/ponytail.md:13`
  > "7. Only then: write the minimum code that works."
- **[R13]** 阶梯前置条件：先理解问题再爬梯——读任务与将被改动的代码，端到端追踪真实流程。｜简洁度阶梯·工作流｜prompt-skill｜`AGENTS.md:15` ≡ `.agents/rules/ponytail.md:15`
  > "The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb."
- **[R14]** 命中即停：两级都成立就取更高（更省）的一级；第一个能跑通的懒惰解就是对的解。｜简洁度阶梯｜prompt-skill｜`skills/ponytail/SKILL.md:46-48`
  > "Two rungs work → take the higher one and move on. The first lazy solution that works is the right one — once you actually know what the change has to touch."
- **[R15]** 阶梯是反射而非研究课题（但必须在理解之后运行）。｜简洁度阶梯｜prompt-skill｜`skills/ponytail/SKILL.md:44-46`
  > "The ladder is a reflex, not a research project — but it runs *after* you understand the problem, not instead of it."

### C. 硬性规则条款

- **[R16]** 不加未被明确要求的抽象：不要单实现的接口、单产品的工厂、永不变化的配置项。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:21` ≡ `.agents/rules/ponytail.md:21`；详版 `skills/ponytail/SKILL.md:58`
  > "- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes."
- **[R17]** 不写没人要的样板，也不为"以后"搭脚手架——以后可以自己搭。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:23` ≡ `.agents/rules/ponytail.md:23`；详版 `skills/ponytail/SKILL.md:59`
  > "- No boilerplate, no scaffolding "for later", later can scaffold for itself."
- **[R18]** 删除优先于新增；无聊优先于聪明；文件数最少。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:24` ≡ `.agents/rules/ponytail.md:24`
  > "- Deletion over addition. Boring over clever. Fewest files possible."
- **[R19]** 最短可行 diff 胜出，但仅在你已理解问题之后；放在错误位置的最小改动不是懒惰，是第二个 bug。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:25` ≡ `.agents/rules/ponytail.md:25`
  > "- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug."
- **[R20]** 质疑复杂需求："你真的需要 X，还是 Y 就够？"｜沟通｜prompt-skill｜`AGENTS.md:26` ≡ `.agents/rules/ponytail.md:26`
  > "- Question complex requests: "Do you actually need X, or does Y cover it?""
- **[R21]** 两个 stdlib 方案体量相同时，选边界情况正确的那个；懒惰意味着更少代码，不是更脆弱的算法。｜简洁度阶梯｜prompt-skill｜`AGENTS.md:27` ≡ `.agents/rules/ponytail.md:27`
  > "- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm."
- **[R22]** 凡故意砍掉真实能力（保留已知天花板：全局锁、O(n²) 扫描、朴素启发式）必须在 `ponytail:` 注释里写明天花板与升级路径。｜工作流·工具化｜prompt-skill（约定）+ hook（注入）+ 脚本（debt 收割）｜`AGENTS.md:28` ≡ `.agents/rules/ponytail.md:28`；示例 `skills/ponytail/SKILL.md:64`
  > "Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a `ponytail:` comment naming the ceiling and upgrade path."
- **[R23]** 依赖最小化：能避免就不新增依赖。｜依赖｜prompt-skill｜`AGENTS.md:22` ≡ `.agents/rules/ponytail.md:22`
  > "- No new dependency if it can be avoided."

### D. 缺陷修复

- **[R24]** Bug 修复 = 治根因不治症状：先 grep 该函数所有调用点，在共享函数里修一次；只修工单提到的路径会留下同级调用者仍坏。｜工作流｜prompt-skill｜`AGENTS.md:17` ≡ `.agents/rules/ponytail.md:17`；详版 `skills/ponytail/SKILL.md:50-54`
  > "Bug fix = root cause, not symptom: a report names a symptom. Grep every caller of the function you touch and fix the shared function once — one guard there is a smaller diff than one per caller, and patching only the path the ticket names leaves a sibling caller still broken."

### E. 输出契约（沟通）

- **[R25]** 代码优先；其后最多三行短句：跳过了什么、什么时候该加。｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:68`
  > "Code first. Then at most three short lines: what was skipped, when to add it."
- **[R26]** 不写散文：无小论文、无功能导览、无设计笔记；解释若比代码长就删掉——为简化辩护的每段话都是把复杂度当散文偷运回来。｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:69-71`
  > "No essays, no feature tours, no design notes. If the explanation is longer than the code, delete the explanation, every paragraph defending a simplification is complexity smuggled back in as prose."
- **[R27]** 例外：用户明确要求的解释（报告、走查、分阶段笔记）不算债，要完整给出。｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:71-73`
  > "Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not debt, give it in full, the rule is only against unrequested prose."
- **[R28]** 输出固定模式：`[code] → skipped: [X], add when [Y].`｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:75`
  > "Pattern: `[code] → skipped: [X], add when [Y].`"
- **[R29]** 遇复杂请求：先交付懒惰版并在同一响应里质疑，绝不因等待用户回答而停工。｜沟通·工作流｜prompt-skill｜`skills/ponytail/SKILL.md:62`
  > "- Complex request? Ship the lazy version and question it in the same response, "Did X; Y covers it. Need full X? Say so." Never stall on an answer you can default."

### F. 不可懒惰的护栏（安全）

- **[R30]** 绝不简化掉：信任边界的输入校验、防止数据丢失的错误处理、安全措施、无障碍基础、以及用户明确要求的一切。｜安全｜prompt-skill｜`skills/ponytail/SKILL.md:92-95`；简版 `AGENTS.md:30`
  > "Never simplify away: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics, anything explicitly requested."
- **[R31]** 绝不懒于理解：阶梯只缩短解法、绝不缩短阅读；跳过理解去交付小 diff 是伪装成效率的危险懒惰。｜安全·工作流｜prompt-skill｜`skills/ponytail/SKILL.md:97-101`
  > "Never lazy about understanding the problem. The ladder shortens the solution, never the reading."
- **[R32]** 硬件不等于纸面理想：真实时钟会漂、真实传感器读数偏（PCA9685 会快几个百分点）；要留校准旋钮。｜安全｜prompt-skill｜`skills/ponytail/SKILL.md:103-105`
  > "Hardware is never the ideal on paper: a real clock drifts, a real sensor reads off, a PCA9685 runs a few percent fast. Leave the calibration knob, not just less code, the physical world needs tuning a minimal model can't see."
- **[R33]** 用户坚持要完整版 → 照做，不再争辩。｜沟通｜prompt-skill｜`skills/ponytail/SKILL.md:94-95`
  > "User insists on the full version → build it, no re-arguing."
- **[R34]** 没有检查的懒惰代码算未完成：非平凡逻辑（分支/循环/解析/money·security 路径）留下唯一一个可运行检查（assert 式 demo/自检或一个小测试文件），不要框架、不要 fixture、不要按函数分套件；平凡一行免测——YAGNI 也适用于测试。｜测试｜prompt-skill + 脚本·gate（行为门）｜`skills/ponytail/SKILL.md:107-112`；简版 `AGENTS.md:30`；门 `benchmarks/behavior.js:6,38-45`
  > "Lazy code without its check is unfinished. Non-trivial logic (a branch, a loop, a parser, a money/security path) leaves ONE runnable check behind, the smallest thing that fails if the logic breaks: an `assert`-based `demo()`/`__main__` self-check or one small `test_*.py`."

### G. 子技能族各自的规则

- **[R35]** `ponytail-review`：只审过度工程；每行一条 finding 的 5 类标签（`delete:`/`stdlib:`/`native:`/`yagni:`/`shrink:`）；结尾给 `net: -<N> lines possible.`；无可删即 `Lean already. Ship.`；只列不改；正确性/安全/性能明确不在范围内；**单个 smoke test 或 assert 式自检是下限而非 bloat，绝不可标记删除**。｜工作流·沟通｜prompt-skill｜`skills/ponytail-review/SKILL.md:13-14,23-27,46-48,52-56`
  > "End with the only metric that matters: `net: -<N> lines possible.`"
  > "A single smoke test or `assert`-based self-check is the ponytail minimum, not bloat, never flag it for deletion."
- **[R36]** `ponytail-audit`：把 review 扩到全仓库、按"砍得最多"排序、给出 `net: -<N> lines, -<M> deps possible.`；范围仍限过度工程，正确性与性能显式排除；只列不改、一次性。｜工作流｜prompt-skill｜`skills/ponytail-audit/SKILL.md:12-13,33-34,38-40`
  > "ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank findings biggest cut first."
- **[R37]** `ponytail-debt`：用 `grep -rnE '(#|//) ?ponytail:' .` 收割所有 `ponytail:` 标记成债务台账（file:line + 被简化内容 + ceiling + upgrade），任何未写明升级触发条件的标记打 `no-trigger` 标签（这些会静默腐烂）；只读不改。｜工作流·工具化｜prompt-skill｜`skills/ponytail-debt/SKILL.md:11-13,20,29-36,42-43`
  > "Flag the rot risk: any `ponytail:` comment that names no upgrade path or trigger gets a `no-trigger` tag, those are the ones that silently rot."
- **[R38]** `ponytail-gain`：只展示已发布的基准中位数记分板，并守住诚实边界——**绝不打印"本仓库节省了 X 行/token"这类每仓库数字**（未写的版本没有真实基线可减）。｜沟通｜prompt-skill｜`skills/ponytail-gain/SKILL.md:18-19,41-45`（数字本身 `[benchmark]`）
  > "These are benchmark medians, not this repo. NEVER print a per-repo savings number ("you saved X lines/tokens here"): the unbuilt version was never written, so there is no real baseline to subtract from in a live repo."
- **[R39]** `gain`/`help` 类展示技能是一次性操作：不改模式、不写 flag 文件、不持久化任何东西。｜工作流｜prompt-skill｜`skills/ponytail-gain/SKILL.md:13-14`；`skills/ponytail-help/SKILL.md:11-12`
  > "One-shot: do NOT change mode, write flag files, or persist anything."

### H. 规则系统自身的工具化规则

- **[R40]** 同一规则的多份投影必须与 `AGENTS.md` 正文逐字一致，且 9 条"承重规则不变量"必须同时存活于 `SKILL.md` 与 `AGENTS.md`；脚本失败即 CI 失败。｜工具化｜脚本·gate｜`scripts/check-rule-copies.js:15-27,44-58,76`
  > "Rule copies match AGENTS.md; ${INVARIANTS.length} rule invariants present in SKILL.md and AGENTS.md."
- **[R41]** CI 守门顺序固定：先查规则副本一致性 → 再查版本一致性 → 才跑测试。｜工具化｜脚本·gate｜`.github/workflows/test.yml:29-36`
  > "      - name: Check rule copies"
- **[R42]** 关闭指令必须是"整条消息"匹配（"stop ponytail"/"normal mode"），否则像 "add a normal mode toggle" 的普通请求会被误关。｜工具化｜脚本·gate｜`hooks/ponytail-config.js:36-43`
  > "// for ordinary requests like "add a normal mode toggle" — so require the whole // message to be the command, ignoring case and trailing punctuation."
- **[R43]** Hook 永不阻断会话：失败静默、flag 尽力而为、stdin 不结束时有超时兜底（Windows PowerShell 包裹会吞掉管道 JSON）。｜工具化｜脚本·gate｜`hooks/ponytail-mode-tracker.js:147-155`；`hooks/ponytail-activate.js:56-58,107-109`；`hooks/ponytail-subagent.js:75-76`
  > "// PowerShell `if {}` wrapper that can swallow the piped prompt JSON, so stdin // 'end' never fires and the hook blocks forever — freezing the session (#443)."
- **[R44]** 子代理注入 fail-open：matcher 无效、agent_type 缺失/解析失败、stdin 错误或超时，一律仍然注入，绝不静默丢掉人格。｜工具化｜脚本·gate｜`hooks/ponytail-subagent.js:31-39,50-52,67-70`
  > "// mismatch. Missing/unparseable agent_type, a stdin error, or the timeout all // fail open (inject), so scoping never silently drops the persona."
- **[R45]** 当宿主已有常开规则文件（Cursor `.cursor/rules/ponytail.mdc`）时，hooks 主动退让，只发一条提示，避免注入第二份可能矛盾的规则副本。｜工具化｜脚本·gate + hook｜`hooks/ponytail-runtime.js:59-78`；`hooks/ponytail-mode-tracker.js:29-39`
  > "// it is in the workspace the hooks step back instead of injecting a second, // possibly contradicting, copy (#817)."
- **[R46]** 适配器薄原则：宿主支持 skills/hooks 就指向既有 `skills/`、`hooks/`；只有仅支持项目指令的宿主才复制规则文本，且该副本必须与 `AGENTS.md` 对齐。｜工具化｜仅文档 + 脚本·gate｜`docs/agent-portability.md:35-39`
  > "Keep adapters thin. When a host supports skills or hooks, point it at the existing `skills/` and `hooks/` files. When a host only supports project instructions, keep its copied rule text aligned with `AGENTS.md`."
- **[R47]** 生成物只改 frontmatter：OpenClaw 包的 SKILL.md 正文逐字复制自 `skills/`，提交物过期由测试判定失败。｜工具化｜脚本·gate｜`scripts/build-openclaw-skills.js:1-10`
  > "// verbatim from skills/<name>/SKILL.md so the ruleset never drifts; only the // frontmatter is rewritten."
- **[R48]** 原生优先目录化：`docs/platform-native.md` 把"平台已经能做"整理成可查表（HTML/CSS/JS/Swift/Node/Python/DB），并给出裁决线——原生确实不够时依赖才配得上位置，那时再装、不是提前装。｜依赖·简洁度阶梯｜仅文档｜`docs/platform-native.md:3-5,209-211`
  > "When the native solution is genuinely insufficient (old browser support, edge cases it doesn't handle, ergonomics that matter at scale), the library earns its place. Install it then, not before."

## 3 核心机制

### 3.1 懒惰阶梯的完整梯级与判定顺序

判定方式：**自上而下逐级提问，命中第一个成立的梯级就停止**（`AGENTS.md:5` "Before writing any code, stop at the first rung that holds:"）。顺序即优先级——越靠上越省。完整 7 级（`AGENTS.md:7-13` ≡ `.agents/rules/ponytail.md:7-13`，`skills/ponytail/SKILL.md:34-42` 为详版）：

| 级 | 判定问题（verbatim） | 命中后的动作 |
|---|---|---|
| 1 | "Does this need to be built at all? (YAGNI)" | 不做，并一行说明（投机需求=跳过） |
| 2 | "Does it already exist in this codebase?" | 复用现有 helper/util/type/pattern，"re-implementing what's a few files over is the most common slop"（`SKILL.md:37`） |
| 3 | "Does the standard library already do this?" | 用 stdlib |
| 4 | "Does a native platform feature cover it?" | 用原生（`<input type="date">` / CSS / DB 约束） |
| 5 | "Does an already-installed dependency solve it?" | 用已装依赖；几行能做的不新增依赖 |
| 6 | "Can this be one line?" | 写成一行 |
| 7 | "Only then: write the minimum code that works." | 最小可用实现 |

补充判定规则：前置条件是理解（R13）；两级都成立取更高一级（R14）；阶梯是反射不是研究课题（R15）。七级全不成立才落到第 7 级的"最小实现"，不存在"退回原方案"的路径。

### 3.2 安全护栏（不可省略的部分）

护栏以"Not lazy about"清单形式与阶梯并列（`AGENTS.md:30`、`SKILL.md:90-112`），共 6 类 + 1 条测试底线：

1. **理解问题**——先读完、端到端追流程再选梯级；"a small diff you don't understand is just laziness dressed up as efficiency"（`AGENTS.md:30`）。
2. **信任边界的输入校验**（`SKILL.md:92`）。
3. **防数据丢失的错误处理**（`SKILL.md:92-93`）。
4. **安全措施**（`SKILL.md:93`）。
5. **无障碍基础**（`SKILL.md:94`）。
6. **硬件校准**——真时钟漂移、传感器读数偏，"Leave the calibration knob"（`SKILL.md:103-105`）。
7. **用户明确要求的一切**，且用户坚持要完整版时照做不争辩（`SKILL.md:94-95`）。
8. **测试底线**：非平凡逻辑留 ONE runnable check，无框架无 fixture；平凡一行免测（`SKILL.md:107-112`）。

护栏的工程化痕迹：`scripts/check-rule-copies.js:44-58` 把这些护栏钉成 9 条不变量（`input validation at trust boundaries`、`prevents data loss`、`security`、`accessibility`、`ONE runnable check`、`flimsier algorithm`、`naive heuristic`、`in this codebase`、`Lazy code without its check is unfinished`），任何文件改写措辞都会让 CI 失败。

### 3.3 技能族分工

| 技能 | 作用域 | 是否改代码 | 次数 | 产物 |
|---|---|---|---|---|
| `ponytail` | 任意编码任务（写/加/重构/修/评审/设计/选依赖） | 是 | 常驻模式（默认 full） | 最小实现 + ≤3 行说明（`SKILL.md:68`） |
| `ponytail-review` | 当前 diff | 否（只列） | 一次性 | 5 类标签 finding + `net: -N lines`（`review:46-48`） |
| `ponytail-audit` | 整个仓库 | 否（只列） | 一次性 | 按砍量排序清单 + `net: -N lines, -M deps`（`audit:33-34`） |
| `ponytail-debt` | 全仓 `ponytail:` 标记 | 否（只读） | 一次性 | 债务台账 + `no-trigger` 计数（`debt:29-38`） |
| `ponytail-gain` | 基准中位数（非本仓库） | 否 | 一次性 | ASCII 记分板（`gain:26-37`） |
| `ponytail-help` | 使用说明 | 否 | 一次性 | 命令/档位参考卡（`help:11-20`） |

族内一致性：review/audit 共用同一套 5 个标签定义（`review:23-27` ≡ `audit:19-23`），audit 自述为 "ponytail-review, repo-wide"（`audit:12`）。

### 3.4 档位与配置

三档 `lite`/`full`/`ultra`，默认 `full`（`SKILL.md:29,79-83`）。切换 `/ponytail lite|full|ultra|off`；关闭 "stop ponytail"/"normal mode"；`/ponytail` 无参数只报告当前档（`README.md:333`）。默认档解析优先级：环境变量 `PONYTAIL_DEFAULT_MODE` > 配置文件 `~/.config/ponytail/config.json`（Windows `%APPDATA%\ponytail\config.json`）> `full`（`skills/ponytail-help/SKILL.md:61`；实现 `hooks/ponytail-config.js:4-10,76-100`）。`review` 是会话级独立模式，永不作为默认档（`hooks/ponytail-config.js:17,36-43,79-81`）。

### 3.5 债务标记闭环

R22（写代码时用 `ponytail:` 注释标注天花板与升级路径）→ R37（`ponytail-debt` 用 grep 收割成台账，并把缺升级路径的标 `no-trigger`）→ R38（`gain` 明确指向 `/ponytail-debt` 作为唯一真实的每仓库数字来源）。本仓库自身实测有 21 处 `ponytail:` 标记注释（`grep -rnE '(#|//) ?ponytail:'`，排除测试目录），例如 `hooks/ponytail-runtime.js:8,64`、`hooks/ponytail-config.js:45,72,79,137`、`hooks/ponytail-mode-tracker.js:88,131`、`scripts/check-rule-copies.js:40`、`docs/platform-native.md:82`——规则被自己遵守（dogfooding）。

## 4 工具化强制点

### 4.1 规则投影与一致性（同一规则的多种投影）

`.agents/rules/ponytail.md` 是紧凑规则正文；`scripts/check-rule-copies.js:16` 从 `AGENTS.md` 剥掉末尾那段仓库自指声明得到 canonical 正文，再要求 7 个副本逐字相等（`:19-27`）：

| 投影 | 状态（`diff` 实测于本 commit） |
|---|---|
| `AGENTS.md` | 与 canonical 相同 + 第 31-32 行额外声明 "(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)"（脚本 `:16` 用正则剥掉该段，故不判为 drift） |
| `.agents/rules/ponytail.md` / `.clinerules/ponytail.md` / `.windsurf/rules/ponytail.md` / `.qoder/rules/ponytail.md` / `.github/copilot-instructions.md` | **逐字节相同**（无 frontmatter） |
| `.cursor/rules/ponytail.mdc` | 正文相同，仅多 `description/globs/alwaysApply: true` frontmatter（`:1-5`） |
| `.kiro/steering/ponytail.md` | 正文相同，仅多 `title/inclusion: always` frontmatter（`:1-4`） |
| `skills/ponytail/SKILL.md` | 更长，无法逐字比对 → 改用 9 条不变量 canary（`check-rule-copies.js:40-58`，注释自认 "canary, not full equality"） |
| `.openclaw/skills/ponytail*/SKILL.md` | 由 `scripts/build-openclaw-skills.js` 生成：正文逐字复制、仅重写 frontmatter（`:1-10`）；过期的提交物由测试判失败 |

结论：**投影内容一致，且由脚本 + CI 双向守门**（R40、R41、R46、R47）。这是本规则集中最值得复用的工程手法。

### 4.2 运行时注入（hooks）

- 事件与宿主：`hooks/claude-codex-hooks.json:3-39` 注册 `SessionStart`（startup|resume|clear|compact）、`SubagentStart`、`UserPromptSubmit`；`hooks/copilot-hooks.json`、`hooks/cursor-hooks.json`、`hooks/qoder-hooks.json:14-24` 各自映射到 `sessionStart`/`userPromptSubmitted`/`beforeSubmitPrompt`/`PreToolUse(task|Task)`。
- 单一事实源：所有宿主共用一个指令构建器 `hooks/ponytail-instructions.js`（Claude hooks、pi 扩展、OpenCode 插件、Hermes 均复用；`ponytail-mcp/instructions.js:1-8` 明确 "every host emits identical rules"）。
- 按档位过滤：`hooks/ponytail-instructions.js:11-41` 只按档位裁掉强度表行与 worked example，普通规则 bullet 逐字保留；并有注释说明为何必须要求引号（`:28-31`）以避免误删普通规则。
- 状态记账：flag 文件 `.ponytail-active`（`hooks/ponytail-runtime.js:6,39-57`）由 activate 写、mode-tracker 读；`/ponytail default <mode>` 是唯一写配置文件的路径（`hooks/ponytail-mode-tracker.js:59-66`）。
- 宿主差异处理：BOM 剥离（`ponytail-activate.js:67-69`、`mode-tracker.js:25-26`）、`isShellSafe` 白名单决定 statusline 片段能否内嵌（`hooks/ponytail-config.js:45-52`）、Cursor 规则存在时退让（`ponytail-runtime.js:59-78`）。

### 4.3 真正的"gate"（会失败的校验）

| Gate | 位置 | 作用 |
|---|---|---|
| 规则副本一致性 | `scripts/check-rule-copies.js` | 7 份副本 drift 或 9 条不变量缺失 → exit 1 |
| 版本一致性 | `scripts/check-versions.js:1-20` | 8 个版本文件必须同为 `X.Y.Z`，release tag 时必须等于 tag |
| 正确性 gate | `benchmarks/README.md:94` | "Gate - fails if generated code doesn't work"（LOC 只是记录，correctness 才判失败） |
| 行为 gate | `benchmarks/behavior.js:17-46` | 三个探针 hardware / explanation / onecheck 各对应一条规则，未体现则 fail；grader 自身由 `tests/behavior.test.js` 用 RED/GREEN 证明 |
| 测试 | `package.json:38` + `.github/workflows/test.yml:35-36` | `node --test tests/*.test.js` + 子项目测试 |

### 4.4 关键观察：没有任何硬阻断

在 `hooks/`、`scripts/` 内检索 `exit(2)`、`deny`、`permissionDecision` 均无命中（仅匹配到 "never block / don't block" 的注释，如 `ponytail-activate.js:57,108`、`mode-tracker.js:149-153`）。**所有运行时 hook 只做"向会话注入规则文本 + 记录档位"，不阻断、不否决任何工具调用或文件写入。** 因此 ponytail 对本仓库/用户仓库内代码的强制力实质是：

1. 注入的持久性（R02：每轮重注入，SessionStart + 每 prompt + 每个子代理）；
2. 仓库自身 CI/脚本守门（只保证规则文本不漂移，不检查产出代码是否够懒）;
3. 基准 gate（离线测量，不进入开发回路）。

把它提炼成通用 AGENTS.md 时，这一点决定了预期效果上限。

## 5 与其他来源的重叠/冲突预判

**A. 与 `.refs/karpathy-ponytail-skills`（`8869387dbb285d48b2582667b0f049b8d5a04a11`）的重叠**
后者是 Karpathy 观察 + ponytail 阶梯的合并版：其 `skills/karpathy-ponytail/SKILL.md:40-63` 与 ponytail 的 `.agents/rules/ponytail.md:3-30` 几乎逐字同文（阶梯、8 条 Rules、Not lazy about 段落、档位表一致）。合并版新增了 §1 Think Before Coding、§3 Surgical Changes、§5 Goal-Driven Execution。**结论：若两份来源都要进通用规则，阶梯部分必须只保留一份，否则完全重复。**

**B. 预判的具体冲突（均为逐字可证）**

1. **"不确定就问" vs "绝不因等待而停滞"**：karpathy 版 `SKILL.md:34` "If something is unclear, stop. Name what's confusing. Ask." 与 `:32` "If multiple interpretations exist, present them - don't pick silently."，对撞 ponytail `skills/ponytail/SKILL.md:62` "Never stall on an answer you can default."（以及 `ultra` 档"先交付一行再挑战需求"）。这是**真冲突**：一个要求歧义即停，一个要求默认即走。需要显式裁决（例如"高风险/不可逆改动先问，其余按默认走并在同一响应里质疑"）。
2. **"不要删旧死代码" vs "删除优先 + 审查找可删"**：karpathy `SKILL.md:85` "If you notice unrelated dead code, mention it - don't delete it." 与 ponytail R18 "Deletion over addition"（`AGENTS.md:24`）及 `ponytail-audit` 的 `delete:` 标签（`audit:19`）方向相反。缓解：ponytail 的 review/audit 是"只列不改"（`review:56`、`audit:40`），但"什么是可删对象"的定义仍相抵。
3. **"每行改动都要能追溯到用户请求" vs "根因修复会改工单外路径"**：karpathy `SKILL.md:91` "The test: Every changed line should trace directly to the user's request." 与 ponytail R24（修共享函数会连带修好"同级调用者"）。ponytail 的解法是声明这种做法反而 diff 更小（`AGENTS.md:17`），但字面上它确实改动了请求未点名的路径。
4. **测试规模**：karpathy §5 要求"先写针对非法输入的测试再让其通过"（`:106`），ponytail R34 要求"ONE runnable check，无框架、无 fixture、除非被要求不做按函数套件"（`SKILL.md:107-112`）。同为"要测"，但一个偏 test-first/覆盖，一个偏单点下限。
5. **总基调**：karpathy 版前言自述 "These guidelines bias toward caution over speed."，ponytail 收尾是 "The shortest path to done is the right path."（`SKILL.md:120`）。

**C. 与通用 AGENTS.md 目标本身的重叠**：任何通用文件只要写"最小改动/不新增依赖/根因修复/不加样板"，就与 ponytail 逐字重复。建议通用文件只保留"阶梯骨架 + 护栏清单 + 输出纪律"，把 ponytail 作为可安装 skill 引用而不是内联全文。

**D. 与文档/汇报型工作流的冲突**：R25-R28 禁未请求散文，但多 agent 协作（如本任务）要求详细 findings 报告。ponytail 自带的豁免（R27，`SKILL.md:71-73`）足以消解，但通用规则里必须显式写出"任务明确要求的交付物不算未请求散文"，否则两者会打架。

**E. 内部措辞不一致（提醒不要引用数字）**：`README.md:33-34` 宣传 "~54% less code (up to 94%) … 100% safe" `[benchmark]`，而 `README.md:100` 自述早先 "80-94% less code" 的说法"partly a conversational-baseline artifact"；`benchmarks/README.md:64-71` 亦承认单次生成口径高估收益。数字口径在本 commit 内已迭代三次，**提炼规则时不应引入任何数字**。

**F. 依赖 vs 安全护栏的潜在冲突（未被文件裁决）**：第 5 级"用已装依赖、几行能做的不加新依赖"（R10/R23）与"安全措施绝不简化"（R30）在"要不要引入经过审计的安全库"这类场景会互斥。ponytail 只说护栏不可懒，**没有给出阶梯与护栏的显式优先级顺序**（见 §7）。

## 6 可提炼进通用 AGENTS.md 的候选规则（≤10 条）

| # | 候选规则（可直接写进通用文件的中文条款） | 优先级 | 来源 |
|---|---|---|---|
| 1 | 动手前自上而下问七级：是否真需要存在 → 本仓库已有 → 标准库 → 平台原生 → 已装依赖 → 能否一行 → 否则才写最小可用代码；命中即停。 | 高 | R06-R12, R14 |
| 2 | 最短 diff 只在理解问题之后：先读将被改动的代码、端到端追一遍真实流程；没理解的小改动是第二个 bug。 | 高 | R13, R19, R31 |
| 3 | Bug 修复治根因：先 grep 该函数所有调用点，在共享函数里修一次。 | 高 | R24 |
| 4 | 四条不可懒惰护栏：信任边界输入校验、防数据丢失的错误处理、安全、无障碍；用户明确要求的内容不缩减。 | 高 | R30, R33 |
| 5 | 不写未被要求的抽象、样板与"以后再说"的脚手架；删除优先于新增，文件数最少。" | 高 | R16, R17, R18 |
| 6 | 非平凡逻辑留一个可运行检查（assert 自检或一个小测试文件），不要框架与 fixture；平凡一行免测。 | 中 | R34 |
| 7 | 输出纪律：代码优先，其后最多三行——跳过了什么、何时该加；不写未被要求的散文，但用户点名要的解释给全。 | 中 | R25-R28 |
| 8 | 故意留下的简化必须写明"已知天花板 + 升级触发条件"（标记可改名，如 `ponytail:`/`TODO(ceiling):`），否则会静默腐烂。 | 中 | R22, R37 |
| 9 | 复杂需求先交付懒惰版并在同一响应里质疑它，不停工等答复（与"歧义先问"需按风险裁决）。 | 中 | R20, R29 |
| 10 | 同一规则的多投影必须脚本化校验一致（副本逐字比对 + 不变量 canary + CI 守门），而不是靠人记得同步。 | 中 | R40, R41, R46 |

（前 5 条为高优先级骨架；6-9 为行为纪律；第 10 条是把以上规则长期维持住的工程手段。硬件校准 R32 与依赖最小化 R23 属领域性/已含于 #1，故未单列。）

## 7 不确定项与未覆盖项

1. **未实测运行**：为遵守"禁止写 `.refs`"约束，未执行 `npm test`、`node scripts/check-rule-copies.js` 或 benchmark（benchmark 还需 API key）。R40/R41 的"会失败"是读代码与 CI 定义得出的，不是实跑结论。
2. **未读文件**：`assets/*`、`README.es.md`/`README.ko.md`、`benchmarks/arms/*.js`、`benchmarks/results/*`（只读结论段）、`pi-extension/test/*`、`ponytail-mcp/index.js`、`.opencode/plugins/ponytail-frontmatter.cjs`、`.devin-plugin/*`、`.grok-plugin/*`、`.github/plugin/*`、`.openclaw` 其余 4 个 skill 正文（只 `diff` 了 2 个）、`examples/` 其余 9 个示例（只读 README + 2 个）。
3. **阶梯与护栏的优先级未定义**：文件只声明护栏"不可懒"，未说当"不新增依赖"与"必须用经过审计的安全库"冲突时谁让步（§5-F）。
4. **"higher one" 语义未显式定义**：R14 的 "take the higher one" 按上下文推断为"更靠上=更省代码"，文件未明说。
5. **档位过滤是 canary 而非完备**：`hooks/ponytail-instructions.js:11-41` 只按 `**标签**` 表格行与 `- 标签: "…"` 两种形态过滤；若日后新增其他形态的档位段落会静默不过滤，`check-rule-copies.js:40-43` 自认 "canary, not full equality"。
6. **Hermes 存在第二套实现**：`__init__.py:70` 的 `_filter_skill_body_for_mode` 与 `hooks/ponytail-instructions.js:11-41` 是同一逻辑的两份实现（Python/JS），有 drift 风险；我未逐行比对两者行为是否等价。
7. **行为 gate 的判定是启发式**：`benchmarks/behavior.js:20-45` 用正则与字数阈值判定"是否体现规则"，`correctness.js` 对 React/FastAPI 只做结构/关键字检查（`benchmarks/README.md:98`）。它们是候选规则的证据强度上限。
8. **数字全部标 `[benchmark]`**：`README.md:33`、`README.md:83-89`、`benchmarks/README.md:36-71`、`skills/ponytail-gain/SKILL.md:27-33`、`examples/README.md:11-17` 的数值不构成规则，本报告未据此推导任何条款。
9. **计数会变**：`ponytail:` 标记 21 处、文件数 166、各文件行数均为该 commit 实测值。
10. **未核实宿主契约**：各 hook JSON 的字段形状（`additional_context`、`hookSpecificOutput` 等）只按本仓库注释与 `docs/cursor-hooks.md` 转述，未对宿主官方文档交叉验证。

## 8 方法说明

**读了什么 / 怎么读的**
- 用 `read` 工具带行号完整读取规则载体（§0 表列出的文件），用 `grep -n` 对每条拟引用文本做二次定位，确保 `path:line` 正确；投影一致性用 `diff` 实测（非目测）。
- `git rev-parse HEAD` 校验 commit；`git ls-files | wc -l` 统计规模；仅使用 `rev-parse`/`ls-files`/`log` 等只读 git 命令，无任何 git 写操作。
- 抽查 `docs/platform-native.md`（213 行）作为 rung 3/4 的"目录化"证据，`hooks/*.js` 全部通读以判断强制形式，`__init__.py`、`.opencode/plugins/ponytail.mjs`、`pi-extension/index.js`、`ponytail-mcp/instructions.js` 用 grep 定位后局部阅读，用于确认"单一事实源"与"第二套实现"两类判断。

**排除了什么、为什么**
- 所有 benchmark/营销数字（性能、成本、行数、安全性百分比）：按任务约定标 `[benchmark]`，只作背景证据，不计入规则（见 §7-8）。
- `assets/`（图片）、本地化 README、赞助/Funding/Star History、安装步骤与各宿主安装说明：不含行为规则。
- `.env.example`、`package.json` 的依赖字段、`.github/workflows/publish.yml`：属发布工程，非规则。
- 未把"示例代码里模型实际写了什么"当作规则（例：`examples/email-validation.md:151` 的朴素正则、`examples/rate-limit.md:257` 选择 `slowapi`）——示例是规则效果的证据而非规则文本；它们与护栏的张力记在 §5/§7 而不立为条款。

**引用规范与约束遵守**
- `>` 引用块内为逐字英文原文；跨行折行的句子以单空格连接（允许的空白差异），代码注释的 `//` 标记原样保留；关键引用均已与文件字面比对（脚本化校验见验证记录）。
- 全文未修改 `.refs/` 下任何文件；本任务唯一写入的文件是 `findings/01-ponytail.md`。

**更正记录（Lead 复核，依据 `findings/99-verification.md`）**
- 原文将 `scripts/check-rule-copies.js` 的 `INVARIANTS` 写作"8 条"，实测为 **9 条**（数组 9 个元素，含 `Lazy code without its check is unfinished`）；已在 R40、§3.2、§4.1、§4.3 四处就地更正。
- R40 的引文 `"Rule copies match AGENTS.md; …"` 实际位于 `check-rule-copies.js:76`，原引用 `:71-74` 有偏差；已更正为 `:76`。
