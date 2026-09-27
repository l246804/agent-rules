---
name: tailor-agents-md
description: >
  Generate or refresh a project's AGENTS.md from the fused four-source rule set
  (ponytail ladder + Karpathy LLM coding guidelines + DeepSeek Harness gates +
  storage-online project conventions). Use when the user says "tailor agents",
  "生成 AGENTS.md", "裁剪规则集", "adopt agent rules", "apply the fused ruleset",
  or when a project has no AGENTS.md and a stable working discipline is wanted.
  Do NOT use for editing project-specific rules that already exist without
  merging them.
argument-hint: "[minimal|full] [--add monorepo,frontend,machine-block]"
license: MIT
---

# Tailor AGENTS.md

把融合规则集裁剪进当前项目。规则源 `<RULES_DIR>/AGENTS.merged.md`；裁剪器 `<RULES_DIR>/tools/tailor.mjs`。

## 步骤

1. **侦察**（只读）：项目形态（单包/monorepo）、是否已有 `AGENTS.md`/`CLAUDE.md`/IDE 规则、是否存在工具自动注入的标记区间、是否有 CI 配置、是否有会在提交阶段改写文件的钩子、既有验证命令的真实来源。把结论复述给用户。
2. **选档并确认**：`minimal`（个人小项目/脚本）或 `full`（默认）；按项目追加 `monorepo` / `frontend` / `machine-block`；`--ci yes|no` 按是否有 CI 矩阵决定。给出推荐 + 理由，等用户确认。
3. **裁决条件条款**：7 条 ⟨条件式⟩（R1.4/R3.2/R3.3/R5.1/R5.3/R6.3/R9.3）按 `tailor/PROMPT.md` 第 3 步的默认裁决；与项目既有约定冲突时列出来问用户，不静默择一。
4. **生成**：优先
   `node <RULES_DIR>/tools/tailor.mjs --profile <档> --add <片段> --ci <yes|no> --out AGENTS.md`；
   无脚本时按 `AGENTS.merged.md` 附录 A 手工裁剪并删除出处标签。
5. **合并而非覆盖**：保留项目专属规则；不动机器标记区间；`CLAUDE.md` 为软链时只改真实文件；落盘前用 diff 给用户确认。
6. **自检并报告**：无残留出处标签、编号唯一、保留清单为空则说明、机器区间逐字节未变、只报告实际跑过的命令。

完整提示词（可直接粘给任意本地 agent）：`tailor/PROMPT.md`。
