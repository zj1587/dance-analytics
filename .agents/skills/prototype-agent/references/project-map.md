# Prototype Template Project Map

## Stack

- React 19, TypeScript, Vite, React Router, Ant Design 5, Zustand, lucide-react.
- This is a ToB back-office prototype template. Prioritize efficient admin workflows, structured data, and reviewable product behavior.

## Core Files

- `src/app/appConfig.ts`: app name, short name, default route, access-page copy.
- `src/app/navigation.tsx`: side navigation entries.
- `src/app/router.tsx`: application routes.
- `src/data/productDocs.ts`: mapping from route/menu context to PRDs.
- `docs/product/README.md`: PRD index shown in the app.
- `docs/product/_template.md`: user-facing copy of PRD output requirements.
- `.agents/skills/prototype-agent/references/prd-requirements.md`: skill-runtime PRD output requirements.
- `.agents/skills/prototype-agent/references/ui-guidelines.md`: skill-runtime Ant Design component selection and reset UI rules.
- `.agents/skills/prototype-agent/references/delivery-workflow.md`: skill-runtime route, menu, PRD, and verification checklist.
- `src/components/`: reusable shell and admin UI components.
- `api/auth/*`, `api/_access-session.js`, `middleware.js`: optional access-code preview protection.

## Business Page Checklist

- PRD exists under `docs/product/` and covers the module reason, users, capabilities, inputs, actions, outputs, state changes, business rules, edge cases, acceptance criteria, and pending questions.
- Page component exists under `src/pages/` or a feature directory and follows `references/ui-guidelines.md`.
- Navigation entry exists in `src/app/navigation.tsx`.
- Route exists in `src/app/router.tsx`.
- PRD mapping exists in `src/data/productDocs.ts`.
- PRD is listed in `docs/product/README.md`.
- Header docs entry can open the current page's PRD.
- `npm run build` passes.

## Reference Boundaries

- Use `references/ui-guidelines.md` for detailed Ant Design component selection and layout guardrails.
- Use `references/delivery-workflow.md` for route, menu, PRD mapping, build, release, and deployment flow.
- Use `references/prd-requirements.md` for detailed PRD output requirements.
- Keep `README.md` and `docs/` user-facing and concise; do not copy the full runtime rules there.
