# 03 · DeepSeek Harness 规则评审台账（A1 … C5，共 174 条）

> 契约：`review/00-schema.md`（条目五字段、推荐判据、场景词表、规范句约定、去重规则、末尾自检）。
> 出处引 `findings/03-deepseek-harness.md` 已核验的 `H:path:line`（`H:` 前缀与强制形式词表在该 findings §0 定义）；本阶段只评价，不落规则——**规则写入 `rules/` 是用户确认之后的事**。
> 结构：本文由三块任务接续写成（1/3 A1、2/3 A2、3/3 A3+B+C），头部与 `## 规范句索引` 已由 task-17 定稿为完整范围。

## 台账头部

### 1 覆盖范围与条目数

- 来源：DeepSeek Harness 快照 @ `477b4f42`（branch `master`）；findings：`findings/03-deepseek-harness.md` §2 A1 段（`:36`–`90`）、A2 段（`:94`–`182`）、A3 段（`:186`–`213`）、§3 B 段（`:223`–`289`）、§4 C 段（`:295`–`337`）。
- 覆盖：**完整（A1+A2+A3+B+C）** —— **174 条**：A1.01 … A1.55（55）＋ A2.01 … A2.78（78）＋ A3.01 … A3.28（28）＋ B1 … B8（8）＋ C1 … C5（5），与 findings 的 ID 集合一一对齐，缺漏 0、重复 0（各块末尾自检给命令与输出）。
- **三层性质不同**：A 层是给 agent 的 prose 规则（仓库纪律）、B 层是机械门禁机制、C 层是产品运行时约束。B/C 的 `是否推荐` 判的是"这套机制值不值得自建/借用"，`作用` 写清"它拦什么、在哪变红"。
- 去重范围：174 条互比（含跨块），加磁盘上两份已过来源的规范句索引 —— `review/01-ponytail.md` 的 45 条（P-02、P-04、P-06 … P-63）与 `review/02-andrej-karpathy-skills.md` 的 16 条（R3、R4、R5、R6、R7、R11、R14、R18、R20、R21、R22、R24、R25、R26、R28、R30）；语义存疑处点开对应条目确认。
- **C 层的独有贡献（头部要点）**：C1 … C5 —— 指令加载链与 1 MiB 单文件上限、沙箱分档与最窄升级审批、guard 的软提示/硬超时两级、持久化格式版本与读端拒收、可见即可重建的运行时断言 —— 在 P 与 K 两份来源里**没有任何对应物**。它们不是"教 agent 怎么干活"，而是"产品如何约束它所运行的 agent"，因此全部判 ⚠️（条件 = 你在做产品级 agent），不与已有规范句去重。
- 场景标签分布：`gates` 43、`docs` 40、`base` 36、`monorepo` 18、`frontend` 17、`agent-cfg` 10、`runtime-agent` 10（合计 174）。
- 规范句：见文末 `## 规范句索引（本文件产生）`，共 **147** 条（= 推荐 162 条 − 15 条"即推荐又同义并入"）。

### 2 计数摘要

| 判定 | A1 | A2 | A3 | B | C | 合计 |
|---|--:|--:|--:|--:|--:|--:|
| ✅ 推荐 | 17 | 29 | 19 | 4 | 0 | **69** |
| ⚠️ 条件推荐 | 30 | 45 | 9 | 4 | 5 | **93** |
| ❌ 不推荐 | 8 | 4 | 0 | 0 | 0 | **12** |
| 合计 | 55 | 78 | 28 | 8 | 5 | **174** |

重复分布（全文件）：**无重复 82 / 同义 21 / 包含或张力 71**。规范句索引：**147** 条。

### 3 最值得收的条目（≤8，覆盖全 174 条）

1. **A1.31** 边界校验、内部免检 —— P 侧只有"信任边界要校验"（P-32），缺这一半；它同时是"反对无脑防御性编程"的唯一对冲。
2. **A1.23 + C5** 可见即可重建 —— agent 产品最硬的不变量，且 C5 给出它的运行时断言实现（请求冻结、日志事件齐备、与日志派生结果逐字一致）。P/K 完全没有"日志/可重建性"这一维。
3. **A1.11 + A1.12 + A3.02 + A3.05** 证据族 —— 选对证据类型、不跑全量、配一条会因该回归失败的窄检查、且不许用放水把门禁变绿。P/K 只说"要验证"。
4. **A2.10** 约束落在执行者身上 —— 上游过滤、包装与顺序都不算执法，必须测出真正的执行者会拒绝；这是安全条款能否成立的关键。
5. **A2.03 + A2.60** 真实装配 + 真实入口 —— 把"集成测试"从形容词变成两条可判动作。
6. **C2** 沙箱最窄升级 —— 严格更宽阶梯 + 必须给理由 + 只对当次生效 + 无通道即失败关闭；它是"权限分档"这件事上最完整的一套可借用设计。
7. **B2** 派生物生成器 + 只读校验 —— 用一条 `--check` 消灭"源改了但派生物没重生成"，是性价比最高的机械门禁。
8. **A1.29 + A2.64** 失败方向一致 —— 配置错误最早大声失败，关键能力缺失时宁可不可用也不放宽；两条合起来定死了"往哪边失败"。

### 4 需要用户裁决的条目（覆盖全 174 条，已合并三块的清单）

1. **A1.26 依赖与自研的默认值**（↔ P-14、P-16）：P 侧默认"几行代码能做的功能不新增依赖、只做刚好够用的最小版本"，本条默认"能净删掉自有代码与测试就用成熟依赖"。两难在**长期维护成本 vs 当下引入面**（"净删除"是否必须做硬门槛）。
2. **A1.02 接口变更的改动范围**（↔ K R18、R24）：本条要求接口变更时同一次改动内更新全部消费者，K 要求每一行改动都能追溯到请求、相邻代码不动。两难在**完整性 vs 手术式范围**（"消费者更新"算不算请求内）。
3. **A1.54 单一真源 vs P-52 逐字副本**：本条要求多入口名只留链接；P-52 允许复制但要求逐字一致。两难在**可用链接 vs 平台限制**（某些宿主不跟随链接）。
4. **留痕体系是否合成一章**（A1.03、A1.40、A2.53 ↔ P-40、P-41）：三种台账对象不同（持久化结构变更 / 决策理由 / 简化上限），机制同构、门槛不同。两难在**统一模板 vs 各自门槛**。
5. **A1.42 + A2.72 + A3.25 可见面证据的门槛**：可见输出要更新端到端期望（A1.42）、测试只从真实入口与出厂装配启动（A2.72/A2.60 的严格度之争）、界面改动要附真实录制（A3.25）。两难在**验收强度 vs 落地成本**，需定是"要求"还是"有设施则要求"。
6. **A1.20 + C4 读端严格 vs 兼容**：读端遇到无法识别的必需记录时拒绝加载而不是静默跳过。两难在**前向兼容 vs 静默重建出错误状态**，需产品取向裁决。
7. **A2.38 vs A1.12 秒级内环的例外**：A2.38 允许"像类型检查一样随便跑"，A1.12 禁止重复已通过的检查。两难在**成本阈值怎么定**（"低到可当类型检查用"是否足以开例外）。
8. **A2.72 vs A2.60 真实入口的严格度**：两条都要求真实入口，但 A2.60 允许"公开证据不足时"用测试驱动，A2.72 完全禁止新增入口。两难在**禁止新增 vs 条件允许**，建议取条件式。
9. **A2.03 vs P-38 / K R28 可见面测试门槛**：本条要求可见面必须有真实装配测试，P/K 只要求一条最小的可运行检查。两难在**是否所有可见面都要装配级测试**。
10. **B3 本地钩子值不值得**（↔ A3.01）：本地钩子把明显错误挡在提交前，但它可被绕过、依赖安装步骤。两难在**早失败的收益 vs 假安全感的成本**。
11. **B5 按文件满额覆盖率值不值得**：它把"未覆盖的行"当作"可疑代码"的信号，代价是逐条维护豁免清单。两难在**信号质量 vs 持续维护成本**，属团队承受力问题。
12. **C 层整体是否纳入**：C1–C5 是产品级 agent 的专属机制，放进通用规则集会显著加厚，但缺了它们，"产品如何约束 agent"这一整面就没有落点。两难在**规则集的纯度 vs 覆盖面**，需用户定这套规则集的定位。

## 条目

### A1.01 · 先读领域文档
- 原文：`H:AGENTS.md:3`「Read [docs/architecture.md](docs/architecture.md) before changing `packages/`; follow [docs/AGENTS.md](docs/AGENTS.md) for documentation.」
- 作用：把"改动某区域前先读该区域的权威说明"变成入口动作，防住凭猜测直接改。
- 是否推荐：⚠️ 条件推荐（条件：仓库维护了分领域的权威文档，并指定其为改动前必读）
- 使用场景：`base`（边界：仓库没有分域权威文档时不适用，此时退化为"读相关代码"）
- 通用化改法：改动某个领域前，先读该领域的权威说明，并按其中的约束动手。
- 重复：包含或张力（→ 裁决：P-18 覆盖"读涉及的文件与调用路径"，本条覆盖"读该领域的权威文档"；两者是不同证据源，都保留，合并阶段并成一句"改动前读齐该领域的证据源"）

### A1.02 · 预稳定接口与世代
- 原文：`H:AGENTS.md:7`「Public APIs are pre-stable; update every consumer.」…「predecessors imply neither fallback nor downgrade support」；同句要求版本标识单调（SQLite 用 `SCHEMA_VERSION`）
- 作用：接口整体可变但要一次改全消费者；对外数据只向后兼容地增改，防住"改了接口漏改调用点"与"覆盖/删除历史数据世代"。
- 是否推荐：⚠️ 条件推荐（条件：接口有仓内或仓外消费者，或项目对外发布持久化格式）
- 使用场景：`monorepo`（边界：接口只有一处消费且不对外持久化时，前半不适用）
- 通用化改法：改被多处依赖的接口时在同一次改动内更新全部使用点；对外持久化格式只增不改并保留历史世代。
- 重复：包含或张力（→ 裁决：K 的 R18 要求改动只限请求范围，本条要求接口变更时同步更新全部消费者；后者是前者的必要例外，合并阶段在 R18 下写明该例外）

### A1.03 · 持久化变更登记
- 原文：`H:AGENTS.md:9`「Acknowledge [declared persistence-type changes](docs/cookbook/reviewing-persistence-type-changes.md).」
- 作用：把"改了持久化结构"从隐性事实变成同一变更内的显式登记，防住版本间静默漂移。
- 是否推荐：⚠️ 条件推荐（条件：项目对外发布持久化结构并维护其变更记录）
- 使用场景：`docs`（边界：不维护持久化结构的项目无落点）
- 通用化改法：改动对外持久化的数据结构时，在同一变更内更新该结构的变更记录。
- 重复：无重复

### A1.04 · 单一启动入口
- 原文：`H:AGENTS.md:11`「Only `dsh` profiles launch supported Node apps; package bins, demos, and public SDK argv escapes are forbidden」
- 作用：把"产品只能从一个受支持的入口启动"写成禁令并由脚本拦住，防住绕过启动配置的旁路入口。
- 是否推荐：⚠️ 条件推荐（条件：产品对外发布可执行入口，且要求所有启动都经过同一装配路径）
- 使用场景：`base`（边界：库或不对外发布的工具不需要）
- 通用化改法：产品只保留一个受支持的启动入口，其余入口一律拒绝并由检查强制。
- 重复：无重复

### A1.05 · 清单不复述
- 原文：`H:AGENTS.md:17`「仓库布局树是缓存：包分组真值在 `H:AGENTS.md:80` 指向的 `packages/README.md`」（findings 转述）
- 作用：指出人选文档里复述机器可读清单会过期，真值只有一个地方，防住"文档与代码不一致时不知道信谁"。
- 是否推荐：⚠️ 条件推荐（条件：仓库同时维护人写文档与机器可读清单，且两者会漂移）
- 使用场景：`docs`（边界：没有机器可读清单时，文档就是真源）
- 通用化改法：机器可读的清单不在文档里人工复述；文档只给出指向真源的链接，确需复述时标注真源位置。
- 重复：无重复

### A1.06 · 命令段是缓存
- 原文：`H:AGENTS.md:85`（`## Commands` 段 `H:AGENTS.md:82`–`H:AGENTS.md:106`）「真值是 `package.json` 的 **184** 个 scripts」（findings 的实测记录）
- 作用：记录一段命令清单的覆盖率，本身不改变行为。
- 是否推荐：❌ 不推荐（理由：这是一条对某段文档的实测观察，不含可执行要求；其可提取的内核与 A1.05 完全同一含义）
- 使用场景：`docs`（边界：无）
- 通用化改法：不单列规范句；含义并入 A1.05。
- 重复：同义（→ 并入 A1.05）

### A1.07 · 门禁命令对应
- 原文：`H:AGENTS.md:88`「pnpm run test:coverage  # CI coverage gate: per-file 100% on packages/*/*/src」
- 作用：把"哪条命令是门禁"写成命令旁的注释，防住拿近似命令冒充门禁。
- 是否推荐：❌ 不推荐（理由：一条命令与用途的对照项，属环境清单复述，无法脱离具体命令验收；其内核"选对证据"已由 A1.11 承担）
- 使用场景：`docs`（边界：无）
- 通用化改法：不单列规范句；含义并入 A1.05。
- 重复：同义（→ 并入 A1.05）

### A1.08 · 平台诊断专用
- 原文：`H:AGENTS.md:98`「pnpm run check:windows-wine  # ONLY when diagnosing a known Windows failure (needs wine); CI owns this signal」
- 作用：把一条昂贵平台检查限定为"诊断已知故障时才跑"，防住日常重复跑高成本检查。
- 是否推荐：❌ 不推荐（理由：被 A1.12 完全覆盖且更弱——本条只是"穷尽覆盖交给持续集成、本地只跑该跑的"在某个平台工具上的实例）
- 使用场景：`gates`（边界：无该平台工具时不适用）
- 通用化改法：不单列规范句；含义并入 A1.12。
- 重复：同义（→ 并入 A1.12）

### A1.09 · 最小权限升级
- 原文：`H:AGENTS.md:110`「retry unchanged with the narrowest host escalation. Require sandbox evidence; never bypass test failures or the product sandbox.」
- 作用：给出"命令被环境限制挡住时怎么办"的完整协议——原样重试、取最小必要权限、先取证，且不许靠放宽限制或跳过失败绕过。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：命令没有因环境限制失败时不触发）
- 通用化改法：命令因环境限制失败时，先取证再以最小必要权限原样重试；不得靠放宽限制或跳过失败来绕过。
- 重复：包含或张力（→ 裁决：P-34 管"不因精简而省略安全处理"，本条管"权限受阻时按最小必要权限取证重试"；条件不同，两条都保留）

### A1.10 · 推前证据清单
- 原文：`H:AGENTS.md:114`「Before pushing, follow [dsh-pre-push-checks](.agents/skills/dsh-pre-push-checks/SKILL.md); report only commands run.」
- 作用：推送前按清单选最小证据，并且只报告真正跑过的命令，防住"声称验过"与"顺手跑重复检查"。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：没有推送或评审流程时退化为"交付前只报告实跑证据"）
- 通用化改法：推送前按改动面选最小证据并只报告实际运行过的检查；历史被改写后立即重新验证，验证通过前不合并。
- 重复：包含或张力（→ 裁决：P-50 管"只报可复核的计量"，本条的"只报告实际运行的命令"是它的过程版；合并阶段并成一句"只报告可复核的事实"）

### A1.11 · 证据匹配改动面
- 原文：`H:AGENTS.md:116`「Match evidence to the surface: focused behavior tests, model/user-output snapshots, `doc-sync` for docs, built smokes for published paths, and real-API e2e for providers.」
- 作用：把"验证"拆成按改动类型对应的证据类型，防住用错证据（改文档跑单测、改行为只跑类型检查）。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无既有证据类型可对应时，先造一条能失败的检查）
- 通用化改法：为每类改动选与之匹配的证据类型，并只跑能证明该改动的检查。
- 重复：包含或张力（→ 裁决：K 的 R28 与 P-38 管"检查要最小且先失败"，本条管"证据类型与被改面一一对应"；互补，两条都保留）

### A1.12 · 不跑全量
- 原文：`H:AGENTS.md:117`「Never default to the full suite or repeat a passing check for commit or push. CI owns exhaustive coverage and the platform matrix」
- 作用：禁止"反射式跑全量"与"重跑已通过的检查"，把穷尽覆盖交给持续集成，省下最贵的重复成本。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：改动横跨仓库或明确被要求演练全量时，允许跑全量）
- 通用化改法：不默认跑全量检查，也不重跑已验证过的检查；穷尽覆盖交给持续集成。
- 重复：无重复

### A1.13 · 唯一门禁命令
- 原文：`H:AGENTS.md:118`「`test:coverage`, not `test`, is the CI coverage gate」
- 作用：指名哪条命令才是门禁，防住用更弱的近似命令冒充门禁。
- 是否推荐：⚠️ 条件推荐（条件：仓库有多个相似命令，且只有一个是真正的门禁）
- 使用场景：`gates`（边界：只有一个检查命令时无需声明）
- 通用化改法：不单列规范句；含义并入 A1.11。
- 重复：同义（→ 并入 A1.11）

### A1.14 · 调试覆盖开关
- 原文：`H:AGENTS.md:119`「**Web browser automation and GIF recording:** launch with `pnpm dsh web --patch apps/web/tests/pin-browse-picker.overlay.yml`」
- 作用：给出自动化调试时要用哪个覆盖开关，以复现被测路径而非默认路径。
- 是否推荐：❌ 不推荐（理由：某产品的一条调试开关，抹掉专名后无法验收；"用能复现被测路径的配置"这层含义已被 A1.11 的证据选择覆盖）
- 使用场景：`gates`（边界：无）
- 通用化改法：不单列规范句；含义并入 A1.11。
- 重复：同义（→ 并入 A1.11）

### A1.15 · 凭据不入库
- 原文：`H:AGENTS.md:125`「Real-API tests/demos read `DEEPSEEK_API_KEY`, optional `DEEPSEEK_BASE_URL`, and root `.env`.」…「Never commit credentials.」
- 作用：凭据只从环境与会话读取，永不进仓库；并让缺凭据的检查显式跳过而不是悄悄通过。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：项目完全没有凭据需求时不触发）
- 通用化改法：凭据只从运行环境读取，永不写入仓库；缺少凭据的检查自跳过并报告跳过。
- 重复：无重复

### A1.16 · 依赖区段取值
- 原文：`H:AGENTS.md:129`「Workspace dependency sections use DSH `workspace:*`, vendor/native `workspace:~`」
- 作用：约定不同依赖类别使用不同的版本范围写法，防住发布时把仓内依赖写成不可解析的范围。
- 是否推荐：❌ 不推荐（理由：完全依赖某个包管理器的区段语义与范围语法，抹掉专名后没有可判定的通用形态）
- 使用场景：`monorepo`（边界：无）
- 通用化改法：不单列规范句（❌，无法通用化）。
- 重复：无重复

### A1.17 · 配置引用须声明
- 原文：`H:AGENTS.md:130`「Raw/Web `cordis.yml` bare plugins must appear in their resolver manifest's `dependencies`; `verify-cordis-config` enforces it.」
- 作用：配置里引用的外部件必须同时声明为依赖，防住"配置写了但加载不到"的运行时空白。
- 是否推荐：⚠️ 条件推荐（条件：项目用配置文件声明插件或扩展，并由解析器按依赖解析）
- 使用场景：`monorepo`（边界：不使用配置装配的项目不适用）
- 通用化改法：配置里引用的外部件必须在依赖清单里声明，并由检查强制。
- 重复：无重复

### A1.18 · 注册即效果
- 原文：`H:AGENTS.md:131`「**Registrations are effects**: every contribution goes through `ctx.effect()` / `ctx.on()`; a registry's `register()` returns the disposer.」
- 作用：所有注册都走框架的效果注册接口并返回注销句柄，防住热重载或销毁后残留的注册。
- 是否推荐：⚠️ 条件推荐（条件：框架提供效果/订阅注册与注销机制）
- 使用场景：`base`（边界：无生命周期管理的脚本式工具不适用）
- 通用化改法：所有注册都走框架的效果注册接口并返回注销句柄，保证可回收。
- 重复：无重复

### A1.19 · 断言必须会分歧
- 原文：`H:AGENTS.md:132`「**Runtime invariants assert owned relationships.**」…「empty installers and checks of service presence, plugin metadata, effects, or fixed examples are invalid」
- 作用：只为"独立观测可能分歧"的关系写运行时断言，防住一堆恒真、只会增加噪声的空断言。
- 是否推荐：⚠️ 条件推荐（条件：项目发布包级运行时断言或自检）
- 使用场景：`runtime-agent`（边界：不发布断言时无落点）
- 通用化改法：只对独立观测可能分歧的关系发布运行时断言，不发布空断言或存在性断言。
- 重复：无重复

### A1.20 · 未知必需即拒收
- 原文：`H:AGENTS.md:133`「builds that do not know a type refuse the log unless the event carries the envelope's `ignorable: true`; only structural format changes bump `SESSION_FORMAT_VERSION`」
- 作用：持久化流的读端默认拒收无法识别的必需记录，而不是静默跳过；并把它与版本号升降的判据绑定。
- 是否推荐：⚠️ 条件推荐（条件：项目持久化可扩展的事件流或记录，且需要跨版本读取）
- 使用场景：`runtime-agent`（边界：不持久化结构化记录时不适用）
- 通用化改法：读端遇到无法识别的必需记录时拒绝加载而不是静默跳过；只有结构性变更才提升格式版本号。
- 重复：无重复

### A1.21 · 判别标签穷举
- 原文：`H:AGENTS.md:134`「**Switch on discriminant tags.** Closed unions end in `assertNever`; merge-extensible unions fall through a documented default.」
- 作用：按判别标签分支，封闭集合以"不可达"分支收口、可扩展集合保留有文档的默认分支，防住漏分支与默认吞错。
- 是否推荐：⚠️ 条件推荐（条件：语言支持封闭取值集合或穷尽性检查）
- 使用场景：`base`（边界：动态类型、无联合类型的项目不适用）
- 通用化改法：对封闭取值集合穷举分支并以不可达分支收口；对可扩展集合保留一个有文档的默认分支。
- 重复：无重复

### A1.22 · 瀑布必须委派
- 原文：`H:AGENTS.md:135`「**Waterfall listeners MUST call `next()`** to delegate; returning without it short-circuits the chain」
- 作用：中间件必须显式委派给下一环，防住"忘了委派"造成的静默短路。
- 是否推荐：⚠️ 条件推荐（条件：项目使用责任链式中间件协议）
- 使用场景：`base`（边界：无中间件协议时不适用）
- 通用化改法：中间件必须显式委派给下一环；不委派即短路，必须是有意为之。
- 重复：无重复

### A1.23 · 可见即可重建
- 原文：`H:AGENTS.md:136`「**Model-visible ⟺ logged**: anything that reaches a model request must be reconstructable from the session log; a new model-visible input requires a session event.」
- 作用：凡进入模型请求的内容都必须能从持久化记录重建，防住"发给模型的东西事后无法复现"这一 agent 产品的核心故障。
- 是否推荐：✅ 推荐
- 使用场景：`runtime-agent`（边界：无模型调用或不持久化记录时不适用）
- 通用化改法：凡进入模型请求的内容都必须能从持久化记录重建；新增可见输入必须同时新增记录项。
- 重复：包含或张力（→ 裁决：K 的 R24 管"改动↔请求"的逐行可追溯，本条管"模型输入↔日志"的可重建；同属可追溯族，合并阶段合成一条总则加实例）

### A1.24 · 扩展点优先
- 原文：`H:AGENTS.md:137`「**Plugins, not loop changes**: new behavior goes on documented extension points; changing `agent-loop` requires updating docs/architecture.md.」
- 作用：新行为加在文档化扩展点上而不是改核心循环，确需改核心时同一次改动更新架构说明。
- 是否推荐：⚠️ 条件推荐（条件：平台提供了文档化的扩展点）
- 使用场景：`base`（边界：平台没有扩展点时必须改核心，此条退化为"改核心要同改文档"）
- 通用化改法：新行为加在文档化的扩展点上；确需改核心时在同一次改动内更新架构文档。
- 重复：无重复

### A1.25 · 能力接缝三角色
- 原文：`H:AGENTS.md:138`「**A capability seam comprises Service Definition / Service Provider / Consumer roles.** It is complete, never one role; split only when roles evolve independently」
- 作用：定义"能力接缝"由定义、实现、使用三方齐备才算完整，防住只改一半就宣布可扩展。
- 是否推荐：⚠️ 条件推荐（条件：设计跨模块的能力接口时）
- 使用场景：`base`（边界：单一实现且角色不独立演化时，不必拆成接缝）
- 通用化改法：能力接口由定义、实现、使用三方齐备才算完整；只有角色独立演化时才拆分。
- 重复：无重复

### A1.26 · 依赖优于自研
- 原文：`H:AGENTS.md:139`「**Prefer maintained dependencies over hand-rolling** when they genuinely delete owned code and tests」
- 作用：当成熟依赖能净减少自有代码与测试时优先用它，把维护成本当作核心判据。
- 是否推荐：⚠️ 条件推荐（条件：自研实现的长期维护成本高于引入依赖的成本）
- 使用场景：`monorepo`（边界：几行代码能完成的功能不引入新依赖）
- 通用化改法：成熟依赖能净减少自有代码与测试时才引入依赖，否则自己实现。
- 重复：包含或张力（→ 裁决：与 P-16 和 P-14 反向——P 侧默认"只做刚好够用的最小版本、几行代码能做的功能不新增依赖"，本条默认"净删除自有代码与测试时优先用依赖"；合并阶段必须写成条件式，把"净删除"设为硬门槛）

### A1.27 · 显式解析默认值
- 原文：`H:AGENTS.md:140`「**Explicit > implicit at package boundaries**: defaulting is an explicit `resolve(request): Spec` step in the owning implementation, never a hidden `?? default` inside `run()`」
- 作用：把默认值做成一个具名的解析步骤，而不是藏在执行路径里的隐式兜底，防住"看不出来用了什么默认"。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：取值来源唯一、无默认语义时不触发）
- 通用化改法：边界处的默认值做成显式的解析步骤，不在执行路径里藏隐式兜底。
- 重复：无重复

### A1.28 · 可调项与常数
- 原文：`H:AGENTS.md:141`「**No hardcoded tunables in plugins**: deployment-varying choices are validated `Config` fields changeable from cordis.yml; a `DEFAULT_*` constant or test hook is not configurability.」
- 作用：把"部署间会变"的取值做成经校验的配置项，同时要求协议常数、外部规格与安全不变量保持写死，防住两头都做错。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：单次运行、无部署差异的工具不触发）
- 通用化改法：部署间会变的取值做成经校验的配置项；协议常数、外部规格与安全不变量保持写死。
- 重复：无重复

### A1.29 · 配置错误早失败
- 原文：`H:AGENTS.md:142`「**Misconfiguration fails loud** at load when self-contained, otherwise at the earliest resolvable point; never silently skip a missing referent.」
- 作用：配置错误在能判定的最早时点大声失败，绝不静默跳过缺失的引用，防住最难排查的一类空白。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：无法在加载期判定的错误退化为"最早可判定处失败"）
- 通用化改法：配置错误在能判定的最早时点大声失败，绝不静默跳过缺失的引用。
- 重复：无重复

### A1.30 · 不透明标识带品牌
- 原文：`H:AGENTS.md:143`「**Opaque cross-boundary ids are branded** (`Branded<B>` from `dsh-brand`), never bare `string`.」
- 作用：跨边界的不透明标识用带品牌的类型表达，防住把两种 id 互换的错误。
- 是否推荐：⚠️ 条件推荐（条件：语言支持品牌/名义类型）
- 使用场景：`base`（边界：动态类型语言用文档或运行时校验替代）
- 通用化改法：跨边界的不透明标识用带品牌的类型表达，不用裸字符串。
- 重复：无重复

### A1.31 · 边界校验内部免检
- 原文：`H:AGENTS.md:144`「**Trust TypeScript at typed same-process boundaries.**」…「validate at parser/config, queued, model/tool JSON, durable/file, worker, process, and wire boundaries.」
- 作用：只在真正的信任边界（解析、配置、序列化、进程、连线）做运行期校验，进程内已由类型保证的取值不重复校验——既是安全线也是反过度防御的线。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：动态类型或无类型契约的项目，内部仍需运行时校验）
- 通用化改法：只在真正的信任边界做运行期校验，进程内已由类型保证的取值不重复校验。
- 重复：包含或张力（→ 裁决：P-32 管"信任边界的输入一律校验"，本条管"边界之外不重复校验"；一体两面，合并阶段并成一句"边界校验、内部免检"）

### A1.32 · 未知断言只减不增
- 原文：`H:AGENTS.md:145`「**No new assertions to `unknown`** (`as unknown` or `<unknown>`). Preserve or reduce the exact legacy baseline」
- 作用：禁止新增向未知类型的断言，并让历史存量只减不增，防住用断言绕过类型检查。
- 是否推荐：⚠️ 条件推荐（条件：使用带类型检查的语言）
- 使用场景：`base`（边界：类型系统缺失时退化为"不引入未校验的取值"）
- 通用化改法：不新增向未知类型的断言；已有的这类断言只减不增并保持基线。
- 重复：无重复

### A1.33 · 源码面与产物面
- 原文：`H:AGENTS.md:146`「**Source plane vs artifact plane, never mixed.** Static gates and tests resolve workspace imports through tsconfig `paths` to `src` and pass on a clean tree」
- 作用：静态检查与测试只解析源码平面，构建产物只在显式声明的检查里消费，防住旧产物被当成源码加载导致的重复单例。
- 是否推荐：⚠️ 条件推荐（条件：仓库同时存在源码与构建产物，且二者都可被解析到）
- 使用场景：`monorepo`（边界：无构建产物的纯源码项目不适用）
- 通用化改法：静态检查与测试只解析源码平面，构建产物只在显式声明的检查里消费。
- 重复：无重复

### A1.34 · 编译面显式
- 原文：`H:AGENTS.md:147`「**Keep compiler faces explicit.** A package with both Host and Client programs exposes face-specific leaf configs and a solution-only root」
- 作用：一个包同时面向两个运行面时，为每个面保留显式的最小配置，不用根配置兜底。
- 是否推荐：❌ 不推荐（理由：不可通用化——"编译器面"与"只做聚合的根配置"是特定构建体系的组织法，抹掉工具名后无法判定是否做到）
- 使用场景：`monorepo`（边界：无）
- 通用化改法：不单列规范句（❌，无法通用化）。
- 重复：无重复

### A1.35 · 空捕获写明原因
- 原文：`H:AGENTS.md:148`「**An empty `catch` names the error** and why; keep its `try` to one statement.」
- 作用：空捕获块必须写明忽略的错误与原因，且其中只放一条语句，防住吞掉异常的无名空白。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：语言无异常机制时不适用）
- 通用化改法：空捕获块写明错误与原因，且其中只放一条语句。
- 重复：无重复

### A1.36 · 注释只写本地
- 原文：`H:AGENTS.md:149`「**Keep comments local.** Do not restate code, expand unrelated comments, or explain distant behavior without local need」
- 作用：注释只承载本地需要的信息，不复述代码、不解释远处行为，防住注释随代码漂移。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：跨文件契约应在拥有者处说明，本地只留指针）
- 通用化改法：注释只写本地需要的信息；不复述代码、不解释远处行为。
- 重复：无重复

### A1.37 · 禁用词表
- 原文：`H:AGENTS.md:150`「**Ban `prove` + `nance`**」
- 作用：禁用某个含糊用词，避免读者误判来源与确定性。
- 是否推荐：❌ 不推荐（理由：单一仓库的用词偏好，抹掉专名后无法通用化；其可执行内核"用精确词替代含糊词"已由 A1.52 承担）
- 使用场景：`docs`（边界：无）
- 通用化改法：不单列规范句；含义并入 A1.52。
- 重复：同义（→ 并入 A1.52）

### A1.38 · 平行值对称
- 原文：`H:AGENTS.md:151`「**Prefer symmetry for parallel values**; unexplained asymmetry usually signals a missed extraction.」
- 作用：把成组出现的取值与分支保持对称，并把"无解释的不对称"当作漏抽取的信号。
- 是否推荐：⚠️ 条件推荐（条件：同一处出现成组的平行取值或分支）
- 使用场景：`base`（边界：单点取值无对称要求）
- 通用化改法：平行出现的取值与分支保持对称；不对称必须在原处写明原因。
- 重复：无重复

### A1.39 · 测试描述行为
- 原文：`H:AGENTS.md:152`「**Tests describe behavior, not correctness.** Change obsolete behavior with its tests; explain why in the PR.」
- 作用：测试断言的是行为而非"对错"，行为变更时同步改测试并说明原因，防住"为了绿灯而改测试"。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无既有测试时不触发）
- 通用化改法：测试描述行为而非对错；行为变更时同步更新其测试并说明原因。
- 重复：包含或张力（→ 裁决：K 的 R26 要求"反复跑到判据通过再交付"，本条约束"行为变更时同步更新测试并说明原因"，是 R26 的防滥用条款；两条都保留）

### A1.40 · 决策记录范围
- 原文：`H:AGENTS.md:153`「**Create Agent Notes only for durable decision rationale;** mechanical/local edits are exempt」…「Archived notes are frozen: never edit or treat them as current authority」
- 作用：只对需要长期留存的决策写记录，纯机械改动豁免；归档记录冻结，防住把决策记录写成变更流水。
- 是否推荐：⚠️ 条件推荐（条件：项目使用决策记录文档并需要长期留存理由）
- 使用场景：`docs`（边界：无决策记录机制时无落点）
- 通用化改法：只对需要长期留存的决策写决策记录；纯机械改动豁免；已归档的记录冻结不可改。
- 重复：包含或张力（→ 裁决：P-40 与 P-41 管"简化上限与升级触发条件"的留痕，本条管"决策理由"的留痕与归档冻结；机制同构、对象不同，合并阶段归入同一章但各自保留）

### A1.41 · 文案归本地化字典
- 原文：`H:AGENTS.md:154`「**Client UI copy is locale-owned.** Route product text through typed dictionaries and `t` or localized primitive props」
- 作用：所有面向用户的文案经由统一的本地化字典与取值入口，源码里不出现硬编码文案，防住遗漏翻译与文案散落。
- 是否推荐：⚠️ 条件推荐（条件：产品有界面文案层或本地化需求）
- 使用场景：`frontend`（边界：无用户可见文案的后端项目不适用）
- 通用化改法：面向用户的文案通过统一的本地化字典与取值入口，源码里不出现硬编码文案。
- 重复：无重复

### A1.42 · 可见输出更新期望
- 原文：`H:AGENTS.md:155`「Every non-trivial model- or product-user-visible change updates a keyless recorded-session snapshot」…「fixtures replay on macOS/Linux; fix fixtures, not normalizers.」
- 作用：可见输出的改动必须在同一次改动内更新对应的端到端期望输出，且修的是场景本身而不是校对器。
- 是否推荐：⚠️ 条件推荐（条件：项目具备可回放的端到端期望输出设施）
- 使用场景：`gates`（边界：无回放设施时退化为"更新受影响的金标输出"）
- 通用化改法：可见输出的改动在同一次改动内更新对应的端到端期望输出。
- 重复：包含或张力（→ 裁决：K 的 R28 与 P-38 管"检查最小且可运行"，本条要求可见输出由端到端期望承载；互补，两条都保留）

### A1.43 · 呈现从原始派生
- 原文：`H:AGENTS.md:156`「**Design each tool's UI presentation up front.** Host presenters stay pure; Web cards derive from raw events and persisted result metadata」
- 作用：界面呈现从原始事件与持久化结果派生，展示层保持无副作用，防住把展示逻辑混进数据层。
- 是否推荐：⚠️ 条件推荐（条件：产品有多个呈现宿主或展示层与数据层分离）
- 使用场景：`frontend`（边界：单一宿主且无独立展示层时不适用）
- 通用化改法：界面呈现从原始事件与持久化结果派生，展示层保持无副作用。
- 重复：无重复

### A1.44 · 按改动面列测试层
- 原文：`H:AGENTS.md:157`「**Plan unit, e2e, and snapshot coverage** for capability seams, lifecycle paths, and transcript output; include missing snapshot-harness support in the same change.」
- 作用：规划改动时按能力接缝、生命周期路径与输出面枚举所需测试层级，并把缺失的测试设施纳入同一次改动。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：微不足道的改动不触发）
- 通用化改法：规划改动时按改动面枚举所需的测试层级，并把缺失的测试设施纳入同一次改动。
- 重复：包含或张力（→ 裁决：K 的 R30 管"多步任务每一步写明验证方式"，本条管"按改动面枚举测试层级"；互补，两条都保留）

### A1.45 · 多投影同步
- 原文：`H:AGENTS.md:158`「**Both SDKs project the loop.** Agent-loop, session-lifecycle, and `SessionEventMap` changes update the TypeScript and Python SDK expected outputs in the same PR; `pnpm run test` covers neither」
- 作用：同一语义有多个独立投影时，必须同步更新每个投影的期望输出，并且不假设主检查覆盖了它们。
- 是否推荐：✅ 推荐
- 使用场景：`monorepo`（边界：无多投影时不触发）
- 通用化改法：同一语义有多个独立投影时，在同一次改动内更新全部投影的期望输出。
- 重复：无重复

### A1.46 · 带租约强推
- 原文：`H:AGENTS.md:159`「Rewrites use `--force-with-lease`, abort on remote movement, never raw `--force`」；同句要求拆分独立改动并在传播前修引入它的 PR
- 作用：改写历史只允许带租约的安全强推，远端有新提交即中止；独立改动分开提交并在传播前修源。
- 是否推荐：⚠️ 条件推荐（条件：团队使用改写历史的分支流程）
- 使用场景：`base`（边界：单向追加提交的流程不触发）
- 通用化改法：改写历史时用带租约的强推，远端有新提交即中止；独立改动分开提交并在传播前修源。
- 重复：无重复

### A1.47 · 标签受控词表
- 原文：`H:AGENTS.md:160`「**Labels:** one PR `kind/*`, all material `area/*`, and native Issue Type」
- 作用：把流程分类字段收敛为受控集合，每个维度只取一个值，防住标签自由发挥导致无法筛选。
- 是否推荐：⚠️ 条件推荐（条件：用标签等分类字段驱动评审或发布流程）
- 使用场景：`monorepo`（边界：无流程分类需求时不适用）
- 通用化改法：流程分类字段使用固定的受控集合，每个维度只取一个值。
- 重复：无重复

### A1.48 · 待办标记受控
- 原文：`H:AGENTS.md:161`「TODO markers: `FIXME`/`TODO`/`XXX` by urgency」
- 作用：待办标记只使用少数受控记号，各自语义固定，便于事后按紧急度检索。
- 是否推荐：⚠️ 条件推荐（条件：仓库把代码内待办标记当作检索或分诊依据）
- 使用场景：`docs`（边界：不保留待办标记的项目不适用）
- 通用化改法：代码里的待办标记只使用受控的少数记号，各自语义固定并写明。
- 重复：无重复

### A1.49 · 文件单换行结尾
- 原文：`H:AGENTS.md:162`「Files end with exactly one trailing newline; `git diff --cached --check` (pre-commit) gates it.」
- 作用：文件以恰好一个换行结尾。
- 是否推荐：❌ 不推荐（理由：no-op 且已被提交前检查自动保证——写进指令文件不改变行为；真正起作用的是"提交前检查"本身，属门禁机制而非规则条目）
- 使用场景：`gates`（边界：无）
- 通用化改法：不单列规范句（❌；由提交前检查自动保证）。
- 重复：无重复

### A1.50 · 读防御模式清单
- 原文：`H:AGENTS.md:166`「Read [docs/defensive-patterns.md](docs/defensive-patterns.md) before lifecycle, concurrency, subprocess, or teardown work.」
- 作用：把"改动高风险缺陷类前先读该类模式清单"变成入口动作。
- 是否推荐：⚠️ 条件推荐（条件：仓库维护了按缺陷类组织的模式文档）
- 使用场景：`docs`（边界：无该类文档时退化为"先读相关代码"）
- 通用化改法：不单列规范句；含义并入 A1.01。
- 重复：同义（→ 并入 A1.01）

### A1.51 · 导出必写文档
- 原文：`H:AGENTS.md:170`「Every module and export has concise JSDoc for its non-obvious contract; function-like exports include `@param`/`@returns`」…「every remaining `any` explains why narrowing is infeasible.」
- 作用：每个对外导出都写明其非显然契约，函数级导出写明参数与返回值；类型逃逸必须写明原因。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：仓库无对外导出面时不触发）
- 通用化改法：每个对外导出都写明其非显然契约，函数级导出写明参数与返回值。
- 重复：无重复

### A1.52 · 契约而非推理
- 原文：`H:AGENTS.md:172`「Comments and docs state complete contracts and context, not reasoning transcripts. Use direct, concrete terms. Do not use metaphors.」…「Wire mechanically checkable invariants into an executed top-level gate and prove each changed acceptance path rejects an invalid case.」
- 作用：注释与文档只写完整契约与上下文，不写推理过程与比喻，用精确词；且可机械检查的不变量必须接入会被执行的门禁，并证明它能拒绝一个无效样例。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：纯探索性草稿不适用）
- 通用化改法：注释与文档只写完整契约与上下文，不写推理过程与比喻；可机械检查的不变量必须接入顶层门禁，并证明它能拒绝一个无效样例。
- 重复：包含或张力（→ 裁决：K 的 R28 与 P-38 管"检查要最小且先失败"，本条管"不变量接入顶层门禁并被证明能拒绝无效样例"；合并阶段并成一条"检查必须被证明会失败"）

### A1.53 · 文档随改动更新
- 原文：`H:AGENTS.md:174`「Docs accompany every code change: update affected README and JSDoc contracts together.」…「Current-state prose, one physical line per paragraph, one home per fact, and word budgets live there.」
- 作用：代码改动同一次更新受影响的文档与注释契约，并遵循格式与预算约束，防住文档滞后。
- 是否推荐：⚠️ 条件推荐（条件：仓库设有文档标准与词数预算）
- 使用场景：`docs`（边界：无文档预算的项目只适用前半）
- 通用化改法：改动同时更新受影响的文档与注释；每段落一个物理行；一个事实一个归属；文档设有词数上限。
- 重复：包含或张力（→ 裁决：A1.52 管内容契约，本条管格式与预算；同章分条，两条都保留）

### A1.54 · 指令单一真源
- 原文：`H:AGENTS.md:178`「`CLAUDE.md` symlinks `AGENTS.md` at root and `packages/`; edit the real file.」…「raise a `verify-doc-budgets` ceiling when the required content genuinely needs more space.」
- 作用：同一内容有多个入口名时只维护一个真源、其余为链接；确需扩充上限时先压缩再提额并写明理由。
- 是否推荐：⚠️ 条件推荐（条件：同一文档被多个约定入口名引用，或设有内容上限）
- 使用场景：`agent-cfg`（边界：某平台不支持链接时必须复制，此时退回 P-52 的逐字一致）
- 通用化改法：同一内容有多个入口名时只维护一个真源，其余为指向它的链接；确需扩充上限时先压缩再提额并写明理由。
- 重复：包含或张力（→ 裁决：P-52 允许复制但要求副本与主文件逐字一致，本条要求不要副本、改为链接；本条更省且更不易漂移，保留本条，P-52 降为不支持链接时的兜底）

### A1.55 · 内嵌副本登记
- 原文：`H:AGENTS.md:182`「`vendor/` packages are pinned source copies (manifest with upstream SHAs in [vendor/README.md](vendor/README.md)).」…「re-apply or retire the logged local modifications; rerun `pnpm run test && pnpm run build`.」
- 作用：内嵌的上游副本保持可追溯，任何本地偏离都登记在同一清单，改完重跑该副本的验证。
- 是否推荐：⚠️ 条件推荐（条件：仓库内嵌并维护上游源码副本）
- 使用场景：`monorepo`（边界：不内嵌上游副本时不适用）
- 通用化改法：内嵌上游副本保持与上游逐一对应并可追溯；任何本地偏离都登记在同一清单，并随改动重跑该副本的验证。
- 重复：无重复

## 自检

### 覆盖表（A1.01 … A1.55 各一次，缺漏 0）

| 判定 | ID 列表 | 条数 |
|---|---|--:|
| ✅ 推荐 | A1.09, A1.10, A1.11, A1.12, A1.15, A1.23, A1.27, A1.28, A1.29, A1.31, A1.35, A1.36, A1.39, A1.44, A1.45, A1.51, A1.52 | 17 |
| ⚠️ 条件推荐 | A1.01, A1.02, A1.03, A1.04, A1.05, A1.13, A1.17, A1.18, A1.19, A1.20, A1.21, A1.22, A1.24, A1.25, A1.26, A1.30, A1.32, A1.33, A1.38, A1.40, A1.41, A1.42, A1.43, A1.46, A1.47, A1.48, A1.50, A1.53, A1.54, A1.55 | 30 |
| ❌ 不推荐 | A1.06, A1.07, A1.08, A1.14, A1.16, A1.34, A1.37, A1.49 | 8 |
| 合计 | A1.01 … A1.55（本块只覆盖 A1，A2/A3/B/C 未在范围） | 55 |

重复分布（同一集合的另一种切分）：

| 重复判定 | ID 列表 | 条数 |
|---|---|--:|
| 无重复 | A1.03, A1.04, A1.05, A1.12, A1.15, A1.16, A1.17, A1.18, A1.19, A1.20, A1.21, A1.22, A1.24, A1.25, A1.27, A1.28, A1.29, A1.30, A1.32, A1.33, A1.34, A1.35, A1.36, A1.38, A1.41, A1.43, A1.45, A1.46, A1.47, A1.48, A1.49, A1.51, A1.55 | 33 |
| 同义（并入） | A1.06, A1.07, A1.08, A1.13, A1.14, A1.37, A1.50 | 7 |
| 包含或张力 | A1.01, A1.02, A1.09, A1.10, A1.11, A1.23, A1.26, A1.31, A1.39, A1.40, A1.42, A1.44, A1.52, A1.53, A1.54 | 15 |

同义并入落点：→ A1.05 两条（A1.06、A1.07）、→ A1.11 两条（A1.13、A1.14）、→ A1.12 一条（A1.08）、→ A1.52 一条（A1.37）、→ A1.01 一条（A1.50）。

### 字段完整性

| 字段 | 行数（应 == 55） |
|---|--:|
| 原文 | 55 |
| 作用 | 55 |
| 是否推荐 | 55 |
| 使用场景 | 55 |
| 通用化改法 | 55 |
| 重复 | 55 |

### 自检命令与输出

```bash
# 条目数（应为 55）
grep -c '^### A1\.' review/03-deepseek-harness.md
# 六个字段行（每项都应为 55）
for f in 原文 作用 是否推荐 使用场景 通用化改法 重复; do printf '%s ' "$f"; grep -c "^- $f：" review/03-deepseek-harness.md; done
# 三类推荐计数（应 17 / 30 / 8）
grep -c '^- 是否推荐：✅' review/03-deepseek-harness.md
grep -c '^- 是否推荐：⚠️' review/03-deepseek-harness.md
grep -c '^- 是否推荐：❌' review/03-deepseek-harness.md
# 重复分布（应 33 / 7 / 15）
grep -c '^- 重复：无重复' review/03-deepseek-harness.md
grep -c '^- 重复：同义' review/03-deepseek-harness.md
grep -c '^- 重复：包含或张力' review/03-deepseek-harness.md
# 覆盖唯一性：每个 ID 只出现一次（无输出即通过）
grep -o '^### A1\.[0-9]*' review/03-deepseek-harness.md | sort | uniq -d
# 场景标签分布（合计应为 55）
grep -o '^- 使用场景：`[a-z-]*`' review/03-deepseek-harness.md | sort | uniq -c
```

实测输出：

- `grep -c '^### A1\.'` → `55`
- 字段行：`原文 55`／`作用 55`／`是否推荐 55`／`使用场景 55`／`通用化改法 55`／`重复 55`
- `✅ 17`／`⚠️ 30`／`❌ 8`
- 重复分布：`无重复 33`／`同义 7`／`包含或张力 15`
- `uniq -d` → 无输出（覆盖唯一 ✓）
- 场景标签：`base 18`／`docs 12`／`gates 10`／`monorepo 9`／`runtime-agent 3`／`frontend 2`／`agent-cfg 1`（合计 55 ✓）

> **口径注（定稿后仍成立的口径）**：本节的全文件范围命令（`grep -c '^- 是否推荐：…'`、六个字段行等，`grep -c '^### A1\.'` 除外）在 task-15 测得 `55 / 17 / 30 / 8`；task-16 追加 A2、task-17 追加 A3+B+C 之后，不带段限定的同类命令返回的是全文件合计（条目 `174`、`✅ 69`／`⚠️ 93`／`❌ 12`，见文件头部 `### 2`）。A1 单块的计数与 ID 清单仍以本节上方两表为准（A1 条目自 task-15 起未被改动）；A2 与 3/3 块的自检各自用 `awk '/^## …/,/^## …自检/'` 限定到本段。

### 本块的两处口径说明

1. **规范句条数 = 40**（= 55 − 8 条 ❌ − 7 条同义并入）。本块不写 `## 规范句索引`，按 task-15 交办留给 task-17 定稿全文件；task-16 若需与本块去重，按 ID 读本文件条目即可（同义项已写明并入对象，不再另给规范句）。
2. **`原文` 字段的来源**：全部取自 `findings/03-deepseek-harness.md` §2 A1 段（`findings/03-deepseek-harness.md:36`–`90`）的逐字引文与 `H:` 出处；findings 中本就是转述而非逐字引文的（A1.05、A1.06），字段里标注「findings 转述」，不冒充引文。

### 与 findings 的冲突

无。本块只做判断与改写，逐条比对 A1 段的 ID、`H:` 出处与引文，未发现需要更正之处；`H:` 引用一律沿用 findings §2 已核验的行号，未重新取证。

### 未做的事（诚实边界）

- 本块只覆盖 A1（55 条）；A2（78 条）、A3（28 条）与 B/C 层由后续块追加，最终头部（全文件计数、最值得收、需裁决清单）与全文件 `## 规范句索引` 由 task-17 定稿——届时本块的头部数字需要与 A2/A3 合并重算。
- 未做跨块去重（A1 与 A2/A3 之间的同义/张力关系需在 task-16 完成后重扫），本块的"重复"只对本块内部与 P/K 两份索引判。

---

## A2 条目（A2.01 … A2.78，2/3 块）

> 范围：`findings/03-deepseek-harness.md` §2 A2 段（`findings/03-deepseek-harness.md:94`–`182`），共 78 条，ID 与 findings 一一对齐。
> 去重基线：P 的 45 条 + K 的 16 条规范句索引，加本文件 A1 的 55 条条目；A1 与 P/K 的既有裁决在 A1 段已给，本块只在语义相干处引用。
> 本块对 A2 的三类区别对待：可通用工程纪律给规范句；纯仓库约定（构建配置、目录归属、双语配对、快照夹具）判 ⚠️/❌ 并提取通用内核；文档写作标准归 `docs`/`agent-cfg`。

### A2.01 · 插件导出形态统一
- 原文：`H:packages/AGENTS.md:5`「**Plugin exports:** service packages default-export their service class; function plugins named-export `name` / `inject` / `Config` / `apply` and have no default export.」
- 作用：同一扩展点只允许一种导出形态，防住混用两种形态时加载器静默丢弃插件的命名空间。
- 是否推荐：⚠️ 条件推荐（条件：平台有插件/扩展加载协议并规定导出形状）
- 使用场景：`monorepo`（边界：无加载协议的应用代码不适用）
- 通用化改法：一个扩展点只允许一种导出形态，同类扩展保持一致并由检查强制。
- 重复：无重复

### A2.02 · 可选依赖显式读取
- 原文：`H:packages/AGENTS.md:6`「**Optional services use `ctx.get(name)`.** Reserve `ctx.<name>` for declared injections」
- 作用：可选依赖走显式查询接口，属性代理只留给已声明的注入，防住拓扑变化让读取结果悄悄变化。
- 是否推荐：⚠️ 条件推荐（条件：框架同时提供属性代理与显式查询两种依赖读取方式）
- 使用场景：`monorepo`（边界：直接构造依赖、无容器时不适用）
- 通用化改法：可选依赖用显式查询读取，简写形式只留给已声明的必需依赖。
- 重复：无重复

### A2.03 · 可见面要真实装配测试
- 原文：`H:packages/AGENTS.md:7`「**Product-visible plugins require a non-unit REAL-composition test.** Hand-built `ctx.plugin(...)` suites are insufficient.」…「assert model-visible, durable, or user-visible output.」
- 作用：用户/模型可见的能力必须有走真实装配与真实入口的测试，只 mock 外部服务与不确定输入，并断言可见产物，防住"单测全绿、产品是坏的"。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：纯内部工具函数不需要装配级测试）
- 通用化改法：用户可见的能力必须有经真实装配与真实入口的测试，只替身外部服务，并断言用户可见产物。
- 重复：包含或张力（→ 裁决：P-38 与 K 的 R28 给的是"至少一条最小可运行检查"的下限，本条对可见面加严到真实装配；合并阶段写成"下限 + 可见面加严"，两条都保留）

### A2.04 · 上下文显式恢复
- 原文：`H:packages/AGENTS.md:8`「**Initiator-owned private chains derive, then capture.**」…「do not widen a leaf helper from `Session` to `Context` merely to hide a parameter」
- 作用：需要身份或会话时在编排入口显式恢复并派生，不为了让参数表好看而放宽叶子函数的类型。
- 是否推荐：⚠️ 条件推荐（条件：框架存在隐式上下文或发起者作用域）
- 使用场景：`base`（边界：显式传参的代码不适用）
- 通用化改法：需要身份或上下文时在编排入口显式恢复并向下捕获，不放宽叶子函数的参数类型来隐藏依赖。
- 重复：无重复

### A2.05 · 一操作一控制器
- 原文：`H:packages/AGENTS.md:9`「**Represent one asynchronous operation with one lifecycle controller or transaction.**」
- 作用：一个异步操作由一个控制器或事务承载；额外的就绪、取消、释放状态必须有独立归属，否则合并，防住同一操作散落多个状态源。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：无异步生命周期的一次性调用不触发）
- 通用化改法：一个异步操作只由一个生命周期控制器或事务承载，多余状态要么有独立归属要么合并。
- 重复：无重复

### A2.06 · 服务按全体消费者设计
- 原文：`H:packages/AGENTS.md:10`「**Design Service Definitions for all current Consumers.**」…「a public service method with one internal caller — pass a private capability closure instead」
- 作用：服务契约按全部当前消费者设计，不迁就单一消费者；只有一个内部调用者的公开方法降为私有闭包。
- 是否推荐：⚠️ 条件推荐（条件：架构中存在服务定义与多个消费者角色）
- 使用场景：`base`（边界：单一消费者且无复用意图时直接内联）
- 通用化改法：服务契约按全部当前消费者设计；只有一个内部调用者的公开方法改为私有实现。
- 重复：包含或张力（→ 裁决：K 的 R11 给的是"抽象至少两个使用点，否则内联"的通用判据，本条把同一判据用在服务方法上并补"按全体消费者设计"；合并阶段保留 R11 为判据、本条为服务层实例）

### A2.07 · 抽象须有当前归属
- 原文：`H:packages/AGENTS.md:11`「**Require a current owner and need.** Tie each abstraction, state machine, option, defensive copy, and compatibility path to a current contract or production consumer」
- 作用：每个抽象、状态机、选项、防御性拷贝与兼容路径都必须绑定当前契约或生产消费者，防住投机性设计沉淀。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：为已承诺的兼容义务保留的路径属于"当前契约"）
- 通用化改法：每个抽象、状态机、选项与兼容路径都必须绑定当前契约或真实消费者。
- 重复：包含或张力（→ 裁决：P-16 的"只实现刚好够用的最小版本、不预留扩展点"是本条的口号版，本条更可判（逐项要求给出归属）；合并阶段以本条为判据、P-16 为其简述）

### A2.08 · 公开选择须有证据
- 原文：`H:packages/AGENTS.md:12`「**Require evidence for public choices.** Configurability does not justify an unsupported default, public operation set, format, or imported external concept.」
- 作用：公开的默认值、操作集、格式与引入的外部概念都要有证据（当前消费者或既有实践），"可配置"本身不构成理由。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：内部实现细节不要求同等证据）
- 通用化改法：公开的默认值、操作集与格式都要有当前消费者或既有实践作证；可配置本身不是理由。
- 重复：包含或张力（→ 裁决：A1.28 要求"部署间会变的取值成为经校验的配置项"，本条反过来约束"配置化不等于可以随便定默认值"；两条互补，合并成一句"该配置的去配置化、不该有的别拿可配置当理由"）

### A2.09 · 模型面向文本从模型视角
- 原文：`H:packages/AGENTS.md:13`「**Write model-facing contracts from the model's perspective.** Prompts, tool schemas, results, and diagnostics contain only task-relevant concepts」…「Pin stable model-visible text verbatim and dynamic behavior through snapshots or end-to-end coverage.」
- 作用：面向模型的提示、工具契约与诊断只写任务相关概念，不掺界面、传输或实现词汇；稳定的可见文本逐字固定并由测试锁定。
- 是否推荐：⚠️ 条件推荐（条件：产品有模型可见的提示、工具契约或诊断）
- 使用场景：`runtime-agent`（边界：无模型调用的产品不适用）
- 通用化改法：面向模型的文本只含任务相关概念，不含实现或界面词汇；稳定的可见文本逐字固定并由测试锁定。
- 重复：包含或张力（→ 裁决：A1.23 管"模型输入可重建"，本条管"措辞视角与逐字锁定"；同属模型可见面一章，合并时分成两条）

### A2.10 · 约束落在执行者身上
- 原文：`H:packages/AGENTS.md:14`「**Enforce a decision in the operation that makes it.** Schema omission, prompt filtering, facades, wrappers, and listener order are not enforcement when direct or alternate callers can bypass them; test denial through the executor.」
- 作用：约束必须做在真正做决定的那一步，上游过滤、包装与顺序都不算执法；并用测试证明执行者会拒绝。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：无旁路调用者时可在最外层校验）
- 通用化改法：约束必须在做决定的那一步强制执行，并测试真正的执行者会拒绝被禁止的输入。
- 重复：包含或张力（→ 裁决：P-32 要求"信任边界的输入一律校验"，本条补上"校验必须落在执行者身上、不能被旁路绕过"；合并成一条"边界校验 + 执行者执法"）

### A2.11 · 只在校验点发布状态
- 原文：`H:packages/AGENTS.md:15`「**Publish state only at its commit point.**」
- 作用：通知与派生状态只在操作成功后发布，缓存、提示、界面回显、回放与查询视图都从同一权威源派生。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：乐观更新必须显式声明并通过同一权威源收敛）
- 通用化改法：只在操作成功后发布状态与通知，所有派生视图从同一权威源派生。
- 重复：无重复

### A2.12 · 上限施加在完整结果上
- 原文：`H:packages/AGENTS.md:16`「**Apply bounds to the complete result.** Enforce byte, token, item, and time limits where the complete emitted or retained value, including wrappers and metadata, is known」
- 作用：上限施加在完整产出（含包装与元数据）上，并测试极小值、精确值、单块超限与多字节边界。
- 是否推荐：⚠️ 条件推荐（条件：系统对输入、输出或留存施加字节/条目/时间上限）
- 使用场景：`base`（边界：无上限语义时不触发）
- 通用化改法：上限施加在完整产出（含包装与元数据）上，并测试极小值、精确值与单块超限。
- 重复：无重复

### A2.13 · 回收要有测试证明
- 原文：`H:packages/AGENTS.md:17`「**Registry contributions prove disposal** through the HMR-safety test required by [testing policy](../docs/testing.md): dispose the fiber and observe removal.」
- 作用：注册型贡献必须有一条证明可回收的测试（销毁后观察到移除），防住热重载与销毁后的残留注册。
- 是否推荐：⚠️ 条件推荐（条件：框架有注册/订阅与其销毁机制）
- 使用场景：`gates`（边界：无注册机制的代码不触发）
- 通用化改法：注册型贡献必须有证明可回收的测试：销毁后观察到注册被移除。
- 重复：包含或张力（→ 裁决：A1.18 管注册形态（走效果接口、返回注销句柄），本条管"用测试证明回收真的发生"；互补，合并成"注册即效果 + 回收有测试"）

### A2.14 · 测试必须能并发通过
- 原文：`H:packages/AGENTS.md:18`「**Specs run concurrently** in forked workers beside other gate processes.」…「a spec that passes only when run alone is a defect in the spec」
- 作用：测试要能在并发与相邻门禁共存的环境下通过；"单独跑才过"算测试自身的缺陷，不算环境不稳定。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：确实需要独占外部资源的用例应显式串行并声明）
- 通用化改法：测试必须能在并发下通过；只有单独运行才通过的测试算测试本身的缺陷。
- 重复：无重复

### A2.15 · 断言须防空转
- 原文：`H:packages/AGENTS.md:19`「**Publish `./invariant` only for diverging observations.**」…「Empty companions and ignored reporters fail [`verify-package-invariants`]」
- 作用：只为独立观测可能分歧的关系发布运行时断言，并且空断言与不生效的报告器会让门禁失败。
- 是否推荐：⚠️ 条件推荐（条件：项目发布包级运行时断言或自检）
- 使用场景：`runtime-agent`（边界：不发布断言时无落点）
- 通用化改法：不单列规范句；含义并入 A1.19。
- 重复：同义（→ 并入 A1.19）

### A2.16 · 包构建配置继承基线
- 原文：`H:packages/AGENTS.md:23`「**Package tsconfig:** extends `tsconfig.base.json` (Client: `tsconfig.base.client.json`), sets `rootDir: src` and `outDir: lib/types`」
- 作用：让每个包的构建配置继承统一基线并显式声明同仓依赖引用，防住配置逐包复制后各自漂移。
- 是否推荐：❌ 不推荐（理由：条目主体是特定构建工具的继承链与目录取值，抹掉工具名后无法判定"做到没有"；可提取内核"构建配置集中基线、包只增量声明"过于单薄且验收依赖具体工具）
- 使用场景：`monorepo`（边界：无）
- 通用化改法：不单列规范句（❌，无法通用化）。
- 重复：无重复

### A2.17 · 类型文件只放类型
- 原文：`H:packages/AGENTS.md:24`「`src/types.ts` contains only types — no runtime code.」
- 作用：类型定义文件只放类型声明，不放运行时代码，防住只为用类型而引入运行时依赖。
- 是否推荐：⚠️ 条件推荐（条件：语言能把类型层与运行时代码分离）
- 使用场景：`monorepo`（边界：无独立类型层的语言用文档约定替代）
- 通用化改法：类型定义文件只放类型声明，不放运行时代码。
- 重复：无重复

### A2.18 · 测试与源码目录分离
- 原文：`H:packages/AGENTS.md:25`「Tests live at package level under `tests/`, not `src/__tests__/`.」
- 作用：测试放在包级目录而不是内嵌源码目录，防住构建或发布把测试一起带出去、以及导入路径混乱。
- 是否推荐：⚠️ 条件推荐（条件：包级构建会整体发布或打包源码目录）
- 使用场景：`monorepo`（边界：单文件脚本把测试与实现放一起不触发）
- 通用化改法：测试放在包级目录，不内嵌在会被构建或发布的源码目录里。
- 重复：无重复

### A2.19 · README 与 JSDoc 随改动更新
- 原文：`H:packages/AGENTS.md:26`「Update package README and JSDoc contracts in the same commit as behavior」…「Group READMEs declare subsystem ownership through a canonical English page link or justified [exemption]」
- 作用：行为改动同一次提交更新包 README 与 JSDoc 契约；组 README 必须声明它归属的子系统页或给出豁免理由。
- 是否推荐：⚠️ 条件推荐（条件：包对外提供契约文档并维护归属页）
- 使用场景：`docs`（边界：无可声明归属的包只需前半）
- 通用化改法：行为改动在同一次提交更新受影响的文档与注释，并让每个单元声明它归属的权威说明页。
- 重复：包含或张力（→ 裁决：A1.53 管"文档随代码改动更新"的总则，本条把它落到包 README/JSDoc 并附加"声明归属页"；合并阶段保留本条后半为独立要求）

### A2.20 · README 记录模型与成本影响
- 原文：`H:packages/AGENTS.md:27`「Package READMEs document model, token, and KV-cache effects using the [canonical Model Experience format]」
- 作用：包 README 用统一格式记录它对模型、token 与缓存的影响，让使用者在接入前就知道可见后果。
- 是否推荐：⚠️ 条件推荐（条件：包有模型可见效果，且项目为 README 规定了固定小节）
- 使用场景：`docs`（边界：无模型可见效果的包不适用）
- 通用化改法：会改变模型可见行为的组件在文档里用固定小节记录其可见与成本影响。
- 重复：无重复

### A2.21 · 已知限制进固定小节
- 原文：`H:packages/AGENTS.md:28`「Package READMEs put durable consumer gaps and non-obvious maintainer constraints under `## Known Limitations and Deferred Work`」
- 作用：长期存在的消费者缺口与非显然的维护约束写在固定的 README 小节里，没有的也要显式声明并给理由。
- 是否推荐：⚠️ 条件推荐（条件：项目为 README 规定了固定小节）
- 使用场景：`docs`（边界：一次性脚本无需该小节）
- 通用化改法：长期缺口与维护约束写在固定的"已知限制"小节里，没有也要显式声明。
- 重复：无重复

### A2.22 · 扩展位声明与授权
- 原文：`H:packages/client/AGENTS.md:12`「Rendering an undeclared slot, or declaring one someone else declared, fails at load.」
- 作用：扩展位的声明、授权与渲染必须一致，错配在加载时就失败，防住隐式扩展点被随意使用。
- 是否推荐：⚠️ 条件推荐（条件：框架提供声明式扩展位并由父级授权子级）
- 使用场景：`frontend`（边界：无扩展位机制时不适用）
- 通用化改法：扩展位的声明与渲染必须匹配，未声明的使用在加载时失败；扩展位命名反映它的组合位置。
- 重复：无重复

### A2.23 · 组件属性由框架派生
- 原文：`H:packages/client/AGENTS.md:13`「**Component props are the five shares, all derived**」＋「Never hand-write or locally re-type a derived member.」
- 作用：组件的输入属性由框架派生，禁止手工重写或局部重复声明派生类型，防住派生面与框架实现脱节。
- 是否推荐：⚠️ 条件推荐（条件：框架提供派生属性类型）
- 使用场景：`frontend`（边界：无派生机制的组件库不适用）
- 通用化改法：组件的输入属性由框架派生，不手工重写或局部重复声明派生类型。
- 重复：无重复

### A2.24 · 钩子只由框架创建
- 原文：`H:packages/client/AGENTS.md:14`「**Hooks are framework-made only**」＋「Business code never creates a hook or selector as a prop value — pass plain data and callbacks.」
- 作用：钩子与选择器只由框架绑定，业务代码向组件传普通数据与回调，防住业务层自造反应式机制。
- 是否推荐：⚠️ 条件推荐（条件：框架提供钩子/绑定层）
- 使用场景：`frontend`（边界：无绑定层的组件不适用）
- 通用化改法：钩子与选择器只由框架创建，业务代码向组件传普通数据与回调。
- 重复：无重复

### A2.25 · 共享状态单一改写入口
- 原文：`H:packages/client/AGENTS.md:16`「**Stores: read `props.useStore`, write `props.actions.*`** — the declared actions are the complete mutation API.」＋「module-level handles are forbidden — de-facto singletons」
- 作用：共享状态只通过声明的作用集改写，且句柄不做模块级单例，防住绕过声明 API 的隐式写入与全局状态。
- 是否推荐：⚠️ 条件推荐（条件：框架有状态容器注册机制）
- 使用场景：`frontend`（边界：无共享状态需求时不适用）
- 通用化改法：共享状态只通过声明的作用集改写，状态句柄按作用域创建而非模块级单例。
- 重复：无重复

### A2.26 · 业务组件不自建订阅
- 原文：`H:packages/client/AGENTS.md:25`「**Business components contain no subscription machinery** — no `useSyncExternalStore`, no manual subscribe wiring」
- 作用：业务组件不自己搭订阅机制，而是走框架既有的数据通道，防住多处重复订阅与状态镜像。
- 是否推荐：⚠️ 条件推荐（条件：框架提供数据通道并区分组件与装配层）
- 使用场景：`frontend`（边界：无框架通道的原生组件不适用）
- 通用化改法：业务组件不自建订阅机制，数据从框架既有的通道取得。
- 重复：包含或张力（→ 裁决：A2.24 管"钩子只由框架创建"，本条管"订阅机制不自己搭"；同族两条，合并成"业务代码不自建反应式机制"）

### A2.27 · 插件导出面最小化
- 原文：`H:packages/client/AGENTS.md:35`「**A UI plugin exports no values beyond what cordis loading needs**」＋「Adding any new value export requires user sign-off, not a matching consumer.」
- 作用：插件包只导出加载协议需要的值；扩大导出面要显式批准，不能以"已经有消费者"为由自动放行。
- 是否推荐：✅ 推荐
- 使用场景：`frontend`（边界：无公开入口面约束的普通库不适用）
- 通用化改法：扩展包只导出加载协议需要的值，新增导出需要显式批准而不是有消费者即可。
- 重复：无重复

### A2.28 · 同级功能不互引
- 原文：`H:packages/client/AGENTS.md:37`「**A feature plugin MUST NOT runtime-import or re-export another feature plugin's values, and MUST NOT declare `dsh.client.external` to obtain them.**」…「If neither fits, stop and escalate — do not add an export to unblock yourself.」
- 作用：同级功能模块之间不直接引用彼此的实现值；跨模块行为通过注入的服务或声明的扩展位，做不到就停下上报而不是扩大导出面。
- 是否推荐：✅ 推荐
- 使用场景：`frontend`（边界：共享基础设施包不受此限）
- 通用化改法：同级功能模块不直接引用彼此的实现，跨模块行为走注入的服务或声明的扩展位；做不到就上报。
- 重复：无重复

### A2.29 · 上下文只在装配层
- 原文：`H:packages/client/AGENTS.md:41`「`ctx` belongs to the apply world only」＋「Components … receive all data and callbacks through the derived props shares」
- 作用：框架上下文只在装配层可见，组件只能拿到派生属性，防住组件反向依赖容器内部结构。
- 是否推荐：⚠️ 条件推荐（条件：框架区分装配层与组件层）
- 使用场景：`frontend`（边界：无容器概念的组件不适用）
- 通用化改法：框架上下文只在装配层可见，组件通过派生属性接收数据与回调。
- 重复：包含或张力（→ 裁决：A2.23 管属性怎么来，本条管上下文能看到什么；同族分工，合并时同章）

### A2.30 · 业务数据不进视图状态
- 原文：`H:packages/client/AGENTS.md:53`「**Business data lives in the object layer, never a store.**」
- 作用：业务数据留在数据层，视图状态容器只装共享的查看与交互状态。
- 是否推荐：⚠️ 条件推荐（条件：应用区分数据层与视图状态层）
- 使用场景：`frontend`（边界：无独立数据层的应用不适用）
- 通用化改法：业务数据留在数据层，共享状态容器只装查看与交互类状态。
- 重复：包含或张力（→ 裁决：A2.25 管容器怎么读怎么写，本条管容器里能放什么；合并成"视图状态进容器、业务数据留数据层"）

### A2.31 · 展示层逻辑不出层
- 原文：`H:packages/client/AGENTS.md:56`「**The web layer is pure presentation.**」…「A new *model-visible* input still requires a session event (repo-wide rule).」
- 作用：展示层不把"怎么画"写进持久化记录；但新增的模型可见输入仍必须有记录项（仓库级不变量的本地应用）。
- 是否推荐：⚠️ 条件推荐（条件：产品同时有展示层与持久化日志）
- 使用场景：`frontend`（边界：无日志的纯前端不涉及后半）
- 通用化改法：展示逻辑不写入持久化记录；但任何新增的模型可见输入仍必须同时新增记录项。
- 重复：包含或张力（→ 裁决：本条后半是 A1.23 在展示层的应用，前半（展示层不出层）独立；合并阶段前半独立成条，后半并入 A1.23）

### A2.32 · 分类不确定就拒绝
- 原文：`H:packages/client/AGENTS.md:65`「The verifier rejects unclassified exports before `--fix` writes manifests.」
- 作用：自动修复工具遇到无法分类的输入必须拒绝而不是猜，防住批处理把错误分类写进清单。
- 是否推荐：✅ 推荐
- 使用场景：`monorepo`（边界：无自动修复工具时不触发）
- 通用化改法：自动修复只处理能确定分类的输入，遇到无法分类的拒绝并报出，不猜测。
- 重复：无重复

### A2.33 · 静态依赖进自有产物
- 原文：`H:packages/client/AGENTS.md:83`「Keep every static relative dependency inside its owning output chunk rather than relying on a sibling-chunk graph the runtime does not support.」
- 作用：每个产物的静态依赖落在它自己的输出块里，不依赖运行时不支持的跨块图。
- 是否推荐：⚠️ 条件推荐（条件：项目做代码分割或多产物打包）
- 使用场景：`frontend`（边界：单产物构建不触发）
- 通用化改法：每个产物的静态依赖都落在它自己的输出块内，不依赖运行时不支持的跨块关系。
- 重复：无重复

### A2.34 · 折叠必须可确定性重放
- 原文：`H:packages/client/AGENTS.md:104`「remains deterministically replayable by logical log `seq`」（findings 转述＋引文）
- 作用：增量折叠只读当前事件，并且结果必须能按日志序号确定性重放，防住折叠依赖到达顺序或外部状态。
- 是否推荐：⚠️ 条件推荐（条件：系统用事件日志驱动派生视图）
- 使用场景：`frontend`（边界：无事件日志的不适用）
- 通用化改法：增量折叠只读当前事件，结果必须能按记录序号确定性重放。
- 重复：包含或张力（→ 裁决：A1.23 管"输入可重建"，本条管"折叠可重放"；同属日志确定性一章，合并时分成两条）

### A2.35 · 层内领域互不引用
- 原文：`H:packages/client/AGENTS.md:109`「`scripts/verify-client-domain-graph.ts` enforces the levels.」；门禁自述 `H:scripts/verify-client-domain-graph.ts:2-3`「Enforce intra-package domain layering inside `packages/client/*\/src/client/`.」
- 作用：同一包内按领域分目录，领域之间互不引用、只通过共享契约目录通信，装配点唯一。
- 是否推荐：⚠️ 条件推荐（条件：包内代码量足以按领域分目录）
- 使用场景：`frontend`（边界：小包无需分层）
- 通用化改法：同一包内的领域目录互不引用，只通过共享契约目录通信，装配点保持唯一。
- 重复：无重复

### A2.36 · 文案走本地化字典
- 原文：`H:packages/client/AGENTS.md:117`「Every product-visible string—including text, accessibility names, tooltips, placeholders, status/unit formatters, and primitive chrome—lives in a typed locale dictionary」
- 作用：所有面向用户的文案（含无障碍名、提示、占位符、格式模板）都走带类型的本地化字典，源码不出现硬编码文案。
- 是否推荐：⚠️ 条件推荐（条件：产品有界面文案层或本地化需求）
- 使用场景：`frontend`（边界：无用户可见文案不适用）
- 通用化改法：不单列规范句；含义并入 A1.41。
- 重复：同义（→ 并入 A1.41）

### A2.37 · 覆盖率排除必须带理由
- 原文：`H:packages/client/AGENTS.md:123`「Genuinely unreachable defensive arms take a `/* v8 ignore -- <reason> */` comment with a real reason, never a bare ignore.」
- 作用：覆盖率按文件满额要求；不可达的防御分支用带真实理由的排除注释，禁止裸排除。
- 是否推荐：⚠️ 条件推荐（条件：项目设有按文件覆盖率门禁）
- 使用场景：`gates`（边界：无覆盖率门禁的项目不适用）
- 通用化改法：覆盖率门禁下，不可达分支用带真实理由的排除标注，禁止无理由排除。
- 重复：无重复

### A2.38 · 秒级内环默认跑
- 原文：`H:packages/client/AGENTS.md:132`「**Every GUI code change** — `pnpm run test:gui` (seconds; no browser, no server)」＋「This is the inner loop; run it as freely as a typecheck.」
- 作用：为界面改动提供秒级的本地内环检查并要求默认运行，把"改动即验证"的成本压到接近零。
- 是否推荐：⚠️ 条件推荐（条件：项目有可快速运行的分层测试）
- 使用场景：`gates`（边界：无秒级内环的项目退化为按改动面选检查）
- 通用化改法：为高频改动提供秒级内环检查，并允许像类型检查一样随时运行。
- 重复：包含或张力（→ 裁决：A1.12 禁止重跑已通过的昂贵检查，本条为秒级内环开例外；合并阶段把"A1.12 的例外条件"写成"成本低到可当类型检查用"）

### A2.39 · 推前按面选检查
- 原文：`H:packages/client/AGENTS.md:134`「to select the narrow checks for the outgoing diff; there is no repo-wide pre-push aggregate.」
- 作用：推送前按改动面选最窄的检查，且不存在全仓推前聚合命令。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无推送流程时退化为交付前选检查）
- 通用化改法：不单列规范句；含义并入 A1.10。
- 重复：同义（→ 并入 A1.10）

### A2.40 · 无关红灯写进交接
- 原文：`H:packages/client/AGENTS.md:136`「If `test:gui` is red on code you did not touch, neither silently fix nor ignore it: note it in your handoff」
- 作用：遇到与本次改动无关的既有失败，既不顺手修也不忽略，写进交接说明，防住顺手扩大改动面或让红灯静默消失。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：确属本次改动引起时按正常修复流程处理）
- 通用化改法：遇到与本改动无关的既有失败，既不顺手修也不忽略，写进交接说明。
- 重复：无重复

### A2.41 · 注册面一次补齐
- 原文：`H:packages/client/AGENTS.md:143`「**Three registration surfaces, all required** (missing any one fails at a different, later point)」
- 作用：新增可插拔单元时把所有必需注册面一次补齐，防住漏一处后失败点更晚、更难定位。
- 是否推荐：⚠️ 条件推荐（条件：平台要求多处注册才能生效）
- 使用场景：`monorepo`（边界：单点注册的平台不适用）
- 通用化改法：新增可插拔单元时一次补齐全部必需注册面，并让漏注册尽早失败。
- 重复：无重复

### A2.42 · 复用前先查共享位
- 原文：`H:packages/client/AGENTS.md:151`「**Check the [ui-primitives catalog](ui-primitives/README.md#component-catalog) before writing a control.** A plugin cannot import another plugin's component」
- 作用：新增控件前先查共享控件目录；同级插件之间不互相导入组件，共享件只从唯一的共享位提升。
- 是否推荐：⚠️ 条件推荐（条件：项目有共享组件位与包边界）
- 使用场景：`frontend`（边界：单体前端不涉及包边界）
- 通用化改法：新增共享件前先查已有的共享位；同级模块不互相导入实现，共享件从唯一共享位提升。
- 重复：包含或张力（→ 裁决：A2.28 管值导入，本条管组件复用；同属"同级不互引、共享走下位"一族，合并成一条加各自实例）

### A2.43 · 一个事实一个归属
- 原文：`H:docs/AGENTS.md:17`「Each fact has one home: the tier whose job it is; elsewhere, link there.」
- 作用：每个事实只有一个归属层，其他处只链接，防住同一规则多处复述后各自漂移。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：契约类事实允许在就近使用点重复，其余链接）
- 通用化改法：每个事实只在一个归属处完整陈述，其余位置只链接。
- 重复：包含或张力（→ 裁决：A1.05 的"机器可读清单不复述"是本条的一个实例，本条是总则；合并阶段保留本条为总则）

### A2.44 · 只写当前状态
- 原文：`H:docs/AGENTS.md:39`「**Document current state.** Keep history in commits, PRs, Agent Notes, postmortems, or scoped persistence records.」
- 作用：文档只描述当前状态，历史留在提交、变更请求与决策记录里，防住文档变成变更流水。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：决策记录与事故复盘是历史的正当归属处）
- 通用化改法：文档只描述当前状态，历史留在提交与决策记录里。
- 重复：无重复

### A2.45 · 一段落一物理行
- 原文：`H:docs/AGENTS.md:41`「**One physical line per paragraph** (`verify-md-wrap`): use editor soft-wrap.」
- 作用：每个段落写成一个物理行，靠编辑器软换行，让 diff 与锚点稳定、评审按段落进行。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：代码块、表格与列表结构保持各自格式）
- 通用化改法：每个段落写成一个物理行，靠编辑器软换行。
- 重复：无重复

### A2.46 · 文档代码块必须可编译
- 原文：`H:docs/AGENTS.md:42`「**Fenced `ts` blocks must compile** (`doc-typecheck`)」
- 作用：文档里标注语言的代码块必须能编译；逐字粘贴的类型声明要与源符号登记核对，防住示例腐烂。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：示意性伪代码不标注为可编译语言）
- 通用化改法：文档中标注语言的代码块必须能编译，逐字粘贴的声明要与源符号核对。
- 重复：无重复

### A2.47 · 配对文档同步更新
- 原文：`H:docs/AGENTS.md:44`「**Pairs update together**」＋「`dsh-translate-docs` remains user-invoked」
- 作用：双语（多语言）文档成对更新并校验结构一致；整篇翻译由用户显式触发而不是模型顺手做。
- 是否推荐：⚠️ 条件推荐（条件：文档维护多语言配对）
- 使用场景：`docs`（边界：单语项目不适用）
- 通用化改法：多语言配对文档在同一次改动内同步更新并保持结构对应；整篇翻译由用户显式触发。
- 重复：包含或张力（→ 裁决：A1.45 是"多个独立投影要同步更新"的总则，本条是双语文档实例并附加"翻译要显式触发"；合并阶段本条并入 A1.45 的实例）

### A2.48 · 用具名而非比喻
- 原文：`H:docs/AGENTS.md:46`「Write directly: name actors and facts」＋「Name the exact check, type, API, operation, or behavior instead of metaphorical "gate", "vocabulary", or "surface".」
- 作用：写具体的行为者与事实，指名确切的检查、类型或操作，不用比喻词代替技术名。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：确有定义且需要引用的术语照常使用）
- 通用化改法：不单列规范句；含义并入 A1.52。
- 重复：同义（→ 并入 A1.52）

### A2.49 · 超限先搬再压最后提额
- 原文：`H:docs/AGENTS.md:52`（预算 ratchet 的处置顺序）＋门禁报错 `H:scripts/verify-doc-budgets.ts:42`「exceeds the ${ceiling}-word ceiling — relocate or condense per docs/AGENTS.md (raising the ceiling requires justification in the PR)」
- 作用：文档超出上限时先按归属搬到别的层，再压缩，最后才提额并必须在变更说明里给出理由。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：无内容上限的文档不触发）
- 通用化改法：文档超出上限时先在归属层之间搬迁，再压缩，最后才提额并写明理由。
- 重复：包含或张力（→ 裁决：A1.54 管"多入口名单一真源 + 提额要理由"，本条给出完整处置顺序；合并阶段以本条为主，A1.54 保留真源部分）

### A2.50 · 具体词数目标表
- 原文：`H:docs/AGENTS.md:58`「Targets: root `AGENTS.md` ≤ 1,950; `architecture.md` ≤ 2,400; subtree `AGENTS.md` ≤ 600, except `packages/AGENTS.md` ≤ 750 and this file ≤ 1,320; …」
- 作用：为一组具名文档写明具体词数上限（每条数字只对该仓库的文件成立）。
- 是否推荐：❌ 不推荐（理由：一组具体文件的具体数字，抹掉专名与数值后不含可判定内容；通用内核"给常驻文档设上限并给出处置顺序"已由 A2.49 承担）
- 使用场景：`docs`（边界：无）
- 通用化改法：不单列规范句；含义并入 A2.49。
- 重复：同义（→ 并入 A2.49）

### A2.51 · 文档腐烂清单
- 原文：`H:docs/AGENTS.md:64`「Duplicated rules: search a distinctive phrase; keep one home and link the rest.」…末项 `H:docs/AGENTS.md:72`「Spec-speak in `implemented/` Agent Notes」
- 作用：把文档审查收敛成一张固定的腐烂清单（重复规则、越层历史、状态标注、复述清单、推理过程、重复理由、段落墙、强调膨胀、规格语），审查时成套使用。
- 是否推荐：⚠️ 条件推荐（条件：做文档审查或改写时成套使用）
- 使用场景：`docs`（边界：逐条内容已由 A1.36、A1.52、A2.43、A2.44 承担，本条的增量是"成套审查动作"）
- 通用化改法：按固定清单审查文档：重复规则、越层历史、状态标注、复述清单、推理过程、段落墙与强调膨胀。
- 重复：包含或张力（→ 裁决：清单各项分别对应 A1.36、A1.52、A2.43、A2.44，本条价值在成套审查；合并阶段保留为审查清单，不新增独立规范句）

### A2.52 · 链接指向与历史引用
- 原文：`H:docs/AGENTS.md:76`「Use relative Markdown links for current files and tags or PR numbers for historical references. `verify-md-links` checks local targets.」…「rejects actual commit identifiers and disallowed organization URLs in maintained files.」
- 作用：引用当前文件用相对链接、引用历史用版本标签或变更编号，并禁止在维护文件里出现具体提交标识或不允许的外链。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：临时讨论稿不受此限）
- 通用化改法：引用当前文件用相对链接、引用历史用标签或变更编号，不写具体提交标识。
- 重复：无重复

### A2.53 · 新记录触发取代检查
- 原文：`H:.agents/notes/AGENTS.md:5`「**Every new Agent Note triggers a supersession check.** Search the active tree for older notes covering the same decision or mechanism」
- 作用：新增决策记录前先搜同主题的旧记录，判定完整或部分取代，并在同一次改动里归档被完整取代者。
- 是否推荐：⚠️ 条件推荐（条件：项目用决策记录并与归档机制配套）
- 使用场景：`docs`（边界：无决策记录机制时不适用）
- 通用化改法：新增决策记录前先搜同主题旧记录，判定取代关系，并在同一次改动内归档被完整取代者。
- 重复：包含或张力（→ 裁决：A1.40 管"何时写记录与归档后冻结"，本条管"新记录要触发取代检查"；互补，合并成决策记录生命周期一章）

### A2.54 · 归档即冻结
- 原文：`H:.agents/notes/AGENTS.md:7`「Files under [`archived/`](archived/AGENTS.md) are frozen historical snapshots: never edit them or treat them as current authority.」
- 作用：归档后的记录是冻结的历史快照，不可编辑也不能当作当前权威，防住用过期结论指导现状。
- 是否推荐：⚠️ 条件推荐（条件：项目有归档机制）
- 使用场景：`docs`（边界：无归档机制时不适用）
- 通用化改法：不单列规范句；含义并入 A1.40。
- 重复：同义（→ 并入 A1.40）

### A2.55 · 归档只允许列举的动作
- 原文：`H:.agents/notes/archived/AGENTS.md:3`「Never edit, reformat, translate, repair, delete, or move a sealed artifact」
- 作用：封存产物不可修改；归档时允许的动作被穷举（搬完整三件套、写归档日期、重录校验、修入链），超出即违规。
- 是否推荐：⚠️ 条件推荐（条件：项目有封存历史产物的机制）
- 使用场景：`docs`（边界：无封存机制时不适用）
- 通用化改法：封存产物不可修改，归档时允许的动作被穷举并可校验。
- 重复：包含或张力（→ 裁决：A1.40 管"冻结"这一原则，本条穷举归档期允许的动作；互补，合并成"冻结 + 允许动作清单"）

### A2.56 · 封存由校验强制
- 原文：`H:.agents/notes/archived/AGENTS.md:7`「The normal verifier rejects changed or missing sealed artifacts, incomplete triplets, unknown kind folders, and invalid archive metadata.」
- 作用：封存内容的完整性（哈希、成对完整性、类目、元数据）由校验脚本强制，任何改动都失败。
- 是否推荐：⚠️ 条件推荐（条件：有封存机制并用脚本校验）
- 使用场景：`docs`（边界：无校验脚本时退化为人工约定）
- 通用化改法：封存内容的完整性与元数据由校验强制，任何变更都判失败。
- 重复：包含或张力（→ 裁决：本条是 A2.55 的机械强制面，A2.55 是规则面；合并成"冻结规则 + 校验"一条）

### A2.57 · 事实原地改写
- 原文：`H:.agents/notes/implemented/AGENTS.md:7`「Keep paths, symbols, defaults, and mechanisms current in the same change that alters them. Rewrite stale facts in place; do not append change history.」
- 作用：已实现的决策记录随代码同步更新，过时事实在原地改写而不是追加变更历史。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：决策本身的反转走 A2.58）
- 通用化改法：已实现的记录随代码同步更新，过时事实在原地改写，不追加变更历史。
- 重复：包含或张力（→ 裁决：A2.44 是"只写当前状态"的总则，本条是它在决策记录上的实例；合并阶段本条并入 A2.44 的实例）

### A2.58 · 决策反转要新记录
- 原文：`H:.agents/notes/implemented/AGENTS.md:13`「A reversal of the decision or its rationale requires a new Agent Note and cross-link」
- 作用：推翻既有决策或其理由要写新记录并交叉链接，不悄悄改写旧记录，保留决策演化路径。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：仅事实漂移走 A2.57 的原地改写）
- 通用化改法：推翻既有决策要写新记录并交叉链接，不悄悄改写旧记录。
- 重复：包含或张力（→ 裁决：A2.57 管事实更新、本条管决策反转；两条合起来才是完整边界，都保留）

### A2.59 · 平台检查用真实平台
- 原文：`H:.github/AGENTS.md:3`「Run jobs on Windows runners (`windows-*` labels) under native `pwsh`.」；同段规定 `ci.yml` 只在 PR 上跑、master-only 检查留在 `ci-master.yml`。
- 作用：平台相关检查在目标平台的真实运行器与真实 shell 上跑，不用兼容层替代。
- 是否推荐：❌ 不推荐（理由：条目主体是某持续集成服务的运行器标签与工作流分工，属仓库约定；可提取内核"平台检查要在真实平台跑"更弱且无法由本条验收）
- 使用场景：`gates`（边界：无）
- 通用化改法：不单列规范句（❌，无法通用化）。
- 重复：无重复

### A2.60 · 场景从真实入口启动
- 原文：`H:apps/cli/tests/profiles/AGENTS.md:3`「Start product scenarios through `apps/cli/src/bin.ts` with `--profile <name>` or the `<name>` shorthand; a test-only Loader driver is allowed only when the public profile output cannot expose the asserted internal evidence.」
- 作用：端到端场景从真实入口与出厂装配启动；只有公开输出拿不到所需证据时才允许测试专用驱动。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无真实入口的库用其公开 API 作为入口）
- 通用化改法：端到端场景从真实入口启动；只有在公开输出取不到所需证据时才允许测试专用驱动。
- 重复：包含或张力（→ 裁决：A2.03 管"可见面要真实装配测试"，本条管"从真实入口启动"；合并成"真实入口 + 真实装配"一条）

### A2.61 · 性能预算不可被环境覆盖
- 原文：`H:benchmarks/AGENTS.md:12`「Enforce reviewed source constants; environment variables must not override performance budgets.」
- 作用：性能预算取自受审查的源码常量，环境变量不得覆盖，防住用环境开关把门禁调绿。
- 是否推荐：⚠️ 条件推荐（条件：项目设性能预算或规模门禁）
- 使用场景：`gates`（边界：无性能预算不触发）
- 通用化改法：性能预算取自受审查的源码常量，环境变量不得覆盖。
- 重复：包含或张力（→ 裁决：与 A2.62 同属基准纪律：本条管预算来源，A2.62 管输入来源；合并阶段同章两条）

### A2.62 · 基准输入合成自常量
- 原文：`H:benchmarks/AGENTS.md:9`「Synthesize fixed inputs from reviewed constants. Never use recorded Sessions, user material, ambient repositories, or network services.」
- 作用：基准输入由受审查的常量合成，不使用真实用户数据、环境仓库或网络服务，保证可复现且不泄数据。
- 是否推荐：⚠️ 条件推荐（条件：项目跑性能或规模基准）
- 使用场景：`gates`（边界：无基准不触发）
- 通用化改法：基准输入由受审查的常量合成，不使用真实用户数据、环境仓库或网络服务。
- 重复：包含或张力（→ 裁决：见 A2.61，同章两条）

### A2.63 · 安全组件契约稳定
- 原文：`H:native/system/AGENTS.md:7`「Landlock's argv, exit codes, diagnostics, and fail-closed confinement are defined in [docs/cli-contract.md](docs/cli-contract.md). Do not change them when extending another system capability.」
- 作用：安全边界组件的对外契约（参数、退出码、诊断、失败关闭行为）保持稳定，扩展其他能力时不改。
- 是否推荐：⚠️ 条件推荐（条件：项目发布安全边界组件并声明其对外契约）
- 使用场景：`base`（边界：无此类组件不适用）
- 通用化改法：安全边界组件的对外契约（参数、退出码、诊断、失败关闭）保持稳定，不为其他扩展改动。
- 重复：无重复

### A2.64 · 缺失时失败关闭
- 原文：`H:native/system/AGENTS.md:13`「Missing Landlock binaries probe unusable; missing flock bindings reject acquisition, never silently grant a lock.」
- 作用：关键能力缺失时表现为不可用或直接拒绝，绝不静默放宽到"授予"，把失败方向固定为更安全的一侧。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：能力非安全相关时可选择降级但要显式报告）
- 通用化改法：关键能力缺失时表现为不可用或拒绝，绝不静默放宽权限或状态。
- 重复：包含或张力（→ 裁决：A1.29 是"缺失引用要大声失败"的总则，本条是安全能力上的加严实例（宁可不可用也不放宽）；合并成一条加安全实例）

### A2.65 · 实验状态不降标准
- 原文：`H:packages/experimental/AGENTS.md:8`「Experimental status does not relax engineering, security, documentation, lifecycle, testing, invariant, or snapshot requirements.」
- 作用：实验性状态只影响发布承诺，不降低工程、安全、文档、生命周期与测试要求。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：实验性仅指对外稳定性承诺不同）
- 通用化改法：实验性状态不降低工程、安全、文档与测试要求，只降低对外稳定性承诺。
- 重复：无重复

### A2.66 · 出厂物不依赖实验件
- 原文：`H:packages/experimental/AGENTS.md:7`「Release packages and apps outside this group must not name experimental packages in `dependencies`, `optionalDependencies`, or `peerDependencies`.」；机械面 `H:scripts/verify-default-product-isolation.ts:2`「Keep experimental packages outside default installations, runtime imports, and shipped compositions.」
- 作用：默认安装与发布产物不依赖实验性组件（含传递依赖与出厂装配），并由检查强制。
- 是否推荐：⚠️ 条件推荐（条件：仓库同时维护实验性与稳定发布物）
- 使用场景：`monorepo`（边界：无实验性分组不适用）
- 通用化改法：默认安装与发布产物不依赖实验性组件，包含传递依赖与出厂装配，并由检查强制。
- 重复：无重复

### A2.67 · 非原子写入按序补偿
- 原文：`H:packages/schedule/AGENTS.md:8`「Enqueue with producer kind `schedule`, await Session persistence, then retire or advance the task. These writes are not atomic: a crash between them may duplicate delivery.」
- 作用：承认两步写入非原子、崩溃可能重复投递，用明确的顺序与补偿处理，而不是再加一层执行状态机。
- 是否推荐：⚠️ 条件推荐（条件：系统做任务入队与持久化两步写入）
- 使用场景：`base`（边界：单事务写入不触发）
- 通用化改法：承认两步写入非原子并会在崩溃时重复，用明确顺序与补偿处理，不额外引入状态机。
- 重复：无重复

### A2.68 · 日历规则用本地时区
- 原文：`H:packages/schedule/AGENTS.md:7`「Daily rules retain an explicit time and IANA zone; they are not fixed 86,400-second intervals.」
- 作用：日历型周期规则用显式时刻与时区表达，并按日历语义处理缺失时刻与重复时刻，而不是按固定秒数间隔。
- 是否推荐：⚠️ 条件推荐（条件：系统支持日历型周期任务）
- 使用场景：`base`（边界：纯等间隔轮询不适用）
- 通用化改法：日历型周期规则用显式时刻与时区表达，按日历语义处理缺失与重复时刻。
- 重复：无重复

### A2.69 · 带凭据请求禁跟随重定向
- 原文：`H:packages/web/AGENTS.md:5`「**Reject redirects on credential-bearing provider requests.**」＋「Regression coverage must prove that the redirect target is not contacted」
- 作用：携带凭据的出站请求在跟随重定向之前失败，并用回归测试证明重定向目标未被访问。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：不携带凭据的请求可按需允许重定向）
- 通用化改法：携带凭据的出站请求禁止跟随重定向，并由测试证明重定向目标未被访问。
- 重复：无重复

### A2.70 · 门禁脚本的自身纪律
- 原文：`H:scripts/AGENTS.md:3`「Gate scripts invoke pnpm shell-free, normalize repository-relative glob paths to `/` at ingestion」＋「Source-ownership gates use syntax-aware discovery, guard against an empty or narrowed corpus」
- 作用：门禁脚本不走 shell、路径归一、平台适配留在需要它的门禁内；源码归属类门禁必须语法感知、防止空语料、并测试每个改变检测边界的形态。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：一次性脚本不受此限）
- 通用化改法：门禁脚本不经 shell、路径归一、平台适配就地；源码扫描类门禁必须语法感知、防空语料并测试边界形态。
- 重复：无重复

### A2.71 · 脚本测试并发正确
- 原文：`H:scripts/AGENTS.md:5`「Script specs run in forked workers beside the rest of the suite」＋「A spec that passes only when it runs alone is a defect in the spec」
- 作用：脚本的测试同样在并发下运行，且必须自己拥有端口、临时路径与子进程；只有单独跑才过算测试缺陷。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：需独占资源的用例应显式声明串行）
- 通用化改法：不单列规范句；含义并入 A2.14。
- 重复：同义（→ 并入 A2.14）

### A2.72 · 不新增测试入口
- 原文：`H:snapshots/AGENTS.md:5`「Every process under test starts through the `dsh` CLI with a shipped profile and optional scenario patches.」＋「do not add another application entrypoint, hidden CLI mode, or executable scenario driver.」
- 作用：被测进程只从真实入口与出厂装配启动，不新增入口、隐藏模式或场景专用可执行驱动。
- 是否推荐：⚠️ 条件推荐（条件：被测对象有真实入口与出厂装配）
- 使用场景：`gates`（边界：无真实入口的库以其公开 API 为入口）
- 通用化改法：被测进程只从真实入口与出厂装配启动，不新增入口或隐藏模式。
- 重复：包含或张力（→ 裁决：A2.60 允许"公开输出取不到证据时"用测试驱动，本条完全禁止新增入口；两条严格度不同，建议采用 A2.60 的条件式并并入本条的"禁止隐藏入口"）

### A2.73 · 录制数据是归一化定点
- 原文：`H:snapshots/AGENTS.md:11`「Committed sessions are normalization fixed points.」＋「Never redact arbitrary user or tool text merely because it resembles an identifier.」
- 作用：提交的录制数据是归一化定点：易变标识与提示词按类型替换为记号，但不因为"看起来像标识符"就删掉任意用户文本。
- 是否推荐：⚠️ 条件推荐（条件：项目提交录制/回放数据作为期望输出）
- 使用场景：`docs`（边界：不提交录制数据不适用）
- 通用化改法：提交的录制数据是归一化定点：易变标识替换为记号，但不因形似标识符就删任意文本。
- 重复：无重复

### A2.74 · 回放只读
- 原文：`H:snapshots/AGENTS.md:17`「`pnpm run test:snapshot` replays without writes.」
- 作用：回放模式只读，不写回期望输出，防住"跑一次就自动改金标"。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：需要更新期望输出时走显式的记录/刷新流程）
- 通用化改法：回放模式只读，不写入期望输出；更新走显式流程。
- 重复：无重复

### A2.75 · 内嵌副本偏离要登记
- 原文：`H:vendor/AGENTS.md:5`「**Do NOT edit `vendor/*/src/` files casually.** Every local divergence from upstream must be logged exhaustively in `vendor/README.md`」
- 作用：内嵌上游副本不随意修改，任何本地偏离都完整登记在同一清单里。
- 是否推荐：⚠️ 条件推荐（条件：仓库内嵌并维护上游源码副本）
- 使用场景：`monorepo`（边界：不内嵌副本不适用）
- 通用化改法：不单列规范句；含义并入 A1.55。
- 重复：同义（→ 并入 A1.55）

### A2.76 · 投影层不存正文
- 原文：`H:website/AGENTS.md:9`「Keep canonical prose and generated catalogs in their owning `docs/` tier」＋「Never add locale, route, API, or copied documentation trees such as `website/zh-CN/`, `website/en/`, or `website/api/`.」
- 作用：文档站点的投影层只放配置与呈现资产，正文与生成目录留在归属层，并有门禁防止复制出第二棵文档树。
- 是否推荐：⚠️ 条件推荐（条件：项目有文档站点或其他投影层）
- 使用场景：`docs`（边界：无投影层不适用）
- 通用化改法：投影层只放配置与呈现资产，正文与生成物留在归属层，并用门禁防止复制第二棵树。
- 重复：包含或张力（→ 裁决：A2.43 是"一个事实一个归属"的总则，本条是投影层的实例；合并阶段并入 A2.43 的实例）

### A2.77 · 生成物不手工改
- 原文：`H:website/AGENTS.md:11`「The projector writes disposable Markdown to the ignored `website/.generated/` directory. Never edit or commit `.generated/`, `.cache/`, or `.dist/`.」
- 作用：生成物与缓存目录不手工编辑、不提交，改源头而不是改产物。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：无生成物不触发）
- 通用化改法：生成物与缓存目录不手工编辑、不提交；要改就改源头。
- 重复：无重复

### A2.78 · 快照夹具不是规则
- 原文：`H:snapshots/session/ptc-workspace-context/workspace/nested/AGENTS.md:1`「When asked for the Code Mode workspace handshake, answer exactly `CODE_MODE_CONTEXT_OK` and nothing else.」；另 3 个夹具各一行：`H:snapshots/session/agent-instructions/workspace/AGENTS.md:1`「Root snapshot instruction.」、`H:snapshots/session/agent-instructions/workspace/nested/AGENTS.md:1`「Nested snapshot instruction.」、`H:snapshots/session/ptc-workspace-context/workspace/AGENTS.md:1`「Workspace snapshot root instruction.」
- 作用：4 个 1 行夹具是快照回放场景的输入数据，作用是让场景能断言"模型收到了哪些指令文件"，不是可复用纪律。
- 是否推荐：❌ 不推荐（理由：夹具内容不是规则；其中唯一像规则的固定握手串是场景断言数据，对使用者的行为无约束）
- 使用场景：`gates`（边界：无）
- 通用化改法：不单列规范句（❌，夹具数据不是规则）。
- 重复：无重复

## A2 块自检（A2.01 … A2.78）

### 覆盖表（A2.01 … A2.78 各一次，缺漏 0）

| 判定 | ID 列表 | 条数 |
|---|---|--:|
| ✅ 推荐 | A2.03, A2.05, A2.07, A2.08, A2.10, A2.11, A2.14, A2.27, A2.28, A2.32, A2.39, A2.40, A2.43, A2.44, A2.45, A2.46, A2.48, A2.49, A2.52, A2.57, A2.58, A2.60, A2.64, A2.65, A2.69, A2.70, A2.71, A2.74, A2.77 | 29 |
| ⚠️ 条件推荐 | A2.01, A2.02, A2.04, A2.06, A2.09, A2.12, A2.13, A2.15, A2.17, A2.18, A2.19, A2.20, A2.21, A2.22, A2.23, A2.24, A2.25, A2.26, A2.29, A2.30, A2.31, A2.33, A2.34, A2.35, A2.36, A2.37, A2.38, A2.41, A2.42, A2.47, A2.51, A2.53, A2.54, A2.55, A2.56, A2.61, A2.62, A2.63, A2.66, A2.67, A2.68, A2.72, A2.73, A2.75, A2.76 | 45 |
| ❌ 不推荐 | A2.16, A2.50, A2.59, A2.78 | 4 |
| 合计 | A2.01 … A2.78 | 78 |

重复分布（A2）：

| 重复判定 | ID 列表 | 条数 |
|---|---|--:|
| 无重复 | A2.01, A2.02, A2.04, A2.05, A2.11, A2.12, A2.14, A2.16, A2.17, A2.18, A2.20, A2.21, A2.22, A2.23, A2.24, A2.25, A2.27, A2.28, A2.32, A2.33, A2.35, A2.37, A2.40, A2.41, A2.44, A2.45, A2.46, A2.52, A2.59, A2.63, A2.65, A2.66, A2.67, A2.68, A2.69, A2.70, A2.73, A2.74, A2.77, A2.78 | 40 |
| 同义（并入） | A2.15, A2.36, A2.39, A2.48, A2.50, A2.54, A2.71, A2.75 | 8 |
| 包含或张力 | A2.03, A2.06, A2.07, A2.08, A2.09, A2.10, A2.13, A2.19, A2.26, A2.29, A2.30, A2.31, A2.34, A2.38, A2.42, A2.43, A2.47, A2.49, A2.51, A2.53, A2.55, A2.56, A2.57, A2.58, A2.60, A2.61, A2.62, A2.64, A2.72, A2.76 | 30 |
| 合计 | A2.01 … A2.78 | 78 |

同义并入落点：→ A1.19（A2.15）、A1.41（A2.36）、A1.10（A2.39）、A1.52（A2.48）、A2.49（A2.50）、A1.40（A2.54）、A2.14（A2.71）、A1.55（A2.75）。

### 字段完整性（A2 块）

| 字段 | 行数（应 == 78） |
|---|--:|
| 原文 | 78 |
| 作用 | 78 |
| 是否推荐 | 78 |
| 使用场景 | 78 |
| 通用化改法 | 78 |
| 重复 | 78 |

### 值得收与需裁决（补充，已并入文件头部定稿）

> task-17 定稿时，本节 5 条"最值得收"与 4 条"需裁决"已与 A1 的 8+6 条合并、重排进文件头部的 `### 3` 与 `### 4`；本节保留为 2/3 块的原始判断记录，以头部为准。

**A2 最值得收（5 条，与 A1 的 8 条合计 13 条，task-17 需裁到 8 条以内）：**

1. **A2.10** 约束落在执行者身上 —— P-32 只说"边界要校验"，本条补上"执行者执法、不能用包装或顺序代替"，是安全条款能否成立的关键。
2. **A2.03 + A2.60** 真实装配 + 真实入口 —— 把"集成测试"从形容词变成两条可判动作，正面填补 P/K 的空白。
3. **A2.64** 缺失时失败关闭 —— 把"安全默认"落成"宁可不可用也不放宽"，与 A1.29 组成失败方向的一套。
4. **A2.65** 实验状态不降标准 —— 直接掐掉"标注 experimental 就少写测试"这一最常见的偷工口径。
5. **A2.49** 超限先搬再压最后提额 —— 把"文档太长"从争论变成有顺序的处置，可判且可直接入规则。

**A2 需裁决（4 条）：**

1. **A2.38 vs A1.12**（↔ P-27/P-29 的同类张力）：本条允许"秒级内环随便跑"，A1.12 禁止重复已通过的检查。两难在**成本阈值怎么定**（"可当类型检查用"是否足以开例外）。
2. **A2.72 vs A2.60**：两条都要求真实入口，但 A2.60 允许"公开证据不足时"用测试驱动，A2.72 完全禁止新增入口。两难在**严格度**，建议取条件式。
3. **A2.03 vs P-38/K R28**：本条要求可见面必须有真实装配测试，P/K 只要求"一条最小的可运行检查"。两难在**可见面的验收门槛**（是否所有产品都要装配级测试）。
4. **A2.51 清单与逐条的取舍**：腐烂清单九项基本被 A1.36/A1.52/A2.43/A2.44 逐条覆盖，价值只在"成套审查"。两难在**是否保留清单体**（保留=多一条审查动作，去掉=少一处重复）。

### 自检命令与输出（A2 块）

```bash
# A2 条目数（应为 78）
grep -c '^### A2\.' review/03-deepseek-harness.md
# 六个字段行按 A2 块统计（每项都应为 78；用 awk 限定 A2 段）
for f in 原文 作用 是否推荐 使用场景 通用化改法 重复; do printf '%s ' "$f"; awk '/^## A2 条目/,/^## A2 块自检/' review/03-deepseek-harness.md | grep -c "^- $f：" ; done
# 三类推荐计数（全文口径，A1+A2；A2 单块见覆盖表）
grep -c '^- 是否推荐：✅' review/03-deepseek-harness.md
grep -c '^- 是否推荐：⚠️' review/03-deepseek-harness.md
grep -c '^- 是否推荐：❌' review/03-deepseek-harness.md
# 覆盖唯一性：每个 A2 ID 只出现一次（无输出即通过）
grep -o '^### A2\.[0-9]*' review/03-deepseek-harness.md | sort | uniq -d
# A2 段内的同义/张力计数
awk '/^## A2 条目/,/^## A2 块自检/' review/03-deepseek-harness.md | grep -c '^- 重复：无重复'
awk '/^## A2 条目/,/^## A2 块自检/' review/03-deepseek-harness.md | grep -c '^- 重复：同义'
awk '/^## A2 条目/,/^## A2 块自检/' review/03-deepseek-harness.md | grep -c '^- 重复：包含或张力'
# A2 段的场景标签分布（合计应为 78）
awk '/^## A2 条目/,/^## A2 块自检/' review/03-deepseek-harness.md | grep -o '^- 使用场景：`[a-z-]*`' | sort | uniq -c
# A1 条目未被改动（应仍为 55，且 A1 段行数不变）
grep -c '^### A1\.' review/03-deepseek-harness.md
```

实测输出：

- `grep -c '^### A2\.'` → `78`
- A2 段字段行：`原文 78`／`作用 78`／`是否推荐 78`／`使用场景 78`／`通用化改法 78`／`重复 78`
- 全文三类计数：`✅ 46`／`⚠️ 75`／`❌ 12`（A2 单块 = ✅ 29／⚠️ 45／❌ 4；A1 单块 = 17／30／8）
- `uniq -d` → 无输出（覆盖唯一 ✓）
- A2 段重复：`无重复 40`／`同义 8`／`包含或张力 30`
- A2 段标签：`docs 22`／`gates 16`／`frontend 15`／`base 14`／`monorepo 9`／`runtime-agent 2`（合计 78 ✓）
- `grep -c '^### A1\.'` → `55`（A1 未改动 ✓）

### 与 findings 的冲突

无。A2 段的 ID、`H:` 出处与引文逐条与 `findings/03-deepseek-harness.md` §2 A2 段比对一致；本块只做判断与改写，未重新取证，也未发现需要更正之处。`原文` 字段默认引 findings 的逐字英文引文；当 findings 把某条要求写成中文转述时（A2.03、A2.04、A2.06、A2.28、A2.48 的部分子句），本字段改引该条目 `H:` 指向的**原始源文件**并逐字核对，A2.34 标注为「findings 转述＋引文」。

### A2 原文引文核对（本块自检的补充）

对 A2 的 78 条 `原文` 字段做包含性核对：把每条 `原文` 里的 `「」` 引文按 `…` 分段，逐段与**该引文最近的前置 `H:` 引用所指文件与行范围**做空白归一化后的子串比对（与 findings/03 §8 的核对方法一致）。

```bash
$ python3 - review/03-deepseek-harness.md <<'PY'
# 逐条取 原文 行，用正则同时扫 `H:path:line` 与「引文」，引文与最近前置引用配对；
# 按 … 分段，逐段要求 norm(frag) in norm(citedRange)（长度 <8 的碎片跳过）
PY
A2 原文 fragments checked vs cited source: 109   FAILURES: 0
```

实测：**109 段全部命中、0 FAIL**（其中 5 条 `原文` 有两个及以上 `H:` 引用，配对按"最近前置"规则，与本文行文格式一致）。本轮修正记录：A2.28 的引文原先截断了加粗区间（留下不成对的 `**`），已改为完整逐字句；A2.78 原先把 3 个其余夹具的引文挂在同一个 `H:` 引用下，已为每个夹具补上各自的 `H:` 引用。

---

## A3 + B + C 条目（A3.01 … A3.28、B1 … B8、C1 … C5，3/3 块）

> 范围：`findings/03-deepseek-harness.md` §2 A3 段（`findings/03-deepseek-harness.md:186`–`213`，28 条）、§3 B 段（`findings/03-deepseek-harness.md:223`–`289`，8 条）、§4 C 段（`findings/03-deepseek-harness.md:295`–`337`，5 条），共 41 条。
> 本块性质不同：A3 是技能（SKILL.md）里的流程纪律，B 是机械门禁机制，C 是产品运行时约束。B/C 的 `是否推荐` 判的是"这套机制值不值得自建/借用"；`作用` 写清"它拦什么、在哪变红"。
> `原文` 字段：能取到逐字引文的取逐字引文（`H:` 原始出处），findings 以表格/清单归并、无单句引文的标「转述」并给代表出处。

### A3.01 · 钩子窄、CI 全
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:8`「Git hooks are intentionally narrow: pre-commit fixes staged lint, checks staged whitespace, and guards vendored-source metadata; pre-push runs only the incremental repository typecheck. CI owns exhaustive coverage and the platform matrix.」
- 作用：把本地阻断层与 CI 的分工写成一句话：本地只做秒级、暂存区范围、增量式的检查，穷尽覆盖与平台矩阵归 CI，防住"本地跑全量"和"本地没跑就该拦"两种错误。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无本地钩子机制时，本条的"窄"落在"改动面选检查"上）
- 通用化改法：本地检查只做廉价的暂存区与增量检查，穷尽覆盖与平台矩阵交给持续集成。
- 重复：包含或张力（→ 裁决：A1.12 是给 agent 的"不跑全量"行为要求，本条是"为什么本地层天生窄"的设计依据；合并成一条原则加两层落地）

### A3.02 · 窄检查须会被该回归打红
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:29`「There is no universal local baseline beyond the hooks. Every behavior change needs the narrowest available test or purpose-built check that would fail for its regression」
- 作用：为每个行为改动配一条最窄的、且**会因该回归而失败**的检查，防住"跑了一堆检查但没有一条能抓到这个 bug"。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：无从构造会失败的检查时，说明改动还没定义清楚，先定判据）
- 通用化改法：每个行为改动都配一条最窄的、且会因该回归而失败的检查。
- 重复：包含或张力（→ 裁决：P-38 管"至少留一处可运行检查"，A1.11 管"证据类型匹配改动面"，本条补最关键的"该检查必须会因该回归失败"；三条合并成一条）

### A3.03 · 不复跑已过的检查
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:42`「Do not manually repeat a passing check merely because commit or push follows.」
- 作用：提交或推送在即不构成重跑已通过检查的理由，防住把时间花在重复验证上。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：底层条件变化导致结论失效时才重跑）
- 通用化改法：不单列规范句；含义并入 A1.12。
- 重复：同义（→ 并入 A1.12）

### A3.04 · 选测试 ≠ 限覆盖率范围
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:54`「Test selection and coverage selection are separate. A Vitest file filter chooses which tests run, while the repository configuration otherwise measures every `packages/*/*/src/**/*.ts` file.」
- 作用：说清"选了跑哪些测试"与"覆盖率测哪些文件"是两套配置，防住以为加了文件过滤就等于缩小了覆盖率口径而误报绿。
- 是否推荐：⚠️ 条件推荐（条件：项目同时有测试过滤参数与按文件覆盖率门禁）
- 使用场景：`gates`（边界：无覆盖率门禁时只有"选测试"一层）
- 通用化改法：跑哪些测试与覆盖率测哪些文件是两套口径，改前者不代表后者变化；需要窄覆盖时显式指定范围。
- 重复：无重复

### A3.05 · 不许用放水把检查变绿
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:73`「Do not use `--passWithNoTests`, lower coverage thresholds, or narrow `--coverage.include` merely to hide an uncovered affected file.」
- 作用：点名三种"让检查变绿"的放水手段（放行空测试、降阈值、缩范围），防住把未覆盖的改动藏起来。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：确因被测范围本就不可达时应走显式豁免并给理由，而不是降阈值）
- 通用化改法：不用放行空测试、降低阈值或缩小范围来掩盖未覆盖的改动。
- 重复：包含或张力（→ 裁决：A1.11 与 A3.02 管"选对检查"，本条管"不许用放水把检查变绿"；合并成"选对 + 不许放水"）

### A3.06 · 全量演练的三种许可
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:77`「Run the complete local approximation only when the user explicitly requests it, while diagnosing a CI failure, or when the change spans the repository so broadly that no narrower set is credible.」＋「do not recreate the removed `check:pre-push` aggregate.」
- 作用：把"什么时候允许跑全量"限定为三种情形（用户点名、诊断 CI 失败、改动横跨仓库到无更窄集合可信），并禁止重建已移除的聚合命令。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：属上述三种情形之外时按改动面选检查）
- 通用化改法：不单列规范句；含义并入 A1.12。
- 重复：同义（→ 并入 A1.12）

### A3.07 · 强推必须带租约
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:81`「Raw `--force` is never allowed.」；同句要求用 `--force-with-lease=<branch>:<observed-oid>` 让并发更新中止推送。
- 作用：改写历史只能带租约强推，远端有新提交即中止，防住覆盖他人提交。
- 是否推荐：⚠️ 条件推荐（条件：团队使用改写历史的分支流程）
- 使用场景：`base`（边界：只追加提交的流程不触发）
- 通用化改法：不单列规范句；含义并入 A1.46。
- 重复：同义（→ 并入 A1.46）

### A3.08 · 合并式命令排不进验证
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:87`「`gh stack sync` fetches, cascade-rebases, and pushes as one operation, so it cannot place local validation between rewrite and publication.」
- 作用：指出"抓取→改写→推送"被合成一条命令时无法在其中插入验证，因此必须在它之前要求干净工作树、之后立即补验，防住"命令成功即视为可合并"。
- 是否推荐：⚠️ 条件推荐（条件：使用把改写与发布合并成一步的批处理命令）
- 使用场景：`base`（边界：可逐步执行的流程按常规顺序验证）
- 通用化改法：当一条命令把改写与发布合成一步时，先在它之前确认干净状态、在它之后立即补做验证，命令成功不等于可以交付。
- 重复：包含或张力（→ 裁决：A1.46/A3.07 管强推本身的安全，本条管"合并式命令造成验证空窗"这一顺序约束；合并时同章）

### A3.09 · 绕过钩子要显式同意并披露
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:105`「Bypass a local hook only when the user explicitly asks or agrees, and report exactly what failed and why CI is expected to differ.」
- 作用：绕过本地阻断只在用户明确要求或同意时，且必须报告失败内容与"为什么 CI 会有不同结论"，防住静默绕过。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：不改动本地钩子行为只是修复失败时按常规流程）
- 通用化改法：绕过本地检查只在用户明确同意时，并报告失败内容与预期差异。
- 重复：无重复

### A3.10 · 缺 CI 信号先查状态
- 原文：`H:.agents/skills/dsh-pre-push-checks/SKILL.md:134`「GitHub creates no `pull_request` workflow runs while a PR is `CONFLICTING`/`DIRTY`, so the absent signal is the conflict, not infrastructure.」＋「empty commits, `--allow-empty` pushes, draft/ready toggles, and revert-and-restore bounces all leave `total_count` at zero and add junk history.」
- 作用：持续集成完全没有产生运行时，先查合并冲突之类的状态性原因；禁止用空提交、开关草稿状态等"制造噪音"的手段去重触发。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：平台确实漏事件时才走平台的排查路径）
- 通用化改法：检查完全没触发时先查状态性原因（如合并冲突），不用空提交或状态开关制造噪音。
- 重复：无重复

### A3.11 · 留契约、删推理
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:8`「Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration.」＋「It is guidance, not a script.」
- 作用：写够保住契约所需的内容，然后删掉推理过程、重复与装饰，并声明自己是指导而非脚本。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：证据性记录属契约的一部分，不因"像过程"而删）
- 通用化改法：不单列规范句；含义并入 A1.52。
- 重复：同义（→ 并入 A1.52）

### A3.12 · 术语是检查项不是禁用词
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:10`「Treat `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, and `vocabulary` as terms to check before use, not banned words.」
- 作用：给定一份"用前先检查是否够准"的术语表，并明确它不是禁用词表，防住把用词规则执行成机械替换。
- 是否推荐：⚠️ 条件推荐（条件：项目制定了用词规范时，必须同时给出"按需检查而非禁用"的边界）
- 使用场景：`docs`（边界：确指其技术含义时照常使用该术语）
- 通用化改法：把易含糊的术语列为"用前先检查是否够准"的清单，而不是禁用词表。
- 重复：包含或张力（→ 裁决：A1.52 与 A2.48 要求"用更准的词"，本条澄清"不是禁用词表"；合并时本条作为同一规则的边界说明）

### A3.13 · 审查要求显式范围
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:16`「Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope」
- 作用：审查类任务必须要求调用者给出显式范围；缺失时报告所需输入并停止，不擅自推断成整仓，防住范围蔓延。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：任务已自带范围时不触发）
- 通用化改法：审查类任务要求显式范围；缺失时报告并停止，不擅自扩大范围。
- 重复：包含或张力（→ 裁决：P-49 限定审查的主题（复杂度与冗余），本条要求范围由请求显式给出；合并成"审查的范围与主题都由请求界定"）

### A3.14 · 上游副本不在审查范围
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:22`「Always exclude `vendor/` from discovery, review, and edits, even when the requested scope is the whole repository. Do not follow a symlink into it.」
- 作用：内嵌的上游副本默认排除在发现、审查与改写之外（即使范围是整仓，也不顺着链接进去），防住把上游代码当成本仓代码改。
- 是否推荐：⚠️ 条件推荐（条件：仓库内嵌上游源码副本）
- 使用场景：`agent-cfg`（边界：明确要升级该副本时走同步流程）
- 通用化改法：内嵌的上游副本默认排除在审查与改写之外，即使范围为整仓，也不跟随链接进入。
- 重复：包含或张力（→ 裁决：A1.55/A2.75 管"改内嵌副本要登记"，本条管"审查默认排除它"；同属内嵌副本一章）

### A3.15 · 归档产物不在审查范围
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:24`「Also exclude `.agents/notes/archived/` from prose review and edits.」
- 作用：封存的历史产物同样排除在文本审查与改写之外。
- 是否推荐：⚠️ 条件推荐（条件：项目有封存的归档产物）
- 使用场景：`agent-cfg`（边界：为理解一处历史引用可以只读查看，但不改写）
- 通用化改法：不单列规范句；含义并入 A1.40。
- 重复：同义（→ 并入 A1.40）

### A3.16 · 精简不许丢事实
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:38`「Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement.」
- 作用：删形容词、重复与叙述的前提是每个事实子句都存活且更清楚；字数变少本身不算改进，防住以"精简"为名删掉契约事实。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：完全无事实的段落可以直接删）
- 通用化改法：只有在每个事实子句都保留且表达更清楚时才精简；字数变少本身不是改进。
- 重复：包含或张力（→ 裁决：A1.52 管写什么（完整契约），本条管删的时候不许丢事实；合并成"完整契约 + 安全精简"）

### A3.17 · 技能要声明护栏与范围
- 原文：`H:.agents/skills/dsh-prose-standard/SKILL.md:56`「**Skills and agent instructions:** state behavioral guardrails and explicit scope limitations such as “guidance, not a script/checklist.”」
- 作用：写给 agent 的指令必须声明行为护栏与显式范围限制（如"是指导，不是脚本/清单"），防住模型把指导当强制性检查清单执行。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：纯机械脚本不需要该声明）
- 通用化改法：写给 agent 的指令要声明行为护栏与范围限制，并说明它是指导还是强制清单。
- 重复：包含或张力（→ 裁决：本条是总则，A3.18/A3.19/A3.23 是各技能里的实例；合并成一条总则加实例）

### A3.18 · 审查优先级：正确性先于风格
- 原文：`H:.agents/skills/dsh-code-review/SKILL.md:8`「**This skill is guidance, not a complete checklist.**」＋「Prioritize correctness, lifecycle, security, and broken required behavior over style; a short review with one substantiated blocker is better than a list of nits.」
- 作用：审查按正确性、生命周期、安全、被破坏的必需行为排序，风格靠后；一条有实据的阻断项胜过一长串琐碎意见。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：纯风格检查任务不适用）
- 通用化改法：审查优先报正确性、生命周期与安全类问题，一条有实据的阻断项胜过一串琐碎意见。
- 重复：包含或张力（→ 裁决：A3.17 管"声明为指导"，本条补优先级；P-49 管审查主题限于复杂度与冗余，与本条关注点互补）

### A3.19 · 指导覆盖机器判不了的部分
- 原文：`H:.agents/skills/dsh-client-ui-ux/SKILL.md:8`「This skill is guidance, not a complete checklist. It covers judgment calls that lint, typecheck, and the i18n gate cannot make」
- 作用：把人工指导的价值定位在"自动检查做不到的判断"上，防住指导与门禁重复、或反过来漏掉判断类问题。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：能被门禁覆盖的内容应写进门禁而不是指导）
- 通用化改法：人工指导只承载自动检查覆盖不到的判断，不与门禁重复。
- 重复：包含或张力（→ 裁决：A3.17 是"声明为指导"的总则，本条补"覆盖范围 = 机器检查之外"的边界；合并成一条）

### A3.20 · 测试须在真实 CI 拓扑下成立
- 原文：`H:.agents/skills/dsh-ci-test-reliability/SKILL.md:8`「Build tests that remain correct under the repository's real CI topology, not only when run alone on a quiet workstation.」
- 作用：测试要按真实的并发与共享资源拓扑来写，而不是只在安静的本地独跑时成立。
- 是否推荐：✅ 推荐
- 使用场景：`gates`（边界：需独占外部资源的用例应显式声明串行与清理）
- 通用化改法：不单列规范句；含义并入 A2.14。
- 重复：同义（→ 并入 A2.14）

### A3.21 · 先重写事实再删叙述
- 原文：`H:.agents/skills/dsh-trim-cot-leakage/SKILL.md:8`「The fix is never deletion alone when a passage carries factual clauses — restate each so it stands at HEAD, then delete the transcript around it」
- 作用：给定可执行的删减步骤——先把段落里的事实改写成不依赖上下文的陈述，再删掉周围的叙述，防住"删掉了事实只剩结论"。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：完全没有事实子句的段落（审计编码、控制流叙述）可直接删）
- 通用化改法：删减含事实的段落时，先把每个事实改写成独立成立的陈述，再删掉其余叙述。
- 重复：包含或张力（→ 裁决：A3.16 给判据（事实子句必须存活），本条给步骤（先重写再删）；合并成一条）

### A3.22 · 调查不等于授权实施
- 原文：`H:.agents/skills/dsh-find-simplifications/SKILL.md:8`「Prefer a few well-supported candidates over a count of deletions.」＋「keep the user's scope and distinguish a survey from permission to implement its proposals.」
- 作用：简化提案给少量有实据的候选而不是删除计数；并明确"调查/列提案"不构成实施授权，防住审查直接变成改动。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：用户明确要求实施时按授权范围实施）
- 通用化改法：简化提案给少量有实据的候选而非删除计数；调查不构成实施授权。
- 重复：包含或张力（→ 裁决：P-47 管"审查只列不改"，本条管"调查不构成授权"；同一纪律的两种表述，合并成一条）

### A3.23 · 性能以实测真实负载为准
- 原文：`H:.agents/skills/dsh-speed-up-perf/SKILL.md:8`「This is guidance, not a quota or a script: survey broadly, follow measured cost, and reject attractive changes that do not improve the workload users actually run.」
- 作用：性能改进跟随实测成本，拒绝"看起来漂亮但不改善真实负载"的改动；并声明不是配额或脚本。
- 是否推荐：✅ 推荐
- 使用场景：`base`（边界：无实测手段时先建基准，不凭直觉优化）
- 通用化改法：性能改动跟随实测成本，拒绝不改善真实负载的漂亮改动。
- 重复：包含或张力（→ 裁决：A3.17 管"声明为指导"，本条给"以实测真实负载为准"的判据；A2.62 管基准输入合成，三者互补）

### A3.24 · 用平台原生机制而非手工模拟
- 原文：`H:.agents/skills/dsh-merging-stacked-prs/SKILL.md:8`「Land dependent PRs through GitHub's native stack object and `gh stack merge`. Do not reproduce stack semantics by merging and retargeting individual PRs」
- 作用：平台已提供依赖变更链的原生机制时用它，不靠手工合并与改基去模拟该语义，防住自己维护一套易错的顺序与状态。
- 是否推荐：⚠️ 条件推荐（条件：所用平台提供依赖/堆叠变更的原生机制）
- 使用场景：`base`（边界：平台无该机制时用手工流程并显式记录顺序）
- 通用化改法：平台提供依赖链或批处理的原生机制时用它，不手工模拟该语义。
- 重复：无重复

### A3.25 · 可见界面改动附真实运行演示
- 原文：`H:.agents/skills/record-browser-gif/SKILL.md:3`「for every pull request that changes product-user-visible GUI behavior, which MUST include a GIF recorded from the pull request's real server and model flow.」
- 作用：改变用户可见界面的改动必须附一段从真实服务与真实模型流程录制的演示，防住用截图或本地假数据充当证据。
- 是否推荐：⚠️ 条件推荐（条件：产品有用户可见界面并走变更评审）
- 使用场景：`gates`（边界：纯后端或不可录制环境改用等价的可复现证据）
- 通用化改法：用户可见界面的改动附上从真实运行环境录制的演示。
- 重复：包含或张力（→ 裁决：A2.03 管自动化测试必须真实装配，本条管人工可见的演示证据；同属"可见面要真实证据"）

### A3.26 · 归档判据是语义不是计数
- 原文：`H:.agents/skills/dsh-archive-agent-notes/SKILL.md:8`「Reduce the active decision corpus without erasing history that can still guide work. Judge every note semantically; word count and age are discovery aids, never archive criteria.」
- 作用：归档决定按语义判断（是否还能指导工作），字数与年龄只用于发现线索、绝不当判据，防住用机械代理误删仍有效的记录。
- 是否推荐：✅ 推荐
- 使用场景：`docs`（边界：无决策记录归档机制时不适用）
- 通用化改法：归档决定按语义判断，字数与年龄只能用于发现线索，不能作为判据。
- 重复：包含或张力（→ 裁决：A1.40/A2.53 管何时写与冻结，本条管"判据必须是语义而非机械代理"；合并成决策记录生命周期一章）

### A3.27 · 批量改写类技能仅用户可触发
- 原文：`H:.agents/skills/dsh-translate-docs/SKILL.md:4`（唯一声明 `disable-model-invocation: true` ＋ `user-invocable: true` 的技能）；同源仓库级约束 `H:docs/AGENTS.md:44`「`dsh-translate-docs` remains user-invoked」。技能元数据由 `H:scripts/verify-skill-invocation-metadata.ts:2`「Keep Claude Code and Codex invocation metadata aligned for repository skills.」对齐。
- 作用：会大范围改写产物的批量工作流标为只由用户显式触发，不由模型自行启动，防住模型顺手重写整批文档。
- 是否推荐：✅ 推荐
- 使用场景：`agent-cfg`（边界：范围小且可逐条复核的改写技能可由模型触发）
- 通用化改法：会大范围改写产物的批量工作流只由用户显式触发，不由模型自行启动。
- 重复：包含或张力（→ 裁决：P-45 管"报告类默认只读、要写入先征得同意"，本条管"批量改写类技能默认不由模型触发"；合并成"写入与批量改写默认需显式授权"）

### A3.28 · 技能入口由指针声明
- 原文：`H:.agents/skills/dsh-doc/SKILL.md:1`；入口约定在 `H:docs/AGENTS.md:3`「Use [dsh-doc](../.agents/skills/dsh-doc/SKILL.md) for placement and validation」（findings 转述＋引文）
- 作用：技能本体只声明名称与描述，触发条件与入口写在指令文件的指针里，防住技能自我推销式地扩张触发面。
- 是否推荐：⚠️ 条件推荐（条件：项目同时维护技能与指向它们的指令文件）
- 使用场景：`agent-cfg`（边界：无指令文件的独立技能只能靠描述自我声明）
- 通用化改法：技能本体只声明名称与描述，触发条件与入口由指令文件的指针声明。
- 重复：无重复

### B1 · 窄门禁族按产物分类
- 原文：转述（findings §3 B1 的主题归并表）＋代表出处 `H:scripts/AGENTS.md:3`「Gate scripts invoke pnpm shell-free, normalize repository-relative glob paths to `/` at ingestion」
- 作用：把各产物类别的纪律拆成一组各管一类的窄脚本（文档结构、双语配对、依赖区段、包 README 契约、不变量、客户端图、实验隔离、词表等），每个脚本只拦它那一类，红在哪、拦什么一眼可定位。实测 68 个顶层 `verify-*.ts`（其中 27 个 `*.spec.ts`、41 个被测脚本），另 274 个 `scripts/` 顶层跟踪文件。
- 是否推荐：✅ 推荐（机制值得自建：单点巨型和一刀切 lint 都定位不了问题，窄门禁族既好写又好定位）
- 使用场景：`gates`（边界：小项目不需要 16 个主题，按实际产物类别取子集）
- 通用化改法：按产物类别拆成一组各管一类的窄门禁，每个门禁只为它那一类失败并指名位置。
- 重复：包含或张力（→ 裁决：A2.70 管单个门禁脚本的质量（不经 shell、防空语料、测边界），本条管"按类别拆成一组窄门禁"的结构；合并成"窄门禁族 + 自身纪律"）

### B2 · 派生物生成器 + 只读校验
- 原文：转述（findings §3 B2）＋代表出处 `H:packages/core/session/src/known-event-types.ts:2`「GENERATED by `scripts/gen-persistence-catalog.ts` — do not edit by hand」
- 作用：目录/图/词表/通知这类派生物由生成器产出，同一入口带 `--check` 只校验不写盘，于是 CI 能发现"源改了但派生物没重生成"；共 18 个入口（`gen-*`/`persistence-changes`/`rescope-vendor` 等）。红在 CI 的 static/doc-sync 门禁。
- 是否推荐：✅ 推荐（机制值得自建或借用：这是消灭"文档/目录与源码不同步"最省的一条）
- 使用场景：`gates`（边界：手写产物不宜生成时用结构校验替代）
- 通用化改法：派生物由生成器产出，并提供只读校验模式让"源改了但派生物没重生成"在门禁处失败。
- 重复：无重复

### B3 · 本地阻断层只做廉价检查
- 原文：转述（findings §3 B3）＋`H:lefthook.yml:1`「Keep these local checkpoints fast; CI owns the full」＋`H:lefthook.yml:3`「# Install: `node scripts/install-lefthook.mjs` (runs automatically via postinstall).」
- 作用：9 个本地 job 分成三段——pre-commit 6 个（双语配对、归档封印、暂存区 lint 自动修复、第三方通知重生成、空白、内嵌清单守卫）、pre-merge-commit 2 个、pre-push 1 个（增量类型检查）；把明显错误挡在提交前，同时承认它可被绕过、且依赖安装步骤。
- 是否推荐：⚠️ 条件推荐（条件：多人协作且能保证钩子被安装；无法保证时把同等检查移入 CI）
- 使用场景：`gates`（边界：单人仓库或无法强制安装时只保留 CI 层）
- 通用化改法：本地钩子只做秒级的暂存区检查与增量检查，且不假设它一定被执行——同等检查在持续集成里有兜底。
- 重复：包含或张力（→ 裁决：A3.01 陈述"钩子窄、CI 全"的原则，本条是它的落地清单与代价说明；合并成一条原则加落地）

### B4 · 词数预算 ratchet
- 原文：`H:scripts/verify-doc-budgets.ts:3`「Missing files and invalid ceilings fail; `--list` reports current usage.」＋`H:scripts/verify-doc-budgets.ts:4-5`「Only listed standing docs are budgeted. Ceilings ratchet down with at least 5% headroom; raising one requires the justification defined in」
- 作用：只给清单内的常驻文档设词数上限，缺文件与非法上限都失败；上限按"至少保留 5% 余量"向下棘轮，提额必须在变更说明里给理由。8 个条目，`wc -w` 语义。
- 是否推荐：✅ 推荐（机制值得自建：把"文档太长"从争论变成可执行数字，且 ratchet 只向下）
- 使用场景：`docs`（边界：一次性文档与决策记录不进清单）
- 通用化改法：只给清单内的常驻文档设内容上限，缺文件与非法上限都失败；上限向下棘轮，提额必须写明理由。
- 重复：包含或张力（→ 裁决：A2.49 是规则（先搬再压最后提额），本条是它的 manifest 机制；合并成一条加机制）

### B5 · 按文件满额覆盖率门禁
- 原文：`H:vitest.config.ts:365`「perFile: true」＋`H:vitest.config.ts:359`「Per-file so a well-covered big file can't subsidize a bare one.」＋`H:docs/testing.md:10`「per-file 100% on `packages/*/*/src`」
- 作用：对受测源码按文件要求行/分支/函数/语句全绿，任何一行的缺口都由全仓汇总不了的大文件"补贴"，不可达分支需带真实理由的豁免注释；实测豁免清单逐条手写（`H:vitest.config.ts:212` 起）。
- 是否推荐：⚠️ 条件推荐（条件：团队接受按文件满额覆盖与逐条维护豁免清单的成本；它同时把"未覆盖的行"当作"可能是死代码"的信号）
- 使用场景：`gates`（边界：探索性原型、生成代码与 UI 展示层宜先豁免再逐步纳入）
- 通用化改法：覆盖率按文件而不按全仓平均判定，未覆盖的行优先当作可疑代码处理；豁免逐条写明理由。
- 重复：包含或张力（→ 裁决：A2.37 是规则（排除必须带理由），本条是门禁机制（按文件满额）；合并成一条）

### B6 · 跳过即失败
- 原文：`H:scripts/run-gates.ts:121`「return results.some(result => result.gate.allowFailure !== true && (result.status === 'failed' || result.status === 'skipped'))」
- 作用：把"跳过"与"失败"等价处理——只有显式标为允许失败的门禁才能被跳过而不影响退出码；依赖塌陷导致的跳过同样计失败；汇总行会打印 passed/failed/skipped，并给非阻断项加前缀以免误读。
- 是否推荐：✅ 推荐（机制值得借用：CI 里最大的假绿来源就是"没跑等于通过"）
- 使用场景：`gates`（边界：确实允许失败的门禁要显式标注，并让它出现在汇总里）
- 通用化改法：门禁的"跳过"与"失败"等价处理，只有显式标注允许失败的项才能被跳过而不影响结果。
- 重复：无重复

### B7 · PR 门禁与主干矩阵分离
- 原文：`H:.github/AGENTS.md:3`（findings 转述）＋`H:.github/workflows/ci.yml:726`「run: echo "All needed jobs succeeded (${{ join(needs.*.result, ', ') }})"」
- 作用：PR 只跑阻断所需的工作流（`ci.yml`：726 行、11 个 job，含静态、覆盖率、基准、快照与产物、兼容、Windows 阻断/观测、Python），只在主干跑的平台矩阵拆到另一个工作流（`ci-master.yml` 不监听 PR）；末尾用终局 job 汇总全部依赖，把"全绿"变成一个可引用的单一结论。全仓 20 个工作流。
- 是否推荐：⚠️ 条件推荐（条件：用托管 CI 且需要区分 PR 门禁与主干矩阵）
- 使用场景：`gates`（边界：单一工作流的小项目不需要拆分，但"终局汇总"仍值得保留）
- 通用化改法：PR 只跑阻断必需的门禁，只应在主干跑的矩阵拆到独立工作流，并用一个终局汇总告诉调用方是否全绿。
- 重复：无重复

### B8 · 并发分区与它的代价
- 原文：`H:docs/testing.md:21`「Forked workers run several spec files at once, the coverage gate splits into concurrent partitions beside the other gates in its job, and the self-hosted runners share one host and one volume.」＋「Only the process is isolated: ports, predictable paths, external namespaces, and inherited children are not.」
- 作用：用并发分区把门禁规模做大，同时写明只隔离进程——端口、可预测路径、外部命名空间与子进程都不隔离，因此"单独跑才过"是测试自身的缺陷。
- 是否推荐：⚠️ 条件推荐（条件：门禁规模已大到必须并发分区；并发带来的资源争用由测试自己负责）
- 使用场景：`gates`（边界：小套件用默认并发即可，但"资源自持"的要求不变）
- 通用化改法：用并发分区扩大门禁吞吐时，明确只有进程被隔离，测试必须自己持有端口、路径与子进程。
- 重复：包含或张力（→ 裁决：A2.14 是纪律（测试必须能并发通过），本条是它成立所需的拓扑与代价说明；合并成"并发纪律 + 拓扑说明"）

### C1 · 指令加载链与 1 MiB 单文件上限
- 原文：`H:packages/context/agent-instructions/README.md:32`「The first request includes one durable baseline message with the user-global `$DSH_HOME/AGENTS.md` followed by the project chain — every existing candidate file from the project root down to the session working directory, in broad-to-specific order.」；上限 `H:packages/context/agent-instructions/src/config.ts:14`「const DEFAULT_MAX_SOURCE_BYTES = 1_048_576」＋`H:packages/context/agent-instructions/src/config.ts:25`「Maximum UTF-8 bytes read from one instruction file; larger files are ignored.」
- 作用：产品要从用户工作区加载指令并注入上下文时，它拦的是"上下文被指令文件撑爆"与"帧被仓库文本伪造"两件事——按由宽到窄加载并做内容级去重；单文件超 1 MiB **直接忽略**（不是截断），整份渲染另有必填字节预算（超预算先丢宽的、最后截断最具体的）；注入时降级为建议，并转义文中的帧结束标记。红在：超限文件静默不注入、预算不足时出现"被省略或截断"提示。
- 是否推荐：⚠️ 条件推荐（条件：产品从用户工作区加载指令文件并注入模型上下文——这是 agent 产品的专属机制）
- 使用场景：`runtime-agent`（边界：不注入工作区指令的工具不适用）
- 通用化改法：从工作区加载的指令按由宽到窄合并并去重，单文件与整体各设字节上限，超限行为明确，注入时声明其为建议并防止内容逃出注入帧。
- 重复：无重复

### C2 · 沙箱分档与最窄升级审批
- 原文：`H:packages/sandbox/sandbox/src/escalation.ts:28`「WIDER_MODES」＋`H:packages/sandbox/sandbox/src/escalation.ts:96`「The narrowest wider sandbox mode for a one-shot retry of the exact ${subject} the sandbox just denied; the retry asks the user for approval.」＋`H:packages/sandbox/sandbox/src/escalation.ts:169`「@returns the granted mode, consumed by the one call that asked.」
- 作用：它拦的是"模型为了绕过权限把动作换一种做法"与"一次批准变成长期放权"——权限分档并定义严格更宽的阶梯（只能升不能降、`read-only` 是地板）；升级必须同时给出非空理由与目标档，走审批，且只对**当次调用**生效；无审批通道、无 agent 或结果非"仅允许一次"时全部失败关闭。模型侧只看到固定词汇的拒绝标记与同轮升级提示。
- 是否推荐：⚠️ 条件推荐（条件：产品会代表用户执行模型生成的命令或文件写入，并需要权限分档——只有产品级 agent 才需要自建）
- 使用场景：`runtime-agent`（边界：不执行模型生成动作的产品不适用）
- 通用化改法：权限分档并定义只能单向放宽的升级阶梯；升级必须带非空理由、走人工审批且只对当次动作生效，任何缺省或未获批准的情形都失败关闭。
- 重复：包含或张力（→ 裁决：A1.09 是同一协议在"仓库自身开发"侧的表述，本条是产品侧的实现；两者语义相同、读者不同，合并时作为同一条的两处落地）

### C3 · guard 插件：软提示与硬超时并存
- 原文：`H:packages/guard/repeat-tool-reminder/src/index.ts:2`「Advisory per-agent repeat-call detector. It enriches post-execute decisions」＋`H:packages/guard/timeout-policy/src/index.ts:2`「Cooperative tool-call timeout enforcer. A tool declares `timeoutMs` and」
- 作用：它拦两类不同问题并给出不同强度——重复调用检测只**追加提示**、不否决也不改写调用（措辞分"温和"与"明确"两档，默认阈值 3/5/8，且只截断提示文本不缩减检测）；工具超时则由包装器把自身到期映射成带错误码的失败结果，真正阻断。两者共同点：配置错误一律在加载时抛，绝不静默回退。
- 是否推荐：⚠️ 条件推荐（条件：产品要给模型加软提醒或给工具调用加硬超时——属于产品级 agent 的机制）
- 使用场景：`runtime-agent`（边界：无模型工具调用循环的产品不适用）
- 通用化改法：给模型的提醒类护栏只追加信息、不否决调用；超时与限流类护栏返回带错误码的失败结果；两者都在配置错误时于加载期直接失败。
- 重复：包含或张力（→ 裁决：A1.29 管"配置错误大声失败"，本条在同一机制上分出软提示与硬阻断两类插件；合并成"guard 层设计 + 失败模式"）

### C4 · 持久化格式版本与读端拒收
- 原文：`H:packages/core/session/src/types.ts:503-506`「Absent means required: a reader meeting an unrecognized type without this marker MUST refuse to reconstruct the session instead of silently dropping the event, because an unrecognized required event may change how the rest of the log is interpreted.」＋`H:packages/core/session/src/types.ts:89`「export const SESSION_FORMAT_VERSION = 4」
- 作用：它拦的是"旧运行时读到新日志时静默丢掉不认识的必需记录、从而重建出一个错误的会话"——记录默认**必需**，读端遇到不认识的必需类型必须拒绝加载；只有结构性变更才升格式版本号，新增普通类型靠每条记录上的"可忽略"标记扩展，且该标记只能显式为真；版本常量是唯一手工维护的数字，发布状态另有一份独立记录（预发布也算发布义务）。
- 是否推荐：⚠️ 条件推荐（条件：产品持久化可扩展记录并需要跨版本读取——只有产品级 agent 才需要）
- 使用场景：`runtime-agent`（边界：不持久化结构化记录或不跨版本读取时不适用）
- 通用化改法：持久化记录默认必需，读端遇到不认识的必需项拒绝加载而不是静默跳过；只有结构性变更才升格式版本，普通扩展靠显式标记。
- 重复：包含或张力（→ 裁决：A1.20 是同一规则在仓库侧的表述，本条给出产品机制（生成词表 + 读端拒收 + 版本常量 + 发布记录）；合并成一条加机制）

### C5 · 可见即可重建的运行时断言
- 原文：`H:docs/architecture.md:125`「**Model-visible means logged.** A runtime invariant checks model requests are reconstructable from the log. New model-visible inputs require session events.」＋`H:packages/core/agent-loop/src/invariant.ts:42`（报「(log-reconstruction desync)」）
- 作用：它拦的是"发给模型的内容事后无法复现"——凡进入模型请求的内容必须能从持久化记录重建，新增可见输入必须同时新增记录项；并且这不是文档口号：循环构造的每个请求都被运行时断言检查（请求必须冻结、必须能在日志里找到步骤开始与请求头事件、且消息必须与日志派生结果逐字一致），不一致即失败。38 个包以 `./invariant` companion 形式注册这类断言。
- 是否推荐：⚠️ 条件推荐（条件：产品有模型可见输入并持久化会话——只有产品级 agent 才需要）
- 使用场景：`runtime-agent`（边界：无模型调用或不持久化的产品不适用）
- 通用化改法：凡进入模型请求的内容都必须能从持久化记录重建，新增可见输入必须同时新增记录项，并用运行时断言校验请求与日志派生结果一致。
- 重复：包含或张力（→ 裁决：A1.23 是规则本身，本条是它的运行时断言实现与覆盖边界（含只覆盖循环构造路径的不对称）；合并成"规则 + 断言机制"）

---

## 规范句索引（本文件产生）

> 收录规则：全文件（A1+A2+A3+B+C，共 174 条）中 `是否推荐` 为 ✅/⚠️ 且 `重复` 未标"同义并入"的条目，共 **147** 条。排除的 27 条 = 12 条 ❌ 与 21 条同义并入按**并集**去重后的合计（有 6 条既判 ❌ 又标同义并入，只排除一次：A1.06、A1.07、A1.08、A1.14、A1.37、A2.50）。同义条目只保留在上方条目里的并入引用，此处不重复出现；规范句一律零专名、正面表述、可判"做到没有"。

- A1.01 — 改动某个领域前，先读该领域的权威说明，并按其中的约束动手。
- A1.02 — 改被多处依赖的接口时在同一次改动内更新全部使用点；对外持久化格式只增不改并保留历史世代。
- A1.03 — 改动对外持久化的数据结构时，在同一变更内更新该结构的变更记录。
- A1.04 — 产品只保留一个受支持的启动入口，其余入口一律拒绝并由检查强制。
- A1.05 — 机器可读的清单不在文档里人工复述；文档只给出指向真源的链接，确需复述时标注真源位置。
- A1.09 — 命令因环境限制失败时，先取证再以最小必要权限原样重试；不得靠放宽限制或跳过失败来绕过。
- A1.10 — 推送前按改动面选最小证据并只报告实际运行过的检查；历史被改写后立即重新验证，验证通过前不合并。
- A1.11 — 为每类改动选与之匹配的证据类型，并只跑能证明该改动的检查。
- A1.12 — 不默认跑全量检查，也不重跑已验证过的检查；穷尽覆盖交给持续集成。
- A1.15 — 凭据只从运行环境读取，永不写入仓库；缺少凭据的检查自跳过并报告跳过。
- A1.17 — 配置里引用的外部件必须在依赖清单里声明，并由检查强制。
- A1.18 — 所有注册都走框架的效果注册接口并返回注销句柄，保证可回收。
- A1.19 — 只对独立观测可能分歧的关系发布运行时断言，不发布空断言或存在性断言。
- A1.20 — 读端遇到无法识别的必需记录时拒绝加载而不是静默跳过；只有结构性变更才提升格式版本号。
- A1.21 — 对封闭取值集合穷举分支并以不可达分支收口；对可扩展集合保留一个有文档的默认分支。
- A1.22 — 中间件必须显式委派给下一环；不委派即短路，必须是有意为之。
- A1.23 — 凡进入模型请求的内容都必须能从持久化记录重建；新增可见输入必须同时新增记录项。
- A1.24 — 新行为加在文档化的扩展点上；确需改核心时在同一次改动内更新架构文档。
- A1.25 — 能力接口由定义、实现、使用三方齐备才算完整；只有角色独立演化时才拆分。
- A1.26 — 成熟依赖能净减少自有代码与测试时才引入依赖，否则自己实现。
- A1.27 — 边界处的默认值做成显式的解析步骤，不在执行路径里藏隐式兜底。
- A1.28 — 部署间会变的取值做成经校验的配置项；协议常数、外部规格与安全不变量保持写死。
- A1.29 — 配置错误在能判定的最早时点大声失败，绝不静默跳过缺失的引用。
- A1.30 — 跨边界的不透明标识用带品牌的类型表达，不用裸字符串。
- A1.31 — 只在真正的信任边界做运行期校验，进程内已由类型保证的取值不重复校验。
- A1.32 — 不新增向未知类型的断言；已有的这类断言只减不增并保持基线。
- A1.33 — 静态检查与测试只解析源码平面，构建产物只在显式声明的检查里消费。
- A1.35 — 空捕获块写明错误与原因，且其中只放一条语句。
- A1.36 — 注释只写本地需要的信息；不复述代码、不解释远处行为。
- A1.38 — 平行出现的取值与分支保持对称；不对称必须在原处写明原因。
- A1.39 — 测试描述行为而非对错；行为变更时同步更新其测试并说明原因。
- A1.40 — 只对需要长期留存的决策写决策记录；纯机械改动豁免；已归档的记录冻结不可改。
- A1.41 — 面向用户的文案通过统一的本地化字典与取值入口，源码里不出现硬编码文案。
- A1.42 — 可见输出的改动在同一次改动内更新对应的端到端期望输出。
- A1.43 — 界面呈现从原始事件与持久化结果派生，展示层保持无副作用。
- A1.44 — 规划改动时按改动面枚举所需的测试层级，并把缺失的测试设施纳入同一次改动。
- A1.45 — 同一语义有多个独立投影时，在同一次改动内更新全部投影的期望输出。
- A1.46 — 改写历史时用带租约的强推，远端有新提交即中止；独立改动分开提交并在传播前修源。
- A1.47 — 流程分类字段使用固定的受控集合，每个维度只取一个值。
- A1.48 — 代码里的待办标记只使用受控的少数记号，各自语义固定并写明。
- A1.51 — 每个对外导出都写明其非显然契约，函数级导出写明参数与返回值。
- A1.52 — 注释与文档只写完整契约与上下文，不写推理过程与比喻；可机械检查的不变量必须接入顶层门禁，并证明它能拒绝一个无效样例。
- A1.53 — 改动同时更新受影响的文档与注释；每段落一个物理行；一个事实一个归属；文档设有词数上限。
- A1.54 — 同一内容有多个入口名时只维护一个真源，其余为指向它的链接；确需扩充上限时先压缩再提额并写明理由。
- A1.55 — 内嵌上游副本保持与上游逐一对应并可追溯；任何本地偏离都登记在同一清单，并随改动重跑该副本的验证。
- A2.01 — 一个扩展点只允许一种导出形态，同类扩展保持一致并由检查强制。
- A2.02 — 可选依赖用显式查询读取，简写形式只留给已声明的必需依赖。
- A2.03 — 用户可见的能力必须有经真实装配与真实入口的测试，只替身外部服务，并断言用户可见产物。
- A2.04 — 需要身份或上下文时在编排入口显式恢复并向下捕获，不放宽叶子函数的参数类型来隐藏依赖。
- A2.05 — 一个异步操作只由一个生命周期控制器或事务承载，多余状态要么有独立归属要么合并。
- A2.06 — 服务契约按全部当前消费者设计；只有一个内部调用者的公开方法改为私有实现。
- A2.07 — 每个抽象、状态机、选项与兼容路径都必须绑定当前契约或真实消费者。
- A2.08 — 公开的默认值、操作集与格式都要有当前消费者或既有实践作证；可配置本身不是理由。
- A2.09 — 面向模型的文本只含任务相关概念，不含实现或界面词汇；稳定的可见文本逐字固定并由测试锁定。
- A2.10 — 约束必须在做决定的那一步强制执行，并测试真正的执行者会拒绝被禁止的输入。
- A2.11 — 只在操作成功后发布状态与通知，所有派生视图从同一权威源派生。
- A2.12 — 上限施加在完整产出（含包装与元数据）上，并测试极小值、精确值与单块超限。
- A2.13 — 注册型贡献必须有证明可回收的测试：销毁后观察到注册被移除。
- A2.14 — 测试必须能在并发下通过；只有单独运行才通过的测试算测试本身的缺陷。
- A2.17 — 类型定义文件只放类型声明，不放运行时代码。
- A2.18 — 测试放在包级目录，不内嵌在会被构建或发布的源码目录里。
- A2.19 — 行为改动在同一次提交更新受影响的文档与注释，并让每个单元声明它归属的权威说明页。
- A2.20 — 会改变模型可见行为的组件在文档里用固定小节记录其可见与成本影响。
- A2.21 — 长期缺口与维护约束写在固定的"已知限制"小节里，没有也要显式声明。
- A2.22 — 扩展位的声明与渲染必须匹配，未声明的使用在加载时失败；扩展位命名反映它的组合位置。
- A2.23 — 组件的输入属性由框架派生，不手工重写或局部重复声明派生类型。
- A2.24 — 钩子与选择器只由框架创建，业务代码向组件传普通数据与回调。
- A2.25 — 共享状态只通过声明的作用集改写，状态句柄按作用域创建而非模块级单例。
- A2.26 — 业务组件不自建订阅机制，数据从框架既有的通道取得。
- A2.27 — 扩展包只导出加载协议需要的值，新增导出需要显式批准而不是有消费者即可。
- A2.28 — 同级功能模块不直接引用彼此的实现，跨模块行为走注入的服务或声明的扩展位；做不到就上报。
- A2.29 — 框架上下文只在装配层可见，组件通过派生属性接收数据与回调。
- A2.30 — 业务数据留在数据层，共享状态容器只装查看与交互类状态。
- A2.31 — 展示逻辑不写入持久化记录；但任何新增的模型可见输入仍必须同时新增记录项。
- A2.32 — 自动修复只处理能确定分类的输入，遇到无法分类的拒绝并报出，不猜测。
- A2.33 — 每个产物的静态依赖都落在它自己的输出块内，不依赖运行时不支持的跨块关系。
- A2.34 — 增量折叠只读当前事件，结果必须能按记录序号确定性重放。
- A2.35 — 同一包内的领域目录互不引用，只通过共享契约目录通信，装配点保持唯一。
- A2.37 — 覆盖率门禁下，不可达分支用带真实理由的排除标注，禁止无理由排除。
- A2.38 — 为高频改动提供秒级内环检查，并允许像类型检查一样随时运行。
- A2.40 — 遇到与本改动无关的既有失败，既不顺手修也不忽略，写进交接说明。
- A2.41 — 新增可插拔单元时一次补齐全部必需注册面，并让漏注册尽早失败。
- A2.42 — 新增共享件前先查已有的共享位；同级模块不互相导入实现，共享件从唯一共享位提升。
- A2.43 — 每个事实只在一个归属处完整陈述，其余位置只链接。
- A2.44 — 文档只描述当前状态，历史留在提交与决策记录里。
- A2.45 — 每个段落写成一个物理行，靠编辑器软换行。
- A2.46 — 文档中标注语言的代码块必须能编译，逐字粘贴的声明要与源符号核对。
- A2.47 — 多语言配对文档在同一次改动内同步更新并保持结构对应；整篇翻译由用户显式触发。
- A2.49 — 文档超出上限时先在归属层之间搬迁，再压缩，最后才提额并写明理由。
- A2.51 — 按固定清单审查文档：重复规则、越层历史、状态标注、复述清单、推理过程、段落墙与强调膨胀。
- A2.52 — 引用当前文件用相对链接、引用历史用标签或变更编号，不写具体提交标识。
- A2.53 — 新增决策记录前先搜同主题旧记录，判定取代关系，并在同一次改动内归档被完整取代者。
- A2.55 — 封存产物不可修改，归档时允许的动作被穷举并可校验。
- A2.56 — 封存内容的完整性与元数据由校验强制，任何变更都判失败。
- A2.57 — 已实现的记录随代码同步更新，过时事实在原地改写，不追加变更历史。
- A2.58 — 推翻既有决策要写新记录并交叉链接，不悄悄改写旧记录。
- A2.60 — 端到端场景从真实入口启动；只有在公开输出取不到所需证据时才允许测试专用驱动。
- A2.61 — 性能预算取自受审查的源码常量，环境变量不得覆盖。
- A2.62 — 基准输入由受审查的常量合成，不使用真实用户数据、环境仓库或网络服务。
- A2.63 — 安全边界组件的对外契约（参数、退出码、诊断、失败关闭）保持稳定，不为其他扩展改动。
- A2.64 — 关键能力缺失时表现为不可用或拒绝，绝不静默放宽权限或状态。
- A2.65 — 实验性状态不降低工程、安全、文档与测试要求，只降低对外稳定性承诺。
- A2.66 — 默认安装与发布产物不依赖实验性组件，包含传递依赖与出厂装配，并由检查强制。
- A2.67 — 承认两步写入非原子并会在崩溃时重复，用明确顺序与补偿处理，不额外引入状态机。
- A2.68 — 日历型周期规则用显式时刻与时区表达，按日历语义处理缺失与重复时刻。
- A2.69 — 携带凭据的出站请求禁止跟随重定向，并由测试证明重定向目标未被访问。
- A2.70 — 门禁脚本不经 shell、路径归一、平台适配就地；源码扫描类门禁必须语法感知、防空语料并测试边界形态。
- A2.72 — 被测进程只从真实入口与出厂装配启动，不新增入口或隐藏模式。
- A2.73 — 提交的录制数据是归一化定点：易变标识替换为记号，但不因形似标识符就删任意文本。
- A2.74 — 回放模式只读，不写入期望输出；更新走显式流程。
- A2.76 — 投影层只放配置与呈现资产，正文与生成物留在归属层，并用门禁防止复制第二棵树。
- A2.77 — 生成物与缓存目录不手工编辑、不提交；要改就改源头。
- A3.01 — 本地检查只做廉价的暂存区与增量检查，穷尽覆盖与平台矩阵交给持续集成。
- A3.02 — 每个行为改动都配一条最窄的、且会因该回归而失败的检查。
- A3.04 — 跑哪些测试与覆盖率测哪些文件是两套口径，改前者不代表后者变化；需要窄覆盖时显式指定范围。
- A3.05 — 不用放行空测试、降低阈值或缩小范围来掩盖未覆盖的改动。
- A3.08 — 当一条命令把改写与发布合成一步时，先在它之前确认干净状态、在它之后立即补做验证，命令成功不等于可以交付。
- A3.09 — 绕过本地检查只在用户明确同意时，并报告失败内容与预期差异。
- A3.10 — 检查完全没触发时先查状态性原因（如合并冲突），不用空提交或状态开关制造噪音。
- A3.12 — 把易含糊的术语列为"用前先检查是否够准"的清单，而不是禁用词表。
- A3.13 — 审查类任务要求显式范围；缺失时报告并停止，不擅自扩大范围。
- A3.14 — 内嵌的上游副本默认排除在审查与改写之外，即使范围为整仓，也不跟随链接进入。
- A3.16 — 只有在每个事实子句都保留且表达更清楚时才精简；字数变少本身不是改进。
- A3.17 — 写给 agent 的指令要声明行为护栏与范围限制，并说明它是指导还是强制清单。
- A3.18 — 审查优先报正确性、生命周期与安全类问题，一条有实据的阻断项胜过一串琐碎意见。
- A3.19 — 人工指导只承载自动检查覆盖不到的判断，不与门禁重复。
- A3.21 — 删减含事实的段落时，先把每个事实改写成独立成立的陈述，再删掉其余叙述。
- A3.22 — 简化提案给少量有实据的候选而非删除计数；调查不构成实施授权。
- A3.23 — 性能改动跟随实测成本，拒绝不改善真实负载的漂亮改动。
- A3.24 — 平台提供依赖链或批处理的原生机制时用它，不手工模拟该语义。
- A3.25 — 用户可见界面的改动附上从真实运行环境录制的演示。
- A3.26 — 归档决定按语义判断，字数与年龄只能用于发现线索，不能作为判据。
- A3.27 — 会大范围改写产物的批量工作流只由用户显式触发，不由模型自行启动。
- A3.28 — 技能本体只声明名称与描述，触发条件与入口由指令文件的指针声明。
- B1 — 按产物类别拆成一组各管一类的窄门禁，每个门禁只为它那一类失败并指名位置。
- B2 — 派生物由生成器产出，并提供只读校验模式让"源改了但派生物没重生成"在门禁处失败。
- B3 — 本地钩子只做秒级的暂存区检查与增量检查，且不假设它一定被执行——同等检查在持续集成里有兜底。
- B4 — 只给清单内的常驻文档设内容上限，缺文件与非法上限都失败；上限向下棘轮，提额必须写明理由。
- B5 — 覆盖率按文件而不按全仓平均判定，未覆盖的行优先当作可疑代码处理；豁免逐条写明理由。
- B6 — 门禁的"跳过"与"失败"等价处理，只有显式标注允许失败的项才能被跳过而不影响结果。
- B7 — PR 只跑阻断必需的门禁，只应在主干跑的矩阵拆到独立工作流，并用一个终局汇总告诉调用方是否全绿。
- B8 — 用并发分区扩大门禁吞吐时，明确只有进程被隔离，测试必须自己持有端口、路径与子进程。
- C1 — 从工作区加载的指令按由宽到窄合并并去重，单文件与整体各设字节上限，超限行为明确，注入时声明其为建议并防止内容逃出注入帧。
- C2 — 权限分档并定义只能单向放宽的升级阶梯；升级必须带非空理由、走人工审批且只对当次动作生效，任何缺省或未获批准的情形都失败关闭。
- C3 — 给模型的提醒类护栏只追加信息、不否决调用；超时与限流类护栏返回带错误码的失败结果；两者都在配置错误时于加载期直接失败。
- C4 — 持久化记录默认必需，读端遇到不认识的必需项拒绝加载而不是静默跳过；只有结构性变更才升格式版本，普通扩展靠显式标记。
- C5 — 凡进入模型请求的内容都必须能从持久化记录重建，新增可见输入必须同时新增记录项，并用运行时断言校验请求与日志派生结果一致。

## 3/3 块与全文件自检

### 覆盖表（3/3 块：A3.01 … A3.28 / B1 … B8 / C1 … C5 各一次，缺漏 0）

| 判定 | ID 列表 | 条数 |
|---|---|--:|
| ✅ 推荐 | A3.01, A3.02, A3.03, A3.05, A3.06, A3.09, A3.10, A3.11, A3.13, A3.16, A3.17, A3.18, A3.19, A3.20, A3.21, A3.22, A3.23, A3.26, A3.27, B1, B2, B4, B6 | 23 |
| ⚠️ 条件推荐 | A3.04, A3.07, A3.08, A3.12, A3.14, A3.15, A3.24, A3.25, A3.28, B3, B5, B7, B8, C1, C2, C3, C4, C5 | 18 |
| ❌ 不推荐 | —（本块 41 条全是机制/流程，均可写出成立条件，差别只在条件宽窄） | 0 |
| 合计 | A3.01 … A3.28（28）＋ B1 … B8（8）＋ C1 … C5（5） | 41 |

3/3 块重复分布：

| 重复判定 | ID 列表 | 条数 |
|---|---|--:|
| 无重复 | A3.04, A3.09, A3.10, A3.24, A3.28, B2, B6, B7, C1 | 9 |
| 同义（并入） | A3.03, A3.06, A3.07, A3.11, A3.15, A3.20 | 6 |
| 包含或张力 | A3.01, A3.02, A3.05, A3.08, A3.12, A3.13, A3.14, A3.16, A3.17, A3.18, A3.19, A3.21, A3.22, A3.23, A3.25, A3.26, A3.27, B1, B3, B4, B5, B8, C2, C3, C4, C5 | 26 |

同义并入落点：→ A1.12（A3.03、A3.06）、A1.46（A3.07）、A1.52（A3.11）、A1.40（A3.15）、A2.14（A3.20）。

### 全文件定稿计数（174 条 = A1 55 + A2 78 + A3 28 + B 8 + C 5）

| 判定 | A1 | A2 | A3 | B | C | 合计 |
|---|--:|--:|--:|--:|--:|--:|
| ✅ 推荐 | 17 | 29 | 19 | 4 | 0 | **69** |
| ⚠️ 条件推荐 | 30 | 45 | 9 | 4 | 5 | **93** |
| ❌ 不推荐 | 8 | 4 | 0 | 0 | 0 | **12** |
| 合计 | 55 | 78 | 28 | 8 | 5 | **174** |

重复分布（全文件）：**无重复 82 / 同义 21 / 包含或张力 71**；规范句索引 **147** 条（= 174 − 27，见索引说明）。

### 自检命令与输出

```bash
# 条目数：各层各一次（应 55 / 78 / 28 / 8 / 5，合计 174）
grep -c '^### A1\.' review/03-deepseek-harness.md
grep -c '^### A2\.' review/03-deepseek-harness.md
grep -c '^### A3\.' review/03-deepseek-harness.md
grep -c '^### B[0-9] ·' review/03-deepseek-harness.md
grep -c '^### C[0-9] ·' review/03-deepseek-harness.md
# 全文件五字段完整性（每项都应为 174）
for f in 原文 作用 是否推荐 使用场景 通用化改法 重复; do printf '%s ' "$f"; grep -c "^- $f：" review/03-deepseek-harness.md; done
# 三类推荐合计（应 69 / 93 / 12）
grep -c '^- 是否推荐：✅' review/03-deepseek-harness.md
grep -c '^- 是否推荐：⚠️' review/03-deepseek-harness.md
grep -c '^- 是否推荐：❌' review/03-deepseek-harness.md
# 重复分布（应 82 / 21 / 71）
grep -c '^- 重复：无重复' review/03-deepseek-harness.md
grep -c '^- 重复：同义' review/03-deepseek-harness.md
grep -c '^- 重复：包含或张力' review/03-deepseek-harness.md
# 规范句索引条数（应 147）
awk '/^## 规范句索引（本文件产生）/,/^## 3\/3 块与全文件自检/' review/03-deepseek-harness.md | grep -c '^- [ABC]'
# 覆盖唯一性：所有条目 ID 只出现一次（无输出即通过）
grep -oE '^### (A[123]\.[0-9]+|B[0-9]|C[0-9])' review/03-deepseek-harness.md | sort | uniq -d
# 场景标签分布（合计应为 174）
grep -o '^- 使用场景：`[a-z-]*`' review/03-deepseek-harness.md | sort | uniq -c
```

实测输出：

- 条目数：`A1 55`／`A2 78`／`A3 28`／`B 8`／`C 5`，合计 **174**
- 字段行：`原文 174`／`作用 174`／`是否推荐 174`／`使用场景 174`／`通用化改法 174`／`重复 174`
- 三类合计：`✅ 69`／`⚠️ 93`／`❌ 12`
- 重复分布：`无重复 82`／`同义 21`／`包含或张力 71`
- 规范句索引：`147`
- `uniq -d` → 无输出（174 个 ID 覆盖唯一 ✓）
- 场景标签：`gates 43`／`docs 40`／`base 36`／`monorepo 18`／`frontend 17`／`agent-cfg 10`／`runtime-agent 10`（合计 174 ✓）

### 与 findings 的冲突

无。3/3 块的 ID、`H:` 出处与引文逐条与 `findings/03-deepseek-harness.md` §2 A3 段、§3 B 段、§4 C 段比对一致；B 段与 C 段在 findings 里是主题归并/条目式整理而非单句引文，本块的 `原文` 字段据此标「转述」并给代表 `H:` 出处（`H:` 引用沿用 findings 已核验行号），未重新取证，也未发现需要更正之处。

### 3/3 块原文引文核对（补充自检）

对 A3/B/C 的 41 条 `原文` 字段做包含性核对：把每条 `原文` 里的 `「」` 引文按 `…` 分段，逐段与**该引文最近的前置 `H:` 引用所指文件与行范围**比对，代码文件剥离注释续行前缀（`*`）后做空白归一化子串匹配（与 findings/03 §8 同一方法）。

```bash
$ python3 - review/03-deepseek-harness.md <<'PY'
# 同 A1/A2 的核对脚本；代码文件额外剥离 JSDoc 续行的 "* " 前缀
PY
3/3 block 原文 fragments: 59  FAILURES: 0  (转述 entries: 3)
```

实测：**59 段全部命中、0 FAIL**；41 条里 3 条标「转述」（B1、B2、B3 —— findings 对它们只有主题归并表与零散引文，无单句）其余均逐字核对通过。

### 本文件的口径与边界（定稿说明）

- **范围**：仅 DeepSeek Harness 一个来源（快照 `477b4f42`）的 A/B/C 三层共 174 条；A/B 层的引用前缀 `H:` 与强制形式词表（`prompt-only`/`hook`/`script·gate`/`test·gate`）在 `findings/03-deepseek-harness.md` §0 定义，本文沿用。
- **C 层的独有贡献**：C1–C5（指令加载链与 1 MiB 单文件上限、沙箱分档与最窄升级审批、guard 软/硬两级、持久化格式版本与读端拒收、可见即可重建的运行时断言）在 P（ponytail）与 K（karpathy-skills）两份来源里**没有对应物**——它们不是"教 agent 怎么干活"的 prose，而是"产品如何约束它所运行的 agent"的运行时机制，因此只能判 ⚠️（条件 = 你在做产品级 agent），无法与已有规范句去重，也不进"通用做法"那一类。
- **B 层里最值得借用的通用做法**：B2（派生物生成器 + 只读校验）、B6（跳过即失败）、B4（词数预算 ratchet）、B1（窄门禁族按产物分类）、A2.70（门禁脚本自身纪律）；**只有产品级 agent 才需要自建**的：C1–C5，以及 B5（按文件满额覆盖率，属团队承受力问题）。
- **规范句索引不含同义与 ❌**：索引 147 条 = 推荐条数 162（✅ 69 + ⚠️ 93）− 15 条"既推荐又标同义并入"的条目；另有 6 条同时判 ❌ 且标同义并入（A1.06、A1.07、A1.08、A1.14、A1.37、A2.50），它们已在 ❌ 一侧排除，不重复计入差额。
- 未做的事：未新建 `rules/`、未改 `findings/`、未重新取证任何行号或计数；A1/A2 的条目文字在 3/3 块中保持原样，只有文件头部计数与本文索引为本轮新增。
