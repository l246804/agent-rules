# 02 · andrej-karpathy-skills 对 Claude Code 的改善指南（规则提取与取证）

分析对象：只读快照 `.refs/andrej-karpathy-skills`（下文相对路径均以本仓库根目录为基准）。本文是取证记录，不是使用说明；每节以可判定的完成判据收束。

## §0 溯源与引用约定

**快照身份**（实测）：`git rev-parse HEAD` → `2c606141936f1eeef17fa3043a72095b4765b9c2`；提交标题 `Sync Chinese README with English version (add Cursor section) (#95)`；分支 `main`；`git ls-files | wc -l` → 9；`git ls-files -s` 九行全部为 `100644`（无任何可执行位）。

**上游两条 URL**（网络复核输出见 §4.1）：

```
$ curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' https://github.com/forrestchang/andrej-karpathy-skills
301 -> https://github.com/multica-ai/andrej-karpathy-skills
$ git ls-remote https://github.com/multica-ai/andrej-karpathy-skills HEAD
2c606141936f1eeef17fa3043a72095b4765b9c2	HEAD
$ git ls-remote https://github.com/forrestchang/andrej-karpathy-skills HEAD
2c606141936f1eeef17fa3043a72095b4765b9c2	HEAD
```

两条 URL 现在指向同一 HEAD，且等于本次快照的提交。`forrestchang` 是旧 owner（301 跳转后为 `multica-ai`）；快照内所有安装命令与 manifest 仍写 `forrestchang`（§3.2）。旧路径的 raw 文件仍可下载且与快照逐字节相同（§4.1）。

**引用约定**：`K:<path>:<line>`，`path` 相对快照根 `.refs/andrej-karpathy-skills/`，行号为 `read` 工具显示的 1-based 行号；区间写成 `K:<path>:<a>-<b>`。全文只用这一种引用前缀，定义在此处。

**强制形式词表**（定义一次，全文复用）：`prompt-only` = 约束仅以自然语言进入上下文，靠模型自觉执行，无运行时拦截；`hook` = 宿主事件钩子（如 PostToolUse）在运行时执行检查；`script·gate` = 仓库内脚本/CI 作为门禁；`test·gate` = 测试或 CI 结果作为判定闸门。本快照只存在 `prompt-only` 的证据，其余三种形式的**缺席证据**见 §3.3。

**与上一轮的区别**：上一轮分析的是 `AbdullahHameedKhan/karpathy-ponytail-skills`（第三方把 Karpathy 与 Ponytail 合并的仓库），与本快照**不是同一个仓库**。本文不搬用该份内容；全文所有数字、哈希、行数均为本次重测，规则计数不含任何该仓库条目。

**与本文无关、已按相关性剪除的内容**：`K:README.md:3-5` 是作者推广块（新项目 Multica + X 账号），与行为规则无关，本文只记录其存在、不复述其链接；`K:README.md:169-171` 与 `K:README.zh.md:169-171` 的许可段落并入 §7 缺口 1。

**完成判据：** 本节四项（快照身份、两条 URL、`K:` 约定、形式词表）各自给出命令输出或锚点；任一读者可用 §8 的命令复跑全部数字。

## §1 一句话定位

这是一份**纯文本行为准则的分发仓库**：同一份「四原则 / 32 条原子规则」以四种载体复制发出（Claude Code 的 `CLAUDE.md`、Claude Code 插件 skill、Cursor 项目规则 `.mdc`、README 安装路径），全部为 `prompt-only`；仓库内不存在任何 hook、脚本或测试闸门，因此它改变模型行为的唯一手段是「让宿主把这段文本放进上下文」。

**完成判据：** 上述断言的两个可判定成分——「四载体、同一文本」与「零 hook/脚本/测试」——分别在 §3.1、§3.3 给出逐字与命令证据。

## §2 规则清单（P1–P4 / R1–R32）

**计数口径 A（本文件回答「规则条数」时使用的口径）**：以完整载体 `CLAUDE.md` 的正文为唯一基准，原子条目 = 每节粗体主旨句按句拆分（9 条）+ 每个 `- ` 列表项（18 条）+ 正文中 5 条非列表的规范性句子（`K:CLAUDE.md:5`、`:27`、`:43`、`:54`、`:61`）→ **4 原则 / 32 条原子规则**。`README.md`/`README.zh.md` 是复述载体，其复述不进入计数（唯一例外：README 多出 1 条成功观察项，见 §3.1 末行，不计入 32）。行号映射：同一规则文本在 `.mdc` 的行号 = 本表行号 **+5**，在 `SKILL.md` = **+6**（证明见 §3.1 的两个空 diff；例外为 `CLAUDE.md:1`、`:3` 与 `SKILL.md` 缺失的 `:62-65`）。

| ID | 逐字引文 | 锚点 | 形式 |
|----|----------|------|------|
| R1 | 「Don't assume.」 | K:CLAUDE.md:9 | prompt-only |
| R2 | 「Don't hide confusion.」 | K:CLAUDE.md:9 | prompt-only |
| R3 | 「Surface tradeoffs.」 | K:CLAUDE.md:9 | prompt-only |
| R4 | 「State your assumptions explicitly. If uncertain, ask.」 | K:CLAUDE.md:12 | prompt-only |
| R5 | 「If multiple interpretations exist, present them - don't pick silently.」 | K:CLAUDE.md:13 | prompt-only |
| R6 | 「If a simpler approach exists, say so. Push back when warranted.」 | K:CLAUDE.md:14 | prompt-only |
| R7 | 「If something is unclear, stop. Name what's confusing. Ask.」 | K:CLAUDE.md:15 | prompt-only |
| R8 | 「Minimum code that solves the problem.」 | K:CLAUDE.md:19 | prompt-only |
| R9 | 「Nothing speculative.」 | K:CLAUDE.md:19 | prompt-only |
| R10 | 「No features beyond what was asked.」 | K:CLAUDE.md:21 | prompt-only |
| R11 | 「No abstractions for single-use code.」 | K:CLAUDE.md:22 | prompt-only |
| R12 | 「No "flexibility" or "configurability" that wasn't requested.」 | K:CLAUDE.md:23 | prompt-only |
| R13 | 「No error handling for impossible scenarios.」 | K:CLAUDE.md:24 | prompt-only |
| R14 | 「If you write 200 lines and it could be 50, rewrite it.」 | K:CLAUDE.md:25 | prompt-only |
| R15 | 「Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.」 | K:CLAUDE.md:27 | prompt-only |
| R16 | 「Touch only what you must.」 | K:CLAUDE.md:31 | prompt-only |
| R17 | 「Clean up only your own mess.」 | K:CLAUDE.md:31 | prompt-only |
| R18 | 「Don't "improve" adjacent code, comments, or formatting.」 | K:CLAUDE.md:34 | prompt-only |
| R19 | 「Don't refactor things that aren't broken.」 | K:CLAUDE.md:35 | prompt-only |
| R20 | 「Match existing style, even if you'd do it differently.」 | K:CLAUDE.md:36 | prompt-only |
| R21 | 「If you notice unrelated dead code, mention it - don't delete it.」 | K:CLAUDE.md:37 | prompt-only |
| R22 | 「Remove imports/variables/functions that YOUR changes made unused.」 | K:CLAUDE.md:40 | prompt-only |
| R23 | 「Don't remove pre-existing dead code unless asked.」 | K:CLAUDE.md:41 | prompt-only |
| R24 | 「The test: Every changed line should trace directly to the user's request.」 | K:CLAUDE.md:43 | prompt-only |
| R25 | 「Define success criteria.」 | K:CLAUDE.md:47 | prompt-only |
| R26 | 「Loop until verified.」 | K:CLAUDE.md:47 | prompt-only |
| R27 | 「"Add validation" → "Write tests for invalid inputs, then make them pass"」 | K:CLAUDE.md:50 | prompt-only |
| R28 | 「"Fix the bug" → "Write a test that reproduces it, then make it pass"」 | K:CLAUDE.md:51 | prompt-only |
| R29 | 「"Refactor X" → "Ensure tests pass before and after"」 | K:CLAUDE.md:52 | prompt-only |
| R30 | 「For multi-step tasks, state a brief plan:」 | K:CLAUDE.md:54 | prompt-only |
| R31 | 「Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.」 | K:CLAUDE.md:61 | prompt-only |
| R32 | 「**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.」 | K:CLAUDE.md:5 | prompt-only |

四节标题即四个原则名（`K:CLAUDE.md:7`、`:17`、`:29`、`:45`）：Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution。R27–R29 要求「先写测试」，但测试并不在本仓库内存在（§3.3），故其形式仍是 `prompt-only`：这是**规则内容提到测试**与**形式是测试闸门**的区别。

**完成判据：** 32 条各自带 `K:` 锚点且引文可在锚点行内逐字命中（§8 引文核对 `OK=32`）；4 / 18 / 9 / 5 / 32 五个计数可由 §8 的命令重跑。

## §3 载体与强度分析

### 3.1 四载体与文本关系（字节级）

三份规则载体的 sha256（实测 `sha256sum`）：

```
694a2d721e41c385f3db492838c23299826df5ba9809e3b0721aac70021e196a  CLAUDE.md
6e22cc54cb02a5e98ae42d06d9d7292db0c1b43894831b32879beb0166b2aea7  skills/karpathy-guidelines/SKILL.md
259cf32ac1a493b7bf863992bbb968079a2b6ffdce99dad092ec6f4e2764717d  .cursor/rules/karpathy-guidelines.mdc
```

三份互不相同（头部不同），但**正文关系可以精确判定**：

```
$ diff <(sed -n '7,65p' CLAUDE.md) <(sed -n '12,70p' .cursor/rules/karpathy-guidelines.mdc)
（无输出；退出码 0）
$ diff <(sed -n '7,61p' CLAUDE.md) <(sed -n '13,67p' skills/karpathy-guidelines/SKILL.md)
（无输出；退出码 0）
$ diff -u CLAUDE.md skills/karpathy-guidelines/SKILL.md
@@ -1,6 +1,12 @@        # 头部：+frontmatter(name/description/license) + H1 改名 + intro 增来源链接
@@ -59,7 +65,3 @@        # 尾部：删除 CLAUDE.md 的 62–65 共 4 行
```

**结论（逐条可回溯）：**

1. **完整正文有两个载体**：`CLAUDE.md`（`K:CLAUDE.md:1-65`）与 `.cursor/rules/karpathy-guidelines.mdc`（`K:.cursor/rules/karpathy-guidelines.mdc:12-70`）正文逐字节相同，含结尾的验证判据行 `K:CLAUDE.md:65` ≡ `K:.cursor/rules/karpathy-guidelines.mdc:70`。
2. **静默缺行的是插件 skill**：`skills/karpathy-guidelines/SKILL.md` 的正文止于 `K:skills/karpathy-guidelines/SKILL.md:67`（≡ `K:CLAUDE.md:61`），独缺 `CLAUDE.md` 的 62–65：空行、`---`、空行、`**These guidelines are working if:** …`。全树 `grep -n 'These guidelines are working if'` 只命中 `CLAUDE.md:65` 与 `.mdc:70`，`SKILL.md` 零命中——即**英文 `diff` 之外的静默缺失**，仓库内没有任何文本声明它缺了什么。
3. **skill 并非纯子集**：它反向**多了**来源链接，`K:skills/karpathy-guidelines/SKILL.md:9` 的 intro 含 `derived from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876)`，而 `K:CLAUDE.md:3` 与 `K:.cursor/rules/karpathy-guidelines.mdc:8` 是同文无链接版本。`SKILL.md:3` 的 routing 描述与 `.mdc:2` 的 `description` **逐字符相同**（`diff` 空输出），说明这段描述是被有意复用的触发词。
4. **缺行的制度性原因（推断，非事实）**：维护规则只对 `CLAUDE.md` 与 `.mdc` 说「keep `CLAUDE.md` and `.cursor/rules/karpathy-guidelines.mdc` in sync（原文含链接标记，此处为压缩引文）」（`K:CURSOR.md:28`），对 skill 是条件句 "If the published skill/plugin text should match"；该条件句使 skill 漂移不被视为违约，与观察到的缺失一致。这是对规则的解读，不是仓库自述。
5. **README 有一条四原则之外的成功观察项**：验证判据 `K:CLAUDE.md:65` 列 3 项（fewer unnecessary changes in diffs / fewer rewrites due to overcomplication / clarifying questions come before implementation），而 `K:README.md:144-147` 列 4 项，多出 `Clean, minimal PRs`（`K:README.md:147`）——载体间唯一的内容不对称，量级为 1 条。

**完成判据：** 三条 `diff` 与一条 `sha256sum` 命令均在 §8 复跑并给出同一输出；「完整/缺失/独有」三个判定各自对应到上列锚点。

### 3.2 Claude Code 专属面（frontmatter 与 manifest）

**skill frontmatter**（`K:skills/karpathy-guidelines/SKILL.md:1-5`，逐字）：`name: karpathy-guidelines`、`description: Behavioral guidelines to reduce common LLM coding mistakes. Use when writing, reviewing, or refactoring code to avoid overcomplication, make surgical changes, surface assumptions, and define verifiable success criteria.`、`license: MIT`。`description` 是 skill 的**触发指针**：它枚举「writing / reviewing / refactoring code」三个分支加四个目标（overcomplication、surgical changes、assumptions、verifiable success criteria）——即模型决定是否加载这份文本的唯一依据是这段描述，而不是正文。

**插件 manifest**（`K:.claude-plugin/plugin.json`，逐字）：`"name": "andrej-karpathy-skills"`、`"version": "1.0.0"`、`"license": "MIT"`、`"skills": ["./skills/karpathy-guidelines"]`、作者 `"forrestchang"`。`skills` 字段即 skill 的安装路径来源；manifest 内**没有** `hooks`、`commands`、`agents` 键（11 行已逐行读完，键序列为 name/description/version/author/license/keywords/skills）。

**市场 manifest**（`K:.claude-plugin/marketplace.json`，逐字）：市场名 `"name": "karpathy-skills"`、`"id": "karpathy-skills"`，插件条目 `"name": "andrej-karpathy-skills"`、`"source": "./"`、`"category": "workflow"`、`"version": "1.0.0"`。

**安装路径与标识符自洽性**：`K:README.md:105` 写 `/plugin marketplace add forrestchang/andrej-karpathy-skills`，`K:README.md:110` 写 `/plugin install andrej-karpathy-skills@karpathy-skills`。命令里的 `andrej-karpathy-skills` = plugin.json 的 `name` = marketplace.json 的 `plugins[0].name`；命令里的 `karpathy-skills` = marketplace.json 的 `name`/`id`。**命令与 manifest 自洽**（此项仅核对文本，未做真实安装，见 §7 U5）。

**陈旧点**：两条安装命令与 README 内两条 `curl` raw URL（`K:README.md:119`、`K:README.md:125`）都写旧 owner `forrestchang`，而现行 slug 是 `multica-ai`。实测均仍可用（301 与 raw 200，§4.1），因此这是**有效但过时的指针**，不是坏链。

**触发强度**：`CLAUDE.md` 由宿主自动注入（仓库自述见 `K:CURSOR.md:23`）；`.mdc` 由 frontmatter `alwaysApply: true`（`K:.cursor/rules/karpathy-guidelines.mdc:3`，`K:CURSOR.md:8` 复述）自动生效；skill 只能靠 `description` 路由按需加载。三者形式同为 `prompt-only`，但投递确定性不同：前两者「总是进上下文」，后者「可能不触发」。

**完成判据：** 上列每个字段值均可在对应 `K:` 锚点行逐字命中；「命令 ↔ manifest 名字一致」可用 `grep -n` 复跑；「无 hooks 键」由 11 行 manifest 全文与 §3.3 的全树 grep 共同判定。

### 3.3 通用面：无 AGENTS.md，非 Claude 宿主只能靠复制

- **本仓库没有 `AGENTS.md`**：`git ls-files` 仅 9 条（§6），根目录 `ls -a` 无 `AGENTS.md`；全树 `grep -rn -i -E 'agents\.md|codex|copilot|gemini|windsurf|cline|aider'` **零命中**。即对读取 `AGENTS.md` 的宿主族（Codex 等）本仓库**没有任何直接支持**，README 也只提「merge 进 CLAUDE.md 或新建 CLAUDE.md」（`K:README.md:151`）。
- **跨宿主策略是手工复制**：`.mdc` 复制到目标项目 `.cursor/rules/`（`K:CURSOR.md:13`）；只支持根指令文件的栈就复制 `CLAUDE.md`（`K:CURSOR.md:15`）；Cursor 个人 skill 目录可放 `SKILL.md`（`K:CURSOR.md:19`）；并明确 Cursor 默认不读 `.claude-plugin/` 与 `CLAUDE.md`（`K:CURSOR.md:24`）。这是一份**载体清单**而非机制适配。
- **零运行时强制**：无 `.github/`、无 CI、无测试文件、无 `*.sh`、无 `Makefile`（`git ls-files` 9 条全为 `.md`/`.mdc`/`.json`，见 §6）；`grep -rn -E 'hooks|PostToolUse|PreToolUse|settings\.json'` **零命中**。故 `hook` / `script·gate` / `test·gate` 三种形式在本快照**有明确缺席证据**，而非「未观察到」。

**完成判据：** 「无 AGENTS.md」「零入站通用宿主支持」「零 hook/脚本/测试」三项各有一条可复跑命令输出（§8 计数重测块）。

### 3.4 `EXAMPLES.md` 是示例而非规则

`EXAMPLES.md` 共 522 行、14838 字节，构成比例（实测）：**322 行在围栏代码块内（61.7%）**，36 个围栏行 = 18 个代码块（9 个 ```python、4 个 ```diff、5 个无语言块），9 个 `### Example` 标题，9 对 `❌` / `✅`，6 个 `## ` 节（4 个是四原则名，2 个是 `Anti-Patterns Summary`、`Key Insight`）。

判定：**它是示例/教学文件，不是规则载体。** 证据有三：(a) 六成以上行是代码或 diff，均以「User Request → ❌ 错误做法 → ✅ 正确做法」成对出现；(b) 唯一的规范化输出是 `K:EXAMPLES.md:500-505` 的反模式索引表与 `K:EXAMPLES.md:507-522` 的说明，其「Fix」列（如 "Only change lines that fix the reported issue"）逐条可回溯到 §2 已有规则，**未新增任何规则**；(c) 全树 `grep -rn EXAMPLES` **零命中**——本文件不被 README、CLAUDE.md、CURSOR.md 或任何 manifest 引用，只能靠目录列举被发现，是引用图中的孤立节点。反面表述：既然「没有任何指针指向它」，它对「改善 Claude Code」的杠杆为零，其价值仅在人类阅读。

**完成判据：** 322 / 36 / 18 / 9 / 9 / 6 六个计数与「零入站引用」可由 §8 命令重跑；「未新增规则」由 §2 与 `K:EXAMPLES.md:500-505` 的逐条对照支持。

### 3.5 强度汇总

| 载体 | 触发方式 | 形式 | 覆盖条目 | 强度限制 |
|------|----------|------|----------|----------|
| `CLAUDE.md` | 宿主自动注入（`K:CURSOR.md:23`） | prompt-only | R1–R32 全覆盖 | 仅文本；与项目指令合并时无优先级机制（`K:CLAUDE.md:3` 只说 merge） |
| plugin skill | `description` 按需路由（`K:skills/karpathy-guidelines/SKILL.md:3`） | prompt-only | R1–R32，但缺 `K:CLAUDE.md:62-65` 的验证判据 | 可能不触发；缺行 |
| `.cursor/rules/*.mdc` | `alwaysApply: true`（`K:.cursor/rules/karpathy-guidelines.mdc:3`） | prompt-only | R1–R32 全覆盖 | 仅 Cursor；对 Claude Code 无效（`K:CURSOR.md:24`） |
| README 安装路径 | 人工执行 `/plugin` 或 `curl`（`K:README.md:105`、`:119`） | prompt-only | 复述 P1–P4 | 需人执行；指针写旧 owner（§3.2） |

**完成判据：** 表中每行都指向至少一个 `K:` 锚点，且「形式」列只使用 §0 定义过的词；若某载体出现 hook/脚本证据，本节结论即被推翻——该证据在全树不存在（§3.3）。

## §4 Karpathy 失败模式：原帖核验

### 4.1 抓取方法与证据

引用 URL：`https://x.com/karpathy/status/2015883857489522876`（该 URL 在 `K:README.md:7`、`K:README.zh.md:7`、`K:skills/karpathy-guidelines/SKILL.md:9` 三处被用作来源）。四个引述块按顺序记为 **Q1 = `K:README.md:15`、Q2 = `K:README.md:17`、Q3 = `K:README.md:19`、Q4 = `K:README.md:136`**，§4.2 与 §5 复用这四个标签。

实测（`curl -sL -A '<浏览器 UA>'`，采集时间见 §8）：`HTTP 200`；`og:url` = 该 URL（证明页面身份）；页面含 `name:"Andrej Karpathy"`、`screen_name:"karpathy"`；四段引文片段在该页文本中各检出 **10 份副本**；其中 Q1 与 Q4 落在**同一段连续文本内**（两者索引差 2306 字符，中间无 JSON 字符串边界），说明它们来自同一篇长帖正文。页面另含线程中其它 status 的 id 与 4 个 `created_at_ms`（`1769459139000` = 2026-01-26T20:25:39Z 起），最早者与帖文首句 `A few random notes from claude coding quite a bit last few weeks.` 相邻，故引用帖日期约为 **2026-01-26（UTC）**。

**核验强度（诚实边界，另见 §7 U2/U4）**：本核验只能证明「这些片段存在于该 URL 页面的正文文本中」，不能逐字符证明「属于该 ID 单条推文的正文」（页面含线程其它条目，且该页两次抓取的内部结构不一致）；正文片段中存在 HTML 分词痕迹（如 `CLAUDE . md`）。

### 4.2 README 引文 vs 原帖：差异表

README 的四个 blockquote 是**引述**（`From Andrej's post:` / `From Andrej:`）。逐条比对结论：**无一是逐字完整引用**；Q3、Q4 是「删减压缩但保留原串」，Q1、Q2 还改写了措辞。差异点如下（左列锚点为 README 侧，右列为原帖侧）：

| 引述块 | 差异点（README 侧逐字） | 原帖侧逐字 | 判定 |
|--------|--------------------------|------------|------|
| K:README.md:15 | 「The models make wrong assumptions on your behalf」 | `The most common category is that the models make wrong assumptions on your behalf` | README 删去引导句 `The most common category is that` |
| K:README.md:15 | 「They don't manage their confusion, don't seek clarifications,」 | `They also don't manage their confusion, they don't seek clarifications,` | README 删 `also`、删每项的 `they` |
| K:README.md:15 | （无对应文本） | `and they are still a little too sycophantic.` | README 删去末句（映射见 §5 O1） |
| K:README.md:17 | 「don't clean up dead code...」 | `they don't clean up dead code after themselves, etc.` | `...` 标了省略，删 `after themselves, etc.` |
| K:README.md:17 | 「implement a bloated construction over 1000 lines when 100 would do.」 | `They will implement an inefficient, bloated, brittle construction over 1000 lines of code and it's up to you to be like "umm couldn't you just do this instead?" and they will be like "of course!" and immediately cut it down to 100 lines.` | 末句被改写；`1000 lines when 100 would do` 这一串原帖不存在（0 命中） |
| K:README.md:19 | 「code they don't sufficiently understand as side effects, even if orthogonal to the task.」 | `code they don't like or don't sufficiently understand as side effects, even if it is orthogonal to the task at hand.` | README 删 `don't like or`、`it is`、`at hand` |
| K:README.md:136 | 「LLMs are exceptionally good at looping until they meet specific goals... Don't tell it what to do, give it success criteria and watch it go.」 | `LLMs are exceptionally good at looping until they meet specific goals and this is where most of the "feel the AGI" magic is to be found. Don't tell it what to do, give it success criteria and watch it go.` | **两个片段均逐字**；`...` 省略中间一句 |

原帖还含三条 README **未引**、但与本文结论相关的句子，用于 §5 O1–O4 与 §9：`Things get better in plan mode, but there is some need for a lightweight inline plan mode.`、`Get it to write tests first and then pass them.`、`All of this happens despite a few simple attempts to fix it via instructions in CLAUDE . md.`

**完成判据：** 4 个引述块各有至少一行判定，且每个差异点两侧文本都给全；「两个片段逐字」与「`1000 lines when 100 would do` 原帖 0 命中」是可由 §8 复跑的判定。

## §5 失败模式 → 规则映射表

覆盖判据：`K:README.md:15`、`:17`、`:19`、`:136` 四段引文共 **11 个失败条款 + 1 个能力陈述**全部有判定行；判定只用四值：`直接` / `近似` / `无对应` / `反向张力`。O 行是原帖有、README 未引的条款，单列且不参与 README 覆盖率。

| # | 引述条款（README 逐字） | 锚点 | 规则 | 判定 | 依据 |
|---|--------------------------|------|------|------|------|
| C1 | 「make wrong assumptions on your behalf and just run along with them without checking.」 | K:README.md:15 | R1, R4 | 直接 | 规则要求显式声明假设、不确定就问 |
| C2 | 「They don't manage their confusion,」 | K:README.md:15 | R2 | 直接 | `Don't hide confusion.` |
| C3 | 「don't seek clarifications,」 | K:README.md:15 | R7 | 直接 | `Ask.`／`If uncertain, ask.` |
| C4 | 「don't surface inconsistencies,」 | K:README.md:15 | R5 | 近似 | 规则讲「多种解释不要静默选择」，未出现 inconsistency 一词 |
| C5 | 「don't present tradeoffs,」 | K:README.md:15 | R3 | 直接 | `Surface tradeoffs.` |
| C6 | 「don't push back when they should.」 | K:README.md:15 | R6 | 直接 | `Push back when warranted.` |
| C7 | 「They really like to overcomplicate code and APIs,」 | K:README.md:17 | R8, R15 | 近似 | 「code 复杂化」有 `senior engineer` 判据；**「APIs」无对应**（全树 `grep -rn -i api` 共 7 处：`K:README.md:17`/`K:README.zh.md:17` 的引文、`K:README.md:159`/`K:README.zh.md:159` 的模板示例、`EXAMPLES.md:47,51,415` 的示例文本；无任何**规则条款**涉及 API） |
| C8 | 「bloat abstractions,」 | K:README.md:17 | R11, R12 | 直接 | 单次使用不抽象、不加未要求的灵活性 |
| C9 | 「don't clean up dead code...」 | K:README.md:17 | R23（+R21, R22） | 反向张力 | 原帖抱怨不清理死代码；规则反而**禁止**删除既有死代码，只允许「提及」与清理自己造成的孤儿 |
| C10 | 「implement a bloated construction over 1000 lines when 100 would do.」 | K:README.md:17 | R14, R9 | 直接 | 200→50 与「不写投机代码」 |
| C11 | 「change/remove comments and code they don't sufficiently understand as side effects, even if orthogonal to the task.」 | K:README.md:19 | R18, R19, R24 | 直接 | 不改相邻代码/注释、不重构未坏的东西、每行可追溯到请求 |
| C12 | 「Don't tell it what to do, give it success criteria and watch it go.」 | K:README.md:136 | R25, R26, R31, R27 | 直接 | 属**能力陈述**而非失败模式；规则把「给成功标准」制度化为可验证目标 |
| O1 | （原帖未引）`and they are still a little too sycophantic.` | x.com（§4.1） | — | 无对应 | 全树无涉及谄媚/迎合的规则 |
| O2 | （原帖未引）`there is some need for a lightweight inline plan mode.` | x.com（§4.1） | R30 | 近似 | R30 只要求「多步任务给出简短计划」，未规定 inline/计划模式的时机与形式 |
| O3 | （原帖未引）`Get it to write tests first and then pass them.` | x.com（§4.1） | R27, R28 | 直接 | 与三条转换示例同向 |
| O4 | （原帖未引）`All of this happens despite a few simple attempts to fix it via instructions in CLAUDE . md.` | x.com（§4.1） | — | 无对应 | 不构成规则；它是作者对**文本载体效力有限**的自述，用于 §9 |

反向张力只有一条（C9），且仓库自己给了部分缓解（R21 提及、R22 清理自己的孤儿），但**没有**任何条款回应「清理既有死代码」这一原始诉求。C4、C7、O2 是三个「近似」，其共同形态是：规则把原帖的一个具体抱怨泛化成了通用判据，因而丢掉了原帖的具体面（inconsistency、API、plan mode）。

**完成判据：** 表中 `C1–C12` 共 12 行 + `O1–O4` 共 4 行，逐行含锚点与判定；四个判定值全部来自约定词表，且 `反向张力` 仅 1 条、`无对应` 2 条，可由 §8 计数重跑（`grep -c '^| C'`/`'^| O'`）。

## §6 覆盖表（9 个文件，全部通读）

`git ls-files` 输出 9 条，与下表 9 行一一对应（§8 有集合比对命令）。行数/字节为 `wc -l` / `wc -c` 实测；sha256 只对三份规则载体记录，见 §3.1。

| # | 文件 | 行数 | 字节 | 在快照中的角色 | 入站引用 | 通读 |
|---|------|------|------|----------------|----------|------|
| F1 | `CLAUDE.md` | 65 | 2357 | 规则正文（完整载体，含验证判据 L65） | `README.md:7,115,119,125,151`、`CURSOR.md:15,23,28` | 已读全 65 行 |
| F2 | `skills/karpathy-guidelines/SKILL.md` | 67 | 2518 | Claude Code 插件 skill 正文（缺 L62–65 对应内容） | `CURSOR.md:19,28` | 已读全 67 行 |
| F3 | `.cursor/rules/karpathy-guidelines.mdc` | 70 | 2638 | Cursor 项目规则（正文 ≡ CLAUDE.md L7–65） | `README.md:130`、`CURSOR.md:8,13,28` | 已读全 70 行 |
| F4 | `CURSOR.md` | 28 | 1955 | Cursor 安装/迁移说明 + 载体分工 + 维护规则（无规则正文） | `README.md:130` | 已读全 28 行 |
| F5 | `README.md` | 171 | 6198 | 英文门户：复述四原则、安装、推广块（L3–5，已剪除） | 无 | 已读全 171 行 |
| F6 | `README.zh.md` | 171 | 6042 | 中文门户：与 F5 行平行的翻译 | 与 F5 互链（`README.md:9`、`README.zh.md:9`） | 已读全 171 行 |
| F7 | `EXAMPLES.md` | 522 | 14838 | 教学示例 + 反模式索引（无规则正文） | **零入站引用** | 已读全 522 行 |
| F8 | `.claude-plugin/plugin.json` | 11 | 390 | 插件 manifest（name/license/skills） | 无文本引用（宿主按约定读取） | 已读全 11 行 |
| F9 | `.claude-plugin/marketplace.json` | 29 | 758 | 市场 manifest（市场名/插件条目/source） | 无文本引用 | 已读全 29 行 |

**完成判据：** 9 行 = `git ls-files` 的 9 条，且行数与 `wc -l` 一致（§8 给出代码块内的两组输出与集合比对结果）。

## §7 诚实清单与缺口

1. **无 `LICENSE` 文件，却有四处 MIT 声明**：根目录 `ls -a` 无 `LICENSE`（`LICENSE.md`/`LICENSE.txt` 亦无），`git ls-files` 9 条中无许可文件；声明出现在 `K:.claude-plugin/plugin.json:8`（`"license": "MIT"`）、`K:skills/karpathy-guidelines/SKILL.md:4`（`license: MIT`）、`K:README.md:171`、`K:README.zh.md:171`（均为 `MIT`）。即**许可声明无全文可依**，装机方无法从仓库取得 MIT 全文与版权行。
2. **`CURSOR.md` 的作用是「载体分工说明书 + 维护规则」，不是规则载体**：它 28 行全是安装/迁移/同步说明（§3.3），含唯一的维护约束 `K:CURSOR.md:28`。它对 Claude Code 的净贡献是把「哪份文件归哪个宿主」写清楚，从而暴露了 §3.1 的缺行问题。
3. **`README.zh.md` 与 `README.md` 是行平行翻译**（实测）：两文件同为 171 行；标题骨架（行号 + 级别）完全一致（16 个标题，行号 1/11/21/32/34/45/59/77/99/128/132/140/149/156/163/169）；12 个围栏行位置完全一致（6 个代码块；9 个裸 `` ``` ``、2 个 `` ```bash ``、1 个 `` ```markdown ``）；171 行的行类骨架（标题/引文/围栏/表格/列表/空行/正文）完全一致；字节相同的行 83 条（其中 62 条是空行，21 条非空：9 个 ```、```bash×2、```markdown、两条表格分隔行、`>`、`MIT`、两条 `/plugin` 命令、两条 raw URL 命令、`echo "" >> CLAUDE.md`）。**但代码块内文并非全同**：`K:README.md:92-94` 与 `K:README.zh.md:92-94` 的计划模板被翻译成中文（`1. [步骤] → 验证: [检查]`），`K:README.md:156-161` 的自定义模板同样被翻译，而 4 组命令块逐字相同。结论：**结构层是「只是翻译」，字面层不是全等**；翻译的语义忠实度无法机械验证（U4）。
4. **不可核验/受限项**：
   - **U1**：`research` 技能要求「起一个后台子代理做研究」，本会话因 `subagent` 深度上限（maxDepth 1）被拒（`Error: subagent depth 2 exceeds maxDepth 1`），故**无独立第二方核验**。补强方式是：本文全部数字由 §8 的可复现命令给出，任何第三方可在同一快照上重跑。
   - **U2**：原帖文本取自 x.com 未鉴权渲染页 HTML（不是 API），页面两次抓取的内部结构不一致（一次含 `NoteTweetResults` 键、一次不含），且含线程其它条目；核验强度止于「片段在该 URL 页面正文中」（§4.1）。
   - **U3**：宿主加载机制（Claude Code 自动注入 `CLAUDE.md`、Cursor `alwaysApply`、skill 按 `description` 路由）在本快照内只有**仓库自述**与 manifest 字段为证（`K:CURSOR.md:8,23-24`、`K:README.md:113`、`K:skills/karpathy-guidelines/SKILL.md:3`），未在任一宿主上实测。
   - **U4**：翻译忠实度、以及上游未来再次改名，均不可验证；`forrestchang`→`multica-ai` 的 301 只保证「现在可用」（§4.1）。
   - **U5**：插件/市场未经真实安装，无法确认宿主注册后的实际名字与落盘路径；只能核对 README 命令与 manifest 的自洽（§3.2）。
   - **U6**：`EXAMPLES.md` 的「未新增规则」是逐条对照的结论，不是机械可判定的证明；若某条「Fix」列文本存在我未发现的语义增量，该判定需修正。
5. **反向张力**：除 §5 C9 外，还有一条**载体级**张力——`K:CLAUDE.md:65` 的验证判据与 `K:README.md:147` 的第四项不对称（§3.1 行 5），使「指南是否在起作用」在不同载体下有不同的检核清单。
6. **剪除记录**：`K:README.md:3-5` 的推广块（3 行）与 `README.zh.md:3-5` 的对应行按「与行为规则无关」剪除，仅在此记录其存在。

**完成判据：** 六类缺口各自给出 `K:` 锚点或命令级证据；`U1–U6` 是**未取得证据的清单**，不得在别处被当作结论引用。

## §8 自审（命令与结果）

本节的全部命令在快照与本文档上只读复跑；时间戳为 UTC。

**A. 引文包含性核对**（归一空白后，逐 `K:` 行做子串包含；脚本读本文档自身）：

```python
import re
ROOT = '.refs/andrej-karpathy-skills/'
DOC  = 'findings/02-andrej-karpathy-skills.md'
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
cache, ok, fail = {}, 0, 0
for line in open(DOC, encoding='utf-8'):
    line = line.rstrip('\n')
    if not line.startswith('|') or '「' not in line or 'K:' not in line:
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    anchors = [c for c in cells if c.startswith('K:') and re.match(r'K:.+:\d+', c)]
    quotes  = [c for c in cells if c.startswith('「') and c.endswith('」')]
    if len(anchors) != 1 or len(quotes) != 1:
        print('AMBIGUOUS:', line[:50]); fail += 1; continue
    m = re.match(r'K:(.+):(\d+)(?:-(\d+))?$', anchors[0])
    path, a, b = m.group(1), int(m.group(2)), int(m.group(3) or m.group(2))
    cache.setdefault(path, open(ROOT + path, encoding='utf-8').read().splitlines())
    if norm(quotes[0][1:-1]) in norm(' '.join(cache[path][a-1:b])):
        ok += 1
    else:
        fail += 1; print('FAIL:', anchors[0], '|', norm(quotes[0][1:-1])[:60])
print(f'quotes_checked={ok+fail} OK={ok} FAIL={fail}')
```

输出：

```
quotes_checked=50 OK=50 FAIL=0
```

**B. 计数重测**（快照侧拆解为 4 / 18 / 9 / 5，文档侧为表行数）：

```
$ cd .refs/andrej-karpathy-skills
$ grep -c '^## [0-9]\.' CLAUDE.md                              # 原则节数
4
$ grep -c '^- ' CLAUDE.md                                      # 列表项数
18
$ sed -n '9p;19p;31p;47p' CLAUDE.md | grep -o '\.' | wc -l     # 4 条主旨句拆成 3+2+2+2 句
9
$ sed -n '5p;27p;43p;54p;61p' CLAUDE.md                        # 5 条非列表规范句
**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.
The test: Every changed line should trace directly to the user's request.
For multi-step tasks, state a brief plan:
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
$ git ls-files | wc -l
9
$ grep -cE '^\| R[0-9]+ \|' findings/02-andrej-karpathy-skills.md   # 规则表行数 = 32
32
$ grep -cE '^\| C[0-9]+ \|' findings/02-andrej-karpathy-skills.md   # README 条款行 = 11+1
12
$ grep -cE '^\| O[0-9]+ \|' findings/02-andrej-karpathy-skills.md   # 原帖独有条款行
4
$ grep -cE '^\| F[0-9]+ \|' findings/02-andrej-karpathy-skills.md   # 覆盖表行数 = 9
9
```

算术闭合：`9 + 18 + 5 = 32`（口径 A）；`R=32`、`C=12`、`O=4`、`F=9` 与 §2 / §5 / §6 的声明逐项一致。

**C. 字节级复跑**（哈希、两处空 diff、缺行定位、零强制形式）：

```
$ sha256sum CLAUDE.md skills/karpathy-guidelines/SKILL.md .cursor/rules/karpathy-guidelines.mdc
694a2d721e41c385f3db492838c23299826df5ba9809e3b0721aac70021e196a  CLAUDE.md
6e22cc54cb02a5e98ae42d06d9d7292db0c1b43894831b32879beb0166b2aea7  skills/karpathy-guidelines/SKILL.md
259cf32ac1a493b7bf863992bbb968079a2b6ffdce99dad092ec6f4e2764717d  .cursor/rules/karpathy-guidelines.mdc
$ diff <(sed -n '7,65p' CLAUDE.md) <(sed -n '12,70p' .cursor/rules/karpathy-guidelines.mdc) ; echo exit=$?
exit=0
$ diff <(sed -n '7,61p' CLAUDE.md) <(sed -n '13,67p' skills/karpathy-guidelines/SKILL.md) ; echo exit=$?
exit=0
$ grep -n 'These guidelines are working if' CLAUDE.md .cursor/rules/karpathy-guidelines.mdc skills/karpathy-guidelines/SKILL.md
CLAUDE.md:65:**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
.cursor/rules/karpathy-guidelines.mdc:70:**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
（SKILL.md 零命中）
$ grep -rn -E 'hooks|PostToolUse|PreToolUse|settings\.json' . --exclude-dir=.git
NONE
$ git ls-files | grep -E '\.github|\.sh$|Makefile|\.yml$|test'
NO CI/SCRIPT/TEST FILES
$ grep -rn EXAMPLES . --exclude-dir=.git
NONE
```

**D. 覆盖集合比对与文件卫生**：

```
$ diff <(cd .refs/andrej-karpathy-skills && git ls-files | sort) \
       <(grep '^| F' findings/02-andrej-karpathy-skills.md | sed -n 's/^[^`]*`\([^`]*\)`.*/\1/p' | sort)
（无输出；覆盖表 9 行与 git ls-files 9 条集合相等）
$ file findings/02-andrej-karpathy-skills.md
findings/02-andrej-karpathy-skills.md: Unicode text, UTF-8 text, with very long lines (574)
$ wc -l findings/02-andrej-karpathy-skills.md
400 findings/02-andrej-karpathy-skills.md
$ wc -c findings/02-andrej-karpathy-skills.md
42464 findings/02-andrej-karpathy-skills.md
$ tail -c 1 findings/02-andrej-karpathy-skills.md | xxd -p
0a
$ python3 -c "s=open('findings/02-andrej-karpathy-skills.md',encoding='utf-8').read(); print('ends_with_1_newline=', s.endswith(chr(10)) and not s.endswith(chr(10)*2))"
ends_with_1_newline= True
```

**E. 形式词表自查**：

```
$ grep -E '^\| R[0-9]+ \|' findings/02-andrej-karpathy-skills.md | grep -c 'prompt-only'
32
$ grep -E '^\| R[0-9]+ \|' findings/02-andrej-karpathy-skills.md | grep -cE 'hook|script·gate|test·gate'
0
```

32 条规则行全部标 `prompt-only`；`hook` / `script·gate` / `test·gate` 只出现在 §0 的词表定义与 §3.3 的缺席证据叙述里，未作为任何规则的强制形式。

**完成判据：** 上文每个代码块都可直接在快照与本文档上复跑；`FAIL=0`、两处 `exit=0`、集合比对无输出、`last_byte=0a`、`ends_with_1_newline=True` 同时成立，本文档才算自审通过。引文核对脚本的覆盖对象是「恰好一个 `K:` 单元格 + 恰好一个 `「」` 单元格」的行；`FAIL` 或 `AMBIGUOUS` 出现时须先改正文再重跑。

## §9 一句话结论

这份「对 Claude Code 的改善指南」的约束力**不来自文本，而来自载体**：文本层已经把话说死（R1–R32、全覆盖、`alwaysApply: true`、`skills` 字段指向唯一的 skill 目录），但仓库内没有任何 hook、脚本或测试闸门，四种载体全部是 `prompt-only`——它唯一能做的就是争取「被放进上下文」的机会（`CLAUDE.md` 自动注入 > `.mdc` alwaysApply > skill 靠 `description` 按需加载），而连原作者在同一篇被引帖里都写明：这些失败「All of this happens despite a few simple attempts to fix it via instructions in CLAUDE . md.」（§4.2、§5 O4）。因此可复核的判断是：**约束强度按载体排序（自动注入 > 始终应用 > 按需触发），规则文本本身不提供任何强制**；若要真正加约束，缺的是本仓库完全没有的那三类形式——`hook`、`script·gate`、`test·gate`。

**完成判据：** 本结论的三段依据（全覆盖的文本、零强制形式的缺席证据、作者自述）分别落在 §2/§3.5、§3.3、§5 O4，删除任一段则结论不成立。

## δ 修正记录（after `findings/99-verification.md` §2.2）

依 task-6 定点修正三处，未改动其它内容；行号为修正前位置。修正前版本：373 行 / 39227 B / sha256 `daae55201d66e6028f5c6c5f4456f4bf54e6438fcb8add63bcea24b58f717782`。最终 sha256 是**自指值**（写进本文件即失效），故此处只记修正前哈希，最终值随 task-6 汇报给出。

1. **必修 1（`:235`，§7-3）**：「36 个围栏行位置完全一致」→「12 个围栏行位置完全一致（6 个代码块；9 个裸 `` ``` ``、2 个 `` ```bash ``、1 个 `` ```markdown ``）」。围栏串用双反引号包裹，避免与本文件自身的代码围栏冲突；替换文本其余部分逐字按 §2.2。
   复跑：`grep -c '^```' .refs/andrej-karpathy-skills/README.md .refs/andrej-karpathy-skills/README.zh.md` → `12` / `12`；`grep '^```' .refs/andrej-karpathy-skills/README.md | sort | uniq -c` → `9 ``` `、`2 ```bash `、`1 ```markdown `。
2. **必修 2（`:198`，§5 C7）**：证据句改为「全树 `grep -rn -i api` 共 7 处：`K:README.md:17`/`K:README.zh.md:17` 的引文、`K:README.md:159`/`K:README.zh.md:159` 的模板示例、`EXAMPLES.md:47,51,415` 的示例文本；无任何**规则条款**涉及 API」（逐字按 §2.2）。
   复跑：`grep -rn -i api .refs/andrej-karpathy-skills --exclude-dir=.git | wc -l` → `7`；7 行的 `文件:行号` 与替换文本所列 7 处一一对应（`README.md:17,159`、`README.zh.md:17,159`、`EXAMPLES.md:47,51,415`）。
3. **建议 1（`:110`，§3.1-4）**：**已做**。「keep in sync」→「keep `CLAUDE.md` and `.cursor/rules/karpathy-guidelines.mdc` in sync（原文含链接标记，此处为压缩引文）」。理由：该处是压缩引文（`K:CURSOR.md:28` 原文含 `**[…](…)**` 链接标记），显式标注可避免与逐字引文混用同一个「」标记——即 verifier INFO 项 V02-14 指出的风险。

**修正后自审复跑**（脚本与命令同 §8）：

```
$ python3 <§8 的引文包含性核对脚本>
quotes_checked=50 OK=50 FAIL=0
$ grep -cE '^\| F[0-9]+ \|' findings/02-andrej-karpathy-skills.md
9
$ diff <(cd .refs/andrej-karpathy-skills && git ls-files | sort) <(grep '^| F' findings/02-andrej-karpathy-skills.md | sed -n 's/^[^`]*`\([^`]*\)`.*/\1/p' | sort)
（无输出）
$ wc -l findings/02-andrej-karpathy-skills.md ; wc -c findings/02-andrej-karpathy-skills.md ; tail -c 1 findings/02-andrej-karpathy-skills.md | xxd -p
400 findings/02-andrej-karpathy-skills.md
42464 findings/02-andrej-karpathy-skills.md
0a
```

**完成判据：** 两条必修的替换文本与 §2.2 逐字一致、建议项已做并给出理由；修正后引文核对 0 FAIL、`F1–F9` 与 `git ls-files` 集合相等、`quotes_checked` 仍为 50（未新增受审行）、文件仍以恰好一个换行结尾、除 `findings/02-andrej-karpathy-skills.md` 外零写入。
