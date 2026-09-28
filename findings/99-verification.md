# 99 — 三篇 findings 的独立对抗性核验（verifier 视角）

> 核验者：`citation-verifier`（fresh 上下文，不继承 Lead/分析者的推理）。本文是唯一被核验者允许写入的文件；三篇被核验文档**一字未改**（§0.1 与 §1.6 的 sha256/git status 一致即为证据）。
> 引用被核验文档用 `文件名:行号`；引用一手快照用 `源码:path:line`。所有命令在 `/home/leihaohao/workspace/agent-rules` 下可直接粘贴复跑（附录 A 的脚本存为 `/tmp/va.py`）。
> 全程只读：未运行快照的 `pnpm`/构建/`scripts/verify-*`/生成器，未碰 `node_modules`，未执行任何 git 写命令。

## §0 结论摘要

### 0.1 审计对象冻结（与 Lead 冻结基线逐字比对）

```
$ sha256sum findings/01-ponytail.md findings/02-andrej-karpathy-skills.md findings/03-deepseek-harness.md
145ebaa8bc2de589456e1ca0b16162f7b2cdde9463d1a92da152b14e6759f2bd  findings/01-ponytail.md
daae55201d66e6028f5c6c5f4456f4bf54e6438fcb8add63bcea24b58f717782  findings/02-andrej-karpathy-skills.md
54cfa137485eb51ddd86f726e163a4a121ed4a0c10802b00fe9d44d086bd2ea3  findings/03-deepseek-harness.md
$ wc -l findings/0{1,2,3}-*.md
   449 findings/01-ponytail.md
   373 findings/02-andrej-karpathy-skills.md
   544 findings/03-deepseek-harness.md
```

| 文档 | Lead 冻结 sha256 | 实测 sha256 | 行数（冻结/实测） | 结论 |
|---|---|---|---|---|
| `findings/01-ponytail.md` | `145ebaa8…f2bd` | 同 | 449 / 449 | **一致** |
| `findings/02-andrej-karpathy-skills.md` | `daae5520…7782` | 同 | 373 / 373 | **一致** |
| `findings/03-deepseek-harness.md` | `54cfa137…2ea3` | 同 | 544 / 544 | **一致** |

审计对象冻结成立：3/3 sha256 与行数逐字相符，**无致命项**。三个一手快照 HEAD 亦未漂移：`.refs/ponytail` = `e3ba2aa6…56156`（porcelain 0 行）、`.refs/andrej-karpathy-skills` = `2c606141…b9c2`（porcelain 0 行）、`/home/leihaohao/workspace/deepseek-harness` = `477b4f42…c443`（`status --short` 0 行）。

### 0.2 每篇裁定

**第一轮（原裁定，针对第 1 版 sha256——见 §0.1）。**

| 文档 | PASS | FAIL（严重度） | UNVERIFIED | 裁定 |
|---|--:|--:|--:|---|
| `01-ponytail.md` | 15 | 3（LOW 2、INFO 1） | 1 | **可作为落地依据**；3 处引用精度瑕疵须修（§2.1），均不影响其结论 |
| `02-andrej-karpathy-skills.md` | 11 | 2（LOW 2） | 2 | **可作为落地依据**；2 处计数/证据陈述须修（§2.2），均不影响其结论（另有 1 条 INFO 引文形态建议） |
| `03-deepseek-harness.md` | 21 | 3（MED 2、LOW 1） | 1 | **可作为落地依据（有保留）**；2 处规模数字（`verify-*.ts` 拆分、`ci.yml` job 数）必须修，否则规模断言不可引用（§2.3） |

（计数口径：每行的 PASS/FAIL/UNVERIFIED 和 = §1 对应表的行数：`01` 19 行、`02` 16 行、`03` 25 行；标 INFO 的观察不计入 PASS/FAIL。）

总计 **8 条必须修正项**；未发现任何伪造引文、未发现无法复现的瑕疵被当作证据、未发现"prompt-only 被写成有 gate"的反向错误（三篇对强制形式的判定均与其源码相符）。

**第二轮（新裁定，针对修正后的新 sha256：`01` = `3994bc8a…a713` / 471 行；`02` = `3f2fc6e6…ddf` / 400 行；`03` = `6570dbc4…d40` / 598 行；详见 §4）。**

| 文档 | 原裁定 → 新裁定 | 原因（依据 §4） |
|---|---|---|
| `01-ponytail.md` | 「可作依据 + 3 瑕疵」→ **可作为落地依据（先改 1 行）** | §2.1 的 3 条已逐字落地（§4.2 #1–#3）；但修正把 P-09 的引用从 2 条增到 3 条，`01:430` 的自审输出仍写 `citations=110`（实为 111）——修正引发的新增不一致 1 条（§4.3 新发现 A，LOW）。该数字不影响任何结论 |
| `02-andrej-karpathy-skills.md` | 「可作依据 + 2 瑕疵」→ **可作为落地依据** | §2.2 的 2 条必修 + 1 条建议全部落地（§4.2 #4–#5、§4.3）；回归口径（50/50、F=9、字节关系、83/62/21）全部复测通过（§4.4） |
| `03-deepseek-harness.md` | 「可作依据（有保留）」→ **可作为落地依据** | **保留解除**：2 处规模数字（`verify-*.ts` 27/41、`ci.yml` 11 job）已修正并双仪器复测（§4.2 #6–#7）；§8 的 325/337/12 口径已写明并同步行数自指（544 → 598）（§4.2 #8） |

**结论：三篇均可作为落地依据。** 唯一残留项是 `01:430` 的 `110 → 111`（§4.3 新发现 A）；修掉后本轮无未闭环项。

> **最终冻结状态（本节之后的全部结论以 §4.9 为准）**：`01` 的 sha256 在此后继续更新两次——`3994bc8a…`（471 行，第二轮）→ `4619670f…`（472 行，task-9 修掉新发现 A）→ **`ff2ab781…`（472 行，task-11 修掉新发现 B 与命令内联）**；`02`/`03` 自第二轮起未再变动。终止声明见 §4.9。

### 0.3 最严重 3 条（含文件与行号）

1. **`03-deepseek-harness.md:245`**（MED）——B1 写「68 个 `verify-*.ts`，其中 **34** 个 `*.spec.ts`、**34** 个被测脚本」；实测 **27** spec / **41** 非 spec。两侧数字全错，且 34+34=68 的闭合掩盖了错误。命令见 §2.3-1。
2. **`03-deepseek-harness.md:277`（另见 `:381`）**（MED）——B7/§5 写 `ci.yml`「**20 个 job**」；实测 jobs 块下只有 **11** 个 job 键（10 个 job + `all-checks-passed`；`node-compat` 是 3 元矩阵）。20 是 workflow 总数，被误写成 job 数。命令见 §2.3-2。
3. **`02-andrej-karpathy-skills.md:235`**（LOW）——§7-3 写「**36 个围栏行**位置完全一致」；README/README.zh 各只有 **12** 个围栏行（6 个代码块）。36 是 `EXAMPLES.md` 的数字，且与该句自己的分解（9 个 ```、```bash×2、```markdown = 12）自相矛盾。命令见 §2.2-1。

## §1 逐条核验表

### 1.0 全量口径（先给总数与命中数，再给方法）

| 审计 | 覆盖 | 结果 |
|---|---|---|
| `path:line` 全量解析 | 三篇全部带前缀引用去重后 **568** 条（P 126 / K 74 / H 368） | **568/568 路径存在且行号在文件行数内，bad=0** |
| 01 引文包含性（全量） | 63 条 `[P-NN]` 的 110 条引用、78 个引文片段 | `items=63 citations=110 quoted=63 fragments=78 **miss=0**`（与 `01-ponytail.md:430` 自述逐字一致） |
| 01 条目外 blockquote | 全文 5 处（`:3`–`:5`、`:231`、`:261`） | 4 处非源引文或锚点就在同段；`:261` 引文确实在 `scripts/check-rule-copies.js:76`，但该行只写裸 `:76`（见 V01-15） |
| 02 引文包含性（全量） | 表格行「1 个 `K:` 锚点 + 1 个「」引文」**50** 行 | **OK=50 FAIL=0**（与 `02-andrej-karpathy-skills.md:282` 自述一致）；另全量扫「含英文的「」引文」61 条 → 50 条逐字命中，11 条为中文转述/压缩引文（非逐字引文，见 V02-14） |
| 03 引文包含性（全量） | 全文 ASCII 双引号片段（按 `…`/`\|` 切分）**337** 段 | **325 段命中同行 `H:` 引用区间**；12 段未命中且全部可归类为非源引文（2 段 `node -e` 命令串、4 段锚点在前文、5 段 §8 修正记录自引、1 段方法说明词 `引文`）→ 与 `03-deepseek-harness.md:500` 的「325」吻合，但口径须写明（V03-23） |
| 计数与规模断言 | 三篇全部数字 | 逐条见 1.1–1.3；共 **8** 条不成立 |
| 定种随机抽样 | 每篇 8 条，seed `20260927` | 24/24 深核通过（1.5） |

命令：`python3 /tmp/va.py`（附录 A 全文）。**注：§1 的全部数字是第 1 版文档（§0.1 冻结值）的第一轮实测；修正后（新 sha256）的回归数字见 §4.4。**

### 1.1 `01-ponytail.md`（P 前缀，快照 `.refs/ponytail` @ `e3ba2aa6`）

| ID | 断言（核验对象） | 方法（可直接复跑） | 证据 | 结论 |
|---|---|---|---|---|
| V01-01 | 166 个纳入版本控制的文件；`README.md` 395 行 | `git -C .refs/ponytail ls-files \| wc -l`；`wc -l .refs/ponytail/README.md` | 166；395 | PASS |
| V01-02 | §5 各文件行数（skills 6：120/57/41/44/50/71；hooks 6 js：115/169/98/155/144/77；4 json：41/21/17/26；statusline 18/24；docs 49/196/211；scripts 76/78；workflows 36/24；benchmarks 108） | `wc -l` 逐文件（见附录 B.1） | 全部一致 | PASS |
| V01-03 | 7 份投影行数 36/30/30/30/30/30/35；`commands/*.toml` 2×6；`.opencode/command/*.md` 5×6；`.openclaw/skills/*` {108,52,47,41,37,70}；pi/mcp/py 211 / 217+21 / 26+52；scripts 四件 60/135/77/75（合 347）；tests 16 个合 2070 | `wc -l` 逐文件 | 全部一致（`.openclaw` 为同一多重集，合 355） | PASS |
| V01-04 | `examples/*.md`（11 个示例）行数 `71+211+31+156+35+58+62+37+272+390+41`；`examples/README.md` 17 | `ls examples/*.md \| wc -l`（→12）；`wc -l examples/*.md` | 12 个 = `README.md` 17 + 11 个示例（与文档列表一致） | PASS |
| V01-05 | 63 条规则、110 引用、78 片段、0 miss（§7.1 S0） | `python3 /tmp/va.py` | `items=63 citations=110 fragments=78 miss=0` | PASS |
| V01-06 | 7/7 投影与 canonical 逐字节相等（§3.2a/§4/S4） | 重实现 `check-rule-copies.js` 的 canonical 与 7 个 normalizer（附录 B.2；**未执行快照脚本**，约束见 §3） | `copies listed: 7`，7/7 `MATCH` | PASS |
| V01-07 | canonical/各副本「**2491 字节**」（`:243`、`:281`、`:441`） | `python3 -c` 计算 canonical 的 `len()` 与 UTF-8 字节数（附录 B.2） | **2491 字符 / 2494 UTF-8 字节**（差异 = `—`(U+2014) +2B、`²`(U+00B2) +1B） | **FAIL（LOW）**：单位写错，数字是字符数 |
| V01-08 | 9 条不变量（`:44-58`）且同时存在于 SKILL.md 与 AGENTS.md；成功输出行 | 重实现（附录 B.2）；`sed -n '76p' scripts/check-rule-copies.js` | 9 条全命中；`76` 行为 `` console.log(`Rule copies match AGENTS.md; ${INVARIANTS.length} …`) `` → 9 | PASS |
| V01-09 | 8 个版本文件同为 `4.10.0`；脚本注释却写 "seven files"（§6.2） | 重实现 `VERSION_FILES` 数组（附录 B.2）；`sed -n '2,3p' scripts/check-versions.js` | 数组 8 项，全部 `4.10.0`；`:2` 注释确写 "seven files" | PASS |
| V01-10 | **T**：hook 不能阻断 —— `exit(2)`/`permissionDecision` 0 命中；`deny` 1 处且只说宿主能力；`hooks/` 的 `process.exit(` 9 次全为 0 | `grep -rnF -e 'exit(2)' -e 'permissionDecision' -e 'permissionDecisionReason' --exclude-dir=.git -I . \| wc -l`（→0）；`grep -rnF 'deny' …`（→1，`docs/cursor-hooks.md:121`）；`grep -rn 'process\.exit(' hooks/` | 0 / 1 / 9（9×`exit(0)`，0 非零） | PASS |
| V01-11 | **T**：真正变红的层级 —— CI 三步顺序与两处脚本 gate；`:63-64` 的「never blocks」 | `grep -n -A2 'name:' .github/workflows/test.yml`；`sed -n '63,64p' docs/cursor-hooks.md`；重实现两脚本 | `Check rule copies`→`Check version consistency`→`Run tests`（`:29`/`:32`/`:35`）；「Cursor treats exit code 2 as "block" … ponytail never blocks anything.」逐字 | PASS |
| V01-12 | **T**：`ponytail:` 标记数四口径 21/31/32（`.md` 10、`tests/` 1） | `git grep -nE '(#\|//) ?ponytail:' -- . ':(exclude)tests' \| grep -v '\.md:' \| wc -l` 等四命令（附录 B.3） | 21 / 31 / 32 / 10 / 1 | PASS |
| V01-13 | **T**：`<!-- ponytail:` 4 处且路径为 `README.md:69`、`examples/modal-dialog.md:45`、`README.ko.md:58`、`README.es.md:58` | `grep -rnF '<!-- ponytail:' --exclude-dir=.git .` | 4 处，路径逐一相符 | PASS |
| V01-14 | P-09（`:71`）「`review` 不是合法默认档」的第二锚点 `P:hooks/ponytail-config.js:16-18` | `grep -n 'VALID_MODES\|RUNTIME_MODES\|valid default' hooks/ponytail-config.js` | `:17` = `VALID_MODES = ['off','lite','full','ultra','review']`（**含** review）；支持句在 `:79-81`、`:91`、`:137` | **FAIL（LOW）**：锚点指向会读出相反结论的行（断言本身为真，第一锚点 `mode-tracker.js:57` 已支持） |
| V01-15 | `:259` 用裸 `:60-69`、`:76` 指代 `scripts/check-rule-copies.js`；`:261` 引文 | `grep -n '60-69\|:76' findings/01-ponytail.md`；`sed -n '76p' scripts/check-rule-copies.js` | 引文确在 `:76`，但该行无文件路径前缀，读者/机器需回溯 14 行才能确定文件 | **FAIL（INFO）**：可复现性瑕疵，非事实错误 |
| V01-16 | **T**：Gemini 侧 3 条不变量 + `hooks/hooks.json` 必须不存在 | `sed -n '34,38p;70,77p;85,90p' tests/gemini-extension.test.js` | 3 条逐字；`existsSync(...) === false` 断言在 `:85-90` | PASS |
| V01-17 | 定种抽样 8 条：P-05/08/16/21/32/58/61/63 | 逐条打开源文件比对（§1.5） | 8/8 相符（含 `config.js:40-43`、`SKILL.md:8-15`、`check-rule-copies.js:44`、`build-openclaw-skills.js:7-8`、`package.json:38`） | PASS |
| V01-18 | 「hook」token 的强度 = 送达 + 跟踪，不阻断（§3.1/§3.3） | `sed -n '80,131p' hooks/ponytail-runtime.js`；`grep -rnE 'permissionDecision\|"decision"\|hookSpecificOutput' hooks/*.js` | 输出只有 `additionalContext`/`additional_context`/`{}`/`systemMessage`，无 decision 字段 | PASS |
| V01-19 | `S1`/`S2` 的「实测运行输出」字符串 | 无法执行（约束 §3）→ 以重实现 + 源码插值推导 | `Rule copies match AGENTS.md; 9 rule invariants present…`、`All 8 version files pinned at 4.10.0.` 与源码一致 | UNVERIFIED（运行输出未执行，语义已重实现验证） |

### 1.2 `02-andrej-karpathy-skills.md`（K 前缀，快照 `.refs/andrej-karpathy-skills` @ `2c606141`）

| ID | 断言 | 方法 | 证据 | 结论 |
|---|---|---|---|---|
| V02-01 | 三载体 sha256（`694a2d72…`、`6e22cc54…`、`259cf32a…`） | `cd .refs/andrej-karpathy-skills && sha256sum CLAUDE.md skills/karpathy-guidelines/SKILL.md .cursor/rules/karpathy-guidelines.mdc` | 3/3 逐字相符 | PASS |
| V02-02 | 正文两处空 diff（`CLAUDE.md:7-65` ≡ `.mdc:12-70`；`CLAUDE.md:7-61` ≡ `SKILL.md:13-67`）；全量 diff 的两个 hunk 头 `@@ -1,6 +1,12 @@` / `@@ -59,7 +65,3 @@` | `diff <(sed -n '7,65p' CLAUDE.md) <(sed -n '12,70p' …mdc)`；`diff -u CLAUDE.md …/SKILL.md` | 两处 exit=0；hunk 头逐字相符 | PASS |
| V02-03 | skill 静默缺 `CLAUDE.md:62-65`；skill 反向多来源链接；`.mdc:2` 与 `SKILL.md:3` 描述逐字相同 | `grep -n 'These guidelines are working if' CLAUDE.md .mdc SKILL.md`；`sed -n '9p' SKILL.md`；`diff <(sed -n '3p' SKILL.md) <(sed -n '2p' .mdc)` | 仅 `CLAUDE.md:65`+`.mdc:70`；`SKILL.md:9` 含 x.com 链接；desc diff 空 | PASS |
| V02-04 | 9 个跟踪文件、全 `100644`、无 `AGENTS.md`、零 hook/脚本/测试 | `git ls-files`；`git ls-files -s \| awk '{print $1}' \| sort \| uniq -c`；`grep -rn -E 'hooks\|PostToolUse\|PreToolUse\|settings\.json' . --exclude-dir=.git \| wc -l` | 9 / 9×100644 / 0 命中 / 0 命中 | PASS |
| V02-05 | 无 `LICENSE`，但有 4 处 MIT 声明（`plugin.json:8`、`SKILL.md:4`、`README.md:171`、`README.zh.md:171`） | `ls -a`；`grep -rn 'MIT' . --exclude-dir=.git` | 无 LICENSE；恰 4 处，路径相符 | PASS |
| V02-06 | 计数 4/18/9/5/32（算术 9+18+5=32）；50 行引文 OK=50 | `grep -c '^## [0-9]\.' CLAUDE.md`；`grep -c '^- ' CLAUDE.md`；`sed -n '9p;19p;31p;47p' CLAUDE.md \| grep -o '\.' \| wc -l`；`grep -cE '^\| R[0-9]+ \|' findings/02-…md`；`python3 /tmp/va.py` | 4 / 18 / 9 / 32；OK=50 FAIL=0 | PASS |
| V02-07 | `EXAMPLES.md` 522 行、14838 字节、322 行在围栏内（61.7%）、36 围栏行=18 块（9 python/4 diff/5 无语言）、9 `### Example`、9 对 ❌/✅、6 节、零入站引用 | `wc -l`；`wc -c`；围栏内行数脚本；`grep -c` 各项；`grep -rn EXAMPLES . --exclude-dir=.git \| wc -l` | 522 / 14838 / 322 / 36=9+4+5 / 9 / 9 / 6 / 0 | PASS |
| V02-08 | **T**：C9「反向张力」成立（原帖抱怨不清理死代码 vs R23 禁止删既有死代码） | `sed -n '40p;41p' CLAUDE.md`；`sed -n '17p' README.md` | `CLAUDE.md:41` = 「Don't remove pre-existing dead code unless asked.」；README.md:17 = 「don't clean up dead code...」 | PASS |
| V02-09 | README/README.zh 行平行：171/171、16 个标题行号一致、围栏位置一致、字节相同行 83（空 62 + 非空 21） | ``wc -l``；``grep -n '^#'`` 对比；``grep -n '^```'`` 对比；python 逐行 zip（**排除 split 产生的尾部空元素**） | 171/171；行号 `1 11 …169` 相同；围栏行全同；83 = 62+21，非空 21 项与文档枚举（9+2+1+2+1+1+2+2+1）逐项相符 | PASS |
| V02-10 | `:235`「**36 个围栏行**位置完全一致」（指 README/README.zh） | ``grep -c '^```' README.md README.zh.md`` | 各 **12**（6 个代码块；36 是 `EXAMPLES.md` 的数，且与本句枚举的 9+2+1=12 矛盾） | **FAIL（LOW）** |
| V02-11 | `:198`（C7）「全树 `grep -i api` 只命中引文与 `K:README.md:159` 的自定义模板示例」 | `grep -rn -i api . --exclude-dir=.git` | **7** 处：`README.md:17`、`README.zh.md:17`（引文）、`README.md:159`、`README.zh.md:159`（模板）、`EXAMPLES.md:47,51,415`（文档未提） | **FAIL（LOW）**：证据陈述不成立（结论「无规则条款对应 API」仍成立） |
| V02-12 | 各文件行/字节：README 171/6198、zh 171/6042、CURSOR 28/1955、plugin.json 11/390、marketplace 29/758；manifest 字段与命令自洽；`alwaysApply: true` 在 `.mdc:3` | `wc -l -c`；`cat .claude-plugin/plugin.json`；`sed -n '3p' .mdc`；`sed -n '105p;110p' README.md` | 全部相符；plugin.json 7 键、无 hooks/commands/agents 键；`/plugin install andrej-karpathy-skills@karpathy-skills` 与 manifest 名一致 | PASS |
| V02-13 | 定种抽样 8 条：R3/4/11/13/16/28/31/32 | 逐条打开 `CLAUDE.md` 对应行（§1.5） | 8/8 相符；并验证文档声明的行号映射：R28 在 `.mdc:56`（+5）、`SKILL.md:57`（+6） | PASS |
| V02-14 | 「含英文的「」引文」中 `:110`「keep in sync」等 11 条非逐字 | 全量扫描（附录 B.4） | `CURSOR.md:28` 原文为「keep **[CLAUDE.md](…)** and **[….mdc](…)** in sync」，引文为压缩引文；其余 10 条为中文转述 | INFO（不判 FAIL：文档以「」兼作转述标记；建议压缩引文改用 `…`） |
| V02-15 | 原帖 4 段引述（Q1–Q4）与 4 条未引句（O1–O4）的逐字性 | 一手快照内**无** x.com 原文；未联网抓取 | 文档 `:166`、`:238` 自述「核验强度止于片段在该 URL 页面正文中」 | UNVERIFIED（外部来源，超出核验者一手范围） |
| V02-16 | 两条 URL 的 301 / `ls-remote` 结果 | 需联网 | `:12-18` 与 `:125` 的叙述未复跑 | UNVERIFIED（未联网） |

### 1.3 `03-deepseek-harness.md`（H 前缀，快照 `/home/leihaohao/workspace/deepseek-harness` @ `477b4f42`）

| ID | 断言 | 方法 | 证据 | 结论 |
|---|---|---|---|---|
| V03-01 | 22 个 `AGENTS.md`、合计 606 行；§5 表 18 行行/词逐一正确；4 夹具 1 行、3/3/4/14 词 | `git ls-files '*AGENTS.md' \| wc -l`；逐文件 `wc -l -w`；夹具 `wc -w` | 22 / 606；18/18 行对；3/3/4/14 且内容逐字相符 | PASS |
| V03-02 | `.agents/skills/*/SKILL.md` = 14 / 1260 行；「15」的两种口径（宽松 pathspec + 文件系统目录）；`ask-matt/` 无 SKILL.md 且完全未跟踪 | `git ls-files '.agents/skills/*/SKILL.md' \| wc -l`（→14）；`git ls-files '*.agents/skills/*/SKILL.md' \| wc -l`（→15）；`ls -1 .agents/skills/ \| wc -l`（→15）；`git ls-files .agents/skills/ask-matt \| wc -l`（→0）；`cat .agents/skills/.gitignore` | 全部相符；第 15 个确为夹具 `…/vfs-example/workspace/.agents/skills/preview-tour/SKILL.md`（存在）；`.gitignore` = `*/agents/openai.yaml` | PASS |
| V03-03 | `scripts/` 六口径：333 / 274 / 254 / 271 / 270+4 / 17；「267 不可复现」 | `git ls-files 'scripts'`；`git ls-files 'scripts/*' \| grep -c '^scripts/[^/]*$'`；`find -maxdepth 1`；`git ls-tree HEAD:scripts \| grep -c '^100644 blob'`；`git ls-files 'scripts/**/*.ts'` | 333 / 274 / 254 / 271 / 270+4 / 17；无口径给出 267 | PASS |
| V03-04 | `scripts/verify-*.ts` 顶层匹配 **68** | `git ls-files 'scripts/verify-*.ts' \| grep -c '^scripts/verify-[^/]*\.ts$'` | 68 | PASS |
| V03-05 | B1（`:245`）「其中 **34** 个 `*.spec.ts`、**34** 个被测脚本」 | `git ls-files 'scripts/verify-*.ts' \| grep -c '\.spec\.ts$'`；`… \| grep -c '^scripts/verify-[^/]*\.ts$'` | **27** spec / **41** 非 spec（68 = 27+41） | **FAIL（MED）** |
| V03-06 | 生成器 `--check` 18 个入口且清单与目标一一对应 | `python3 -c` 过滤 `package.json` scripts 含 `--check` | 18 个 npm 键 → 18 个不同的 `scripts/gen-*.ts`（+`rescope-vendor.ts`、`persistence-changes.ts`）目标，与 B2 的 18 个名字集合相等 | PASS |
| V03-07 | `lefthook.yml` 55 行、9 job、三阶段 6/2/1；`typecheck` 两段 | `wc -l`；`grep -c '^    - name:'`；`cat -n lefthook.yml`；`python3 -c` 读 `package.json` | 55 / 9 / 6+2+1；`typecheck = npm run build:lib:host && npm run typecheck:contracts-ready` | PASS |
| V03-08 | 预算 manifest 8 条；8 个实测词数与表逐格相符；两处漂移（architecture 2400/2410、testing 1300/1350）；两处「有名额无条目」 | `cat scripts/doc-budgets.manifest.json`；`python3 -c` 逐条 `split()` 计数；`git ls-files '*examples/AGENTS.md'`；`sed -n '58p' docs/AGENTS.md` | 8 条；1949/1313/2403/600/518/1348/717/975 全对；漂移 +10/+50 成立；`examples/AGENTS.md` 在 git 与磁盘均不存在；prose 的 subtree 600 无 manifest 条目 | PASS |
| V03-09 | `verify-doc-budgets.ts` 的 `:3-6`/`:17`/`:21`/`:27`/`:42` 行文 | `for l in 3 4 5 6 17 21 27 42; do sed -n "${l}p" …` | 5 处逐字相符 | PASS |
| V03-10 | B5：`include`/`perFile: true`/`statements…lines: 100`/分区置空/`test:coverage` 组成 | `sed -n '209p;358,369p' vitest.config.ts`；`python3 -c` 读 scripts | 全部相符（`:209`、`:358-359`、`:362-363`、`:365-369`；`test:coverage = pnpm run build:native-system && vitest run --coverage`） | PASS |
| V03-11 | **T**：B6「跳过即失败」唯一实现点与汇总/披露 | `sed -n '108p;110p;115p;121p;1114,1115p;1640p;1649p' scripts/run-gates.ts` | `:121` `allowFailure !== true && (failed \|\| skipped)`；`:1114-1115` `gateFailed`；`:1640` 汇总；`:1649` `NON-BLOCKING ` 前缀 | PASS |
| V03-12 | **T**：B7 `ci.yml` 726 行 + 14 个引用行逐字（`:50/:108/:118/:191/:196/:237/:247/:364/:451/:546/:555/:632/:701/:726`） | `sed -n "${l}p" .github/workflows/ci.yml` | 726 行；14/14 行逐字相符（含 `check:ci:static`、`windows-observational-ready`、`All needed jobs succeeded`） | PASS |
| V03-13 | `ci.yml`「**20 个 job**」（`:277`；§5 `:381`） | `grep -cE '^  [a-z0-9-]+:$' .github/workflows/ci.yml`；python 数 `jobs:` 块键 | **11** 个 job 键（`node-24`、`-coverage`、`-bench`、`-consumers`、`node-compat`[3 元矩阵]、`python-sdk`、`python-runtime`、`windows-build`、`windows-coverage`、`windows-native-tests`、`all-checks-passed`）；20 是 workflow 数 | **FAIL（MED）** |
| V03-14 | workflow 20 个；ignored 653 条；`CLAUDE.md` 软链；根 `AGENTS.md` 17805 字节 | `git ls-files '.github/workflows/*.yml' \| wc -l`；`git status --short --ignored=matching --untracked-files=normal \| wc -l`；`ls -l CLAUDE.md`；`wc -c < AGENTS.md` | 20 / 653 / `CLAUDE.md -> AGENTS.md`（9B）/ 17805 | PASS |
| V03-15 | A 层 161 条（A1 55 / A2 78 / A3 28）与 token 分布 114/32/11/2/1/1 | 文档内正则抽取条目与 `· <token> —`（附录 B.5） | 161 条、161 个唯一 ID（无缺号/重号）；分布与`:215`/`:465` 逐值相符 | PASS |
| V03-16 | A1.06：`package.json` 184 个 scripts；`## Commands`（`:82-106`）提及 18 个不重复 `pnpm run` 且全部存在；4 个具名脚本不在该段 | python 解析 `package.json` + 正则取段 | 184 / 18/18 存在 / `test:coverage:partitioned`、`check:ci:artifacts`、`release:verify`、`verify-doc-budgets` 均不在段内 | PASS |
| V03-17 | C1：1 MiB 常量、忽略而非截断、`maxBytes` 必填、候选默认集、内容去重、`</system-reminder>` 转义 | `sed -n` 逐行（`config.ts:11-14,23,25,42-43,93`、`files.ts:344,354`、`render.ts:10-14,19,82`、README `:12,32,36,64-66,86,106,137,216-217`） | 全部逐字/语义相符（`1_048_576`；`return undefined`；`maxBytes: z.number().required()`；`replaceAll(SYSTEM_REMINDER_CLOSE, '<\\/system-reminder>')`） | PASS |
| V03-18 | C2：严格更宽阶梯、封闭目标词表、两参数同现、`allowed-once` 仅当次、fail-closed、四种结局、双语 `displayReason` | `sed -n` 逐行（`escalation.ts:28-30,34-38,41,53,56,59,72,76-79,85,96,169,177,180-185,192-206`） | 全部逐字相符（含 `it stays denied, so stop and explain instead of working around it`） | PASS |
| V03-19 | C3：guard 两包 240 + 81 行；advisory 不 veto vs 硬超时 `isError`；阈值 `[3,5,8]`；改名 FIXME | `wc -l`；`sed -n`（`repeat-tool-reminder:2-3,28-30,43,46,53,71-74,78,82-85`；`timeout-policy:2-4,6,42,45`） | 240/81；全部逐字相符 | PASS |
| V03-20 | C4：`SESSION_FORMAT_VERSION = 4`、required-on-read、59 事件类型、`surface.ts:312`、`index.ts:231`、状态文档 | `sed -n` 逐行；`python3` 数 `known-event-types.ts:23-81` 条目 | 全部相符；事件条目 59 | PASS |
| V03-21 | C5：38 个 `invariant.ts` companion；`agent-loop/src/invariant.ts` 的安装/断言行；`architecture.md:125`、session README `:88` | `git ls-files 'packages/*/*/src/invariant.ts' \| wc -l`；`sed -n` 逐行 | 38；`:2/:16/:19/:21-23/:34/:38/:42` 全部相符 | PASS |
| V03-22 | 定种抽样 8 条：A1.19/1.20/1.31/2.07/2.26/2.49/2.70/2.72 | 逐条打开源文件（§1.5） | 8/8 相符（含 `AGENTS.md:132/133/144`、`packages/client/AGENTS.md:25`、`snapshots/AGENTS.md:5`、`scripts/AGENTS.md:3`） | PASS |
| V03-23 | §8（`:500`/`:507`/`:535`）「325 个引文段全部命中，0 个 FAIL」 | `python3 /tmp/va.py` | 我抽 **337** 段；**325** 段命中同行锚点（与 325 吻合），**12** 段未命中且全部为：2 段 `node -e` 命令串（`:453`/`:457`）、4 段锚点在前文（`:451`/`:477`×2 → `docs/AGENTS.md:58`；`:492` → `scripts/AGENTS.md:3`，内容均已逐字验证存在）、5 段 §8 修正记录自引（`:512`）、1 段方法说明词（`:504`）。无伪造引文 | **FAIL（LOW，口径）**：数字与命中结论成立，但「引文段」范围未定义，须写明 |
| V03-24 | G1–G10 缺口（含 G9「4 个条目余量 <1%」、G3「pre-push 只有 typecheck」、G8「ask-matt 无 gate」） | 由 V03-05…V03-14 的数据重算 | 4 个 <1%：AGENTS 0.05%、docs/AGENTS 0.53%、cordis-primer 0.00%、testing 0.15% → 与 G9 的 4 条相符 | PASS |
| V03-25 | 68 个 `verify-*`、18 个生成器、vitest/CI 的实际运行 | 未执行（约束 §3） | 仅重实现/逐行读源码 | UNVERIFIED（运行结果未复跑） |

### 1.4 引用精度观察（不判 FAIL，但影响可复核成本）

- `01-ponytail.md`：**16/78** 个片段的逐字引文由条目里**第二个**引用承载（如 P-19 引文在 `SKILL.md:58`，第一引用是 `AGENTS.md:21`）。这符合文档自述判据「每个片段至少被一个被引区间包含」（`:380`），但读者若要复核必须两条都打开；建议在引文行尾标注承载区间。
- `03-deepseek-harness.md`：`H:` 引用普遍与引文同行（「引用在前、引文在后」），114 处 `:512` 的修正记录不参与核对；`docs/AGENTS.md:58` 与 `scripts/AGENTS.md:3` 两处散文规则被 4 次摘引而未被同行引用（V03-23），建议补锚点。

### 1.5 定种随机抽样深核（seed `20260927`，每篇 8 条）

```
$ python3 - <<'PY'
import random, re
from pathlib import Path
# …（脚本见附录 C：对每篇的条目 ID 列表用 random.Random(20260927).sample(range(n),8)）
PY
01-ponytail:       universe=63  -> P-05 P-08 P-16 P-21 P-32 P-58 P-61 P-63
02-karpathy:       universe=32  -> R3 R4 R11 R13 R16 R28 R31 R32
03-deepseek-harness: universe=161 -> A1.19 A1.20 A1.31 A2.07 A2.26 A2.49 A2.70 A2.72
```

| 文档 | 抽中条目 | 逐条复核结果 |
|---|---|---|
| 01 | P-05 | `hooks/ponytail-config.js:40-43` 口令恰好两条、去大小写与尾标点；`ponytail-help/SKILL.md:41-42` 复述并含 `/ponytail off` → 相符 |
| 01 | P-08 | `skills/ponytail/SKILL.md:8-15` 两句逐字（跨行连接后）→ 相符 |
| 01 | P-16 | `AGENTS.md:13` 与 `SKILL.md:42`（详版措辞不同）→ 相符 |
| 01 | P-21 | `AGENTS.md:24` 逐字 → 相符（`SKILL.md:60` 为同义异文，文档未把它当引文） |
| 01 | P-32 | `SKILL.md:92-95` 四个 carve-out 逐字；`AGENTS.md:30` 含 `input validation at…` → 相符 |
| 01 | P-58 | `check-rule-copies.js:44` `const INVARIANTS = [`、`:42` 注释、9 条数组逐条 → 相符 |
| 01 | P-61 | `build-openclaw-skills.js:7-8` 跨行注释逐字；`tests/openclaw-skills.test.js:17-20` 断言逐字 → 相符 |
| 01 | P-63 | `package.json:38` 逐字（16 顶层 + pi-extension + ponytail-mcp 三段串行）→ 相符 |
| 02 | R3/R4/R11/R13/R16/R28/R31/R32 | `CLAUDE.md:9/12/22/24/31/51/61/5` 逐字命中；R28 的 `+5`/`+6` 行号映射在 `.mdc:56`、`SKILL.md:57` 实测成立 → 8/8 相符 |
| 03 | A1.19 | `AGENTS.md:132` 两段逐字；`packages/AGENTS.md:19` 点名 `verify-package-invariants`；`scripts/verify-package-invariants.ts:14` 报错串逐字 → 相符 |
| 03 | A1.20 | `AGENTS.md:133` 逐字；`scripts/verify-v3-event-vocabulary.ts:1` 逐字 → 相符 |
| 03 | A1.31 | `AGENTS.md:144` 逐字，边界清单（parser/config、queued、model/tool JSON、durable/file、worker、process、wire）一致 → 相符 |
| 03 | A2.07 | `packages/AGENTS.md:11` 逐字（`… or production consumer`）→ 相符 |
| 03 | A2.26 | `packages/client/AGENTS.md:25` 逐字（含 `useSyncExternalStore`）→ 相符 |
| 03 | A2.49 | `docs/AGENTS.md:52` = 「When the gate goes red:」，`scripts/verify-doc-budgets.ts:42` 报错串逐字 → 相符 |
| 03 | A2.70 | `scripts/AGENTS.md:3` 两段逐字（`shell-free`、`empty or narrowed corpus`）→ 相符 |
| 03 | A2.72 | `snapshots/AGENTS.md:5` 两段逐字 → 相符 |

### 1.6 写纪律与交叉一致性

```
$ git -C /home/leihaohao/workspace/agent-rules status --short --untracked-files=all
?? findings/01-ponytail.md
?? findings/02-andrej-karpathy-skills.md
?? findings/03-deepseek-harness.md
（本文件写入后应为第 4 行 ?? findings/99-verification.md）
$ git -C .refs/ponytail status --porcelain | wc -l          # 0
$ git -C .refs/andrej-karpathy-skills status --porcelain | wc -l   # 0
$ git -C /home/leihaohao/workspace/deepseek-harness status --short | wc -l   # 0
```

- `findings/` 为未跟踪目录（`.gitignore` 只忽略 `.refs/`），核验前 3 个文件、核验后 4 个文件，**无第 5 个文件**、无对既有文件的改动 → 写纪律 **PASS**。
- 三篇的引用前缀互不重叠（P/K/H 各自绑定一个快照并各自定义一次），无「同一事实两处不同数字」。
- `hook` 一词在三篇中含义不同（01 = 宿主生命周期注入/跟踪档位、不阻断；02 = 宿主事件钩子执行检查、该仓库缺席；03 = lefthook git hook 本地阻断）。这是**各自来源域内**的定义，不构成矛盾，但把三篇合并落地时应显式限定来源域。

## §2 必须修正项（8 条，按文件）

### 2.1 `findings/01-ponytail.md`（3 条）

1. **`:243`（及 `:281`、`:441`）单位错误**。改为：
   - `:243` `…7/7 \`MATCH\`，canonical 2491 字节。` → `…7/7 \`MATCH\`，canonical 2491 字符（UTF-8 2494 字节）。`
   - `:281` `…各 2491 字节（§7 命令 \`S4\`）。` → `…各 2491 字符 / 2494 UTF-8 字节（§7 命令 \`S4\`）。`
   - `:441` `…canonical 2491 字节` → `…canonical 2491 字符 / 2494 UTF-8 字节`
   复跑：`cd .refs/ponytail && python3 -c "import re;s=open('AGENTS.md',encoding='utf-8').read().replace('\r\n','\n').strip();c=re.sub(r'\n\n\(Yes, this file also applies[\s\S]*?\)$','',s).strip();print(len(c),len(c.encode()))"` → `2491 2494`
2. **`:71`（P-09）第二锚点**：`P:hooks/ponytail-config.js:16-18` → `P:hooks/ponytail-config.js:79-81`（如需保留配置侧证据可写 `:79-81`、`:91`）。
   复跑：`grep -n 'VALID_MODES\|RUNTIME_MODES\|valid default' .refs/ponytail/hooks/ponytail-config.js`（`:17` 含 `review`；支持句在 `:79-81`）
3. **`:259` 裸引用**：`（\`:60-69\`）` → `（\`P:scripts/check-rule-copies.js:60-69\`）`；`（\`:76\`）` → `（\`P:scripts/check-rule-copies.js:76\`）`。同段 `:260`–`:261` 的引文本身正确（`:76` 行逐字），无需改动。

### 2.2 `findings/02-andrej-karpathy-skills.md`（2 条）

1. **`:235` 围栏行数**：`36 个围栏行位置完全一致` → `12 个围栏行位置完全一致（6 个代码块；9 个裸 \`\`\`、2 个 \`\`\`bash、1 个 \`\`\`markdown）`。
   复跑：`grep -c '^```' .refs/andrej-karpathy-skills/README.md .refs/andrej-karpathy-skills/README.zh.md` → `12` / `12`
2. **`:198`（C7）证据句**：`（全树 \`grep -i api\` 只命中引文与 \`K:README.md:159\` 的自定义模板示例）` → `（全树 \`grep -rn -i api\` 共 7 处：\`K:README.md:17\`/\`K:README.zh.md:17\` 的引文、\`K:README.md:159\`/\`K:README.zh.md:159\` 的模板示例、\`EXAMPLES.md:47,51,415\` 的示例文本；无任何**规则条款**涉及 API）`。
   复跑：`grep -rn -i api .refs/andrej-karpathy-skills --exclude-dir=.git`
3. （建议，非必修）`:110` 的「keep in sync」改为「keep `CLAUDE.md` and `.cursor/rules/karpathy-guidelines.mdc` in sync（原文含链接标记，此处为压缩引文）」。

### 2.3 `findings/03-deepseek-harness.md`（3 条）

1. **`:245`（B1）与 `:375`（§5）的 spec 拆分**：
   - `:245` `…顶层匹配 **68** 个，其中 **34** 个是 \`*.spec.ts\`（脚本自带测试、本身也是 \`test\` lane 的一部分），**34** 个是被测脚本。` → `…顶层匹配 **68** 个，其中 **27** 个是 \`*.spec.ts\`（脚本自带测试、本身也是 \`test\` lane 的一部分），**41** 个是被测脚本（68 = 27 + 41）。`
   - `:375` `68 个顶层匹配（含 34 个 \`.spec.ts\`）` → `68 个顶层匹配（含 27 个 \`.spec.ts\`）`
   复跑：`cd /home/leihaohao/workspace/deepseek-harness && git ls-files 'scripts/verify-*.ts' | grep -c '\.spec\.ts$'` → `27`；`git ls-files 'scripts/verify-*.ts' | grep -vc '\.spec\.ts$'` → `41`。
2. **`:277`（B7）与 `:381`（§5）的 job 数**：`ci.yml` 726 行、**11** 个 job（10 个 job + `all-checks-passed`；`node-compat` 为 3 元矩阵）；`20` 应仅用于 workflow 数。建议改为 `（726 行、11 个 job；20 个 workflow 见下）`。
   复跑：`cd /home/leihaohao/workspace/deepseek-harness && grep -nE '^  [a-z0-9-]+:$' .github/workflows/ci.yml | grep -v pull_request | wc -l` → `11`
3. **`:500`/`:507`/`:535` 引文段口径**：`325 个引文段全部命中，0 个 FAIL` → `325 个带同行 H: 锚点的源引文段全部命中，0 个 FAIL；全文另有 12 段 ASCII 引号字符串不属源引文（2 段 node -e 证据命令、4 段锚点在前文/交叉引用、5 段 §8 修正记录自引、1 段方法说明词），不计入`。
   复跑：`python3 /tmp/va.py`（末两行为 `doc03 inline quotes: fragments=337 not_contained_in_line_refs=12`；337−12=325）

## §3 未能证实项与核验者局限

1. **未执行任何快照脚本**（任务约束：只读、不跑 `pnpm`/构建/`verify-*`/生成器、不碰 `node_modules`）。因此 `01` 的 `S1`/`S2`「实测运行输出」、`03` 的 `vitest`/`run-gates`/CI 运行结果都**不是**我执行得到的；我用重实现（`check-rule-copies`、`check-versions`）与逐行读源码替代。凡「运行输出 vs 源码」的差异我无法排除（例如运行环境的 locale、Node 版本）。
2. **未联网**：`02` 的 x.com 原帖引文（Q1–Q4、O1–O4）与其 §4.1 的抓取证据、两条 URL 的 301/`ls-remote` 均未复跑。文档自己已声明该核验强度有限（`:166`、`:238`）。
3. **未逐条深核全部摘要语义**：`03` 的 161 条 A 层、`01` 的 63 条 P 层，我做的是「引文逐字包含性全量 + 引用可解析性全量 + 约 120 处关键行逐行对照 + 每篇 8 条定种抽样深核」。因此**摘要句的语义与源码的偏差**仍可能有遗漏，尤其是 `01:§2.9`/`03:§2` 中以「同条要求…」形式转述、未带逐字引文的半句。
4. **`03` 未核**：CI 的 job 依赖图与 `allowFailure` 的具体集合、`gatesForMode` 的完整 mode→gate 映射、19 个非主 workflow 内部的 `run:` 命令、`vendor/` 内部规则、32 个 `.zh.md` 双语 counterpart、68 个 `verify-*` 脚本的实现（只读了文档注释/报错串）。
5. **`01` 未核**：模型是否真的遵守规则（文档 §6.1 亦声明无证据）、Cursor 实机行为、`skills/*` 与 `AGENTS.md` 的逐句语义等价（无 gate，未逐句比对）。
6. **`02` 未核**：翻译忠实度（U4）、宿主真实安装/加载行为（U3/U5）、`EXAMPLES.md`「未新增规则」的逐条语义增量（U6，属判断而非机械证明）。
7. **判据可能的偏差来源**：引文包含性依赖「归一化 + 被引区间」的重实现；我对 `…` 截断、`|` 切分、注释前缀剥离采用了各文档自述的规则（`01:§7.1`、`02:§8A`、`03:§8`）。若文档的原始脚本口径与我的不同（例如 `02` 只扫表格行、`03` 只配「最近前置引用」），同一事实可能得到不同计数——本报告已把这类口径差逐条写明（V01-15、V02-14、V03-23），未用口径差当作缺陷。

---

## §4 δ 复核（after §2 fixes）

> 本节为**增量**复核：对象是 task-5/6/7 修正后的三篇文档（§1–§3 为历史留痕，未删改）。被核验文档在本轮复核期间一字未改（§4.1 的 sha256 复测即证据）。
> 全程仍只读：未执行快照的 `pnpm`/构建/`verify-*`/生成器，未碰 `node_modules`；本轮唯一写入是本文件。为验证文档自审口径，我**执行了文档自身内嵌的核对脚本**（`01` 的 S0 JS 块、`02` 的 §8 Python 块），它们只读文件、不写盘。

### 4.1 冻结校对（与 task-5/6/7 汇报逐字比对）

| 文档 | task-5/6/7 报告 | 我实测 | 一致 |
|---|---|---|---|
| `01-ponytail.md` | `3994bc8a11ba0e99d7bf223076df4e632d4b649850592a82eae0195a8cb2a713` / 471 行 | 同 sha256 / `wc -l` = 471 | ✅ |
| `02-andrej-karpathy-skills.md` | `3f2fc6e6f22f86e4c6fa60438fb0cda2a17a58bf57663f0b00f2495f124d7ddf` / 400 行 | 同 sha256 / `wc -l` = 400；`wc -c` = 42464；末字节 `0a` | ✅ |
| `03-deepseek-harness.md` | `6570dbc48f167eec21682b4ca9f4aae9a313fc677d3c000fb5beb4ae3056ad40` / 598 行 | 同 sha256 / `wc -l` = 598 | ✅ |

复跑：`sha256sum findings/0{1,2,3}-*.md; wc -l findings/0{1,2,3}-*.md`。三条均与报告逐字一致，**无「报告后又被改动」的致命项**。

### 4.2 8 条必修逐条闭环

| # | 位置（修正前） | 必修内容（§2） | 逐字落地 | 复跑命令 → 实测输出 | 闭环 |
|---|---|---|---|---|---|
| 1 | `01:243`/`:281`/`:441` | 「2491 字节」→「2491 字符（UTF-8 2494 字节）」 | ✅ 三处均按 §2.1-1 改（`:243` 为「2491 字符（UTF-8 2494 字节）」、`:281`/`:441` 为「2491 字符 / 2494 UTF-8 字节」） | `cd .refs/ponytail && python3 -c "import re;s=open('AGENTS.md',encoding='utf-8').read().replace('\r\n','\n').strip();c=re.sub(r'\n\n\(Yes, this file also applies[\s\S]*?\)$','',s).strip();print(len(c),len(c.encode()))"` → `2491 2494` | ✅ |
| 2 | `01:71`（P-09） | 第二锚点 `config.js:16-18` → `:79-81`（可加 `:91`） | ✅ 现为 `P:hooks/ponytail-config.js:79-81`、`P:hooks/ponytail-config.js:91` | `grep -n 'VALID_MODES\|RUNTIME_MODES\|valid default' .refs/ponytail/hooks/ponytail-config.js` → `:17` `VALID_MODES`（含 review）、`:79-81` 「never a valid default (#377)」、`:91` `RUNTIME_MODES.includes(...)` | ✅ |
| 3 | `01:259` | 裸 `:60-69`/`:76` → 带 `P:` 前缀 | ✅ 现为 `P:scripts/check-rule-copies.js:60-69` 与 `P:scripts/check-rule-copies.js:76` | `python3 /tmp/va.py` → `01-ponytail.md: distinct_refs=131 bad=0`（无路径/行号不可解析项） | ✅ |
| 4 | `02:235` | 「36 个围栏行」→「12 个围栏行（6 个代码块；9+2+1）」 | ✅ 逐字落地（围栏串改用双反引号包裹以避开本文件代码围栏，属必要等价替换） | `grep -c '^```' .refs/andrej-karpathy-skills/README.md .refs/andrej-karpathy-skills/README.zh.md` → `12` / `12`；`grep '^```' …/README.md \| sort \| uniq -c` → `9`、`2`、`1` | ✅ |
| 5 | `02:198`（C7） | `grep -i api` 证据句改为 7 处并列出 | ✅ 逐字落地（含 `EXAMPLES.md:47,51,415`） | `grep -rn -i api .refs/andrej-karpathy-skills --exclude-dir=.git` → 7 行：`README.md:17`/`:159`、`README.zh.md:17`/`:159`、`EXAMPLES.md:47`/`:51`/`:415` | ✅ |
| 6 | `03:245`/`:375` | verify-`*.ts` 拆分 34/34 → 27/41 | ✅ 逐字落地（含 `（68 = 27 + 41）`；§5 表同步 `含 27 个`） | `cd /home/leihaohao/workspace/deepseek-harness && git ls-files 'scripts/verify-*.ts' \| grep -c '\.spec\.ts$'` → `27`；`… \| grep -vc '\.spec\.ts$'` → `41`；`find scripts -maxdepth 1 -name 'verify-*.ts' -name '*.spec.ts' \| wc -l` → `27`（双仪器一致） | ✅ |
| 7 | `03:277`/`:381` | `ci.yml`「20 个 job」→ 11 个 job（20 保留给 workflow） | ✅ 逐字落地（`:277` 为「726 行、11 个 job；20 个 workflow 见下」、`:381` 为「726 行 / 11 job」） | `grep -nE '^  [a-z0-9-]+:$' .github/workflows/ci.yml \| wc -l` → `11`（行号清单与 δ2 打印逐行相符）；`git ls-files '.github/workflows/*.yml' \| wc -l` → `20` | ✅ |
| 8 | `03:500`/`:507`/`:535` | 「325 段 0 FAIL」补口径 | ✅ 逐字落地：`325 个带同行 H: 锚点的源引文段` + 12 段四类不计入；计数表与代码块同步 | `python3 /tmp/va.py` → `doc03 inline quotes: fragments=337 not_contained_in_line_refs=12`（337−12=325，与改前一致）；`sed -n '538p;541p' findings/03-deepseek-harness.md` → 325（337/12 注记）、598 行 | ✅ |

**闭环结论：8/8 全部逐字落地并复测通过。**

### 4.3 变更面重审（改动区域 + δ 小节）

1. **全量审计重跑**（对修正后文档，判据与第一轮相同）：
   - `path:line` 解析：`01` distinct=131、`02` distinct=76、`03` distinct=368，**bad=0**（新增引用全部可解析；`01` 的 +5 来自 P-09 的 2 个新锚点、`:259` 的 2 个补齐、δ 内引用 `config.js:17`）。
   - 引文包含性：`01` → `items=63 citations=111 quoted=63 fragments=78 miss=0`；`02` → `OK=50 FAIL=0`；`03` → `fragments=337, not_contained=12`（分类同 §2.3-3）。
   - 新锚点语义复核：`01:71` 的 `:79-81`/`:91` 确为「review 不能作默认档」的判定处（`:17` 的 `VALID_MODES` 含 review，只在配置层生效，与该断言不矛盾）；`02:198` 新增的 `EXAMPLES.md:47,51,415` 三处确为 `api` 命中行。
2. **δ 小节如实性**：三篇 δ 都注明了修正前版本/行号、替换前后文本、复跑命令与输出；我逐条复跑，输出与 δ 所述一致（含 `03` δ2 的 11 个 job 行号清单、δ3 的 337/325/12 三个数、`01` δ4 的 `citations=111`）。
3. **文档自审脚本实跑**（提取文档内嵌代码块执行，只读）：
   - `01` §7.1 的 S0 JS 块（`node /tmp/s0.mjs findings/01-ponytail.md`）→ `items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`，exit 0。
   - `02` §8A 的 Python 块 → `quotes_checked=50 OK=50 FAIL=0`；`grep -cE '^\| F[0-9]+ \|'` → `9`；F 集合与 `git ls-files` 比对无输出；`wc -l/-c` = `400`/`42464`，末字节 `0a`（δ 已同步这些自指值）。
4. **结构完整性**：三篇**无表格错位**（按未转义 `|` 计每个连续表格块的列数一致）；代码围栏配平（`01` 2 行 / `02` 20 行 / `03` 8 行）；文内 `§` 引用全部能对上标题（含新增 `§2.2`/`§2.3` 交叉引用）。
5. **新发现 A（FAIL，LOW，本轮唯一未闭环项）**——`01-ponytail.md:430`（§7.1「实测结果」）仍写 `items=63 citations=110 …` 与「110 个可解析引用」，但修正把 P-09 的引用从 2 条增到 3 条，同一文件 δ.4（`:469`）已写 111，我实测也是 **111**（`node` 实跑其内嵌 S0 + 独立计数 `items=63 citations=111`）。这是修正**引入**的自审口径不一致（非原 §2 条目）。修法：`:430` 行两处 `110` → `111`（并在该行或 δ.4 注明 P-09 引用 2→3）。复跑：`sed -n '430p;469p' findings/01-ponytail.md` 与上面的 node 复跑。
6. **口径说明（不判 FAIL）**：`01:453` δ 引言写「除下列**四处**文本外全文未改」，而位置为 5 行（`:243`/`:281`/`:441` 同属 V01-07，另 `:71`、`:259`）。若「四处文本」指四处**散文**位置（243/281/71/259）而把计数表行 `:441` 另计，则自洽；两种读法都不影响「除这些位置外全文未改」的结论（我的全量审计在全文档层面重跑通过）。属口径差，不计缺陷。
7. **δ 引入的自指引文**：`02` 的 δ 使「含英文的「」引文」全量扫描由 61 → 65 条，新增 4 条（`:379`/`:381`/`:383`×2）均为 δ 描述「改前/改后文本」的自指，不属源引文（不改判据）；`03` 的 δ 未新增 ASCII 引号（337 不变）与 `H:` 引用（368 不变）；`01` 的 δ 未新增 `> ` 引文块（78 段不变）。

### 4.4 回归口径

| 口径 | 第一轮结果 | 文档现述 | 我第二轮实测 | 结论 |
|---|---|---|---|---|
| `01` S0 计数 | 110 引用 / 78 片段 / miss=0 | `:430` **110**（旧）；δ.4 **111** | **111** / 78 / miss=0 | ❌ `:430` 未同步（新发现 A）；其余一致 |
| `01` canonical | 2491 字符 / 2494 字节 | 三处已改口径 | 2491 / 2494 | ✅ |
| `01` 7 份投影 | 7/7 MATCH | 未动 | 7/7 MATCH（重实现） | ✅ |
| `02` §8A 引文 | 50/50 | `:282` 未动（仍 50/50） | 50/50 | ✅ |
| `02` 覆盖集合 | F=9 ≡ `git ls-files` | δ 记 9 / 集合相等 | 9 / 集合相等 | ✅ |
| `02` 文件卫生 | 373 行 / 39227 B | §8D 已同步 400 / 42464 / 574 长行 / `0a` | 400 / 42464 / `0a` | ✅ |
| `02` EXAMPLES 计数 | 522 行 / 14838 B / 36 围栏行 | `:141` 未动（36 属 EXAMPLES，正确） | 522 / 14838 / 36 | ✅（与 `:235` 的 12 不冲突） |
| `03` §8 口径 | 325 段 / 0 FAIL | `:500`/`:507`/`:538` 已写 325 + 337/12 | 337 段、325 命中、12 不计入 | ✅ |
| `03` 自指行数 | 544 行 | `:541`/`:543` 已写 598 | 598 | ✅ |
| `03` 规模数字 | 22/606、14/1260、68/27/41、18、9、8、20/11、59、38、184、653 | B1/§5 已改 | 全部复测一致 | ✅ |
| `03` A 层 | 161 条（114/32/11/2/1/1） | 未动 | 161 / 161 unique / 同分布 | ✅ |

### 4.5 写纪律

```
$ git -C /home/leihaohao/workspace/agent-rules status --short --untracked-files=all
?? findings/01-ponytail.md
?? findings/02-andrej-karpathy-skills.md
?? findings/03-deepseek-harness.md
?? findings/99-verification.md
$ git -C .refs/ponytail status --porcelain | wc -l            # 0   HEAD=e3ba2aa6…56156（未变）
$ git -C .refs/andrej-karpathy-skills status --porcelain | wc -l  # 0   HEAD=2c606141…b9c2（未变）
$ git -C /home/leihaohao/workspace/deepseek-harness status --short | wc -l  # 0   HEAD=477b4f42…c443（未变）
```

只有 `findings/` 下 4 个文件（三篇被核验文档 + 本报告），无第 5 个文件、无对既有文件的改动；三快照 HEAD 与 porcelain 均未变。**写纪律 PASS。**

### 4.6 残余风险

1. **`01:430` 的 `citations=110`（LOW）**：唯一的未闭环项；它只在自审输出字符串里，不影响 §2 的任何规则内容或结论。修掉即完全闭环。
2. **未执行快照脚本（约束不变）**：`01` 的 `S1`/`S2` 运行输出、`03` 的 `vitest`/`run-gates`/CI 运行结果仍未执行；它们只由重实现与逐行读码支撑（与第一轮同）。
3. **未联网**：`02` 的 x.com 原帖 4 段引述与两条 URL 跳转仍 UNVERIFIED（§3 第 2 条同）。
4. **摘要语义的抽样局限**：三篇各 8 条定种抽样 + 约 120 处关键行逐行对照，非逐条深核（§3.3 同）；修正只动了上述 8 处，未触及抽样结论。
5. **δ 小节的自指引文**不参与源核对（§4.3-7 已列），若后续有人把 δ 内的「改前文本」当成源引文引用会误判——本文档层面无此问题。

### 4.7 最终裁定（针对新 sha256）

| 文档 | 最终裁定 | 说明 |
|---|---|---|
| `01-ponytail.md`（`3994bc8a…a713` / 471 行） | **可作为落地依据**（建议顺手改 `:430` 的 `110 → 111`） | 8 条必修中 3 条已闭环；1 条 LOW 残留（新发现 A），不影响结论 |
| `02-andrej-karpathy-skills.md`（`3f2fc6e6…ddf` / 400 行） | **可作为落地依据** | 2 必修 + 1 建议全部闭环，回归全绿 |
| `03-deepseek-harness.md`（`6570dbc4…d40` / 598 行） | **可作为落地依据**（第一轮的「有保留」解除） | 3 条必修全部闭环，2 处规模数字双仪器复测一致 |

（**本表 `01` 行的冻结值 `3994bc8a…a713` / 471 行已被 §4.8 的 `4619670f…c7774` / 472 行取代**（task-9 修掉新发现 A）；`02`/`03` 两行不变。）

---

### 4.8 残余项闭环（after task-9）

> 编号说明：task-10 任务书写作「§4.4」，但本报告 §4 已有 4.1–4.7（`4.4` 为「回归口径」）；为避免重号，本节编为 **4.8**，内容与任务书要求一致。
> 本节仍只读三篇被核验文档；本轮唯一写入仍是本文件。

#### 4.8.1 最终冻结态（sha256 + 行数）

| 对象 | sha256 | 行数 | 与上一轮比对 |
|---|---|---|--|
| `findings/01-ponytail.md` | `4619670f0e7c8593ec80d5e379bad6eb14a44349227975708951b440977c7774` | 472（`wc -c` = 51519；末字节 `0a`） | = task-9 报告，✅ 一致 |
| `findings/02-andrej-karpathy-skills.md` | `3f2fc6e6f22f86e4c6fa60438fb0cda2a17a58bf57663f0b00f2495f124d7ddf` | 400 | 未变（= §4.1 值），✅ |
| `findings/03-deepseek-harness.md` | `6570dbc48f167eec21682b4ca9f4aae9a313fc677d3c000fb5beb4ae3056ad40` | 598 | 未变（= §4.1 值），✅ |
| `findings/99-verification.md`（本报告，**写入本节前**的冻结值） | `3e4f0822c8e1d2e83fa96f871cc39d9742140f50f28acbc54fb7693f596052d2` | 590 | 本节写入即改变自身哈希（自指值），最终值随 task-10 汇报给出 |

复跑：`sha256sum findings/*.md; wc -l findings/*.md; tail -c 1 findings/01-ponytail.md | xxd -p`。

#### 4.8.2 闭环证据（残余项 A：`01:430`）

| 检查 | 复跑命令 | 实测输出 | 结论 |
|---|---|---|---|
| 旧值 0 命中 | `grep -n '110' findings/01-ponytail.md \| wc -l` | `0` | ✅ |
| `:430` 两处已改 | `sed -n '430p' findings/01-ponytail.md` | 该行为「实测结果：items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0，exit 0 —— 63 条规则、111 个可解析引用……」（两处均为 111） | ✅ |
| 自审脚本复跑 | 提取 §7.1 的 **js 代码块** 为 `/tmp/s0b.mjs`，`node /tmp/s0b.mjs findings/01-ponytail.md` | `items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`，`exit=0` | ✅ |
| 引用可解析性回归 | `python3 /tmp/va.py`（附录 A） | `01-ponytail.md: distinct_refs=131 bad=0`（refs 数与 task-8 相同 → δ.5 未新增引用） | ✅ |
| 引文包含性回归 | 同上 | `doc01 item-quotes: items=63 citations=111 fragments=78 miss=0` | ✅ |
| task-8 的 5 处修复未被扰动 | `sed -n '71p;243p;259p;281p;441p' findings/01-ponytail.md` | 5 行内容与 §4.2 记录一致（P-09 双锚点、canonical 单位、P: 前缀、S4 表行） | ✅ |
| 结构完整性 | CommonMark 代码跨度模拟 + 围栏/表格检查 | 围栏 2 行配平；表格 0 处错位；0 个未闭合代码跨度 | ✅ |
| 行数差来源 | `wc -l` + tail | 471 → 472（+1）= δ.4 列表中新增的第 4 个 bullet（δ.5）；其余行未检出变化（回归证据：refs 131 / 引文 78 miss=0 / 5 处修复行原样 / 结构 lint 0） | ✅ |

#### 4.8.3 变更面重审（`:430` 改动行 + δ.5 新增行）

1. **`:430` 只改了两个数字**：现文与 task-8 时的记录（§4.3-5 引用的旧文 `items=63 citations=110 …`／「110 个可解析引用」）对照，差异仅为 `citations=110→111` 与「110 个→111 个可解析引用」，其余文字与标点一致。**证据限制（诚实声明）**：三篇为未跟踪文件、无留存旧副本，因此这是「与报告自身记录的对照」而非字节级 diff；字节级 diff 需 task-5/9 留存的旧文件，本环境不可得。
2. **δ.5 如实性**：δ.5（`01:472`）写明——改动位置（`:430` 的两处计数）、改动性质（旧值同步为 `111`）、其余文字未动、该行现文、S0 复跑一致且 exit 0、旧值现 0 命中、当前 472 行。逐条复测与 δ.5 一致，**记述如实**；它刻意不打印旧值本身（为满足「0 命中」判据），这不隐瞒改动（读者可知旧值 ≠ 111）。
3. **关于「0 命中」判据本身**：`grep 旧值 → 0` 是**自指判据**（文档只要不写该数字即成立），不能单独作为正确性证据；本节的正确性主证据是「S0 复跑 = 111 + `:430` 现文 = 111 + 全文无 110」。δ.5 在 `:472` 只写「命令见 task-9」而未内联该命令，属轻微可复现性损失（命令是一行 `grep`，我在此内联）。
4. **δ.5 不影响结论**：它只补记自审计数同步，未触及任何规则、引用或规模断言；引文 78/78、refs 131/131 bad=0、结构 lint 0 问题的回归结果与之相符。
5. **新发现 B（FAIL，LOW，本轮新增）**——`01:471`（δ.4 的「篇幅」bullet）写「\`wc -l\` = 471 行（δ 小节 22 行）」，而文件现为 **472 行**，且其下一行 δ.5（`:472`）自己写「现 `wc -l` = 472 行（δ 小节 23 行）」：同一列表内相邻两行对同一事实给出两个「现值」。这是 task-9 追加 δ.5 后未同步的旧值——与 task-9 修掉的 `:430` 属同一类（自指计数未随改动传播），只是 `:471` 少一个时间锚点。**最小修法（二选一）**：(a) 在 `:471` 上加时间锚点，改为「（task-5 修正后）\`wc -l\` = 471 行（δ 小节 22 行）」；(b) 直接把该 bullet 的数字更新为 472 / 23（但这会让 δ.4 不再如实反映 task-5 时刻，故推荐 (a)，并保留 δ.5 的 472 记录）。该缺陷不影响任何规则内容或结论。复跑：`sed -n '471,472p' findings/01-ponytail.md` + `wc -l < findings/01-ponytail.md` → `472`。

#### 4.8.4 写纪律

```
$ git -C /home/leihaohao/workspace/agent-rules status --short --untracked-files=all
?? findings/01-ponytail.md
?? findings/02-andrej-karpathy-skills.md
?? findings/03-deepseek-harness.md
?? findings/99-verification.md
$ git -C .refs/ponytail status --porcelain | wc -l               # 0  HEAD=e3ba2aa6…56156
$ git -C .refs/andrej-karpathy-skills status --porcelain | wc -l # 0  HEAD=2c606141…b9c2
$ git -C /home/leihaohao/workspace/deepseek-harness status --short | wc -l  # 0  HEAD=477b4f42…c443
```

恰为 `findings/` 下 4 个文件；三快照 HEAD 未变、porcelain 0 行。**写纪律 PASS。**

#### 4.8.5 最终裁定（逐篇声明针对的 sha256）

| 文档 | 裁定针对的 sha256 | 最终裁定 |
|---|---|---|
| `01-ponytail.md` | `4619670f0e7c8593ec80d5e379bad6eb14a44349227975708951b440977c7774`（472 行） | **可作为落地依据**。§2 的 3 条必修 + 残余项 A（`:430` 的 110→111）**全部闭环**（§4.2、§4.8.2）；唯一残留是新发现 B（`:471` 的旧行数无时间锚点，LOW，不影响任何结论） |
| `02-andrej-karpathy-skills.md` | `3f2fc6e6f22f86e4c6fa60438fb0cda2a17a58bf57663f0b00f2495f124d7ddf`（400 行） | **可作为落地依据**。2 条必修 + 1 条建议全部闭环（§4.2 #4–#5、§4.3） |
| `03-deepseek-harness.md` | `6570dbc48f167eec21682b4ca9f4aae9a313fc677d3c000fb5beb4ae3056ad40`（598 行） | **可作为落地依据**（第一轮「有保留」已解除）。3 条必修全部闭环（§4.2 #6–#8） |

**闭环结论：原 8 条必修 + 残余项 A（task-9）= 全部闭环**；本轮新增 1 条 LOW（新发现 B，`01:471` 的时间锚点），修否都不影响三篇的可落地性与任何结论。

**残余风险一句话**：除新发现 B 外，残余风险仅剩核验者固有局限——未执行快照脚本与 CI（约束）、未联网（`02` 的 x.com 引文 UNVERIFIED）、摘要语义为每篇 8 条定种抽样深核而非逐条通读（§3、§4.6 同）。

---

### 4.9 最终冻结（after task-11）

> **终止声明节。** 三篇被核验文档在本轮复核期间一字未改（sha256 见 4.9.1；本轮唯一写入仍是本文件）。task-12 任务书要求本节标题为「after task-11」；§4 现有 4.1–4.8，故编为 4.9。

#### 4.9.1 最终冻结表

| 对象 | sha256 | 行 / 字节 | 状态 |
|---|---|---|---|
| `findings/01-ponytail.md` | `ff2ab781247d5a074670d24d721870be19040e2987a069557f4b1471b64c8ec1` | 472 行 / 51839 B（末字节 `0a`） | = task-11 报告，✅ 一致 |
| `findings/02-andrej-karpathy-skills.md` | `3f2fc6e6f22f86e4c6fa60438fb0cda2a17a58bf57663f0b00f2495f124d7ddf` | 400 行 / 42464 B | 自第二轮起未变，✅ |
| `findings/03-deepseek-harness.md` | `6570dbc48f167eec21682b4ca9f4aae9a313fc677d3c000fb5beb4ae3056ad40` | 598 行 / 102985 B | 自第二轮起未变，✅ |
| `findings/99-verification.md`（本报告，**写入本节前**） | `cd76b784e7c29adb66c59c98b0461f3e51c2b19f2d0851345ce7406a1446cbb8` | 658 行 / 67637 B | 本节写入即改变自身哈希（自指值），最终值随 task-12 汇报给出 |

复跑：`sha256sum findings/*.md; wc -l -c findings/*.md; tail -c 1 findings/01-ponytail.md | xxd -p`。

> **自指说明（表下正文）**：`99-verification.md` 的最终 sha256 **不能写在本文件内**——写入即改变自身哈希。因此上表只登记「写入本节前」的冻结值 `cd76b784…`，写入后的最终值在 task-12 汇报里给出；§4.9.7 的「失效条件」同此理（任何改动都会使裁定失效）。

#### 4.9.2 两处内联编辑核验（task-11）

| 编辑 | 复核命令 | 实测 | 结论 |
|---|---|---|---|
| 编辑 1：`:471` 加时间锚点 | `sed -n '471p' findings/01-ponytail.md` | 现文「篇幅（task-5 修正后当时）：`wc -l` = 471 行（δ 小节 22 行；其后 δ.5 修正使文件增至 472 行 / δ 23 行，故本行 471/22 只代表当时状态）…」 | ✅ 与 `:472` 的 472/23 **不再冲突**（新发现 B 闭环） |
| 编辑 2：`:472` 命令内联 | `sed -n '472p' findings/01-ponytail.md` | δ.5 现含「自包含复跑：`grep -nE '1[1]0' findings/01-ponytail.md` → 0 命中（旧值以字符类等价写出，否则本行会自命中并使该检查恒非零；δ.4 亦已加时间锚点标注 471/22 为 task-5 当时状态）」 | ✅ 命令自包含（§4.8.3-3 的可复现性损失已闭环） |
| 编辑未破坏结构 | 行数 / 末字节 / 结构 lint / 代码跨度配对 | 472 行（未变）、末字节 `0a`、lint 0 问题、围栏 2 行配平、`:471` 2 个闭合跨度 / `:472` 6 个闭合跨度 | ✅ |

#### 4.9.3 `grep -nE '1[1]0'` 写法的独立判断（task-12 点名项）

**结论：该写法成立、如实、可复跑，不判缺陷。** 四项实测证据：

1. **等价性（控制实验，可复跑）**：构造含「字面 `110`」「模式文本 `1[1]0`」「`11 0`」三行的对照文件后，
   `diff <(grep -n '110' ctl.txt) <(grep -nE '1[1]0' ctl.txt)` → **无输出（匹配集逐行相同）**，且两者都只命中含字面 `110` 的那一行；仅含模式文本的行两条命令均为 `0` 命中 → 字符类写法与字面写法**搜索语义完全等价**，且**不自命中**。
2. **不变量成立**：`grep -c '110' findings/01-ponytail.md` → `0`；`grep -nE '1[1]0' findings/01-ponytail.md` → `0`；同时 `grep -c "1\[1\]0" findings/01-ponytail.md` → `1`（模式文本确实存在于 `:472`）——即「全文不含字面 `110`」成立，而该检查不会因自身文本而恒非零。
3. **如实性**：`:`472 括号内的理由（「旧值以字符类等价写出，否则本行会自命中并使该检查恒非零」）与上述实测一致，属**准确**记述；且读者可由模式反推出旧值（`1[1]0` ≡ `110`），信息未被隐去。
4. **可复跑性**：该命令可直接粘贴执行并得 `0`（见第 2 条）；无需额外上下文。

**唯一保留意见（自指性，不升级为必修）**：`grep 旧值 → 0` 本身是**自指判据**——只要文档不打印该字面量就恒成立，故它不能单独充当「文档已修正」的正确性证据。本报告采用的独立主证据是：§7.1 自审脚本实跑 `citations=111`（`exit=0`）+ `:430` 现文两处均为 111 + 全文无字面 110（三条同时成立）。此保留意见已记入 4.9.5，不再追改。

#### 4.9.4 闭环总表

| 项 | 来源 | 状态 |
|---|---|---|
| 原 8 条必修（3+2+3） | §2、§4.2 | ✅ 8/8 闭环 |
| 残余项 A（`01:430` 的 `110 → 111`） | §4.3 新发现 A、§4.8.2 | ✅ 闭环（task-9） |
| 新发现 B（`01:471` 无时间锚点，与 δ.5 冲突） | §4.8.3 新发现 B | ✅ 闭环（task-11 编辑 1） |
| δ.5 命令未内联（可复现性损失） | §4.8.3-3 | ✅ 闭环（task-11 编辑 2） |
| **未闭环项** | — | **无** |

**最终态回归（本轮实测）**：`path:line` 解析 `01` 131 / `02` 76 / `03` 368，**bad=0**；`01` 引文 `items=63 citations=111 quoted=63 fragments=78 miss=0`；`02` 表格行 `OK=50 FAIL=0`；`03` `fragments=337 / not_contained=12`（337−12=325）；`01` §7.1 自审脚本 `node` 实跑 `items=63 citations=111 quoted=63 fragments=78 invariants=9 miss=0`，`exit=0`；三篇结构 lint 0 问题、围栏配平；写纪律恰 4 个文件、三快照 HEAD 未变且 porcelain 0 行。

#### 4.9.5 「已记录、不再追改」清单（记录性/自指性，附理由）

1. **`grep 旧值 → 0` 是自指判据**（4.9.3）：不作为正确性证据；事实已由三条独立证据确认。不追改的理由：把它降级为「一致性检查」即可，改动文档本身无法增加信息。
2. **δ 记录节的自指引文**：`02` 的 δ 使「含英文的「」引文」扫描 61 → 65（新增 4 条为「改前/改后」文本自指，见 §4.3-7）；`03` 的 12 段无同行 `H:` 锚点文本（§1.0/§2.3-3）。理由：变更日志必然引用自身改前文本，它们不是源引文，不影响任何结论。
3. **自指哈希占位**：三篇 δ 均写「sha256 见 Lead 汇报」而不写死最终值；本报告 4.9.1 对 `99` 自身同样处理。理由：文件不能包含自身最终哈希，属原理性限制。
4. **被后续取代的冻结值行**：本报告 §0.2（第二轮）与 §4.7 的 `01` 行仍保留旧 sha256，但均已就地加「已被 §4.9/`ff2ab781…` 取代」指针（§0.2 末尾、§4.7 表下注）。理由：保留历史留痕 + 指针防止误读为现值，符合本任务「不删除既有内容」的要求。
5. **`01` δ 其余 bullet 为变更日志陈述**（task-5/9/11 时刻「做了什么」，非「现在是什么」）：已由 `:471` 时间锚点示范标注法，不再逐条加锚点。理由：逐条加锚点只增加噪音，不改变可核验性（回归实测每轮重跑）。
6. **机制性事实不因编辑改变**：`01` 的「hook 不能阻断」（`exit(2)`/`permissionDecision` 0 命中、`deny` 1 处）、`02` 的「零 hook/脚本/测试」、`03` 的「skip 即 failed」等结论均在第一轮取证，本轮编辑只涉及自审计数，未触及这些证据。

#### 4.9.6 逐篇最终裁定（明确声明针对的 sha256）

| 文档 | 裁定针对的 sha256（行数） | 最终裁定 |
|---|---|---|
| `01-ponytail.md` | `ff2ab781247d5a074670d24d721870be19040e2987a069557f4b1471b64c8ec1`（472 行） | **可作为落地依据** |
| `02-andrej-karpathy-skills.md` | `3f2fc6e6f22f86e4c6fa60438fb0cda2a17a58bf57663f0b00f2495f124d7ddf`（400 行） | **可作为落地依据** |
| `03-deepseek-harness.md` | `6570dbc48f167eec21682b4ca9f4aae9a313fc677d3c000fb5beb4ae3056ad40`（598 行） | **可作为落地依据** |

**未闭环项：无。** 三篇均满足「可作为落地依据」，且其全部必修项与历轮发现的记录性瑕疵均已闭环或列入 4.9.5。

#### 4.9.7 终止声明

- 以上冻结值（4.9.1）为三篇被核验文档的**最终核验基线**；本报告（核验方）自本声明起**不再对三篇提出新的修改请求**（4.9.5 清单内的记录性/自指性事项亦不再要求改动）。
- **失效条件**：任何一篇若再被编辑，其 sha256 变更即使本节裁定失效；需以附录 A 脚本 + 各篇 §7.1/§8 自审脚本重跑并重新出裁定。
- **残余风险（一句话）**：核验者固有局限未变——未执行快照脚本与 CI（任务约束）、未联网（`02` 的 x.com 原帖引文仍 UNVERIFIED）、摘要语义为每篇 8 条定种抽样深核而非逐条通读（§3、§4.6 同）。

---

## 附录 A 全量审计脚本（本报告 §1.0 的全部数字由它产出）

用法：把下面代码块存为 `/tmp/va.py`，在仓库根执行 `python3 /tmp/va.py`。

```python
#!/usr/bin/env python3
# Independent citation audit for findings/01,02,03 (verifier: citation-verifier).
# Reproduce: save as /tmp/va.py, run `python3 /tmp/va.py` from the repo root.
import re
from pathlib import Path
REPO = Path('/home/leihaohao/workspace/agent-rules')
ROOTS = {'P': REPO/'.refs/ponytail', 'K': REPO/'.refs/andrej-karpathy-skills',
         'H': Path('/home/leihaohao/workspace/deepseek-harness')}
DOC = {'P': REPO/'findings/01-ponytail.md', 'K': REPO/'findings/02-andrej-karpathy-skills.md',
       'H': REPO/'findings/03-deepseek-harness.md'}
REF = re.compile(r'([PKH]):([^\s`；、|)"\']+?):(\d+)(?:-(\d+))?')
ws = lambda s: re.sub(r'\s+', ' ', s).strip()
cache = {}
def L(pre, p):
    if (pre, p) not in cache:
        f = ROOTS[pre]/p
        if not f.exists(): raise FileNotFoundError(p)
        cache[(pre, p)] = f.read_text(encoding='utf-8').replace('\r\n', '\n').split('\n')
    return cache[(pre, p)]
def strip(line, v):
    a = line
    if v in ('ponytail', 'code'):
        a = re.sub(r'^(?://|#|\*|<!--|-->)\s?', '', a.strip())
    if v == 'code':
        a = re.sub(r'^\+\s*[\'"]', '', a); a = re.sub(r'[\'"]\s*\+$', '', a)
        if a.count("'") % 2 == 1: a = re.sub(r'[\'"]\s*$', '', a)
        a = a.strip()
    return a
def has(pre, p, a, b, frag):
    for v in ('none', 'ponytail', 'code'):
        f = ws(strip(frag, v))
        if not f: continue
        try:
            lines = L(pre, p)
            if a < 1 or b > len(lines) or a > b: return False
            txt = ws(' '.join(strip(x, v) for x in lines[a-1:b]))
        except FileNotFoundError:
            return False
        if f in txt: return True
    return False
def nq(q):
    t = ws(q)
    return ws(t[1:-1]) if len(t) > 1 and t[0] in '"「' and t[-1] in '"」' else t

def refs():
    bad = 0
    for pre, dp in DOC.items():
        seen = set()
        for m in REF.finditer(dp.read_text(encoding='utf-8')):
            k = m.groups()
            if k in seen: continue
            seen.add(k)
            try: lines = L(pre, m.group(2))
            except FileNotFoundError: print('BADPATH', m.group(0)); bad += 1; continue
            a = int(m.group(3)); b = int(m.group(4)) if m.group(4) else a
            if a < 1 or b > len(lines) or a > b:
                print('BADLINE', m.group(0)); bad += 1
        print(f'{dp.name}: distinct_refs={len(seen)} bad={bad}')

def doc01():
    doc = DOC['P'].read_text(encoding='utf-8').split('\n')
    items = cites = frags = bad = 0
    for i, line in enumerate(doc):
        if not re.match(r'^- \*\*\[P-\d+\]\*\*', line): continue
        items += 1
        r = [(x[0], x[1], int(x[2]), int(x[3]) if x[3] else int(x[2])) for x in REF.findall(line)]
        cites += len(r)
        q, j = [], i+1
        while j < len(doc) and re.match(r'^\s*>', doc[j]):
            q.append(re.sub(r'^\s*>\s?', '', doc[j])); j += 1
        for ql in q:
            for part in ql.split('…'):
                f = nq(part)
                if not f: continue
                frags += 1
                if not any(has(pre, p, a, b, f) for pre, p, a, b in r):
                    bad += 1; print('P-MISS', line[2:30], f[:80])
    print(f'doc01 item-quotes: items={items} citations={cites} fragments={frags} miss={bad}')

def doc02():
    doc = DOC['K'].read_text(encoding='utf-8').split('\n')
    ok = fail = 0
    for line in doc:
        if not line.startswith('|') or '「' not in line or 'K:' not in line: continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        an = [c for c in cells if c.startswith('K:') and re.match(r'K:.+:\d+', c)]
        qu = [c for c in cells if c.startswith('「') and c.endswith('」')]
        if len(an) != 1 or len(qu) != 1:
            print('K-AMBIGUOUS', line[:60]); fail += 1; continue
        m = re.match(r'K:(.+):(\d+)(?:-(\d+))?$', an[0])
        a = int(m.group(2)); b = int(m.group(3)) if m.group(3) else a
        if has('K', m.group(1), a, b, qu[0][1:-1]): ok += 1
        else: fail += 1; print('K-FAIL', an[0], ws(qu[0][1:-1])[:70])
    print(f'doc02 table rows: OK={ok} FAIL={fail}')

def doc03():
    doc = DOC['H'].read_text(encoding='utf-8').split('\n')
    tot = miss = 0
    for i, line in enumerate(doc):
        r = [(x[1], int(x[2]), int(x[3]) if x[3] else int(x[2]))
             for x in REF.findall(line) if x[0] == 'H']
        for m in re.finditer(r'"([^"]*)"', line):
            if not m.group(1).strip(): continue
            for part in m.group(1).split('…'):
                f = ws(part)
                subs = [ws(x) for x in f.split('|')] if '|' in f else [f]
                for sub in subs:
                    if not sub: continue
                    tot += 1
                    if r and any(has('H', p, a, b, sub) for p, a, b in r): continue
                    miss += 1; print(f'H-NOLINE-ANCHOR L{i+1}: "{sub[:70]}"')
    print(f'doc03 inline quotes: fragments={tot} not_contained_in_line_refs={miss}')

refs(); doc01(); doc02(); doc03()
```

**实测输出**（本次核验）：

```
01-ponytail.md: distinct_refs=126 bad=0
02-andrej-karpathy-skills.md: distinct_refs=74 bad=0
03-deepseek-harness.md: distinct_refs=368 bad=0
doc01 item-quotes: items=63 citations=110 fragments=78 miss=0
doc02 table rows: OK=50 FAIL=0
H-NOLINE-ANCHOR L451: "subtree `AGENTS.md` ≤ 600"
H-NOLINE-ANCHOR L453: "const m=require('<repo>/scripts/doc-budgets.manifest.json');const fs=r"
H-NOLINE-ANCHOR L457: "<repo>/package.json"
H-NOLINE-ANCHOR L477: "subtree `AGENTS.md` ≤ 600"
H-NOLINE-ANCHOR L477: "`examples/AGENTS.md` 310"
H-NOLINE-ANCHOR L492: "guard against an empty or narrowed corpus"
H-NOLINE-ANCHOR L504: "引文"
H-NOLINE-ANCHOR L512: "Standing orders"
H-NOLINE-ANCHOR L512: "The checker never rewrites"
H-NOLINE-ANCHOR L512: "sandbox"
H-NOLINE-ANCHOR L512: "The narrowest wider **sandbox** mode"
H-NOLINE-ANCHOR L512: "44 条脚本中 41 条与文档一致，3 条只在 manifest 侧出现"
doc03 inline quotes: fragments=337 not_contained_in_line_refs=12
```

## 附录 B 关键复跑命令与输出

### B.1 规模（`01`）

```
$ cd /home/leihaohao/workspace/agent-rules/.refs/ponytail
$ git ls-files | wc -l                                            # 166
$ wc -l README.md AGENTS.md .agents/rules/ponytail.md             # 395 32 30
$ for f in skills/*/SKILL.md; do wc -l < "$f"; done               # 41 44 50 71 57 120
$ for f in hooks/*.js; do wc -l < "$f"; done                      # 115 169 98 155 144 77
$ for f in hooks/*.json; do wc -l < "$f"; done                    # 41 21 17 26
$ ls tests/*.test.js | wc -l; cat tests/*.test.js | wc -l         # 16 ; 2070
$ ls -d skills/*/ | wc -l; ls hooks/*.js | wc -l                  # 6 ; 6
```

### B.2 两个 gate 的独立重实现（`01`；不执行快照脚本）

```
$ cd .refs/ponytail && python3 - <<'PY'
import re
from pathlib import Path
read=lambda p: Path(p).read_text(encoding='utf-8').replace('\r\n','\n').strip()
canon=re.sub(r'\n\n\(Yes, this file also applies[\s\S]*?\)$','',read('AGENTS.md')).strip()
cps=[('.cursor/rules/ponytail.mdc',lambda t:re.sub(r'^---\n[\s\S]*?\n---\n*','',t).strip()),
     ('.windsurf/rules/ponytail.md',str.strip),('.clinerules/ponytail.md',str.strip),
     ('.agents/rules/ponytail.md',str.strip),('.qoder/rules/ponytail.md',str.strip),
     ('.github/copilot-instructions.md',str.strip),
     ('.kiro/steering/ponytail.md',lambda t:re.sub(r'^---\n[\s\S]*?\n---\n*','',t).strip())]
print('copies listed:',len(cps),'matches:',sum(n(read(p))==canon for p,n in cps))
print('canonical chars/bytes:',len(canon),len(canon.encode()))
PY
copies listed: 7 matches: 7
canonical chars/bytes: 2491 2494
```

版本侧：`scripts/check-versions.js:21-30` 的 `VERSION_FILES` 数组实为 8 项（`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json`、`.devin-plugin/plugin.json`、`.github/plugin/plugin.json`、`.qoder-plugin/plugin.json`、`gemini-extension.json`、`package.json`、`ponytail-mcp/package.json`），逐文件读取 `version` 均为 `4.10.0`；`:2` 注释写 "seven files"、`:78` 打印 `VERSION_FILES.length` → 与文档 `§6.2` 的矛盾叙述一致。

### B.3 `ponytail:` 标记口径（`01`）

```
$ git grep -nE '(#|//) ?ponytail:' -- . ':(exclude)tests' | grep -v '\.md:' | wc -l   # 21
$ git grep -nE '(#|//) ?ponytail:' -- . ':(exclude)tests' | wc -l                     # 31
$ grep -rnE '(#|//) ?ponytail:' --exclude-dir=.git . | wc -l                          # 32
$ … | grep -c '\.md:'          # 10        $ … | grep -c '^\./tests/'   # 1
$ grep -rnF '<!-- ponytail:' --exclude-dir=.git .    # 4 行
```

### B.4 `02` 的两条 FAIL 证据

```
$ cd /home/leihaohao/workspace/agent-rules/.refs/andrej-karpathy-skills
$ grep -c '^```' README.md README.zh.md
README.md:12
README.zh.md:12
$ grep -rn -i api . --exclude-dir=.git
./README.md:17:> "They really like to overcomplicate code and APIs, …
./README.md:159:- All API endpoints must have tests
./EXAMPLES.md:47:   - API endpoint returning data?
./EXAMPLES.md:51:Simplest approach: Add an API endpoint that returns paginated JSON.
./EXAMPLES.md:415:**User Request:** "Add rate limiting to the API"
./README.zh.md:17:> "它们真的很喜欢把代码和 API 搞复杂，…
./README.zh.md:159:- 所有 API 端点必须有测试
```

### B.5 `03` 的两条 FAIL 与 A 层 token 分布

```
$ cd /home/leihaohao/workspace/deepseek-harness
$ git ls-files 'scripts/verify-*.ts' | wc -l                                   # 68
$ git ls-files 'scripts/verify-*.ts' | grep -c '\.spec\.ts$'                   # 27
$ grep -nE '^  [a-z0-9-]+:$' .github/workflows/ci.yml | grep -v pull_request | wc -l   # 11
$ git status --short --ignored=matching --untracked-files=normal | wc -l       # 653
$ python3 - <<'PY'
import re, collections
doc=open('/home/leihaohao/workspace/agent-rules/findings/03-deepseek-harness.md',encoding='utf-8').read().split('\n')
items=[l for l in doc if re.match(r'^- \*\*A\d',l)]
ids=[re.match(r'^- \*\*(A[\d.]+)\*\*',l).group(1) for l in items]
print(len(items), len(set(ids)), collections.Counter(re.findall(r'· ([a-zA-Z·+-]+) —','\n'.join(items))))
PY
161 161 Counter({'prompt-only': 114, 'script·gate': 32, 'test·gate': 11, 'hook+prompt-only': 2, 'prompt-only+test·gate': 1, 'hook': 1})
```

## 附录 C 定种抽样脚本

```python
import random, re
from pathlib import Path
SPECS = [('findings/01-ponytail.md', r'^- \*\*\[(P-\d+)\]\*\*'),
         ('findings/02-andrej-karpathy-skills.md', r'^\| (R\d+) \|'),
         ('findings/03-deepseek-harness.md', r'^- \*\*(A\d+\.\d+)\*\*')]
for path, pat in SPECS:
    doc = Path(path).read_text(encoding='utf-8').split('\n')
    ids = [re.match(pat, l).group(1) for l in doc if re.match(pat, l)]
    print(path, len(ids), [ids[k] for k in sorted(random.Random(20260927).sample(range(len(ids)), 8))])
```

输出：

```
findings/01-ponytail.md 63 ['P-05', 'P-08', 'P-16', 'P-21', 'P-32', 'P-58', 'P-61', 'P-63']
findings/02-andrej-karpathy-skills.md 32 ['R3', 'R4', 'R11', 'R13', 'R16', 'R28', 'R31', 'R32']
findings/03-deepseek-harness.md 161 ['A1.19', 'A1.20', 'A1.31', 'A2.07', 'A2.26', 'A2.49', 'A2.70', 'A2.72']
```
