# UI Guidelines

## Reset

This file is the only UI execution guide for this skill. All older page rules, previous visual preferences, historical page implementations, and `/standards` conventions are void. Do not use them to interpret, extend, or override this file.

The guide is based on Ant Design official component documentation, including `https://ant.design/llms-full.txt`. Choose components from user task semantics first; never infer rules from old pages.

## Principles

- Build operational admin screens, not marketing pages, decorative landing pages, or instruction-heavy pages.
- Put useful data, filters, actions, status, validation, and feedback in the first screen.
- Visible copy must be operational: object names, field labels, actions, states, validation, and system feedback. Put explanations in PRD/docs.
- One route carries one primary task. Use `Drawer`, `Modal`, `Tabs`, or detail routes for contextual sub-tasks.
- Prefer Ant Design components and theme tokens. Custom primitives may wrap business semantics but must not replace mature Ant Design interactions.

## Component Selection

| Task | Prefer | Use For | Avoid |
| --- | --- | --- | --- |
| App shell | `Layout`, `Menu`, `Breadcrumb` | Global sidebar, header, current location | Rebuilding navigation inside pages |
| List management | `Table`, `Pagination`, `Tag`, `Tooltip` | Structured fields, status, pagination, row actions | Cards for ordinary management data |
| Filtering | `Form layout="inline"`, `Input`, `Select`, `DatePicker` | Top-of-list filters | Explanatory filter copy |
| Create/edit | `Form layout="vertical"`, `Input`, `InputNumber`, `Select`, `Radio`, `Switch`, `Upload` | Field input and validation | Hand-built input systems |
| Workflow | `Steps`, `Timeline`, `Table` | Progress, history, task checklists | Decorative cards posing as workflow |
| Details | `Descriptions`, `Tabs`, `Collapse` | Object details and related records | Stacked unrelated panels |
| Context task | `Drawer` | Light detail, edit, approval comments, local config | New page jumps for light tasks |
| Confirmation | `Modal`, `Popconfirm` | Delete, disable, reject, submit confirmation | Risky actions without confirmation |
| Feedback | `Result`, `Empty`, `Spin`, `message`, `notification` | Unauthorized, error, empty, loading, submit feedback | Static copy instead of state |
| Actions | `Button`, `Space`, `Dropdown`, `Tooltip` | Primary/secondary actions and icon buttons | Competing primary buttons |
| Layout | `Flex`, `Space`, `Divider`, CSS Grid | Toolbars, columns, responsive regions | One-off margins everywhere |

## Page Structure

- Use `PageHeader` plus one primary work area. Add secondary sections only for real business groupings.
- List page: page actions, inline filter form, toolbar, primary table. Do not start with KPI cards, intro cards, or instructions.
- Form page: page actions, grouped vertical form, submit area. Put helper detail in `Drawer` or a side details region.
- Detail page: key status and main actions, `Descriptions`, related-record `Tabs`, operation `Timeline`.
- Border radius is 8px or less. Page gap is 20px; section gap is 16px; compact control gap is 8px or 12px.
- Optimize for 1280px desktop first. Collapse forms/details/status regions to one column on small screens; keep table horizontal scroll.

## Table Rules

- Use `Table` for ordinary management data.
- `rowKey` must be stable; do not use array indexes.
- Ordinary lists need pagination; small related tables or static task lists may omit it.
- Set `scroll={{ x: ... }}` for wide tables.
- Include identifying fields, state/result, updated time or owner, and actions where applicable.
- Right-align amounts, quantities, ratios, and durations.
- Use `Tag` for status. Map colors by business meaning: green success, blue active/info, gold/orange pending/risk, red failure/danger.
- Show up to two row actions directly. For three or more, keep one main action and move the rest into `Dropdown` or `TableActions`.

## Form Rules

- Use `Form layout="inline"` for filters and `Form layout="vertical"` for create/edit.
- Use `Select` for enums, `Switch` for booleans, `Radio` for small mutually exclusive choices, `InputNumber` for numeric values and amounts, and `DatePicker` for dates.
- Put required, format, range, and mutual-exclusion validation in `Form.Item rules`; error messages must tell the user how to fix the field.
- Group fields by business meaning, not by visual convenience.
- Use primary buttons for submit, save, and query; default buttons for reset, export, refresh, and copy; danger buttons plus confirmation for delete, disable, and reject.

## Feedback Rules

- Use `Empty` for empty data, with the concrete business object name.
- Use `Result status="403"` for unauthorized states, with a return or access request action.
- Use `Result status="500"` for system errors, with retry.
- Use local `Spin` for loading without blocking the app shell.
- Use `message` for light success/failure feedback and `notification` for cross-region information that should persist.

## Prohibited

- Do not create a separate UI standards page that supersedes this file.
- Do not put copy like "currently showing N rows", "horizontal scroll is supported", or "use filters to search" in business pages.
- Do not add metric cards to every list by default.
- Do not use card walls for ordinary table data.
- Do not add gradient hero backgrounds, decorative shapes, marketing hero layouts, or icon blocks without business meaning.
- Do not let old page style become precedent. If it conflicts with this file, this file wins.
