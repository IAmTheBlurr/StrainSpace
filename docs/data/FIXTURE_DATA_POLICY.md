# Fixture Data Policy

## Purpose

Use real-world-balanced scalar distributions without importing protected expression or brand identity.

## Legal and product position

In the United States, facts, ideas, systems, and methods of operation generally fall outside copyright protection. A compilation may protect original selection, coordination, or arrangement. Trademarks protect source-identifying words, phrases, symbols, and designs in relevant commercial contexts.

These principles do not create a blanket permission for copying a commercial game database. Source terms, access controls, compilation rights, international law, and hackathon rules still matter.

This file provides project policy, not legal advice.

## Allowed fixture content

- independently entered scalar values
- original field labels
- original identifiers
- original grouping and ordering
- original descriptions
- mathematical transformations derived from entered values
- source provenance stored privately

## Excluded fixture content

- official faction, unit, weapon, ability, detachment, mission, or rule names
- copied rules prose
- logos, artwork, scans, photographs, icons, or distinctive graphic presentation
- source document page structure
- copied database ordering or taxonomy
- text generated through close paraphrase of official descriptions
- data obtained through bypassed access controls

## Collection procedure

1. Choose two source factions with varied scalar distributions.
2. Manually enter only fields needed for the MVP.
3. Assign neutral internal IDs immediately.
4. Store source-name mapping in `fixtures/private-provenance/`, excluded from Git.
5. Reorder entities independently.
6. Replace source categories with original project categories.
7. Remove flavor text and ability prose.
8. Review every tracked string for protected identifiers.
9. Run automated forbidden-term checks before commits.
10. Preserve a private audit trail with source, date, and extraction method.

## Public fixture shape

A tracked fixture should resemble:

```json
{
  "factionId": "proxy-alpha",
  "entities": [
    {
      "id": "alpha-entity-01",
      "cost": 95,
      "mobility": 6,
      "resilience": 5,
      "protectionThreshold": 3,
      "health": 4,
      "control": 2,
      "attacks": [
        {
          "id": "alpha-profile-01-a",
          "count": 3,
          "accuracyThreshold": 3,
          "power": 8,
          "penetration": 2,
          "damage": 2
        }
      ]
    }
  ]
}
```

## Risk controls

- Prefer wholly original names over parody.
- Keep official terminology out of screenshots and video narration.
- Avoid claims of affiliation, endorsement, or compatibility.
- Add a generic-system disclaimer.
- Seek qualified legal review before commercialization or broad public distribution.

## Official reference principles

- U.S. Copyright Office: facts, ideas, systems, and methods of operation receive no copyright protection, while expression may receive protection.
- U.S. Copyright Office: compilation protection can extend to original selection, coordination, or arrangement rather than underlying data.
- USPTO: trademarks identify the source of goods or services through words, phrases, symbols, designs, or combinations.
- Build Week rules require rights for third-party material included in a submission.
- Games Workshop publishes a strict intellectual-property policy, so conservative separation serves the project.

## Reference links

- [U.S. Copyright Office FAQ: protection scope](https://www.copyright.gov/help/faq/faq-protect.html)
- [U.S. Copyright Office Circular 14: derivative works and compilations](https://www.copyright.gov/circs/circ14.pdf)
- [USPTO: trademark definition](https://www.uspto.gov/trademarks/basics/what-trademark)
- [OpenAI Build Week official rules](https://openai.devpost.com/rules)
- [Games Workshop legal policy](https://www.warhammer.com/legal)
