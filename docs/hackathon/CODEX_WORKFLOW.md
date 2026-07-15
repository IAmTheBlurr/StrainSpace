# Codex Workflow

## Plugin setup

Optionally install the official Devpost Hackathons Plugin in Codex. Use it as a workflow helper. Treat the official Build Week page and rules as the source of truth for deadlines, eligibility, requirements, and judging. Open a new Codex session after plugin installation when Codex requests one.

## Primary thread

Use one primary Codex thread for the core implementation. The Build Week submission needs the Session ID from the thread where most core functionality was built.

## Thread responsibilities

Keep the primary thread focused on:

- architecture
- schemas
- deterministic engine
- tests
- web integration
- model integration
- final hardening

Use secondary threads for isolated research or throwaway exploration only when needed. Merge useful findings back into product documentation and code through reviewed commits.

## Recommended loop

1. Give Codex one milestone with explicit quality gates.
2. Require a plan before edits.
3. Let Codex inspect the repository.
4. Require tests and local checks.
5. Review diffs.
6. Commit one coherent milestone.
7. Update provenance.
8. Continue in the same primary thread.

## Useful Codex tasks

- repository scaffolding
- schema implementation
- test generation
- property-test design
- refactoring
- visualization implementation
- accessibility review
- build debugging
- documentation synchronization
- demo hardening

## Guardrails

- Never paste private source-name mappings into Codex prompts when session data may become submission evidence.
- Keep secrets in environment variables.
- Require schema validation for model output.
- Require deterministic tests after each rule operator.
- Ask Codex to scan tracked files for forbidden terms before release.

## Final session record

Before submission:

1. Run all checks.
2. Ask Codex for a concise implementation inventory.
3. Ask Codex to identify unresolved risks.
4. Run `/feedback` in the primary thread.
5. Store the Session ID in a private submission note, not source code.
