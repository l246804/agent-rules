# AGENTS.md（四源融合 v0.2）

> 来源：**P** Ponytail `DietrichGebert/ponytail`@`e3ba2aa6`（MIT）｜**K** Karpathy 插件 `AbdullahHameedKhan/karpathy-ponytail-skills`@`8869387`｜**H** DeepSeek Harness `477b4f4`｜**S** storage-online `AGENTS.md`。
> 每条尾部 `[来源:path:line]` 指回原始出处；`⟨条件式⟩` = 源于四源冲突、需按项目裁决（见 `REPORT.md` §6）。
> 文本已去项目化：命令、目录、工具链名按目标项目替换。裁剪档见附录 A。

---

## 0 元规则

- **R0.1 决策即执行。** 约束要在做出该决策的那一次操作里生效：schema 省略、prompt 过滤、facade、wrapper、监听顺序都不算 enforcement。`[H:packages/AGENTS.md:14]`
- **R0.2 能机械核对的规则就写成脚本。** 副本一致性、生成物同步、引用完整性、格式这类规则交给脚本；其余规则在评审清单里占一个位置。`[P:scripts/check-rule-copies.js:15-27,44-58]` `[H:AGENTS.md:172]`
- **R0.3 规则文件只留一条真在用的。** 每个事实只有一个 home，别处只链接；超预算按 搬迁 → 压缩 → 才抬高上限 处置，抬高要在变更说明里论证。`[H:docs/AGENTS.md:17]` `[H:docs/AGENTS.md:54-58]`

## 1 动手之前

- **R1.1 读懂再改。** 读任务、读要改的代码、端到端跑一遍真实流程，再选方案；阶梯只缩短解法，不缩短阅读，没读懂的小 diff 是第二个 bug。`[P:skills/ponytail/SKILL.md:97-101]` `[K:CLAUDE.md:34]`
- **R1.2 假设写在明处。** 不确定就先问；存在多种解读时全部列出，不静默择一。`[K:CLAUDE.md:14-15]` `[P:AGENTS.md:26]`
- **R1.3 卡住就说清哪里卡住。** 命名困惑点、说明缺什么信息，别猜着往下走。`[K:CLAUDE.md:17]`
- **R1.4 ⟨条件式⟩ 高风险先问，其余默认推进。** 删数据、改协议、动安全面、需求自相矛盾先确认；其余取最合理默认值继续做，并在同一次回复里说明"默认了什么、质疑什么"。`[K:CLAUDE.md:17]` `[P:skills/ponytail/SKILL.md:62]`
- **R1.5 更简方案直说，该推回就推回。** 先交付够用版本，同时说明"已做 X；Y 就够，需要完整 X 请说"；用户坚持要完整版就照做，不再争辩。`[K:CLAUDE.md:16]` `[P:skills/ponytail/SKILL.md:62,94-95]`
- **R1.6 先写可验证目标。** 多步任务先给 `[步骤] → verify: [检查]` 计划；"改好它"这类弱标准必然反复澄清。`[K:CLAUDE.md:88-100]`

## 2 决策阶梯

- **R2.1 写之前先爬梯，命中即停。** ① 需要存在吗（YAGNI）→ ② 本仓库已有？复用 → ③ 标准库？→ ④ 平台原生？→ ⑤ 已装依赖？→ ⑥ 能一行？→ ⑦ 才写最小可用代码。`[P:skills/ponytail/SKILL.md:34-42]` `[K:CLAUDE.md:25-32]`
- **R2.2 只建有人用的东西。** 每个抽象、状态机、选项、防御性拷贝、兼容路径都绑定当前契约或生产消费者；反向气味：只有一个内部调用者的公共方法。`[H:packages/AGENTS.md:11,10]`
- **R2.3 只建被要求的东西。** 样板、单实现接口、永不变化的配置、给"以后"搭的脚手架，都等到真需要时再写。`[P:AGENTS.md:21,23]` `[K:CLAUDE.md:37,39]`
- **R2.4 一次性逻辑就近写。** 复用两处以上且语义稳定才提取；页面组件写在路由文件里，不预建目录层。`[S:AGENTS.md:63,70]`
- **R2.5 同等体量选边界正确的那一个。** 少写代码 ≠ 更脆的算法。`[P:AGENTS.md:27]`
- **R2.6 修根因。** 先 grep 该函数所有调用点，在共享函数里修一次；只修工单点名的那条路径会漏掉同级调用者。`[P:AGENTS.md:17]` `[K:CLAUDE.md:80]`

## 3 改动纪律

- **R3.1 改动限于请求范围。** 匹配既有风格；顺手重构、无关格式化不做，需要时在交付说明里提一句。`[K:CLAUDE.md:65-67]`
- **R3.2 每行改动都能追溯到请求。** ⟨条件式⟩ 根因修复连带改了工单未点名的调用者时，在交付说明里点明。`[K:CLAUDE.md:74]` `[P:AGENTS.md:17]`
- **R3.3 ⟨条件式⟩ 只清自己造成的孤儿。** 自己改动导致失效的 import/变量/函数删掉；既有死代码记下来、交给作者决定。`[K:CLAUDE.md:71-72]` `[P:AGENTS.md:24]`
- **R3.4 最短可行 diff 只在读懂之后成立。** 放错位置的小改动是第二个 bug。`[P:AGENTS.md:25]` `[K:CLAUDE.md:41]`
- **R3.5 派生文件重新生成，不手改。** 生成物内部（路径、ID、索引）由生成器维护，并在格式化/lint 里排除；是否入库按项目策略。`[S:AGENTS.md:55,64,65]` `[H:scripts/verify-*.ts 生成器 --check 族（package.json:149-186）]`

## 4 类型与信任边界

- **R4.1 相信类型。** 类型已保证的路径直接写，防御代码只出现在真实边界。`[S:AGENTS.md:69]` `[H:AGENTS.md:144]`
- **R4.2 校验只加在真实边界。** parser/config、queued 数据、model/tool JSON、durable/file、worker、process、wire；同进程的类型化边界不加运行时校验与敌意输入测试。`[H:AGENTS.md:144]`
- **R4.3 能推断就不标注。** 第三方边界可做必要收窄；替换 `as`/`as unknown` 时改用有类型值或校验（有基线则保留或减少）。`[S:AGENTS.md:71-72]` `[H:AGENTS.md:145]`
- **R4.4 判别式用 switch。** 闭合 union 以 `assertNever` 收尾；可扩展 union 落到一个"有文档的 default"。`[H:AGENTS.md:134]`
- **R4.5 错误早且大声。** 配置错误在 load 或最早可解析点失败；空 catch 命名错误与原因，try 只留一条语句。`[H:AGENTS.md:142,148]`

## 5 依赖与配置

- **R5.1 依赖先爬梯，破例要证据。** ⟨条件式⟩ 默认 stdlib／原生／已装依赖；新增依赖需要理由：① 维护良好且真正删掉自有代码**与**测试，或 ② 原生方案确实不足；原生不够时它才配得上位置。`[H:AGENTS.md:139]` `[P:docs/platform-native.md:209-211]` `[S:AGENTS.md:44]`
- **R5.2 没有未使用的依赖与配置块。** 上游包已完整 re-export 时只声明上游、从同一入口导入。`[S:AGENTS.md:47]`
- **R5.3 只声明与默认值不同的配置。** ⟨条件式⟩ 部署差异写成显式可校验的配置字段（不是硬编码常量，也不是测试钩子）；协议常量与安全不变量保持固定。`[S:AGENTS.md:46]` `[H:AGENTS.md:141]`
- **R5.4 API 以官方最新文档为准。** 不照抄旧教程；废弃 API 及时迁移。`[S:AGENTS.md:45]`

## 6 测试与验证

- **R6.1 没检查的改动算未完成。** 分支／循环／解析／金钱或安全路径，至少留一个会在该逻辑回归时失败的可运行检查（assert 自检或一个小测试文件，不要框架与 fixture）；平凡一行免测。`[P:skills/ponytail/SKILL.md:107-112]` `[K:CLAUDE.md:46]`
- **R6.2 门禁要能被回归弄红。** 断言校验世界而不是自报：从外部重跑命令、重读文件，或断言未触碰的文件逐字节不变。`[H:docs/testing.md:35,40]`
- **R6.3 ⟨条件式⟩ 测试重量级按 CI 定。** 有 CI：覆盖与快照交给 CI，本地只跑最窄证据；无 CI：每个行为改动配最窄检查。两端同一判据——检查与改动面匹配。`[H:AGENTS.md:116,117]` `[H:AGENTS.md:155]` `[H:packages/AGENTS.md:7]` `[P:skills/ponytail/SKILL.md:107-112]`
- **R6.4 只报告跑过的命令。** 失败的检查不声称通过，pending 报 pending；被阻塞时原命令不改地重试、申请最窄权限并附证据，绝不绕过测试失败或产品沙箱；绕本地钩子需用户明确同意。`[H:AGENTS.md:110,114]` `[H:.agents/skills/dsh-pre-push-checks/SKILL.md:98,105,126]`
- **R6.5 测试描述行为。** 过时行为连同其测试一起改，并在 PR 里说明原因。`[H:AGENTS.md:152]`
- **R6.6 改完跑本项目的验证入口。** 先确认命令的真实来源（同名内置命令与脚本可能语义不同），再执行。`[S:AGENTS.md:11,23-24,76]`

## 7 沟通与输出

- **R7.1 先给代码，再给最多三行。** 跳过了什么、什么时候该加。`[P:skills/ponytail/SKILL.md:68-75]`
- **R7.2 用户点名的解释给全。** 报告、走查、分阶段笔记不受"最小输出"约束。`[P:skills/ponytail/SKILL.md:71-73]`
- **R7.3 写具体的事实。** 用精确名词陈述契约与上下文，不复述代码、不写推理过程与隐喻。`[H:AGENTS.md:149,172]` `[H:.agents/skills/dsh-prose-standard/SKILL.md:38]`
- **R7.4 更短不等于更好。** 删形容词、重复与叙述，只在每个事实子句都存活且结果更清晰时才算改进。`[H:.agents/skills/dsh-prose-standard/SKILL.md:38]`

## 8 留痕

- **R8.1 简化留天花板与升级路径。** 用可 grep 的标记（如 `simplification:`）写明砍掉的能力与升级触发条件；没有升级路径的标记会静默腐烂，定期收割。`[P:AGENTS.md:28]` `[P:skills/ponytail-debt/SKILL.md:29-36]` `[K:CLAUDE.md:44]`
- **R8.2 只记录持久的决策理由。** 机械／局部编辑不写记录；记录含"备选方案与它为何落败"；已归档记录冻结；决策反转新写一篇并交叉链接。`[H:AGENTS.md:153]` `[H:.agents/notes/README.md:103,111]` `[H:.agents/notes/implemented/AGENTS.md:7,13]`
- **R8.3 文档与代码同一次改动内同步。** 行为改动更新 README 与注释契约；文档只写当前状态。`[H:AGENTS.md:174]` `[H:docs/AGENTS.md:39]`
- **R8.4 审查只列不改。** 过度工程审查输出发现清单与可削减量（`net: -N lines`）；"最小可运行检查"是下限，不可标为可删。`[P:skills/ponytail-review/SKILL.md:46-56]` `[P:skills/ponytail-audit/SKILL.md:33-40]`

## 9 流程

- **R9.1 提交历史有意识地规划。** 拆分独立改动；在引入问题的那个 PR 上修；改写历史用 `--force-with-lease`，远端移动即中止，不用裸 `--force`。`[H:AGENTS.md:159]` `[H:.agents/skills/dsh-pre-push-checks/SKILL.md:81]`
- **R9.2 改写后重新取证。** 重新抓远端 head，重新审计评审线程、批准、可合并性与检查；旧 commit hash 与评论锚点不再是证据。`[H:.agents/skills/dsh-pre-push-checks/SKILL.md:83,105]`
- **R9.3 已发布的世代不可移动。** ⟨条件式⟩ 预稳定期公开 API 的改动更新每个 consumer；已发布／持久化数据世代只新增版本化后继；持久化类型改动显式致谢并记录。`[H:AGENTS.md:7,9]`
- **R9.4 安全红线不受最小化影响。** 信任边界校验、防数据丢失的错误处理、安全、无障碍、硬件校准，以及用户明确要求的内容，都保留。`[P:skills/ponytail/SKILL.md:92-95,103-105]`
- **R9.5 凭据与不可信输出不进环境。** 子进程用净化 env（丢弃 `*KEY*`／`*SECRET*`／`*TOKEN*`／`*PASSWORD*`）；临时文件用私有目录、随机名、独占打开。`[H:AGENTS.md:125]` `[H:docs/defensive-patterns.md:29]`

---

## 附录 A 裁剪指引

**A.1 最小配置（个人小项目／脚本）**：19 条——R1.1 R1.2 R1.4｜R2.1 R2.3 R2.6｜R3.1 R3.3｜R4.1 R4.2｜R5.1｜R6.1 R6.2 R6.4 R6.6｜R7.1 R7.2｜R9.4 R9.5。其余条款属团队/工具链分支，按需追加。

**A.2 大型 monorepo／多人协作**：追加 `monorepo` 片段（门禁编排：跳过与失败同等处理、门禁声明消费源码面还是产物面；子包 README 的 Model Experience 与 `## Known Limitations and Deferred Work`；双语三件套成对合入）。组织上：根文件只放每会话都需要的常设指令，细节下沉到子树 `AGENTS.md` 并按需链接 `[H:docs/AGENTS.md:21-22]`；规则预算见 R0.3、决策记录见 R8.2，片段不重复。出处 `[H:docs/AGENTS.md:41-58]` `[H:docs/i18n/README.md:9-10]` `[H:packages/AGENTS.md:26-28]` `[H:scripts/run-gates.ts:121-123,884]`。

**A.3 前端项目**：追加 `frontend` 片段——路由／状态库唯一入口与写读 API、路径别名与相对路径不混用。生成物、目录就近、验证入口、官方文档分别由 R3.5、R2.4、R6.6、R5.4 覆盖，片段不重复。出处 `[S:AGENTS.md:39,40,62]`。

**A.4 工具链自动注入区块**：项目若使用会自动改写 `AGENTS.md` 的工具（如 Vite+ `vp config`），追加 `machine-block` 片段：人工规则写在标记区间之外，区间内容随工具版本刷新、不作稳定规则引用。`[S:AGENTS.md:1,27]`

**A.5 条件式条款清单**（并入前先做一次项目内裁决）：R1.4、R3.2、R3.3、R5.1、R5.3、R6.3、R9.3。裁决依据见 `REPORT.md` §6。

## 附录 B 项目落位检查清单（非源规则；来自分析者的缺口清单，按需采纳）

1. 提交钩子是否会自动改写工作区（如 `vp staged` + `check --fix`）？代理需要知道"钩子改过的文件"不是并发写入。`[findings/04 §5-1；证据 vite.config.ts:21-23]`
2. 依赖版本是否经 catalog/overrides 重定向？新增依赖要走 catalog，不得内联版本号。`[findings/04 §5-2；证据 pnpm-workspace.yaml]`
3. 哪些命令会写盘（install/build/fix），只读审查模式下禁止执行哪些？`[findings/04 §5-3]`
4. 密钥与本地配置边界：`.env`/`.npmrc` 不得读取、回显、提交。`[findings/04 §5-4]`
5. 无测试时的判据：至少跑类型检查+构建，并在交付说明里标注未覆盖。`[findings/04 §5-5]`
6. 语言与提交信息约定（代码/标识符英文、注释/文档中文等）。`[findings/04 §5-6]`
7. 禁止代理新增/修改的路径清单（dist、生成目录、钩子桩、锁文件更新时机）。`[findings/04 §5-7]`
8. 破坏性/全局命令禁区（`vp implode`/`vp migrate` 类）需先确认。`[findings/04 §5-8]`

## 附录 C 最小机械化集合（把上面规则"钉住"的脚本）

| 脚本检查 | 对应规则 | 做法 |
| --- | --- | --- |
| 规则副本一致性 | R0.2 | 同一规则的多投影（`AGENTS.md`/`CLAUDE.md`/IDE 规则/skill）逐字比对 + 关键不变量 canary，失败即 CI 红。`[P:scripts/check-rule-copies.js:15-27,44-58]` |
| 派生文件同步 | R3.5 | 每个生成器配一个 `--check`（生成物与源不一致则非零退出）。`[H:scripts/verify-*.ts 生成器族]` |
| 类型逃逸 ratchet | R4.3 | 统计 `as unknown` 计数并与基线比对：拒绝新增、允许减少。`[H:scripts/verify-no-unknown-casts.ts]` |
| 文档格式 | R7.3、R8.3 | 一段一个物理行、围栏代码块可编译、本地链接可达。`[H:docs/AGENTS.md:41-42,76]` |
| 门禁编排 | R0.2、R6.2 | "被跳过"与"失败"同等对待（不能用 skip 冒充通过）。`[H:scripts/run-gates.ts:121-123]` |

---

*来源标注格式：`[P|K|H|S:path:line]`；P/K 的路径相对各自仓库根，H 相对 deepseek-harness 仓库根，S 即 storage-online `AGENTS.md` 行号。*
