# 10 · `rules/` 三文件独立核验（185 条）

> **核验者**：`citation-verifier`（fresh 上下文，不采信写者结论）。**只读核验**：未改 `rules/`、未改其它 `review/` 文件；本文件是本轮唯一写入。
> **对象**：`rules/base.md`（133 条）、`rules/gates.md`（34 条）、`rules/frontend.md`（18 条），合计 **185 条**。
> **权威依据**：`review/09-write-manifest.md`（ID 清单）、三份台账的 `## 规范句索引`、`review/06-rewrite-pack.md`、`review/08-user-rules.md`（含 3 条替换覆盖 + 5 条新增）、`review/00-schema.md`（契约）。
> **方法**：逐条核验，不抽样。全部脚本在 §6，可直接复跑。

## §0 结论摘要

| 文件 | 条数（实点/清单） | 集合（缺/多） | 正文保真（逐字） | 结构质检 | 溯源泄漏 | 判定 |
|---|---|---|---|---|---|---|
| `rules/base.md` | 133 / 133 ✓ | 0 / 0 ✓ | 133/133 ✓ | 通过 ✓ | 0（1 处「台账」经判定非泄漏） | **PASS** |
| `rules/gates.md` | 34 / 34 ✓ | 0 / 0 ✓ | 34/34 ✓ | 通过 ✓ | 0 ✓ | **PASS** |
| `rules/frontend.md` | 18 / 18 ✓ | 0 / 0 ✓ | 18/18 ✓ | 通过 ✓ | 0 ✓ | **PASS** |
| **合计** | **185 / 185 ✓** | **0 / 0 ✓** | **185/185 ✓** | **通过** | **0** | **PASS** |

**总裁定（原裁定，针对 R-07 补记前的 185 条版本，保留为历史留痕）：`rules/` 三文件可作为最终交付物。** 185 条全部逐字来自既定来源且归属正确；条数与清单逐值一致、无缺条、无清单外新增、无重复（内部+跨文件两两相似度 0 组 ≥ 0.55）；零专名、无负面起句、无溯源泄漏、格式合规。**必修项 0 条**；§4 只有 3 条 INFO 级观察（不影响交付）。

> **裁定更新（针对 R-07 补记后的 186 条版本，见 §7；原裁定不撤回，作为历史留痕）**：`base.md` / `gates.md` / `frontend.md` = **133 / 34 / 19 条**，合计 **186**；两处授权改动（新增 U-09 + `A2.03` 加界面豁免）核实、**无第四处**（哈希/字节记账/行级池比对三重互证）；四项质检与相似度全绿（新对 0.2268，互补可接受）；冲突解除、溯源映射 186 行全覆盖且授权改写标注正确 → **新版本仍可作为最终交付物**，附两条 LOW 必修（**D-1** `frontend.md:4` 的「三节」应改「四节」；**D-2** `review/08` 两处 U-09 的反引号应为双反引号写法）——两条均不影响 186 条正文的保真与执行语义。新冻结值：`base.md` `d4cc9a89…`（同前）、`gates.md` `ccf8693e…`、`frontend.md` `1c6d4245…`。

> **裁定更新（最终，针对 D-1/D-2/INFO 修正后的冻结版本，见 §8）**：D-1/D-2/INFO 三处均逐字落地；`rules/` 改动面**仅 `frontend.md:4` 一行**（行级还原证明：还原该行即得 task-24 的 sha `1c6d4245…` 与 2149 B；字节 Δ+11 = `len(' → 验收')`）；计数仍 **133 / 34 / 19 = 186**；四项质检全绿；`review/11` 仍 186 行、未匹配 0、授权标注正确 → **最终裁定：`rules/` 三文件（186 条）可作为最终交付物**，最终冻结值 `base.md` `d4cc9a89…` / `gates.md` `ccf8693e…` / `frontend.md` **`e2d3cddf…`**。**终止声明见 §8.5**：本报告至此无未闭环必修项，此后 `rules/` 任何改动都会使裁定失效。**「已记录、不再追改」清单见 §8.7。**

> **裁定更新（最新，针对 `gates.md:5` 头部范围声明后的冻结版本，见 §9）**：新增行核实、改动面**仅 `gates.md:5` 一行**（另两文件哈希零改动；删该行即得 task-25 冻结值 `ccf8693e…` / 4164 B；字节 Δ+139 = 新行 138 B + 换行）；计数仍 **133 / 34 / 19 = 186**；头部自洽、指针双向闭环；**R-1 关闭**（`A1.44` `:9`、`A3.02` `:12`、覆盖率 `:40`–`:43` 均被文件级范围声明覆盖）；四项质检全绿；INFO 判定「保留 `:15` 从句」（层叠为设计，非重复）→ **最新裁定：`rules/` 三文件（186 条）可作为最终交付物**，最新冻结值 `base.md` `d4cc9a89…` / `gates.md` **`8f9104db…`** / `frontend.md` `e2d3cddf…`。**终止声明见 §9.8**；本轮记录的 `review/11` gates 段行号 +1 陈旧属记录性事项（§9.6），不影响裁定。**「已记录、不再追改」清单见 §9.9。**

## §1 条数与集合（双向比对）

| 文件 | `wc -l` | `grep -c '^- '` | 清单值（`review/09`） | 缺条 | 多出 |
|---|--:|--:|--:|--:|--:|
| `rules/base.md` | 164 | **133** | 133 | **0** | **0** |
| `rules/gates.md` | 53 | **34** | 34 | **0** | **0** |
| `rules/frontend.md` | 31 | **18** | 18 | **0** | **0** |
| 合计 | 248 | **185** | 185 | **0** | **0** |

**集合口径**（说明为何"缺/多 ID"为 0）：`rules/` 正文按契约**不写 ID**，因此集合比对用「文本 ↔ 来源」双向匹配实现——把 185 条期望语句（147 台账索引 + 29 改写包行 + 1 条 R-01 出口 + 5 条用户新增 + 3 条替换覆盖）与文件里的 185 行做**严格逐字 + 归属文件一致**的双向匹配（§6 脚本 A/B）：

- 文件里**每一行**都能匹配到一条期望语句、且落在清单指定的文件 → **多出 = 0**；
- **每一条**期望语句都能在指定文件里找到 → **缺条 = 0**；
- 两侧**多重集完全相等**（`Counter(pool) == Counter(actual)`，两侧各 185，且每文件内 133/34/18 全部唯一）→ 无重复掩盖遗漏。

**185 的分解**（与 `review/08:84`、`review/09:44` 一致）：`147（台账索引 102+30+15）+ 29（改写包，已排除被 08 覆盖的 R11 行）+ 1（R-01 出口条款）+ 5（U-01/02/03/07/08 新增）+ 3（A1.31/A1.32/R11 替换覆盖）= 185` ✓。

**3 文件方案的重归属**（清单未逐行标注，由文本匹配实测）：改写包里原属 `docs`/`agent-cfg`/`monorepo` 的 10 行并入 `base`，故 rewrite 部分落点 = **base 23 / gates 4 / frontend 2**（与 `review/09:13,27,35` 的计数一致 ✓）；`base` 侧来自 `gates`/`frontend` 的改写行分别为 0（`P-59`/`P-60`/`P-63`/`A1.12+A2.38` 落 `gates`，`P-35`/`A2.31` 落 `frontend`）✓ 无错位。

## §2 正文保真（全量 185 条，非抽样）

**结论：185/185 逐字一致（仅去掉列表符号 `- ` 与首尾空白），且归属文件正确。** 判定方式：严格字符串相等（不做引号/空白归一化），并要求「实际文件 == 期望归属文件」。

| 来源类别 | 条数 | 逐字一致 | 证据 |
|---|--:|--:|---|
| 台账 `## 规范句索引`（`review/09` 的 147 个 ID） | 147 | **147/147** | 脚本 A：按 ID 取索引句，与 `rules/` 行严格比对 |
| `review/06` 改写包表内最终句 | 29 | **29/29** | 脚本 A（已排除 R11 行，改用 08 文本） |
| `review/06` 的 R-01 出口条款（引用块） | 1 | **1/1** | 「默认按最小实现与"命中即停"执行；用户明确要求更严格或更宽松时，按其要求执行。」= `base.md:8` |
| `review/08` 用户新增（U-01/02/03/07/08） | 5 | **5/5** | `base.md:81/82/83/64`、`frontend.md:9` |
| `review/08` 替换覆盖（A1.31/A1.32/R11） | 3 | **3/3** | `base.md:62`（A1.31）、`base.md:63`（A1.32）、`base.md:29`（R11） |

**替换覆盖专项（任务点名）**：三个 ID 的**台账旧句与 06 旧句均未出现**（严格串比对，见脚本 C）：

| ID | 台账旧句（**不得出现**） | 实际写入句（= `review/08`） | 位置 |
|---|---|---|---|
| `A1.31` | 「只在真正的信任边界做运行期校验，进程内已由类型保证的取值不重复校验。」 | 「只在真正的信任边界做运行期校验；类型已保证的取值不再重复校验或兜底；捕获到的异常要么处理要么向上抛出，不静默吞掉。」 | `base.md:62` |
| `A1.32` | 「不新增向未知类型的断言；已有的这类断言只减不增并保持基线。」 | 「不新增向未知类型的断言；第三方边界可以做必要的类型收窄，但不用断言掩盖真实的类型错误；已有断言只减不增并保持基线。」 | `base.md:63` |
| `R11` | 「每个抽象至少有两个使用点；只有一个使用点时直接内联实现。」（台账与 06 同句） | 「每个抽象至少有两个使用点且语义稳定；只有一个使用点或语义未定时直接内联实现。」 | `base.md:29` |

复跑：脚本 C 输出三行 `旧句出现? … no ✓`。

## §3 质检与重复

### 3.1 零专名（全量 185 条）

- 命令：79 词表（框架/库/语言/包管理器/CI 工具/产品名）逐行扫描 → **命中 0 条**。
- 通用名词判定（与 `review/09:48` 的 Lead 裁决记录一致）：
  - `shell`（`gates.md:33`）：命令解释器，通用名词 → **保留**（裁决记录 #1 ✓）；
  - `API`（`base.md:82`）、`PR`（`gates.md:52`）：通用技术缩写，非产品名 → **保留**。
  - 三处命中均非专名，**不判缺陷**。

### 3.2 正面表述（全量）

- 以 `不要/别/禁止/绝不/不得/避免` 起句：**0 条**（`grep -cE '^- (不要|别|禁止|绝不|不得|避免)'` → 0/0/0）。
- 句中出现的否定式（如 `不预留扩展点`、`绝不静默放宽`、`禁止跟随重定向`）是**可判定的正面动作描述**，与台账/改写包逐字一致，不属"纯负向表述"。

### 3.3 可判「做到没有」（全量）

- 模糊量词扫描（`尽量/适当/合理/尽可能/酌情/视情况/差不多`）：**0 条**。
- 逐条抽查未发现缺判据的语句；少数依赖判断的限定词（`语义稳定`、`够准`、`有实据`）**沿用来源原文**（`review/08:48` 的 R11 合并句、`base.md:19`、`:20`），未新增模糊度。
- 185 条均可指向「做了什么/产出什么」的检验点（例：`base.md:29` 数使用点、`base.md:124` 查台账字段是否齐全、`gates.md:21` 断言测试可并发通过）。

### 3.4 溯源泄漏（全量）

| 检查项 | `base.md` | `gates.md` | `frontend.md` |
|---|--:|--:|--:|
| 台账 ID（`A1.31`/`P-xx`/`R\d`/`U-xx`/`B\d`/`C\d`） | 0 | 0 | 0 |
| `P:` / `K:` / `H:` 引用 | 0 | 0 | 0 |
| `review/` / `findings/` 路径 | 0 | 0 | 0 |
| 来源标签（`ponytail`/`Karpathy`/`harness`/`DeepSeek`/`来源`/`出处`） | 0 | 0 | 0 |

**唯一命中与判定**：`base.md:124` 出现「台账」一词——判定为**非泄漏**：① 它是规则正文的通用名词（指 agent 自己要产出的标记清单），② 与来源 `P-41` 的索引句逐字一致（`review/01-ponytail.md:585`），③ 不指向 `review/` 下的评审台账。若按"任何"台账"字样都算泄漏"的严口径，则需改词并会同时破坏逐字保真——本轮按任务定义（ID/引用/路径/来源标签）判 **0 泄漏**。

> **任务前提提示（INFO）**：核验要求说"用清单里给的 `grep -nE` 命令逐文件跑"，但 `review/09-write-manifest.md` 与其它 `review/` 文件里**都没有**针对 `rules/` 的该命令（全库检索 `grep -nE` 仅命中 `review/02:366` 的台账自检）。本轮用 §6 的自定义命令等价覆盖（结果如上）。

### 3.5 重复（跨文件 + 文件内，全量两两）

- 度量：`difflib.SequenceMatcher(None,a,b).ratio()`——**与 Lead 的度量一致**：对 `A2.60`↔`A2.72` 实测 **0.2687 ≈ 0.269**，复现其 `review/09:49` 的声明 ✓。
- 185 条两两比对（16 990 对）：**≥ 0.55 的命中 0 组** ✓（与 Lead 的"A2.60/A2.72 是唯一被讨论的邻对"不矛盾）。
- 阈值下最近的 6 对（供复核，均**不**判 FAIL）：

| 相似度 | 对 | 语义判定 |
|--:|---|---|
| **0.5185** | `base.md:115`（文档超限先搬迁再压缩后提额） ↔ `base.md:153`（扩充体量上限时先压缩再提额） | **互补不重复**：前者对象是**文档词数预算**（`A2.49`），后者是**指令文件体量上限**（`A1.54 后半`，R-18 拆分的后半）——对象不同、触发不同。本轮实测唯一接近阈值的一对，建议 Lead 知悉（无需合并） |
| 0.4578 | `base.md:108` ↔ `base.md:130` | 前者管"文档与注释同步 + 每段一物理行 + 一个事实一个归属"，后者管"行为改动同提交更新文档 + 单元声明权威页"；不同侧面 |
| 0.4138 | `frontend.md:19` ↔ `frontend.md:20` | 钩子创建 vs 上下文可见性；不同约束 |
| 0.4000 | `base.md:25` ↔ `base.md:26` | 最小版本 vs 最小文件结构；不同对象 |
| 0.3925 | `gates.md:12` ↔ `gates.md:18` | 任务改写为检查 vs 非平凡逻辑留一处检查；粒度不同 |
| 0.3636 | `base.md:54` ↔ `base.md:126` | 扩展点 vs 持久化结构变更记录；不同对象 |

### 3.6 格式与结构

| 检查 | `base.md` | `gates.md` | `frontend.md` |
|---|---|---|---|
| 结尾换行 | 恰好 1 个（末字节 `0a`）✓ | ✓ | ✓ |
| CRLF | 0 ✓ | 0 ✓ | 0 ✓ |
| 编码 | UTF-8 ✓ | ✓ | ✓ |
| 文件头「什么时候读」 | `:3` 适用任何项目 + 两个场景文件的追加关系 ✓ | `:4` 「项目已有测试或校验设施时读本文件；先读 `base.md`」✓ | `:3` 「适用于有界面或前端渲染层的项目；先读 `base.md`」✓ |
| 分节顺序 | 动手之前 → 决策与最小实现 → 改动纪律 → 类型与边界 → 依赖与配置 → 验证与交付 → 沟通与留痕 → 指令文件与分发 → 多包协作 | 选证据 → 最小检查与内环 → 门禁纪律 → 覆盖率与预算 → 生成物与持续集成 | 界面结构 → 组件与数据流 → 无障碍（与其 `:4` 的自述一致） |
| 明显错位 | 未发现 | 未发现 | 未发现 |

### 3.7 写纪律

```
$ git -C /home/leihaohao/workspace/agent-rules status --short --untracked-files=all
?? findings/{01-ponytail,02-andrej-karpathy-skills,03-deepseek-harness,99-verification}.md   （4）
?? review/{00-schema,01-ponytail,02-andrej-karpathy-skills,03-deepseek-harness,04-adjudications,
          05-merge-plan,06-rewrite-pack,07-rewrite-audit,08-user-rules,09-write-manifest}.md  （10）
?? rules/{base,gates,frontend}.md                                                            （3）
```

合计 17 项 = `findings/` 4 + `review/` 10 + `rules/` 3 ✓（本报告写入后 `review/` 变 11）。`rules/` 之外无新增文件 ✓。

## §4 必须修正项

**无必修项。** 185 条全部通过；以下 3 条为 INFO 级观察（记录备查，不影响交付）：

| # | 观察 | 位置 | 处置建议 |
|---|---|---|---|
| I-1 | 阈值下最近的一对（0.5185） | `base.md:115` ↔ `base.md:153` | 不合并（对象不同：文档词数预算 vs 指令文件体量上限）；如 Lead 日后要收紧阈值到 0.50，需先对这两条给出并存理由 |
| I-2 | 任务前提里的 `grep -nE` 泄漏命令在 `review/09` 中不存在 | `review/09-write-manifest.md` | 无（本轮已用等价命令覆盖）；若要把该命令固化，可后续补进 `review/09` 附录 |
| I-3 | `base.md:124` 的「台账」一词可能被严口径误判为溯源泄漏 | `base.md:124` | 保留（通用名词 + 与来源逐字一致）；若要彻底避免歧义，可改为「清单」——但会**破坏逐字保真**，需先改台账索引句，故不建议 |

## §5 未核与局限

1. **未核清单外内容**：本轮只核 `rules/` 三条文件的 185 条正文；未核 `review/` 其它文件、未重跑台账筛选判据（✅/⚠️ 的推荐判定）、未复核 `review/10` 之外的溯源映射（`review/05` §3 步骤 6 的映射表尚未落地）。
2. **相似度度量非官方定义**：0.55 阈值与 `difflib` 比率是我与 Lead 声明一致的度量（`A2.60`↔`A2.72` = 0.2687 复现了 0.269）；若实际写入流程用别的度量（词级/向量），命中集合可能不同——本报告给出的是同一度量的全量结果。
3. **「可判」为定性判断**：脚本只覆盖模糊量词与判据形态；「是否真的可验收」仍属人工判断（本轮全量通读）。
4. **分节顺序允许主观**：只报"未发现明显错位"，未逐条评估顺序最优性。
5. **未验证运行时效果**：规则集是给 agent 读的文本，其行为效果不在本轮范围（无对照实验）。

## §6 复跑脚本与命令

### A/B. 期望池构建 + 严格逐字 + 归属文件双向匹配

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re
from collections import Counter
from pathlib import Path
def strict(s): return re.sub(r'^-\s*', '', s.strip()).strip()
R = Path('review')
manifest = (R/'09-write-manifest.md').read_text(encoding='utf-8')
IDRE = re.compile(r'(?:A[\d.]+|B\d|C\d|P-\d+|R\d+|U-\d+)')
def orig_ids(b):
    seg = b.split('2. **')[0]
    return IDRE.findall(seg.split('：', 1)[1])
bb = manifest.split('## `rules/base.md`')[1].split('## `rules/gates.md`')[0]
gb = manifest.split('## `rules/gates.md`')[1].split('## `rules/frontend.md`')[0]
fb = manifest.split('## `rules/frontend.md`')[1].split('## 合计')[0]
IDXRE = re.compile(r'^- ((?:P-\d+|R\d+|A\d+\.\d+|B\d+|C\d+)) — (.+)$', re.M)
def imap(path, end):
    t = Path(path).read_text(encoding='utf-8'); i = t.index('## 规范句索引（本文件产生）'); s = t[i:]
    s = s[:s.index(end)] if end in s else s
    return {m.group(1): m.group(2).strip() for m in IDXRE.finditer(s)}
idx = {}
idx.update(imap('review/01-ponytail.md', '\n## 自检'))
idx.update(imap('review/02-andrej-karpathy-skills.md', '\n## 自检'))
idx.update(imap('review/03-deepseek-harness.md', '\n3/3 块与全文件自检'))
ROWRE = re.compile(r'^\| (.+?) \| (.+?)（`([a-z-]+)`[^）]*）\s*\|$')
pl = (R/'06-rewrite-pack.md').read_text(encoding='utf-8').split('\n')
rows = [(m.group(2).strip(), m.group(3)) for l in pl for m in [ROWRE.match(l)] if m]
new = [l[2:].strip() for l in pl if l.startswith('> ') and '默认按最小实现' in l][0]
ACTRE = re.compile(r'^\| (替换|新增) ([^\s|]+) \| `(.+?)`', re.M)
u08 = (R/'08-user-rules.md').read_text(encoding='utf-8')
def act(k):
    for m in ACTRE.finditer(u08):
        if m.group(2) == k: return m.group(3)
    raise KeyError(k)
E = []   # (text, file)
for i in orig_ids(bb): E.append((strict(idx[i]), 'base'))
for i in orig_ids(gb): E.append((strict(idx[i]), 'gates'))
for i in orig_ids(fb): E.append((strict(idx[i]), 'frontend'))
for t, f in rows:
    if t.startswith('每个抽象至少有两个使用点') and '只有一个使用点时' in t: continue
    E.append((strict(t), 'base' if f not in ('gates', 'frontend') else f))
E.append((strict(new), 'base'))
for k in ('A1.31', 'R11', 'A1.32'): E.append((strict(act(k)), 'base'))
for k in ('U-01','U-02','U-03','U-07'): E.append((strict(act(k)), 'base'))
E.append((strict(act('U-08')), 'frontend'))
A = []
for f in ('base', 'gates', 'frontend'):
    for i, l in enumerate((Path('rules')/f'{f}.md').read_text(encoding='utf-8').split('\n')):
        if l.startswith('- '): A.append((strict(l), f, i+1))
print('expected =', len(E), '| actual =', len(A))
print('per-file expected:', Counter(f for _, f in E), '| actual:', Counter(f for _, f, _ in A))
bad_extra = [a for a in A if not any(e[0] == a[0] and e[1] == a[1] for e in E)]
bad_missing = [e for e in E if not any(a[0] == e[0] and a[1] == e[1] for a in A)]
print('extra (in rules, not in pool or wrong file):', len(bad_extra))
for a in bad_extra: print('   ', a[1], a[2], a[0][:90])
print('missing:', len(bad_missing))
for e in bad_missing: print('   ', e[1], e[0][:90])
print('multiset equality:', Counter(e[0] for e in E) == Counter(a[0] for a in A))
PY
```

实测输出：

```
expected = 185 | actual = 185
per-file expected: Counter({'base': 133, 'gates': 34, 'frontend': 18}) | actual: Counter({'base': 133, 'gates': 34, 'frontend': 18})
extra (in rules, not in pool or wrong file): 0
missing: 0
multiset equality: True
```

### C. 替换覆盖：台账/06 旧句不得出现

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re
from pathlib import Path
def strict(s): return re.sub(r'^-\s*', '', s.strip()).strip()
idx = {}
for path, end in (('review/01-ponytail.md','\n## 自检'), ('review/02-andrej-karpathy-skills.md','\n## 自检'), ('review/03-deepseek-harness.md','\n3/3 块与全文件自检')):
    t = Path(path).read_text(encoding='utf-8'); i = t.index('## 规范句索引（本文件产生）'); s = t[i:]
    s = s[:s.index(end)] if end in s else s
    idx.update({m.group(1): m.group(2).strip() for m in re.finditer(r'^- ((?:P-\d+|R\d+|A\d+\.\d+|B\d+|C\d+)) — (.+)$', s, re.M)})
pl = Path('review/06-rewrite-pack.md').read_text(encoding='utf-8')
rules = '\n'.join(Path(f'rules/{f}.md').read_text(encoding='utf-8') for f in ('base','gates','frontend'))
old_r11_06 = [l.split('|')[2].split('（')[0].strip() for l in pl.split('\n') if l.startswith('| R11 ')][0]
for name, txt in (('A1.31 台账', idx['A1.31']), ('A1.32 台账', idx['A1.32']), ('R11 台账', idx['R11']), ('R11 06', old_r11_06)):
    print(f'旧句出现? {name}: {"YES" if strict(txt) in rules else "no ✓"}')
PY
```

实测输出：

```
旧句出现? A1.31 台账: no ✓
旧句出现? A1.32 台账: no ✓
旧句出现? R11 台账: no ✓
旧句出现? R11 06: no ✓
```

### D. 质检命令块（专名 / 负面起句 / 泄漏 / 格式）

```bash
cd /home/leihaohao/workspace/agent-rules
for f in base gates frontend; do
  echo "== $f =="
  printf 'items=%s ' "$(grep -c '^- ' rules/$f.md)"
  printf 'last=%s crlf=%s\n' "$(tail -c 1 rules/$f.md | xxd -p)" "$(grep -c $'\r' rules/$f.md)"
  echo -n 'negative-starts: '; grep -cE '^- (不要|别|禁止|绝不|不得|避免)' rules/$f.md
  echo -n 'vague: '; grep -cE '尽量|适当|合理|尽可能|酌情|视情况' rules/$f.md
  grep -nE '(^|[^A-Za-z0-9])(A[0-9]+\.[0-9]+|P-[0-9]+|R[0-9]+|U-[0-9]+|B[0-9]|C[0-9])([^0-9]|$)|(^|[^A-Za-z])(P|K|H):|review/|findings/|来源|出处|台账|ponytail|Karpathy|harness|DeepSeek' rules/$f.md || echo 'leakage: 0'
done
```

实测输出（摘要）：items 133/34/18；`last=0a` 且 `crlf=0`；negative-starts 0/0/0；vague 0/0/0；leakage 仅 `base.md:124` 一处「台账」（§3.4 已判定非泄漏）。

### E. 相似度扫描（0.55，含 A2.60↔A2.72 复现）

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re, difflib, itertools
from pathlib import Path
def items(f): return [re.sub(r'^-\s*','',l.strip()) for l in Path(f'rules/{f}.md').read_text(encoding='utf-8').split('\n') if l.startswith('- ')]
allit = [(f, t) for f in ('base','gates','frontend') for t in items(f)]
a260 = [t for f,t in allit if t.startswith('端到端场景从真实入口启动')][0]
a272 = [t for f,t in allit if t.startswith('被测进程只从真实入口')][0]
print('A2.60 vs A2.72 ratio =', round(difflib.SequenceMatcher(None, a260, a272).ratio(), 4))
hits = [(round(difflib.SequenceMatcher(None, t1, t2).ratio(),4), f1, f2, t1, t2)
        for (f1,t1),(f2,t2) in itertools.combinations(allit,2)
        if difflib.SequenceMatcher(None, t1, t2).ratio() >= 0.55]
print('pairs >= 0.55:', len(hits))
for h in hits: print('  ', h[0], h[1], h[2], h[3][:50], '||', h[4][:50])
PY
```

实测输出：`A2.60 vs A2.72 ratio = 0.2687`；`pairs >= 0.55: 0`。

## §7 δ 复核（after R-07 补记）

> **对象**：R-07 漏项补记后的 `rules/`（`base.md` / `gates.md` / `frontend.md`）。**只读复核**：未改 `rules/`；本文件是本轮唯一写入。
> **本报告写入 §7 前的冻结值**：`sha256 39dca59bf9aa40083e1ef02cf9d0f401f43abde8fade45384685ad9fd5d4689e` / 289 行。
> **被核验文件的新冻结值**：`base.md` = `d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea`（**与 task-23 相同**）、`gates.md` = `ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5`、`frontend.md` = `1c6d42457f99c50081ee054d4a8e4d352c96350e157ddef7e4e43d55cdfa222b`。

### 7.1 计数

```
$ for f in base gates frontend; do printf '%s=%s ' "$f" "$(grep -c '^- ' rules/$f.md)"; done; echo
base=133 gates=34 frontend=19
```

合计 **186** = 133 + 34 + 19 ✓，与 `review/09:41-44`（133 / 34 / **19（含 U-09）** / 总计 186）逐值一致。

### 7.2 改动面：三处改动，**无第四处**（三重独立证据）

| 文件 | 与 task-23 核验版的差异 | 证据 |
|---|---|---|
| `rules/base.md` | **0 处** | ① sha256 与 task-23 记录**完全相同**（`d4cc9a89…`）；② 字节数 `14318 → 14318`（Δ0）；③ 133 条全部落在 task-23 期望池内（0 新增/0 缺失） |
| `rules/gates.md` | **1 处**：`:14`（`A2.03`） | ① 33/34 行与期望池逐字相同，唯一不在池内的是 `:14`，其现文 = 「除界面交互层外，」+ 池内原句（**前缀拼接，后半逐字未动**）；② 字节数 `4140 → 4164` = **Δ24**，恰等于 `len('除界面交互层外，'.encode()) = 24` → 除此之外零字节变化 |
| `rules/frontend.md` | **2 处**：新增 `## 验收` 节 + `U-09` 行 | ① 18/18 条旧语句全部仍在池内且逐字未动（含 `:9` 的 U-08）；② 新增内容仅 tail 4 行（`:32` 空行 / `:33` `## 验收` / `:34` 空行 / `:35` U-09）；③ 字节数 `2015 → 2149` = **Δ134**，恰等于新增 tail 行的字节和（134） |

**关于 U-08 的「多次 → 多处」**：复核发现该行**现文已是「多处」**（`frontend.md:9`，与 `review/08:97` 的 U-08 最终句、`review/09:50` 的裁决记录第 3 条一致），且与 task-23 核验版**逐字相同**（已含在 18/18 池内）——即该订正在 task-23 之前就已完成，**本次不构成 delta**（三处改动实为「frontend 新增节+行」「gates 的 A2.03」两处落盘改动 + 一处早先已完成的措辞统一）。

复跑（脚本见 §7.8）：

```
base: current=133 pool=133 | not-in-pool=0 | pool-not-in-current=0
gates: current=34 pool=34 | not-in-pool=1 | pool-not-in-current=1
   +  除界面交互层外，用户可见的能力必须有经真实装配与真实入口的测试，只替身外部服务，并断言用户可见产物。
   -  用户可见的能力必须有经真实装配与真实入口的测试，只替身外部服务，并断言用户可见产物。
frontend: current=19 pool=18 | not-in-pool=1 | pool-not-in-current=0
   +  界面交互层的改动由开发者自行验证，不强制测试用例；界面以外的验证要求见 `gates.md`。
```

**结论：三处改动全部核实，且行级 diff、字节记账、哈希三种证据互证"无第四处改动"。**

### 7.3 授权一致性

| 改动 | 授权记录 | 记录内容核对 |
|---|---|---|
| `frontend.md` 新增 U-09 + `## 验收` 节 | `review/08:74-83`（U-09 条目，六字段齐全）+ `:106`（写入动作表行，注明「`frontend`，新节「验收」」） | ✓ 条目与动作行都在；`review/08:90` 计数 `+6`（含 U-09）✓ |
| `gates.md:14` 的 A2.03 授权改写 | `review/09:46`（185→186 说明 + 「`A2.03` 由"原样提取"改为"授权改写"」）+ `:53`（裁决记录第 4 条，含根因与两处落盘） | ✓ 与 `rules/gates.md:14` 现文一致 |
| 溯源标注 | `review/11:153` = `\| 7 \| 14 \| A2.03（09 授权改写，补界面豁免） \| 授权改写 \|`；`review/11:204` = `\| 19 \| 35 \| U-09 \| 用户新增（R-07 补记） \|` | ✓ **未被标成"台账原样提取"**（见 §7.6） |

**一处不符合（FAIL，LOW，记录性）**：授权记录里 U-09 语句的**反引号写法与落盘正文不一致**——

| 位置 | 现文（raw） | 应为 |
|---|---|---|
| `review/08:83`（U-09 `通用化改法`） | `…界面以外的验证要求见 \`gates.md\`。`（反斜杠转义的反引号） | `…界面以外的验证要求见 `gates.md`。` |
| `review/08:106`（写入动作表） | 同上（同一转义写法） | 同上 |

- 证据：`python3 -c "print(repr(open('review/08-user-rules.md').read().split(chr(10))[105]))"` → `'\\`gates.md\\`'`，而 `rules/frontend.md:35` 是 `` `gates.md` `` → 二者**不是逐字一致**（差 2 个反斜杠）。
- 附带：在 CommonMark 里**代码跨度内的反斜杠不是转义**，`` `A \` B` `` 会在第二个反引号处结束代码跨度，因此该行**渲染也达不到预期**（会把 `gates.md\`。` 落到代码跨度之外）。
- 精确修法：把这两处的单反引号包裹改成**双反引号包裹**，即 `` ``界面交互层的改动由开发者自行验证，不强制测试用例；界面以外的验证要求见 `gates.md`。`` ``（内层保持普通反引号）；或退而求其次，删掉内层反引号写成 `见 gates.md。`。
- 影响：仅记录文本的标记与渲染；**`rules/` 正文不受影响**（`frontend.md:35` 是正确写法）。

### 7.4 冲突解除

**全库扫描**（186 条中含 `界面|可见|测试|录制|验证|验收` 的 29 条，逐条判定）：

- **唯一直接要求"用户可见能力必须有测试"的条款**＝`gates.md:14`（A2.03）：现文已加「**除界面交互层外**」→ 与 U-09 的豁免**不再矛盾** ✓。
- **唯一要求界面层测试政策的条款**＝`frontend.md:35`（U-09）：「界面交互层的改动由开发者自行验证，不强制测试用例；界面以外的验证要求见 `gates.md`」→ 与 A2.03 的分工是**同一政策的正反两面**（A2.03 管"界面以外"、U-09 管"界面以内"），互补而非重复 ✓（相似度实测 0.2268，§7.5）。
- **其余 27 条**：均为通用条款或与 UI 测试无关——`base.md` 的 11 条（验证计划、约束执行、实验状态、依赖、静态平面、上限、测试位置、可见行为的**文档**记录、上游副本验证等）、`gates.md` 的 14 条（测试层级枚举、行为描述、并发、覆盖率三条、门禁纪律等）、`frontend.md` 的 2 条（框架上下文可见性、展示层无副作用）。**无一条要求界面交互层必须有测试用例或录制** ✓（`A1.42`/`A3.25` 已在 R-07 里删除，全库已无"录制"字样）。
- **软张力（INFO，不判 FAIL）**：`gates.md:8`（A1.44「按改动面枚举所需的测试层级」）与覆盖率三条（`:39`-`:42`）是通用条款，字面未排除界面层；但 U-09 已明确"界面交互层的改动…不强制测试用例"，且 A1.44 只要求**枚举**（枚举结果可以是"界面层走开发者自验"），构成的是适用范围交叠而**非直接冲突**。若 Lead 希望零软张力，可考虑在同两条上加同样的范围声明——但那是新的授权改动，本轮不建议、未要求。

### 7.5 回归质检（全量重跑四项 + 新对判定）

| 筛项 | 结果 |
|---|---|
| 条目总数 | **186**（133/34/19） |
| 负面起句（`不要/别/禁止/绝不/不得/避免`） | **0 条** |
| 模糊量词（`尽量/适当/合理/尽可能/酌情/视情况/差不多`） | **0 条** |
| 溯源泄漏（ID / `P:`/`K:`/`H:` / `review/` / `findings/` / 来源标签） | **0 条**（含新增的 U-09 行——它提到的 `gates.md` 是规则文件而非来源标签，不属泄漏） |
| 专名（79 词表） | **0 条** |
| 相似度 ≥ 0.55（186 条两两 = 17 205 对） | **0 组** ✓ |

**新对判定**：新增/改动两行与全库的最近对为 **`gates.md:14` ↔ `frontend.md:35` = 0.2268**（远低于 0.55）——二者是同一政策的"界面以外"与"界面以内"两面，**判定为互补可接受，不需合并**；其余涉及新行的对均 < 0.22（如 `gates:14`↔`frontend:8` = 0.2118、`base:94`↔`gates:14` = 0.1951）。

**格式**：`frontend.md` / `gates.md` 末字节均 `0a`、CRLF 计数 0 ✓（`base.md` 未动，同前）。

### 7.6 溯源映射（`review/11`）

| 检查 | 命令/方法 | 结果 |
|---|---|---|
| 行数 = 186 | 解析三个表的数据行 | **186**（base 133 / gates 34 / frontend 19，与各节标题声明一致） |
| 每行都指向真语句 | 逐行读 `文件:行号` 并要求该行以 `- ` 开头 | **186/186** ✓（0 处错行） |
| 覆盖完整（未匹配 0） | 每文件的语句行号集 == 映射行号集 | **三文件集合完全相等** ✓ → 每条语句都有且只有一行映射 |
| 来源类型标注 | 用四处文本池（台账索引 208 / 改写包 31 / 用户新增 6 / 替换覆盖 4 + 授权改写 1）对每行现文反查类型 | 9 条"改写包 vs 台账索引"差异**全部是同一文本两处存在的正常重叠**：这 7 行来源列写作 `R5、R5`、`P-17、P-17`、`P-16、P-16`、`P-21、P-21`、`P-36、P-36`、`P-45、P-45`、`P-35、P-35`，与 `review/11:208`「多重匹配 **7**」的说明一致 ✓ |
| **授权改写标注** | 读 `review/11:153` | `A2.03（09 授权改写，补界面豁免） / 授权改写` ✓ **未标成"台账原样提取"** |
| U-09 行标注 | 读 `review/11:204` | `U-09 / 用户新增（R-07 补记）` ✓ |

> 说明：我用机器分类时，U-09 行一度显示"未匹配"，原因是 `review/08:106` 的文本被 `\`` 转义（§7.3 的 FAIL）→ 提取出的池文本与正文差 2 个反斜杠；按**去掉转义后的语义文本**比对，U-09 与 `rules/frontend.md:35` 一致 ✓。该差异的根因仍归 §7.3 的记录性 FAIL。

### 7.7 写纪律与格式

```
$ git status --short --untracked-files=all | awk '{print $2}' | sed 's|/[^/]*$||' | sort | uniq -c
      4 findings
     12 review
      3 rules
```

`rules/` 之外无新增文件（`review/` 12 个 = 00–11 含本报告）✓；`rules/` 三文件的 mtime 与本次改动的授权记录一致。

### 7.8 复跑脚本（改动面证据）

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re, hashlib
from pathlib import Path
def strict(s): return re.sub(r'^-\s*', '', s.strip()).strip()
R = Path('review')
def imap(path, end):
    t = Path(path).read_text(encoding='utf-8'); i = t.index('## 规范句索引（本文件产生）'); s = t[i:]
    s = s[:s.index(end)] if end in s else s
    return {m.group(1): m.group(2).strip() for m in re.finditer(r'^- ((?:P-\d+|R\d+|A\d+\.\d+|B\d+|C\d+)) — (.+)$', s, re.M)}
idx = {}
idx.update(imap('review/01-ponytail.md', '\n## 自检')); idx.update(imap('review/02-andrej-karpathy-skills.md', '\n## 自检')); idx.update(imap('review/03-deepseek-harness.md', '\n3/3 块与全文件自检'))
manifest = (R/'09-write-manifest.md').read_text(encoding='utf-8')
def orig_ids(b):
    seg = b.split('2. **')[0]
    return re.findall(r'(?:A[\d.]+|B\d|C\d|P-\d+|R\d+|U-\d+)', seg.split('：', 1)[1])
bb = manifest.split('## `rules/base.md`')[1].split('## `rules/gates.md`')[0]
gb = manifest.split('## `rules/gates.md`')[1].split('## `rules/frontend.md`')[0]
fb = manifest.split('## `rules/frontend.md`')[1].split('## 合计')[0]
pl = (R/'06-rewrite-pack.md').read_text(encoding='utf-8').split('\n')
ROWRE = re.compile(r'^\| (.+?) \| (.+?)（`([a-z-]+)`[^）]*）\s*\|$')
rows = [(m.group(2).strip(), m.group(3)) for l in pl for m in [ROWRE.match(l)] if m]
new = [l[2:].strip() for l in pl if l.startswith('> ') and '默认按最小实现' in l][0]
ACT = re.compile(r'^\| (替换|新增) ([^\s|]+) \| `(.+?)`', re.M)
u08 = (R/'08-user-rules.md').read_text(encoding='utf-8')
def act(k):
    for m in ACT.finditer(u08):
        if m.group(2) == k: return m.group(3)
def pool(f):
    E = [strict(idx[i]) for i in orig_ids({'base': bb, 'gates': gb, 'frontend': fb}[f])]
    if f == 'base':
        for t, pf in rows:
            if t.startswith('每个抽象至少有两个使用点') and '只有一个使用点时' in t: continue
            if pf not in ('gates', 'frontend'): E.append(strict(t))
        E.append(strict(new))
        for k in ('A1.31','R11','A1.32'): E.append(strict(act(k)))
        for k in ('U-01','U-02','U-03','U-07'): E.append(strict(act(k)))
    if f == 'gates':
        for t, pf in rows:
            if pf == 'gates': E.append(strict(t))
    if f == 'frontend':
        for t, pf in rows:
            if pf == 'frontend': E.append(strict(t))
        E.append(strict(act('U-08')))
    return E
print('--- 改动面（task-23 期望池 vs 现文）---')
for f in ('base', 'gates', 'frontend'):
    cur = [strict(l) for l in (Path('rules')/f'{f}.md').read_text(encoding='utf-8').split('\n') if l.startswith('- ')]
    P = pool(f)
    print(f'{f}: current={len(cur)} pool={len(P)} not-in-pool={sum(1 for c in cur if c not in P)} pool-not-in-current={sum(1 for p in P if p not in cur)}')
    for c in cur:
        if c not in P: print('   + ', c)
    for p in P:
        if p not in cur: print('   - ', p)
print('--- 字节记账（应 Δ0 / Δ24 / Δ134）---')
old = {'base': 14318, 'gates': 4140, 'frontend': 2015}
for f in ('base', 'gates', 'frontend'):
    print(f'  {f}: {old[f]} -> {Path("rules/"+f+".md").stat().st_size} (Δ{Path("rules/"+f+".md").stat().st_size-old[f]})')
print('--- 哈希 ---')
for f in ('base', 'gates', 'frontend'):
    print(f'  {f}', hashlib.sha256((Path('rules')/f'{f}.md').read_bytes()).hexdigest())
PY
```

实测输出（摘要）：`base: 0 差异`；`gates: +1（A2.03 前缀句）/−1（原句）`；`frontend: +1（U-09）/−0`；字节 Δ = `0 / 24 / 134`；哈希 = `d4cc9a89…`（同 task-23）/ `ccf8693e…` / `1c6d4245…`。

### 7.9 遗留必修项与裁定

| # | 项 | 严重度 | 精确修法 |
|---|---|---|---|
| **D-1** | `rules/frontend.md:4` 仍写「按顺序执行**三节**：界面结构 → 组件与数据流 → 无障碍」，而文件现有 **4 节**（新增 `## 验收`） | **LOW** | 改为「按顺序执行四节：界面结构 → 组件与数据流 → 无障碍 → 验收。」（或「…→ 无障碍；验收单列一节」）。**注意**：这将是第 4 处改动，超出本次授权清单，需 Lead 授权后由写者落盘 |
| **D-2** | `review/08:83` 与 `:106` 的 U-09 语句用 `\`` 转义反引号 → 与 `rules/frontend.md:35` 不逐字一致，且在 CommonMark 代码跨度内渲染失效 | **LOW（记录性）** | 两处改用**双反引号**包裹，内层保持普通反引号（改为 `` ``…见 `gates.md`。`` ``）；或去掉内层反引号 |
| I-1 | `review/09:53` 写「待 delta 复核（`review/12`）」，但**不存在** `review/12`（本次 delta 复核落在 `review/10 §7`） | INFO | 把指针改为 `（`review/10` §7）` |
| I-2 | 通用条款（`gates.md:8` A1.44、覆盖率三条 `:39`-`:42`）字面未排除界面层 | INFO | 无需改动（U-09 已明确界面层不强制测试用例，属适用范围交叠而非冲突）；若 Lead 要零软张力，需另立授权 |
| I-3 | 机器比对的两处假阳性：`review/08` 的嵌套反引号（见 D-2）、`review/11` 的 7 行"改写包/台账索引"双源重叠（该表 `:208` 已自述"多重匹配 7"） | INFO | 无需改动（记录本轮核验方法） |

**最终裁定（针对 R-07 补记后的版本）：`rules/` 三文件（186 条）可作为最终交付物。** 两处授权改动全部核实且**无第四处**（哈希 + 字节记账 + 行级池比对三重互证）；计数 186 与清单一致；四项质检与相似度全绿（新对 0.2268，互补可接受）；溯源映射 186 行全覆盖、`A2.03` 的"授权改写"标注正确；`A2.03` 与 `U-09` 的冲突已解除。**D-1 与 D-2 为两条 LOW 项**（前者是 `rules/` 内的节数自述、后者是 `review/08` 的记录写法），均不影响 186 条正文的保真、冲突解除与执行语义；建议顺手修掉，修否不改变本裁定。

### 7.10 残余风险

1. **D-1 未修前**，`frontend.md` 的自述节数（三节）与实际节数（四节）不一致——读者按头部导航会漏掉「验收」节；不修则需在写入说明里另行提示。
2. **R-07 的适用范围只落在这两处**：`A1.42`/`A3.25` 已删、`A2.03` 已加豁免、U-09 给出正面政策；其余通用条款（A1.44、覆盖率）在字面上仍未排除界面层（I-2），若后续有项目按字面执行覆盖率门禁，可能出现与 U-09 的解释冲突。
3. **`review/12` 指针悬空**（I-1）：不影响规则集，但会误导后续读者去找不存在的文件。
4. 其余与 §5 相同：未核清单外内容、0.55 阈值依赖同一度量、可判性为人工全通读、行为效果不在本轮范围。

## §8 收口（after D-1/D-2/INFO）

> **对象**：D-1/D-2/INFO 三处修正后的 `rules/`（`base.md` / `gates.md` / `frontend.md`）。**只读复核**：未改 `rules/`；本文件是本轮唯一写入。
> **本报告写入 §8 前的冻结值**：`sha256 7379745641d6ac5fe75031ec5a2ebbb08682f4523c35d38e9eb2fbfcbac84b20` / 484 行。
> **被核验文件的最终冻结值**：`base.md` = `d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea`（自 task-23 起未变）、`gates.md` = `ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5`（自 task-24 起未变）、`frontend.md` = `e2d3cddf5a382921346c148c3bd7f754776e7433891203098a8486ef266abd80`。

### 8.1 三处修正逐字核实

| # | 修正 | 现文（实读） | 位置 | 结论 |
|---|---|---|---|---|
| D-1 | `frontend.md:4` 节数自述 | 「按顺序执行**四节**：界面结构 → 组件与数据流 → 无障碍 → **验收**。」 | `rules/frontend.md:4` | ✓ 与文件实际的 **4 个 `## `** 节一致（`界面结构`/`组件与数据流`/`无障碍`/`验收`） |
| D-2 | `review/08` 两处 U-09 用**双反引号**包裹 | `` ``界面交互层的改动由开发者自行验证，不强制测试用例；界面以外的验证要求见 `gates.md`。`` `` | `review/08:79`（`通用化改法`）、`review/08:106`（写入动作表） | ✓ 两处提取出的文本与 `rules/frontend.md:35` **逐字一致**（含内层普通反引号）；`review/08` 全文已无 `\`` 转义写法 |
| INFO | `review/09:53` 指针 | 「…待 delta 复核（**`review/10` §7**）；复核后追加 D-1 修正（`frontend.md` 头部"三节"→"四节"，属同一次授权改动的收尾）。」 | `review/09:53` | ✓ 不再指向不存在的 `review/12`；并注明 D-1 收尾 |

复跑（脚本见 8.6）：

```
review/08:79 content == rules/frontend.md:35 (marker stripped): True
review/08:106 content == rules/frontend.md:35 (marker stripped): True
review/08 still has escaped-\` form: False
frontend.md:4 == '按顺序执行四节：界面结构 → 组件与数据流 → 无障碍 → 验收。'
sections in frontend.md: 4
```

### 8.2 改动面：**只允许 `frontend.md:4` 一行**（已证明）

| 证据 | 结果 |
|---|---|
| **哈希对比** | `gates.md` = `ccf8693e…`（**与 task-24 相同**）、`base.md` = `d4cc9a89…`（与 task-23 相同）→ 两文件零改动 ✓ |
| **行级还原证明**（最强） | 把现 `frontend.md` 的 `:4` **还原**为 task-24 的旧文（「…三节：界面结构 → 组件与数据流 → 无障碍。」），所得内容 `sha256 = 1c6d42457f99c500…`、`2149 B`——**与 task-24 记录的冻结值逐位相同** → 除 `:4` 外**无任何字节变化** ✓ |
| **字节记账** | `frontend.md` `2149 → 2160` = **Δ+11**，恰等于 `len(' → 验收'.encode()) = 11` ✓ |
| 计数与格式 | `grep -c '^- '` = **133 / 34 / 19 = 186** ✓（与 `review/09:41-44` 一致）；三文件末字节均 `0a`、CRLF 计数 0 ✓ |

### 8.3 四项质检（全量 186 条重跑）

| 筛项 | 结果 |
|---|---|
| 负面起句（`不要/别/禁止/绝不/不得/避免`） | **0 条** |
| 模糊量词（`尽量/适当/合理/尽可能/酌情/视情况/差不多`） | **0 条** |
| 溯源泄漏（ID / `P:`/`K:`/`H:` / `review/` / `findings/` / 来源标签） | **0 条**（含新改的 `frontend.md:4`——它是节数自述，不含任何溯源标记） |
| 专名（79 词表） | **0 条**（`frontend.md:4` 仅含中文节名与箭头） |
| 相似度 ≥ 0.55（186 条两两 = 17 205 对） | **0 组** ✓ |

**说明**：`frontend.md:4` 是**头部导航行（非 `- ` 条目）**，不进入 186 条；它不构成新规则、不引入专名或泄漏，与既有 19 条无相似度关系（未参与 17 205 对——该扫描只对 `- ` 条目）。

### 8.4 溯源映射（`review/11`，改动后复验）

- 行数 **186**（base 133 / gates 34 / frontend 19）✓；
- 三文件的 `- ` 语句行号集与映射行号集**完全相等**（`same-set=True` ×3）→ **未匹配 0** ✓；
- 关键行仍在且标注正确：`| 7 | 14 | A2.03（09 授权改写，补界面豁免） | 授权改写 |`、`| 19 | 35 | U-09 | 用户新增（R-07 补记） |` ✓；
- 本次 D-1 只改头部行（`:4`），**不涉及任何被映射的语句行**，故映射表无需变动 ✓（表内自述「条目总数 186；未匹配 0；多重匹配 7」仍成立）。

### 8.5 最终裁定与终止声明（针对本次冻结版本）

**最终裁定：`rules/` 三文件（186 条）可作为最终交付物。** 针对以下 sha256：

| 文件 | sha256 | 条数 |
|---|---|--:|
| `rules/base.md` | `d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea` | 133 |
| `rules/gates.md` | `ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5` | 34 |
| `rules/frontend.md` | `e2d3cddf5a382921346c148c3bd7f754776e7433891203098a8486ef266abd80` | 19 |
| **合计** | — | **186** |

依据：三处修正全部逐字核实；`rules/` 改动面**仅 `frontend.md:4` 一行**（哈希 + 行级还原 + 字节记账三重互证）；计数与清单一致；四项质检与相似度全绿；溯源映射 186 行全覆盖、授权标注正确。

**终止声明：本报告至此无未闭环的必修项。** 上述冻结值是本次核验的最终基线；**此后 `rules/` 任何一处改动都会使本裁定失效，须重新核验**（至少重跑 §6-A/B 的双向逐字比对 + §6-E 的相似度扫描 + §8.6 的改动面证明）。

### 8.6 复跑命令

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re, hashlib
from pathlib import Path
def strict(s): return re.sub(r'^-\s*', '', s.strip()).strip()
fe = Path('rules/frontend.md').read_text(encoding='utf-8')
print('frontend.md:4 ==', repr(fe.split('\n')[3]))
print('sections in frontend.md:', sum(1 for l in fe.split('\n') if l.startswith('## ')))
fe35 = strict(fe.split('\n')[34])
u08 = Path('review/08-user-rules.md').read_text(encoding='utf-8').split('\n')
for idx in (78, 105):
    m = re.search(r'``(.+?)``', u08[idx])
    print(f'review/08:{idx+1} content == frontend.md:35:', (m.group(1) if m else None) == fe35)
print("review/08 has escaped-\\` form:", '\\`' in '\n'.join(u08))
for f in ('base', 'gates', 'frontend'):
    raw = (Path('rules')/f'{f}.md').read_bytes()
    print(f'{f}: items={sum(1 for l in raw.decode().split(chr(10)) if l.startswith("- "))} bytes={len(raw)} sha={hashlib.sha256(raw).hexdigest()}')
# 行级还原证明：把 frontend.md:4 换回 task-24 旧文，SHA 应 = 1c6d4245…
old = '按顺序执行三节：界面结构 → 组件与数据流 → 无障碍。'
new = '按顺序执行四节：界面结构 → 组件与数据流 → 无障碍 → 验收。'
recon = '\n'.join([old if l == new else l for l in fe.split('\n')])
h = hashlib.sha256(recon.encode()).hexdigest()
print('revert-line4 sha:', h)
print('matches task-24 freeze (1c6d42457f99c500…):', h == '1c6d42457f99c50081ee054d4a8e4d352c96350e157ddef7e4e43d55cdfa222b')
PY
```

实测输出：

```
frontend.md:4 == '按顺序执行四节：界面结构 → 组件与数据流 → 无障碍 → 验收。'
sections in frontend.md: 4
review/08:79 content == frontend.md:35: True
review/08:106 content == frontend.md:35: True
review/08 has escaped-\` form: False
base: items=133 bytes=14318 sha=d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea
gates: items=34 bytes=4164 sha=ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5
frontend: items=19 bytes=2160 sha=e2d3cddf5a382921346c148c3bd7f754776e7433891203098a8486ef266abd80
revert-line4 sha: 1c6d42457f99c50081ee054d4a8e4d352c96350e157ddef7e4e43d55cdfa222b
matches task-24 freeze (1c6d42457f99c500…): True
```

### 8.7 「已记录、不再追改」清单

| # | 项 | 为何不追改（按停止规则：不可复现影响，或纯记录性/措辞性） |
|---|---|---|
| R-1 | 通用条款未显式排除界面层：`gates.md:8`（A1.44「按改动面枚举所需的测试层级」）与覆盖率三条（`gates.md:39`-`:42`） | 字面**不要求**界面交互层必须有测试用例；`U-09`（`frontend.md:35`）+ `A2.03` 的范围限定已给出适用边界，二者是适用范围交叠而非直接冲突（§7.4 逐条判定 29 条均无强要求）。若要零软张力需**另立授权改动**，超出本轮范围 |
| R-2 | `review/11` 7 行「改写包 / 台账索引」双源重叠（`R5、R5` 等） | 同一文本在两处存在的**正常重叠**，映射表 `:208` 已自述「多重匹配 7」；不含矛盾，不需要改 |
| R-3 | 逐字保真的"池"仍以 `review/08` / `review/06` / 台账索引为源，`review/11` 只记 ID 不记文本 | 设计如此（`review/11:3` 声明 `rules/` 不含溯源信息、本表是唯一对应关系）；复跑时以程序匹配代替人工核对，成本低且已通过 |
| R-4 | 行为效果未验（规则文本是否真的改变 agent 行为） | 不可由静态核验证明（需对照实验），属 §5 已声明的范围局限，非缺陷 |
| R-5 | 本轮核验脚本的两处已知假阳性处理（`review/08` 曾用嵌套反引号；`review/11` 的双源行） | 已在 §7.3/§7.6 记录方法差异；D-2 修掉后第一处已消失，第二处按 R-2 记录 |

**本清单为空的部分说明**：§4/§7 的 I-1（`review/12` 悬空指针）、I-2（软张力）、D-1、D-2 均已在本轮**修掉或转为记录项**，无遗留必修。

### 8.8 残余风险（收口后）

1. **静态核验的固有限制**：本轮核验的是文本（条数、逐字、质检、映射），**不是行为效果**；`rules/` 是否真的改变 agent 行为需另行对照实验（R-4）。
2. **冻结值失效条件**：任何一处 `rules/` 改动都会使 §8.5 的裁定失效（终止声明已写明）；`review/08`/`09`/`11` 的记录改动不影响 `rules/` 裁定，但会影响"授权链"的可追溯性，建议改动时同步更新。
3. **相似度阈值口径**：0.55 与 `difflib` 比率是本项目声明的度量（`A2.60`↔`A2.72` = 0.2687 可复现）；若换度量，命中集合可能变化。
4. **未核范围同 §5**：清单外内容（148+ 条之外的语境）、台账标签本身的对错、写入阶段的后续维护。

## §9 δ 核验（`gates.md` 头部范围声明，R-1 收口）

> **对象**：`rules/gates.md` 头部新增文件级范围声明行（`:5`）后的三文件。**只读核验**：未改 `rules/`；本文件是本轮唯一写入。
> **本报告写入 §9 前的冻结值**：`sha256 416072f42428b068c09d4462dd827ead34cfb8ed2514cfeac80e7740c64f7da8` / 616 行。
> **新冻结值**：`base.md` = `d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea`（自 task-23 未变）、`frontend.md` = `e2d3cddf5a382921346c148c3bd7f754776e7433891203098a8486ef266abd80`（自 task-25 未变）、`gates.md` = `8f9104db082132e7f5fa841599ad84b2945afecb5ba1621942919c74f855b0d1`。

### 9.1 新增行与改动面（三重证据，**无第四处**）

新行（`rules/gates.md:5`）：

```
界面交互层的验收以 `frontend.md` 的「验收」节为准；本文件的测试与覆盖率要求适用于界面以外的代码。
```

| 证据 | 结果 |
|---|---|
| ① 另两文件零改动 | `base.md` / `frontend.md` 的 sha256 与 task-25 冻结值**相同**（`d4cc9a89…` / `e2d3cddf…`）✓ |
| ② 行级还原证明 | 删掉现 `:5` 后，`gates.md` 内容 `sha256 = ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5`、`4164 B`——与 task-25 冻结值**逐位相同** ✓ |
| ③ 字节记账 | `gates.md` `4164 → 4303` = **Δ139** = 新行 UTF-8 字节数 **138** + 1（换行）✓ |
| 计数 | `grep -c '^- '` 仍 **133 / 34 / 19 = 186**（新行是头部段落、非 `- ` 条目）✓ |
| 格式 | 三文件末字节均 `0a`、CRLF 计数 0 ✓ |

### 9.2 头部自洽与指针闭环

| 检查 | 结果 |
|---|---|
| `gates.md:3` 自述节名列表 vs 实际 `## ` 节 | 「选证据、最小检查与内环、门禁纪律、覆盖率与预算、生成物与持续集成」= 实际 5 节（`:7`/`:17`/`:27`/`:38`/`:47`）**名称与顺序一致** ✓；新行未引入节数/结构不一致（它不是标题） |
| `gates.md:5` → `frontend.md`「验收」节 | `frontend.md` 确有 `## 验收` 节（`:33`）✓，`:35`（U-09）为其唯一语句 ✓ |
| `frontend.md:35` → `gates.md` | 现文「界面以外的验证要求见 `gates.md`」✓ |
| 双向一致性 | `:5` 与 `frontend.md:35` **互指且分工一致**（`:5` 管"界面以外的测试/覆盖率"、U-09 管"界面以内不强制测试用例"）✓；文件内跨文件引用有先例（`gates.md:4` 已引 `base.md`）✓ |

### 9.3 R-1 收口判定（逐条）

> **行号说明**：task-26 任务书引用的 `:8`/`:11`/`:39`–`:42` 是**插入前**的行号；插入 `:5` 后这些条款整体下移一行，现为 **`:9`（A1.44）/`:12`（A3.02）/`:40`–`:43`（覆盖率）**。

| R-1 原条目 | 现行号 | 现文要点 | 是否被 `:5` 覆盖 | 判定 |
|---|--:|---|---|---|
| `A1.44`（规划改动时按改动面枚举测试层级） | **`:9`** | 按改动面枚举所需测试层级、把缺失设施纳入同一次改动 | 界面交互层改动下，`:5` 已把本文件的**测试要求**限定为"界面以外"，故本条的枚举结果对界面层不产生测试用例义务 | **已收口 ✓** |
| `A3.02`（每个行为改动都配一条最窄检查） | **`:12`** | 每个行为改动配一条会因该回归而失败的检查 | 同属"测试/检查要求"，界面交互层由 `:5` 排除、改按 `frontend.md` 验收节（开发者自验）→ 不再与 U-09 冲突 | **已收口 ✓** |
| 覆盖率四条 | **`:40`–`:43`** | 覆盖率按文件判定、豁免需理由、不得掩盖、测试选择与覆盖范围两套口径 | `:5` **显式**写了"覆盖率要求适用于界面以外的代码"→ 界面层不再被覆盖率门禁要求 | **已收口 ✓** |
| 附带（本轮新核） | `:13`（先把任务改写成一处可运行的检查）、`:18`（非平凡逻辑留一处检查）、`:30`（注册型贡献须有可回收测试） | 均为"测试/检查"类要求 | 由 `:5` 的"测试要求"一并排除界面层，**无残余字面冲突** | **已收口 ✓** |

**结论**：R-1 的三处（+附带三处）字面冲突已被 `:5` 的文件级范围声明覆盖；`gates.md` 内**不再存在**"要求界面交互层必须有测试用例/覆盖率"的字面条款。**R-1 关闭。**

### 9.4 四项质检（全量 186 条重跑）+ 新行判定

| 筛项 | 结果 |
|---|---|
| 负面起句 | **0 条** |
| 模糊量词 | **0 条** |
| 溯源泄漏（ID / `P:`/`K:`/`H:` / `review/` / `findings/` / 来源标签） | **0 条** |
| 专名（79 词表） | **0 条** |
| 相似度 ≥ 0.55（17 205 对） | **0 组** ✓ |

**新行本身的判定**（`gates.md:5`，非 `- ` 条目、不进 186）：不含台账 ID、不含 `P:`/`K:`/`H:`、不含 `review/` 路径、不含来源标签（`pat.search` = False）✓；79 词表专名命中 **0** ✓；唯一点名的 `frontend.md` 是**同一规则集内的文件名**（同文件 `:4` 已引 `base.md`、`frontend.md:3` 引 `base.md`），**非厂商/产品专名、非溯源标签 → 可接受** ✓。

### 9.5 INFO：条款级豁免（`:15`）与文件级声明（`:5`）是否语义重复？

实测相似度：`sim(:5, :15 A2.03)` = **0.2075**、`sim(:5, frontend:35 U-09)` = **0.3107**、`sim(:15, frontend:35)` = 0.2268——三者两两均远低于 0.55，**不构成机械重复**。

**建议：保留 `:15` 的「除界面交互层外，」，不删。** 理由：

1. **粒度不同、职责不同**：`:5` 是**文件级范围声明**（回答"本文件的要求管到哪"），`:15` 的从句是**条款级主语限定**（回答"这一条要求谁做到"）。删掉从句后，`:15` 单读会重新变成"用户可见的能力必须有…测试"——正是 R-07/R-1 要消除的冲突形态。
2. **规则语句会被单独消费**：agent 或评审者可能只读一条语句（引用、检索、单条摘录）而不读文件头；条款自带范围才不会在脱离上下文时误读。这是"每条可独立成立"的既有约定（`review/00-schema.md:49` 的规范句契约）。
3. **成本极低、收益不对称**：从句 8 个字符；删掉它换来的是"文件头一旦被截断/忽略即政策回退"的风险。
4. **层叠不是冗余而是设计**：`:5`（文件级）+ `:15`（条款级）+ `frontend.md:35`（正面政策）= 任务书所述"三层"，三者**一致地**排除同一层，无相互矛盾。
5. 若 Lead 仍想减少重复，**不建议删 `:15` 从句**，更稳的做法是在 `review/09` 的裁决记录里加一句"`:15` 的从句是 `:5` 在条款级的重述，保留以保自包含"——纯记录、不改 `rules/`（本轮不动）。

### 9.6 本轮发现：`review/11` 的 gates 段行号整体 +1 陈旧（记录性，按停止规则不再回环）

**事实（可复现）**：`:5` 的插入使 `gates.md` 的 34 条语句整体下移一行，而 `review/11` 的 gates 段记录的是**绝对行号**（生成于插入前），因此 **34/34 行全部偏小 1**：

```
gates: stmt_lines=34 mapped=34 same-set=False mapped+1==stmt_lines=True   ← 整体偏移 +1
base : stmt_lines=133 mapped=133 same-set=True                            ← 未受影响
frontend: stmt_lines=19 mapped=19 same-set=True                           ← 未受影响
```

样例：map 第 2 行写 `| 2 | 9 | A1.11 |`，但 `gates.md:9` 是 `A1.44` 的正文（A1.11 在 `:10`）；map 第 7 行写 `| 7 | 14 | A2.03 |`，但 `:15` 才是 A2.03 的授权改写句（`:14` 是 A3.02）。逐行核验：**30/34 行按 +1 后与台账原文逐字相符**，其余 4 行（`A2.03` 的 09 授权改写、`P-59`/`P-60`/`P-63` 的改写包文本）按 +1 后与其**非台账来源**（授权改写/改写包）逐字相符 → **偏移是均匀的 +1，修复即"gates 段行号 +1"**。

**为什么不升级为必修（按 task-26 停止规则）**：该问题**不影响 186 条正文的保真**（三条语句集与源文本的逐字一致性已独立复核，见 §8/§9.4），也**不影响执行语义**（`rules/` 文本未变）；它只影响**溯源表的可点击性**。故记入「已记录、不再追改」。

**若 Lead 决定刷新（一行机械修改，本轮不做）**：把 `review/11` 的 `rules/gates.md` 段 34 行的第 2 列全部 `+1`（`:8→9`、`:9→10`、…、`:53→54`）；或在该段标题后加一句"本段行号为 `:5` 插入前编号，实际行号 +1"。刷新后 `same-set` 恢复为 `True`，无需再走一轮人工核验——§9.7 的脚本可直接复检。

> **顺带更正**：`review/10` §8.4 曾记「三文件语句行号集与映射行号集完全相等」——在 `:5` 插入前成立；本轮起 gates 段不再成立（base/frontend 仍成立）。该历史结论以 §9.6 为准。

### 9.7 复跑命令

```bash
cd /home/leihaohao/workspace/agent-rules && python3 - <<'PY'
import re, hashlib
from pathlib import Path
def strict(s): return re.sub(r'^-\s*', '', s.strip()).strip()
for f in ('base', 'frontend'):
    print(f, hashlib.sha256((Path('rules')/f'{f}.md').read_bytes()).hexdigest())
g = Path('rules/gates.md'); raw = g.read_bytes(); lines = raw.decode().split('\n')
print('gates items:', sum(1 for l in lines if l.startswith('- ')), 'bytes:', len(raw), 'sha:', hashlib.sha256(raw).hexdigest())
print('line5 bytes:', len(lines[4].encode()), '| delta:', len(raw) - 4164)
recon = hashlib.sha256('\n'.join(lines[:4] + lines[5:]).encode()).hexdigest()
print('revert-line5 sha == ccf8693e…:', recon == 'ccf8693eb1f823e93828c31ec2b5665608948fd66acb3fba99c5451496060aa5')
print('line5:', repr(lines[4]))
print('header sections claim:', repr(lines[2]))
print('actual sections:', [l for l in lines if l.startswith('## ')])
mp = Path('review/11-provenance-map.md').read_text(encoding='utf-8').split('\n')
rowre = re.compile(r'^\|\s*(\d+)\s*\|\s*(\d+)\s*\|')
sec = None; rows = []
for l in mp:
    m = re.match(r'^##\s+`rules/(\w+)\.md`\s*——', l)
    if m: sec = m.group(1); continue
    m = rowre.match(l)
    if m and sec: rows.append((sec, int(m.group(2))))
print('map rows total:', len(rows))
for f in ('base', 'gates', 'frontend'):
    sl = [i+1 for i, l in enumerate((Path('rules')/f'{f}.md').read_text(encoding='utf-8').split('\n')) if l.startswith('- ')]
    mapped = sorted(ln for s, ln in rows if s == f)
    print(f'{f}: stmt={len(sl)} mapped={len(mapped)} same-set={sl==mapped} mapped+1==stmt={sorted(x+1 for x in mapped)==sl}')
PY
```

实测输出（摘要）：`base`=`d4cc9a89…`、`frontend`=`e2d3cddf…`（零改动）；`gates items=34 bytes=4303 sha=8f9104db…`、`line5 bytes=138 delta=139`、`revert-line5 sha == ccf8693e…: True`；节名列表与 5 个 `## ` 节一致；映射 `186` 行、`gates same-set=False / mapped+1==stmt=True`、`base/frontend same-set=True`。

### 9.8 最终裁定与终止声明（针对本次冻结版本）

**最终裁定：`rules/` 三文件（186 条）可作为最终交付物。** 针对以下 sha256：

| 文件 | sha256 | 条数 |
|---|---|--:|
| `rules/base.md` | `d4cc9a8979e534b1eddc7a15f4babbc8b3598cc530cbb2475945f1f64ffe26ea` | 133 |
| `rules/gates.md` | `8f9104db082132e7f5fa841599ad84b2945afecb5ba1621942919c74f855b0d1` | 34 |
| `rules/frontend.md` | `e2d3cddf5a382921346c148c3bd7f754776e7433891203098a8486ef266abd80` | 19 |
| **合计** | — | **186** |

依据：新增行核实、改动面**仅此一行**（哈希 + 行级还原 + 字节记账三重互证）；计数仍 186；头部自洽；指针双向闭环；**R-1 关闭**（`A1.44`/`A3.02`/覆盖率三组字面冲突均被文件级范围声明覆盖）；四项质检全绿；INFO 的层叠判定为"保留"、非重复。

**终止声明：本报告至此无未闭环的必修项。** 上述冻结值是最终核验基线；**此后 `rules/` 任何改动都会使本裁定失效，须重新核验**（至少重跑 §6-A/B 双向逐字比对 + §6-E 相似度 + §9.7 改动面证明）。`review/11` 的 gates 段行号陈旧属记录性事项（§9.6，已给一行修法），**不影响本裁定**。

### 9.9 「已记录、不再追改」清单（截至 §9）

| # | 项 | 分类 | 理由 / 若需处理的最小动作 |
|---|---|---|---|
| R-1 → **已关闭** | 通用条款未排除界面层 | — | 已由 `gates.md:5` 文件级范围声明收口（§9.3） |
| R-2 | `review/11` 的 gates 段 34 行行号整体 +1 陈旧 | 记录性 | 不影响 186 条保真与执行语义（§9.6）；如需刷新：gates 段第 2 列全部 +1 |
| R-3 | `review/11` 7 行「改写包 / 台账索引」双源重叠 | 记录性 | 表内 `:208` 已自述"多重匹配 7"，正常重叠 |
| R-4 | `gates.md:5` 与 `:15` 的层叠范围声明 | 设计如此 | §9.5 建议保留；如需减重，优先在 `review/09` 加一句说明而非删从句 |
| R-5 | 行为效果未验（规则文本是否改变 agent 行为） | 范围局限 | 不可由静态核验证明，需对照实验 |
| R-6 | 相似度阈值口径（0.55 / `difflib`） | 口径 | 本项目既定度量（`A2.60`↔`A2.72`=0.2687 可复现）；换度量需重扫 |

### 9.10 残余风险（收口后）

1. **`review/11` gates 段行号陈旧**（R-2）：按表定位 gates 条目的读者会落到上一行；`rules/` 本体不受影响。
2. **静态核验的边界**：不覆盖行为效果（R-5）；`0.55` 阈值依赖既定度量（R-6）。
3. **冻结值失效条件**：任何 `rules/` 改动都会使 §9.8 裁定失效；`review/` 内记录文件的改动不影响 `rules/` 裁定，但会影响溯源链（`review/11`）的可点击性。
4. **未核范围同 §5**：清单外语境、台账标签本身的对错、写入后的长期维护。
