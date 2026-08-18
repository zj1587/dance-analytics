# 业务模块目录

建议每个业务模块按以下结构组织：

```text
module-name/
  api.ts
  hooks.ts
  mock.ts
  types.ts
  components/
```

原型阶段可以先在 `mock.ts` 中维护静态数据，页面通过 `hooks.ts` 读取数据。接入真实接口时优先替换 `api.ts` 和 `hooks.ts`，尽量保持页面结构不变。
