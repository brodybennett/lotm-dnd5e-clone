# LoTM Sequence 8 Spirituality Audit

This report audits live Sequence 8 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.

## Sequence 8 Cost Logic

- Base cast at Sequence 8 should be `1 Spirituality`; live level-1 abilities already derive that cost automatically from item level.
- Standard Sequence 8 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for a first meaningful scope, target-count, or reliability increase.
- `+2` is for a second tactical rider, stronger control, or longer sustained value.
- `+4` is for encounter-shaping duration, broader team influence, or a major extra rider.
- A compressed `+1 / +2 / +3` ladder is still acceptable for narrow utility or information abilities that do not produce full encounter swing even at peak spend.

## Findings

- Sequence 8 mechanics were mostly sound in the live system; the main inconsistency was authored text lagging behind actual level-based spirituality pricing.
- Multiple Sequence 8 abilities still claimed `Baseline (0 Spirituality)` even though the live system charges `1` by default at level `1`.
- Bard remained the clearest true pricing outlier: both Sequence 8 abilities were authored far above the shared band and were normalized back to the common Sequence 8 ladder.
- Seer and Spectator again had missing `flags.lotm.grantedSequence = 8` metadata on their Sequence 8 abilities; those tags were repaired for future grouped audits.

## Live Sequence 8 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Beast Communion | 1 | 1 / 2 / 4 | standard |  |
| Apothecary | Tranquil Menagerie | 1 | 1 / 2 / 4 | standard |  |
| Apprentice | Black Curtain | 1 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Apprentice | Escape Trick | 1 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Arbiter | Jurisdiction Field | 1 | 1 / 2 / 4 | standard |  |
| Arbiter | Recognition Warrant | 1 | 1 / 2 / 4 | standard |  |
| Assassin | Instigation | 1 | 1 / 2 / 4 | standard |  |
| Assassin | Malice Appraisal | 1 | 1 / 2 / 4 | standard |  |
| Bard | Noonday Shine | 1 | 1 / 2 / 4 | standard | Normalized to shared Sequence 8 ladder. |
| Bard | Sunlit Benediction | 1 | 1 / 2 / 4 | standard | Normalized to shared Sequence 8 ladder. |
| Corpse Collector | Death Eyes | 1 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Grave Whisper | 1 | 1 / 2 / 4 | standard |  |
| Criminal | Crushing Slowness | 1 | 1 / 2 / 4 | standard |  |
| Criminal | Demonic Attribute | 1 | 1 / 2 / 4 | standard |  |
| Hunter | Incendiary Taunt | 1 | 1 / 2 / 4 | standard |  |
| Hunter | Warline Rally | 1 | 1 / 2 / 4 | standard |  |
| Lawyer | Rulebreaker Physique | 1 | 1 / 2 / 4 | standard |  |
| Lawyer | Verdict Compulsion | 1 | 1 / 2 / 4 | standard |  |
| Marauder | Eloquence | 1 | 1 / 2 / 4 | standard |  |
| Marauder | Thought Misdirection | 1 | 1 / 2 / 4 | standard |  |
| Monster | Fortune Drift | 1 | 1 / 2 / 4 | standard |  |
| Monster | Weighted Outcome | 1 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Arcane Marginalia | 1 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Spirit World Entry | 1 | 1 / 2 / 4 | standard |  |
| Planter | Herbal Diagnosis | 1 | 1 / 2 / 4 | standard |  |
| Planter | Restorative Sap | 1 | 1 / 2 / 4 | standard |  |
| Prisoner | Bound Shadow | 1 | 1 / 2 / 4 | standard |  |
| Prisoner | Leashed Frenzy | 1 | 1 / 2 / 4 | standard |  |
| Reader | Annotated Procedure | 1 | 1 / 2 / 4 | standard |  |
| Reader | Deductive Threading | 1 | 1 / 2 / 4 | standard |  |
| Sailor | Raging Blow | 1 | 1 / 2 / 4 | standard |  |
| Sailor | Wrath | 1 | 1 / 2 / 4 | standard |  |
| Savant | Adaption | 1 | 1 / 2 / 4 | standard |  |
| Savant | Strata Appraisal | 1 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Danger Murmur | 1 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Whisper Communion | 1 | 1 / 2 / 4 | standard |  |
| Seer | Mocking Mien | 1 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Threaded Footwork | 1 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Midnight Verse | 1 | 1 / 2 / 4 | standard |  |
| Sleepless | Nightwatch Bond | 1 | 1 / 2 / 4 | standard |  |
| Spectator | Enhanced Vision | 1 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Mind Reading | 1 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Warrior | Close-Quarters Mastery | 1 | 1 / 2 / 4 | standard |  |
| Warrior | Supernatural Resistance | 1 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 8 abilities now present a `Baseline (1 Spirituality)` text line that matches the actual level-based system cost.
- Bard `Noonday Shine` and `Sunlit Benediction` now use the shared Sequence 8 pricing spine instead of inflated bespoke costs.
- Apprentice and Spectator retain compressed top-end ladders because their Sequence 8 effects remain narrow utility, information, or positioning tools rather than broad encounter-swing packages.
