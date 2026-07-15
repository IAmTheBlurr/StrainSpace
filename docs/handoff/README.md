# Handoff Archive Location

Place the contents of the original sixteen-file handoff package directly in this directory.

The ZIP contains one wrapper directory named `warhammer_generative_geometry_handoff`. Flatten the wrapper while preserving every file name and byte content.

Example shell sequence:

```bash
mkdir -p docs/handoff /tmp/strainspace-handoff
unzip Warhammer_Generative_Geometry_Handoff_v0.1.0.zip -d /tmp/strainspace-handoff
cp -a /tmp/strainspace-handoff/warhammer_generative_geometry_handoff/. docs/handoff/
```

Expected files include:

- `00_README_AND_HANDOFF.md`
- `01_PLAIN_LANGUAGE_PRIMER.md`
- `02_FORMAL_MATHEMATICAL_FRAMEWORK.md`
- `03_GLOSSARY_AND_TERM_STATUS.md`
- `04_PAIR_GEOMETRY_AND_DICE_PROJECTIONS.md`
- `05_LIST_BOARD_AND_VP_GEOMETRY.md`
- `06_FALSIFIABLE_HYPOTHESES_AND_TESTS.md`
- `07_COMPUTATIONAL_ARCHITECTURE.md`
- `08_POST_GAME_DIAGNOSIS_AND_LIST_HOLES.md`
- `09_RESEARCH_ROADMAP_AND_OPEN_QUESTIONS.md`
- `10_LLM_CONTINUATION_CONTEXT.md`
- `11_REFERENCES_AND_RULES_ASSUMPTIONS.md`
- `Warhammer_Generative_Geometry_FULL.md`
- `formal_model_schema.yaml`
- `manifest.json`
- `warhammer_geometry_glossary.json`

Preserve names and contents. The manifest provides archival integrity checks.
