# AGENTS.md

本仓库是一套独立维护的编码代理规则集。给人类的使用说明在 `README.md`，规则本身在 `rules/`。

## 结构

- `rules/base.md` 通用规则；`rules/frontend.md`、`rules/monorepo.md` 只放各自场景的追加。
- `README.md` 只给人看：介绍与"复制给 agent 的提示词"。
- `REPORT.md` 与 `findings/` 是溯源记录，不是规则来源：改规则时不要动它们。

## 改规则

- 一个事实只写一处：通用规则只进 `base.md`，场景差异只进对应场景文件。
- 新规则先问"它在任何技术栈下都成立吗"；不成立就放进场景文件或不要。
- 规则里不出现框架、库、包管理器、语言、CI 工具的名字，示例同样保持通用。
- 一句话能说清就不写两句；模型默认就会做的事（no-op）整条删掉。
- 每条规则都要能被判"做到没有"，否则改写直到可以。
- 用正面表述（"写 X"）而不是禁止句；只有安全红线例外。
- 规则文件膨胀时按序处置：先搬迁到更合适的文件，再压缩，最后才允许抬高体量并说明理由。
- 能机械检查的规则就配一个检查（副本一致性、生成物同步、引用完整性、格式）。

## 复核溯源

- 需要复核引用行号时，按需重新克隆上游快照（`.refs/` 已 gitignore）：

  ```bash
  git clone --depth 1 https://github.com/DietrichGebert/ponytail .refs/ponytail                        # e3ba2aa6
  git clone --depth 1 https://github.com/AbdullahHameedKhan/karpathy-ponytail-skills .refs/karpathy-ponytail-skills   # 8869387
  ```

- `H:` 指向本地 deepseek-harness 仓库（`477b4f4`）；`S:` 指向作者早期项目的 `AGENTS.md`（已去标识），逐条证据在 `findings/04-experience.md`。
