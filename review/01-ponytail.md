# 01 · ponytail 规则评审台账（P-01 … P-63）

> 契约：`review/00-schema.md`（条目五字段、推荐判据、场景词表、规范句约定、去重规则、末尾自检）。
> 出处引 `findings/01-ponytail.md` 已核验的 `P:path:line`，不重新取证；本阶段只评价，不落规则。

## 台账头部

### 1 覆盖范围与条目数

- 来源：ponytail 快照 @ `e3ba2aa6`（v4.10.0）；findings：`findings/01-ponytail.md` §2。
- 覆盖：**P-01 … P-63，共 63 条**，与 findings 的 ID 集合一一对齐，缺漏 0、重复 0（自检给命令与输出）。
- 去重范围：本来源内部 63 条互比；磁盘上除 `review/00-schema.md` 外无其它台账，故无跨来源规范句可比（`grep -rln '规范句索引' review/` 仅命中 schema 自身）。
- 场景标签分布：`base` 29、`agent-cfg` 18、`gates` 8、`docs` 6、`frontend` 1、`runtime-agent` 1、`monorepo` 0（合计 63；`monorepo` 在本来源无落点，未强行使用）。

### 2 计数摘要

| 判定 | 条数 |
|---|--:|
| ✅ 推荐 | **35** |
| ⚠️ 条件推荐 | **18** |
| ❌ 不推荐 | **10** |
| 合计 | **63** |

规范句 **45** 条（= 63 − 10 条 ❌ − 8 条可推荐但"并入他条"的条目）。

### 3 最值得收的条目（≤8）

1. **P-17** 命中即停 — 把"少写代码"从口号变成有顺序、可停止的检查动作，是本来源最不可替代的一条。
2. **P-40 + P-41 + P-43** 留痕闭环 — 唯一能防止"临时简化变成永久债"的机制，多数规则集缺这一环。
3. **P-18 + P-26** 先理解、按根因修 — 对"最小 diff 变成第二个 bug"的解药，是简化类规则的必备反向约束。
4. **P-32 … P-38** 护栏 + 单检查底线 — 给"削减"划出不可越过的边界，否则整份规则会被滥用成偷工减料。
5. **P-47 + P-49** 只列不改的审查族 — 审查与修复分离，防止 agent 借审查扩大改动面；范围边界写得很干净。
6. **P-57 + P-58** 副本一致性 gate + 不变量 canary — 把"规则文本一致性"变成机器可判定的事实，是规则集自身的工程化亮点。
7. **P-13 + P-14** 原生能力 / 已装依赖优先 — 直接砍掉最多不必要的依赖与代码量，收益最高且可判。
8. **P-52** 适配器薄原则 — 多宿主分发时唯一能防规则分叉的写法约束。

### 4 需要用户裁决的条目

1. **要不要"档位机制"**（P-02/P-04/P-05/P-06/P-09）：保留"可开关的强度档"让规则集更像产品、增加使用门槛；删掉则失去"先质疑需求"的强度分层。两难在**机制复杂度 vs 表达力**。
2. **负向条款去留**（P-19/P-22/P-23/P-28/P-30）：按本 schema 判据它们多为 no-op 或纯负向；但作为"常见失败样例"对弱模型仍有效。两难在**触发强度 vs 噪声与可判定性**。
3. **输出纪律的默认上限**（P-27 vs P-29）："至多三行"与"用户点名的说明要给全"互相拉扯。两难在**简洁 vs 完整**，需定默认额度。
4. **护栏是否统一进通用层**（P-35 无障碍、P-36 硬件校准）：只在特定项目成立；全部进通用层会稀释"最小实现"的力度。两难在**覆盖面 vs 分层清晰**。
5. **一致性体系要不要通用化**（P-57 … P-60、P-63）：整套校验要求每个项目都建 CI 才算落地，对轻量项目是重负担。两难在**可执行性 vs 落地成本**，需定"要求"还是"可选模板"。
6. **留痕约定是否上升为通用要求**（P-40 … P-45）：闭环依赖"注释标记 + 台账"约定，不使用该约定的项目无落点。两难在**闭环完整 vs 引入新约定**。

## 条目

### P-01 · 懒人定位句
- 原文：`P:AGENTS.md:3`「You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.」
- 作用：给定整套规则的价值观基调，把"少写"与"不粗心"绑定，避免使用者把懒惰读成敷衍。
- 是否推荐：❌ 不推荐（理由：人格定位句无验收条件，属不可判定；其可执行内核已由 P-16 与护栏组承担）
- 使用场景：`agent-cfg`（边界：只作指令文件的定位句，不进可验收条款）
- 通用化改法：不保留规范句；把"省代码"落到 P-16、"不粗心"落到 P-32 … P-38。
- 重复：包含或张力（→ 裁决：不单列，含义并入 P-16 与护栏组 P-32–P-38）

### P-02 · 常驻不漂移
- 原文：`P:skills/ponytail/SKILL.md:28-30`「ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if unsure. … Default: **full**.」
- 作用：防止长会话里规则被逐渐忽略，并消除"不确定就用不用"的犹豫。
- 是否推荐：⚠️ 条件推荐（条件：规则以可开关模式分发、需要跨轮次保持时）
- 使用场景：`agent-cfg`（边界：普通常驻指令文件无常驻语义，不适用）
- 通用化改法：未指定风格时按本文件的默认形式交付，并把不确定点写成一行说明。
- 重复：无重复

### P-03 · 默认档解析
- 原文：`P:skills/ponytail-help/SKILL.md:61`「Resolution: env var > config file > `full`.」
- 作用：定义默认档的三个来源与优先级，避免多处配置互相矛盾。
- 是否推荐：❌ 不推荐（理由：只对某一具体产品的配置解析成立，无通用价值）
- 使用场景：`agent-cfg`（边界：仅产品自身的配置解析）
- 通用化改法：不保留规范句。
- 重复：无重复

### P-04 · 三档强度
- 原文：`P:skills/ponytail/SKILL.md:81-83`「| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. | … | **ultra** | YAGNI extremist. Deletion before addition. … |」
- 作用：把"简化"做成可调强度，用户可按需求在"照做+提示"与"先质疑需求"之间选择。
- 是否推荐：⚠️ 条件推荐（条件：用户明确想要可切换强度时；单档即可满足多数场景）
- 使用场景：`agent-cfg`（边界：无强度切换需求时只用默认档）
- 通用化改法：提供三档强度——照做并一行给出更省替代／强制最小实现／先质疑需求是否成立。
- 重复：无重复

### P-05 · 关闭口令
- 原文：`P:hooks/ponytail-config.js:40-43`「return t === 'stop ponytail' || t === 'normal mode';」
- 作用：给出退出该模式的固定口令，让用户能可靠地收回控制权。
- 是否推荐：❌ 不推荐（理由：口令措辞是产品交互细节，且判断逻辑属实现层）
- 使用场景：`agent-cfg`（边界：仅存在可开关模式时）
- 通用化改法：不保留规范句；"可关闭"这一点由 P-06 的匹配规则覆盖。
- 重复：无重复

### P-06 · 关闭须整句匹配
- 原文：`P:hooks/ponytail-config.js:36-39`「… require the whole message to be the command, ignoring case and trailing punctuation.」
- 作用：防止句中偶然出现关闭短语（如"加个 normal mode 开关"）就把模式误关。
- 是否推荐：⚠️ 条件推荐（条件：规则集提供可被口令触发的模式或技能时）
- 使用场景：`agent-cfg`（边界：无口令开关的规则文件不适用）
- 通用化改法：关闭类口令只在整条消息等于该口令时生效，忽略大小写与尾部标点。
- 重复：无重复

### P-07 · 只管构建
- 原文：`P:skills/ponytail/SKILL.md:116-118`「Ponytail governs what you build, not how you talk (pair with Caveman for terse prose). … Level persists until changed or session end.」
- 作用：把工程约束与表达风格约束拆开，避免两套规则互相越界、彼此加码。
- 是否推荐：⚠️ 条件推荐（条件：多套规则集合并使用时）
- 使用场景：`agent-cfg`（边界：单套规则无须拆分声明）
- 通用化改法：把工程约束与表达风格约束分开，各自独立生效与开关。
- 重复：无重复

### P-08 · 仅编码任务
- 原文：`P:skills/ponytail/SKILL.md:8-15`「Use on ANY coding task: writing, adding, refactoring, fixing, reviewing, or designing code … Do NOT use for non-coding requests (general knowledge, prose, translation, summaries, recipes).」
- 作用：阻止"最小实现"被误用到提问、翻译、写作等场景，那里删减等于答非所问。
- 是否推荐：✅ 推荐（非 no-op：模型会把编码习惯外溢到非编码任务；边界清晰可判）
- 使用场景：`base`（边界：非编码请求退出本规则集）
- 通用化改法：该规则集只用于编码与工程任务；提问、翻译、写作等非编码请求不适用。
- 重复：无重复

### P-09 · 档位落盘
- 原文：`P:hooks/ponytail-mode-tracker.js:55-66`「// `/ponytail default <mode>` persists the default to config (survives restarts).」
- 作用：区分"会话内切换"与"持久默认"，避免用户以为切换会跨会话保留。
- 是否推荐：❌ 不推荐（理由：属具体产品的状态持久化实现，无法通用化）
- 使用场景：`agent-cfg`（边界：仅产品自身的档位持久化）
- 通用化改法：不保留规范句。
- 重复：无重复

### P-10 · 先问要不要
- 原文：`P:AGENTS.md:7`「1. Does this need to be built at all? (YAGNI)」
- 作用：在写任何代码前先否定需求本身，是唯一能省掉全部实现成本的检查。
- 是否推荐：✅ 推荐（非 no-op：模型默认按要求照做；能判"有没有先质疑"）
- 使用场景：`base`（边界：用户已明确否定过该质疑时不再重复）
- 通用化改法：动手前先确认需求是否真的需要存在；投机性需求跳过并一行说明。
- 重复：无重复

### P-11 · 复用已有
- 原文：`P:AGENTS.md:8`「2. Does it already exist in this codebase? Reuse the helper, util, or pattern that's already here, don't re-write it.」
- 作用：防住重复实现，减少同义代码分叉与后续双份维护。
- 是否推荐：✅ 推荐（非 no-op：不检索就重写是常见失败；能判"是否点名复用了既有实现"）
- 使用场景：`base`（边界：既有实现已明显不适用时改选其它梯级）
- 通用化改法：优先复用仓库里已有的实现与模式，不改写既有同类代码。
- 重复：无重复

### P-12 · 标准库优先
- 原文：`P:AGENTS.md:9`「3. Does the standard library already do this? Use it.」
- 作用：把手写代码换成标准库调用，减少自维护面积与边界 bug。
- 是否推荐：✅ 推荐（非 no-op：手写格式化、解析、集合操作仍常见；能判"是否用了标准库"）
- 使用场景：`base`（边界：标准库行为不符合语义要求时降级为自实现并留痕）
- 通用化改法：标准库已有能力时直接用标准库。
- 重复：无重复

### P-13 · 平台原生优先
- 原文：`P:AGENTS.md:10`「4. Does a native platform feature cover it? Use it.」
- 作用：优先使用平台内置能力，避免为已解决的问题引入依赖。
- 是否推荐：✅ 推荐（非 no-op：模型倾向引入组件库；能判"是否用了原生能力"）
- 使用场景：`base`（边界：需要兼容的旧运行环境不支持时改用依赖）
- 通用化改法：平台或运行时已内置的能力优先于引入新的依赖。
- 重复：无重复

### P-14 · 已装依赖优先
- 原文：`P:AGENTS.md:11`「5. Does an already-installed dependency solve it? Use it.」
- 作用：抑制新增依赖，把"能少装一个包"变成默认选择。
- 是否推荐：✅ 推荐（非 no-op：模型习惯性引入新包；能判"是否新增了依赖"）
- 使用场景：`base`（边界：已装依赖明显不适配时再评估新增）
- 通用化改法：已引入的依赖能解决就用它；几行代码能做的功能不新增依赖。
- 重复：无重复

### P-15 · 一行优先
- 原文：`P:AGENTS.md:12`「6. Can this be one line? Make it one line.」
- 作用：在实现已必要时继续压缩表达，缩短阅读与维护成本。
- 是否推荐：⚠️ 条件推荐（条件：逻辑简单且压成一行不牺牲可读性）
- 使用场景：`base`（边界：多副作用的紧凑写法、需要逐步调试时不用）
- 通用化改法：逻辑简单且不损可读时，用一行表达。
- 重复：无重复

### P-16 · 最小实现
- 原文：`P:AGENTS.md:13`「7. Only then: write the minimum code that works.」
- 作用：阶梯的终点条款——前面都不成立时才写，且只写当前需求所需的最小版本。
- 是否推荐：✅ 推荐（非 no-op：模型倾向预留扩展；能判"是否有多余代码"）
- 使用场景：`base`（边界：不影响 P-32 … P-38 的护栏要求）
- 通用化改法：只实现刚好满足当前需求的最小版本，不预留扩展点。
- 重复：无重复

### P-17 · 命中即停
- 原文：`P:AGENTS.md:5`「Before writing any code, stop at the first rung that holds:」
- 作用：给简化一个明确终止条件，避免无限优化，也避免跳过更省的选项。
- 是否推荐：✅ 推荐（非 no-op：模型会停在第一个可行方案而不比较成本；可判"是否按序并在命中处停止"）
- 使用场景：`base`（边界：需求本身未理解清楚时不进入该顺序，见 P-18）
- 通用化改法：按成本从低到高依次检查候选方案，取第一个成立的方案并停止比较。
- 重复：无重复

### P-18 · 先理解再简化
- 原文：`P:AGENTS.md:15`「The ladder runs after you understand the problem, not instead of it: read the task and the code it touches, trace the real flow end to end, then climb.」
- 作用：把"先读再做"钉在简化之前，防止在不了解全貌时做出错误的最小改动。
- 是否推荐：✅ 推荐（非 no-op：模型会对局部症状直接改；能判"是否读了调用方与真实流程"）
- 使用场景：`base`（边界：改动范围可完全由单个函数界定时可缩短阅读，但仍须读该函数）
- 通用化改法：改动前读完涉及的文件并追出真实调用路径，再动手。
- 重复：无重复

### P-19 · 不加未请求抽象
- 原文：`P:AGENTS.md:21`「- No abstractions that weren't explicitly requested.」
- 作用：防住单实现接口、单产品工厂这类无收益的间接层。
- 是否推荐：❌ 不推荐（理由：no-op——主流模型默认不会为单实现造抽象；且纯负向表述，无正面目标）
- 使用场景：`base`（边界：确需扩展点且用户要求时按 P-37 实现）
- 通用化改法：不保留规范句；含义并入 P-21。
- 重复：同义（→ 并入 P-21）

### P-20 · 不留未来骨架
- 原文：`P:AGENTS.md:23`「- No boilerplate nobody asked for.」
- 作用：阻止为"以后可能用到"提前创建目录、配置与样板文件。
- 是否推荐：✅ 推荐（非 no-op：模型常预建结构；能判"是否出现当前无使用点的文件/目录"）
- 使用场景：`base`（边界：项目模板或用户要求的脚手架除外）
- 通用化改法：只创建当前使用点需要的文件与结构，不为未来预留骨架。
- 重复：无重复

### P-21 · 删除优先
- 原文：`P:AGENTS.md:24`「- Deletion over addition. Boring over clever. Fewest files possible.」
- 作用：把默认动作从"新增一层"翻转为"先删再看"，并压低文件数与炫技写法。
- 是否推荐：✅ 推荐（非 no-op：默认是加代码；能判"是否给出删除/收窄方案"）
- 使用场景：`base`（边界：护栏覆盖的行为不因简化而删，见 P-32 … P-38）
- 通用化改法：优先考虑删除或收窄方案，其次才是新增；同一行为用更少的文件与代码行表达。
- 重复：无重复

### P-22 · 最短 diff
- 原文：`P:AGENTS.md:25`「- Shortest working diff wins, but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.」
- 作用：给"最短改动"加前置条件，防止把改动放到错误位置而制造第二个缺陷。
- 是否推荐：❌ 不推荐（理由：被 P-16 与 P-18 完全覆盖且更弱——"最短"弱于"最小可用"，前置条件即 P-18）
- 使用场景：`base`（边界：同 P-18）
- 通用化改法：不保留规范句；含义并入 P-16（最小）与 P-18（先理解）。
- 重复：同义（→ 并入 P-16）

### P-23 · 不新增依赖
- 原文：`P:AGENTS.md:22`「- No new dependency if it can be avoided.」
- 作用：把"能不加包就不加包"写死为默认，减少供应链与维护面积。
- 是否推荐：❌ 不推荐（理由：被 P-14 完全覆盖且更弱——P-14 给了"几行代码能做的"这层判据）
- 使用场景：`base`（边界：同 P-14）
- 通用化改法：不保留规范句；含义并入 P-14。
- 重复：同义（→ 并入 P-14）

### P-24 · 先交付再质疑
- 原文：`P:AGENTS.md:26`「- Question complex requests: "Do you actually need X, or does Y cover it?"」+ `P:skills/ponytail/SKILL.md:62`「Never stall on an answer you can default.」
- 作用：把"质疑需求"和"不停工"绑定，避免用提问代替交付。
- 是否推荐：✅ 推荐（非 no-op：模型遇含糊需求常停在提问；能判"是否同一回复里既交付又说明取舍"）
- 使用场景：`base`（边界：需求缺失会产出错误方向时先问一句再动手）
- 通用化改法：需求含糊时先交付可用的最小版本，并在同一回复里说明取舍，不因等待确认而停工。
- 重复：无重复

### P-25 · 边界正确优先
- 原文：`P:AGENTS.md:27`「- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.」
- 作用：防止把"懒"误读成"用更脆弱的实现"，在体量相同时选正确性更高的方案。
- 是否推荐：✅ 推荐（非 no-op：模型会用更短的粗糙写法；能判"是否处理了边界与异常"）
- 使用场景：`base`（边界：体量差异悬殊时仍按成本择优并留痕）
- 通用化改法：同等成本的两种实现，选边界与异常处理正确的那种。
- 重复：无重复

### P-26 · 修根因
- 原文：`P:AGENTS.md:17`「Bug fix = root cause, not symptom: … Grep every caller of the function you touch and fix the shared function once …」
- 作用：防止只修工单点名的那条路径，留下同级调用者继续出错。
- 是否推荐：✅ 推荐（非 no-op：模型倾向局部修补；能判"是否检查了全部调用点并在共用处修一次"）
- 使用场景：`base`（边界：只影响单一调用点的私有函数可直接就地修）
- 通用化改法：修缺陷时先查该函数或模块的全部调用点，在共用位置改一次。
- 重复：无重复

### P-27 · 结果先行
- 原文：`P:skills/ponytail/SKILL.md:68`「Code first. Then at most three short lines: what was skipped, when to add it.」
- 作用：把回复的默认结构固定为"结果 + 跳过了什么 + 何时补上"，压低无信息量的铺陈。
- 是否推荐：✅ 推荐（非 no-op：模型默认加说明段；能判"是否先给结果、要点是否超三行"）
- 使用场景：`base`（边界：用户点名要报告时按 P-29 完整给出）
- 通用化改法：先给可用结果，再给至多三行要点：跳过了什么、何时需要补上。
- 重复：无重复

### P-28 · 解释不超结果
- 原文：`P:skills/ponytail/SKILL.md:69-71`「No essays, no feature tours, no design notes. If the explanation is longer than the code, delete the explanation …」
- 作用：给出可操作的删减判据——解释长于结果本身就是该删的信号。
- 是否推荐：⚠️ 条件推荐（条件：作为 P-27 的判定尺度使用）
- 使用场景：`base`（边界：用户点名要说明时改按 P-29）
- 通用化改法：不保留规范句；"解释长于结果即删"并入 P-27 作为其判定尺度。
- 重复：包含或张力（→ 裁决：并入 P-27，不单列）

### P-29 · 点名解释给全
- 原文：`P:skills/ponytail/SKILL.md:71-73`「Explanation the user explicitly asked for (a report, a walkthrough, per-phase notes) is not debt, give it in full …」
- 作用：给简洁规则装上限流阀，防止把用户要求的报告、走查也一并砍掉。
- 是否推荐：✅ 推荐（非 no-op：简洁规则容易被过度执行；能判"是否完整回应了点名要求"）
- 使用场景：`base`（边界：仅限用户点名的形式与篇幅，不扩写为未请求的散文）
- 通用化改法：用户明确要求报告、走查或分阶段说明时，按其要求完整给出。
- 重复：无重复

### P-30 · 固定输出模板
- 原文：`P:skills/ponytail/SKILL.md:75`「Pattern: `[code] → skipped: [X], add when [Y].`」
- 作用：给"结果 + 跳过项"一个固定句式，便于人和机器稳定解析。
- 是否推荐：❌ 不推荐（理由：被 P-27 覆盖；模板本身是格式偏好，纳入会僵化其它输出形态）
- 使用场景：`base`（边界：同 P-27）
- 通用化改法：不保留规范句；"说清跳过项与补加时机"已在 P-27。
- 重复：同义（→ 并入 P-27）

### P-31 · 理解不可省
- 原文：`P:skills/ponytail/SKILL.md:97-101`「Never lazy about understanding the problem. The ladder shortens the solution, never the reading.」
- 作用：再次强调简化不覆盖阅读成本，是本来源内部对 P-18 的复述。
- 是否推荐：✅ 推荐（非 no-op，理由同 P-18：问题成立且可判）
- 使用场景：`base`（边界：同 P-18）
- 通用化改法：不保留规范句；含义并入 P-18。
- 重复：同义（→ 并入 P-18）

### P-32 · 校验信任边界
- 原文：`P:skills/ponytail/SKILL.md:92-95`「Never simplify away: input validation at trust boundaries, error handling that prevents data loss, security measures, accessibility basics, anything explicitly requested.」
- 作用：给"少写代码"划第一条硬边界——外部输入一律校验，不因精简而省。
- 是否推荐：✅ 推荐（非 no-op：在最小化压力下模型会砍掉校验；能判"边界输入是否有校验"）
- 使用场景：`base`（边界：纯内部、已由类型系统保证的调用不算信任边界）
- 通用化改法：信任边界的输入一律校验。
- 重复：无重复

### P-33 · 防数据丢失
- 原文：`P:skills/ponytail/SKILL.md:92-95`「… error handling that prevents data loss …」
- 作用：给"少写代码"划第二条硬边界——可能丢数据的路径必须有错误处理。
- 是否推荐：✅ 推荐（非 no-op：省略错误处理正是"最小化"的常见副作用；能判"失败路径是否有处理"）
- 使用场景：`base`（边界：可安全丢弃的临时中间结果不在此列）
- 通用化改法：可能导致数据丢失的路径保留错误处理与恢复手段。
- 重复：无重复

### P-34 · 安全不精简
- 原文：`P:skills/ponytail/SKILL.md:92-95`「… security measures …」
- 作用：给"少写代码"划第三条硬边界——安全措施不参与削减。
- 是否推荐：✅ 推荐（非 no-op：模型会为简洁省略鉴权/转义等步骤；能判"安全处理是否完整"）
- 使用场景：`base`（边界：无安全语境的纯计算脚本不适用）
- 通用化改法：安全相关处理保持完整，不因精简而省略。
- 重复：无重复

### P-35 · 无障碍基础
- 原文：`P:skills/ponytail/SKILL.md:92-95`「… accessibility basics …」
- 作用：给有界面的项目保留最基本的可访问性，不把无障碍当可删的装饰。
- 是否推荐：⚠️ 条件推荐（条件：项目有界面/前端渲染层）
- 使用场景：`frontend`（边界：无用户的脚本、纯后端服务不适用）
- 通用化改法：有界面的项目保留基本无障碍支持：键盘可达、语义标签、足够对比度。
- 重复：无重复

### P-36 · 保留校准
- 原文：`P:skills/ponytail/SKILL.md:103-105`「Hardware is never the ideal on paper: a real clock drifts, a real sensor reads off … Leave the calibration knob …」
- 作用：提醒物理世界与纸面不同，为传感器、时钟类实现保留现场可调参数。
- 是否推荐：⚠️ 条件推荐（条件：项目涉及真实硬件或物理量）
- 使用场景：`base`（边界：纯软件逻辑不适用）
- 通用化改法：涉及物理设备的项目保留现场校准参数与调整入口。
- 重复：无重复

### P-37 · 用户坚持照做
- 原文：`P:skills/ponytail/SKILL.md:92-95`「User insists on the full version → build it, no re-arguing.」
- 作用：给"质疑需求"设终止线，用户坚持后按完整版实现，避免反复争辩消耗。
- 是否推荐：✅ 推荐（非 no-op：模型会重复劝简；能判"坚持后是否照做且不再重复质疑"）
- 使用场景：`base`（边界：与 P-24 互补——质疑一次并交付最小版，坚持后按完整版实现）
- 通用化改法：用户坚持的完整实现按其要求交付，不再重复质疑。
- 重复：包含或张力（→ 裁决：保留本条，与 P-24 分工——P-24 管首次质疑，本条管质疑的终止）

### P-38 · 一处可跑检查
- 原文：`P:skills/ponytail/SKILL.md:107-112`「… leaves ONE runnable check behind … No frameworks, no fixtures … Trivial one-liners need no test …」
- 作用：给"最小实现"配最低验证成本：一处可运行检查，不引入测试框架与夹具。
- 是否推荐：✅ 推荐（非 no-op：模型要么不写检查，要么搭完整测试架子；能判"是否恰有一处可运行检查"）
- 使用场景：`gates`（边界：平凡一行免检；用户要求完整测试套件时按用户要求）
- 通用化改法：非平凡逻辑留下一处可运行的检查：断言式自检或单个小测试文件；平凡一行免检。
- 重复：无重复

### P-39 · 检查不可删
- 原文：`P:skills/ponytail-review/SKILL.md:52-55`「A single smoke test or `assert`-based self-check is the ponytail minimum, not bloat, never flag it for deletion.」
- 作用：防止审查类规则把 P-38 的最低检查当成冗余删掉，使简化失去验证兜底。
- 是否推荐：⚠️ 条件推荐（条件：与审查类条目同时使用时）
- 使用场景：`gates`（边界：仅约束审查结论，不改变 P-38 的标准）
- 通用化改法：不保留规范句；作为 P-38 的审查侧边界并入。
- 重复：包含或张力（→ 裁决：并入 P-38，作为"审查不得判该检查为冗余"的边界）

### P-40 · 简化留痕
- 原文：`P:AGENTS.md:28`「- Mark deliberate simplifications that cut a real corner with a known ceiling … with a `ponytail:` comment naming the ceiling and upgrade path.」
- 作用：把"故意留下的上限"显式记录，使后续判断何时升级有据可依。
- 是否推荐：✅ 推荐（非 no-op：模型默认沉默地简化；能判"是否有该标记并写明上限与升级条件"）
- 使用场景：`docs`（边界：未削减真实能力的普通精简不需要标记）
- 通用化改法：故意削减能力并留下已知上限的实现，写一行注释记录上限与升级触发条件。
- 重复：无重复

### P-41 · 汇总台账
- 原文：`P:skills/ponytail-debt/SKILL.md:20`「`grep -rnE '(#|//) ?ponytail:' .`  (add other comment prefixes if your stack uses them)」
- 作用：把散落的简化标记收成一张可盘点台账，避免"以后再说"变成永远不说。
- 是否推荐：✅ 推荐（非 no-op：模型不会主动盘点历史标记；能判"是否产出完整台账"）
- 使用场景：`docs`（边界：采用该留痕约定的仓库才有可汇总对象）
- 通用化改法：把全仓的这类标记汇总成一张台账，每行给出位置、被简化点、上限与升级触发条件。
- 重复：无重复

### P-42 · 台账行格式
- 原文：`P:skills/ponytail-debt/SKILL.md:29-33`「<file>:<line>, <what was simplified>. ceiling: <the limit named>. upgrade: <the trigger to revisit>.」
- 作用：固定台账每行字段，保证上限与升级条件都能被读到。
- 是否推荐：⚠️ 条件推荐（条件：采用 P-41 台账时）
- 使用场景：`docs`（边界：仅台账呈现形式）
- 通用化改法：不保留规范句；行字段要求已并入 P-41。
- 重复：同义（→ 并入 P-41）

### P-43 · 无触发标注
- 原文：`P:skills/ponytail-debt/SKILL.md:35-36`「… gets a `no-trigger` tag, those are the ones that silently rot.」
- 作用：把"没写升级条件"的标记单独挑出，直接暴露最可能腐烂的那批。
- 是否推荐：✅ 推荐（非 no-op：模型不会区分有无触发条件；能判"是否列出无触发项"）
- 使用场景：`docs`（边界：零标记时输出"干净"结论即可）
- 通用化改法：未写明升级触发条件的标记单独列出，标为会静默腐烂的风险项。
- 重复：无重复

### P-44 · 台账结尾计数
- 原文：`P:skills/ponytail-debt/SKILL.md:38`「End with `<N> markers, <M> with no trigger.` …」
- 作用：用两个数给出台账规模与风险量，便于追踪是否在收敛。
- 是否推荐：⚠️ 条件推荐（条件：台账以报告形式交付时）
- 使用场景：`docs`（边界：仅输出格式）
- 通用化改法：不保留规范句；计数属 P-41 台账的呈现细节。
- 重复：同义（→ 并入 P-41）

### P-45 · 报告只读
- 原文：`P:skills/ponytail-debt/SKILL.md:42-43`「Reads and reports only, changes nothing. To persist it, ask and it writes the ledger to a file …」
- 作用：限定分析类任务默认不动仓库，落盘必须先取得同意。
- 是否推荐：✅ 推荐（非 no-op：模型会把"做分析"顺手做成"改代码"；能判"是否零改动、是否先问再写"）
- 使用场景：`docs`（边界：用户明确要求落盘时按 P-37 执行）
- 通用化改法：报告类任务默认只读；需要写入仓库时先征得同意。
- 重复：无重复

### P-46 · 命令同义载体
- 原文：`P:commands/ponytail-debt.toml:1-2`「Harvest every `ponytail:` comment in this repository into a debt ledger … Report only, change nothing.」
- 作用：同一规则的第二载体（命令形态），保证命令入口与技能行为一致。
- 是否推荐：❌ 不推荐（理由：同一规则的分发副本，不构成独立规则；一致性要求由 P-57 承担）
- 使用场景：`agent-cfg`（边界：仅分发形态）
- 通用化改法：不保留规范句；行为含义已并入 P-41。
- 重复：同义（→ 并入 P-41）

### P-47 · 审查只列不改
- 原文：`P:skills/ponytail-review/SKILL.md:46`「End with the only metric that matters: `net: -<N> lines possible.`」+ `:56`「Does not apply the fixes, only lists them.」
- 作用：把审查与修复分离，只输出可删项与量化收益，防止借审查扩大改动面。
- 是否推荐：✅ 推荐（非 no-op：模型倾向顺手改；能判"是否零改动、是否给出可删量"）
- 使用场景：`gates`（边界：用户要求直接修时另行授权）
- 通用化改法：审查只列出可删项与替换方案、不直接改代码，结尾给出可删行数与可去除依赖数。
- 重复：无重复

### P-48 · 全仓审查
- 原文：`P:skills/ponytail-audit/SKILL.md:12-13`「ponytail-review, repo-wide. Scan the whole tree instead of a diff. Rank findings biggest cut first.」+ `:34`「End with `net: -<N> lines, -<M> deps possible.`」
- 作用：把同一套清单式审查从改动面扩到全仓，并按收益排序。
- 是否推荐：✅ 推荐（非 no-op：默认只审 diff；能判"是否覆盖全仓并按收益排序"）
- 使用场景：`gates`（边界：与 P-47 同族，仅范围不同）
- 通用化改法：不保留规范句；并入 P-47，"全仓范围 + 按收益排序"作为其范围参数。
- 重复：包含或张力（→ 裁决：并入 P-47（同一清单式审查的范围参数），不单列）

### P-49 · 审查范围边界
- 原文：`P:skills/ponytail-review/SKILL.md:52-55`「Scope: over-engineering and complexity only. Correctness bugs, security holes, and performance are explicitly out of scope.」
- 作用：把审查限定在复杂度问题，正确性/安全/性能转交常规审查，避免越界给出弱结论。
- 是否推荐：✅ 推荐（非 no-op：模型会把审查扩成通用评审；能判"是否只报复杂度问题"）
- 使用场景：`gates`（边界：常规评审任务不适用）
- 通用化改法：审查范围限定为复杂度与冗余；正确性、安全与性能问题转交常规审查。
- 重复：无重复

### P-50 · 不造节省数字
- 原文：`P:skills/ponytail-gain/SKILL.md:41-45`「These are benchmark medians, not this repo. NEVER print a per-repo savings number … there is no real baseline to subtract from in a live repo.」
- 作用：禁止把基准数字伪装成本仓库的收益，防止用不可核对的数据自证价值。
- 是否推荐：✅ 推荐（非 no-op：模型乐于给出"省了 X 行"；能判"是否存在无基线对比的节省数字"）
- 使用场景：`base`（边界：给出可现场计数的计量（如台账行数）不受限）
- 通用化改法：只报告可复核的计量，不给出无法与真实基线对比的节省数字。
- 重复：包含或张力（→ 裁决：与 P-45 分工——产出形态归 P-45；本条保留"只给可复核计量"作为独立规范句）

### P-51 · 展示卡一次性
- 原文：`P:skills/ponytail-help/SKILL.md:11-12`「Display this reference card when invoked. One-shot, do NOT change mode, write flag files, or persist anything.」
- 作用：明确展示类入口不改变状态，避免看一眼帮助就切了模式。
- 是否推荐：⚠️ 条件推荐（条件：存在展示类入口时）
- 使用场景：`agent-cfg`（边界：交互形态约定）
- 通用化改法：不保留规范句；"不改状态"并入 P-45 的只读要求。
- 重复：包含或张力（→ 裁决：并入 P-45（只读与不持久化），不单列）

### P-52 · 适配器薄
- 原文：`P:docs/agent-portability.md:37-39`「Keep adapters thin. … keep its copied rule text aligned with `AGENTS.md`.」
- 作用：多宿主分发时只做指向，避免同一规则出现多份会各自漂移的文本。
- 是否推荐：✅ 推荐（非 no-op：模型会为每个宿主复制一份；能判"是否新增了重复规则文本"）
- 使用场景：`agent-cfg`（边界：宿主只支持静态指令文件时才允许复制，且须与主文件一致）
- 通用化改法：宿主适配层只指向主规则文件；确需复制文本时，副本与主文件逐字一致。
- 重复：无重复

### P-53 · 原生能力清单
- 原文：`P:docs/platform-native.md:211`「When the native solution is genuinely insufficient … the library earns its place. Install it then, not before.」
- 作用：把"平台已能做什么"整理成可查资料，供编码前核对，避免重复造轮子。
- 是否推荐：❌ 不推荐（理由：被 P-13 覆盖；本体是参考资料而非可执行约束）
- 使用场景：`agent-cfg`（边界：作为 P-13 的参考实现形态）
- 通用化改法：不保留规范句；原生优先的含义已在 P-13。
- 重复：同义（→ 并入 P-13）

### P-54 · 钩子不阻断
- 原文：`P:hooks/ponytail-mode-tracker.js:152-153`「Mirrors the best-effort, never-block contract the other lifecycle hooks already follow.」
- 作用：保证注入型钩子永不冻结会话：出错静默、超时放行。
- 是否推荐：⚠️ 条件推荐（条件：规则以注入型钩子/插件分发时）
- 使用场景：`runtime-agent`（边界：仅注入型钩子；需要拦截的执行点另议）
- 通用化改法：注入型钩子只注入信息，出错或超时都放行，不阻断会话。
- 重复：无重复

### P-55 · 注入失败仍注入
- 原文：`P:hooks/ponytail-subagent.js:50-52`「… Missing/unparseable agent_type, a stdin error, or the timeout all fail open (inject) …」
- 作用：判定不确定时选择"多注入"而非"静默丢弃"，避免子代理失去约束。
- 是否推荐：⚠️ 条件推荐（条件：向子代理或子任务注入上下文时）
- 使用场景：`agent-cfg`（边界：注入内容成本可忽略时；高成本注入需另设阈值）
- 通用化改法：向子代理注入上下文时，判定不确定一律注入。
- 重复：无重复

### P-56 · 常开规则让位
- 原文：`P:hooks/ponytail-runtime.js:59-62`「… the hooks step back instead of injecting a second, possibly contradicting, copy (#817).」
- 作用：环境中已有常开规则时不再注入第二份，避免两套同类规则互相矛盾。
- 是否推荐：⚠️ 条件推荐（条件：同一环境可能同时存在常开规则与钩子注入）
- 使用场景：`agent-cfg`（边界：无常开规则并存时不适用）
- 通用化改法：环境中已有一份常开规则时，钩子只发一条提示，不再注入第二份。
- 重复：无重复

### P-57 · 副本一致校验
- 原文：`P:scripts/check-rule-copies.js:15-16`「const canonical = agents.replace(…).trim();」（同义出处 `:33-35`「if (actual !== canonical) { … }」）
- 作用：把"多份规则文本必须逐字一致"变成机器校验，任一漂移即失败。
- 是否推荐：✅ 推荐（非 no-op：副本会静默漂移；能判"是否有逐字比对且失败即红"）
- 使用场景：`agent-cfg`（边界：规则只有单份文件时不适用）
- 通用化改法：同一规则的多份副本由校验脚本逐字比对，任一漂移即判定失败。
- 重复：无重复

### P-58 · 不变量 canary
- 原文：`P:scripts/check-rule-copies.js:44-58`「const INVARIANTS = [ 'in this codebase', … 'Lazy code without its check is unfinished' ]」
- 作用：在无法逐字比对的长短两版之间，钉住承重短语，防止改写时悄悄丢掉关键条款。
- 是否推荐：✅ 推荐（非 no-op：改写措辞时没人会逐句对照；能判"短语是否在所有副本中同时存在"）
- 使用场景：`agent-cfg`（边界：仅当条款存在长短两种版本时）
- 通用化改法：为承重条款钉一组逐字短语，要求在全部副本中同时存在；措辞改写即触发失败。
- 重复：无重复

### P-59 · 廉价门先行
- 原文：`P:.github/workflows/test.yml:29-36`「- name: Check rule copies … - name: Check version consistency … - name: Run tests」
- 作用：把秒级校验排在昂贵的测试之前，失败早、反馈快。
- 是否推荐：⚠️ 条件推荐（条件：项目有多个校验步骤且其中含昂贵测试）
- 使用场景：`gates`（边界：单步校验的项目无须排序）
- 通用化改法：把廉价的校验（副本一致、版本一致）排在测试步骤之前，先失败先修。
- 重复：无重复

### P-60 · 版本一致
- 原文：`P:scripts/check-versions.js:9-11`「every version-bearing file must share one pinned X.Y.Z version, and … that shared version must equal the tag.」
- 作用：防住"多处各自写版本号却集体漏改"与"标签与版本号不一致"两种发布事故。
- 是否推荐：✅ 推荐（非 no-op：手改多处版本必然漏；能判"版本号是否唯一且等于标签"）
- 使用场景：`gates`（边界：只声明一次版本的项目不适用）
- 通用化改法：所有声明版本的文件共享同一版本号；打标签时该版本号必须等于标签。
- 重复：无重复

### P-61 · 生成物过期即红
- 原文：`P:scripts/build-openclaw-skills.js:7-8`「verbatim from skills/<name>/SKILL.md so the ruleset never drifts; only the frontmatter is rewritten.」
- 作用：约束生成器只重写派生字段，正文逐字同源，提交物过期即测试失败。
- 是否推荐：⚠️ 条件推荐（条件：仓库存在生成器产出的文件）
- 使用场景：`agent-cfg`（边界：无生成物时不适用）
- 通用化改法：不保留规范句；"生成物正文同源、过期即失败"作为 P-57 在生成场景的实例并入。
- 重复：包含或张力（→ 裁决：并入 P-57（同一副本一致性机制），不单列）

### P-62 · 不占自动加载路径
- 原文：`P:tests/gemini-extension.test.js:34-38`「const RULE_INVARIANTS = [ 'lazy senior', 'input validation at trust boundaries', 'naive heuristic' ]」（同叙 `:85-90`「Gemini cannot auto-discover Claude/Codex hook events」）
- 作用：避免把某宿主专用配置放进另一宿主会自动加载的约定路径，导致误加载与冲突。
- 是否推荐：⚠️ 条件推荐（条件：宿主存在自动发现的约定路径时）
- 使用场景：`agent-cfg`（边界：宿主无自动发现机制时不适用）
- 通用化改法：不在宿主会自动加载的约定路径放置不属于该用途的内容。
- 重复：包含或张力（→ 裁决：与 P-58 分工——"承重短语须在上下文文件中"归 P-58；本条保留"不占自动加载路径"作为独立规范句）

### P-63 · 单一测试入口
- 原文：`P:package.json:38`「"test": "node --test tests/*.test.js && npm test --prefix pi-extension && npm test --prefix ponytail-mcp"」
- 作用：给全部检查一个统一入口，人或 agent 只需记住一条命令。
- 是否推荐：✅ 推荐（非 no-op：多包仓库常有多个分散命令；能判"是否存在单一入口且覆盖全部子集"）
- 使用场景：`gates`（边界：单包单命令的项目天然满足）
- 通用化改法：提供单一测试入口命令，串联全部检查子集。
- 重复：无重复

## 规范句索引（本文件产生）

> 收录规则：`是否推荐` 为 ✅/⚠️ 且 `重复` 未标"并入"的条目；同义条目只在上方写明并入对象，此处不再出现。

- P-02 — 未指定风格时按本文件的默认形式交付，并把不确定点写成一行说明。
- P-04 — 提供三档强度：照做并一行给出更省替代／强制最小实现／先质疑需求是否成立。
- P-06 — 关闭类口令只在整条消息等于该口令时生效，忽略大小写与尾部标点。
- P-07 — 把工程约束与表达风格约束分开，各自独立生效与开关。
- P-08 — 该规则集只用于编码与工程任务；提问、翻译、写作等非编码请求不适用。
- P-10 — 动手前先确认需求是否真的需要存在；投机性需求跳过并一行说明。
- P-11 — 优先复用仓库里已有的实现与模式，不改写既有同类代码。
- P-12 — 标准库已有能力时直接用标准库。
- P-13 — 平台或运行时已内置的能力优先于引入新的依赖。
- P-14 — 已引入的依赖能解决就用它；几行代码能做的功能不新增依赖。
- P-15 — 逻辑简单且不损可读时，用一行表达。
- P-16 — 只实现刚好满足当前需求的最小版本，不预留扩展点。
- P-17 — 按成本从低到高依次检查候选方案，取第一个成立的方案并停止比较。
- P-18 — 改动前读完涉及的文件并追出真实调用路径，再动手。
- P-20 — 只创建当前使用点需要的文件与结构，不为未来预留骨架。
- P-21 — 优先考虑删除或收窄方案，其次才是新增；同一行为用更少的文件与代码行表达。
- P-24 — 需求含糊时先交付可用的最小版本，并在同一回复里说明取舍，不因等待确认而停工。
- P-25 — 同等成本的两种实现，选边界与异常处理正确的那种。
- P-26 — 修缺陷时先查该函数或模块的全部调用点，在共用位置改一次。
- P-27 — 先给可用结果，再给至多三行要点：跳过了什么、何时需要补上。
- P-29 — 用户明确要求报告、走查或分阶段说明时，按其要求完整给出。
- P-32 — 信任边界的输入一律校验。
- P-33 — 可能导致数据丢失的路径保留错误处理与恢复手段。
- P-34 — 安全相关处理保持完整，不因精简而省略。
- P-35 — 有界面的项目保留基本无障碍支持：键盘可达、语义标签、足够对比度。
- P-36 — 涉及物理设备的项目保留现场校准参数与调整入口。
- P-37 — 用户坚持的完整实现按其要求交付，不再重复质疑。
- P-38 — 非平凡逻辑留下一处可运行的检查：断言式自检或单个小测试文件；平凡一行免检。
- P-40 — 故意削减能力并留下已知上限的实现，写一行注释记录上限与升级触发条件。
- P-41 — 把全仓的这类标记汇总成一张台账，每行给出位置、被简化点、上限与升级触发条件。
- P-43 — 未写明升级触发条件的标记单独列出，标为会静默腐烂的风险项。
- P-45 — 报告类任务默认只读；需要写入仓库时先征得同意。
- P-47 — 审查只列出可删项与替换方案、不直接改代码，结尾给出可删行数与可去除依赖数。
- P-49 — 审查范围限定为复杂度与冗余；正确性、安全与性能问题转交常规审查。
- P-50 — 只报告可复核的计量，不给出无法与真实基线对比的节省数字。
- P-52 — 宿主适配层只指向主规则文件；确需复制文本时，副本与主文件逐字一致。
- P-54 — 注入型钩子只注入信息，出错或超时都放行，不阻断会话。
- P-55 — 向子代理注入上下文时，判定不确定一律注入。
- P-56 — 环境中已有一份常开规则时，钩子只发一条提示，不再注入第二份。
- P-57 — 同一规则的多份副本由校验脚本逐字比对，任一漂移即判定失败。
- P-58 — 为承重条款钉一组逐字短语，要求在全部副本中同时存在；措辞改写即触发失败。
- P-59 — 把廉价的校验（副本一致、版本一致）排在测试步骤之前，先失败先修。
- P-60 — 所有声明版本的文件共享同一版本号；打标签时该版本号必须等于标签。
- P-62 — 不在宿主会自动加载的约定路径放置不属于该用途的内容。
- P-63 — 提供单一测试入口命令，串联全部检查子集。

## 自检

### 覆盖表（P-01 … P-63 各一次，缺漏 0）

| 判定 | ID 列表 | 条数 |
|---|---|--:|
| ✅ 推荐 | P-08, P-10, P-11, P-12, P-13, P-14, P-16, P-17, P-18, P-20, P-21, P-24, P-25, P-26, P-27, P-29, P-31, P-32, P-33, P-34, P-37, P-38, P-40, P-41, P-43, P-45, P-47, P-48, P-49, P-50, P-52, P-57, P-58, P-60, P-63 | 35 |
| ⚠️ 条件推荐 | P-02, P-04, P-06, P-07, P-15, P-28, P-35, P-36, P-39, P-42, P-44, P-51, P-54, P-55, P-56, P-59, P-61, P-62 | 18 |
| ❌ 不推荐 | P-01, P-03, P-05, P-09, P-19, P-22, P-23, P-30, P-46, P-53 | 10 |
| 合计 | P-01 … P-63 | 63 |

### 自检命令与输出

```bash
# 条目数（应为 63）
grep -c '^### P-' review/01-ponytail.md
# 五字段 + 原文行完整性（第六条应为 63）
for f in 原文 作用 是否推荐 使用场景 通用化改法 重复; do printf '%s ' "$f"; grep -c "^- $f：" review/01-ponytail.md; done
# 三类推荐计数（应 35 / 18 / 10）
grep -c '^- 是否推荐：✅' review/01-ponytail.md
grep -c '^- 是否推荐：⚠️' review/01-ponytail.md
grep -c '^- 是否推荐：❌' review/01-ponytail.md
# 重复分布（应 45 / 9 / 9）
grep -c '^- 重复：无重复' review/01-ponytail.md
grep -c '^- 重复：同义' review/01-ponytail.md
grep -c '^- 重复：包含或张力' review/01-ponytail.md
# 规范句条数（应 45，且 == 63 − 10 − 8）
grep -c '^- P-' review/01-ponytail.md
# 交叉核对：可推荐且未"并入"的条目数应 == 45
awk '/^- 是否推荐：/{rec=$0} /^- 重复：/{if (rec ~ /❌/) bad++; else if ($0 ~ /并入/) dup++; else keep++} END{print "keep="keep, "dup="dup, "bad="bad}' review/01-ponytail.md
# 覆盖唯一性：每个 ID 只出现一次（无输出即通过）
grep -o '^### P-[0-9]*' review/01-ponytail.md | sort | uniq -d
```

实测输出：

- `grep -c '^### P-'` → `63`
- 字段行：`原文 63`／`作用 63`／`是否推荐 63`／`使用场景 63`／`通用化改法 63`／`重复 63`
- `✅ 35`／`⚠️ 18`／`❌ 10`
- 重复分布：`无重复 45`／`同义 9`／`包含或张力 9`
- `grep -c '^- P-'` → `45`
- `awk` 交叉核对 → `keep=45 dup=8 bad=10`（45 == 63 − 10 − 8 ✓）
- `uniq -d` → 无输出（覆盖唯一 ✓）

### 与 findings 的冲突

无。本台账只做判断与改写，未发现 findings/01-ponytail.md 的条目、ID 或出处需要更正。
