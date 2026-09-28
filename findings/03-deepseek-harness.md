# DeepSeek Harness 的 agent 规则集与约束（477b4f42 快照）

## §0 溯源与阅读约定

**快照。** 一手来源是公开仓库 <https://github.com/deepseek-ai/deepseek-harness>（下文 `$DSH` 指该仓库的本地只读克隆），HEAD = `477b4f420553e8a52c2fbccc464d7561b239c443`，branch `master`。本次分析全程**只读**：未运行 `pnpm`/构建/`scripts/verify-*`/生成器，未触碰 `node_modules/`，未在该仓库执行任何 git 写命令。

**只读证据。** 分析开始时 `git -C $DSH status --short` 输出 **0 行**；分析结束时同一命令仍为 **0 行**（见 §8 收尾测量）。注意 `git status --short` 默认隐藏 ignored 文件：该工作树另有 653 条 ignored 条目（`--ignored=matching`），其中与本文相关的一条是 `.agents/skills/ask-matt/agents/openai.yaml`（见更正 1）。

**引用前缀。** 本文用 `H:<path>:<line>` 指该快照中从仓库根起的文件行；前缀 `H:` 只在此处定义一次。`path:line-line` 是行区间。每条逐字引文用 ASCII 双引号 `"…"`；`…` 表示省略（省略处用 `|` 分隔以便机检）。中文括注用 `“”`，英文原文里的撇号与引号按源文件原样保留。

**强制形式词表（只定义一次，全篇复用同一 token）。** token 回答一个问题：违反该规则时，什么会变红、在哪变红。

| token | 含义 |
|---|---|
| `prompt-only` | 只写在 agent 读到的指令/文档里；没有任何机器检查，违反后不会自动变红 |
| `hook` | lefthook git hook 本地阻断（`H:lefthook.yml:5` pre-commit、`H:lefthook.yml:40` pre-merge-commit、`H:lefthook.yml:52` pre-push） |
| `script·gate` | `scripts/verify-*.ts` 或生成器 `--check`，经 `run-gates.ts` 的某个 mode 或 CI job 阻断 |
| `test·gate` | vitest spec 在某个 lane（`test` / `test:coverage` / `test:snapshot` / `test:web` / `test:e2e` / `test:bench`）失败 |

多层同时阻断写成组合（如 `hook+prompt-only`）。**未写组合即未覆盖**，`prompt-only` 在 §7 汇总。

**为什么这个仓库的规则面最大。** 它同时是（a）把工作纪律写进 22 个 `AGENTS.md` 的仓库主体，（b）用 68 个 `verify-*` 脚本 + 18 个生成器 `--check` 把其中一部分纪律机械化的门禁系统，（c）**本身就在运行 agent** 的产品，因此产品代码里另有一整套对 agent 的约束（§4）。A/B 层约束在这个仓库里干活的 agent，C 层约束这个仓库造出的 harness 所运行的 agent。

---

## §1 一句话定位

DeepSeek Harness 把 agent 的工作纪律拆成三层、用不同强度承载：**写入 agent 上下文的 prose 规则**（22 个 `AGENTS.md` + 14 个 `SKILL.md` + 文档标准）声明意图，**68 个 `verify-*` 脚本 + 18 个生成器 `--check` + lefthook + CI** 只机械化其中约三成并把“跳过”与“失败”等价，而**产品代码自身**（指令加载链、sandbox 升级审批、guard、session 格式与日志不变量）对 harness 所运行的 agent 施加第三层运行时约束。全篇 A 层共 161 条，其中 114 条永远不会自动变红。

---

## §2 A 层：仓库级工作纪律

### A1 根 `AGENTS.md`（182 行，1949 词）

- **A1.01** `H:AGENTS.md:3` · prompt-only — "Read [docs/architecture.md](docs/architecture.md) before changing `packages/`; follow [docs/AGENTS.md](docs/AGENTS.md) for documentation."
- **A1.02** `H:AGENTS.md:7` · prompt-only — "Public APIs are pre-stable; update every consumer." 同句规定 "predecessors imply neither fallback nor downgrade support"，SQLite 用单调 `SCHEMA_VERSION`。
- **A1.03** `H:AGENTS.md:9` · prompt-only — "Acknowledge [declared persistence-type changes](docs/cookbook/reviewing-persistence-type-changes.md)." 记账动作另有 `script·gate` 兜住“改了没记”：`H:scripts/persistence-changes.ts:1` "Verify and acknowledge persistence type changes from current-tree schema history."；但“该不该记、怎么记”是 prose。
- **A1.04** `H:AGENTS.md:11` · script·gate — "Only `dsh` profiles launch supported Node apps; package bins, demos, and public SDK argv escapes are forbidden"；机械面 `H:scripts/verify-application-entrypoints.ts:109` 报 "package bin bypasses the dsh launcher; applications use apps/cli profiles"。
- **A1.05** `H:AGENTS.md:17` · prompt-only — 仓库布局树是缓存：包分组真值在 `H:AGENTS.md:80` 指向的 `packages/README.md`。
- **A1.06** `H:AGENTS.md:85` · prompt-only — `## Commands` 段（`H:AGENTS.md:82`–`H:AGENTS.md:106`）是环境缓存，真值是 `package.json` 的 **184** 个 scripts。实测该段共提及 **18** 个不重复的 `pnpm run <name>`，**全部 18 个**都存在于 `package.json`；反过来，`test:coverage:partitioned`、`check:ci:artifacts`、`release:verify`（以及 `verify-doc-budgets`，它由 `docs/AGENTS.md:50` 引出）**不在**该段出现，只存在于 `package.json` 与 `run-gates.ts` 的 mode 表。命令与结果见 §8。
- **A1.07** `H:AGENTS.md:88` · prompt-only — "pnpm run test:coverage  # CI coverage gate: per-file 100% on packages/*/*/src"
- **A1.08** `H:AGENTS.md:98` · prompt-only — "pnpm run check:windows-wine  # ONLY when diagnosing a known Windows failure (needs wine); CI owns this signal"
- **A1.09** `H:AGENTS.md:110` · prompt-only — 宿主 sandbox 受阻时的升级协议："If a required `gh`, `pnpm`, build, test, or generator command fails because the sandbox blocks credentials, network, IPC, watching, or nested `sandbox-exec`, retry unchanged with the narrowest host escalation. Require sandbox evidence; never bypass test failures or the product sandbox."；产品侧的同一语义在 `H:packages/sandbox/sandbox/src/escalation.ts:84`。
- **A1.10** `H:AGENTS.md:114` · prompt-only — "Before pushing, follow [dsh-pre-push-checks](.agents/skills/dsh-pre-push-checks/SKILL.md); report only commands run. After `gh stack sync`, validate immediately; do not merge before checks pass."
- **A1.11** `H:AGENTS.md:116` · prompt-only — "Match evidence to the surface: focused behavior tests, model/user-output snapshots, `doc-sync` for docs, built smokes for published paths, and real-API e2e for providers."
- **A1.12** `H:AGENTS.md:117` · prompt-only — "Never default to the full suite or repeat a passing check for commit or push. CI owns exhaustive coverage and the platform matrix; rehearse all locally only by explicit request, for CI diagnosis, or for an irreducibly repository-wide change."
- **A1.13** `H:AGENTS.md:118` · prompt-only — "`test:coverage`, not `test`, is the CI coverage gate"（指向 `docs/testing.md`）。
- **A1.14** `H:AGENTS.md:119` · prompt-only — "**Web browser automation and GIF recording:** launch with `pnpm dsh web --patch apps/web/tests/pin-browse-picker.overlay.yml`"，只在显式测原生选择器时省略该覆盖。
- **A1.15** `H:AGENTS.md:125` · prompt-only — 秘密与环境："Real-API tests/demos read `DEEPSEEK_API_KEY`, optional `DEEPSEEK_BASE_URL`, and root `.env`." + "Never commit credentials."；`cordis.yml` 允许 `!!js` 而禁止 `!js` 的部分另有配置 gate。
- **A1.16** `H:AGENTS.md:129` · script·gate — "Workspace dependency sections use DSH `workspace:*`, vendor/native `workspace:~`"；机械面 `H:scripts/verify-package-dependencies.ts:1` "Verify and repair npm dependency sections from published Client and Host faces."
- **A1.17** `H:AGENTS.md:130` · script·gate — "Raw/Web `cordis.yml` bare plugins must appear in their resolver manifest's `dependencies`; `verify-cordis-config` enforces it." 同句要求相关模块保持 ESM（源启动走 tsx 的 ESM-only hook）。
- **A1.18** `H:AGENTS.md:131` · prompt-only — "**Registrations are effects**: every contribution goes through `ctx.effect()` / `ctx.on()`; a registry's `register()` returns the disposer."
- **A1.19** `H:AGENTS.md:132` · script·gate — "**Runtime invariants assert owned relationships.**" + "empty installers and checks of service presence, plugin metadata, effects, or fixed examples are invalid"；机械面是 `H:packages/AGENTS.md:19` 点名的 `verify-package-invariants`，其入口 `H:scripts/verify-package-invariants.ts:14` 打印 "verify-package-invariants: violations found:"。
- **A1.20** `H:AGENTS.md:133` · script·gate — "`SessionEventMap` members are required-on-read by default — builds that do not know a type refuse the log unless the event carries the envelope's `ignorable: true`; only structural format changes bump `SESSION_FORMAT_VERSION`"；细节见 §4-C4，V3 词表机械面在 `H:scripts/verify-v3-event-vocabulary.ts:1` "Compare the V3 migration vocabulary with an explicitly pinned local V3 writer."
- **A1.21** `H:AGENTS.md:134` · prompt-only — "**Switch on discriminant tags.** Closed unions end in `assertNever`; merge-extensible unions fall through a documented default."
- **A1.22** `H:AGENTS.md:135` · prompt-only — "**Waterfall listeners MUST call `next()`** to delegate; returning without it short-circuits the chain"
- **A1.23** `H:AGENTS.md:136` · prompt-only+test·gate — "**Model-visible ⟺ logged**: anything that reaches a model request must be reconstructable from the session log; a new model-visible input requires a session event."；机械面是本仓库少见的**运行时**不变量 §4-C5。
- **A1.24** `H:AGENTS.md:137` · prompt-only — "**Plugins, not loop changes**: new behavior goes on documented extension points; changing `agent-loop` requires updating docs/architecture.md."
- **A1.25** `H:AGENTS.md:138` · prompt-only — "**A capability seam comprises Service Definition / Service Provider / Consumer roles.** It is complete, never one role; split only when roles evolve independently"
- **A1.26** `H:AGENTS.md:139` · prompt-only — "**Prefer maintained dependencies over hand-rolling** when they genuinely delete owned code and tests"
- **A1.27** `H:AGENTS.md:140` · prompt-only — "**Explicit > implicit at package boundaries**: defaulting is an explicit `resolve(request): Spec` step in the owning implementation, never a hidden `?? default` inside `run()`"
- **A1.28** `H:AGENTS.md:141` · prompt-only — "**No hardcoded tunables in plugins**: deployment-varying choices are validated `Config` fields changeable from cordis.yml; a `DEFAULT_*` constant or test hook is not configurability. Protocol constants, external specs, and security invariants stay fixed."
- **A1.29** `H:AGENTS.md:142` · prompt-only — "**Misconfiguration fails loud** at load when self-contained, otherwise at the earliest resolvable point; never silently skip a missing referent."
- **A1.30** `H:AGENTS.md:143` · prompt-only — "**Opaque cross-boundary ids are branded** (`Branded<B>` from `dsh-brand`), never bare `string`."
- **A1.31** `H:AGENTS.md:144` · prompt-only — "**Trust TypeScript at typed same-process boundaries.**"；只在 parser/config、queued、model/tool JSON、durable/file、worker、process、wire 边界做校验。
- **A1.32** `H:AGENTS.md:145` · script·gate — "**No new assertions to `unknown`** (`as unknown` or `<unknown>`). Preserve or reduce the exact legacy baseline"；机械面 `H:scripts/verify-no-unknown-casts.ts:1` "Reject new assertions to unknown while retiring the recorded existing assertions."，基线在 `scripts/no-unknown-casts.baseline.json`。
- **A1.33** `H:AGENTS.md:146` · prompt-only — "**Source plane vs artifact plane, never mixed.** Static gates and tests resolve workspace imports through tsconfig `paths` to `src` and pass on a clean tree"
- **A1.34** `H:AGENTS.md:147` · prompt-only — "**Keep compiler faces explicit.** A package with both Host and Client programs exposes face-specific leaf configs and a solution-only root"
- **A1.35** `H:AGENTS.md:148` · prompt-only — "**An empty `catch` names the error** and why; keep its `try` to one statement."
- **A1.36** `H:AGENTS.md:149` · prompt-only — "**Keep comments local.** Do not restate code, expand unrelated comments, or explain distant behavior without local need"
- **A1.37** `H:AGENTS.md:150` · script·gate — "**Ban `prove` + `nance`**"；机械化方式是把词拆开：`H:scripts/verify-concrete-terms.ts:10` `const blockedTerm = 'prove' + 'nance'`。
- **A1.38** `H:AGENTS.md:151` · prompt-only — "**Prefer symmetry for parallel values**; unexplained asymmetry usually signals a missed extraction."
- **A1.39** `H:AGENTS.md:152` · prompt-only — "**Tests describe behavior, not correctness.** Change obsolete behavior with its tests; explain why in the PR."
- **A1.40** `H:AGENTS.md:153` · script·gate — "**Create Agent Notes only for durable decision rationale;** mechanical/local edits are exempt" + "Archived notes are frozen: never edit or treat them as current authority"；机械面 `H:scripts/verify-archived-agent-notes.ts:1` "Verify and append-seal the frozen Agent Note archive."。
- **A1.41** `H:AGENTS.md:154` · script·gate — "**Client UI copy is locale-owned.** Route product text through typed dictionaries and `t` or localized primitive props; `verify-client-ui-i18n` rejects hardcoded copy"；机械面 `H:scripts/verify-client-ui-i18n.ts:2` "Reject product UI copy embedded directly in Client source."。
- **A1.42** `H:AGENTS.md:155` · test·gate — "Every non-trivial model- or product-user-visible change updates a keyless recorded-session snapshot"；"Fixtures replay on macOS/Linux; fix fixtures, not normalizers." 对应 `test:snapshot` / `test:web` lane。
- **A1.43** `H:AGENTS.md:156` · prompt-only — "**Design each tool's UI presentation up front.** Host presenters stay pure; Web cards derive from raw events and persisted result metadata"
- **A1.44** `H:AGENTS.md:157` · prompt-only — "**Plan unit, e2e, and snapshot coverage** for capability seams, lifecycle paths, and transcript output; include missing snapshot-harness support in the same change."
- **A1.45** `H:AGENTS.md:158` · prompt-only — "**Both SDKs project the loop.** Agent-loop, session-lifecycle, and `SessionEventMap` changes update the TypeScript and Python SDK expected outputs in the same PR; `pnpm run test` covers neither"
- **A1.46** `H:AGENTS.md:159` · prompt-only — "Rewrites use `--force-with-lease`, abort on remote movement, never raw `--force`"；同句要求拆分独立改动、并在传播前修引入它的 PR。
- **A1.47** `H:AGENTS.md:160` · prompt-only — "**Labels:** one PR `kind/*`, all material `area/*`, and native Issue Type"；远端另有 `issue-policy.yml` / `weighted-approval.yml` 承担部分标签执法。
- **A1.48** `H:AGENTS.md:161` · prompt-only — "TODO markers: `FIXME`/`TODO`/`XXX` by urgency"
- **A1.49** `H:AGENTS.md:162` · hook — "Files end with exactly one trailing newline; `git diff --cached --check` (pre-commit) gates it."；机械面 `H:lefthook.yml:34` "whitespace (staged)" → `H:lefthook.yml:35` `run: git diff --cached --check`。
- **A1.50** `H:AGENTS.md:166` · prompt-only — "Read [docs/defensive-patterns.md](docs/defensive-patterns.md) before lifecycle, concurrency, subprocess, or teardown work."
- **A1.51** `H:AGENTS.md:170` · script·gate — "Everything compiles under `strict: true` with `noImplicitAny`; every remaining `any` explains why narrowing is infeasible." + "Every module and export has concise JSDoc for its non-obvious contract; function-like exports include `@param`/`@returns`, as enforced by `verify-export-jsdoc`"；机械面 `H:scripts/verify-export-jsdoc.ts:2` "Enforce JSDoc on every non-vendored package export."。
- **A1.52** `H:AGENTS.md:172` · prompt-only — "Comments and docs state complete contracts and context, not reasoning transcripts. Use direct, concrete terms. Do not use metaphors." 同段要求把 `contract`/`boundary`/`shape` 换成更准的词，并要求 "Wire mechanically checkable invariants into an executed top-level gate and prove each changed acceptance path rejects an invalid case."
- **A1.53** `H:AGENTS.md:174` · script·gate — "Docs accompany every code change: update affected README and JSDoc contracts together." + "Current-state prose, one physical line per paragraph, one home per fact, and word budgets live there."；机械面 `H:scripts/verify-md-wrap.ts:82` 报 "hard-wrapped prose paragraphs found (write one physical line per paragraph)"，以及 `verify-doc-budgets`。
- **A1.54** `H:AGENTS.md:178` · prompt-only — "`CLAUDE.md` symlinks `AGENTS.md` at root and `packages/`; edit the real file." + "Condense when clarity survives; raise a `verify-doc-budgets` ceiling when the required content genuinely needs more space."（软链事实见§6 回答 ④）
- **A1.55** `H:AGENTS.md:182` · hook+prompt-only — "`vendor/` packages are pinned source copies (manifest with upstream SHAs in [vendor/README.md](vendor/README.md))."；同段要求重跑 `pnpm run test && pnpm run build`，而“改动 vendor 必须同时改 manifest”由 `H:lefthook.yml:37` "vendor manifest guard" → `H:lefthook.yml:38` `run: scripts/check-vendor-manifest.sh` 阻断。

### A2 子树 `AGENTS.md`（22 个中的其余 21 个）

`packages/AGENTS.md`（28 行，717 词）——`H:packages/AGENTS.md:3` "These package-specific rules supplement the repo-wide [conventions](../AGENTS.md#conventions)."

- **A2.01** `H:packages/AGENTS.md:5` · prompt-only — "**Plugin exports:** service packages default-export their service class; function plugins named-export `name` / `inject` / `Config` / `apply` and have no default export."；同条指出混用会让 Loader 丢弃函数插件的命名空间。
- **A2.02** `H:packages/AGENTS.md:6` · prompt-only — "**Optional services use `ctx.get(name)`.** Reserve `ctx.<name>` for declared injections"
- **A2.03** `H:packages/AGENTS.md:7` · test·gate — "**Product-visible plugins require a non-unit REAL-composition test.** Hand-built `ctx.plugin(...)` suites are insufficient."；同条要求经 Loader 启动 test-only `cordis.yml` 并断言 model-visible、durable 或 user-visible 输出。
- **A2.04** `H:packages/AGENTS.md:8` · prompt-only — "**Initiator-owned private chains derive, then capture.**"；不得为省参数把叶子 helper 从 `Session` 放宽到 `Context`。
- **A2.05** `H:packages/AGENTS.md:9` · prompt-only — "**Represent one asynchronous operation with one lifecycle controller or transaction.**"
- **A2.06** `H:packages/AGENTS.md:10` · prompt-only — "**Design Service Definitions for all current Consumers.**"；反向坏味道：只有一个内部调用者的 public service method 应改为私有 capability closure。
- **A2.07** `H:packages/AGENTS.md:11` · prompt-only — "**Require a current owner and need.** Tie each abstraction, state machine, option, defensive copy, and compatibility path to a current contract or production consumer"
- **A2.08** `H:packages/AGENTS.md:12` · prompt-only — "**Require evidence for public choices.** Configurability does not justify an unsupported default, public operation set, format, or imported external concept."
- **A2.09** `H:packages/AGENTS.md:13` · test·gate — "**Write model-facing contracts from the model's perspective.** Prompts, tool schemas, results, and diagnostics contain only task-relevant concepts, not UI, transport, or implementation vocabulary."；同条要求 "Pin stable model-visible text verbatim and dynamic behavior through snapshots or end-to-end coverage."。
- **A2.10** `H:packages/AGENTS.md:14` · test·gate — "**Enforce a decision in the operation that makes it.** Schema omission, prompt filtering, facades, wrappers, and listener order are not enforcement when direct or alternate callers can bypass them; test denial through the executor."
- **A2.11** `H:packages/AGENTS.md:15` · prompt-only — "**Publish state only at its commit point.**"
- **A2.12** `H:packages/AGENTS.md:16` · prompt-only — "**Apply bounds to the complete result.** Enforce byte, token, item, and time limits where the complete emitted or retained value, including wrappers and metadata, is known; test tiny and exact limits, oversized single chunks, and multibyte byte limits."
- **A2.13** `H:packages/AGENTS.md:17` · test·gate — "**Registry contributions prove disposal** through the HMR-safety test required by [testing policy](../docs/testing.md): dispose the fiber and observe removal."
- **A2.14** `H:packages/AGENTS.md:18` · prompt-only — "**Specs run concurrently** in forked workers beside other gate processes." + "a spec that passes only when run alone is a defect in the spec"
- **A2.15** `H:packages/AGENTS.md:19` · script·gate — "**Publish `./invariant` only for diverging observations.**" + "Empty companions and ignored reporters fail [`verify-package-invariants`](../.agents/notes/implemented/simplification/2026-08-28-omit-unneeded-invariant-companions.md)."
- **A2.16** `H:packages/AGENTS.md:23` · script·gate — "**Package tsconfig:** extends `tsconfig.base.json` (Client: `tsconfig.base.client.json`), sets `rootDir: src` and `outDir: lib/types`"；机械面是 `verify-tsconfig-paths`（`gen-tsconfig-paths.ts --check`）。
- **A2.17** `H:packages/AGENTS.md:24` · prompt-only — "`src/types.ts` contains only types — no runtime code."
- **A2.18** `H:packages/AGENTS.md:25` · prompt-only — "Tests live at package level under `tests/`, not `src/__tests__/`."
- **A2.19** `H:packages/AGENTS.md:26` · script·gate — "Update package README and JSDoc contracts in the same commit as behavior, and verify them against code with [dsh-prose-standard](../.agents/skills/dsh-prose-standard/SKILL.md)." + "Group READMEs declare subsystem ownership through a canonical English page link or justified [exemption](../scripts/verify-subsystem-pages.ts)."；机械面 `H:scripts/verify-subsystem-pages.ts:2` "Doc-sync gate for package-group subsystem references."。
- **A2.20** `H:packages/AGENTS.md:27` · script·gate — "Package READMEs document model, token, and KV-cache effects using the [canonical Model Experience format](../docs/cookbook/adding-a-package.md#4-write-the-package-readme)."；机械面 `H:scripts/verify-package-readme-model-experience.ts:2` "Doc-sync gate for package README Model Experience sections."。
- **A2.21** `H:packages/AGENTS.md:28` · script·gate — "Package READMEs put durable consumer gaps and non-obvious maintainer constraints under `## Known Limitations and Deferred Work`"；机械面 `H:scripts/verify-package-readme-limitations.ts:2` "Doc-sync gate for the canonical package-README limitations section."。

`packages/client/AGENTS.md`（158 行，3479 词）——最长的子树文件。

- **A2.22** `H:packages/client/AGENTS.md:12` · test·gate — "Rendering an undeclared slot, or declaring one someone else declared, fails at load." 槽名形状 "`<domain>.<entry>.<hole>`"。
- **A2.23** `H:packages/client/AGENTS.md:13` · prompt-only — "**Component props are the five shares, all derived**" + "Never hand-write or locally re-type a derived member."
- **A2.24** `H:packages/client/AGENTS.md:14` · prompt-only — "**Hooks are framework-made only**" + "Business code never creates a hook or selector as a prop value — pass plain data and callbacks."
- **A2.25** `H:packages/client/AGENTS.md:16` · prompt-only — "**Stores: read `props.useStore`, write `props.actions.*`** — the declared actions are the complete mutation API." 同条禁止模块级 handle（"module-level handles are forbidden — de-facto singletons"）。
- **A2.26** `H:packages/client/AGENTS.md:25` · prompt-only — "**Business components contain no subscription machinery** — no `useSyncExternalStore`, no manual subscribe wiring"
- **A2.27** `H:packages/client/AGENTS.md:35` · prompt-only — "**A UI plugin exports no values beyond what cordis loading needs**" + "Adding any new value export requires user sign-off, not a matching consumer."
- **A2.28** `H:packages/client/AGENTS.md:37` · script·gate — "**A feature plugin MUST NOT runtime-import or re-export another feature plugin's values, and MUST NOT declare `dsh.client.external` to obtain them.**" + "If neither fits, stop and escalate — do not add an export to unblock yourself."
- **A2.29** `H:packages/client/AGENTS.md:41` · prompt-only — "`ctx` belongs to the apply world only" + "Components — every `.tsx` under a feature domain — receive all data and callbacks through the derived props shares"
- **A2.30** `H:packages/client/AGENTS.md:53` · prompt-only — "**Business data lives in the object layer, never a store.**"
- **A2.31** `H:packages/client/AGENTS.md:56` · prompt-only — "**The web layer is pure presentation.**" + "A new *model-visible* input still requires a session event (repo-wide rule)."
- **A2.32** `H:packages/client/AGENTS.md:65` · script·gate — "The verifier rejects unclassified exports before `--fix` writes manifests."；verifier 是 `H:packages/client/AGENTS.md:60` 指名的 `verify-package-dependencies`。
- **A2.33** `H:packages/client/AGENTS.md:83` · script·gate — "Keep every static relative dependency inside its owning output chunk rather than relying on a sibling-chunk graph the runtime does not support."
- **A2.34** `H:packages/client/AGENTS.md:104` · prompt-only — `match(event)` 只读当前 `SessionEventLike`，且必须 "remains deterministically replayable by logical log `seq`"。
- **A2.35** `H:packages/client/AGENTS.md:109` · script·gate — "`scripts/verify-client-domain-graph.ts` enforces the levels."；门禁自述 `H:scripts/verify-client-domain-graph.ts:2-3` "Enforce intra-package domain layering inside `packages/client/*\/src/client/`."
- **A2.36** `H:packages/client/AGENTS.md:117` · script·gate — "Every product-visible string—including text, accessibility names, tooltips, placeholders, status/unit formatters, and primitive chrome—lives in a typed locale dictionary" + "`pnpm run verify-client-ui-i18n` enforces source ownership"
- **A2.37** `H:packages/client/AGENTS.md:123` · test·gate — "Client source packages are inside the per-file 100% coverage gate (`pnpm run test:coverage`). Genuinely unreachable defensive arms take a `/* v8 ignore -- <reason> */` comment with a real reason, never a bare ignore."
- **A2.38** `H:packages/client/AGENTS.md:132` · prompt-only — "**Every GUI code change** — `pnpm run test:gui` (seconds; no browser, no server)" + "This is the inner loop; run it as freely as a typecheck."
- **A2.39** `H:packages/client/AGENTS.md:134` · prompt-only — "to select the narrow checks for the outgoing diff; there is no repo-wide pre-push aggregate."
- **A2.40** `H:packages/client/AGENTS.md:136` · prompt-only — "If `test:gui` is red on code you did not touch, neither silently fix nor ignore it: note it in your handoff"
- **A2.41** `H:packages/client/AGENTS.md:143` · test·gate — "**Three registration surfaces, all required** (missing any one fails at a different, later point)"
- **A2.42** `H:packages/client/AGENTS.md:151` · prompt-only — "**Check the [ui-primitives catalog](ui-primitives/README.md#component-catalog) before writing a control.** A plugin cannot import another plugin's component"

`docs/AGENTS.md`（76 行，1313 词）——文档标准，全篇都是 A 层规则。

- **A2.43** `H:docs/AGENTS.md:17` · prompt-only — "Each fact has one home: the tier whose job it is; elsewhere, link there."；tier 表把根 `AGENTS.md` 的职责定为 `H:docs/AGENTS.md:21` "Standing orders: rules an agent needs in context in every session, one to three lines each, linking its home"。
- **A2.44** `H:docs/AGENTS.md:39` · prompt-only — "**Document current state.** Keep history in commits, PRs, Agent Notes, postmortems, or scoped persistence records."
- **A2.45** `H:docs/AGENTS.md:41` · script·gate — "**One physical line per paragraph** (`verify-md-wrap`): use editor soft-wrap."
- **A2.46** `H:docs/AGENTS.md:42` · script·gate — "**Fenced `ts` blocks must compile** (`doc-typecheck`)"；`type-equiv`/`public-api` 块须在 manifest 注册，门禁 `H:scripts/verify-type-equiv.ts:2-3` "Verify every `ts type-equiv` and `ts public-api` block against the source symbol named by the manifest."
- **A2.47** `H:docs/AGENTS.md:44` · script·gate — "**Pairs update together**" + "`dsh-translate-docs` remains user-invoked"，门禁 `H:scripts/verify-translation-pairing.ts:2-3` "Enforce complete English/Chinese pairs, matching structure, and recorded per-section hashes"
- **A2.48** `H:docs/AGENTS.md:46` · prompt-only — "Write directly: name actors and facts" + "Reserve `seam` for the defined capability."
- **A2.49** `H:docs/AGENTS.md:52` · script·gate — 预算 ratchet 的处置顺序（逐字见 §6 回答 ③）；门禁报错文本 `H:scripts/verify-doc-budgets.ts:42` "exceeds the ${ceiling}-word ceiling — relocate or condense per docs/AGENTS.md (raising the ceiling requires justification in the PR)"。
- **A2.50** `H:docs/AGENTS.md:58` · prompt-only — "Targets: root `AGENTS.md` ≤ 1,950; `architecture.md` ≤ 2,400; subtree `AGENTS.md` ≤ 600, except `packages/AGENTS.md` ≤ 750 and this file ≤ 1,320; `packages/README.md` ≤ 994; plus `cordis-primer.md` 600, `defensive-patterns.md` 550, `testing.md` 1,300, `examples/AGENTS.md` 310."；与 manifest 的漂移见 §6 更正 3。
- **A2.51** `H:docs/AGENTS.md:64` · prompt-only — "Duplicated rules: search a distinctive phrase; keep one home and link the rest."；slop checklist 末项 `H:docs/AGENTS.md:72` "Spec-speak in `implemented/` Agent Notes"
- **A2.52** `H:docs/AGENTS.md:76` · script·gate — "Use relative Markdown links for current files and tags or PR numbers for historical references. `verify-md-links` checks local targets." + "rejects actual commit identifiers and disallowed organization URLs in maintained files."

其余 13 个非夹具子树 `AGENTS.md`——每个 1–2 条代表规则。

- **A2.53** `H:.agents/notes/AGENTS.md:5` · prompt-only — "**Every new Agent Note triggers a supersession check.** Search the active tree for older notes covering the same decision or mechanism, classify any full or partial supersession"
- **A2.54** `H:.agents/notes/AGENTS.md:7` · script·gate — "Files under [`archived/`](archived/AGENTS.md) are frozen historical snapshots: never edit them or treat them as current authority."
- **A2.55** `H:.agents/notes/archived/AGENTS.md:3` · script·gate — "Never edit, reformat, translate, repair, delete, or move a sealed artifact"；归档期允许的改动被穷举为搬完整三件套、插 `Archived: YYYY-MM-DD`、重录 sidecar、修入链。
- **A2.56** `H:.agents/notes/archived/AGENTS.md:7` · script·gate — "The normal verifier rejects changed or missing sealed artifacts, incomplete triplets, unknown kind folders, and invalid archive metadata."
- **A2.57** `H:.agents/notes/implemented/AGENTS.md:7` · prompt-only — "Keep paths, symbols, defaults, and mechanisms current in the same change that alters them. Rewrite stale facts in place; do not append change history."
- **A2.58** `H:.agents/notes/implemented/AGENTS.md:13` · prompt-only — "A reversal of the decision or its rationale requires a new Agent Note and cross-link"
- **A2.59** `H:.github/AGENTS.md:3` · prompt-only — "Run jobs on Windows runners (`windows-*` labels) under native `pwsh`."；同段规定 `ci.yml` 只在 PR 上跑、master-only 检查留在 `ci-master.yml`。
- **A2.60** `H:apps/cli/tests/profiles/AGENTS.md:3` · prompt-only — "Start product scenarios through `apps/cli/src/bin.ts` with `--profile <name>` or the `<name>` shorthand; a test-only Loader driver is allowed only when the public profile output cannot expose the asserted internal evidence."
- **A2.61** `H:benchmarks/AGENTS.md:12` · prompt-only — "Enforce reviewed source constants; environment variables must not override performance budgets."
- **A2.62** `H:benchmarks/AGENTS.md:9` · prompt-only — "Synthesize fixed inputs from reviewed constants. Never use recorded Sessions, user material, ambient repositories, or network services."
- **A2.63** `H:native/system/AGENTS.md:7` · prompt-only — "Landlock's argv, exit codes, diagnostics, and fail-closed confinement are defined in [docs/cli-contract.md](docs/cli-contract.md). Do not change them when extending another system capability."
- **A2.64** `H:native/system/AGENTS.md:13` · prompt-only — "There is no install-time compile fallback. Missing Landlock binaries probe unusable; missing flock bindings reject acquisition, never silently grant a lock."
- **A2.65** `H:packages/experimental/AGENTS.md:8` · script·gate — "Experimental status does not relax engineering, security, documentation, lifecycle, testing, invariant, or snapshot requirements."
- **A2.66** `H:packages/experimental/AGENTS.md:7` · script·gate — "Release packages and apps outside this group must not name experimental packages in `dependencies`, `optionalDependencies`, or `peerDependencies`."；机械面 `H:scripts/verify-default-product-isolation.ts:2` "Keep experimental packages outside default installations, runtime imports, and shipped compositions."
- **A2.67** `H:packages/schedule/AGENTS.md:8` · prompt-only — "Enqueue with producer kind `schedule`, await Session persistence, then retire or advance the task. These writes are not atomic: a crash between them may duplicate delivery."
- **A2.68** `H:packages/schedule/AGENTS.md:7` · prompt-only — "Daily rules retain an explicit time and IANA zone; they are not fixed 86,400-second intervals."
- **A2.69** `H:packages/web/AGENTS.md:5` · test·gate — "**Reject redirects on credential-bearing provider requests.**" + "Regression coverage must prove that the redirect target is not contacted"
- **A2.70** `H:scripts/AGENTS.md:3` · prompt-only — "Gate scripts invoke pnpm shell-free, normalize repository-relative glob paths to `/` at ingestion" + "Source-ownership gates use syntax-aware discovery, guard against an empty or narrowed corpus"
- **A2.71** `H:scripts/AGENTS.md:5` · prompt-only — "Script specs run in forked workers beside the rest of the suite" + "A spec that passes only when it runs alone is a defect in the spec"
- **A2.72** `H:snapshots/AGENTS.md:5` · test·gate — "Every process under test starts through the `dsh` CLI with a shipped profile and optional scenario patches." + "do not add another application entrypoint, hidden CLI mode, or executable scenario driver."
- **A2.73** `H:snapshots/AGENTS.md:11` · prompt-only — "Committed sessions are normalization fixed points." + "Never redact arbitrary user or tool text merely because it resembles an identifier."
- **A2.74** `H:snapshots/AGENTS.md:17` · test·gate — "`pnpm run test:snapshot` replays without writes."
- **A2.75** `H:vendor/AGENTS.md:5` · hook+prompt-only — "**Do NOT edit `vendor/*/src/` files casually.** Every local divergence from upstream must be logged exhaustively in `vendor/README.md`"；机械面 `H:scripts/check-vendor-manifest.sh:2` "Vendoring discipline, mechanized: any staged change under vendor/*/src or a"
- **A2.76** `H:website/AGENTS.md:9` · script·gate — "Keep canonical prose and generated catalogs in their owning `docs/` tier" + "Never add locale, route, API, or copied documentation trees such as `website/zh-CN/`, `website/en/`, or `website/api/`."；门禁在 `H:website/AGENTS.md:17` "Run `pnpm docs:check` after changing this subtree; the gate rejects additional non-ignored Markdown under `website/`."
- **A2.77** `H:website/AGENTS.md:11` · prompt-only — "The projector writes disposable Markdown to the ignored `website/.generated/` directory. Never edit or commit `.generated/`, `.cache/`, or `.dist/`."
- **A2.78** 4 个 snapshot 夹具 · prompt-only — 归并为一条并给理由。四者是 `snapshots/session/agent-instructions/workspace/AGENTS.md`（1 行 / 3 词）、`snapshots/session/agent-instructions/workspace/nested/AGENTS.md`（1 / 3）、`snapshots/session/ptc-workspace-context/workspace/AGENTS.md`（1 / 4）、`snapshots/session/ptc-workspace-context/workspace/nested/AGENTS.md`（1 / 14）。它们内容互不相同、各只有一行，且只有最后一个含一条真规则：`H:snapshots/session/ptc-workspace-context/workspace/nested/AGENTS.md:1` "When asked for the Code Mode workspace handshake, answer exactly `CODE_MODE_CONTEXT_OK` and nothing else."；另外三个分别是 `H:snapshots/session/agent-instructions/workspace/AGENTS.md:1` "Root snapshot instruction."、`H:snapshots/session/agent-instructions/workspace/nested/AGENTS.md:1` "Nested snapshot instruction."、`H:snapshots/session/ptc-workspace-context/workspace/AGENTS.md:1` "Workspace snapshot root instruction."。归并理由：它们是**快照输入夹具**（回放场景的 workspace 目录内容），不是仓库纪律；作为规则它们唯一的作用是让 `agent-instructions` 与 `ptc-workspace-context` 两个场景能断言“模型收到了哪些指令文件”，因此只需点名、不必逐条展开。

### A3 `.agents/skills/`：14 个 `SKILL.md`（合计 1260 行）

- **A3.01** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:8` · prompt-only — 技能总纲，含最关键的一句边界："Git hooks are intentionally narrow: pre-commit fixes staged lint, checks staged whitespace, and guards vendored-source metadata; pre-push runs only the incremental repository typecheck. CI owns exhaustive coverage and the platform matrix."
- **A3.02** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:29` · prompt-only — "There is no universal local baseline beyond the hooks. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression"
- **A3.03** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:42` · prompt-only — "Do not manually repeat a passing check merely because commit or push follows. In particular, do not run typecheck immediately before pushing solely to duplicate the pre-push hook."
- **A3.04** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:54` · prompt-only — "Test selection and coverage selection are separate. A Vitest file filter chooses which tests run, while the repository configuration otherwise measures every `packages/*/*/src/**/*.ts` file."
- **A3.05** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:73` · prompt-only — "Do not use `--passWithNoTests`, lower coverage thresholds, or narrow `--coverage.include` merely to hide an uncovered affected file."
- **A3.06** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:77` · prompt-only — "Run the complete local approximation only when the user explicitly requests it, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible." + "do not recreate the removed `check:pre-push` aggregate."
- **A3.07** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:81` · prompt-only — "Raw `--force` is never allowed."；同句要求用 `--force-with-lease=<branch>:<observed-oid>` 让并发更新中止推送。
- **A3.08** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:87` · prompt-only — "`gh stack sync` fetches, cascade-rebases, and pushes as one operation, so it cannot place local validation between rewrite and publication."
- **A3.09** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:105` · prompt-only — "Bypass a local hook only when the user explicitly asks or agrees, and report exactly what failed and why CI is expected to differ."
- **A3.10** `H:.agents/skills/dsh-pre-push-checks/SKILL.md:134` · prompt-only — "GitHub creates no `pull_request` workflow runs while a PR is `CONFLICTING`/`DIRTY`, so the absent signal is the conflict, not infrastructure." + "empty commits, `--allow-empty` pushes, draft/ready toggles, and revert-and-restore bounces all leave `total_count` at zero and add junk history."
- **A3.11** `H:.agents/skills/dsh-prose-standard/SKILL.md:8` · prompt-only — "Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration." + "It is guidance, not a script."
- **A3.12** `H:.agents/skills/dsh-prose-standard/SKILL.md:10` · prompt-only — "Treat `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, and `vocabulary` as terms to check before use, not banned words."（**不是**禁用词表；与 A2.48 同源）
- **A3.13** `H:.agents/skills/dsh-prose-standard/SKILL.md:16` · prompt-only — "Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope"
- **A3.14** `H:.agents/skills/dsh-prose-standard/SKILL.md:22` · prompt-only — "Always exclude `vendor/` from discovery, review, and edits, even when the requested scope is the whole repository. Do not follow a symlink into it."
- **A3.15** `H:.agents/skills/dsh-prose-standard/SKILL.md:24` · prompt-only — "Also exclude `.agents/notes/archived/` from prose review and edits."
- **A3.16** `H:.agents/skills/dsh-prose-standard/SKILL.md:38` · prompt-only — "Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement."
- **A3.17** `H:.agents/skills/dsh-prose-standard/SKILL.md:56` · prompt-only — "**Skills and agent instructions:** state behavioral guardrails and explicit scope limitations such as “guidance, not a script/checklist.”"
- **A3.18** `H:.agents/skills/dsh-code-review/SKILL.md:8` · prompt-only — "**This skill is guidance, not a complete checklist.**" + "Prioritize correctness, lifecycle, security, and broken required behavior over style; a short review with one substantiated blocker is better than a list of nits."
- **A3.19** `H:.agents/skills/dsh-client-ui-ux/SKILL.md:8` · prompt-only — "This skill is guidance, not a complete checklist. It covers judgment calls that lint, typecheck, and the i18n gate cannot make"
- **A3.20** `H:.agents/skills/dsh-ci-test-reliability/SKILL.md:8` · prompt-only — "Build tests that remain correct under the repository's real CI topology, not only when run alone on a quiet workstation."
- **A3.21** `H:.agents/skills/dsh-trim-cot-leakage/SKILL.md:8` · prompt-only — "The fix is never deletion alone when a passage carries factual clauses — restate each so it stands at HEAD, then delete the transcript around it"
- **A3.22** `H:.agents/skills/dsh-find-simplifications/SKILL.md:8` · prompt-only — "Prefer a few well-supported candidates over a count of deletions." + "keep the user's scope and distinguish a survey from permission to implement its proposals."
- **A3.23** `H:.agents/skills/dsh-speed-up-perf/SKILL.md:8` · prompt-only — "This is guidance, not a quota or a script: survey broadly, follow measured cost, and reject attractive changes that do not improve the workload users actually run."
- **A3.24** `H:.agents/skills/dsh-merging-stacked-prs/SKILL.md:8` · prompt-only — "Land dependent PRs through GitHub's native stack object and `gh stack merge`. Do not reproduce stack semantics by merging and retargeting individual PRs"
- **A3.25** `H:.agents/skills/record-browser-gif/SKILL.md:3` · prompt-only — description 里的强制项："for every pull request that changes product-user-visible GUI behavior, which MUST include a GIF recorded from the pull request's real server and model flow."
- **A3.26** `H:.agents/skills/dsh-archive-agent-notes/SKILL.md:8` · prompt-only — "Reduce the active decision corpus without erasing history that can still guide work. Judge every note semantically; word count and age are discovery aids, never archive criteria."
- **A3.27** `H:.agents/skills/dsh-translate-docs/SKILL.md:4` · prompt-only — 唯一声明 `disable-model-invocation: true` + `user-invocable: true` 的技能；与之同源的仓库级约束是 `H:docs/AGENTS.md:44` "`dsh-translate-docs` remains user-invoked"。技能元数据由 `H:scripts/verify-skill-invocation-metadata.ts:2` "Keep Claude Code and Codex invocation metadata aligned for repository skills." 对齐。
- **A3.28** `H:.agents/skills/dsh-doc/SKILL.md:1` · prompt-only — 文档技能的入口约定在 `H:docs/AGENTS.md:3` "Use [dsh-doc](../.agents/skills/dsh-doc/SKILL.md) for placement and validation"；技能自身只声明 name/description 与后续正文。

**A 层小结：** 共 **161** 条（A1 55、A2 78、A3 28）。强制形式分布（实测自本文）：`prompt-only` **114**、`script·gate` **32**、`test·gate` **11**、`hook+prompt-only` **2**、`prompt-only+test·gate` **1**、`hook` **1**。即纯 prose、永远不会自动变红的是 **114/161 ≈ 70.8%**。

---

## §3 B 层：机械强制机制

机制按“它拦什么”归并；所有计数均为本次实测（命令见 §8）。

### B1 `scripts/verify-*.ts`：68 个

`H:scripts/AGENTS.md:3` 给这类脚本定了共同纪律（shell-free 调 pnpm、路径归一、语法感知发现、防空语料、覆盖每个改变检测边界的形态）。按主题归并并点名代表：

| 主题 | 代表脚本（均在 `scripts/`） | 它拦什么 |
|---|---|---|
| 文档预算与结构 | `verify-doc-budgets.ts`、`verify-md-wrap.ts`、`verify-md-links.ts`、`verify-doc-refs.ts`、`verify-package-paths.ts`、`verify-mermaid.ts`、`verify-doc-site-fragments.ts` | 超预算 / 硬换行段落 / 断链与断锚点 / TS 里根相对 docs 路径 / 陈旧 `packages/...` 引用 / Mermaid 语法 / VitePress 片段链接 |
| JSDoc 与散文词汇 | `verify-export-jsdoc.ts`、`verify-concrete-terms.ts` | 导出缺 JSDoc / 禁用词（`prove`+`nance`） |
| 双语配对 | `verify-translation-pairing.ts`、`verify-translation-prompt.ts` | 缺 counterpart、结构不匹配、每节哈希失配 |
| Agent Note 生命周期 | `verify-agent-note-format.ts`、`verify-agent-note-classification.ts`、`verify-archived-agent-notes.ts` | 头块与 lifecycle 小节、已退役标题、路径与类目、封印与 sidecar 哈希 |
| 包元数据与依赖 | `verify-package-dependencies.ts`、`verify-package-meta.ts`、`verify-npm-install-layout.ts`、`verify-optional-dependency-imports.ts`、`verify-dsh-package-licenses.ts`、`verify-node-next-types.ts` | npm 区段错配 / manifest 元数据 / 安装布局 / 静态导入可选依赖 / MIT 声明 / NodeNext 可消费性 |
| 包 README 契约 | `verify-package-readme-model-experience.ts`、`verify-package-readme-limitations.ts`、`verify-package-readme-summaries.ts`、`verify-subsystem-pages.ts` | Model Experience 字段 / `## Known Limitations and Deferred Work` / 摘要 / 子系统页归属 |
| 不变量与 runtime 闭包 | `verify-package-invariants.ts`、`verify-built-package-invariants.ts`、`verify-runtime-closure.ts` | 空的 invariant companion / 已发布 invariant 缺失 / 部署 manifest 缺 preset 插件或必需 peer |
| Client 图 | `verify-client-packages.ts`、`verify-client-domain-graph.ts`、`verify-client-route-resolution.ts`、`verify-client-ui-i18n.ts` | 模块请求图 / 域分层 / 浏览器路由目标 / 硬编码 UI 文案 |
| 类型与代码形状 | `verify-no-unknown-casts.ts`、`verify-type-equiv.ts`、`verify-no-bare-dispatcher.ts` | 新增 `as unknown` / 粘贴的类型漂移 / 自建 undici dispatcher |
| 配置与入口 | `verify-cordis-config.ts`、`verify-config-source-ownership.ts`、`verify-application-entrypoints.ts` | Loader 元数据与包解析 / 配置里的凭据或端点内联 / 绕过 `dsh` 启动器 |
| 实验隔离 | `verify-default-product-isolation.ts` | 实验包进入默认安装、运行时导入或出厂组合 |
| Session 词表 | `verify-v3-event-vocabulary.ts`、`verify-persistence-*`（含 `persistence-changes.ts --check`） | V3 迁移词表与钉住的本地 V3 writer 失配 / 持久化类型改动未记账 |
| 仓库链接与契约 | `verify-repository-references.ts`、`verify-public-repository-links.ts` | 维护文件里的真实 commit id 与不允许的组织 URL |
| 技能元数据 | `verify-skill-invocation-metadata.ts` | Claude Code 与 Codex 的调用元数据失配 |
| 模块图 | `verify-module-graph.ts`（经 `gen-module-graph.ts --check`） | 包级模块边 |

清单口径：`git ls-files 'scripts/verify-*.ts'` 顶层匹配 **68** 个，其中 **27** 个是 `*.spec.ts`（脚本自带测试、本身也是 `test` lane 的一部分），**41** 个是被测脚本（68 = 27 + 41）。前轮“267 个脚本”无法由任何常见口径复现，见 §6 更正 2。

### B2 生成器 `--check`：18 个入口

`rescope-vendor`、`gen-tsconfig-paths`、`gen-cordis-catalog`、`gen-cordis-api`、`gen-cordis-inspect-catalog`、`gen-client-catalog`、`gen-workflow-guest`、`gen-tool-catalog`、`gen-config-catalog`、`gen-plugin-packages`、`gen-dependency-catalog`、`gen-doc-graphs`、`gen-persistence-catalog`、`persistence-changes`、`gen-session-format-catalog`、`gen-third-party-notices`、`gen-scoped-events`、`gen-module-graph`。统一模式是“生成器 + `--check` 只校验不写盘”，因此 CI 能发现“源改了但派生物没重生成”。代表出处：`verify-cordis-catalog` = `tsx scripts/gen-cordis-catalog.ts --check`、`verify-doc-graphs` = `tsx scripts/gen-doc-graphs.ts --check`（实测自 `package.json`）。生成物的源头约束写在 `H:packages/core/session/src/known-event-types.ts:2` "GENERATED by `scripts/gen-persistence-catalog.ts` — do not edit by hand"。

### B3 `lefthook.yml`：唯一本地阻断层，9 个 job

- pre-commit（6 个 job）：`H:lefthook.yml:7` "translation pairing (staged records)"、`H:lefthook.yml:13` "archived agent notes"、`H:lefthook.yml:17` "lint (staged)"（带 `--fix`、`stage_fixed: true`）、`H:lefthook.yml:30` "third-party notices (staged)"（重生成后 `git add`，注释解释为何“重生成而非拒绝”）、`H:lefthook.yml:34` "whitespace (staged)"、`H:lefthook.yml:37` "vendor manifest guard"。
- pre-merge-commit（2 个 job）：`H:lefthook.yml:42` translation pairing、`H:lefthook.yml:48` archived agent notes。
- pre-push（1 个 job）：`H:lefthook.yml:54` "typecheck"。

其全部纪律由 `H:lefthook.yml:1` "Keep these local checkpoints fast; CI owns the full" + `H:lefthook.yml:2` "repository-wide gate matrix." 定调，与 A3.01 一致；安装本身自动化：`H:lefthook.yml:3` "# Install: `node scripts/install-lefthook.mjs` (runs automatically via postinstall)." 注意 pre-push 跑的 `pnpm run typecheck` 是两段——`typecheck = npm run build:lib:host && npm run typecheck:contracts-ready`（实测自 `package.json`），即“只跑增量 typecheck”仍需先构建 lib。

### B4 `scripts/doc-budgets.manifest.json`：词数 ratchet

**8** 个条目；语义是 `wc -w`（`H:scripts/verify-doc-budgets.ts:17` 的 `countWords` 即 `text.split(/\s+/).filter(Boolean).length`）。三条硬规则在同文件的文档注释里：`H:scripts/verify-doc-budgets.ts:3` "Missing files and invalid ceilings fail; `--list` reports current usage." 与 `H:scripts/verify-doc-budgets.ts:4-5` "Only listed standing docs are budgeted. Ceilings ratchet down with at least 5% headroom; raising one requires the justification defined in" 与 `H:scripts/verify-doc-budgets.ts:6` 的 `docs/AGENTS.md`。实测值与漂移见 §5 与 §6 更正 3。

### B5 覆盖率门禁 `test:coverage`：每文件 100%

`test:coverage = pnpm run build:native-system && vitest run --coverage`（实测自 `package.json`）。范围与阈值：`H:vitest.config.ts:209` `include: ['packages/*/*/src/**/*.{ts,tsx}']`，阈值 `H:vitest.config.ts:365` `perFile: true` 与 `H:vitest.config.ts:366` `statements: 100`（`branches`/`functions`/`lines` 同为 100，行 367–369）。`perFile` 的理由：`H:vitest.config.ts:358` "100% or it doesn't merge (docs/testing.md: excessive tests are welcome)." + `H:vitest.config.ts:359` "Per-file so a well-covered big file can't subsidize a bare one." 豁免逐条手写并附理由（`H:vitest.config.ts:212` 起，含 `types.ts`、`bin.ts`、`worker.ts`、`packages/self-modification/*`、若干 client 文件），分区模式下阈值置空（`H:vitest.config.ts:362` `thresholds: coveragePartitionMode` / `H:vitest.config.ts:363` `? undefined`），由 `test:coverage:partitioned` 汇总。策略表述在 `H:docs/testing.md:10` "**Coverage gate** (`pnpm run test:coverage`): the gating run, per-file 100% on `packages/*/*/src`." + "An uncovered line is often dead code the gate flags for deletion, not a missing test to bolt on."

### B6 `scripts/run-gates.ts`（1660 行）：把“跳过”当“失败”

- 唯一实现点：`H:scripts/run-gates.ts:121` `return results.some(result => result.gate.allowFailure !== true && (result.status === 'failed' || result.status === 'skipped'))` —— 只有显式 `allowFailure: true` 的 gate 才能被跳过而不影响退出码。
- 依赖塌陷同样计失败：`H:scripts/run-gates.ts:1114` `function gateFailed(state: GateState | undefined): boolean {` + `H:scripts/run-gates.ts:1115` `return state === 'failed' || state === 'skipped'`。
- 汇总与披露：`H:scripts/run-gates.ts:1640` 打印 "run-gates: ${passed} passed, ${failed} failed, ${skipped} skipped in ${seconds}s."；`H:scripts/run-gates.ts:1649` 用 `'NON-BLOCKING '` 前缀标出 allowFailure 的 gate，避免把非阻断项读成阻断项。
- gate 集合由 mode 决定：`H:scripts/run-gates.ts:108` `const gates = gatesForMode(mode)`；npm 入口有 `check:all`、`check:ci`、`check:ci:linux-primary`、`check:ci:static`、`check:ci:coverage`、`check:ci:bench`、`check:ci:snapshot`、`check:ci:artifacts`、`check:ci:consumers`、`check:ci:windows-blocking`、`check:ci:windows-complete`、`check:node-compat`、`doc-sync`、`hygiene`、`test:docs`（`doc-quick`）等；A 层反复引用的入口是 `doc-sync`、`hygiene`、`test:docs`。
- 并发与失败模式：`H:scripts/run-gates.ts:110` 读 `process.env.DSH_GATE_CONCURRENCY`，`H:scripts/run-gates.ts:115` 读 `DSH_GATE_FAIL_FAST`。

### B7 CI：20 个 workflow

PR 主门禁是 `ci.yml`（726 行、11 个 job；20 个 workflow 见下）；master 专属平台矩阵在 `ci-master.yml`（`H:.github/AGENTS.md:3` 说明其**不**监听 `pull_request`）。`ci.yml` 的阻断命令逐条：

- `H:.github/workflows/ci.yml:108` `run: pnpm run check:ci:static`（job `H:.github/workflows/ci.yml:50` "name: node 24 / static"）
- `H:.github/workflows/ci.yml:191` `run: pnpm run check:ci:coverage`（job `H:.github/workflows/ci.yml:118` "name: node 24 / coverage"）
- `H:.github/workflows/ci.yml:237` `run: pnpm run check:ci:bench`（job `H:.github/workflows/ci.yml:196` "name: node 24 / benchmarks"）
- `H:.github/workflows/ci.yml:364` `run: pnpm run check:ci:consumers`（job `H:.github/workflows/ci.yml:247` "name: node 24 / snapshots and artifacts"）
- `H:.github/workflows/ci.yml:451` `run: pnpm run check:node-compat`、`H:.github/workflows/ci.yml:546` `run: pnpm run check:ci:windows-blocking`、`H:.github/workflows/ci.yml:555` `run: pnpm run check:ci:windows-observational-ready`、`H:.github/workflows/ci.yml:632` `run: pnpm run check:ci:coverage`（Windows）
- 终局汇总 job `H:.github/workflows/ci.yml:701` "name: all checks passed"，其判定 `H:.github/workflows/ci.yml:726` `run: echo "All needed jobs succeeded (${{ join(needs.*.result, ', ') }})"`
- 其余 19 个 workflow 各管一类信号：`docs-pages`、`e2e`（真 API）、`expected-filenames`、`pi-ai-provider-e2e`、`sandbox`、`release`、`release-publish`、`release-vendor`、`release-vendor-publish`、`node-addon-system`、`node-addon-system-release`、`python-release`、`build-exe-for-python-sdk`、`build-preview-cloudflare`、`issue-lifecycle`、`issue-policy`、`weighted-approval`、`weighted-approval-review-event`、`ci-master`。

### B8 其他机械面与它的代价

`test:coverage:partitioned = tsx scripts/run-coverage-partitions.ts` 与 B6 的并发旋钮共同决定 CI 拓扑；代价写在 `H:docs/testing.md:21` "Forked workers run several spec files at once, the coverage gate splits into concurrent partitions beside the other gates in its job, and the self-hosted runners share one host and one volume." + "Only the process is isolated: ports, predictable paths, external namespaces, and inherited children are not."，因此“单独跑才过”被定义为被测文件的缺陷。

---

## §4 C 层：产品级 agent 约束（harness 对它所运行的 agent）

### C1 agent instructions 加载链与 1 MiB 上限

- **加载链**：`H:packages/context/agent-instructions/README.md:32` "The first request includes one durable baseline message with the user-global `$DSH_HOME/AGENTS.md` followed by the project chain — every existing candidate file from the project root down to the session working directory, in broad-to-specific order."；去重是内容级："Sibling files whose content matches after trimming render once, so a `CLAUDE.md` that duplicates its `AGENTS.md` is not repeated."，并且 `H:packages/context/agent-instructions/README.md:217` "a `CLAUDE.md` that symlinks its sibling `AGENTS.md` resolves to the same content and collapses like any duplicate, while a distinct real copy that has drifted from `AGENTS.md` loads in full alongside it."
- **候选集合**：`H:packages/context/agent-instructions/README.md:64` 规定 `instructionFileCandidates` 默认 `['AGENTS.md', 'CLAUDE.md']`；`H:packages/context/agent-instructions/README.md:65` 规定 `localInstructionFileCandidates` 默认 `['AGENTS.local.md', 'CLAUDE.local.md']`，作为 base 之后的覆盖层（`H:packages/context/agent-instructions/README.md:36` "`AGENTS.local.md` and `CLAUDE.local.md` are additive local overlays"）；`H:packages/context/agent-instructions/README.md:66` 规定 `dshHome` 默认 `$DSH_HOME` 或 `~/.dsh`。常量在 `H:packages/context/agent-instructions/src/config.ts:12` 与 `H:packages/context/agent-instructions/src/config.ts:13`；项目根标记是 `H:packages/context/agent-instructions/src/config.ts:11` 的 `.git`。
- **1 MiB 单文件上限**：`H:packages/context/agent-instructions/src/config.ts:14` `const DEFAULT_MAX_SOURCE_BYTES = 1_048_576`，语义是**忽略而非截断**：`H:packages/context/agent-instructions/src/config.ts:25` "Maximum UTF-8 bytes read from one instruction file; larger files are ignored."；按 schema 默认注入（`H:packages/context/agent-instructions/src/config.ts:43`），归一化处兜底（`H:packages/context/agent-instructions/src/config.ts:93`）。执行点是双保险——读取前按 size 短路 `H:packages/context/agent-instructions/src/files.ts:344` `if (file.size !== undefined && file.size > maxSourceBytes) return undefined`，流式累计 `H:packages/context/agent-instructions/src/files.ts:354` `if (bytes > maxSourceBytes) return undefined`。
- **另一个预算 `maxBytes`**：它是**必填**（`H:packages/context/agent-instructions/src/config.ts:42` `maxBytes: z.number().required(),`），语义见 `H:packages/context/agent-instructions/src/config.ts:23` "UTF-8 byte cap for one rendered baseline or dynamic batch; non-positive or non-finite disables loading."，即整个渲染结果的预算，与单文件上限正交。超预算的处置顺序是“先丢宽泛的、最后才截断最具体的”：`H:packages/context/agent-instructions/README.md:12` "A byte budget bounds the injected context: broader files are omitted before the most specific file is truncated, and an empty chain adds nothing."；截断提示 `H:packages/context/agent-instructions/src/render.ts:19` "Workspace instructions were omitted or truncated to fit the configured byte budget."。
- **注入措辞（软约束）**：内容被包在插件自有的 `<system-reminder>` 帧里（`H:packages/context/agent-instructions/src/render.ts:10`、`H:packages/context/agent-instructions/src/render.ts:11`），并明确降级为建议：`H:packages/context/agent-instructions/src/render.ts:12` "The following workspace instructions may be relevant to your work. " + `H:packages/context/agent-instructions/src/render.ts:13` "Use them as guidance when applicable. More specific instructions take precedence over broader ones. " + `H:packages/context/agent-instructions/src/render.ts:14` "They do not override system, developer, or direct user instructions."；同一约束在 README 示例输出里重复（`H:packages/context/agent-instructions/README.md:137` "Use them as guidance when applicable. More specific instructions take precedence over broader ones."）。
- **防越界逃逸**：`H:packages/context/agent-instructions/src/render.ts:82` `return body.replaceAll(SYSTEM_REMINDER_CLOSE, '<\\/system-reminder>')` —— 指令文件里出现的 `</system-reminder>` 字面量被转义，仓库可控文本无法关闭插件自有帧（理由 `H:packages/context/agent-instructions/README.md:106` "literal `</system-reminder>` text anywhere in instruction content or model-visible metadata is escaped so repository-controlled text cannot close the plugin-owned frame."）。
- **与日志不变量的接合**：注入的是普通带 source 的 `user/message`，因此可重放——`H:packages/context/agent-instructions/README.md:86` "Baseline and refresh messages are ordinary sourced `user/message` events, so they replay, compact, and resume exactly like other history, and model-visible state is always reconstructable from the session log."
- **刻意不解释的花样**：`H:packages/context/agent-instructions/README.md:216` "**Candidate semantics stay intentionally small** — lowercase names, `.claude/rules/`, and `@path` imports are not interpreted"

### C2 sandbox 分档与升级审批（“最窄升级”+ 仅当次生效）

- **严格更宽阶梯**：`H:packages/sandbox/sandbox/src/escalation.ts:28` 起定义 `WIDER_MODES`，`H:packages/sandbox/sandbox/src/escalation.ts:29` `'read-only': ['workspace-write', 'danger-full-access'],`、`H:packages/sandbox/sandbox/src/escalation.ts:30` `'workspace-write': ['danger-full-access'],`；`read-only` 是地板，没有任何模式能升级到它（`H:packages/sandbox/sandbox/src/escalation.ts:34-35` "closed escalation-target vocabulary — every mode a call could ever escalate TO"）。
- **只有两个可升级目标**：`H:packages/sandbox/sandbox/src/escalation.ts:41` `export const ESCALATION_TARGETS: readonly SandboxMode[] = ['workspace-write', 'danger-full-access']`，并解释为何不能把 enum 裁到“比 composition 默认更宽”：`H:packages/sandbox/sandbox/src/escalation.ts:36-38` "cutting the enum down to the modes wider than the composition's DEFAULT would strand a session whose effective mode sits below it"。
- **两参数必须同现且理由非空**：`H:packages/sandbox/sandbox/src/escalation.ts:53` `throw new Error('invalid escalation: sandbox_permissions requires a justification')`；反向亦然（`H:packages/sandbox/sandbox/src/escalation.ts:56`）；空理由 `H:packages/sandbox/sandbox/src/escalation.ts:59` `throw new Error('invalid justification: expected a non-empty sentence')`。
- **模型看到的固定文本**：拒绝标记 `H:packages/sandbox/sandbox/src/escalation.ts:72`（`[sandbox: file access denied under ${mode} mode]`，两个执法家族共用同一词汇，让模型对内核拒绝与 provider 篱笆拒绝识别一致）；同轮提示的措辞 `H:packages/sandbox/sandbox/src/escalation.ts:76-79` "The same-turn escalation hint that rides a denial when the composition advertises the escalation fields — the nudge lives at the decision point so the sanctioned retry does not depend on the model recalling the tool description."，其文本 `H:packages/sandbox/sandbox/src/escalation.ts:85` "[sandbox: escalation available — retry this exact ${subject} once with sandbox_permissions (the narrowest wider mode that suffices) + justification; the approval prompt asks the user]"；参数描述 `H:packages/sandbox/sandbox/src/escalation.ts:96` "The narrowest wider sandbox mode for a one-shot retry of the exact ${subject} the sandbox just denied; the retry asks the user for approval."
- **“仅当次”的落点**：批准结果只有 `allowed-once` 能放行，且返回的模式只被发起的那一次调用消费——`H:packages/sandbox/sandbox/src/escalation.ts:169` "@returns the granted mode, consumed by the one call that asked."；严格更宽的判定在**执行时**而非 schema：`H:packages/sandbox/sandbox/src/escalation.ts:177` `if (!(WIDER_MODES[effectiveMode] ?? []).includes(mode as SandboxMode)) {`；失败关闭的分支穷举在 `H:packages/sandbox/sandbox/src/escalation.ts:180`–`H:packages/sandbox/sandbox/src/escalation.ts:185`（无 approval 服务、无 agent 都直接抛），四种结局在 `H:packages/sandbox/sandbox/src/escalation.ts:199`–`H:packages/sandbox/sandbox/src/escalation.ts:206`，其中拒绝的措辞是 `H:packages/sandbox/sandbox/src/escalation.ts:203` "it stays denied, so stop and explain instead of working around it"。
- **审核轨迹**：请求理由 `H:packages/sandbox/sandbox/src/escalation.ts:192`（`escalate sandbox to ${mode}: ${justification}`），用户侧展示中英双语 `displayReason`（`H:packages/sandbox/sandbox/src/escalation.ts:193`–`H:packages/sandbox/sandbox/src/escalation.ts:196`）。
- **与仓库自身纪律同源**：A1.09；产品级表述另见 `H:packages/boot/plugin-manager/src/tools.ts:21` "Every action requires danger-full-access permission or approval for this call. Approval does not change the session permission mode." —— 审批不改会话模式，只授权这一次。

### C3 guard 插件：软约束与硬超时并存

`packages/guard/` 只有 2 个包，性质不同：

- **`@deepseek-ai/dsh-repeat-tool-reminder`（240 行）= 纯软约束**：`H:packages/guard/repeat-tool-reminder/src/index.ts:2` "Advisory per-agent repeat-call detector. It enriches post-execute decisions" + `H:packages/guard/repeat-tool-reminder/src/index.ts:3` "with logged model context without vetoing or rewriting calls."（"without vetoing" 就是它的边界）。两档措辞——第一档 `H:packages/guard/repeat-tool-reminder/src/index.ts:71` "You are repeating the exact same tool call with identical arguments. " + `H:packages/guard/repeat-tool-reminder/src/index.ts:72` "Carefully analyze the previous result before calling again: if the task is " + `H:packages/guard/repeat-tool-reminder/src/index.ts:73` "not complete, try a different approach or different arguments instead of " + `H:packages/guard/repeat-tool-reminder/src/index.ts:74` "repeating the call."；后续档 `H:packages/guard/repeat-tool-reminder/src/index.ts:78` "Repeated tool call detected:" + `H:packages/guard/repeat-tool-reminder/src/index.ts:82` "The repeated calls are not making progress. Do not call this tool with " + `H:packages/guard/repeat-tool-reminder/src/index.ts:83` "these exact arguments again. Inspect the latest result and choose a " + `H:packages/guard/repeat-tool-reminder/src/index.ts:84` "different action, different arguments, or finish the task if enough " + `H:packages/guard/repeat-tool-reminder/src/index.ts:85` "evidence has been gathered."。默认阈值 `H:packages/guard/repeat-tool-reminder/src/index.ts:53` `thresholds: z.array(z.number()).default([3, 5, 8]),`；引文上限 500 字符以**限提示而不限检测**（`H:packages/guard/repeat-tool-reminder/src/index.ts:43` "Maximum characters of canonical arguments quoted in the DETAILED reminder" + `H:packages/guard/repeat-tool-reminder/src/index.ts:46` "the cap bounds the reminder, never the detection (the chain key"）。
- **`@deepseek-ai/dsh-tool-call-timeout-policy`（81 行）= 硬约束**：`H:packages/guard/timeout-policy/src/index.ts:2` "Cooperative tool-call timeout enforcer. A tool declares `timeoutMs` and " + `H:packages/guard/timeout-policy/src/index.ts:3` "promises to honor `exec.signal`; this wrapper arms that deadline and maps its " + `H:packages/guard/timeout-policy/src/index.ts:4` "own expiry to `TOOL_TIMEOUT` without racing or abandoning the tool promise."；结果才真正阻断：`H:packages/guard/timeout-policy/src/index.ts:42` 的消息 `tool call timed out after ${timeoutMs}ms`，`H:packages/guard/timeout-policy/src/index.ts:45` `isError: true,`。
- 两者共同点是失败模式：配置错误一律在加载时抛——`H:packages/guard/repeat-tool-reminder/src/index.ts:28` "misconfiguration fails loud: an empty" 与 `H:packages/guard/repeat-tool-reminder/src/index.ts:29-30` "a non-integer, a value below 2, or a duplicate throws at plugin load, never a silent fall-back"，与 A1.29 的 “Misconfiguration fails loud” 同源。注意该层命名尚未冻结：`H:packages/guard/timeout-policy/src/index.ts:6` 留有 "FIXME: settle the intended `@deepseek-ai/dsh-timeout-guard` rename before the"。

### C4 `SESSION_FORMAT_VERSION` 与 required-on-read

- **版本常量**：`H:packages/core/session/src/types.ts:89` `export const SESSION_FORMAT_VERSION = 4`；它是唯一手工维护的当前 writer 数字——`H:docs/session-format-status.md:20` "**Checkout writer:** `SESSION_FORMAT_VERSION` in [core Session types](../packages/core/session/src/types.ts) is the only hand-maintained current-writer number in code."
- **只有结构变更才 bump**：`H:packages/core/session/src/types.ts:79-85` "wrong read). Only structural changes reach that bar: the header shape, the {@link SessionEvent} envelope, core event semantics, or the surface mechanism (the {@link SurfaceEventType} set and {@link SurfaceOp} variants). Adding an ordinary event type does not bump — the per-event {@link SessionEvent.ignorable} guard covers vocabulary growth instead. When in doubt, bump: a near-identity upgrade step is almost free, a missed bump makes older runtimes read new logs wrong silently." 其来源说明在同一段 JSDoc 开头。
- **required-on-read 的定义**：`H:packages/core/session/src/types.ts:503-506` "Absent means required: a reader meeting an unrecognized type without this marker MUST refuse to reconstruct the session instead of silently dropping the event, because an unrecognized required event may change how the rest of the log is interpreted."；保守方向 `H:packages/core/session/src/types.ts:508-509` "defaulting to required means a forgotten marker over-refuses (an inconvenience) rather than silently resuming a gutted session."；标记本身 `H:packages/core/session/src/types.ts:511` `ignorable?: true`。
- **机械面**：词表是生成物 `H:packages/core/session/src/known-event-types.ts:22` `export const KNOWN_SESSION_EVENT_TYPES: ReadonlySet<string> = new Set([`，实测 **59** 个事件类型；其文档说明 `H:packages/core/session/src/known-event-types.ts:10` "vocabulary this build understands. The persistence read path refuses to " + `H:packages/core/session/src/known-event-types.ts:11` "interpret a log containing a type outside this set unless the event " + `H:packages/core/session/src/known-event-types.ts:12` "carries the envelope's `ignorable` marker"；判定点 `H:packages/core/session/src/surface.ts:312` `if (!KNOWN_SESSION_EVENT_TYPES.has(event.type) && event.ignorable === true) return`。信封校验同时强制 `ignorable` 只能是 `true`：`H:packages/core/session/src/index.ts:231` `|| (event['ignorable'] !== undefined && event['ignorable'] !== true)) {`。另有消息投影白名单 `H:packages/core/session/src/known-event-types.ts:84` "Event types whose model-visible effects require an explicit pure interpreter."。
- **发布状态**：`H:docs/session-format-status.md:32` 记录 `latestFinalizedVersion: 4`；它与写入常量分开维护，`H:docs/session-format-status.md:22` "Before declaring a greater version unreleased, verify that no published release has advanced the record."；prerelease 也算发布义务 `H:docs/session-format-status.md:24` "An alpha, beta, or release-candidate product publication establishes released Session-format obligations."（原文用排印撇号 "GitHub’s"）。

### C5 “Model-visible ⟺ logged” 不变量

- **规则**：`H:AGENTS.md:136`（见 A1.23）；仓储架构文档的表述 `H:docs/architecture.md:125` "**Model-visible means logged.** A runtime invariant checks model requests are reconstructable from the log. New model-visible inputs require session events."；包级表述 `H:packages/core/session/README.md:88` "Model-visible means logged: anything that reaches a model request must be reconstructable from the log."
- **它是运行时断言，不是文档口号**：`H:packages/core/agent-loop/src/invariant.ts:2` "Package-owned request-reconstruction invariant for loop-built LLM calls."；具体检查逐条 fail —— `H:packages/core/agent-loop/src/invariant.ts:23` `if (!Object.isFrozen(options)) fail('a loop-built request must be frozen')`、`H:packages/core/agent-loop/src/invariant.ts:34` `return fail('a loop-built request with no step/start in its session log')`、`H:packages/core/agent-loop/src/invariant.ts:38` `return fail('a loop-built request with no request/header event in its session log')`、以及最关键的一致性比对 `H:packages/core/agent-loop/src/invariant.ts:42` 报 "(log-reconstruction desync)"。
- **注册方式**：不变量以 `./invariant` companion 形式注册（实测 **38** 个包提供 `packages/*/*/src/invariant.ts`），装载点 `H:packages/core/agent-loop/src/invariant.ts:19`（`const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {` + `H:packages/core/agent-loop/src/invariant.ts:21` `ctx.on('llm/stream', (options: GenerateOptions, next) => {`），并要求 `H:packages/core/agent-loop/src/invariant.ts:16` `export const inject = ['invariants']`。约束这些 companion 该不该存在的规则是 A1.19 / A2.15。
- **一处重要的不对称**：该不变量只覆盖 `H:packages/core/agent-loop/src/invariant.ts:22` `if (!isAgentLoopRequest(options)) return next()` 的构造路径；文档侧的对应审查在 A2.31（web 层纯展示，但新的 model-visible 输入仍需要 session 事件）。

---

## §5 覆盖表（实测行/词）

`AGENTS.md` 共 **22** 个，合计 **606** 行；全部处理，其中 4 个夹具归并为 A2.78。

| 文件 | 行 | 词 | 处理位置 |
|---|---|---|---|
| `AGENTS.md` | 182 | 1949 | A1.01–A1.55 |
| `.agents/notes/AGENTS.md` | 7 | 96 | A2.53, A2.54 |
| `.agents/notes/archived/AGENTS.md` | 7 | 118 | A2.55, A2.56 |
| `.agents/notes/implemented/AGENTS.md` | 13 | 132 | A2.57, A2.58 |
| `.github/AGENTS.md` | 3 | 141 | A2.59 |
| `apps/cli/tests/profiles/AGENTS.md` | 7 | 104 | A2.60 |
| `benchmarks/AGENTS.md` | 16 | 375 | A2.61, A2.62 |
| `docs/AGENTS.md` | 76 | 1313 | A2.43–A2.52 |
| `native/system/AGENTS.md` | 28 | 424 | A2.63, A2.64 |
| `packages/AGENTS.md` | 28 | 717 | A2.01–A2.21 |
| `packages/client/AGENTS.md` | 158 | 3479 | A2.22–A2.42 |
| `packages/experimental/AGENTS.md` | 9 | 217 | A2.65, A2.66 |
| `packages/schedule/AGENTS.md` | 11 | 286 | A2.67, A2.68 |
| `packages/web/AGENTS.md` | 5 | 77 | A2.69 |
| `scripts/AGENTS.md` | 5 | 116 | A2.70, A2.71 |
| `snapshots/AGENTS.md` | 17 | 474 | A2.72–A2.74 |
| 4 个 snapshot 夹具 `AGENTS.md`（路径见 A2.78） | 各 1 | 各 3 / 3 / 4 / 14 | A2.78（归并） |
| `vendor/AGENTS.md` | 7 | 84 | A2.75 |
| `website/AGENTS.md` | 23 | 398 | A2.76, A2.77 |

其余覆盖：

| 范围 | 规模（实测） | 处理位置 |
|---|---|---|
| `.agents/skills/*/SKILL.md` | 14 个 / 1260 行 | A3.01–A3.28 |
| `docs/testing.md` | 55 行 / 1348 词 | B5、B8；A1.42 引其快照规则 |
| `docs/defensive-patterns.md` | 33 行 / 518 词 | A1.50 与下表 |
| `.agents/notes/README.md` | 125 行 | A2.53–A2.58 的上位规则 |
| `scripts/verify-*.ts` | 68 个顶层匹配（含 27 个 `.spec.ts`）；`scripts/` 顶层跟踪文件 274、顶层 `*.ts` 254、全深度 `*.ts` 271 | B1 |
| 生成器 `--check` | 18 个 npm script / 18 个生成器入口 | B2 |
| `lefthook.yml` | 55 行 / 9 个 job | B3 |
| `scripts/doc-budgets.manifest.json` | 8 条目 | B4、§6 更正 3 |
| 覆盖率门禁 | `vitest.config.ts` 378 行；1 处 `include` + 5 项阈值 | B5 |
| `scripts/run-gates.ts` | 1660 行 | B6 |
| CI workflows | 20 个（`ci.yml` 726 行 / 11 job） | B7 |
| 指令加载链 | `packages/context/agent-instructions/`：`config.ts` 123、`files.ts` 530、`render.ts` 361、`index.ts` 360、`state.ts` 434 行 | C1 |
| sandbox 升级 | `packages/sandbox/sandbox/src/escalation.ts` 208 行 | C2 |
| guard | `packages/guard/*/src/index.ts` 240 + 81 行 | C3 |
| session 格式 | `SESSION_FORMAT_VERSION = 4`；事件词表 59 项 | C4 |
| 日志不变量 | `packages/core/agent-loop/src/invariant.ts`；38 个 `invariant.ts` companion | C5 |

`docs/defensive-patterns.md` 单列：33 行里是 6 条“已发生或差点发生的缺陷类”，每条都是可判定规则——报告正交结果独立（`H:docs/defensive-patterns.md:9` "Surface each independent fact (`timedOut`, `signal`, `exitCode`) on its own"）· 公共契约两侧都兑现（`H:docs/defensive-patterns.md:13` "When an implementation receives several representations of one outcome, normalize them before returning through the public API."）· async state 不是 synchronous state（`H:docs/defensive-patterns.md:17` "Never treat `agent/status` or `whenIdle()` as the result of one follow-up"）· dispose 必须到达静默而非仅请求（`H:docs/defensive-patterns.md:21` "A teardown that issues kills/aborts but returns before the work stops leaves orphans."）· 派发器里兜住回调异常（`H:docs/defensive-patterns.md:25` "A user-supplied listener that throws must not reject the promise it runs inside or starve the listeners after it."）· 不给不可信输出环境与可预测路径（`H:docs/defensive-patterns.md:29` "Spawned commands get a scrubbed env (drop `*KEY*`/`*SECRET*`/`*TOKEN*`/`*PASSWORD*`)"）。六条全部 `prompt-only`。

---

## §6 必答索引与前轮数字更正

### 必答 ①–⑦ 索引

| # | 问题 | 答案位置 | 一句话答案 |
|---|---|---|---|
| ① | A 层代表规则 `path:line` + 强制形式 | §2 全节 | 161 条，逐条带 `H:` 与 token |
| ② | 哪些只是 `prompt-only`、永远不会自动变红 | §7 | 114/161 ≈ 70.8% |
| ③ | 词数 ratchet 的顺序与出处 | A2.49 · `H:docs/AGENTS.md:54`–`H:docs/AGENTS.md:56` | Relocate → Condense → Raise，Raise 须在 PR 里为 manifest diff 给理由 |
| ④ | `CLAUDE.md` 是软链的含义 | A1.54 · §8 | 编辑 `AGENTS.md`；`CLAUDE.md` 只是指向它的符号链接 |
| ⑤ | sandbox 升级协议要点 | C2 | 严格更宽阶梯 + 两参数同现 + 仅 `allowed-once` 且仅当次 |
| ⑥ | “把跳过当失败”的机制出处 | B6 · `H:scripts/run-gates.ts:121` | 唯一实现点：`allowFailure !== true && (failed \|\| skipped)` |
| ⑦ | C 层加载上限与实际加载链出处 | C1 | 1 MiB/文件（`config.ts:14`，超出**忽略**）+ 必填 `maxBytes`；链 = `$DSH_HOME/AGENTS.md` → 项目根到 cwd 的 broad-to-specific 候选 |

③④⑤ 的核心句逐字：③ `H:docs/AGENTS.md:54` "**Relocate** content that belongs in another tier; leave a one-line link if needed."、`H:docs/AGENTS.md:55` "**Condense** content that belongs here but can be shorter."、`H:docs/AGENTS.md:56` "**Raise** the ceiling only when the words need the space; justify the manifest diff in the PR. A too-low ceiling is a budget bug."。④ `H:AGENTS.md:178` "`CLAUDE.md` symlinks `AGENTS.md` at root and `packages/`; edit the real file."。⑤ `H:packages/sandbox/sandbox/src/escalation.ts:96` 的 "The narrowest wider sandbox mode for a one-shot retry of the exact ${subject} the sandbox just denied"。

**④ 的补充：软链事实的实测证据与含义。** `ls -l $DSH/CLAUDE.md` 输出 `CLAUDE.md -> AGENTS.md`（符号链接，9 字节目标），而 `AGENTS.md` 是 17805 字节的普通文件（`-rw-rw-r--`）。含义三条：（1）**只有一个真源**——编辑 `CLAUDE.md` 就是编辑 `AGENTS.md`，不存在“两份要同步的指令文件”；（2）**这也是产品行为**：指令链默认把两个名字都当候选（C1，`config.ts:12`），内容级去重会把软链解析出的同一内容折叠成一次渲染（`README.md:217`），所以在**这个仓库**里 `CLAUDE.md` 既不会重复注入也不会漂移；（3）**反例被显式排除**：若 `CLAUDE.md` 是内容已漂移的独立副本，两者会**同时全量加载**——这正是 `verify-md-wrap` 要对软链指令文件去重的原因（`H:scripts/verify-md-wrap.ts:4` "The checker never rewrites; symlinked instruction"）。

### 前轮数字更正（每条附重测命令）

**更正 1 — SKILL.md 数量：`15` 与 `14` 是两个不同口径，brief 指定的命令得到 14。**

- `git -C … ls-files '.agents/skills/*/SKILL.md' | wc -l` → **14**（brief 指定的口径）。
- `git -C … ls-files '*.agents/skills/*/SKILL.md' | wc -l` → **15**：git pathspec 的 `*` 会跨越 `/`，多出的第 15 个是 `packages/experimental/webworker-runtime/tests/fixtures/vfs-example/workspace/.agents/skills/preview-tour/SKILL.md`，属于夹具，**不在** `.agents/skills/` 下。
- 文件系统 `.agents/skills/` 确有 **15** 个目录，缺 `SKILL.md` 的是 `ask-matt/`，它只含 `agents/openai.yaml`，被 `H:.agents/skills/.gitignore:1` 的 `*/agents/openai.yaml` 忽略，所以 `ask-matt/` 完全未跟踪（`git -C … ls-files .agents/skills/ask-matt` → 0 行）。
- 结论：brief 的“技能目录 15 个但其中 1 个无 SKILL.md”在**文件系统**口径下成立；但同一句指定的 `git ls-files` 命令给出 **14**，要拿到 15 必须用会把夹具算进来的宽松 pathspec。本文 A3 采 **14**（被跟踪、真正参与产品加载的技能）。旁证：快照里全部 `SKILL.md`（含夹具、preset、skill-office 资产、其他 snapshot）共 **24** 个，说明“按文件名数 SKILL.md”本身是个容易混淆的口径。
- 重测：`git -C $DSH ls-files '.agents/skills/*/SKILL.md' | wc -l`；`git -C … ls-files '*.agents/skills/*/SKILL.md' | wc -l`；`ls -1 <repo>/.agents/skills/ | wc -l`；`git -C … ls-files | grep -c 'SKILL\.md$'`。

**更正 2 — `scripts/` 规模：`267` 不可复现；以下为分口径实测值。**

| 口径（命令） | 实测 |
|---|---|
| `git ls-files 'scripts'`（目录递归语义） | 333 |
| `git ls-files 'scripts/*' \| grep -c '^scripts/[^/]*$'`（顶层跟踪文件） | 274 |
| `find <repo>/scripts -maxdepth 1 -type f` | 274 |
| `git ls-files 'scripts/*.ts' \| grep -c '^scripts/[^/]*\.ts$'`（顶层跟踪 `*.ts`） | 254 |
| `find <repo>/scripts -maxdepth 1 -type f -name '*.ts'` | 254 |
| `git ls-files 'scripts/verify-*.ts' \| grep -c '^scripts/verify-[^/]*\.ts$'` | 68 |
| `git ls-tree HEAD:scripts \| grep -c '^100644 blob'`（HEAD 顶层 blob） | 270 |
| `git ls-files 'scripts/**/*.ts' \| wc -l`（严格两层） | 17 |
| `git ls-files 'scripts/*.ts' \| wc -l`（`*` 跨 `/`）＝ `find <repo>/scripts -name '*.ts'` | 271 |

没有任何常见口径给出 267；最接近的 270（HEAD 顶层 blob）与 271（全深度 `.ts`）都不可由 267 复现。本文只声明 4 个可复现数字：**68 / 274 / 254 / 271**。注意 `git ls-tree HEAD:scripts` 同时给出 7 个 tree 与 4 个可执行脚本，这与“顶层跟踪文件 274 = 270 blob + 4 executable”自洽。

**更正 3 — 文档预算漂移确实存在，且不止一处；另有“prose 有名额、manifest 无条目”。**

实测（`wc -w`，语义与 `verify-doc-budgets` 的 `countWords` 相同）：

| 文件 | 实测词 | manifest | `docs/AGENTS.md:58` prose | 判定 |
|---|---|---|---|---|
| `AGENTS.md` | 1949 | 1950 | 1950 | 一致（余量 0.1%） |
| `docs/AGENTS.md` | 1313 | 1320 | 1320 | 一致（0.5%） |
| `docs/architecture.md` | 2403 | **2410** | **2400** | **漂移 +10** |
| `docs/cordis-primer.md` | 600 | 600 | 600 | 一致（0.0%） |
| `docs/defensive-patterns.md` | 518 | 550 | 550 | 一致（5.8%） |
| `docs/testing.md` | 1348 | **1350** | **1300** | **漂移 +50** |
| `packages/AGENTS.md` | 717 | 750 | 750 | 一致（4.4%） |
| `packages/README.md` | 975 | 994 | 994 | 一致（1.9%） |

两处“有名额无条目”：prose 里的 `examples/AGENTS.md 310` 在 manifest 无条目、且该路径在快照里**根本不存在**（`git ls-files '*examples/AGENTS.md'` → 0 行）；prose 的 "subtree `AGENTS.md` ≤ 600" 也没有 manifest 条目（manifest 只有 `packages/AGENTS.md` 750 与 `docs/AGENTS.md` 1320 两个例外）。后果可测：`packages/client/AGENTS.md` 3479 词、`snapshots/AGENTS.md` 474、`native/system/AGENTS.md` 424、`website/AGENTS.md` 398、`benchmarks/AGENTS.md` 375，全部超过 prose 的 600，而 `verify-doc-budgets` 只遍历 manifest 的 8 条（`H:scripts/verify-doc-budgets.ts:27` `for (const [path, ceiling] of Object.entries(manifest)) {`），**不会为它们变红**。这是“prose 声明了比机械面更严的规则”的实例，记入 §7 G1/G2。

重测：`node -e "const m=require('<repo>/scripts/doc-budgets.manifest.json');const fs=require('fs');for(const[p,c]of Object.entries(m))console.log(p,fs.readFileSync('<repo>/'+p,'utf8').split(/\\s+/).filter(Boolean).length,c)"`。

**更正 4（新增，前轮未提）— 生成器 `--check` 数量是 18，不是 15。**

`node -e 'const s=require("<repo>/package.json").scripts;console.log(Object.entries(s).filter(([k,v])=>/--check/.test(v)).length)'` → **18**，且 18 个条目对应 18 个不同生成器入口（列表见 B2）。

---

## §7 诚实清单与缺口

### 永远不会自动变红的规则（`prompt-only`）

**分布（实测自本文的 A 层条目，命令见 §8）。** A 层 161 条：纯 `prompt-only` **114**（70.8%）；带机械面 47 条——`script·gate` 32、`test·gate` 11、`hook+prompt-only` 2、`prompt-only+test·gate` 1、`hook` 1。口径说明：若一条规则只在 prose 声明、而机械面只覆盖它的一个子情形（如 A1.03 的“记账”有 gate、“该不该记”没有），本文记 `prompt-only` 并在该条注明机械面，避免把部分覆盖读成完全覆盖。

**风险最高的 `prompt-only` 组**（违反后 CI 不变红，只有 reviewer 或后续事故能发现）：

1. **证据选择类**：A1.11–A1.12、A3.02–A3.06。执行有 gate，“选得对不对”没有——最典型的是 A3.05：CI 无法知道你为了让一次本地跑变绿而降过覆盖率阈值。
2. **架构与设计类**：A1.24–A1.31、A2.05–A2.12、A2.30–A2.34。其中 A1.19 只有**反向**机械面：`verify-package-invariants` 能抓空 companion，抓不到“该有不变量却没写”。
3. **prose 与判断类**：A1.52–A1.53、A2.43–A2.44、A2.48、A2.51、A3.11–A3.17。`verify-concrete-terms` 只拦一个词，`verify-md-wrap` 只拦换行形状。
4. **流程与时序类**：A1.10、A1.46–A1.47、A3.07–A3.10。它们约束“在什么时刻做什么”，而 gate 只见最终树；A3.10 甚至是“在没有 CI 信号时如何正确诊断”。
5. **被 A 层引用的文档本身**：`docs/testing.md`、`docs/defensive-patterns.md`、`.agents/notes/README.md` 的绝大多数规则没有对应脚本，其“机械面”只来自别的规则引用它们。

### 机制层面的缺口

- **G1 ratchet 的 prose 名额严于机械面。** "subtree `AGENTS.md` ≤ 600" 与 "`examples/AGENTS.md` 310" 都没有 manifest 条目，而至少 5 个子树文件已超过 600 词（最极端 `packages/client/AGENTS.md` 3479）。见更正 3。
- **G2 prose 与 manifest 的数字已经漂移，且无人检查。** `architecture.md` 2400/2410、`testing.md` 1300/1350；`verify-doc-budgets` 只读 manifest（`H:scripts/verify-doc-budgets.ts:21` `const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Record<string, number>`），**没有任何 gate 交叉校验 `docs/AGENTS.md:58` 的 prose 数字与 manifest 是否相等**——这正是漂移能存活的原因。
- **G3 lefthook 只覆盖 3 个时刻共 9 个 job。** pre-push 只有 `typecheck`（`H:lefthook.yml:54`），所以“推前跑最窄证据”这条被引用最多的纪律在本地**不阻断**：能推上去、交给 CI 发现。
- **G4 本地 hook 可被绕过。** `H:lefthook.yml:3` 依赖 postinstall 安装；A3.09 明确允许“用户明确要求时”绕过并报告——即绕过**被允许**，只要求披露。
- **G5 覆盖率豁免是手写清单。** `H:vitest.config.ts:212` 起的 exclude 数组逐条手写，含 `H:vitest.config.ts:224` "harness the jsdom lane doesn't cover yet. TODO(gui): cover and" + `H:vitest.config.ts:225` "remove as the client test lane matures." 这类 TODO 级豁免；没有 gate 检查“豁免是否还有理由”。
- **G6 该不该 bump `SESSION_FORMAT_VERSION` 是 prose。** `H:packages/core/session/src/types.ts:84` 只说 "in doubt, bump"，没有 gate 检查“本次 envelope 改动是否该 bump”；`verify-v3-event-vocabulary` 只覆盖 V3 词表的发布前一致性。
- **G7 1 MiB 上限是“忽略”而非“报错”。** 超过 `maxSourceBytes` 的指令文件被静默排除（`H:packages/context/agent-instructions/src/files.ts:344` 返回 `undefined`），模型侧只可能在总预算不足时看到 `H:packages/context/agent-instructions/src/render.ts:19` 那条提示。对写指令文件的人，“文件写太大”既不变红、也不一定被看见。
- **G8 技能目录的“存在性”没有 gate。** `ask-matt/` 这一未跟踪技能目录能长期存在，是因为 `verify-skill-invocation-metadata` 只对齐**已跟踪**技能的调用元数据。
- **G9 “保留 5% 余量”本身无 gate。** `H:docs/AGENTS.md:58` 要求 "At or below target, retain at least 5% headroom"，但 8 个条目里有 4 个余量低于 1%（`AGENTS.md` 0.1%、`docs/AGENTS.md` 0.5%、`docs/cordis-primer.md` 0.0%、`docs/testing.md` 0.1%）；`verify-doc-budgets` 只检查是否超顶。
- **G10 “跳过即失败”有唯一豁免口。** `H:scripts/run-gates.ts:121` 的 `allowFailure !== true` 是设计好的逃生门；哪些 gate 被标为非阻断只存在于 gate 定义里，没有 meta-gate 审计“这个豁免是否仍然合理”。

### 反向缺口：机械面比 prose 更严的地方

- **词数**：`verify-doc-budgets` 拒绝超额，而 `H:docs/AGENTS.md:58` 同时禁止把预算当缩减目标（"Ceilings are guardrails, not reduction targets."）——后一条无 gate。
- **归档草率**：`verify-archived-agent-notes` 会拒绝被改动过的封印产物（A2.56），但“归档决定是否恰当”由 `dsh-archive-agent-notes` 语义判断（A3.26），无 gate。
- **gate 自身的自律**：A2.70 要求 source-ownership gate "guard against an empty or narrowed corpus"，个别脚本确实做了（`H:scripts/verify-no-unknown-casts.ts:93` `throw new Error(\`verify-no-unknown-casts: source discovery omitted ${area}\`)`），但没有 gate 检查“所有 gate 都做了防空语料”。

---

## §8 自审：引文包含性核对、计数重测、只读收尾

**引文核对方法。** 用一段一次性内联脚本（不落盘）读取本文，逐行扫描 `H:path:line(-line)` 与 ASCII 双引号引文，把引文按 `…` 分段，逐段在**被引文件的被引行范围内**做空白归一化后的子串匹配；引文与其最近的**前置** `H:` 引用配对（这正是本文的行文格式）。对代码文件额外剥离注释前缀（`//`、`*`）与拼接字符串字面量的边界标点（行首 `+ '`、行尾 `'`），因为源码里的长句是跨行 JSDoc 或字符串拼接；对 Markdown/YAML 不做此剥离（否则会吃掉 `**` 强调）。任一引文段在被引范围内找不到即 FAIL。

**结果：325 个带同行 H: 锚点的源引文段全部命中，0 个 FAIL；全文另有 12 段 ASCII 引号字符串不属源引文（2 段 node -e 证据命令、4 段锚点在前文/交叉引用、5 段 §8 修正记录自引、1 段方法说明词），不计入。** 扫描脚本与输出（脚本一次性内联执行，不在任何仓库落盘）：

```sh
$ python3 - $DSH <<'PY'
# 读取 findings/03-deepseek-harness.md，逐行按 tok 正则取 H:<path>:<line> 与 "引文"；
# 引文与最近的**前置** H: 引用配对（本文的行文格式即“引用在前、引文在后”）；
# 引文按 … 分段，逐段要求 norm(frag) 是 norm(rendered(citedRange)) 的子串。
fragments checked: 325   FAILURES: 0
# 口径核算（同一脚本的计数分支）：全文 ASCII 引号段（按 … 分段）= 337；其中有同行 H: 锚点的 = 325；
# 无锚点、不计入的 = 337 − 325 = 12（分类见上一段）。
inline quotes total: 337   anchored (same-line H:): 325   unanchored: 12
```

配对模型必须与本文格式一致：本文一律“引用在前、引文紧跟其后”，因此判据取**最近的前置引用**。若改成宽松变体（一个引文对同行所有引用都试一遍），一行内多组“引用+引文”会互相交叉、产生大量假失败（首轮实测 43 条，全部复核后为假阳性），故不采用。在最近前置引用的判据下，首轮残留的失败逐条复核后**全部是真实缺陷**（行号偏差或引文内容错误），修完归零。

**修正记录（自审发现的真实错误，均已改）。** ① 引文被拆行导致的行号偏差：`docs/AGENTS.md` 的 "Standing orders" 在 21 行（原写 17）、slop checklist 两条在 64 与 72 行（原合并为 62）、`verify-type-equiv.ts` 与 `verify-translation-pairing.ts` 的 doc 注释跨 2–3 行、`verify-client-domain-graph.ts` 跨 2–3 行且原文含转义反斜杠 `*\/src/`、`config.ts` 的 `maxSourceBytes` 语义在 25 行（原写 14）、`types.ts` 的 bump 规则跨 79–85 行、`@returns` 在 169 行（原写 170）、`escalation.ts` 的 hint JSDoc 在 76–79 行（原写 84）、`lefthook.yml` 开场注释跨 1–2 行、`repeat-tool-reminder` 的引文实际跨 2–3 / 28–30 / 43–46 / 71–74 / 82–85 行、`timeout-policy` 跨 2–4 行、5 个 `SKILL.md` 首段在 8 行（原写 9）、`verify-doc-budgets.ts` 的三条规则在 3–6 行、`verify-default-product-isolation.ts` 的 doc 注释在 2 行（原写 1）、`known-event-types.ts` 的投影白名单 JSDoc 在 84 行（原写 85）、`verify-md-wrap.ts` 的 "The checker never rewrites" 在 4 行（原写 5）。② **真实内容错误**（不是行号问题，全部由本次自审抓出）：`escalation.ts:96` 的引文漏了 "sandbox" 一词（原文是 "The narrowest wider **sandbox** mode …"）；`packages/client/AGENTS.md` 的 web 层条目引文内含 ASCII 双引号导致与本文的引文定界符冲突，改为引用不含内部引号的两段；`verify-doc-budgets.ts` 与 `repeat-tool-reminder` 的两条引文跨到以反引号开头的续行，改为在行边界处断开。③ **A1.06 的原始数字是错的**：初稿写 "44 条脚本中 41 条与文档一致，3 条只在 manifest 侧出现"，实测是 `package.json` 184 个 scripts、`AGENTS.md` 的 `## Commands` 段提及 18 个且全部存在，已改写为该实测结论。

**计数重测。** 文档里每个数字都由下列命令在 `$DSH` 下重测：

| 数字 | 命令 | 实测 |
|---|---|---|
| `AGENTS.md` 文件数 | `git ls-files '*AGENTS.md' \| wc -l` | 22 |
| `AGENTS.md` 总行数 | `git ls-files '*AGENTS.md' \| while read f; do wc -l < $f; done \| paste -sd+ \| bc` | 606 |
| 根 `AGENTS.md` | `wc -l` / `wc -w` | 182 行 / 1949 词 |
| `SKILL.md` 数 / 行数 | `git ls-files '.agents/skills/*/SKILL.md' \| wc -l`；同集合 `wc -l` 求和 | 14 / 1260 |
| `verify-*.ts` | `git ls-files 'scripts/verify-*.ts' \| grep -c '^scripts/verify-[^/]*\.ts$'` | 68 |
| `scripts/` 顶层跟踪文件 | `git ls-files 'scripts/*' \| grep -c '^scripts/[^/]*$'`；`find -maxdepth 1 -type f` | 274 / 274 |
| `scripts/` 顶层 `*.ts` | `git ls-files 'scripts/*.ts' \| grep -c '^scripts/[^/]*\.ts$'`；`find -maxdepth 1 -name '*.ts'` | 254 / 254 |
| 全深度 `scripts/**/*.ts` | `find <repo>/scripts -name '*.ts' -not -path '*/node_modules/*'` | 271 |
| 生成器 `--check` | `node -e` 过滤 `package.json` scripts 含 `--check` | 18 |
| lefthook job 数 | `grep -c '^    - name:' lefthook.yml` | 9 |
| manifest 条目 | `Object.keys(require('scripts/doc-budgets.manifest.json')).length` | 8 |
| workflow 数 | `git ls-files '.github/workflows/*.yml' \| wc -l` | 20 |
| 事件类型数 | 数 `known-event-types.ts` 第 23–81 行的条目 | 59 |
| invariant companion | `git ls-files 'packages/*/*/src/invariant.ts' \| wc -l` | 38 |
| 夹具词数 | 4 个夹具 `wc -w` | 3 / 3 / 4 / 14 |
| A 层条目 | 本文内 `grep -c '^- \*\*A'` | 161（A1 55 / A2 78 / A3 28） |
| 强制形式分布 | 本文内提取每个条目 `· <token> —` | prompt-only 114、script·gate 32、test·gate 11、hook+prompt-only 2、prompt-only+test·gate 1、hook 1 |
| 引文段数（带同行 H: 锚点） | §8 的扫描脚本 | 325（全文 ASCII 引号段共 337，其中 12 段无同行锚点不计入） |
| `package.json` scripts 总数 | `Object.keys(require('package.json').scripts).length` | 184 |
| `## Commands` 提及的 script | 取 `AGENTS.md` 第 82–106 行的 `pnpm run <name>` 去重 | 18 个，且 18/18 存在于 `package.json` |
| 本文自身行数 | `wc -l findings/03-deepseek-harness.md` | 598（见下） |

**长度披露。** 本文 **598 行**，超出任务书 300–500 行的期望。超出部分是覆盖驱动的、未发现注水段落：161 条 A 层条目每条都必须自带 `H:` 与强制形式 token（约占 200 行），§5 覆盖表要求含实测行数，§8 要求把自审命令与结果落盘，末尾的 δ 修正记录是 `task-7` 明确要求的追加小节（含复跑命令与输出，约 50 行）。若必须压回 500 行以内，唯一不损失覆盖的办法是把 §5 的两张表与 §8 的计数表改成纯文本列举（会降低可审计性）。

**只读收尾。** 分析结束后 `git -C $DSH status --short` 输出 **0 行**，与开始时一致；本次分析全程未在该仓库写任何文件、未执行任何 git 写命令、未运行 `pnpm`/构建/`scripts/verify-*`/生成器、未触碰 `node_modules/`。**本文档是本次任务唯一写入的文件。**

**未覆盖/未验证项（诚实声明）。** ① 68 个 `verify-*` 脚本只读了每个的文档注释与代表行的报错文本（用于 B1 归并与出处），未逐个通读实现；B1 的“它拦什么”描述来自各脚本自身的 `@module`/首段注释，不是逆向推断。② CI 的 job 依赖图、`allowFailure` 的具体标记集合、`gatesForMode` 的完整 mode→gate 映射未逐个核对（`run-gates.ts` 共 1660 行，只取证了 skip 语义与汇总）。③ `vendor/` 按提示单独标注为内置上游副本，其内部规则未逐条分析（只处理 `vendor/AGENTS.md`）。④ 20 个 workflow 中 19 个只列名与主题，未逐个提取 run 命令。⑤ 覆盖率豁免清单只抽样引用，未逐条判断合理性。⑥ 32 个 `.zh.md` 双语 counterpart 未纳入范围（本文只分析英文侧与规则面）。

---

## δ 修正记录（after 99-verification §2.3）

本节只记录 `findings/99-verification.md` §2.3 三条必修的定点修正；正文其余内容未动（不重写、不重排、不改其它数字）。三条均由我在独立复跑后确认，不只依据核验方结论。

**δ1 — B1 的 spec / 非 spec 拆分（原 `:245`，最严重）。** 改前：`顶层匹配 **68** 个，其中 **34** 个是 *.spec.ts（脚本自带测试、本身也是 test lane 的一部分），**34** 个是被测脚本`；改后：`顶层匹配 **68** 个，其中 **27** 个是 *.spec.ts（脚本自带测试、本身也是 test lane 的一部分），**41** 个是被测脚本（68 = 27 + 41）`。同一处修正同步落到 §5 覆盖表（`含 34 个 .spec.ts` → `含 27 个 .spec.ts`）。复跑：

```sh
$ cd $DSH
$ git ls-files 'scripts/verify-*.ts' | grep -c '\.spec\.ts$'
27
$ git ls-files 'scripts/verify-*.ts' | grep -vc '\.spec\.ts$'
41
$ find scripts -maxdepth 1 -name 'verify-*.ts' -name '*.spec.ts' | wc -l
27
$ find scripts -maxdepth 1 -name 'verify-*.ts' ! -name '*.spec.ts' | wc -l
41
```

两条独立口径一致：`git ls-files`（跟踪文件）与 `find`（工作树）都给 **27 / 41**，合计 68。

**δ2 — B7 与 §5 的 `ci.yml` job 数（原 `:277`、`:381`）。** 改前：`ci.yml（726 行、20 个 job）` 与 §5 计数表的 `（ci.yml 726 行 / 20 job）`；改后：`ci.yml（726 行、11 个 job；20 个 workflow 见下）` 与 `（ci.yml 726 行 / 11 job）`。复跑：

```sh
$ grep -nE '^  [a-z0-9-]+:$' .github/workflows/ci.yml
42:  node-24:               110:  node-24-coverage:      193:  node-24-bench:
239:  node-24-consumers:     367:  node-compat:           459:  python-sdk:
487:  python-runtime:        503:  windows-build:         565:  windows-coverage:
643:  windows-native-tests:  700:  all-checks-passed:
$ grep -nE '^  [a-z0-9-]+:$' .github/workflows/ci.yml | wc -l
11
```

11 个 job 键中 10 个是执行 job（`node-compat` 为 3 元矩阵）、1 个是终局汇总 `all-checks-passed`。`workflow` 数仍是 20（`git ls-files '.github/workflows/*.yml' | wc -l` → 20），两个数字此后不再混用。

**δ3 — §8 引文段口径未定义（原 `:500`、`:507`、`:535`）。** 改前：`325 个引文段全部命中，0 个 FAIL`，既未说明 325 的分母，也未说明全文还有多少 ASCII 引号字符串被排除；改后：明确为 `325 个带同行 H: 锚点的源引文段`，并列出不计入的 12 段及其四类来源；代码块与计数表同步加上核算行。复跑（同一脚本的计数分支）：

```sh
$ python3 - findings/03-deepseek-harness.md <<'PY'
# 逐行取 ASCII 引号、按 … 分段，再判断该段之前同行是否出现过 H: 引用
total quote fragments (split on …): 337
anchored to a same-line H: reference: 325
unanchored: 12
PY
```

12 段的分类（逐条复核，与 `99-verification.md` §2.3 的分解一致）：**2 段** `node -e` 证据命令（§6 更正 3、更正 4 的重测命令）、**4 段**锚点在前文或交叉引用（§6 更正 3 的 `git ls-files '*examples/AGENTS.md'`；§7 G1 引用的 `subtree AGENTS.md ≤ 600` 与 `examples/AGENTS.md 310`；§7 末条引用的 `guard against an empty or narrowed corpus`）、**5 段** §8 修正记录自引、**1 段**方法说明词（引文定界符示例）。

**δ 后的自审复跑。** 包含性判定的判据、配对模型与代码文件归一化规则均未改动，复跑结果与改前一致：**325 段命中、0 FAIL**；全文 ASCII 引号段 337、无同行锚点 12。δ 节本身不引入新的 ASCII 引号，故 337 / 12 / 325 三个数在本次修正后仍成立（可复跑 `findings/99-verification.md` 附录 A 的脚本或本文 §8 的脚本）。
