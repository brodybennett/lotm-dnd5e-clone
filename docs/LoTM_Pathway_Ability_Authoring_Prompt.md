# LoTM Pathway Ability Authoring Prompt

## Changelog (2026-03-10)
- Added **Legacy Ability Scaling** guidance to the LoTM Rules compendium page:
  - Pack: `lotm_rules`
  - Entry: `Character Pathways`
  - Page: `Overview`
- This document provides a production-ready Codex prompt aligned with the current pathway creation guide and rules compendium constraints.

## Legacy Ability Scaling (Plain-Language Rule)
When you create a new sequence package, part of the budget must keep older abilities relevant:
1. Reserve **25%-35%** of the **gain budget** for legacy upgrades.
2. Upgrade up to **2 legacy abilities** per promotion package.
3. Use one upgrade type per legacy upgrade:
   - **Potency**: stronger numbers.
   - **Scope**: broader targets, range, area, or duration.
   - **Efficiency**: better frequency, setup cost, or action/resource economy.
4. Score legacy upgrades with the same existing rubric and include them in total budget spend.
5. Relevance check: at least one ability from **2+ sequences below** should still be tactically meaningful; if not, add a legacy upgrade or rider.

## Copy/Paste Codex Prompt Template
```text
You are designing one LoTM pathway sequence package for a Foundry LoTM system.

MODE: sequence_by_sequence

Follow these authorities in order:
1) Current LoTM Rules compendium constraints, including Character Pathways -> Overview and Legacy Ability Scaling.
2) Current LoTM Pathway Creation Guide (budget model, rubric, and workflow).
3) Lord of Mysteries Fandom wiki pages for lore alignment.

Hard requirements:
- Keep package spend at or below target budget.
- Apply the Legacy Ability Scaling rule exactly:
  - Reserve 25%-35% of gain budget for legacy upgrades.
  - Upgrade up to 2 legacy abilities.
  - Use Potency/Scope/Efficiency upgrade types.
  - Count legacy upgrades in the same budget math.
  - Pass the 2+ sequence-below relevance check.
- Validate lore against LoTM Fandom pages and cite URLs for every lore claim used.
- If lore conflicts with game balance or local rules, do not ignore it:
  - Flag the conflict.
  - Propose a lore-faithful balanced alternative.
  - State which rule/lore source forced the change.

Input:
- Pathway Name: {{PATHWAY_NAME}}
- Target Sequence: {{TARGET_SEQUENCE}}
- Package Type (gain|total): {{PACKAGE_TYPE}}
- Target Budget: {{TARGET_BUDGET}}
- Primary Domain(s): {{PRIMARY_DOMAINS}}
- Secondary Domain(s): {{SECONDARY_DOMAINS}}
- Hard Constraints: {{HARD_CONSTRAINTS}}

Output format (use these exact sections):
1) Sequence Summary
2) Budget Overview
   - Target budget
   - Planned spend
   - Reserved budget (if any)
3) Feature List With Cost Math
   - For each feature: name, description, domain tags, base score, modifiers, discounts, final cost
4) Legacy Upgrade Section
   - Which older abilities were upgraded
   - Upgrade type (Potency/Scope/Efficiency)
   - Cost per upgrade
   - Why this preserves relevance at current sequence
5) Lore Alignment Table
   - Columns: Claim | Fandom Page URL | Ability/Feature Mapping | Notes
6) GM Adjudication Flags
   - Edge cases, abuse risks, and counterplay notes
7) Consistency Checks
   - Budget pass/fail
   - Legacy scaling pass/fail
   - Lore alignment pass/fail

Additional constraints:
- Do not output unsupported lore claims without a citation URL.
- Do not use generic flavor text as a substitute for mechanics.
- Keep pathway identity coherent and avoid solving every domain at once.
```

