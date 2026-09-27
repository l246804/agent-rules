# 编码代理规则集

一套独立维护的 AI 编码代理规则：融合、去重、消解冲突后按场景拆开，规则与任何框架、依赖无关。

| 文件 | 适用 |
| --- | --- |
| [`rules/base.md`](rules/base.md) | 通用规则，任何项目都适用 |
| [`rules/frontend.md`](rules/frontend.md) | 前端项目，在 base 上追加 |
| [`rules/monorepo.md`](rules/monorepo.md) | 多包仓库/多人协作，在 base 上追加 |

## 用法：复制这段给 agent

在目标项目里打开编码 agent（Claude Code / Codex / DSH 等），把下面整段贴进去。新旧项目都适用。

```
先把下面三个链接的内容读出来（raw 链接，用 web_fetch 或 curl 读取），再把其中的规则并入本项目的规则文件：
- https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/base.md （通用，必读）
- https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/frontend.md （前端项目再读）
- https://raw.githubusercontent.com/l246804/agent-rules/dev/rules/monorepo.md （多包仓库再读）

写进项目已有的 AGENTS.md 或 CLAUDE.md（两者都有就合并进 AGENTS.md）；没有就新建 AGENTS.md。

步骤与要求：
1. 先读完上面适用的链接，再动手；读不到的链接要说明，不要凭猜。
2. 读本项目现有的规则文件、项目结构与验证命令。
3. 逐条并入，遵守三条边界：
   - 已有规则与本规则冲突或语义重叠 → 跳过该条，保留项目现状；
   - 项目专属内容（技术栈、目录、命令、约定）一律保留，不被通用规则替换；
   - 有工具自动管理的标记区间（如 <!-- X START --> … <!-- X END -->）→ 只在区间外增改。
4. 写完后自检：每条规则只有一个出处、没有同义重复、文件以恰好一个换行结尾、不删改无关内容。
5. 汇报（≤8 行）：新增了哪些；跳过哪些及原因（冲突/重叠/项目已有更具体的版本）；本项目实际使用的验证命令。
```

> 仓库地址：<https://github.com/l246804/agent-rules>（当前分支 `dev`，链接里也是 `dev`；分支改名时把链接中的 `dev` 一并替换）。

## 维护

- 规则只改 `rules/base.md`；场景差异只放对应场景文件，两处不重复。
- 新规则先问"它是否在任何技术栈下都成立"，不成立就放进场景文件或删掉。
- 能用一句话说清的就不要写两句；已被模型默认遵守的规则（no-op）删掉。
- 每条规则都要能被判"做到没有"，否则改写直到可以。
- 能机械检查的规则就配一个检查（副本一致性、生成物同步、引用完整性、格式），别只写在文档里。
- 规则文件膨胀时按顺序处置：先搬迁到更合适的层级，再压缩，最后才允许抬高上限并说明理由。

## 来源与记录

- 规则由四份来源融合、去重、消解冲突而来（详见 [`REPORT.md`](REPORT.md)）。其中源自早期个人项目探索的部分已泛化为通用规则，不再与该项目绑定。
- 逐条出处、冲突裁决与多轮独立核验记录在 [`findings/`](findings/)；分析稿与生成样例已随拆分删除（历史见本仓库首次提交）。
- 引用行号需要逐行复核时，按需恢复上游副本（`.refs/` 已 gitignore）：

  ```bash
  git clone --depth 1 https://github.com/DietrichGebert/ponytail .refs/ponytail
  git clone --depth 1 https://github.com/AbdullahHameedKhan/karpathy-ponytail-skills .refs/karpathy-ponytail-skills
  ```
