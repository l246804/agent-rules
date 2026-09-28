# agent-rules

一套持续维护的 AI 编码代理规则集，来源于日常开发实践的沉淀与提炼。

规则集以 `AGENTS.md` 格式组织，涵盖编码决策、代码审查、依赖管理、测试策略等维度，目标是让 AI 代理在参与任何项目时，都能遵循一套稳定、可预期的工作纪律。

你可以将本仓库的规则集合并到任意项目的 `AGENTS.md` 中，也可以根据项目特点选择性摘录。规则会不定期更新，建议定期同步。

## 规则文件

三个文件叠加使用：`base.md` 任何项目都读，另两个按条件追加。

| 文件 | 读的条件 | 覆盖 |
| --- | --- | --- |
| [`rules/base.md`](rules/base.md) | 任何项目 | 编码决策、改动纪律、类型与边界、依赖与配置、验证与交付、沟通与留痕 |
| [`rules/gates.md`](rules/gates.md) | 项目已有测试或校验设施 | 证据选择、检查与内环、门禁纪律、覆盖率与预算、生成物与持续集成 |
| [`rules/frontend.md`](rules/frontend.md) | 有界面或前端渲染层 | 界面结构、组件与数据流、无障碍、验收 |

## 安装

在目标项目根目录打开编码 agent（Claude Code / Codex / DSH 等），把下面这段整块贴进去，新项目与已有项目都适用。

```
在本项目接入 agent-rules 规则集，按顺序执行：

1. 先判断本项目形态，据此决定读哪些规则（raw 链接，用 web_fetch 或 curl 读取）：
   - 任何项目都读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/base.md
   - 有界面或前端渲染层再读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/frontend.md
   - 已有测试或校验设施再读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/gates.md
   判断不确定时只读 base.md，并说明你的判断依据。
2. 再读本项目现有的指令文件（AGENTS.md、CLAUDE.md，以及各工具自己的规则目录）与项目结构。
3. 把读到的规则并入项目根目录的 AGENTS.md（没有就新建），新规则集中放在同一个小节里；逐条按三条边界处理：
   - 与本地规则冲突或语义重叠的那条跳过，保留本地写法；
   - 项目专属内容（技术栈、目录、命令、约定）原样保留，不被通用规则替换；
   - 已有工具托管区间（<!-- X START --> … <!-- X END -->）只在区间外增改。
   链接读不到就说明，不要凭记忆补写。
4. 写完自检：每条规则只有一个出处、没有同义重复、每个跳过项都能指出它撞上的本地规则、无关内容未被改动。
5. 汇报（≤10 行）：读了哪些规则文件及依据；新增了哪些；跳过了哪些，各自撞上哪条本地规则。
```

提示词按 raw 链接读取，需要目标机器能访问 `raw.githubusercontent.com`。仓库地址 <https://github.com/l246804/agent-rules>，默认分支 `dev`，分支改名时把提示词里的 `dev` 一并替换。

再次执行同一段提示词即可同步：已并入的规则下次会被判为与本地重叠而跳过，项目只继续吸收新规则。

## 溯源与维护

`rules/` 里只有规则本身。条目的来源、重复裁决、逐轮核验与溯源映射在 [`review/`](review/)，上游规则集的现状分析与核验证据在 [`findings/`](findings/)。改规则前先按 [`review/11-provenance-map.md`](review/11-provenance-map.md) 定位条目来源。
