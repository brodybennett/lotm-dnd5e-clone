# LoTM Pathway Scaling Framework Proposal

## Purpose

This proposal translates three sources into a single stat-scaling model:

- `docs/LoTM_Pathway_Mechanical_Identities.md`
- `docs/LoTM_Pathway_Creation_Guide.pdf`
- the current runtime formulas in `dnd5e.mjs`

The goal is to make pathway chassis growth feel as distinct as pathway abilities, without breaking the guide's core rule that pathways at the same sequence should remain in the same overall power band.

## Current-State Findings

### 1. The design intent is strongly asymmetric

The creation guide and pathway identities point in the same direction:

- Pathways should spend equal sequence budget differently, not homogenize.
- Power is not damage only. Control, utility, ritual leverage, survivability, information, and authority all count.
- Weaknesses are meant to remain visible, not be patched away by generic stat growth.
- Sequence growth should be qualitative as well as quantitative.

The overview rules also reinforce that asymmetry is expected:

- pathways can be asymmetric while staying in the same sequence band
- survivability/escape still needs a meaningful floor
- no pathway should dominate every domain at once

### 2. The runtime chassis is mostly sequence-only

Current progression in `dnd5e.mjs` is almost entirely global:

- Sequence budget: `2, 5, 18, 27, 40, 73, 93, 143, 217, 331`
- Proficiency-equivalent bonus: `pathwaySequenceBonus(sequence)`
- Potency and resistance: both sequence-driven
- HP base: `10 + 1.2 * budget`
- Spirituality base: `6 + budget`
- Ability cap: tier-band based, not pathway based

Current tier bands in code are:

- Sequences `9-7`
- Sequences `6-5`
- Sequences `4-3`
- Sequences `2-1`
- Sequence `0`

### 3. The content data is still flat

The authored pathway records are not yet using pathway-specific chassis data:

- all 21 pathway class records use `d8`
- all 21 use `full` spellcasting progression
- no pathway record currently stores `durabilityAdj`
- no pathway record currently stores `spiritualityAdj`
- no pathway record currently stores custom `hpBase` or `spiritualityBase`

So in practice, current pathway identity is carried almost entirely by abilities and descriptive text, not by the stat chassis.

### 4. There is a key implementation mismatch

Pathway records already define different primary spellcasting abilities:

- `int`: Seer, Spectator, Marauder, Apprentice, Reader, Secrets Suppliant, Mystery Pryer, Savant
- `wis`: Sleepless, Corpse Collector, Monster, Planter, Apothecary, Prisoner
- `cha`: Bard, Sailor, Assassin, Criminal, Lawyer
- `str`: Warrior
- `dex`: Hunter

But spirituality currently scales from `Wisdom` for everyone.

That creates a flat incentive structure that conflicts with the authored identities:

- scholar and observer pathways still need Wisdom for max spirituality
- charisma pathways still need Wisdom for max spirituality
- martial pathways do not get a distinct embodied resource model

This is the clearest sign that the current stat growth does not yet express intended pathway fantasy.

## Design Conclusion

The intended fantasy is not "same body, different spells."

It is:

- same sequence power band
- different pressure profile
- different failure mode
- different body/spirit/attribute growth shape

That means the sequence spine should stay shared, but the chassis should become pathway-specific.

## Proposed Framework

## 1. Keep the shared sequence spine

The following should remain global and sequence-equal:

- total sequence budget and gain budget
- proficiency-equivalent bonus
- potency
- resistance
- save/check edge by tier band
- movement edge
- corruption thresholds

This preserves cross-pathway encounter math and keeps authored ability packages readable.

## 2. Add a pathway resource profile

Each pathway should gain a `resourceProfile` with five band entries:

- Low: Sequences `9-7`
- Developed: Sequences `6-5`
- Saint: Sequences `4-3`
- Angel: Sequences `2-1`
- God: Sequence `0`

Each band entry is a zero-sum shift between HP and spirituality.

Recommended formula:

```text
hpBase(pathway, sequence) = round(baseHp(sequence) * (1 + resourceShift))
spBase(pathway, sequence) = round(baseSp(sequence) * (1 - resourceShift))
```

Where `resourceShift` is band-based and usually chosen from:

- `+0.12`
- `+0.08`
- `+0.04`
- `0`
- `-0.04`
- `-0.08`
- `-0.12`

Interpretation:

- positive shift = sturdier, lower spirituality reserve
- negative shift = frailer, deeper spirituality reserve
- `0` = balanced band

Why this works:

- it preserves equal chassis budget at each sequence
- it uses the same budget idea as the creation guide
- it reinforces weakness instead of erasing it
- it can express evolving pathway fantasy across bands

Example:

- Warrior can be body-heavy early, then normalize at angel/god tiers
- Sailor can start body-forward and become spirit-forward later
- Spectator can stay spirit-heavy throughout
- Apothecary can start spirit-forward, then gain more body once life-authority comes online

## 3. Add a pathway spirit anchor attribute

Replace universal Wisdom-based spirituality scaling with a pathway-defined `spiritAbility`.

Recommended formula:

```text
spiritualityMax = spBase + spiritAbility.mod * spiritScaleByTier
```

Where `spiritScaleByTier` can remain the existing shared tier multiplier.

Recommended default mapping:

- scholar/analysis/divination pathways: `int`
- ritual/life/dream/fate pathways: `wis`
- social/command/predation/law pathways: `cha`
- embodied martial pathways: `con`

This produces a much cleaner identity signal:

- Seer and Spectator gain deeper reserves from mental mastery
- Sailor and Bard gain deeper reserves from command presence
- Warrior gains deeper reserves from embodied discipline
- Apothecary and Sleepless keep Wisdom as a natural fit

## 4. Give each pathway attribute lanes, not generic all-stat growth

Every pathway should define four attribute lanes:

- `primary`: best expression stat
- `anchor`: resource/control stability stat
- `tertiary`: important but not defining stat
- `quirk`: niche identity stat

Example lane logic:

- Warrior: `primary str`, `anchor con`, `tertiary wis`, `quirk dex`
- Spectator: `primary int`, `anchor int`, `tertiary cha`, `quirk wis`
- Sailor: `primary cha`, `anchor con`, `tertiary str`, `quirk dex`
- Apothecary: `primary wis`, `anchor wis`, `tertiary int`, `quirk con`

All pathways should receive the same total attribute growth budget across the full track.

What should vary is:

- which lanes receive it
- when they receive it
- which lanes are allowed to break past the normal human ceiling first

## 5. Use lane caps to preserve pathway identity at high tier

The current code uses a global tier cap for all ability scores. That is too broad for pathway identity.

Proposed lane caps:

| Band | Primary | Anchor | Tertiary | Quirk | Off-lane |
|---|---:|---:|---:|---:|---:|
| Low (`9-7`) | 20 | 20 | 20 | 20 | 20 |
| Developed (`6-5`) | 22 | 22 | 20 | 20 | 20 |
| Saint (`4-3`) | 24 | 22 | 20 | 20 | 20 |
| Angel (`2-1`) | 26 | 24 | 22 | 20 | 20 |
| God (`0`) | 30 | 26 | 24 | 22 | 20 |

This keeps high-sequence identity coherent:

- Warrior becomes impossibly strong and durable, not universally genius and seductive
- Spectator becomes terrifyingly perceptive and controlling, not accidentally tanky
- Sailor becomes sovereign and forceful, not a six-stat generalist

## 6. Use cadence templates so pathways grow differently over time

Each pathway should also have an `attributeCadence`.

Recommended cadence templates:

- `frontloaded`: major growth arrives early; good for martial and tempo pathways
- `even`: stable gains across all bands; good for disciplined hybrids
- `saint-spike`: biggest jump at Sequences `4-3`; good for pathways whose identity changes sharply at sainthood
- `backloaded`: most identity-defining gains arrive at angel/god bands; good for scholar and authority pathways

This matters because two pathways can have the same total attribute budget but feel very different if one blooms at Sequence 7 and the other blooms at Sequence 2.

## Balance Rules

Use these rules to keep the framework stable:

- Resource shifts must remain zero-sum by sequence band.
- No pathway should get both the best HP profile and the best spirituality profile in the same band.
- Total attribute budget stays equal across all pathways.
- Lane caps should reinforce identity, not create dead stats.
- Primary and anchor lanes can be the same attribute, but that pathway should then pay by having a weaker tertiary/quirk profile.
- Pathways whose abilities already solve survivability through control, escape, substitution, concealment, or summons should not also receive top-end HP curves.
- Pathways whose abilities already spend large budget on healing, resurrection, cleansing, or spirituality restoration should lean away from also getting deepest raw spirituality pools unless their resource shift pays for it elsewhere.

## Example Pathways

Below is a worked example using current baseline formulas.

Current shared baseline:

- Sequence 5: `hpBase = 58`, `spBase = 46`
- Sequence 2: `hpBase = 182`, `spBase = 149`

### Warrior

- Resource profile: `+12, +8, +6, +2, 0`
- Spirit anchor: `con`
- Attribute lanes: `str / con / wis / dex`
- Cadence: `frontloaded`

Result:

- Sequence 5: `HP 63`, `SP 42`
- Sequence 2: `HP 186`, `SP 146`

Play feel:

- clearly sturdier than peers early
- lower reserve for repeated supernatural output
- saint and angel growth adds more Wisdom discipline instead of turning the pathway into a generic caster

### Spectator

- Resource profile: `-12, -10, -8, -4, 0`
- Spirit anchor: `int`
- Attribute lanes: `int / int / cha / wis`
- Cadence: `backloaded`

Result:

- Sequence 5: `HP 52`, `SP 51`
- Sequence 2: `HP 175`, `SP 155`

Play feel:

- lower bodily staying power
- deeper reserve for mind pressure, dream work, and layered control
- high-sequence caps reinforce mental and social domination instead of physical broadness

### Sailor

- Resource profile: `+8, +4, 0, -4, -8`
- Spirit anchor: `cha`
- Attribute lanes: `cha / con / str / dex`
- Cadence: `saint-spike`

Result:

- Sequence 5: `HP 60`, `SP 44`
- Sequence 2: `HP 175`, `SP 155`

Play feel:

- starts as a bruising momentum pathway
- becomes more authority- and domain-driven at angel tiers
- still does not out-tank Warrior or out-reserve Spectator in the same band

### Apothecary

- Resource profile: `-6, -4, 0, +4, +6`
- Spirit anchor: `wis`
- Attribute lanes: `wis / wis / int / con`
- Cadence: `even` with a saint-to-angel support spike

Result:

- Sequence 5: `HP 56`, `SP 48`
- Sequence 2: `HP 189`, `SP 143`

Play feel:

- early game leans toward spirituality handling, support, and ritual stability
- later game becomes sturdier once life-authority and summoning sovereignty become central
- stays distinct from Warrior by expressing toughness through healing/life authority instead of raw front-line brutality

## Why This Better Matches LoTM

This framework is closer to LoTM fantasy for three reasons.

First, it lets sequence growth stay shared while making the chassis pathway-shaped. That matches the guide's "same budget, different spend" rule.

Second, it makes weaknesses visible in the numbers. A Spectator should not feel like a Warrior with telepathy. A Warrior should not feel like a Spectator with more HP.

Third, it allows pathway identity to mature over bands. LoTM pathways often change what kind of power they are as sequence rises. A static HP/SP ratio cannot express that well.

## Recommended Implementation Order

1. Add `spiritAbility`, `resourceProfile`, `attributeLanes`, and `attributeCadence` to pathway records.
2. Change spirituality scaling to use `spiritAbility`.
3. Apply band-based HP/SP shifts on top of the shared sequence formulas.
4. Replace universal high-tier ability caps with lane-cap logic.
5. Only after the chassis is stable, rebalance outlier pathway abilities that were compensating for the old flat chassis.

## Recommendation

Adopt this as the default stat-growth model:

- shared sequence math for parity
- zero-sum HP/SP resource profiles for chassis identity
- pathway-specific spirit anchor attributes
- lane-based attribute growth and lane caps
- band cadence to express when a pathway truly comes online

That approach keeps pathways equal in overall sequence budget while finally making their bodies, reserves, and stat priorities feel authored instead of generic.
