# 四源 AI 编码代理规则集：融合分析报告

> 分析对象：**P** Ponytail、**K** Karpathy 插件（karpathy-ponytail-skills）、**H** DeepSeek Harness、**S** 个人经验（作者早期自建项目的 `AGENTS.md`，已去标识）
> 方法：4 个分析 teammate 分别产出 `findings/01–04`，Lead 融合为 `AGENTS.merged.md`，再由独立 verifier 对抗性核验（见 §10）。
> 本报告所有条款均可回溯到 `findings/*` 中的 `path:line`；未引入四源之外的新规则。
>
> **结构变更（收尾）**：规则已按场景拆分到 [`rules/`](rules/)（`base.md` 通用、`frontend.md`、`monorepo.md`），规则文本去除了来源标签并泛化为与框架/依赖无关的表述。因此 `AGENTS.merged.md`、`examples/`、`tailor/`、`tools/` 已删除；本报告与 `findings/` 保留为分析溯源（含 v0.1 49 条、v0.2 48 条的核验记录）。v0.2 的逐条文本可在本仓库首次提交 `ce8ef7c` 中查看；`.refs/` 恢复命令在 [`AGENTS.md`](AGENTS.md) 的「复核溯源」一节。溯源中的 **S** 来源已去标识：[`findings/04-experience.md`](findings/04-experience.md)（原文件名带项目名，已更名并清洗内容），当前工作树不再出现该项目的名称与路径。

---

## 0 结论速览（TL;DR）

1. **四个来源其实说的是同一件事的三层**：P/K 是"**少写**"（决策阶梯 + 手术式改动），S 是"**少写且交给类型系统**"（信任类型 + 配置最小化），H 是"**少写但可验证**"（同一条边界清单 + 机械门禁）。四者叠加后不冲突的部分构成一份可直接落地的通用规则集（`AGENTS.merged.md`，§0–§9 共 10 节；v0.1 为 49 条，经 writing-for-agents 审查后 v0.2 为 48 条，见 §9.3）。
2. **最值得提取的"对 Claude 的规则约束"其实不在规则文本里**：K 的规则正文**零处点名** Claude/Anthropic（`grep` 实证），唯一模型措辞是同句 "reduce common LLM coding mistakes"（`K:CLAUDE.md:3`）。它的"Claude 属性"全部来自**分发载体**：`CLAUDE.md` 文件名 + Claude Code 自动加载 + `/plugin install karpathy-ponytail@karpathy-ponytail`（`K:README.md:29,31,53-54`）。即：**规则是模型无关的，Claude 相关性是载体层的**——这是本次分析最反直觉、也最有用的一条结论。
3. **强制力光谱决定落地方式**：K 是纯自然语言（无 `allowed-tools`、无 hook、无 manifest）；P 有 hook 但**只注入提示、从不阻断**（无 `exit(2)`/`deny`/`permissionDecision`），真正的门禁是它自己仓库的 CI（副本一致性 + 9 条不变量 canary）；S 的强制力来自工具链（Vite+ 注入 + `prepare` 钩子）与项目校验入口；只有 H 把大量规则钉在 68 个 `verify-*` 脚本、覆盖率门禁、lefthook 钩子和产品级 sandbox/审批上。
4. **§4 表的 8 条内核中，#1–#5、#7、#8 至少两源互证**（#2、#5 为四源互证；#1/#3/#4 为 2–3 源，S 对 #1 只有隐含条款；#7/#8 为三源互证）；**#6 为 H 单源**（机制最完整，但 S 只要求"执行验证入口"、P/K 无对应条款）。
5. **冲突有 8 处，全部可以条件化吸收**（§6）：依赖策略（阶梯 vs 偏好成熟依赖）、测试重量级（最小检查 vs 100% 覆盖+快照）、歧义即停 vs 不停工、删除优先 vs 不删无关死代码、追溯 vs 根因扩大范围、文档负担、配置最小化 vs 部署可配置、代码可删 vs 已发布世代不可动。逐一给出裁决条件后，四源不再互斥。
6. **唯一"防漂移"的工程手法值得单独抄走**：把同一份规则投影到 N 个宿主，并用脚本强制逐字一致 + 关键不变量 canary（`P:scripts/check-rule-copies.js:15-27,44-58`）；H 的做法是把规则本身纳入词数预算 ratchet（`docs/AGENTS.md:54-58`）。两者结合 = "规则既不能漂移，也不能膨胀"。

---

## 1 分析范围与证据基线

| 源 | 标识 | 快照 | 规则载体规模 | 分析产出 |
| --- | --- | --- | --- | --- |
| **P** Ponytail | `DietrichGebert/ponytail`（MIT，v4.10.0） | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156` | `AGENTS.md`(32) + `.agents/rules/ponytail.md`(30) + 6 个 SKILL.md(120/41/57/44/50/71) + 6 个 hook + 7 个宿主投影 + `scripts/check-*.js` + CI | `findings/01-ponytail.md`（48 条规则） |
| **K** Karpathy 插件 | `AbdullahHameedKhan/karpathy-ponytail-skills` | `8869387dbb285d48b2582667b0f049b8d5a04a11` | 全树 5 文件：`CLAUDE.md`(104) / `AGENTS.md`(104) / `skills/…/SKILL.md`(121) / `.cursor/rules/*.mdc`(84) / `README.md`(72) | `findings/02-karpathy-plugin.md`（41 条规则） |
| **H** DeepSeek Harness | 本地仓库（branch `master`，0.1.7-rc 发布期） | `477b4f420553e8a52c2fbccc464d7561b239c443` | 根 `AGENTS.md`(182 行/1949 词) + 17 个子树 `AGENTS.md` + `docs/*` 规范层 + 14 个 SKILL.md + `scripts/` 一层 254 个 TypeScript 脚本（含 68 个 `verify-*`）+ `lefthook.yml` + 184 个 npm scripts | `findings/03-deepseek-harness.md`（A 层 74 条 + B 层 23 个机制） |
| **S** 个人经验 | 早期自建前端项目的 `AGENTS.md`（已去标识） | 78 行（工作树版本） | 单一文件：L1–27 工具注入区块 + L29–78 人工项目约定 | `findings/04-experience.md`（28 条，含 10 项"规则↔现实"抽查） |

全部取证均为只读：P/K 使用 `--depth 1` 克隆到 `.refs/`（分析后 `git status` 干净、HEAD 未变；**该副本已在收尾时删除**，恢复命令见 `README.md`「来源与记录」）；H 分析前后 `git status --short` 均为 0 行；S 未执行任何 `vp` 命令（`vp check --fix`/`build` 会写盘），源项目零改动。

---

## 2 逐源规则骨架

### 2.1 P · Ponytail：把"懒"变成一条可判定的阶梯

- **核心机制**：7 级**懒惰阶梯**，自上而下、命中即停：① 需要存在吗 → ② 本仓库已有 → ③ stdlib → ④ 平台原生 → ⑤ 已装依赖 → ⑥ 一行 → ⑦ 最小实现（`P:skills/ponytail/SKILL.md:34-42`）。
- **前置条件**：阶梯**在理解之后**运行——先读被改代码、端到端追一遍流程（`P:AGENTS.md:15`、`SKILL.md:97-101`）。
- **护栏**：6 类"绝不懒"——理解、信任边界输入校验、防数据丢失的错误处理、安全、无障碍、硬件校准；外加"用户明确要求的一切"（`P:SKILL.md:92-95,103-105`）。
- **测试底线**：非平凡逻辑留 ONE runnable check（assert 自检或一个小测试文件，无框架无 fixture）；平凡一行免测（`P:SKILL.md:107-112`）。
- **输出纪律**：代码优先 + 最多三行"跳过了什么/何时该加"（`P:SKILL.md:68-75`）；用户点名的解释不受此限（`:71-73`）。
- **留痕闭环**：故意保留天花板的简化写 `ponytail:` 注释（`AGENTS.md:28`）→ `ponytail-debt` 用 grep 收割成台账、给缺升级路径的打 `no-trigger`（`skills/ponytail-debt/SKILL.md:29-36`）。
- **技能族分工**：`ponytail`（常驻）/ `review`（当前 diff）/ `audit`（全仓）/ `debt`（标记台账）/ `gain`/`help`；review 与 audit **只列不改**，并显式声明"单个 smoke test 是下限，不是可删对象"（`P:skills/ponytail-review/SKILL.md:46-56`）。
- **强制力真相**：hook 全部 fail-open、**不阻断任何工具调用**；会失败的是仓库自己的 CI（规则副本一致性 + 9 条不变量 canary）（`P:scripts/check-rule-copies.js:44-58`、`.github/workflows/test.yml:29-36`）。⚠️ 注意 P 的 README 有营销数字（"~54% less code"等，`README.md:33`），其口径在自家 commit 内已迭代三次（`README.md:100`、`benchmarks/README.md:64-71`）——**提炼规则时不引入任何数字**。

### 2.2 K · Karpathy 插件：规则与载体分离的教科书样本

- **形态**：把 Karpathy 归纳的 LLM 编码失败模式与 Ponytail 阶梯合并成**同一份 103 行正文**，用 4 个载体分发：`CLAUDE.md`（Claude Code 自动加载）、`AGENTS.md`（Codex/OpenCode 等）、`skills/karpathy-ponytail/SKILL.md`（按需触发）、`.cursor/rules/*.mdc`（always-on）。
- **五个原则**（`K:README.md:61-65`）与文件段落 100% 映射：Think Before Coding（`CLAUDE.md:9-17`）、Simplicity—The Ladder（`:21-56`）、Surgical Changes（`:60-74`）、Bug Fixes（`:78-80`）、Goal-Driven Execution（`:84-100`）。
- **规则级全通用**：Karpathy 三段引文拆出 11 个失败模式，9 个有直接规则、1 个近似（"don't surface inconsistencies" 无对应规则）、1 个被**反向改写**（抱怨"不清理死代码"→ 规则"不删既有死代码"）（`findings/02 §2、§6-C1`）。
- **载体差异 = 强度差异**（`findings/02 §5`）：`CLAUDE.md` 与 `AGENTS.md` 正文**逐字节相同**（sha256 `f474d7bb…`，仅 H1 不同）；`SKILL.md` 正文与之一致（偏移 +17），靠 `description` 触发语按需载入；`mdc` **静默少 11 行**（强度档位块、`Switch:`、K31、K32）且削减了"Not lazy about"的硬件校准项——即 Cursor 用户拿到的是残缺版且无从得知。
- **无任何工具级硬约束**：全仓库不存在 `allowed-tools`/`model`/`disable-model-invocation`；`karpathy-ponytail` 这个插件名**仅由 README 的命令字符串推断**（仓库内无 manifest），本次分析未杜撰任何安装信息。
- **对用户问题的直接回答**（"提取该插件对 Claude 模型的规则约束"）：**规则文本对 Claude 无专属约束**；对 Claude 生效的是三层载体：① 项目根 `CLAUDE.md` → always-on；② plugin skill → 按需；③ `/plugin marketplace add` + `/plugin install` 的安装路径（`K:README.md:53-54`）。因此若要"约束 Claude"，把这份正文放进 `CLAUDE.md`/`AGENTS.md` 是强度最高的用法，装成 skill 是覆盖面最广的用法，但两者都不提供机制层保证。

### 2.3 H · DeepSeek Harness：把每条纪律尽量钉在可执行校验上

- **A 层：74 条仓库级纪律**。代表：① `AGENTS.md:144` **信任类型化的同进程边界**，只在 parser/config/queued/model-tool JSON/durable-file/worker/process/wire 校验；② `:145` 禁新增 `as unknown`（带 baseline ratchet）；③ `:110` 沙箱阻塞时"原命令不改地重试 + 最窄升级 + 必须有证据 + **绝不绕过测试失败与产品沙箱**"；④ `:114,116,117` 只跑与改动面匹配的最窄检查、只报告实际跑过的命令、不默认全量；⑤ `:136` **Model-visible ⟺ logged**；⑥ `packages/AGENTS.md:11` **每个抽象必须绑当前 owner 与需求**；⑦ `packages/AGENTS.md:14` **在做出决策的那次操作里执行决策**（否则不算 enforcement）。
- **B 层：23 个机械机制**。最有价值的三条：① `run-gates.ts:121-123` **把"被跳过"与"失败"同等对待**（不能用 skip 冒充通过）；② lefthook 是唯一本地阻断层（pre-commit 做 lint/空白/vendor/i18n/归档，pre-push 只跑 typecheck）；③ 15 个生成器 `--check` 把"派生文件必须重新生成"机械化。
- **C 层：产品级 agent 约束**。agent instructions 加载链（`AGENTS.md`/`CLAUDE.md` + `.local` + `$DSH_HOME/AGENTS.md`，单文件 1 MiB 上限）；guard 两插件是**软约束**（重复工具调用提醒明确 "without vetoing or rewriting calls"；超时策略依赖工具协作）；**硬约束**在 sandbox 三档 + 严格更宽的闭表升级 + 用户审批（仅当次调用生效）；`SESSION_FORMAT_VERSION=4` + required-on-read。
- **元规则**：规则文本自身有词数预算 ratchet，处置顺序 **relocate → condense → 才允许 raise**（`docs/AGENTS.md:54-58`）；编辑指令文件要改真实文件（`CLAUDE.md` 是软链，`AGENTS.md:178`）。
- **诚实缺口**（H 分析者自查）：根 `AGENTS.md` 1949/1950 词（≈0.05% headroom）与自身"保留 ≥5% headroom"不符；`packages/client/AGENTS.md` 3479 词却不在预算 manifest 内；文档目标与 manifest 三处漂移（如 architecture.md 2,400 vs 2410）。**规则密度远高于机械覆盖**：A07/A08/A10/A11/A12/A23/A31–A33/A47–A49/A51/A54/A63–A67 全靠评审与 skill 承载，永远不会自动变红。

### 2.4 S · 个人经验：最小主义前端项目的可执行约定

- **结构**：L1–27 是 **Vite+ 工具自动注入**区块（已证实：标记常量 `vite-plus/packages/cli/src/utils/agent.ts:77-78`、模板取自包内 `AGENTS.md` 且与项目 L1–27 **md5 完全相同**、`package.json:10 "prepare": "vp config"` 触发刷新、无标记不写入、永不新建 agent 文件）；L29–78 是人工约定。
- **人工约定的取向**：**反防御式编码 + 最小化声明**——"相信类型"（`S:69`）；一次性逻辑不提取工具函数（`S:70`）；不写多余类型标注（`S:71`）；第三方边界可收窄但禁用 `as` 掩盖错误（`S:72`）；只声明与默认值不同的配置（`S:46`）；不引入未使用依赖/配置块（`S:47`）；新增依赖先做成熟度尽调（`S:44`）；按官方最新文档核对 API、不照抄旧教程（`S:45`）。
- **交叉验证质量最高**：10 项"规则↔现实"抽查（8 一致/1 部分一致/1 无法验证），包括独立核对 pro-components 真实默认值证明 `settings.ts` 只覆盖了 3 个非默认键、`tanstackRouter` 废弃名确有其事（`router-plugin/dist/esm/vite.js:46 @deprecated`）、全仓 0 处 `as`。
- **⚠️ 关键工程提醒**：注入区块随 `vite-plus` 版本刷新，**不要搬进通用 AGENTS.md，也不要在标记区间内追加人工规则**（否则下次 `vp config` 会被覆盖）。

---

## 3 各源独有贡献（不可替代的部分）

| 源 | 独有贡献（其他三源没有） |
| --- | --- |
| **P** | ① 完整的 7 级判定阶梯与"命中即停"语义；② 简化天花板的**留痕→收割**闭环（`ponytail:` 注释 + `debt` 台账 + `no-trigger` 腐烂预警）；③ 只列不改的 review/audit 技能族与固定产出格式（`net: -N lines`）；④ 多宿主投影的**副本一致性 CI**；⑤ 明确的"用户坚持要完整版就照做"的止损条款。 |
| **K** | ① 把"模型失败模式"逐条映射到规则的方法论（F1–F11）；② 手术式改动三件套（不顺手改、不重构没坏的、匹配既有风格）；③ **目标驱动执行**（把任务转成可验证目标 + `[步骤]→verify` 计划）；④ 载体强度分析：always-on vs 按需、frontmatter 语义（`alwaysApply` vs `description`）；⑤ "每行改动可追溯到请求"的验收判据。 |
| **H** | ① **真实边界清单**（parser/config/queued/model-tool JSON/durable-file/worker/process/wire）——把"少写防御代码"变成可判定；② 类型逃逸 ratchet（`as unknown` 基线）；③ 沙箱受阻时的完整升级协议；④ 门禁编排原则：skip=failed、源码面/产物面分离、依赖图校验；⑤ 规则文本自身的词数预算与处置顺序；⑥ "在做出决策的那次操作里执行决策"的 enforcement 判据；⑦ 产品级 sandbox/审批/log 不变量与"Model-visible ⟺ logged"。 |
| **S** | ① 工具注入区块与人工区块的**边界处理**（`START/END` 标记、只覆写区间、永不新建文件）——对"AGENTS.md 会被工具改写"这一现代现实的处理范式；② "只声明与默认值不同的配置"的可操作判据；③ re-export 时只声明上游包、从同一入口导入；④ 生成物纪律（禁手改/重新生成/排除 fmt+lint/入库策略）；⑤ 规则↔现实的抽查方法论（拿库内真实默认值比对配置）。 |

---

## 4 共性规则：多源互证的"不可裁内核"

| # | 内核规则 | 互证来源 |
| --- | --- | --- |
| 1 | **先理解再动手**（读被改代码、端到端追流程；不理解的小 diff 是第二个 bug） | P: `AGENTS.md:15`、`SKILL.md:97-101`；K: `CLAUDE.md:34`；S: L45 隐含"先核对再落笔" |
| 2 | **最小实现**（YAGNI→复用→stdlib→原生→已装依赖→一行→最小代码；无 owner 的抽象不写） | P: `SKILL.md:34-42`；K: `CLAUDE.md:25-32`；H: `packages/AGENTS.md:11`；S: L46-47,70 |
| 3 | **根因修复**（grep 所有调用点，改共享函数一次） | P: `AGENTS.md:17`；K: `CLAUDE.md:80` |
| 4 | **信任类型 + 只在真实边界校验**（不给静态已保证的值写运行时防御；不用 `as`/`as unknown` 逃逸） | H: `AGENTS.md:144,145`；S: L69,71-72 |
| 5 | **检查必须能因回归失败**（否则不算检查；门禁没有红灯就没有意义） | P: `SKILL.md:107-112`；K: `CLAUDE.md:46`；H: `docs/testing.md:35,40`；S: L76 |
| 6 | **只报告实际验证过的结论**（失败即停、pending 报 pending、附阻塞证据） | H: `AGENTS.md:110,114`、`dsh-pre-push-checks:98,105,126`（**H 单源**；S: L23,76 只要求"执行验证入口"，P/K 无对应条款） |
| 7 | **有意的简化必须留痕**（天花板 + 升级路径；决策记录含备选方案） | P: `AGENTS.md:28`；K: `CLAUDE.md:44`；H: `.agents/notes/README.md:111` |
| 8 | **沟通与呈现纪律**（不藏困惑、呈现权衡与多解；代码优先、不写未请求的散文；被点名的解释给全） | P: `SKILL.md:68-75`（输出纪律）；K: `CLAUDE.md:11-17`（不臆断/不藏困惑/呈现权衡与多解）；H: `AGENTS.md:149,172`、`dsh-prose-standard:38`（具体、更短≠更好） |

> 说明：#7、#8 严格说未在四源全部出现，但在三源中以不同形式出现，故列入"共同骨架"；#1–#5 至少在两源中逐字同向，是本融合集的最高置信度部分。

---

## 5 融合规则集的结构（落地形态）

融合到 v0.2 的 `AGENTS.merged.md` 时按 §0–§9 共 10 节组织（48 条；该文件已删除，见顶部结构变更说明），与内核的对应关系：

| 组 | 内容 | 主要由谁贡献 |
| --- | --- | --- |
| §0 元规则 | 决策即执行、可机械核对、规则自身最小化、不动机器区块 | H + P + S |
| §1 动手之前 | 理解优先、显式假设、命名困惑、条件式"先问 vs 不停工"、推回与质疑、可验证目标 | K + P |
| §2 决策阶梯 | 7 级阶梯、无 owner 的抽象不写、不写样板、就近放置、边界正确优先、根因修复 | P + K + H + S |
| §3 改动纪律 | 只碰必须碰的、每行可追溯、孤儿与死代码、最短 diff 的条件、派生文件不手改 | K + P + S + H |
| §4 类型与边界 | 相信类型、真实边界清单、禁断言逃逸、判别式 switch、错误大声失败 | S + H |
| §5 依赖与配置 | 依赖决策条件式、不用未使用依赖、只声明非默认配置、官方最新文档 | H + P + S |
| §6 测试与验证 | 没检查不算完成、门禁要有红灯、按 CI 定重量级、只报告跑过的、行为而非正确、跑项目验证入口 | P/K + H + S |
| §7 沟通与输出 | 最短解释、点名解释不算债、具体措辞、更短≠更好 | P + H |
| §8 留痕 | 简化天花板标记与收割、决策记录（含备选）、文档随代码、审查只列不改 | P + K + H |
| §9 流程 | 提交历史、改写后重新取证、已发布世代不可动、安全红线、凭据与不可信输出 | H + P |

---

## 6 冲突与调和（显式裁决，不静默择一）

| # | 冲突 | 两侧原文（节选） | 裁决（写入融合条款的写法） |
| --- | --- | --- | --- |
| **C1** | **依赖策略**：阶梯优先 vs 偏好成熟依赖 | P：`AGENTS.md:22` "No new dependency if it can be avoided."；H：`AGENTS.md:139` "**Prefer maintained dependencies over hand-rolling** when they genuinely delete owned code and tests"；S：`AGENTS.md:44` "新增依赖前先确认社区成熟度与维护活跃度" | 写成**条件式**（融合条款 R5.1）：默认爬梯；新增依赖需理由 = ① 维护良好且真能删掉自有代码**与**测试，或 ② 原生确实不足（P 自己的 `docs/platform-native.md:209-211` 给出该例外）；且通过 S 的成熟度尽调。三者不互斥。 |
| **C2** | **测试重量级**：最小检查 vs 全覆盖+快照 | P：`SKILL.md:107-112`（ONE runnable check，无框架无 fixture）；H：`AGENTS.md:88,155`（每文件 100% 覆盖 + 每个非平凡可见改动配 keyless 录制快照）+ `packages/AGENTS.md:7`（产品可见插件必须有真实组合测试） | 用 **H 自己的折中模板** `AGENTS.md:116-117`（"证据匹配改动面 + CI 拥有穷尽覆盖 + 本地不重复全量"）作为条件：有 CI 矩阵的项目把重量级交给 CI，本地只跑最窄检查；无 CI 的项目落到 P 的下限。融合条款 R6.3 显式标注 ⟨条件式⟩。 |
| **C3** | **歧义即停 vs 不停工** | K：`CLAUDE.md:17` "If something is unclear, stop. Name what's confusing. Ask."；P：`SKILL.md:62` "Never stall on an answer you can default." | **按风险裁决**（R1.4）：高风险/不可逆改动先问；其余取最合理默认值继续，并在同一回复里声明假设与质疑。这与 K 的"呈现多解"（`CLAUDE.md:15`）和 P 的"同响应内质疑"（`SKILL.md:62`）都相容。 |
| **C4** | **删除优先 vs 不删既有死代码** | P：`AGENTS.md:24` "Deletion over addition."（+ audit 的 `delete:` 标签）；K：`CLAUDE.md:72` "Don't remove pre-existing dead code unless asked." | 拆成两条互不冲突的规则（R3.3）：**自己改动造成的孤儿必须清**（K:71）；**既有死代码只报告不删**（K:72）。P 的"删除优先"限定在"自己产生的孤儿 + 用户明确要求的简化 + review/audit 的只列不改产出"。 |
| **C5** | **每行可追溯 vs 根因修复扩大范围** | K：`CLAUDE.md:74` "Every changed line should trace directly to the user's request."；P：`AGENTS.md:17`（修共享函数会连带修好工单未点名的同级调用者） | R3.2：追溯原则用于**抵制顺手改动**；根因修复视作同一缺陷的必要范围，但必须在交付说明里点明"扩大了范围及原因"。 |
| **C6** | **文档负担**：P 不管文档 vs H 文档受管 | P：`SKILL.md:116-118`（只管构建什么，文风交给 Caveman）；H：`AGENTS.md:174`（文档伴随每个代码改动，README+JSDoc 同步） | R8.3：**改动影响文档就必须同步**；但"不为未请求的文档写作"。P 的"懒惰"只在代码与配置维度生效，不外推到文档/笔记维度。 |
| **C7** | **配置最小化 vs 部署可配置** | S：`AGENTS.md:46` "只声明与默认值不同的部分"；H：`AGENTS.md:141` "No hardcoded tunables…deployment-varying choices are validated Config fields" | R5.3 双条件：**库/工具的默认值**不重复声明；**随部署变化的取值**必须是显式可校验的配置字段（`DEFAULT_*` 常量不算可配置）。两者作用在不同对象上。 |
| **C8** | **代码可删 vs 已发布世代不可动** | P：`AGENTS.md:24` "Deletion over addition."；H：`AGENTS.md:7`（已发布 Session 世代"never move, overwrite, or delete"） | R9.3 限定域：**代码**遵循删除优先；**已发布/持久化数据世代**只允许新增版本化后继。冲突实为领域不同，融合条款按领域分别表述。 |

另有两处**同文件内部张力**（分析者已记录，未代作者消解，融合时按上述裁决处理）：K 自己 `CLAUDE.md:40`（Deletion over addition）vs `:72`；P 的阶梯第 5 级（不新增依赖）vs 护栏（"安全措施绝不简化"）在"是否引入经审计的安全库"场景无优先级定义——融合条款 R9.4 明确"安全红线优先于最小化"。

**条件式映射核对**：C1→R5.1、C2→R6.3、C3→R1.4、C4→R3.3、C5→R3.2、C7→R5.3、C8→R9.3 共 7 条已在 `AGENTS.merged.md`（已删除）标注 ⟨条件式⟩；**C6→R8.3 未标**，因为该裁决（改动影响文档就同步，但不为未请求的文档写作）不依赖项目取舍、且在四源内无反对条款，故按强规则写入，两侧原文仍完整保留在本表中。

---

## 7 强制机制光谱：从"提示"到"门禁"到"产品硬约束"

| 强度 | 机制 | 代表 | 真相 |
| --- | --- | --- | --- |
| 弱 | 提示注入（hook/skill/CLAUDE.md） | K 全部规则；P 的 runtime hooks | 每轮重注入可提高遵守率，但**不阻断任何工具调用**（P 明确 fail-open、无 deny）。 |
| 中 | 工具链注入 + 本地钩子 | S 的 Vite+ 注入区块（随版本刷新、只覆写标记区间）；项目的 `vp check`/`staged` 钩子 | 能改写工作区、能拒绝提交，但语义是"格式化/校验"，不是规则本身。 |
| 强 | 脚本门禁 + CI | P：规则副本一致性 + 9 条不变量 canary；H：68 个 `verify-*` + 覆盖率 + 快照 + lefthook（唯一本地阻断层） | 只有"能被回归弄红"的才真算门禁（H: `docs/testing.md:40`）；H 还规定 **skip = failed**（`run-gates.ts:121-123`）。 |
| 最强 | 产品级硬约束 | H 的 sandbox 三档 + 严格更宽闭表升级 + 用户审批（仅当次调用）；`SESSION_FORMAT_VERSION` required-on-read；loop 的 log-reconstruction desync 不变量 | 这是唯一"代理无法绕过"的层级；四源中仅 H 具备，也是把"规则"变成"系统属性"的样本。 |

**对落地方式的直接启示**：
1. 把规则写进 `AGENTS.md`/`CLAUDE.md` = 弱-中强度，收益靠"持久存在 + 措辞明确"，别指望阻断。
2. 想要稳定效果，选**少数几条**规则做成检查（副本一致性、生成物同步、类型逃逸 ratchet、格式、链接完整性），放进 CI——这是 P 和 H 的共同答案。
3. 真正需要"不可协商"的约束（密钥、危险命令、目录写权限），只能落在**产品级权限模型**上，规则文本只能作为说明。

---

## 8 落地建议

1. **并入任意项目**：复制 `rules/base.md`（前端项目再加 `rules/frontend.md`，多包仓库再加 `rules/monorepo.md`）的内容 → 与项目现有规则文件合并（保留项目专属段落；若项目使用会自动写 `AGENTS.md` 的工具，把人工内容写在注入区间之外）。也可以直接用 [`README.md`](README.md) 的提示词交给 agent 完成。
2. **先裁后并**：按附录 A 的三档（最小配置/大型 monorepo/前端项目）决定启用哪些组；7 条 ⟨条件式⟩ 条款必须先做一次项目内裁决（依据 §6）。
3. **机械化优先级**（投入产出比排序）：① 规则副本一致性（若多宿主投影）；② 生成物 `--check`；③ 类型逃逸 ratchet；④ 一段一个物理行 + 本地链接可达；⑤ 门禁编排把 skip 当 failed。
4. **维护机制**：规则文件本身设词数上限，超限按 relocate → condense → raise 处理；项目变更导致规则与现实不符时，优先改规则或改配置（像 S 的 P11 那样把含糊措辞改成可验证表述）。
5. **对 Claude/其他模型的适配**：规则正文保持模型无关（K 的做法）；"Claude 专属"的部分只放载体层（`CLAUDE.md` 位置、skill 触发语、plugin 安装路径）。若需要同一规则同时服务多个宿主，用 P 的"薄适配器 + 副本一致性门禁"，不要手工维护多份文本。

---

## 9 局限与未证实项（来自各 findings 的不确定项，保留原样）

- **P**：未实跑其 CI/benchmark；阶梯与护栏的优先级在原文中无定义；档位过滤是 canary 而非完备；`__init__.py` 存在第二套档位过滤实现（drift 风险）；benchmark 数字已标 `[benchmark]` 且口径自相矛盾，未采用。
- **K**：无 manifest，"plugin 名/marketplace 名"仅由 README 命令字符串推断；"Claude Code 自动加载 CLAUDE.md"是 README 单方断言，未实测；skill 按需触发未做加载实验；README 引用的 Karpathy 原文无出处链接，只能以"仓库内引文"身份使用。
- **H**：所有"失败后果"由脚本退出口径推得，未实际触发门禁；文档目标与 manifest 三处漂移未判定权威侧；根 `AGENTS.md` headroom 与自身规则不符；`verify-package-invariants` 的判定细节未逐行核验；A 层是主干而非穷尽清单。
- **S**：未执行任何 `vp` 命令（避免写盘），故"当前代码能否通过 check/test"无法验证；Vite+ 注入时间线不确定；P11（不手写 `createFileRoute` 路径字符串）与现实的张力建议改写为可验证表述。
- **全局**：所有 `path:line` 绑定到本文 §1 的快照；H 处于 0.1.7-rc 发布期且文档在词数上限附近，行号后续易漂移，复用前建议先核对 sha。四源的营销/基准数字一律未进入规则。

### 9.1 独立核验与更正记录（`findings/99-verification.md`）

> 以下为 **v0.1（49 条）**的核验记录；v0.2 简化后的复核见 §9.3。

独立 verifier 以 fresh 上下文做了 41 条抽检：**PASS 28 / FAIL 12 / UNVERIFIED 1**。关键结论与更正：

- **融合件本体通过**：`AGENTS.merged.md` 的 49 条（R0.1–R9.5）**49/49 可回溯到 ≥1 源**，0 条无源、0 条四源外新规则。
- **头条断言实测成立**：K 规则正文零 Claude/Anthropic；P 的 hook 无 `exit(2)`/`deny`/`permissionDecision`；H 抽检 14 个 gate 名全部命中且 `run-gates.ts:121-123` 的 skip=failed 语义精确；S 的 Vite+ 区块与包内模板 md5 一致（`ee8ea10f…`）；K 的 `CLAUDE.md`/`AGENTS.md` 正文 sha `f474d7bb…` 逐字节相同；**P 与 K 的 7 级阶梯 `diff` 为空**；四源规则计数 P=48 / K=41 / H A=74 / S=28 与 findings 一致。
- **本文已更正的错误**：① "9 组 35 条" → §0–§9 共 10 节 49 条（3 处）；② "8 条护栏不变量" → 9 条不变量 canary（3 处，`check-rule-copies.js:44-58` 的 `INVARIANTS` 数组有 9 个元素）；③ §4 #6 的 S 来源错配（Vite+ checklist 不能证明"只报告实际验证过的结论"）→ 改为 H 单源并注明；④ §4 #8 规则名与来源对齐（K 的来源支持"呈现权衡/多解"，非"输出最短"）；⑤ §0 #4 的"四源互证"表述修正为"至少两源互证"并逐条标注源数；⑥ H 载体统计 15→14 个 SKILL.md、267→254 个 TS 脚本（含 68 个 `verify-*`）；⑦ §6 补 C1–C8 与 ⟨条件式⟩ 条款的映射核对（C6 未标的原因）。
- **已就地更正的 findings 级 errata**（Lead 复核，改写前内容见 verifier 报告 §3）：`findings/01` 的"8 条不变量"→9 条、R40 引文行号 `:71-74`→`:76`；`findings/04` 的 `package.json:9`→`:10`、`updateAgentInstructions`→`updateExistingAgentInstructions`。
- **计数口径说明**：H 的"267 个脚本"不可复现，本文与 `findings/03` 均已改为实测口径（`scripts/` 一层 274 文件 / 其中 254 个 `.ts`）；四源其余计数（P=48、K=41、H A=74、S=28）经核验成立，未改。
- **追加更正（第二轮）**：verifier 报告 §3 的其余条目已一并处理——`findings/02` 的 `Claude` 行号枚举（实为 README `:3,29,31,49,51` 的行文与 `:40,43,45,46` 的文件名）、`findings/03` 的 H 载体统计（14 个 SKILL.md / `scripts/` 一层 274 文件含 254 个 `.ts`）与 A59 引用块缺失的链接目标、本文 §10 的 findings 行数（应按更正后的实际行数计）。各 findings 末尾均已附"更正记录"。
- **追加更正（第三轮，verifier §6 增量复核发现）**：① §0 #4 改为"§4 表 8 条中 #1–#5、#7、#8 至少两源；#6 为 H 单源"；② §2.4 的 `package.json:9`→`:10`；③ §9.2 删除两处不实的"附录 A.3 已提示"表述并去掉 A57 重复项；④ `findings/01` §3.2 的 9 条不变量括号补全 `Lazy code without its check is unfinished`；⑤ §4 #6 去掉关联较弱的 `AGENTS.md:117`；⑥ §1 H 行补"一层"限定；⑦ §9 的"未修正项"改为"计数口径说明"。`AGENTS.merged.md` 经全量标签审计（91 个引用点、0 issue）判定通过，49 条 49/49 可回溯。

### 9.2 有意未并入融合件的重要规则（取舍记录）

| 源 | 未并入项 | 理由 |
| --- | --- | --- |
| P | R03/R04 三档强度与关闭开关、R05"仅编码任务"适用范围、R38 禁止打印每仓库节省数字 | 交互形态/品牌专属；R05 与 R38 本身通用，但依赖"常驻模式"这一 P 特有机制，通用文件里无对应物 |
| H | A18 Model-visible ⟺ logged、A52 HMR 安全测试、A74 UI 文案归 locale | 通用但绑定特定架构（session 日志、Cordis fiber、locale 字典）；未并入通用条款，建议在具备对应基础设施的项目里按 `[H:…]` 出处单独引入 |
| H | A16/A17/A19–A21/A24（架构不变量）、A26/A29（strict/branded id）、A49/A53/A54/A56/A57（测试细则）、A62、A65–A69、A72/A73 | 产品/基础设施专属，或依赖 H 的门禁与 CI 矩阵；作为"独有贡献"记录在 §3，不进入通用条款 |
| S | V1/V2/V4（Vite+ 专属）、P8 的泛化形式（新文件落入约定目录） | Vite+ 专属；P8 泛化形式需要项目自身有稳定分层，未升级为通用条款；其泛化提示见 `AGENTS.merged.md` 附录 A.3 的"页面组件就近放置"同源条目（S:63） |
| K | K20 档位开关、K31/K32 收尾判据 | 交互/品牌专属；K31 的"弱标准需澄清"已由 R1.6 吸收 |

### 9.3 v0.2 简化（按 `writing-for-agents` 审查）

对每个场景的规则集做了一次以"agent 消费者"为标准的审查（杠杆：单一事实源、上下文负载、分支披露、正向措辞、冗余与 no-op），并落到 `AGENTS.merged.md` v0.2：

- **删重复**：R0.4（机器管理区块）与 `machine-block` 片段重复 → 从基座删除，只保留在按需追加的片段里；`monorepo` 片段的"规则预算"整条与 R0.3 重复 → 删除；R8.3 里"一个事实只有一个 home"与 R0.3 重复 → 删除。
- **删/降场景专属**：机器区块、门禁编排、双语三件套等只对部分项目成立的内容，全部下沉到 `--add` 片段（分支披露），基座不再携带。
- **正向措辞**：把"不写 X / 不要 Y / 绝不 Z"改写成目标行为（如"只建被要求的东西""改动限于请求范围""已经保证的路径直接写"），仅安全红线（R9.4）与沙箱/测试失败（R6.4）保留禁令措辞并配正向动作。
- **压缩每条**：平均条款 114 字符（原 ~180）；`minimal` 档从 36 条/78 行降到 **19 条/46 行**，`full` 从 49 条降到 **48 条**；生成物不再默认附"裁决记录"表（条款正文已含裁决结果，表格属重复上下文负载，需要时用 `--with-decisions`）。
- **completion criteria**：R6.1（"会因该回归失败的可运行检查"）、R6.2（"门禁能被回归弄红"）保留可判定的完成条件，作为该组规则的 demand。
- **待复核**：本条所述为 Lead 自查；简化后的 48 条与四源出处的对应关系需 verifier 再核（见本文件 §9.1 的复核流程）。
- **v0.2 复核结果（verifier 第四轮）**：语义保真 12/12、引用可回溯、产物自检通过，判定"可对外引用"；提出 3 项必须修正，已全部修复——① R3.3 恢复 ⟨条件式⟩ 标记（与 A.5 清单一致）；② `minimal` 档补回 R9.4（安全红线），18→19 条；③ base↔snippet 去重（`frontend` 片段由 6 条减到 2 条、`monorepo` 由 5 条减到 4 条，其余由 base 的 R3.5/R2.4/R6.6/R5.4/R8.2 覆盖）。同时补回压缩中丢失的源要求（R9.1 裸 `--force`、R0.3 论证、R2.2 防御性拷贝、R7.3 精确名词、R6.1 无框架/fixture、R6.3 快照出处）。
- **v0.2 收尾（verifier 第五轮 + Lead 微调）**：第五轮 7 项全 PASS，唯一残项为本文一处数字（18 条/45 行 → 已改为 19 条/46 行）。随后两处非阻塞优化已应用：`monorepo` R10.3 改为只讲"子包 README 记录可消费信息"（去掉与 R8.3 重复的同提交句）；A.2 补回"根文件只放常设指令、细节下沉子树"的层级规则 `[H:docs/AGENTS.md:21-22]`。**未采纳**：`S:25`（`vp env doctor`）属 Vite+ 注入区块的专属命令，按 A.4 的边界原则不进入通用条款，仅保留在 `machine-block` 场景说明中。
- **场景拆分（verifier 第七轮）**：按"规则必须与框架/依赖无关"重写为 `rules/base.md`（35 条）+ `frontend.md`（3 条）+ `monorepo.md`（6 条），并删除合并稿与工具链。verifier 复核：框架/依赖名零命中、无语义失真、三条文件无重复、README 提示词可执行；同时指出三处缺口，已修复——R6.3（测试重量级按 CI 定）与 R6.4（权限/沙箱阻塞时的升级协议）补回为通用条款；**R0.1（决策即执行/enforcement）判定为可删**（对代理是抽象元规则，接近 no-op），连同其他有意收窄项一并记在此处：R1.3 并入"不确定就问"、R2.2/R2.3 合并为"只建有当前使用者的东西"、R3.4 由阶梯与"改动限于请求范围"覆盖、R4.4（判别式 switch）与 R8.4（审查只列不改）属语言/工作流专属、R0.2/R0.3 移入 README「维护」。另修掉 README↔REPORT 的循环指针（`.refs/` 恢复命令现只在 README「来源与记录」一处）。

---

## 10 溯源附录

**产出物**
- `AGENTS.merged.md` —— 融合规则集（§0–§9 共 10 节、v0.2 简化后 48 条规则 + 3 个附录）**已删除**，其内容按场景拆分进 [`rules/`](rules/)（首次提交 `ce8ef7c` 保留原文）
- `findings/01-ponytail.md`（319 行 / 48 条规则）
- `findings/02-karpathy-plugin.md`（238 行 / 41 条规则）
- `findings/03-deepseek-harness.md`（368 行 / A 层 74 条 + B 层 23 机制）
- `findings/04-experience.md`（141 行 / 28 条规则 + 10 项抽查）
- `findings/99-verification.md`（119 行）—— 独立 verifier 的对抗性核验（41 条抽检 + 全量引用审计 + 覆盖缺口）

**证据基线**
| 源 | 引用形式 | 快照 |
| --- | --- | --- |
| P | `[P:path:line]`，相对 `.refs/ponytail/` | `e3ba2aa6f1e6f0bc4d69eb09c9f0d0a93af56156`（2026-09-14） |
| K | `[K:path:line]`，相对 `.refs/karpathy-ponytail-skills/` | `8869387dbb285d48b2582667b0f049b8d5a04a11`（2026-06-25） |
| H | `[H:path:line]`，相对 `deepseek-harness/` | `477b4f420553e8a52c2fbccc464d7561b239c443`（master，2026-09-24） |
| S | `[S:AGENTS.md:line]` | 78 行工作树版本（未执行 `vp` 命令，源项目零改动） |

**独立核验**（详见 `findings/99-verification.md`）：核验者以 fresh 上下文抽样打开被引用的原始文件与行号，检查引用文本存在性、规则/营销的区分、中文归纳是否夸大、融合件是否无源、冲突是否被静默择一、统计断言是否属实。

**本地参考副本（已删除）**：`.refs/ponytail`、`.refs/karpathy-ponytail-skills`（`--depth 1` 克隆，仅用于本次分析；收尾时按用户要求删除）。需要复核 `[P:…]`/`[K:…]` 行号时，用 `README.md`「来源与记录」一节的两条 `git clone --depth 1` 命令按需恢复。
