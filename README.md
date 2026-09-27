# 编码代理规则集

独立维护的 AI 编码代理规则：融合、去重、消解冲突后按场景拆开，规则与任何框架、依赖无关。

| 文件 | 适用 |
| --- | --- |
| [`rules/base.md`](rules/base.md) | 通用规则，任何项目都适用 |
| [`rules/frontend.md`](rules/frontend.md) | 前端项目，在 base 上追加 |
| [`rules/monorepo.md`](rules/monorepo.md) | 多包仓库/多人协作，在 base 上追加 |

## 用法：把下面这段贴给 agent

在目标项目里打开编码 agent（Claude Code / Codex / DSH 等），整段贴进去；新旧项目都适用。

```
先判断本项目属于哪种形态，再读对应规则（raw 链接，用 web_fetch 或 curl 读取）：
- 所有项目都读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/base.md
- 前端项目（有界面/路由/组件层）再读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/frontend.md
- 多包仓库（一个仓库多个包/应用）再读：https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/monorepo.md
判断不确定时只读通用规则，并说明你的判断依据。

把这些规则并入本项目根目录的 AGENTS.md（没有就新建）。

步骤与要求：
1. 先读完适用的规则，再动手；链接读不到就说明，不要凭猜。
2. 读本项目现有的 AGENTS.md、项目结构与验证命令。
3. 逐条并入，遵守三条边界：
   - 现有规则与新规则冲突或语义重叠 → 跳过该条，保留项目现状；
   - 项目专属内容（技术栈、目录、命令、约定）一律保留，不被通用规则替换；
   - 有工具自动管理的标记区间（如 <!-- X START --> … <!-- X END -->）→ 只在区间外增改。
4. 写完后自检：每条规则只有一个出处、没有同义重复、文件以恰好一个换行结尾、不删改无关内容。
5. 汇报（≤8 行）：读了哪些规则文件、为什么；新增了哪些；跳过哪些及原因；本项目实际使用的验证命令。
```

> 仓库地址：<https://github.com/l246804/agent-rules>（当前分支 `dev`；分支改名时把链接里的 `dev` 一并替换）。

## 更多

- 规则怎么维护、溯源怎么复核：见 [`AGENTS.md`](AGENTS.md)。
- 规则的来源、冲突裁决与逐轮核验记录：见 [`REPORT.md`](REPORT.md) 与 [`findings/`](findings/)。
