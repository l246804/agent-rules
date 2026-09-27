# 03 — DeepSeek Harness 的 agent 规则集与约束（task-3）

> 中文为分析者转述；`>` 引用块内为保证逐字的英文原文（超长段落按需截断，截断处标 `…`）。
> 每条规则带 `path:line` 出处；gate 名称全部取自 `package.json` / `scripts/` 实读，未凭印象构造。
> 强制形式四值：`prompt-only`（纯文本规则，靠模型遵守）/ `hook`（git 钩子本地阻断）/ `script·gate`（可执行校验，聚合运行）/ `test·gate`（测试或覆盖率门禁）。

## 0 溯源

| 项 | 值 |
|---|---|
| 仓库 | `deepseek-harness`（本地只读克隆 `/home/leihaohao/workspace/deepseek-harness`） |
| 提交 | `477b4f420553e8a52c2fbccc464d7561b239c443`（`git rev-parse HEAD` 实测；branch `master`） |
| 提交标题 | `Merge pull request #5180 from deepseek-harness/rel/dsh-0.1.7-rc.2`（2026-09-24 21:39:59 +0800） |
| 源仓库洁净度 | `git status --short` 输出 **0 行**（分析前后各测一次，均空）；未执行任何 git 写命令或文件写操作 |
| 规模 | 312 个 `packages/<group>/<pkg>/`；`package.json` 184 个 scripts；`scripts/` 下一层 274 个文件（其中 254 个 `.ts`，含 68 个 `verify-*.ts`）；17 个子树/Markdown `AGENTS.md`（另有 4 个 1 行 snapshot 夹具占位） |
| 规则层级 | 根 `AGENTS.md`(182 行/1949 词) + 子树 `AGENTS.md` + `docs/*.md` 规范层 + `.agents/skills/*/SKILL.md`(14 个 SKILL.md，15 个技能目录) + `.agents/notes/README.md` 笔记政策 + 机械层(`scripts/` + `lefthook.yml` + CI workflows) |
| 排除 | `README.md` / `README.zh.md` / `BENCHMARK.md` / `BRAND_GUIDELINES*` 等营销与品牌文案不计入规则；`vendor/`（内置上游副本）规则单独标注 |
| 引用基线与复核 | 行号取自上述 commit 的工作树；引用以 `read` 工具输出逐条核对（§8 说明方法） |

**规则载体清单（均实读，行数为 `wc -l` 实测）**

| 载体 | 行数 | 角色 |
|---|---|---|
| `AGENTS.md`（根；`CLAUDE.md` 软链指向它） | 182 | Standing orders：每会话都需在上下文的规则 |
| `packages/AGENTS.md` / `packages/client/AGENTS.md` / `packages/web/AGENTS.md` / `packages/experimental/AGENTS.md` / `packages/schedule/AGENTS.md` | 28 / 158 / 5 / 9 / 11 | 子树 orders |
| `docs/AGENTS.md` | 76 | 文档标准（结构、层级税、写作规则、词数预算、slop 清单） |
| `docs/testing.md` / `docs/defensive-patterns.md` | 55 / 33 | 测试政策 / 缺陷类防护模式 |
| `.agents/notes/README.md` + `notes/*/AGENTS.md` ×3 | 125 + 7/13/7 | Agent Notes 政策（RFC 式决策记录） |
| `.agents/skills/dsh-pre-push-checks/SKILL.md` | 136 | push 前证据选择（本仓库最重要的"工作流规则"载体） |
| `.agents/skills/dsh-prose-standard/SKILL.md` | 81 | 文风标准（契约优先，反对为缩短而缩短） |
| 其余 13 个 SKILL.md | 21–172 | 专项工作流（文档、评审、归档、CI 可靠性、UI/UX、性能、GIF 录制、翻译、CoT 清理等） |
| `scripts/AGENTS.md` / `benchmarks/AGENTS.md` / `website/AGENTS.md` / `.github/AGENTS.md` / `native/system/AGENTS.md` / `snapshots/AGENTS.md` / `vendor/AGENTS.md` / `apps/cli/tests/profiles/AGENTS.md` | 5 / 16 / 23 / 3 / 28 / 17 / 7 / 7 | 其余子树 orders |
| `lefthook.yml` | 55 | 唯一本地阻断层（pre-commit / pre-merge-commit / pre-push） |
| `scripts/doc-budgets.manifest.json` | 8 条目 | 词数上限 ratchet（机器可读） |

## 1 一句话定位

DeepSeek Harness 是一个 all-plugin Cordis agent harness（`README`+`packages/README.md`），其规则集性格是**"把每一条纪律都尽量插到可执行校验上"**：根 `AGENTS.md` 只放 1–3 行的 standing orders 并链接其 home（`docs/AGENTS.md:21`），细则下沉到子树 `AGENTS.md` 与 `docs/`，再由 68 个 `verify-*` 脚本 + 生成器 `--check` + 覆盖率/快照门禁 + lefthook 钩子机械兜底——规则文本本身受词数预算 ratchet 管（`docs/AGENTS.md:58`）。同时它是**极少数把"给 AI 代理的产品级约束"（sandbox 分档与升级审批、loop guard、日志不变量）与"给 AI 代理的仓库级工作纪律"写在同一个仓库里**的样本。

## 2 A 层规则清单（仓库级"给 AI 代理的工作纪律"）

分类：`兼容性` `验证` `安全` `架构不变量` `类型安全` `依赖` `注释命名` `测试` `文档` `笔记` `提交PR` `格式` `元规则`
强制形式：`prompt-only` / `hook` / `script·gate` / `test·gate`

### A1 兼容性与变更纪律

- **[A01]** 公开 API 处于预稳定期，改动必须同步更新**每一个** consumer；已发布的 Session 世代只能新增版本化后继，绝不移动/覆盖/删除。｜兼容性｜prompt-only + script·gate｜`AGENTS.md:7`
  > "Public APIs are pre-stable; update every consumer. … may add a version-named successor but never move, overwrite, or delete committed generations; predecessors imply neither fallback nor downgrade support. SQLite uses monotonic `SCHEMA_VERSION`."
- **[A02]** 只有 `dsh` profiles 能启动受支持的 Node 应用；包 bin、demo、公开 SDK argv 逃逸一律禁止。｜架构不变量｜script·gate（`verify-application-entrypoints`）｜`AGENTS.md:11`
  > "**Application launch.** Only `dsh` profiles launch supported Node apps; package bins, demos, and public SDK argv escapes are forbidden"
- **[A03]** 持久化类型的改动必须显式"致谢"（记录变更认可），而不是悄悄改类型。｜兼容性｜prompt-only + script·gate（`verify-persistence-changes`）｜`AGENTS.md:9`
  > "Acknowledge [declared persistence-type changes](docs/cookbook/reviewing-persistence-type-changes.md)."
- **[A04]** loop / session 生命周期 / `SessionEventMap` 的改动必须**同一个 PR** 内更新 TypeScript 与 Python 两个 SDK 的期望输出，因为 `pnpm run test` 两者都不覆盖。｜兼容性/测试｜prompt-only（有快照门禁但覆盖不完整）｜`AGENTS.md:158`
  > "**Both SDKs project the loop.** Agent-loop, session-lifecycle, and `SessionEventMap` changes update the TypeScript and Python SDK expected outputs in the same PR; `pnpm run test` covers neither"

### A5 命令、验证与"无法本地验证时怎么办"

- **[A05]** 沙箱阻塞了 `gh`/`pnpm`/构建/测试/生成器所需的凭据、网络、IPC、watch 或嵌套 `sandbox-exec` 时：**原命令不改地重试**并申请最窄的主机升级；必须拿出沙箱证据；**绝不绕过测试失败或产品沙箱**。｜验证/安全｜prompt-only｜`AGENTS.md:110`
  > "If a required `gh`, `pnpm`, build, test, or generator command fails because the sandbox blocks credentials, network, IPC, watching, or nested `sandbox-exec`, retry unchanged with the narrowest host escalation. Require sandbox evidence; never bypass test failures or the product sandbox."
- **[A06]** push 前按 `dsh-pre-push-checks` 选择最窄的检查；**只报告实际跑过的命令**；`gh stack sync` 后必须立刻验证，检查通过前不得合并。｜验证/提交PR｜prompt-only + hook（pre-push 仅 typecheck）｜`AGENTS.md:114`
  > "Before pushing, follow [dsh-pre-push-checks](.agents/skills/dsh-pre-push-checks/SKILL.md); report only commands run. After `gh stack sync`, validate immediately; do not merge before checks pass."
- **[A07]** 证据必须匹配改动面（聚焦行为测试、模型/用户输出快照、docs 用 `doc-sync`、发布路径用 built smoke、provider 用真 API e2e）。｜验证｜prompt-only｜`AGENTS.md:116`
  > "Match evidence to the surface: focused behavior tests, model/user-output snapshots, `doc-sync` for docs, built smokes for published paths, and real-API e2e for providers."
- **[A08]** 绝不默认跑全量套件，也不为 commit/push 重复已通过的检查；CI 拥有穷尽覆盖与平台矩阵，本地全量只在显式要求、诊断 CI、或改动确实全局时进行。｜验证｜prompt-only｜`AGENTS.md:117`
  > "Never default to the full suite or repeat a passing check for commit or push. CI owns exhaustive coverage and the platform matrix; rehearse all locally only by explicit request, for CI diagnosis, or for an irreducibly repository-wide change."
- **[A09]** CI 覆盖率门禁是 `test:coverage`（每文件 100%，范围 `packages/*/*/src`）而**不是** `test`。｜验证｜test·gate｜`AGENTS.md:88`、`AGENTS.md:118`
  > "`pnpm run test:coverage`  # CI coverage gate: per-file 100% on packages/*/*/src"
  > "`test:coverage`, not `test`, is the CI coverage gate"
- **[A10]** 有一个**没有普遍本地基线**的显式表述：除钩子外没有默认基线，每个行为改动都需要"会因该回归而失败"的最窄测试。｜验证｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:29`
  > "There is no universal local baseline beyond the hooks. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression; add broader checks only for surfaces the diff actually reaches."
- **[A11]** 相关检查在普通 push 前失败就停下修好或说明阻塞，**不要"push 了指望 CI 不一样"**；失败的检查不得声称通过，pending 就报 pending。｜验证｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:98`、`.agents/skills/dsh-pre-push-checks/SKILL.md:126`
  > "If a relevant check fails before an ordinary push, stop and fix or explain the blocker. Do not push and hope CI differs."
  > "Report pending checks as pending."
- **[A12]** 只有用户显式要求或同意才能绕过本地钩子，并须如实报告失败内容与为何预期 CI 不同。｜验证｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:105`
  > "Bypass a local hook only when the user explicitly asks or agrees, and report exactly what failed and why CI is expected to differ."

### A13 安全与凭据

- **[A13]** 绝不提交凭据；真 API 测试读取 `DEEPSEEK_API_KEY`（可选 `DEEPSEEK_BASE_URL`）与根 `.env`；无密钥时 CI e2e 自跳过。｜安全｜prompt-only｜`AGENTS.md:125`
  > "Never commit credentials. CI e2e skips without a key; [testing.md](docs/testing.md) owns key policy."
- **[A14]** 永不把不可信输出交给环境变量或可预测路径：子进程拿净化过的 env（丢弃 `*KEY*`/`*SECRET*`/`*TOKEN*`/`*PASSWORD*`），临时/spill 文件用私有 0700 目录、随机名、独占 owner-only 打开（`'wx'`、`0o600`）。｜安全｜prompt-only（有既有实现与测试）｜`docs/defensive-patterns.md:29`
  > "Spawned commands get a scrubbed env (drop `*KEY*`/`*SECRET*`/`*TOKEN*`/`*PASSWORD*`) so harness credentials cannot leak into output, `env`, or spill files. Temp/spill files use a private (0700) dir, random names, and exclusive owner-only opens (`'wx'`, `0o600`) — predictable world-readable paths invite symlink races and disclosure."
- **[A15]** 可能是符号链接或 Windows junction 的路径用 `lstatSync().isSymbolicLink()` + `unlinkSync` 删除（unlink 只删链接、拒绝真目录）；递归 `rmSync` 只留给已知的真实目录。｜安全｜prompt-only｜`docs/defensive-patterns.md:33`
  > "A path that may be a symlink or Windows junction is removed with `lstatSync().isSymbolicLink()` then `unlinkSync`: unlink deletes only the link and refuses a real directory, so it never follows the link into its target."

### A16 架构不变量（跨包、跨生命周期）

- **[A16]** 一切注册都是 effect：所有 contribution 走 `ctx.effect()` / `ctx.on()`，registry 的 `register()` 返回 disposer。｜架构不变量｜prompt-only + test·gate（HMR-safety 测试）｜`AGENTS.md:131`
  > "**Registrations are effects**: every contribution goes through `ctx.effect()` / `ctx.on()`; a registry's `register()` returns the disposer."
- **[A17]** 运行时不变量只断言"拥有的关系"；只有当**独立观测可能分歧**时才发布 `./invariant`，否则省略其源码与接线并在 README 里记录理由；空 installer 与"检查服务存在/插件元数据/effect/固定例子"都无效。｜架构不变量｜script·gate（`verify-package-invariants`）｜`AGENTS.md:132`、`packages/AGENTS.md:19`
  > "**Runtime invariants assert owned relationships.** Publish `./invariant` only when independent observations can diverge. Otherwise omit its source and wiring and record why in its README; empty installers and checks of service presence, plugin metadata, effects, or fixed examples are invalid"
  > "Empty companions and ignored reporters fail [`verify-package-invariants`]"
- **[A18]** **Model-visible ⟺ logged**：任何到达模型请求的内容都必须能从 session log 重建；新的 model-visible 输入需要一个 session event。｜架构不变量｜prompt-only + test·gate（agent-loop 的 log-reconstruction invariant）｜`AGENTS.md:136`
  > "**Model-visible ⟺ logged**: anything that reaches a model request must be reconstructable from the session log; a new model-visible input requires a session event."
- **[A19]** 插件优先、不改 loop：新行为挂在有文档的扩展点上；改 `agent-loop` 必须同步更新 `docs/architecture.md`。｜架构不变量｜prompt-only｜`AGENTS.md:137`
  > "**Plugins, not loop changes**: new behavior goes on documented extension points; changing `agent-loop` requires updating docs/architecture.md."
- **[A20]** 能力缝（capability seam）由 Service Definition / Service Provider / Consumer 三个角色组成，是完整的、绝不是单一角色；只有角色独立演进时才拆。｜架构不变量｜prompt-only｜`AGENTS.md:138`
  > "**A capability seam comprises Service Definition / Service Provider / Consumer roles.** It is complete, never one role; split only when roles evolve independently"
- **[A21]** 显式优于隐式（包边界）：默认值解析是 owning implementation 里显式的 `resolve(request): Spec` 步骤，绝不是 `run()` 里隐藏的 `?? default`。｜架构不变量｜prompt-only｜`AGENTS.md:140`
  > "**Explicit > implicit at package boundaries**: defaulting is an explicit `resolve(request): Spec` step in the owning implementation, never a hidden `?? default` inside `run()`"
- **[A22]** 插件里不得硬编码 tunables：随部署变化的取值必须是 cordis.yml 里可改、可校验的 `Config` 字段；`DEFAULT_*` 常量或测试钩子不算"可配置"；协议常量、外部规范、安全不变量保持固定。｜架构不变量｜prompt-only｜`AGENTS.md:141`
  > "**No hardcoded tunables in plugins**: deployment-varying choices are validated `Config` fields changeable from cordis.yml; a `DEFAULT_*` constant or test hook is not configurability. Protocol constants, external specs, and security invariants stay fixed."
- **[A23]** 配置错误要"大声失败"：自包含的在 load 时失败，否则在最早可解析点失败；绝不静默跳过缺失的引用对象。｜架构不变量｜prompt-only｜`AGENTS.md:142`
  > "**Misconfiguration fails loud** at load when self-contained, otherwise at the earliest resolvable point; never silently skip a missing referent."
- **[A24]** waterfall 监听器**必须**调用 `next()` 来委派；不调用直接返回会短路整条链。｜架构不变量｜prompt-only｜`AGENTS.md:135`
  > "**Waterfall listeners MUST call `next()`** to delegate; returning without it short-circuits the chain"
- **[A25]** source plane 与 artifact plane **绝不混用**：静态门禁与测试通过 tsconfig `paths` 把 workspace import 解析到 `src` 并在干净树上通过；消费 built `lib/` 的门禁必须声明该依赖。｜架构不变量/构建｜script·gate（测试配置 + 门禁依赖图 `run-gates.ts:884` 校验 needs）｜`AGENTS.md:146`
  > "**Source plane vs artifact plane, never mixed.** Static gates and tests resolve workspace imports through tsconfig `paths` to `src` and pass on a clean tree; gates consuming built `lib/` declare that dependency"

### A26 类型安全

- **[A26]** 一切在 `strict: true` + `noImplicitAny` 下编译；每个残留 `any` 必须解释为何收窄不可行。｜类型安全｜script·gate（lint/`tsconfig` 系列）｜`AGENTS.md:170`
  > "Everything compiles under `strict: true` with `noImplicitAny`; every remaining `any` explains why narrowing is infeasible."
- **[A27]** 禁止新增 `as unknown` / `<unknown>` 断言：保留或**减少**既有的 legacy baseline，替换时用有类型的值或校验。｜类型安全｜script·gate（`verify-no-unknown-casts`，带 `scripts/no-unknown-casts.baseline.json`）｜`AGENTS.md:145`
  > "**No new assertions to `unknown`** (`as unknown` or `<unknown>`). Preserve or reduce the exact legacy baseline; use typed values or validation for replacements"
- **[A28]** 在"有类型的同进程边界"信任 TypeScript：**不要**为静态接口已保证的值添加运行时校验、退化行为或敌意输入测试；只在 parser/config、queued、model/tool JSON、durable/file、worker、process、wire 这些真实边界校验。｜类型安全｜prompt-only｜`AGENTS.md:144`
  > "**Trust TypeScript at typed same-process boundaries.** Do not add runtime validation, fallback behavior, or hostile-input tests solely for values the static interface requires; validate at parser/config, queued, model/tool JSON, durable/file, worker, process, and wire boundaries."
- **[A29]** 跨边界的不透明 id 用 branded 类型（`Branded<B>` from `dsh-brand`），绝不用裸 `string`。｜类型安全｜prompt-only｜`AGENTS.md:143`
  > "**Opaque cross-boundary ids are branded** (`Branded<B>` from `dsh-brand`), never bare `string`."
- **[A30]** 判别式标签用 switch：闭合 union 以 `assertNever` 收尾；可合并扩展的 union 走一个"有文档的 default"分支。｜类型安全｜prompt-only｜`AGENTS.md:134`
  > "**Switch on discriminant tags.** Closed unions end in `assertNever`; merge-extensible unions fall through a documented default."

### A31 依赖偏好

- **[A31]** 当维护良好的依赖能**真正删掉自有代码与测试**时，优先用依赖而不是手搓（附理由链接）。｜依赖｜prompt-only｜`AGENTS.md:139`
  > "**Prefer maintained dependencies over hand-rolling** when they genuinely delete owned code and tests"
- **[A32]** 每个抽象、状态机、选项、防御性拷贝、兼容路径都必须绑定一个**当前的契约或生产 consumer**，行为留在其所属插件或服务里（反向气味：只有一个内部调用者的公共服务方法 → 传私有能力闭包）。｜依赖/架构不变量｜prompt-only｜`packages/AGENTS.md:11`、`packages/AGENTS.md:10`
  > "**Require a current owner and need.** Tie each abstraction, state machine, option, defensive copy, and compatibility path to a current contract or production consumer, and keep behavior in its owning plugin or service."
  > "Inverse smell: a public service method with one internal caller — pass a private capability closure instead (`RunCodeBridgeOptions`)."
- **[A33]** 公开选择需要证据：可配置性不为"不受支持的默认值 / 公开操作集 / 格式 / 引入的外部概念"背书；没有当前 consumer 证据或相关先例时，要求显式取值或推迟该选择。｜依赖/设计｜prompt-only｜`packages/AGENTS.md:12`
  > "**Require evidence for public choices.** Configurability does not justify an unsupported default, public operation set, format, or imported external concept. Use current-consumer evidence or relevant prior art; otherwise require an explicit value or defer the choice."

### A34 注释、命名与术语

- **[A34]** 注释保持**局部**：不复述代码、不扩充无关注释、不在没有本地需要时解释远处行为。｜注释命名｜prompt-only + script·gate（文风标准/`verify-export-jsdoc` 相关）｜`AGENTS.md:149`
  > "**Keep comments local.** Do not restate code, expand unrelated comments, or explain distant behavior without local need"
- **[A35]** 禁用歧义来源标签（`provenance` 一词被拆写规避，措辞为 "Ban `prove` + `nance`"）。｜注释命名｜script·gate（`verify-concrete-terms`，`blockedTerm = 'prove' + 'nance'`，排除 `vendor/`、`.agents/notes/archived/`）｜`AGENTS.md:150`
  > "**Ban `prove` + `nance`**"
- **[A36]** 空的 `catch` 必须命名错误**和**原因；其 `try` 只保留一条语句。｜注释命名｜prompt-only｜`AGENTS.md:148`
  > "**An empty `catch` names the error** and why; keep its `try` to one statement."
- **[A37]** 平行的值优先对称；无法解释的不对称通常意味着漏掉了一次抽取。｜注释命名｜prompt-only｜`AGENTS.md:151`
  > "**Prefer symmetry for parallel values**; unexplained asymmetry usually signals a missed extraction."
- **[A38]** 写作直白具体：命名 actor 与事实；禁用隐喻；写 `contract`/`boundary`/`shape` 前先自问是否有更精确的词；`contract` 只留给前置/后置条件、不变量、兼容承诺等义务。"契约写完整，但不写推理过程"：文档与注释陈述**完整契约与上下文**，不是 reasoning transcript。｜注释命名/文档｜prompt-only + script·gate（部分术语检查）｜`AGENTS.md:172`、`docs/AGENTS.md:45`
  > "Comments and docs state complete contracts and context, not reasoning transcripts. … Before writing `contract`, `boundary`, or `shape`, ask whether a more exact term names the subject"
- **[A39]** 文风标准的核心不是"越短越好"：移除形容词、重复与叙述，**仅当每个事实子句都存活且结果更清晰**；单纯词数更少不算改进。｜文档｜prompt-only｜`.agents/skills/dsh-prose-standard/SKILL.md:38`
  > "Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement."

### A40 文档同步与组织

- **[A40]** 文档伴随每个代码改动：受影响的 README 与 JSDoc 契约在同一次改动里一起更新；例行双语工作走 `docs/AGENTS.md`；**只有用户显式调用**才运行 `dsh-translate-docs`。｜文档｜prompt-only + script·gate（`doc-sync` 聚合）｜`AGENTS.md:174`
  > "Docs accompany every code change: update affected README and JSDoc contracts together. Routine bilingual work follows [docs/AGENTS.md](docs/AGENTS.md); only explicit user invocation may run `dsh-translate-docs`."
- **[A41]** 一个事实只有一个 home（tier 税的"Job"/"Does NOT belong there"表）；上层文档只按用途/责任/高层行为提及直接子文档，细节链接到 owner。｜文档｜prompt-only + script·gate（`verify-doc-refs`/`verify-subsystem-pages`）｜`docs/AGENTS.md:17`、`docs/AGENTS.md:21-22`
  > "Each fact has one home: the tier whose job it is; elsewhere, link there."
  > "| Root `AGENTS.md` | Standing orders: rules an agent needs in context in every session, one to three lines each, linking its home | Stories, worked examples, situational procedures, anything restated from a linked home |"
- **[A42]** 每段**一个物理行**（靠编辑器软换行）；代码块、表格、列表结构保留原格式。｜格式｜script·gate（`verify-md-wrap`）｜`docs/AGENTS.md:41`
  > "**One physical line per paragraph** (`verify-md-wrap`): use editor soft-wrap."
- **[A43]** 围栏 `ts` 代码块必须能编译（`doc-typecheck`）；粘贴的类型声明与原 JSDoc 用 ` ```ts type-equiv `，去体公共类声明用 ` ```ts public-api `，且必须在 manifest 注册以防漂移。｜文档｜script·gate（`doc-typecheck`、`verify-type-equiv`）｜`docs/AGENTS.md:42`
  > "**Fenced `ts` blocks must compile** (`doc-typecheck`); a pasted type declaration and its original JSDoc use ` ```ts type-equiv `, while a body-stripped public class declaration uses ` ```ts public-api `; register either in the manifest so neither can drift"
- **[A44]** 文档只写**当前状态**：历史留在 commit/PR/Agent Note/postmortem；禁止"implemented!"/"future: …"这类状态注解；禁止手工重述目录、JSDoc 或测试清单。｜文档｜prompt-only｜`docs/AGENTS.md:39`、`docs/AGENTS.md:66-68`
  > "Implementation-status annotations in prose or diagrams ("implemented!", "future: …"). Status rots; the repo layout and package manifests carry it."
- **[A45]** 仓库引用用相对 Markdown 链接（当前文件）或 tag/PR 号（历史）；`verify-md-links` 校验本地目标，`verify-repository-references` 拒绝实际 commit 标识符与不允许的组织 URL。｜文档｜script·gate｜`docs/AGENTS.md:76`
  > "Use relative Markdown links for current files and tags or PR numbers for historical references. `verify-md-links` checks local targets."
- **[A46]** 包 README 与 JSDoc 契约在行为改动**同一个 commit** 更新；包 README 必须记录 model/token/KV-cache 影响（canonical "Model Experience" 格式），持久的 consumer 缺口与维护者陷阱放 `## Known Limitations and Deferred Work`（没有则需一条有理由的 allowlist 条目）。｜文档｜script·gate（`verify-package-readme-summaries` / `-model-experience` / `-limitations`）｜`packages/AGENTS.md:26-28`
  > "Update package README and JSDoc contracts in the same commit as behavior, and verify them against code with [dsh-prose-standard]"
  > "Package READMEs put durable consumer gaps and non-obvious maintainer constraints under `## Known Limitations and Deferred Work`"
- **[A74]** 客户端 UI 文案归 locale 所有：产品文案必须走 typed dictionaries 与 `t` 或已本地化的 primitive props；`verify-client-ui-i18n` 拒绝硬编码文案；Cordis-free primitives 要求完整的 label props 且自身不拥有 fallback 文案。｜文档｜script·gate（`verify-client-ui-i18n`）｜`AGENTS.md:154`、`packages/client/AGENTS.md:117`
  > "**Client UI copy is locale-owned.** Route product text through typed dictionaries and `t` or localized primitive props; `verify-client-ui-i18n` rejects hardcoded copy"
  > "Every product-visible string—including text, accessibility names, tooltips, placeholders, status/unit formatters, and primitive chrome—lives in a typed locale dictionary and reaches components through the standard `t` seat or an already-localized prop. Cordis-free primitives require complete label props and own no fallback copy."

### A47 测试纪律

- **[A47]** 测试描述**行为**而非"正确性"；过时行为要连同其测试一起改，并在 PR 里说明原因。｜测试｜prompt-only｜`AGENTS.md:152`
  > "**Tests describe behavior, not correctness.** Change obsolete behavior with its tests; explain why in the PR."
- **[A48]** 校验世界，而不是自报：e2e 断言必须从外部重跑命令或重读文件；仅对 agent 自己的输出做关键词探测等于给"作弊的 agent"留后门。｜测试｜prompt-only｜`docs/testing.md:35`
  > "An e2e assertion re-runs the command or re-reads the file externally; a keyword probe on the agent's own output lets a cheating agent pass. Assert untouched files are byte-identical."
- **[A49]** 优先真实实现而非 mock：只 mock 昂贵或非确定的边界（LLM adapter、网络、时钟），下游全部保持真实。｜测试｜prompt-only｜`docs/testing.md:29`
  > "Mock only the expensive or non-deterministic boundary (LLM adapter, network, clock); keep everything downstream real."
- **[A50]** 产品可见插件必须有一个**非单元的真实组合测试**：手工 `ctx.plugin(...)` 套件不够，必须把 test-only `cordis.yml` 通过 Loader 与 app/process 启动，只 mock 外部服务或非确定输入，并断言 model-visible / durable / user-visible 输出；opt-in 不得进入出厂默认。｜测试｜prompt-only + CI｜`packages/AGENTS.md:7`
  > "**Product-visible plugins require a non-unit REAL-composition test.** Hand-built `ctx.plugin(...)` suites are insufficient. Boot test-only `cordis.yml` through the Loader and app/process; mock only external services or nondeterministic inputs and assert model-visible, durable, or user-visible output. Keep opt-ins out of shipped defaults."
- **[A51]** "门禁只有在回归能让它失败时才算门禁"：对没有 `inject` 的插件要显式加 `expect('default' in mod).toBe(false)` 与 `unwrapExports` 往返断言，并**先引入回归、看它变红、再回退**来证明。｜测试｜prompt-only｜`docs/testing.md:40`
  > "A guard only guards if the regression fails it. … add an explicit `expect('default' in mod).toBe(false)` plus an `unwrapExports` round-trip assertion, and prove it: introduce the regression, watch red, revert."
- **[A52]** 每个 registry 贡献都要有 HMR 安全测试：dispose 该 fiber 并观测贡献被移除。｜测试｜test·gate（单测要求 + `verify-package-invariants`）｜`docs/testing.md:9`、`packages/AGENTS.md:17`
  > "Every registry gets an HMR-safety test (dispose the contributing fiber, assert cleanup)."
- **[A53]** specs 并发执行（forked workers，与其它门禁进程同机同卷）：只有进程被隔离，端口/可预测路径/外部命名空间/继承子进程都没有；**只在单独跑时才通过的 spec 是 spec 的缺陷，不是"不稳定的 runner"**。｜测试｜prompt-only｜`docs/testing.md:21`、`packages/AGENTS.md:18`
  > "Only the process is isolated: ports, predictable paths, external namespaces, and inherited children are not. Own each acquired resource through its teardown, and read a spec that passes only when it runs alone as a defect in the spec rather than an unstable runner."
- **[A54]** 真 API 测试不要省：只 mock 的测试只证明 plumbing，只有带 key 的运行才证明 agent 对真实模型可用；自跳过让无密钥 CI 与贡献者不被阻塞，**不是成本信号**。｜测试｜prompt-only｜`docs/testing.md:25`
  > "We are DeepSeek — do not ration real-API tests. A no-key test proves plumbing; only a with-key run proves the agent works against a real model."
- **[A55]** 每个非平凡的 model/product-user-visible 改动，都要在同一个 PR 里新增或更新一个 keyless recorded-session 场景快照；package/e2e/mock-only/理由证据都不能替代组装后的 transcript。｜测试｜test·gate（`test:snapshot` / CI `ci-snapshot`）｜`AGENTS.md:155`、`docs/testing.md:55`
  > "Every non-trivial model- or product-user-visible change updates a keyless recorded-session snapshot"
  > "Every non-trivial model-, protocol-, or human-visible change adds or updates a keyless recorded-session scenario in the same PR; package, e2e, mock-only, and rationale evidence does not replace the assembled transcript."
- **[A56]** 快照夹具在 macOS/Linux 上回放；**修夹具，不要修 normalizer**。｜测试｜prompt-only｜`AGENTS.md:155`
  > "Fixtures replay on macOS/Linux; fix fixtures, not normalizers."
- **[A57]** 提交的 session 是归一化不动点；只对完整 emitted/retained 值施加 byte/token/item/time 限额，且要测试极小限额、精确限额、超大单块与多字节边界。｜测试/安全｜prompt-only｜`packages/AGENTS.md:16`
  > "**Apply bounds to the complete result.** Enforce byte, token, item, and time limits where the complete emitted or retained value, including wrappers and metadata, is known; test tiny and exact limits, oversized single chunks, and multibyte byte limits."

### A58 Agent Notes（决策记录）政策

- **[A58]** 只为**持久的决策理由**创建 Agent Note；机械/局部编辑（含本地 UI 改动）豁免；已归档笔记是冻结的，**永不编辑、也不作为现行权威**。｜笔记｜prompt-only + script·gate（`verify-archived-agent-notes`）｜`AGENTS.md:153`
  > "**Create Agent Notes only for durable decision rationale;** mechanical/local edits are exempt, including local UI changes … Archived notes are frozen: never edit or treat them as current authority"
- **[A59]** 每个新 Agent Note 触发**取代性检查**：搜索同决策/同机制的旧笔记，用 `dsh-archive-agent-notes` 分类完全/部分取代，并把符合条件的已实现三件套在同一个 PR 里归档。｜笔记｜prompt-only + script·gate｜`.agents/notes/AGENTS.md:5`
  > "**Every new Agent Note triggers a supersession check.** Search the active tree for older notes covering the same decision or mechanism, classify any full or partial supersession with [`dsh-archive-agent-notes`](../skills/dsh-archive-agent-notes/SKILL.md), and archive every qualifying implemented triplet in the same PR."
- **[A60]** 已实现的 Agent Note 必须**跟着实际发布物保持最新**：路径、符号、默认值、机制在改动它们的同一次改动里就地重写；**不要追加变更历史**；但"就地更新事实"不等于可以改写**决策**本身——决策反转要新写一篇并交叉链接。｜笔记｜prompt-only + script·gate（`verify-agent-note-format`）｜`.agents/notes/implemented/AGENTS.md:7,13`
  > "Keep paths, symbols, defaults, and mechanisms current in the same change that alters them. Rewrite stale facts in place; do not append change history."
  > "Update factual realization in place. A reversal of the decision or its rationale requires a new Agent Note and cross-link"
- **[A61]** 每篇 Agent Note 必须有 `## Alternatives considered` 段：记录真实的备选方案与它为何落败；**备选方案要记录、不要发明**。｜笔记｜script·gate（`verify-agent-note-format`）｜`.agents/notes/README.md:111`
  > "Every Agent Note carries an `## Alternatives considered` section: each genuine alternative and why it lost, one bold-led paragraph per alternative or a `### Why not <X>?` subsection per contested one. A decision recorded without what it beat invites re-litigation — the failure Agent Notes exist to prevent."
- **[A62]** 已实现笔记里**禁止 spec-speak**：`## Proposal` / `## Plan` / `## Migration plan` / `## Acceptance criteria` 不得出现（门禁拒绝）；机械/局部编辑豁免创建笔记。｜笔记｜script·gate（`verify-agent-note-format`）｜`.agents/notes/README.md:103`
  > "Proposal-era headings are spec-speak here and the gate rejects them: `## Proposal`, `## Plan`, `## Migration plan`, and `## Acceptance criteria` may not appear in an implemented Agent Note"

### A63 提交与 PR 历史策略

- **[A63]** 有意识地规划 PR 历史：拆分独立改动、先在**引入该问题的 PR** 上修复；独立/栈分支可以 merge-forward 或 rebase；改写历史用 `--force-with-lease`，远端移动就中止，**绝不用裸 `--force`**。｜提交PR｜prompt-only + hook（被强推时的 lease 行为由 skill 规定）｜`AGENTS.md:159`、`.agents/skills/dsh-pre-push-checks/SKILL.md:81`
  > "**Choose PR history deliberately.** Split independent changes and fix the introducing PR before propagation. … Rewrites use `--force-with-lease`, abort on remote movement, never raw `--force`"
  > "Raw `--force` is never allowed."
- **[A64]** 改写历史后必须重新抓取远端 head 并重新审计未解决的评审线程、批准、可合并性与检查；改写前的 commit hash 与行内评论锚点**不再是当前证据**。｜提交PR｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:83`
  > "After any rewritten push, fetch the live heads again and re-audit unresolved review threads, approvals, mergeability, and checks. Commit hashes and inline-comment anchors from before the rewrite are not current evidence."
- **[A65]** `gh stack sync` 把 fetch/cascade-rebase/push 合成一个操作，无法在改写与发布之间插入本地验证；运行前要求工作树干净并记录官方栈序与精确远端 head，返回后逐层重跑受影响证据，**所有选中检查通过前保持所有 PR 未合并**。｜提交PR｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:87`
  > "`gh stack sync` fetches, cascade-rebases, and pushes as one operation, so it cannot place local validation between rewrite and publication. Before running it, require a clean worktree and record the official stack order and exact remote heads."
- **[A66]** PR 标签：一个 `kind/*`、所有实质性的 `area/*`、外加原生 Issue Type。｜提交PR｜prompt-only（组织策略测试 `test:approval-policy`/`test:issue-management` 覆盖相邻策略）｜`AGENTS.md:160`
  > "**Labels:** one PR `kind/*`, all material `area/*`, and native Issue Type"
- **[A67]** `gh pr checks` 报 "no checks reported" 且 `/actions/runs?head_sha=` 为 0 时，先读可合并性再怀疑推送（PR 处于 `CONFLICTING`/`DIRTY` 时 GitHub 不创建 `pull_request` 工作流）；空提交、`--allow-empty`、draft/ready 切换、revert 反复都无济于事且只增加垃圾历史。｜提交PR｜prompt-only｜`.agents/skills/dsh-pre-push-checks/SKILL.md:134`
  > "GitHub creates no `pull_request` workflow runs while a PR is `CONFLICTING`/`DIRTY`, so the absent signal is the conflict, not infrastructure. Resolving the conflict is the only fix; empty commits, `--allow-empty` pushes, draft/ready toggles, and revert-and-restore bounces all leave `total_count` at zero and add junk history."

### A68 格式与元规则

- **[A68]** 文件以**恰好一个**结尾换行结束；由 pre-commit 的 `git diff --cached --check` 把关。｜格式｜hook（`lefthook.yml:35`）｜`AGENTS.md:162`
  > "Files end with exactly one trailing newline; `git diff --cached --check` (pre-commit) gates it."
- **[A69]** TODO 标记按紧急度用 `FIXME`/`TODO`/`XXX`。｜格式｜prompt-only｜`AGENTS.md:161`
  > "TODO markers: `FIXME`/`TODO`/`XXX` by urgency"
- **[A70]** 编辑指令文件本身：`CLAUDE.md` 在根与 `packages/` 都软链到 `AGENTS.md`，**改真实文件**；每条规则要自包含同时链接高层文档；能在保持清晰的前提下就压缩；确需更多空间才抬高 `verify-doc-budgets` 上限。｜元规则｜script·gate（`verify-doc-budgets`）｜`AGENTS.md:178`
  > "`CLAUDE.md` symlinks `AGENTS.md` at root and `packages/`; edit the real file. Keep each rule self-contained while linking high-level docs. Condense when clarity survives; raise a `verify-doc-budgets` ceiling when the required content genuinely needs more space."
- **[A71]** 词数预算的**处置顺序**：先 relocate 到别的 tier 并留一行链接 → 再 condense → **只有**内容确实需要空间才抬高上限，并在 PR 里论证 manifest diff；"上限太低是预算 bug"；目标是保留至少 5% headroom，超目标时冻结上限直到搬走或压缩。｜元规则｜script·gate｜`docs/AGENTS.md:54-58`
  > "1. **Relocate** content that belongs in another tier; leave a one-line link if needed. 2. **Condense** … 3. **Raise** the ceiling only when the words need the space; justify the manifest diff in the PR. A too-low ceiling is a budget bug."
  > "Ceilings are guardrails, not reduction targets. At or below target, retain at least 5% headroom"
- **[A72]** `vendor/` 是钉住的上游源码副本：**不要随手编辑 `vendor/*/src/`**；每一处本地分歧都要穷尽记录在 `vendor/README.md` 的 "Local modifications"；例外只有为适配 monorepo 构建而重新生成的 `vendor/*/tsconfig.json`。｜依赖/兼容性｜hook（`scripts/check-vendor-manifest.sh`）+ script·gate（`rescope-vendor:check`）｜`vendor/AGENTS.md:5`、`AGENTS.md:182`
  > "**Do NOT edit `vendor/*/src/` files casually.** Every local divergence from upstream must be logged exhaustively in `vendor/README.md` under "Local modifications.""
  > "`vendor/` packages are pinned source copies (manifest with upstream SHAs in [vendor/README.md](vendor/README.md)). Update via the sync procedure there; re-apply or retire the logged local modifications; rerun `pnpm run test && pnpm run build`."
- **[A73]** 栈内其余子树规则示例：客户端"业务组件零订阅机制"（数据访问阶梯：framework hooks → 声明的 store → inject 回调 → 否则需要主线程仲裁）；web 包**拒绝带凭据的 provider 请求重定向**；experimental 包前缀/发布策略明确且"实验状态不放松任何工程、安全、文档、生命周期、测试、不变量或快照要求"。｜架构不变量/安全｜prompt-only + script·gate（`verify-client-domain-graph`/`verify-client-packages`/`verify-default-product-isolation`）｜`packages/client/AGENTS.md:26`、`packages/web/AGENTS.md:5`、`packages/experimental/AGENTS.md:8`
  > "**Data-access ladder** — resolve needs in this order: framework hooks (standing seats + provide/inject-bound `use<Name>`) → a declared store (`useStore`/`actions`) → inject callbacks → anything else is a new framework extension point and needs main-thread arbitration."
  > "**Reject redirects on credential-bearing provider requests.**"
  > "Experimental status does not relax engineering, security, documentation, lifecycle, testing, invariant, or snapshot requirements."

（A 层共 74 条 ID：A01–A73 为编号序列，A74 补入客户端文案归属规则；上表逐条带 `path:line`，远超任务要求的 ≥15 条。同一 ID 内多引文时按列出顺序对应。）

## 3 B 层：机械强制机制（规则 → gate/脚本 → 注册位置 → 失败后果）

**共同失败语义**：`scripts/run-gates.ts` 是门禁总编排。任一**非 `allowFailure`** 的 gate 处于 `failed` **或 `skipped`**，聚合进程退出码为 `1`（`run-gates.ts:121-123`：`return results.some(result => result.gate.allowFailure !== true && (result.status === 'failed' || result.status === 'skipped')) ? 1 : 0`），CI 作业随之变红。`allowFailure: true` 的 gate 在汇总里标 `NON-BLOCKING`（`run-gates.ts:1649`），目前只用于 Windows observational 组（`run-gates.ts:592`）。**被 skip 也算失败**——这是很关键的一条：不能用"跳过"冒充通过。

| # | 机制 / gate 名（实读自 `scripts/`、`package.json`） | 对应规则 | 校验内容 | 注册位置（package.json / lefthook / run-gates） | 失败后果 |
|---|---|---|---|---|---|
| B1 | `verify-doc-budgets` | A70、A71 | 对 `scripts/doc-budgets.manifest.json` 列出的 8 个常设文档做 `wc -w` 式词数上限；**缺文件、上限非正整数、超限都算失败**；`--list` 只报告用量 | `package.json:124`；`run-gates.ts` `docSyncLeafGates` 内 `pnpmScript('doc-budgets', 'verify-doc-budgets', { label: 'doc budgets', quick: true })`；聚合 `package.json:188` `doc-sync`、`package.json:122` `test:docs`(doc-quick) | doc-sync/doc-quick 红 → `check:ci`/`check:ci:static` 红；作者按 `docs/AGENTS.md:54-57` 走 relocate→condense→raise |
| B2 | `verify-export-jsdoc` | A38 | 对每个非 vendor 包导出强制 JSDoc：函数与公共类方法要 `@param` 与非 void `@returns`，导出声明要有描述散文；内联可调用类型、重载、命名空间成员、公共类成员都在范围内；未知形态**fail closed** | `package.json:158`；`docSyncLeafGates`（`export-jsdoc`） | doc-sync 红 |
| B3 | `verify-no-unknown-casts` | A27 | 用 TypeScript AST 统计 `as unknown` / `<unknown>`，与 `scripts/no-unknown-casts.baseline.json` 的"按仓库路径 + 语法指纹"计数比对，**拒绝新增、允许减少** | `package.json:103`；`run-gates.ts:358` `sharedHygieneGates()` 的 `no-unknown-casts` → 进入 `ci-static`、`ci-primary`、`hygiene`、`check-all` | 静态/主 CI 红 |
| B4 | 覆盖率门禁 `test:coverage`（gate id `coverage`） | A09、A47 | 对 `packages/*/*/src` **每文件 100%**；重 suite 走 `coverage-exempt-heavy` 不插桩并行以省时；`DSH_COVERAGE_PARTITIONS` 控制分区 | `package.json:54`；`run-gates.ts:671 coverageGates()`（gate `native-system` → `coverage` + `coverage-exempt-heavy`）；CI `package.json` `check:ci:coverage` 在 `.github/workflows/ci.yml:191`、`:632` | 门禁红；`docs/testing.md:10` 明确"未覆盖行往往是该死代码，不是补测试" |
| B5 | `verify-cordis-config` | A22、A02（Loader 组合洁净） | 校验 Cordis Loader entry 元数据与包解析：只有插件 `config` 与 entry `disabled` 允许 `!!js` 表达式（其它元数据必须静态），并强制 Raw/Web `cordis.yml` 里的 bare plugin 出现在其 resolver manifest 的 `dependencies`（`AGENTS.md:130` 原文点名该门禁） | `package.json:144`；`hygieneLeafGates`、`ciSharedStaticGates`、`check-all`（`run-gates.ts:341,750`） | hygiene / 静态 CI 红 |
| B6 | `verify-package-invariants` + `verify-built-package-invariants` | A17、A52 | 校验包自有 invariant 源码与**发布规则**：只有"独立观测可能分歧"的关系才允许发布 `./invariant`；空 companion、被忽略的 reporter、无理由缺发布都失败；built 版本在构建产物上再查一次 | `package.json:109`、`package.json:111`；`hygieneLeafGates`、`builtPackageInvariantsGate`（`run-gates.ts:750`、`:726`） | hygiene / ci-primary（依赖 `build`）红 |
| B7 | `verify-client-ui-i18n` | A74 | 拒绝 Client 源码里直接内嵌的产品 UI 文案：覆盖 JSX text 与承载文案的属性，以及喂养它们的常见数据/helper 形态；locale 字典是唯一允许拥有译文的地方 | `package.json:141`；`sharedHygieneGates`（`run-gates.ts:358`）→ `ci-static`/`hygiene`/`check-all` | 静态 CI 红 |
| B8 | lefthook 钩子组（**唯一本地阻断层**） | A06、A68、A72、A59、A17 相邻 | pre-commit：staged lint（`run-oxlint.ts --config .oxlintrc.staged.json --fix`，`stage_fixed: true`）、`git diff --cached --check`、`scripts/check-vendor-manifest.sh`、staged `*.i18n.yaml` 配对、staged 归档笔记；第三方 notices 变更时**重新生成并 `git add`**（改为"重生成"而非"拒绝"）；pre-merge-commit 重复配对与归档检查；pre-push **只跑** `pnpm run typecheck` | `lefthook.yml:5-38`（pre-commit）、`:40-50`（pre-merge-commit）、`:52-55`（pre-push）；安装 `node scripts/install-lefthook.mjs`（`lefthook.yml:3`） | commit/push 被本地拒绝（非零退出）；钩子是"窄检查点"，全量矩阵归 CI（`lefthook.yml:1-2`） |
| B9 | `verify-archived-agent-notes` | A58 | 按追加式封存清单校验冻结归档：闭集 class 树、完整英/中/sidecar 三件套、归档元数据、sidecar 哈希；正常模式拒绝"被改动或缺失的封存物"，`--write` 才追加新哈希 | `package.json:117`；`lefthook.yml:13-15`（staged glob `.agents/notes/archived/**`）与 `docSyncLeafGates`（`archived-agent-notes`, quick） | pre-commit 与 doc-sync 双重红 |
| B10 | `verify-translation-pairing` | A40、A71 | 双语三件套一致性：`foo.md` / `foo.zh.md` / `foo.i18n.yaml`（按英文标题 slug 路径记录 EN/ZH 段落哈希）；结构镜像（标题深度与顺序、列表种类与条数、表格行列数、链接目标与 fragment、逐字代码块）；`--write <pair>` 才重新记录（且要求点名确认的 pair） | `package.json:121`；`lefthook.yml:7-11`（staged `*.i18n.yaml`，排除 archived）与 `docSyncLeafGates`（quick） | pre-commit 与 doc-sync 红 |
| B11 | `verify-agent-note-format` + `verify-agent-note-classification` | A60、A61、A62 | 强制头三行恰为 `# Agent Note: <title>` + 空行 + `Status: <status>`，且 `Status` 与所在生命周期目录一致；implemented 骨架要求 `## Problem`/`## Decision`/`## Alternatives considered`/`## Consequences` 并**拒绝** `## Proposal`/`## Plan`/`## Migration plan`/`## Acceptance criteria`；分类门禁拒绝闭集外的 class 目录 | `package.json:116` 与 `package.json` 的 `verify-agent-note-classification`；`docSyncLeafGates` 两个 gate（`agent-note-format`、`agent-note-classification`，均 quick） | doc-sync 红 |
| B12 | `verify-md-wrap` | A42 | 用 GFM AST 拒绝跨多物理行的 Markdown 散文段落（含列表与引用内），能区分段落与多行结构节点；从不自动改写；对符号链接的指令文件去重；VitePress frontmatter 与自定义容器分隔符先屏蔽 | `package.json:97`；`docSyncLeafGates`（`markdown-wrap`, quick） | doc-sync 红 |
| B13 | `doc-typecheck` + `verify-type-equiv` | A43 | 文档里围栏 `ts` 块必须编译；`type-equiv`/`public-api` 区域必须与源声明一致（防"粘贴的类型"漂移）。注意 `doc-typecheck` 在聚合里分两态：`doc-typecheck`（自建）与 `doc-typecheck:contracts-ready`（复用已备好的 contracts） | `package.json:95`（`doc-typecheck`）；`run-gates.ts:770 docSyncLeafGates` 的 `doc-typecheck` 与 `type-equivalence`；CI 里 `check-all` 用 `DSH_DOC_TYPECHECK_USE_BUILD_OUTPUT=1` | doc-sync / check-all 红 |
| B14 | `verify-concrete-terms` | A35 | 拒绝歧义来源标签：脚本内 `blockedTerm = 'prove' + 'nance'`，扫描 tracked 文件的路径与文本行，排除 `vendor/` 与 `.agents/notes/archived/` | `package.json:102`；`docSyncLeafGates`（`concrete-terms`, quick） | doc-sync 红 |
| B15 | 引用完整性门禁组 `verify-md-links` / `verify-repository-references` / `verify-public-repository-links` / `verify-doc-refs` | A45 | 本地 Markdown 链接目标必须存在；拒绝维护文件里的**真实 commit 标识符**与不允许的组织 URL（组织名由 `['deepseek','harness'].join('-')` 拼接以规避自身扫描）；repo 作者 TypeScript 里引用的 `docs/*.md`、`.agents/notes/*.md` 必须带扩展名且文件存在 | `package.json:98`、`:101`；`docSyncLeafGates`（`markdown-links`/`repository-references`/`public-repository-links`/`doc-refs`，后三者 quick） | doc-sync 红 |
| B16 | 生成器 `--check` 门禁族（14+ 个） | A41、A44（派生文件不得手改） | 每个生成器都有对应 `--check`：`verify-tsconfig-paths`、`verify-cordis-catalog`、`verify-cordis-api`、`verify-cordis-inspect-catalog`、`verify-client-catalog`、`verify-workflow-guest`、`verify-tool-catalog`、`verify-config-catalog`、`verify-plugin-packages`、`verify-dependency-catalog`、`verify-doc-graphs`、`verify-persistence-catalog`、`verify-session-format-catalog`、`verify-scoped-events`、`verify-module-graph`；生成物必须与源同步（否则 `--check` 非零退出） | `package.json:149-186` 区间成对定义（如 `:162 verify-tool-catalog`、`:164 verify-config-catalog`、`:170 verify-doc-graphs`、`:185 verify-scoped-events`、`:186 verify-module-graph`、`:153 verify-cordis-api`）；多数进入 `docSyncLeafGates` | doc-sync / hygiene / ci-primary 红 |
| B17 | 快照与期望输出测试门禁 | A55 | `test:snapshot`（keyless 录制会话回放，经出厂 profile 启动；CI gate id `snapshot`，`env: { DSH_EXAMPLE_MODE: 'lib' }`）、`test:expected`（owner-local 进程期望）、`test:web`（浏览器快照，CI 强制只读 `DSH_SNAPSHOT=replay`）、`test:gui`。`snapshots/AGENTS.md:17` 明确 "`pnpm run test:snapshot` replays without writes" | `package.json:66`(`test:snapshot`)、`:60`(`test:expected`)、`:70`(`test:web`)、`:78`(`test:gui`)；`run-gates.ts:710 snapshotGate()`、`:720 expectedOutputGate()`；`webSnapshotGate` 进 `ci-linux-primary`（`run-gates.ts:271`） | CI 红；录制/刷新产生的每个 diff 都要人审 |
| B18 | 组织策略测试 `test:approval-policy` / `test:issue-management` | A66 相邻 | 用 Node 原生测试跑 `.github/review-ownership/*.test.mjs`（加权审批、blame 归属、作者权重）与 `.github/issue-management/policy.test.mjs` | `package.json:62`、`:63`；`ciSharedStaticGates` 与 `check-all`（`run-gates.ts:341`、`:334`） | CI 红 |
| B19 | `duplication`（jscpd） | A37（对称/重复检测的机械侧） | 跨文件 TypeScript 克隆检测，配置 `.jscpd.json` | `package.json:52`；`ci-lint-contracts-ready` 与 `check-all` | CI 红 |
| B20 | 发布面/装配门禁组 `publint`、`constraints`、`verify-package-dependencies`、`verify-package-meta`、`verify-package-paths`、`verify-dsh-package-licenses`、`verify-build-*`/`verify-npm-install-layout`、`verify-optional-dependency-imports`、`verify-application-entrypoints`、`verify-default-product-isolation`、`verify-runtime-closure`、`verify-client-packages`、`verify-client-domain-graph`、`verify-no-bare-dispatcher`、`verify-node-next-types` | A01–A04、A25、A73 | 打包视图（publint）、workspace 约束、包清单/依赖边界、发布 payload、许可证、npm 安装布局、可选依赖 import、应用入口唯一性、默认产品与 experimental 隔离、运行时闭包、Client 包加载与域名图分层、proxy-aware dispatcher、NodeNext 消费者类型 | 各自 `package.json` 条目（`:94 publint`、`:187 constraints`、`:136 verify-default-product-isolation`、`:137 verify-application-entrypoints`、`:138 verify-package-dependencies`、`:147 verify-client-domain-graph` 等）；`hygieneLeafGates` + `ciSharedStaticGates`（`run-gates.ts:341,750`） | hygiene / 静态 CI / ci-primary 红 |
| B21 | README/子系统页结构门禁 `verify-package-readme-summaries`、`verify-package-readme-model-experience`、`verify-package-readme-limitations`、`verify-subsystem-pages`、`verify-package-meta` | A46、A41 | 包 README 的 Summary/Model Experience 结构、`## Known Limitations and Deferred Work` 的存在或 allowlist 理由、子系统页归属（group README 需 canonical 英文页链接或经论证的豁免） | `package.json:112`、`:113`、`:132`、`:105`、`:110`；`docSyncLeafGates`（前两者 quick，subsystem-pages 非 quick） | doc-sync 红 |
| B22 | `verify-skill-invocation-metadata`、`verify-workflow-guest` | 载体自身的元数据一致性 | 让 Claude Code 与 Codex 的技能调用元数据保持一致；workflow guest 源码与生成物一致 | `package.json:119`、`:167`；`docSyncLeafGates` | doc-sync 红 |
| B23 | Windows observational 组（非阻断样例） | —— | `ci-windows-observational-ready` 用 `allowFailure: true` 标记诊断性 gate，示范了"哪些是信号、哪些是门禁"的分野 | `run-gates.ts:592`、`:1649` | **不**阻断（汇总标 `NON-BLOCKING`）；`AGENTS.md:98` 说 `check:windows-wine` 只在诊断已知 Windows 失败时用，CI 拥有该信号 |

**只是文档约定、没有机械强制的高价值规则（对照）**：A07（证据匹配改动面）、A08（不跑全量/不重复）、A10（无普遍本地基线）、A11/A12（失败即停、不绕钩子）、A18 的"新增 model-visible 输入需要 session event"表述侧（不变量在 loop 请求侧有机械检查，但不检查"是否漏记事件"这一全称命题）、A23（配置大声失败）、A31（依赖优先于手搓）、A32/A33（当前 owner 与证据）、A47–A49、A51（回归证明）、A54、A63–A67。这些条目靠评审与 `dsh-code-review` / `dsh-pre-push-checks` 两个技能承载，**任何时候都不会自动变红**——这是本仓库"规则密度远高于机械覆盖"的主要缺口。

## 4 C 层：产品级 agent 约束（harness 自身给 AI 代理设的约束，≤15 行）

1. **AGENTS.md 即产品输入**：`@deepseek-ai/dsh-agent-instructions` 把工作区兼容文件（默认候选 `AGENTS.md`, `CLAUDE.md`，本地覆盖 `AGENTS.local.md`, `CLAUDE.local.md`）沿项目根标记（默认 `.git`）向上递归、再加上固定的用户级 `$DSH_HOME/AGENTS.md`，投影成 durable context；单文件默认上限 1 MiB，渲染预算可配；每候选文件独立跟踪 scope key（`AGENTS.md` 与 `CLAUDE.md`、base 与 `.local` overlay 互不碰撞）。出处：`packages/context/agent-instructions/src/config.ts:12-15,19-23,41-44`、`packages/context/agent-instructions/src/render.ts:98,105-107,111-120`、`packages/context/agent-instructions/src/index.ts:2-6`。
2. **loop guard 1 — 重复工具调用提醒**：`@deepseek-ai/dsh-repeat-tool-reminder` 是"advisory per-agent repeat-call detector"：连续重复同一 tool call 达阈值（默认 `[3, 5, 8]`）就注入提醒，让模型换方法或收尾。**它明确否决与改写调用**（"without vetoing or rewriting calls"），提醒参数预览有字符上限（默认 500）但检测用完整规范串。出处：`packages/guard/repeat-tool-reminder/src/index.ts:1-7,37,53-56`。
3. **loop guard 2 — 工具调用超时**：`@deepseek-ai/dsh-tool-call-timeout-policy` 是协作式强制：工具声明 `timeoutMs` 并承诺遵守 `exec.signal`，wrapper 武装 deadline 并把自身到期映射为结构化 `TOOL_TIMEOUT` 结果（`isError: true`），不竞态、不抛弃 tool promise。出处：`packages/guard/timeout-policy/src/index.ts:1-7,25,41-42`。
4. **sandbox 三档与升级审批**：模式为 `read-only` / `workspace-write` / `danger-full-access`；被拒绝时操作报告 `[sandbox: file access denied under <mode> mode]`，若组合广告了升级能力则附提示 `[sandbox: escalation available — retry this exact <subject> once with sandbox_permissions (the narrowest wider mode that suffices) + justification; the approval prompt asks the user]`；升级是**严格更宽**的闭表（`read-only`→`workspace-write`/`danger-full-access`；`workspace-write`→`danger-full-access`），**在执行期检查而非烧进工具 schema**，必须带 `sandbox_permissions` + 非空 `justification`，经审批服务获得用户同意，且**只对当次调用生效**。出处：`packages/sandbox/sandbox/src/escalation.ts:23-31,41,44-58,84-85,167-181`、`packages/sandbox/README.md:66,100,150`。
5. **model-visible ⟺ logged 的机械不变量**：`@deepseek-ai/dsh-agent-loop` 的 invariant companion 在 `llm/stream` 上**prepend** 监听（防被短路监听器静音），断言 loop 构建的请求必须 deep-frozen、带 live session id、且 `options.messages` 与 dispatch 期的 durable 派生逐字一致，否则报 **"log-reconstruction desync"**；同时要求 session log 里存在 `step/start` 与 `request/header`，并把模型/温度/maxTokens/stop/tools 与折叠后的 header 对齐。出处：`packages/core/agent-loop/src/invariant.ts:1-2,20,31-52`（desync 断言在 `:42`）；产品契约侧 `packages/llm/llm/README.md:114`、`packages/core/session/README.md:88`。
6. **session 日志约束**：`SESSION_FORMAT_VERSION = 4`，header 版本不匹配直接 throw（`session header version must be 4, got …`）；`SessionEventMap` 成员默认 **required-on-read**——不识别该类型的构建会拒绝该日志，除非事件自带信封 `ignorable: true`（未知但 ignorable 的记录保留为 opaque 元数据、不进 model-visible surface）；只有结构性格式变化才 bump 版本号。出处：`packages/core/session/src/types.ts:83,89,511`、`packages/core/session/src/index.ts:105-106,218-231`、`packages/core/session/src/surface.ts:311-312,406-407`、已知事件表 `packages/core/session/src/known-event-types.ts:12-20`。
7. **仓库纪律把产品沙箱也当作不可绕过的约束**：`AGENTS.md:110` 同时禁止"绕过测试失败"与"绕过产品沙箱"——即本仓库对代理的规则里，产品自身的 sandbox 是红线而非可协商项。

## 5 规则的组织结构：分层、软链与 i18n

**分层（root vs 子树）**：`docs/AGENTS.md:21-22` 的 tier 表把组织原则写成可引用的规则——根 `AGENTS.md` 只放 **standing orders**（"rules an agent needs in context in every session, one to three lines each, linking its home"），并且**明确排除** stories、worked examples、situational procedures、以及任何"从链接 home 重述来的内容"；子树 `AGENTS.md`（`packages/`、`docs/`、`.agents/notes/`）只放该子树专属 orders，"Repo-wide rules the root file already carries" 不在其列。落地形态：

- 根 `AGENTS.md`(182 行) 是索引式清单：段落标题按主题分组（Pre-stable APIs / Repository layout / Commands / Secrets / Conventions / Defensive patterns / Type safety and documentation / Editing these instructions / Vendoring policy），单条规则多为一行短语 + 一个链接到其 home。
- 子树 `AGENTS.md` 承接具体化：`packages/AGENTS.md`(28 行，包级不变式)、`packages/client/AGENTS.md`(158 行，浏览器栈 8 组规则)、`benchmarks/`、`website/`、`vendor/`、`.github/`、`native/system/`、`snapshots/`、`apps/cli/tests/profiles/`、`packages/{web,schedule,experimental}/`。
- 规范层 `docs/AGENTS.md` 承载"文档怎么写"的规则（tier 税、tier 表、写作规则、词数预算、slop 清单、仓库引用）。
- 政策层 `docs/testing.md`、`docs/defensive-patterns.md`、`docs/development.md`、`docs/architecture.md`、`docs/i18n/README.md`。
- 技能层 `.agents/skills/<name>/SKILL.md` 承载"何时做什么、按什么顺序"的可复用工作流（14 个 SKILL.md；目录共 15 个，`ask-matt/` 无 SKILL.md；各带 YAML frontmatter `name`+`description`；`description` 就是触发条件）。`.claude/skills` 是指向 `../.agents/skills` 的软链，作为宿主发现路径。

**软链策略**：`CLAUDE.md -> AGENTS.md` 只存在于**根**与 `packages/` 两处（`ls -la` 实测：`./CLAUDE.md`、`./packages/CLAUDE.md`；`./vendor/CLAUDE.md` 是 vendor 的普通文件，`docs/`、`.agents/` 下无 CLAUDE.md）。规则明说 `CLAUDE.md` symlinks `AGENTS.md` at root and `packages/`; edit the real file（`AGENTS.md:178`）——即用同一份内容同时喂给两个不同约定的宿主，且避免"两份文本漂移"。`verify-md-wrap` 的实现里也专门对符号链接的指令文件去重（`scripts/verify-md-wrap.ts:5-6`），说明这是被机械机制感知过的设计。

**i18n 文档政策**（`docs/i18n/README.md`，69 行）：在范围内的文档一律英/简中双维护，但**不是**本地化目录树——一个 pair 是**三个同级文件**：`foo.md`、`foo.zh.md`、一致性记录 `foo.i18n.yaml`；"**Both languages carry equal authority**"，任一侧可先行，绑定它们的是"必须说同一件事"，且 **pairs merge whole: a PR never lands one language without the other two files**（`docs/i18n/README.md:9-10`）。结构镜像到标题深度与顺序、列表种类与条数、表格行列数、链接目标与 fragment、逐字代码块。机械校验是 `verify-translation-pairing`（B10）。翻译工作分两档：例行轻量路径写在 `docs/AGENTS.md`，扩展工作流 `dsh-translate-docs` **仅限用户显式调用**（`AGENTS.md:174`、`docs/AGENTS.md:44`）。

**笔记层**：`.agents/notes/` 用**路径编码两个维度**——`{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`，lifecycle ∈ `proposed`/`implemented`/`rejected`，class 是闭集（`feature`/`bug-fix`/`simplification`/`architecture`/`process`/`testing`，定义在 `scripts/agent-note-tree.ts`，门禁拒绝其它目录），`archived/{class}/` 是冻结历史（刻意不含 `implemented`，因为只有已实现笔记能进去）。

**词数预算**：`docs/AGENTS.md:58` 与 `scripts/doc-budgets.manifest.json` 给出的目标/上限（实测词数）：根 `AGENTS.md` 1950（**1949**）、`docs/AGENTS.md` 1320（**1313**）、`docs/architecture.md` 2410、`docs/cordis-primer.md` 600、`docs/defensive-patterns.md` 550、`docs/testing.md` 1350、`packages/AGENTS.md` 750（**717**）、`packages/README.md` 994。

## 6 与其他来源的重叠/冲突预判

以本工作区同侪产出 `findings/01-ponytail.md`（已实读）为主要对照；`02-karpathy-plugin.md` 与 `04-experience.md` 我只读了标题层级（见 §8 不确定项 U7）。

**强互补（可直接叠加，无冲突）**

1. **"不要为不存在的需求写代码"**：ponytail 的懒惰阶梯（YAGNI → stdlib → native → one line → minimum）与本仓库 `packages/AGENTS.md:11`（**Require a current owner and need**：每个抽象/状态机/选项/防御性拷贝/兼容路径都要绑当前契约或生产 consumer）几乎是同一原则的两种表述；`packages/AGENTS.md:10` 的"反向气味：只有一个内部调用者的公共服务方法 → 传私有能力闭包"给出了 ponytail 缺的**判定手法**。
2. **"不要为不可能的输入写防御代码"**：ponytail 的"安全护栏之外不要过度防御"与 `AGENTS.md:144`（在 typed 同进程边界信任 TypeScript，只在 parser/config/model-tool JSON/durable-file/worker/process/wire 校验）**逐字同向**；DSH 的增量价值是它把"边界"**枚举成清单**，可操作性强得多。
3. **文风**：两者都反对复述代码、反对 narrate control flow、反对 reasoning transcript（`docs/AGENTS.md:68`、`AGENTS.md:149`、`dsh-prose-standard` 全篇），可直接合并。
4. **"门禁/护栏不可懒"**：ponytail 的"绝不可懒的安全护栏清单"与 `docs/defensive-patterns.md` 的 6 类缺陷模式（正交结果独立上报、两侧都遵守公共契约、异步状态≠同步状态、dispose 必须到达静默、dispatcher 里兜住 callback 异常、不可信输出不给环境变量与可预测路径）结构同构——都是"少数不可省略项"。
5. **文风标准里的"不要为缩短而缩短"**（`dsh-prose-standard:38`）与 ponytail 的"Caveman 只管怎么说话"分工一致，不冲突。

**直接冲突（同一决策点上给出相反默认值）**

6. **依赖策略相反**：ponytail 的阶梯把"加依赖"放在需要理由的下层（stdlib/native 优先）；DSH 明说 **Prefer maintained dependencies over hand-rolling**（`AGENTS.md:139`）。两者条件并不相同——DSH 的条件是"能**真正删掉自有代码与测试**"，ponytail 的条件是"能不写就不写"。合入通用 AGENTS.md 时必须择一或写成条件分支，否则代理会得到互斥指示。（这条也正好是 `AGENTS.md:139` 链到的 Agent Note 的主题。）
7. **测试重量级相反**：ponytail 倾向最小测试；DSH 要求每个非平凡可见改动配 keyless 录制快照（`AGENTS.md:155`）、per-file 100% 覆盖（`AGENTS.md:88`）、产品可见插件必须有真实组合测试（`packages/AGENTS.md:7`）。若把两者原文都塞进同一个 AGENTS.md，代理会无所适从。**可协调的写法**：DSH 的 `AGENTS.md:117` + `dsh-pre-push-checks:29` 提供了一个折中模板——"存在一个不漏的 CI 矩阵 + 本地只跑会因该回归失败的最窄检查 + 不为 commit/push 重复已通过的检查"，这恰好能吸收 ponytail 的成本敏感而不牺牲覆盖。
8. **文档负担相反**：DSH 对文档/注释的要求极重（文档随代码同步、README 契约、词数预算、双语三件套、JSDoc 门禁）；ponytail 基本不管文档（明确把文风交给 Caveman）。这不是逻辑冲突，而是**覆盖面差异**：ponytail 是"少写代码"，DSH 是"代码与文档同时受管"。合并时需声明 ponytail 的"懒惰"只在**代码与配置**维度生效，不得外推到文档/笔记维度。

**与 03 自身来源的对照价值**：DSH 最不可迁移、也最有观察价值的一点是"**规则自身有预算、且预算有处置顺序**"（B1/A71）：规则文本不是越多越好，超预算必须先 relocate 再 condense 才允许 raise。这与 ponytail 的"少写"在**元层面**同构（对规则自己应用懒惰原则），但 DSH 用的是 ratchet + 论证，而不是"不写"。

## 7 可提炼进通用 AGENTS.md 的候选（≤12 条，标优先级）

标注：`通用` = 任何 TS/JS 项目（乃至多数软件项目）可直接用；`仅大型 monorepo` = 需要对应基础设施才划算。

1. **[H1·最高·通用]** 在"有类型的同进程边界"信任类型系统：不要为静态接口已保证的值加运行时校验/退化行为/敌意输入测试；只在真实信任边界（parser、config、queued、model/tool JSON、durable/file、worker、process、wire）校验。出处 `AGENTS.md:144`。**理由**：这是"少写代码"与"不写脆弱代码"两个诉求唯一不互相伤害的交点，且给出了可判定的边界清单。
2. **[H2·最高·通用]** 禁止新增 `as unknown`/`<unknown>`：保留或减少带基线的既有断言数，替换时用有类型值或校验。出处 `AGENTS.md:145` + `scripts/verify-no-unknown-casts.ts`。**理由**：`unknown` 断言是类型安全随时间劣化的主要入口；"ratchet 既有 baseline"比"一刀切禁止"可落地。
3. **[H3·最高·通用]** 在**做出决策的那次操作**里强制执行该决策：schema 省略、prompt 过滤、facade、wrapper、监听顺序都不是 enforcement（别的调用者能绕过）；用 executor 测试拒绝路径。出处 `packages/AGENTS.md:14`。**理由**：这是"约束是否存在"的判定标准，可用来审计任何"我们有校验"的说法。
4. **[H4·高·通用]** 证据按改动面匹配 + 只报告实际跑过的命令 + 不默认跑全量、不为 commit/push 重复已通过的检查 + 失败就停下修好，不"推了指望 CI 不一样"。出处 `AGENTS.md:114,116,117`、`.agents/skills/dsh-pre-push-checks/SKILL.md:29,42,98`。**理由**：把代理最常见的两种坏行为（全量乱跑 / 声称跑过）同时堵住，且不依赖任何仓库特有设施。
5. **[H5·高·通用]** 本地验证被阻塞时的升级策略：原命令**不改地**重试 + 申请最窄的主机升级 + 必须有阻塞证据 + **绝不绕过测试失败与产品沙箱**；绕过钩子需用户显式同意并如实报告。出处 `AGENTS.md:110`、`.agents/skills/dsh-pre-push-checks/SKILL.md:105`。**理由**：这是"代理遇到权限墙时该怎么办"的完整答案，可直接照搬。
6. **[H6·高·通用]** 每个抽象/状态机/选项/防御性拷贝/兼容路径都必须绑定**当前的 owner 与需求**；反向气味是"只有一个内部调用者的公共方法"。出处 `packages/AGENTS.md:11,10`。**理由**：把"不要过度设计"写成可识别信号，而非态度要求。
7. **[H7·高·通用（需选型）]** 依赖偏好要写**成条件式**而不是口号：若某维护良好的依赖能真正删掉自有代码**与**测试，则优先用依赖；否则按阶梯手写。出处 `AGENTS.md:139`。**理由**：与 ponytail 阶梯冲突，通用 AGENTS.md 必须显式给出条件，否则两条规则互斥。
8. **[H8·中·通用]** 文档写作三条：**一个事实只有一个 home**（别处只链接）；**一段一个物理行**（源码/评审友好）；**写当前状态**（不写"已实现!"/"未来会…"这类会腐烂的状态注解）。出处 `docs/AGENTS.md:17,41,39`。**理由**：成本极低、收益直接，且第 2 条可被 5 行脚本机械校验。
9. **[H9·中·通用]** 注释只写"代码无法表达的契约与理由"：空 `catch` 必须命名错误**与**原因且 `try` 只一条语句；不复述代码、不写推理过程；写 `contract`/`boundary`/`shape` 前先问是否有更精确的词。出处 `AGENTS.md:148,149,172`、`docs/AGENTS.md:45`。**理由**：可合并 ponytail 的文风条款且不与之冲突。
10. **[H10·中·通用]** 校验世界而不是自报：验收测试必须从外部重跑命令、重读文件或断言未触碰文件逐字节不变；仅对 agent 自己的输出做关键词匹配等于给"作弊"留后门。出处 `docs/testing.md:35`。**理由**：对"AI 代理自己写测试、自己报告通过"的场景几乎是必需条款。
11. **[H11·中·仅大型 monorepo]** 规则文本自身有预算且预算有处置顺序：**relocate → condense → 才允许 raise**，raise 必须在 PR 里论证；上限偏低是"预算 bug"；目标留有 ≥5% headroom。出处 `docs/AGENTS.md:54-58` + `scripts/doc-budgets.manifest.json` + `verify-doc-budgets`。**理由**：只有规则文件会长期膨胀的大仓库才需要；单仓库用会变成官僚成本。
12. **[H12·中·仅大型 monorepo]** 门禁编排的两条设计原则：**(a)** "被跳过"与"失败"同等对待（`run-gates.ts:121-123`），不许用 skip 冒充通过；**(b)** 每个门禁必须显式声明它消费的是源码面还是构建产物面，并由依赖图校验（`run-gates.ts:884` 的 `validateGateGraph`），门禁图本身要有环检测与未知依赖检测。出处 `AGENTS.md:146`、`scripts/run-gates.ts`。**理由**：多门禁聚合下"绿色"最容易失真，这两条是把"绿色有意义"机械化的最小充分条件。

（以上 12 条为候选清单。另有两条考察过但**未入选**，仅记录理由，不占候选编号：其一是"空 `catch` 必须命名错误与原因"——已并入 H9；其二是"本地钩子只做增量窄检查、全量矩阵归 CI"（`lefthook.yml:1-2`、`.agents/skills/dsh-pre-push-checks/SKILL.md:8`）——概念通用但落地依赖成熟的 CI 矩阵，故降级为 H12 的配套说明而不单列。）

## 8 不确定项与方法说明

**方法（全部只读，未运行任何门禁/构建/测试）**

- 采集命令限于：`git -C <repo> rev-parse/status/log`（只读）、`read`、`grep`（经工具或 `grep -n`）、`ls`/`find`（带 `-prune` 排除 `node_modules`、`.git`）、`sed -n`、`wc`、`python3` 读 `package.json`/`.oxlintrc.json`/`scripts/doc-budgets.manifest.json`。**未运行**任何 `pnpm`/`tsx`/`vitest`/gate（避免污染工作树与耗时），也未运行任何 git 写命令。
- 行号以 HEAD=`477b4f420553e8a52c2fbccc464d7561b239c443` 的工作树为准；每条引用在写入本报告前用 `read` 的带行号输出逐条核对。`docs/` 下的文件遵守"一段一物理行"，故单行极长，引用做了必要截断并以 `…` 标记。
- 源仓库洁净度自证：分析开始时与写入本报告前各执行一次 `git status --short`，**两次输出均为 0 行**；`git rev-parse HEAD` 两次均为 `477b4f4…`；branch `master`。写入操作只发生在 `/home/leihaohao/workspace/agent-rules/findings/03-deepseek-harness.md`（本工作区在文件沙箱可写范围内）。

**不确定项**

- **U1（未实测门禁红/绿）**：本报告所有"失败后果"均从脚本退出口径推得——`run-gates.ts:121-123` 的聚合退出码、`lefthook.yml` 的钩子语义、各脚本头注释。**gate 名称与注册位置是实读的**，但"某个具体 gate 在当前树上是否会红"未经验证。任务硬约束要求 gate 名与实际一致（已满足），未要求我实际触发门禁。
- **U2（文档与 manifest 目标不一致）**：`docs/AGENTS.md:58` 的散文目标与 `scripts/doc-budgets.manifest.json` 存在可验证的偏离——散文说 `architecture.md ≤ 2,400` 而 manifest 是 `2410`；散文说 `testing.md` `1,300` 而 manifest 是 `1350`；散文列出 `examples/AGENTS.md 310` 但该文件已不在 manifest 中。我**只报告不一致，不判定哪一侧是权威**（manifest 是机器可读且门禁实跑的那一侧，散文可能是滞后，也可能是 raise 时忘了回写）。
- **U3（"子树 AGENTS.md ≤ 600" 的边界）**：`docs/AGENTS.md:58` 定"subtree `AGENTS.md` ≤ 600"，但 manifest 只对 3 个文件设限（根 1950、`docs/AGENTS.md` 1320、`packages/AGENTS.md` 750）。实测 `packages/client/AGENTS.md` 为 **3479 词**（远超 600）且不在 manifest 中，因此不受门禁约束。它可能被该段末句 "Review governs unbudgeted tiers" 覆盖（即由评审而非脚本治理）——我无法从文本确定这是"有意豁免"还是"缺口"。
- **U4（根 AGENTS.md 的 headroom 与自身规则）**：根 `AGENTS.md` 实测 **1949 词 / 上限 1950**（约 0.05% headroom），而 `docs/AGENTS.md:58` 要求"A 或以下目标时保留至少 5% headroom"。按字面，这条元规则当前处于不满足状态。可能解释：ratchet 规则是"降到目标以下时不得再涨"，而非"必须始终留 5%"——文本可两读，未判定。
- **U5（`verify-package-invariants` 的判定细节）**：我读了该脚本头注释（`scripts/verify-package-invariants.ts:1`）与 `packages/AGENTS.md:19`、`AGENTS.md:132` 的表述，但**未逐行读** `scripts/package-invariants.ts` 的完整判定集合。因此"空 companion / 被忽略 reporter 会失败"是**引自文档**而非脚本实读，细节判定条件未验证。
- **U6（"guard" 的强度语义）**：`packages/guard/` 的两个插件都自称 advisory/协作式——`repeat-tool-reminder` 明确 "without vetoing or rewriting calls"，`timeout-policy` 依赖工具"承诺遵守 `exec.signal`"。因此把 `guard/` 读作"阻止代理越界"的强制层是不准确的；它更像"把卡住的 loop 拉回正轨的软约束"。产品侧的**硬**约束在 sandbox 与 approval 路径（§4 第 4 条）。
- **U7（同侪产出的对照深度）**：§6 对 ponytail 的具体条款断言基于 `findings/01-ponytail.md` 的正文（已实读其中 R01–R05 及结构）。对 `02-karpathy-plugin.md`、`04-experience.md` 我**只读了标题层级**，未读正文，故 §6 未对这两份做实质对比（避免与同侪重复劳动）。关于 karpathy-plugin 的所有可能重叠均属未验证。
- **U8（未覆盖的规则载体）**：`python/` 的规则（仅 `python/README.md` 被间接引用）、`.github/review-ownership/` 的加权审批策略全文、`apps/desktop/README.md#windows-ev-signing` 的必需阅读章节、`.oxlintrc.json`（12 KB，未展开逐条 lint 规则）、`patches/` 与 `pnpm-workspace.yaml` 的策略面均未纳入 A 层。A 层因此是"高价值主干"，不是"穷尽清单"（主干已达 74 条 ID，远超 ≥15 的要求）。
- **U9（"仅大型 monorepo 适用"的判断属分析者判断）**：§7 的该标注基于"是否需要额外基础设施/CI 矩阵/多人协作规模"的推理，非仓库自述；仓库自身并未区分"通用 vs monorepo 专用"。
- **U10（行号随版本漂移）**：所有 `path:line` 绑定到 sha `477b4f4`。该仓库正处于 0.1.7-rc 发布期（最近提交是 release 合并），`AGENTS.md` 与 `docs/` 都在词数上限附近，后续轻微改动即可使行号整体位移；复用本报告时建议同时核对 sha。

**更正记录（Lead 复核，依据 `findings/99-verification.md`）**
- §0 规模的"`scripts/` 下 267 个脚本"不可复现（实测：一层文件 274 个、`*.ts` 254 个、tracked 333 个）→ 已改为"下一层 274 个文件（其中 254 个 `.ts`，含 68 个 `verify-*.ts`）"。
- ".agents/skills 的 15 个技能"→ 实为 **14 个 `SKILL.md`**（技能目录 15 个，`ask-matt/` 无 SKILL.md）；§0 与 §5 两处已更正。
- §2 A59 引用块删除了 `](`../skills/dsh-archive-agent-notes/SKILL.md`)` 链接目标且未标 `…` → 已补回链接目标，恢复逐字引用。
