# AGENTS.md 四源融合规则集

一套可直接并入任意项目的 AI 编码代理规则集：把四份来源去重、消解冲突、按场景裁剪，输出一份能落地的 `AGENTS.md`。

## 文件

| 路径 | 是什么 |
| --- | --- |
| [`AGENTS.merged.md`](AGENTS.merged.md) | **规则源**：§0–§9 共 48 条，每条带 `[P/K/H/S:path:line]` 出处；附录含裁剪指引、落位检查清单、机械化建议 |
| [`tailor/`](tailor/) | 裁剪工具与说明：[`README.md`](tailor/README.md)（用法）、[`PROMPT.md`](tailor/PROMPT.md)（给本地 agent 的提示词）、[`SKILL.md`](tailor/SKILL.md)（skill 模板）、`snippets/`（monorepo / frontend / machine-block） |
| [`tools/tailor.mjs`](tools/tailor.mjs) | 裁剪器：一行命令生成项目的 `AGENTS.md`（Node ≥18，零依赖） |
| [`examples/`](examples/) | 三档生成样例：[minimal](examples/AGENTS.minimal.md)（19 条）｜[frontend](examples/AGENTS.frontend.md)（52 条）｜[monorepo](examples/AGENTS.monorepo.md)（52 条） |
| [`REPORT.md`](REPORT.md) | 融合分析报告：四源画像、冲突裁决、强制机制光谱、独立核验与更正记录 |
| [`findings/`](findings/) | 四份源分析 + 独立核验报告（含逐条 `path:line` 证据） |

## 用法

```bash
# 1) 常规项目
node tools/tailor.mjs --profile full --ci yes --out /path/to/project/AGENTS.md

# 2) 小项目/脚本
node tools/tailor.mjs --profile minimal --ci no --out /path/to/project/AGENTS.md

# 3) 前端 / monorepo / 使用会改写 AGENTS.md 的工具链
node tools/tailor.mjs --profile full --add frontend,machine-block --ci yes --out /path/to/project/AGENTS.md
node tools/tailor.mjs --profile full --add monorepo --ci yes            --out /path/to/project/AGENTS.md
```

或让本地 agent 生成：把 [`tailor/PROMPT.md`](tailor/PROMPT.md) 中"---"之后的内容粘进 Claude Code / Codex / DSH 等（`<RULES_DIR>` 换成本仓库路径）。它会先侦察项目、给出档位建议并等你确认，再生成与合并。

选项：`--profile`、`--add`、`--ci`、`--out`、`--title`、`--keep-provenance`（保留出处标签）、`--with-decisions`（附裁决记录表）、`--dry-run`。

## 来源与保障

| 标签 | 来源 | 快照 |
| --- | --- | --- |
| P | Ponytail（MIT） | `DietrichGebert/ponytail` @ `e3ba2aa6` |
| K | Karpathy 插件 | `AbdullahHameedKhan/karpathy-ponytail-skills` @ `8869387` |
| H | DeepSeek Harness | 本地仓库 @ `477b4f4` |
| S | storage-online `AGENTS.md` | 78 行工作树版本 |

- 每条规则可回溯到出处行号；四源冲突处显式裁决（见 [`REPORT.md`](REPORT.md) §6），未静默择一。
- 融合件经独立 verifier 对抗性核验（全量引用审计 + 抽样复核 + 增量确认），记录在 [`findings/99-verification.md`](findings/99-verification.md)。
- 引用行号可复核：分析用的 `.refs/` 副本已从仓库删除（`.gitignore` 仍忽略该目录）；需要逐行复核时按需重新克隆：

  ```bash
  git clone --depth 1 https://github.com/DietrichGebert/ponytail .refs/ponytail
  git clone --depth 1 https://github.com/AbdullahHameedKhan/karpathy-ponytail-skills .refs/karpathy-ponytail-skills
  ```

## 维护

1. 改规则只改 [`AGENTS.merged.md`](AGENTS.merged.md)（唯一规则源），场景差异放 `tailor/snippets/`。
2. 改完重新生成样例并跑一次 `--dry-run` 校验条数（脚本会在规则源结构异常时报错退出）。
3. 规则文本本身遵守自己的 R0.3：每个事实只有一个 home，超预算先搬迁再压缩。
