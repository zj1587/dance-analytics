# Delivery Workflow

## Build Order

1. Read the task and identify the menu/module, users, primary jobs, inputs, actions, outputs, states, rules, and unknowns.
2. Create or update the PRD under `docs/product/` using `references/prd-requirements.md`.
3. Choose UI components using `references/ui-guidelines.md`.
4. Implement or update the page under `src/pages/` or a feature directory.
5. Register the menu in `src/app/navigation.tsx`.
6. Register the route in `src/app/router.tsx`.
7. Register the PRD in `src/data/productDocs.ts`.
8. Register the PRD in `docs/product/README.md`.
9. Run `npm run build`.
10. When release is requested, read `references/github-publish-workflow.md`, commit the verified changes, and push them to the GitHub remote repository.
11. When deployment is requested, connect the GitHub repository to Vercel and follow `docs/vercel-deployment.md` for Vite build settings, SPA routing, and environment variables.

## Release Flow

1. Gather or confirm the GitHub repository URL, target branch, commit message, and whether the remote already contains work.
2. Confirm the local implementation and PRD are aligned.
3. Run `npm run build` and fix any compile errors.
4. Review the changed files and summarize the release scope.
5. Commit the changes with a concise message.
6. Push the branch to GitHub.
7. Deploy from the GitHub repository on Vercel.
8. Verify the production URL, route refresh behavior, and access-code behavior when enabled.

## Acceptance Checklist

- The route is reachable.
- The sidebar menu opens the page.
- The top "文档" entry opens the current page PRD.
- The page uses Ant Design components according to the UI guidelines.
- The page does not show redundant instructional copy for obvious list, filter, table, scrolling, or button behavior; those explanations stay in the PRD/docs.
- KPI/metric cards are present only when they support a real decision on the current page.
- The PRD describes page structure, inputs, outputs, interaction logic, state changes, business rules, edge cases, and acceptance criteria.
- Dangerous actions have confirmation behavior.
- Tables have stable `rowKey` and readable columns.
- `npm run build` passes.
- When release is requested, the code is pushed to GitHub.
- When deployment is requested, Vercel is connected to the GitHub repository and the deployed URL passes the release checks.

## Log File Hygiene

- Keep runtime logs under `logs/`.
- Do not leave `*.log` files in the repository root.
- Log files are ignored by `.gitignore`; keep only useful local diagnostics.
