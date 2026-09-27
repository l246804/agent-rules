## 10 大型 monorepo 追加约定

- **R10.1 门禁"被跳过"等于"失败"。** 聚合门禁里任一非豁免项处于 failed 或 skipped，整体即视为红——不允许用 skip 冒充通过。`[H:scripts/run-gates.ts:121-123]`
- **R10.2 门禁必须声明消费面。** 每个门禁显式声明它校验的是源码面还是构建产物面，由依赖图校验（含环检测与未知依赖拒绝）；静态门禁与测试在干净树上通过。`[H:AGENTS.md:146]` `[H:scripts/run-gates.ts:884]`
- **R10.3 子包 README 记录可消费信息。** 包 README 记录 model/token/KV-cache 影响；持久的 consumer 缺口与非显然的维护者约束放在 `## Known Limitations and Deferred Work`（没有则需一条有理由的豁免）。`[H:packages/AGENTS.md:26-28]`
- **R10.4 双语三件套成对合入。** `foo.md` + `foo.zh.md` + `foo.i18n.yaml` 为一个 pair，两侧同等权威，PR 不得只落一种语言；扩展翻译工作流只在用户显式调用时运行。`[H:docs/i18n/README.md:9-10]` `[H:AGENTS.md:174]`
