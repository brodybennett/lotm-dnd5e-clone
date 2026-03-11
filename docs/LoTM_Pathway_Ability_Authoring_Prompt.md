# LoTM Sequence-by-Sequence Authoring Prompt

Use this when you want Codex to build a pathway **one sequence at a time** (single sequence package + single-sequence compendium mutation per run).

Minimum inputs are pathway name and target sequence.

## Copy/Paste Prompt (One Sequence Per Run)
```text
You are Codex working inside the Foundry LoTM system repository.

Your job is to create/update exactly ONE sequence package in this run for one pathway:
- Sequence package for the target sequence only
- Ability/features for the target sequence only
- Actual Foundry compendium creation/update for pathway metadata (if needed) + ability folder + target-sequence ability record(s)

Do not split attention across multiple pathways or multiple target sequences.

Primary input:
- Pathway Name: {{PATHWAY_NAME}}
- Target Sequence: {{TARGET_SEQUENCE_0_TO_9}}

Optional inputs:
- First-Sequence Name (Sequence 9 name, if pathway/folder does not exist yet): {{FIRST_SEQUENCE_NAME}}
- Tone/Style goals: {{TONE_GOALS}}
- Mechanical constraints: {{MECHANICAL_CONSTRAINTS}}
- Exclusions: {{EXCLUSIONS}}

Authority order (highest to lowest):
1) Local LoTM Rules compendium constraints (especially Character Pathways -> Overview and Legacy Ability Scaling).
2) Local LoTM pathway creation guide and docs in this repo.
3) Lord of Mysteries Fandom wiki for lore alignment (with URL citations per lore claim).

Implementation target (required):
- You must perform real data mutation in the local Foundry packs, not only output a proposal.
- Pathway record target pack: `packs/lotm_pathways`
- Ability record target pack: `packs/lotm_abilities`
- Use the pathway's first-sequence name as the ability folder name.
- Create/update records so the resulting target-sequence ability set is immediately visible in Foundry compendiums.
- Ability placement rule (required): set each ability item's `system.level` from the sequence it is granted at, using `system.level = 9 - grantedSequence` (Sequence 9->level 0, Sequence 8->level 1, ..., Sequence 0->level 9) so it appears in the correct Abilities tab section.

Required working method (take your time, do not rush):
Phase 1: Grounding and references
- Inspect local pathway/ability/rules structures first.
- Build a short reference list from LoTM Fandom pages directly relevant to this pathway.
- Do not proceed with unverified lore assumptions.

Phase 2: Pathway continuity framing
- Identify existing pathway state in packs (pathway item, ability folder, already-authored sequence records).
- If target sequence is 9, establish baseline sequence identity and pathway vector.
- If target sequence is 8-0, anchor to existing lower-sequence records and preserve pathway identity continuity.
- Keep counterplay and corruption/risk pressure where appropriate.
- Determine/confirm granted-at sequence metadata for affected abilities and preserve section placement compatibility via `system.level = 9 - grantedSequence`.

Phase 3: Target sequence package and ability
- Produce only the target-sequence package.
- For the target sequence, provide:
  - sequence fantasy statement
  - package type (total + gain perspective)
  - budget target and spend breakdown
  - ability/features for that sequence
  - compendium metadata per ability: granted sequence and `system.level` value (`9 - grantedSequence`)
  - ability count target (minimum by budget band):
    - budget <= 5: at least 2 abilities
    - budget 6-40: at least 3 abilities
    - budget 41-143: at least 3-4 abilities
    - budget >= 144: at least 4 abilities
  - spirituality scaling for each ability:
    - baseline effect at normal cost
    - explicit higher-spend options (upcast tiers) with larger potency/scope/efficiency
    - scaling must keep lower-sequence abilities relevant at higher sequence play
- If target sequence is 8-0, apply Legacy Ability Scaling for this promotion step:
  - reserve 25%-35% of gain budget for legacy upgrades
  - upgrade up to 2 legacy abilities
  - upgrade types: Potency, Scope, Efficiency
  - count legacy upgrades in budget math
  - enforce 2+ sequence-below relevance check

Phase 4: Final validation
- Verify target-sequence budget compliance and domain balance.
- Verify continuity with previously authored adjacent sequences.
- Verify lore consistency with cited URLs.
- Flag conflicts and provide lore-faithful balanced alternatives.
- Verify created/updated target-sequence records exist in the target compendiums.
- Verify Abilities-tab placement correctness by read-back: each written/updated ability has the correct `system.level` for its granted sequence.

Output format (use exactly these sections):
1) Pathway Overview
2) Reference Sources
   - Table: claim area | source URL | how used
3) Sequence Context
   - Table: previous sequence | target sequence | next sequence | continuity notes
4) Target Sequence Package and Ability List
   - target sequence package summary
   - abilities/features with mechanics
   - each ability's spirituality scaling tiers (baseline + upcast spend options)
   - cost math per feature (base/modifiers/discounts/final)
5) Legacy Ability Scaling Audit
   - If target sequence is 8-0: table with promotion step | legacy upgrades chosen | type | cost | relevance outcome
   - If target sequence is 9: state N/A (no promotion predecessor)
6) Compendium Build Spec
   - pathway item spec actually written
   - ability folder actually written (first-sequence name)
   - target-sequence ability entries actually written with IDs/slugs/sourceClass mapping and grantedSequence->`system.level` mapping
7) Write Verification
   - exact compendium keys/IDs created or updated
   - folder ID used
   - target-sequence ability count written
   - read-back checks proving records exist and `system.level` values match sequence-granted placement
8) GM Adjudication and Abuse Risks
9) Final Consistency Checks
   - budget pass/fail
   - legacy scaling pass/fail (or N/A for Sequence 9)
   - lore pass/fail

Hard constraints:
- One pathway and one target sequence per prompt.
- No uncited lore claims.
- No generic flavor-only abilities; every ability needs actionable mechanics.
- Ability names must be only the ability name (no sequence number, no sequence title, no "Sequence X:" prefixes).
- Enforce per-sequence minimum ability count by budget band (2-4+ as specified above).
- Every ability must include spirituality scaling tiers so players can spend more spirituality for larger effects.
- Every ability record must set `system.level` to the correct sequence-granted mapping (`system.level = 9 - grantedSequence`) so it appears under the correct section in the character sheet Abilities tab.
- Keep pathway identity coherent with already-authored sequences.
- Prefer quality and correctness over speed.
- Do not stop at planning text; target-sequence pathway/ability records must be written into Foundry compendiums in this run.
```

## Quick Use Example
```text
Pathway Name: Spectator
Target Sequence: 7
First-Sequence Name: Spectator
Tone/Style goals: paranoia, social control, information warfare
Mechanical constraints: strong utility/control, weaker direct burst damage
Exclusions: no time-stop effects
```
