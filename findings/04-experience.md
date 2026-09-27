# 04 · 个人经验溯源：早期自建前端项目的 AGENTS.md 规则提取（task-4）

> 该项目已去标识：下文统一称"该项目"，不出现项目名与仓库路径。规则已泛化进 `rules/`，本文件仅作溯源记录。

## 0 溯源

| 项 | 值 |
| --- | --- |
| 源文件 | 作者早期自建前端项目的 `AGENTS.md`（78 行；项目已去标识） |
| 规模 | 78 行 / 5162 B（只读核验：`read` + `wc -l`；未做任何写入） |
| 结构 | L1–27 = Vite+ 注入区块（`<!--VITE PLUS START-->` … `<!--VITE PLUS END-->`）；L28 空行；L29–78 = 人工撰写的项目约定 |
| 源项目写操作 | 无。全程只读命令（`read`/`cat`/`ls`/`find`/`grep`/`git status\|diff\|ls-files\|check-ignore`/`md5sum`/`diff`）；**未执行任何 `vp` 命令**（含 `vp check`/`vp build`，避免写盘） |

**Vite+ 注入区块证据（结论：工具自动注入，非人工撰写）**

| 证据 | 路径 | 说明 |
| --- | --- | --- |
| 标记常量定义 | `/home/leihaohao/workspace/vite-plus/packages/cli/src/utils/agent.ts:77-78` | `AGENT_INSTRUCTIONS_START_MARKER = '<!--VITE PLUS START-->'`、`AGENT_INSTRUCTIONS_END_MARKER = '<!--VITE PLUS END-->'` |
| 模板文件 | 项目 `node_modules/vite-plus/AGENTS.md`（vite-plus `0.3.3`，软链 → `.pnpm/vite-plus@0.3.3_…/node_modules/vite-plus`） | 与项目 AGENTS.md L1–27 **md5 完全相同**：`ee8ea10ff2d9fbad9e3a5254c44d3882`（`diff` 无输出 → 逐字节一致） |
| 模板读取代码 | `agent.ts:237` | `const templatePath = path.join(pkgRoot, 'AGENTS.md')` —— 注入内容取自 vite-plus 包自带的 `AGENTS.md` |
| 更新逻辑 | `agent.ts:225-250`（`updateExistingAgentInstructions`）、`:247-250` | 注释明示 "Silently update agent instruction files that contain Vite+ markers … No Vite+ markers → no writes"；仅在有标记时用 `replaceMarkedAgentInstructionsSection()` 覆写标记区间 |
| 设计依据 | `/home/leihaohao/workspace/vite-plus/rfcs/config-and-staged-commands.md:106` | "Agent instructions: silently updates existing files that contain Vite+ markers when content is outdated. Never creates new agent files." |
| 行为快照测试 | `/home/leihaohao/workspace/vite-plus/packages/cli/snap-tests-global/command-config-update-agents/snap.txt` | 跑 `vp config` 后标记外用户内容（`# My Project`、`More custom content below.`）保留，标记内 `OUTDATED CONTENT` 被替换 |
| 本项目触发点 | 项目 `package.json:10` `"prepare": "vp config"`；`.vite-hooks/` 存在且 `git config core.hooksPath` = `.vite-hooks/_` | `prepare` 生命周期钩子在安装时执行 `vp config`，即注入/刷新时机；hooks 目录被创建 ⇒ `vp config` 确曾在本项目运行 |
| 注入时序 | `git diff HEAD -- AGENTS.md` | HEAD 版本**已含**标记区块；diff 从 `@@ -25,3 +25,54 @@` 起、`<!--VITE PLUS END-->` 是上下文行，人工的「项目约定」段追加在 END **之后** ⇒ 先由 `vp create`/`vp migrate` 注入，后由人追加，且注入区间未被人工改动 |

**抽查对照的项目文件**：`src/layouts/settings.ts`、`src/layouts/app-layout.tsx`、`src/layouts/menu.tsx`、`src/stores/{layout,user}.ts`、`src/router.tsx`、`src/routes/**`、`src/routeTree.gen.ts`、`vite.config.ts`、`tsconfig.json`、`package.json`、`pnpm-workspace.yaml`、`.vite-hooks/pre-commit`、`node_modules/.pnpm/@ant-design+pro-components@3.1.14-7_*/node_modules/@ant-design/pro-components/es/layout/defaultSettings.js`、`node_modules/.pnpm/@tanstack+react-store@0.11.1_*/node_modules/@tanstack/react-store/src/index.ts`、`node_modules/@tanstack/router-plugin/dist/esm/vite.js`、`node_modules/.pnpm/vite-plus@0.3.3_*/node_modules/vite-plus/dist/define-config-DPNEJxPz.d.ts`、`node_modules/.pnpm/vite-plus@0.3.3_*/node_modules/vite-plus/docs/config/{fmt,lint}.md`。

## 1 一句话定位

该项目是「React 19 + antd 6 + Ant Design Pro Components 3 + TanStack Router/Store + Vite+ 工具链」的单体中后台前端项目；其 AGENTS.md = **工具自动注入的 Vite+ 操作手册（L1–27，随包升级会被覆写）** + **人工撰写的 5 组项目约定（L29–78：技术栈 / 依赖与配置 / 代码分层 / 编码约定 / 验证）**，共 28 条可执行约束，核心取向是「**反防御式编码 + 最小化声明 + 把正确性交给类型系统与工具链**」。

## 2 规则清单

标记 `[项目专属]` / `[可泛化]`；带 ★ 者为融合通用 AGENTS.md 的高价值候选；※ 注释见本节末。

### 2.1 Vite+ 注入区块（L1–27，机器管理区间）

| ID | 中文规则 | verbatim 摘引 | 行号 | 类别 | 强制形式 | 可迁移性 |
| --- | --- | --- | --- | --- | --- | --- |
| V1 | 在 Vite+ 项目里经 `vp dev`/`vp build` 调用 Vite，不要把 Vite+ 当作 Vite 使用 | "Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`" | L5 | 工具链认知 | 说明（隐含强制） | [项目专属] |
| V2 | Vite+ 用法优先查随包本地文档 `node_modules/vite-plus/docs`，其次 `https://viteplus.dev/guide/` | "Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/." | L7 | 文档检索 | 建议 | [项目专属] |
| V3 | 先查 `package.json` 与 `vite.config.ts` 是否定义同名脚本/任务，再决定用内置命令还是 `vp run <name>` | "Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name." | L11 | 命令语义 | 应当（必须） | [可泛化]※ |
| V4 | 排查版本/依赖图用 `vp toolchain`、`vp why <package>`（`--global` 忽略本地包） | "Use `--global` to ignore the local `vite-plus` package" | L15–18 | 诊断工具 | 建议 | [项目专属] |
| V5 | 拉取远端变更后、开工前先安装依赖 | "Run `vp install` after pulling remote changes and before getting started." | L22 | 前置准备 | 强制（checklist） | [可泛化]※ |
| V6 | 改动后跑格式化 + lint + 类型检查 + 测试 | "Run `vp check` and `vp test` to format, lint, type check and test changes." | L23 | 验证 | 强制（checklist） | [可泛化]※ |
| V7 | 确认项目是否有 `vite.config.ts` 任务或 `package.json` 脚本形式的验证入口，并据此执行 | "Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`." | L24 | 验证 | 强制（检查） | [可泛化]※ |
| V8 | 环境/运行时/包管理行为异常时跑 `vp env doctor`，求助时附上其输出 | "If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help." | L25 | 诊断 | 条件强制 | [可泛化]※ |

### 2.2 项目约定区块（L29–78，人工撰写、可自由编辑）

| ID | 中文规则 | verbatim 摘引 | 行号 | 类别 | 强制形式 | 可迁移性 |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | 项目定位为 antd + Pro Components 中后台前端，工具链固定 Vite+（`vp`），不引入第二套构建/包管理入口 | "基于 antd 与 Ant Design Pro Components 的中后台前端项目，工具链为 Vite+（`vp`）" | L31 | 定位 | 说明（隐含约束） | [项目专属] |
| P2 | 只用文件式路由，`src/routes` 是唯一路由来源 | "文件式路由，`src/routes` 是唯一路由来源" | L39 | 架构 | 强制 | [项目专属] |
| P3 | 全局状态统一用 @tanstack/react-store：写用 `store.setState`、读用 `useSelector`，不用已废弃的 `useStore` | "写用 `store.setState`，读用 `useSelector`（`useStore` 已废弃）" | L40 | 架构/API | 强制 | [项目专属] |
| P4 | 新增依赖前先确认社区成熟度与维护活跃度；store/router/数据请求等优先检查 TanStack 是否已有对应库 | "新增依赖前先确认社区成熟度与维护活跃度；store、router、数据请求等优先检查 TanStack 是否已有对应库。" | L44 | 依赖政策 | 强制（前置尽调） | [可泛化]★ |
| P5 | 安装后按官方**最新**文档核对 API 与配置项，不照抄旧教程（例：`TanStackRouterVite` 已废弃 → 用 `tanstackRouter`） | "安装后按官方最新文档核对 API 与配置项，不要照抄旧教程" | L45 | 依赖/API 正确性 | 强制 | [可泛化]★ |
| P6 | 写配置前先确认该项是否必需、工具默认值是否已满足需求，**只声明与默认值不同的部分** | "只声明与默认值不同的部分" | L46 | 配置冗余 | 强制 | [可泛化]★★ |
| P7 | 不引入未被使用的依赖和配置块；某包已完整 re-export 另一包时只声明前者、从同一入口导入 | "不引入未被使用的依赖和配置块" / "只声明前者，从同一入口导入即可" | L47 | 依赖/配置冗余 | 强制 | [可泛化]★★ |
| P8 | 新增文件必须落入约定目录，各目录职责固定（入口/路由/布局/状态/应用级模块） | "`src/` … `routes/` 文件式路由，页面组件直接写在这里 … `modules/` 单点登录、admin-service 初始化等应用级模块" | L51–60 | 分层 | 强制 | [项目专属]※ |
| P9 | 跨目录引用统一用 `@/` 前缀，同目录内用相对路径 | "跨目录引用统一用 `@/` 前缀（由 `tsconfig.json` 的 `paths` 与 `vite.config.ts` 的 `resolve.tsconfigPaths` 提供），同目录内用相对路径。" | L62 | 导入风格 | 强制 | [可泛化]※ |
| P10 | 页面组件就近写在对应路由文件里，不额外包一层 `pages/`；仅被多处复用的 UI 才提取为公共组件 | "页面组件就近写在对应路由文件里，不要再包一层 `pages/`；只有被多处复用的 UI 才提取为公共组件。" | L63 | 代码组织 | 强制 | [可泛化]★ |
| P11 | 新增路由后让插件重新生成 `routeTree.gen.ts`；不手写 `createFileRoute` 的路径字符串，不手改生成结果 | "新增路由后让插件重新生成 `routeTree.gen.ts`，不要手写 `createFileRoute` 的路径字符串，也不要手改生成结果。" | L64 | 生成物 | 强制 | [项目专属]※ |
| P12 | `src/routeTree.gen.ts` 系 router-plugin 生成物：禁止手改，且必须提交入库 | "`routeTree.gen.ts`  @tanstack/router-plugin 生成，禁止手改，需要提交" | L55 | 生成物 | 强制 | [可泛化]※ |
| P13 | `src/routeTree.gen.ts` 已排除在格式化与 lint 之外，配置落在 `vite.config.ts` | "`src/routeTree.gen.ts` 已按要求排除在格式化与 lint 之外，相关配置在 `vite.config.ts`。" | L65 | 生成物/工具配置 | 强制 | [可泛化]※ |
| P14 | **相信类型**：类型系统已保证的情况不写运行时防御；不做多余空值兜底、不重复校验参数、不用 try/catch 吞异常 | "相信类型：类型系统已经保证的情况不再写运行时防御代码，不做多余的空值兜底、不重复校验参数、不用 try/catch 吞掉异常。" | L69 | 编码风格 | 强制 | [可泛化]★★ |
| P15 | 不为一次性逻辑提取全局工具函数；仅当被 ≥2 个模块复用且语义稳定时才提取 | "不为一次性逻辑提取全局工具函数，只有被两个以上模块复用且语义稳定的才提取。" | L70 | 编码风格 | 强制 | [可泛化]★★ |
| P16 | 不写多余的显式类型标注或泛型参数，交给 TypeScript 推断 | "不写多余的显式类型标注或泛型参数，让 TypeScript 自己推断。" | L71 | 编码风格 | 强制 | [可泛化]★★ |
| P17 | 第三方边界（如 pro-components 回调）允许必要类型收窄，但不得用 `as` 掩盖真实类型错误 | "第三方边界（如 pro-components 的回调）允许做必要的类型收窄，但不要用 `as` 掩盖真实的类型错误。" | L72 | 类型安全 | 强制 | [可泛化]★★ |
| P18 | 改动完成后必须跑 `vp check`（格式化 + lint + 类型检查） | "`vp check`：格式化 + lint + 类型检查，改完必跑。" | L76 | 验证 | 强制（必跑） | [可泛化]※ |
| P19 | 单元测试通过 `vp test` 执行 | "`vp test`：单元测试。" | L77 | 验证 | 强制（存在则用） | [可泛化]※ |
| P20 | 产物构建用 `vp build`，本地开发用 `vp dev` | "`vp build`：产物构建；`vp dev`：本地开发。" | L78 | 工具链 | 说明 | [项目专属] |

※ 泛化条件说明：
- **V3/V5/V6/V7/V8/P18/P19**：约束语义可脱离 Vite+ 存在（先查项目自定义入口 → 再执行；拉取后先装依赖；改完必跑格式/lint/类型/测试；异常先跑诊断并附输出），但动词必须换成目标项目的工具链入口（此处为 `vp`/`vp run`/`vp install`/`vp env doctor`）。
- **P8**：目录→职责映射是项目专属；可泛化形式为「先读项目既有分层，新文件放入约定目录，不新造平行目录」。
- **P9**：`@/` 依赖 `tsconfig.json` paths 配置；可泛化形式为「跨目录用配置的路径别名、同目录用相对路径，两者不混用」。
- **P11**：文件式路由专属；可泛化形式为「派生文件由生成器产出，不手工维护其内部内容（含其中的路径/ID 字符串）」。
- **P12/P13**：可泛化形式见 §6。

**去重提醒（融合时须处理）**：V6 与 P18/P19 覆盖同一约束（改完跑 check/test），V5–V8 与 P18–P20 的「验证」段落语义高度重叠。同一约束出现两份会稀释权重，建议合并为一条并保留具体命令。

## 3 Vite+ 注入区块分析

- **谁写的**：`vite-plus` CLI。模板实体是 npm 包自带的 `vite-plus/AGENTS.md`（`agent.ts:237` 以 `pkgRoot` 拼接读取），由 `vp config` / `vp create` / `vp migrate` 写入目标文件（`agent.ts:12-67` 支持 6 个目标：`AGENTS.md`、`CLAUDE.md`、`GEMINI.md`、`.github/copilot-instructions.md`、`.cursor/rules/viteplus.mdc`、`.aiassistant/rules/viteplus.md`；本项目只存在 `AGENTS.md`）。
- **更新机制**：`package.json:10` 的 `"prepare": "vp config"` 使其在每次安装时自动执行；`updateExistingAgentInstructions()`（`agent.ts:231` 定义，`:225-250` 区间）静默比对并在内容过期时重写标记区间。**永不创建新的 agent 文件**（no markers → no writes；RFC `config-and-staged-commands.md:106`），且幂等（同 RFC 第 5 条 "Safe to run multiple times"）。本项目 `.vite-hooks/` 目录与 `core.hooksPath=.vite-hooks/_` 是该钩子确实执行过的物证。
- **为何用 START/END 包裹**：让「机器可管理区间」与「人类内容不可侵犯」同时成立——标记给出精确边界，使 (a) 刷新只替换区间内部（模板 md5 一致 ⇒ 正是包内原文），(b) 标记外人工内容永不被覆盖（快照测试 `command-config-update-agents/snap.txt` 验证 "verify user content preserved"），(c) 可判定文件是否已被 Vite+ 接管，从而避免误写仅含人工规则的文件。本项目 `git diff HEAD -- AGENTS.md` 显示人工段落追加在 END **之后**、注入区间零改动 ⇒ 该项目遵循了这一边界。
- **对融合任务的意义**：该区块内容**与 `vite-plus` 版本绑定**（当前 0.3.3），升级依赖后 `prepare` 会把它整体刷新为新版文案。因此：① 不要把它当作稳定规则搬进通用 AGENTS.md，② 更不要在标记区间内追加人工规则（下一次 `vp config` 会覆盖），③ 引用时应标注「机器生成、随包版本变化」。

## 4 「规则 ↔ 现实」抽查表

| # | 被抽查规则 | 证据（只读） | 结论 |
| --- | --- | --- | --- |
| 1 | P6 只声明与默认值不同的配置 | `src/layouts/settings.ts:11-15` 仅声明 3 键：`title:"储能在线"`、`layout:"mix"`、`fixedHeader:true`。独立核对库内置默认值：`node_modules/.pnpm/@ant-design+pro-components@3.1.14-7_*/node_modules/@ant-design/pro-components/es/layout/defaultSettings.js` = `{navTheme:'light', layout:'side', contentWidth:'Fluid', fixedHeader:false, fixSiderbar:true, iconfontUrl:'', colorPrimary:'#1677FF', splitMenus:false}`。⇒ `title` 无默认值、`layout:"mix"≠'side'`、`fixedHeader:true≠false`，三项全部「非默认」；文件 L6-9 注释列出的默认值清单与该文件逐项吻合（仅漏列 `iconfontUrl`） | **一致** |
| 2 | P5（用 `tanstackRouter` 而非已废弃名）+ P13（生成物排除 fmt/lint） | `vite.config.ts:16` `plugins: [tanstackRouter({ autoCodeSplitting: true }), react()]`；`:26` `fmt.ignorePatterns: ["src/routeTree.gen.ts"]`；`:29` `lint.ignorePatterns: ["src/routeTree.gen.ts"]`。弃用名仍存在但确已标注：`node_modules/@tanstack/router-plugin/dist/esm/vite.js:46` `* @deprecated Use `tanstackRouter` instead.`、`:48` `var TanStackRouterVite = tanstackRouter;`。`fmt`/`lint` 是真实配置键：`vite-plus/dist/define-config-DPNEJxPz.d.ts:177-178`、`vite-plus/docs/config/fmt.md:12`、`vite-plus/docs/config/lint.md:12` | **一致** |
| 3 | P8 目录分层 | `find src -type f`：`main.tsx`、`router.tsx`、`routeTree.gen.ts`、`routes/{__root,_app,_app/*}`、`layouts/{settings.ts,menu.tsx,app-layout.tsx}`、`stores/{layout,user}.ts`、`modules/{sso,admin}.ts`、`vite-env.d.ts` —— 与 L51-60 分层图逐项对应；且**不存在 `src/pages/`**（同时支持 P10） | **一致** |
| 4 | P7 re-export 只声明上游包 | `package.json` 依赖仅 `@tanstack/react-store@0.11.1`，无 `@tanstack/store`；`@tanstack/react-store/src/index.ts:1` = `export * from '@tanstack/store'`，其 `package.json` 把 `@tanstack/store` 列为自身 dependency ⇒ 规则描述与包现状完全相符 | **一致** |
| 5 | P3 写用 `setState`、读用 `useSelector` | `src/layouts/app-layout.tsx:20-21`（`useSelector(layoutStore)`、`useSelector(userStore)`）、`:43`（`layoutStore.setState(...)`）、`src/stores/user.ts:24`（`userStore.setState(...)`）；全仓检索 `useStore` 无独立命中 | **一致** |
| 6 | P9 `@/` 跨目录 / 相对路径同目录 | 跨目录：`src/stores/layout.ts:3`、`src/stores/user.ts:3`、`src/routes/_app.tsx:3-4` 均用 `@/…`；同目录：`src/router.tsx:5` `./routeTree.gen`、`src/layouts/app-layout.tsx:11` `./menu`。配置：`tsconfig.json:24` `"@/*": ["./src/*"]`、`vite.config.ts:19` `tsconfigPaths: true` | **一致** |
| 7 | P11「不要手写 `createFileRoute` 的路径字符串」 | 6 个路由文件均含字面量路径字符串，如 `src/routes/_app/examples/form.tsx:5` `createFileRoute("/_app/examples/form")`；但每处都与文件路径严格 1:1 对应，且 `src/routeTree.gen.ts:1-8` 保留生成头、无手改痕迹 | **部分一致（措辞张力）** |
| 8 | P12「`routeTree.gen.ts` 需要提交」 | `git ls-files src/routeTree.gen.ts` 无输出（未跟踪）；但 `git check-ignore -v src/routeTree.gen.ts` 亦无输出（未被 `.gitignore` 忽略），且 `git status --short` 显示 `?? src/routes/`、`?? src/stores/`、`?? src/layouts/` 等整个重构均未提交 ⇒ 属「工作树未提交」，非违反规则 | **无法验证（尚未提交）** |
| 9 | P14 不吞异常 + P17 不用 `as` | `src`（排除 `routeTree.gen.ts`）内 `as X`/`as any`/`as unknown` 零命中；`try {`/`catch` 仅 1 处：`src/stores/user.ts:26` `.catch(() => {})`，其 JSDoc（L19-22）明示「获取失败不阻塞页面渲染，令牌失效由 HCRefreshToken 负责跳转」⇒ 有意降级设计，非无差别吞异常 | **一致（1 处需人工判读）** |
| 10 | P7「不引入未被使用的依赖」 | `package.json` 全部依赖均可在 `src`/配置中找到使用点：`@ant-design/icons`→`src/layouts/menu.tsx:6`、`src/layouts/app-layout.tsx:1`；`@tanstack/react-router-devtools`→`src/routes/__root.tsx:1,12`；`vite-proxy-from-env`→`vite.config.ts:3,13`；`@neucloud/admin-service`→`src/stores/user.ts:1` | **一致** |

结论：规则与现实的吻合度高（8 项一致 / 1 项部分一致 / 1 项无法验证）；「部分一致」集中在 P11 的表述可验证性上，「无法验证」是工作树未提交所致，二者都不构成对规则本身的否定。

## 5 补强建议（该文件未覆盖、同类项目通常需要代理遵守；≤8）

1. **提交钩子会自动改写工作区**：`.vite-hooks/pre-commit` 内容为 `vp staged`，对应 `vite.config.ts:21-23` `staged: { "*": "vp check --fix" }` ⇒ `git commit` 会触发自动格式化/`--fix`。AGENTS.md 未说明，代理可能把钩子改动的文件误判为并发写入，或在未提交状态下盲目 `git add -A`。
2. **依赖版本经 pnpm catalog/overrides 重定向**：`pnpm-workspace.yaml` 定义 `vite: npm:@voidzero-dev/vite-plus-core@0.3.3`、`vite-plus: 0.3.3`，并 `overrides.vite@*` 强制；`package.json` 写 `"vite": "catalog:"`。即项目里的 `vite` 实际由 Vite+ 提供 —— 新增/升级依赖应改 catalog，不得内联版本号或直接安装 `vite`。
3. **哪些命令会写盘需要显式声明**：`vp install` 写 `node_modules`、`vp check --fix`（含 staged 钩子）写源文件、`vp build` 写 `dist`。V6/P18 要求「必跑」，但未界定「代理在只读审查模式下不得运行」的边界 —— 与本次任务的「源项目只读」约束直接相关。
4. **密钥与本地配置边界**：仓库根存在 `.env`（含 `DEV_PROXY`）、`.npmrc`（均未入库）。应明确：不得读取/回显/提交其内容，新增环境变量须同时更新 `.env` 示例，禁止把密钥内联进源码。
5. **验证的失败判据缺失**：P18/P19 要求跑 `vp check`/`vp test`，但 `src` 下当前**无任何 `*.test.*`/`*.spec.*`**；AGENTS.md 未说明「无测试时应如何」，代理可能臆造测试或误报通过。建议补「测试缺失时至少跑 check + build，并在交付说明中标注未覆盖」。
6. **语言与提交信息约定未覆盖**：现状为代码/标识符英文、注释与文档中文（`src/layouts/settings.ts`、`src/stores/user.ts`、`vite.config.ts` 均为中文注释）。跨会话代理极易混用语言，应显式规定。
7. **禁止代理新增/修改的路径清单未覆盖**：除 `routeTree.gen.ts` 外，`dist/`、`.tanstack/`、`.vite-hooks/_/`（`_/pre-commit` 为 `#!/usr/bin/env sh` 生成桩）、`src/assets/`（已被删除的模板资源）等均属工具或历史产物；`pnpm-lock.yaml` 的更新时机也未规定。
8. **破坏性/全局命令未列入禁区**：`vp implode`、`vp config --hooks-only`、`vp upgrade-project`、`vp migrate`（可能重写 AGENTS.md 标记区间与工具配置）都应要求先确认；当前 AGENTS.md 只给出正向清单。

## 6 可提炼进通用 AGENTS.md 的候选（≤8，带优先级）

| 优先级 | 候选规则 | 来源 | 泛化要点 |
| --- | --- | --- | --- |
| P0 | **相信类型**：类型系统已保证的情况不写运行时防御；不做多余空值兜底、不重复校验参数、不用 try/catch 吞异常 | P14（L69） | 直接可用；例外仅限外部输入（如 `localStorage` token）与第三方边界 |
| P0 | **只声明与默认值不同的配置**：写配置前先确认该项是否必需、工具默认值是否够用 | P6（L46） | 需配一条可验证动作：先查库的 `defaultSettings`/文档默认值再落笔 |
| P1 | **不过度抽象**：一次性逻辑不提取全局工具函数；≥2 处复用且语义稳定才提取 | P15（L70） | 与「页面组件就近放置、不预建 `pages/` 层」同源，可合并为一条「就近优先」 |
| P1 | **类型标注最小化 + 不许用 `as` 掩盖错误**：不写多余显式类型/泛型参数，交给推断；第三方边界可收窄但禁用 `as` 逃逸 | P16+P17（L71–72） | 合并后更紧凑；`as` 禁令需保留「允许必要收窄」的例外 |
| P1 | **依赖卫生**：不引入未使用依赖与配置块；上游已完整 re-export 时只声明上游、从同一入口导入；新增依赖前先做成熟度尽调并优先复用既有生态 | P7+P4（L47、L44） | 两条同源（都指向「最小依赖」），合并为一条三段式规则 |
| P2 | **生成物纪律**：生成文件禁止手改、由生成器重新生成、在 fmt/lint 中显式排除、并明确「是否入库」策略 | P12+P13+P11（L55、L65、L64） | 把项目专属的 `routeTree.gen.ts` 换为「本项目的生成物清单」占位 |
| P2 | **改动后必须跑项目自定义的验证入口**，且以项目配置为准（同名内置命令与脚本可能语义不同，需显式区分） | V6+V7+P18（L23–24、L76）+ V3（L11） | 需替换命令名；核心是「先读项目定义、再执行、不套用通用命令」 |
| P2 | **依赖/API 以官方最新文档为准，不照抄旧教程**：识别已废弃 API 并迁移（示例：`TanStackRouterVite`→`tanstackRouter`） | P5（L45） | 通用性强、成本低；建议保留一个具体示例以增强可执行性 |

## 7 不确定项与方法说明

- **未执行任何 `vp` 命令**：`vp check`/`vp test`/`vp build` 都可能写盘（缓存、`dist/`、`--fix` 改源文件），与「源项目只读」硬约束冲突，故有意不跑。因此 P18/P19 只验证了「规则存在 + 配置项真实」，**未验证当前代码能否通过 check/test** —— 该结论标记为「无法验证」。
- **注入来源的证据强度**：证据链为「标记常量（`agent.ts:77-78`）+ 包内模板 md5 一致 + `prepare` 钩子 + RFC 设计说明 + 快照测试 + `git diff` 显示 END 后追加」。未观察到一次真实的 `vp config` 运行日志；`.vite-hooks/` 与 `core.hooksPath` 只能证明该命令曾在本项目执行过，**无法证明最近一次刷新的时间点**。结论「工具自动注入」置信度高，但「注入时间线」不确定。
- **P11 的措辞张力**：AGENTS.md 说「不要手写 `createFileRoute` 的路径字符串」，实测 6 个路由文件都含有字面量路径字符串（与文件路径严格一致）。合理推断其本意为「路径由文件位置决定、不得臆造，且不得手工维护 `routeTree.gen.ts`」，但未找到更明确的说明（项目 `docs/` 仅有 `portal-embed-bridge.md`）。**建议融合时改写为可验证表述**：「路由路径由文件位置决定，路径字符串须与文件路径严格一致；`routeTree.gen.ts` 不得手改」。
- **P12「需要提交」的判定**：`git status` 显示整个重构（`src/routes/`、`src/stores/`、`src/layouts/` 等）均未提交，属工作树中间态，因此无法据当前 git 状态确认该规则被遵守或违反。
- **未做的事**：未做网络检索；未核验 antd 6 / Pro Components 3 / TanStack 各包的版本兼容矩阵（超出规则提取范围）；未审计 `docs/portal-embed-bridge.md` 与 `src/modules/*` 的业务语义。
- **方法**：全部结论来自只读命令（`read`、`cat`、`ls`、`find`、`grep`、`git status|diff|ls-files|check-ignore`、`md5sum`、`diff`）。本次仅写入 `findings/04-experience.md` 一个文件，源项目零改动。

**更正记录（Lead 复核，依据 `findings/99-verification.md`）**
- 项目 `package.json` 的 `"prepare": "vp config"` 实际位于 **第 10 行**（原写作 `:9`）；已在 §0 证据表与 §3 两处更正。
- vite-plus 的注入函数实名为 **`updateExistingAgentInstructions`**（`packages/cli/src/utils/agent.ts:231` 定义，`:225-250` 区间），原写作 `updateAgentInstructions`；已更正。
