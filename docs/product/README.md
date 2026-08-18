# PRD 目录

本目录用于沉淀每个菜单或模块的 PRD。PRD 面向产品、业务评审者、设计、开发、测试和 AI 编码工具，目标是让页面范围、业务规则、交互状态和验收标准被准确理解并完成实现。

## 维护规则

- 新增菜单或模块时，参考 `docs/product/_template.md` 的 PRD 输出要求，自主设计最适合该模块的文档结构。
- 页面需求变化时，同步更新对应 PRD 的页面结构、输入输出、交互逻辑、状态变化、业务规则和验收标准。
- 尚未确认的信息放入需业务确认事项，避免把猜测写成确定规则。
- 原型准备评审前，确认顶部"文档"入口可以打开当前页面的 PRD。

## 菜单文档索引

| 菜单 | 路由 | PRD | 状态 |
| --- | --- | --- | --- |
| 开始使用 | `/home` | `docs/product/home.md` | 已建立 |
| 主数据配置 | `/master-data` | `docs/product/master-data.md` | 已建立 |
| 课时记录 | `/class-hour-record` | `docs/product/class-hour-record.md` | 已建立 |
| 数据分析 | `/analysis` | `docs/product/analysis.md` | 已建立 |

## 配套指南

- `docs/getting-started.md`：产品经理从业务目标开始使用模板。
- `docs/ui-guidelines.md`：后台原型 UI 方向的评审摘要。
- `docs/vercel-deployment.md`：把原型部署到 Vercel。
