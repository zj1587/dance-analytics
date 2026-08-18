# PRD Requirements

Design the PRD structure around the module. Do not force a fixed template. The PRD must help product, design, development, testing, and AI coding tools understand and implement the requirement accurately.

## Questions To Cover

- Why this module is needed.
- Who uses this module.
- What capabilities the page or feature contains.
- What users can input.
- What actions users can perform.
- What output the system produces.
- What state changes exist on the page.
- What business rules and limits apply.
- What exceptions and edge cases exist.
- How to determine that implementation is complete.

## Writing Focus

- Describe page structure, inputs, outputs, interaction logic, state changes, and business rules.
- Make fields, actions, validation, permissions, exceptions, and acceptance criteria clear enough for implementation.
- Adapt sections to the module type:
  - Workflow modules should emphasize flow states, transitions, actors, and approvals.
  - Configuration modules should emphasize rules, scope, validation, publish behavior, and rollback.
  - List management modules should emphasize search, table columns, row actions, batch actions, and pagination.
  - Detail modules should emphasize identity fields, grouped information, related data, history, and available actions.
- Put unconfirmed information in pending questions instead of writing guesses as rules.
