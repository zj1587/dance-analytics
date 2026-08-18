---
name: prototype-agent
description: Build and maintain this repository's React + TypeScript + Vite + Ant Design back-office prototype. Use when adding or changing business prototype pages, PRDs, navigation, routes, UI guidelines, access-code preview behavior, or deployment-facing checks in this prototype-template repo.
---

# Prototype Agent

Use this skill to turn product ideas into reviewable ToB admin prototype screens inside this repository. Keep the output practical: PRDs, routed pages, menu entries, Ant Design component choices, and a passing build.

## First Reads

Read only what the task needs:

- `references/project-map.md` for repository file ownership and routing/document mappings.
- `references/prd-requirements.md` before creating or updating a business menu PRD.
- `references/ui-guidelines.md` before implementing page layout, component selection, tables, forms, actions, feedback, or responsive behavior. Treat it as a reset of all previous UI rules.
- `references/delivery-workflow.md` before wiring navigation, routes, PRD mappings, or release checks.
- `references/github-publish-workflow.md` before initializing git, changing remotes, committing, pushing to GitHub, or guiding a user through first-time repository publication.

## Workflow

1. Identify the prototype target: menu name, user role, primary task, required fields, actions, states, and uncertain business rules.
2. Create or update the PRD in `docs/product/` before or alongside implementation. Design the PRD structure around the module, and cover why it is needed, who uses it, capabilities, inputs, actions, outputs, state changes, business rules, edge cases, and acceptance criteria. Put unknowns in pending questions instead of inventing hidden requirements.
3. Choose Ant Design components by task semantics from `references/ui-guidelines.md`: `Table` for structured lists, `Form` for filters and input, `Steps` or `Timeline` for workflow, `Descriptions` and `Tabs` for details, `Drawer` for contextual sub-tasks, `Modal` or `Popconfirm` for interruptions, and `Result`, `Empty`, `Spin`, `message`, or `notification` for feedback states.
4. Implement the page using existing project primitives and Ant Design patterns. Prefer dense, scannable admin layouts over marketing-style sections. Treat the PRD and docs drawer as the place for design explanation; the page itself should show only operational copy, data, labels, actions, status, validation, and feedback that a real user needs to complete the task.
5. Wire the route, side navigation, PRD lookup, and docs index together so the page is reachable and the header docs entry works.
6. Run `npm run build` before handoff. Use browser verification for meaningful UI changes when a local server is available or requested.
7. When the user asks to release, publish, push to a repository, or deploy, read `references/github-publish-workflow.md`, publish the latest verified code to GitHub first, then deploy or guide deployment on Vercel using `docs/vercel-deployment.md`.

## Implementation Rules

- Use `references/ui-guidelines.md` as the runtime source for UI implementation rules. `docs/ui-guidelines.md` is the user-facing review summary and must stay consistent in direction, but it is not a second detailed rulebook.
- Keep user-facing files under `docs/` concise and aligned with the skill references when behavior changes. Avoid duplicating long internal checklists in public docs.
- Reuse existing primitives only when they fit the real product surface and the current UI guidelines: `PageHeader`, `SectionPanel`, `TableActions`, `StatusTag`, and `TreeListLayout`. Use `MetricCard` only for decision-grade KPIs, never as a default page opener.
- Do not add visible instructional text that describes what the page, list, filters, columns, scrolling, or buttons do when the same information belongs in the PRD or is already obvious from the UI. Avoid copy like "current list shows N items", "supports horizontal scrolling", "use filters to locate records", or generic section descriptions.
- Do not wrap every business area in titled panels by default. A list page may place filters, toolbar, and table in one compact operational region; use a `SectionPanel` title only when it names a real business grouping users would expect.
- Do not add metric cards above filters by default. Use `MetricCard` only when the module has decision-grade KPIs that users actively compare or act on; otherwise start with filters, toolbar, and the primary table/work area.
- Do not copy layout, color, spacing, component choices, or copy patterns from old pages when they conflict with `references/ui-guidelines.md`.
- Keep page spacing, radius, colors, and table behavior aligned with `references/ui-guidelines.md`.
- Keep route paths, menu keys, page filenames, and PRD slugs consistent.
- For destructive or risky actions in the UI, include confirmation behavior or a clearly framed modal/drawer state.
- Do not add unrelated refactors, new design systems, or extra documentation files.

## Handoff

Summarize the changed page/PRD paths, the route or menu entry added, the verification command result, and any GitHub repository/branch/commit pushed during release work. Mention any pending product questions that remain in the PRD.
