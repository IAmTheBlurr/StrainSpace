# Repository Setup

## Human steps

1. Create an empty repository named `strainspace`.
2. Clone it into the development drive.
3. Copy this bootstrap bundle into the repository root.
4. Unzip the original sixteen-file handoff into `docs/handoff/`.
5. Confirm `docs/handoff/manifest.json` exists.
6. Commit the handoff archive and bootstrap files as separate commits when practical.
7. Open the repository in Codex.
8. Start one primary Codex thread.
9. Paste `CODEX_INITIAL_PROMPT.md` into the primary thread.

## Suggested first commits

```text
chore: add pre-build-week research handoff

docs: add StrainSpace Build Week bootstrap
```

## Verification

Expected root files:

```text
README.md
AGENTS.md
LICENSE
CODEX_INITIAL_PROMPT.md
```

Expected archive marker:

```text
docs/handoff/manifest.json
```

Expected product marker:

```text
docs/product/MVP_SCOPE.md
```
