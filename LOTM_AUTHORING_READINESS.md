# LoTM Authoring Readiness (Phase 9)

This file defines the current authoring contract for LoTM-facing content while preserving the cloned dnd5e runtime model.

## 1) Authoring Contract

### Pathways (internal `Item.type = "class"`)
- Keep internal item type as `class`.
- Required/expected system fields:
  - `system.levels` (integer, normally `1` on new class items).
  - `system.hd.denomination` (dice string like `d6`, `d8`, `d10`).
  - `system.hd.spent` (integer `>= 0`).
  - `system.spellcasting.progression` and `system.spellcasting.ability` when spellcasting is used.
- Recommended for stable behavior:
  - `system.identifier` as a stable slug for grouping and references.
  - `system.advancement` entries if level-up choices/features are expected.
- UX rule in normal character flow:
  - A character can add one pathway through the sheet UI.
  - Existing multiclass data remains supported for compatibility.

### Abilities (internal `Item.type = "spell"`)
- Keep internal item type as `spell`.
- Canonical field conventions:
  - `system.level` is the stored progression value (`0..9`), even when displayed as Sequence.
  - `system.school`, `system.method`, and `system.prepared` should be set to valid values.
  - `system.activities` should include at least one usable activity for roll/usage flow.
- Optional but recommended:
  - `system.sourceClass` when the ability should be grouped to a specific pathway source.
  - `system.identifier` for consistent indexing and list behavior.

### Sequence Conventions (display layer)
- Sequence conversion is display-only and maps to `system.level`:
  - `Sequence = 9 - Level`
  - `Level = 9 - Sequence`
- Table:
  - Level 0 -> Sequence 9
  - Level 1 -> Sequence 8
  - Level 2 -> Sequence 7
  - Level 3 -> Sequence 6
  - Level 4 -> Sequence 5
  - Level 5 -> Sequence 4
  - Level 6 -> Sequence 3
  - Level 7 -> Sequence 2
  - Level 8 -> Sequence 1
  - Level 9 -> Sequence 0

### Spirituality Defaults
- Character ability usage defaults to Spirituality consumption (slot consumption disabled in that path).
- Default Spirituality cost is derived from internal level (effectively level cost):
  - Level 0 costs `0`.
  - Level 1..9 costs `1..9`.
- Rest integration defaults:
  - Long rest restores full Spirituality.
  - Short rest keeps Spirituality recovery off by default, with optional partial recovery (50%, minimum 1 when enabled).
- NPC and non-character slot recovery/consumption paths remain intact for compatibility.

## 2) Workflow Verification Matrix (Phase 9)

Verification was done by code-path inspection and template/runtime checks in this repository.

- No pathway:
  - Character remains valid with zero class items.
  - Pathway add control is shown only when no class/pathway exists.
  - Header fallback label is used when no pathway exists.
- One pathway:
  - Pathway add control is hidden once a pathway exists in normal sheet flow.
  - Existing imported multiclass data still renders (compatibility fallback).
- No abilities:
  - Ability list (spellbook tab) renders a stable empty state and supports creation flow.
- Abilities across sequences:
  - Sections are built from stored level, labeled by sequence conversion, and ordered in sequence-facing order.
  - Item labels/tooltips use sequence-aware display labels.

## 3) Regression Status vs Phase 0 Baseline

### Automated checks completed
- `node --check dnd5e.mjs`
- `Get-Content system.json -Raw | ConvertFrom-Json | Out-Null`

### Manual baseline comparison required in Foundry UI
Use the original Phase 0 screenshots/exports and confirm:
- Character with no pathway and no abilities.
- Character with one pathway and abilities at multiple sequences.
- Ability use consumes Spirituality for character flow.
- Short/long rest cards and actor updates reflect Spirituality recovery settings.

## 4) Known Gaps (Documented)

- Visual parity against Phase 0 screenshots cannot be fully confirmed from CLI-only validation.
- Single-pathway behavior is enforced in sheet UX; multiclass internals remain available for legacy/import compatibility.
- Sequence is a presentation layer; storage remains `system.level` by design.
- Legacy slot models remain available to avoid breaking NPC and non-LoTM compatibility paths.
