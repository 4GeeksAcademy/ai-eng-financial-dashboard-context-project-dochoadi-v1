# Agent Guidance

Agents working on this project **must**:

- Look for **work instructions and rules** in the directory:  
  `./.agents/rules`

- Look for available **agent skills** in the directory:  
  `./.agents/skills`

- Look for the **project memory bank** in:  
  `./memory-bank`  
  _(if the directory exists)_

Before taking action (analyzing code, modifying files, or generating outputs), always review the latest files in these locations to ensure compliance with project conventions, context, and operational constraints.

## Active project rules (phase 3)

Read all applicable rules before changing code:

- [Backend conventions](./.agents/rules/backend-conventions.md)
- [Frontend structure and UX](./.agents/rules/frontend-structure.md)
- [Testing and verification](./.agents/rules/testing-verification.md)
- [Development environment](./.agents/rules/development-environment.md)
- [Git workflow and agent context](./.agents/rules/git-workflow.md)

These rules govern new or modified work, not an automatic rewrite of the
legacy application. Domain choices and infrastructure migrations still need
an explicit scope. The [phase 2 draft](./memory-bank/archive/phase2-proposed-rules.md)
is historical and must not override the active rules.
Local skills are currently absent; do not invent or install them.

For the scoped implementation exercise and its evidence, see
[Phase 3 rule application](./memory-bank/phase3-rule-application.md).

## Current Memory Bank (phase 4)

Read the current context before changes; previous phase analyses are historical:

- [Product context](./memory-bank/productContext.md)
- [Technology context](./memory-bank/techContext.md)
- [System patterns](./memory-bank/systemPatterns.md)
- [Progress, debt and pending validation](./memory-bank/progress.md)

Keep these documents aligned with code and record the date and scope of
verification. Do not present historical tests as newly executed checks.
