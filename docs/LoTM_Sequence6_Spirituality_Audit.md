# LoTM Sequence 6 Spirituality Audit

This report audits live Sequence 6 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.

## Sequence 6 Cost Logic

- Base cast at Sequence 6 should be `3 Spirituality`; live level-3 abilities already derive that cost automatically from item level.
- Standard Sequence 6 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for the first meaningful scope, rider, reliability, or target expansion.
- `+2` is for stronger sustained pressure, better control, or a second major tactical rider.
- `+4` is for encounter-shaping extension, major denial, or clear advantage over peer Sequence 6 casts.
- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded soft-control or defensive utility that still stops short of a full encounter swing.

## Findings

- Sequence 6 had a large authored-text drift problem: most abilities were still labelled `0`, `1`, or `2` despite the live level-3 system charging `3` spirituality.
- Bard again sat clearly above the shared band. Its Sequence 6 kit now matches the common baseline and surcharge structure instead of using inflated bespoke pricing.
- Spectator keeps compressed pricing only on `Hypnosis` and `Dragon Scales`, which stay narrower than full encounter-swing standard-ladder effects at this band. `Psychological Invisibility` remains on the standard ladder.
- Seer and Spectator Sequence 6 abilities were missing `flags.lotm.grantedSequence = 6`; those tags were repaired for future grouped audits.

## Live Sequence 6 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Crimson Pulse Reading | 3 | 1 / 2 / 4 | standard |  |
| Apothecary | Discerning Spiritual Materials | 3 | 1 / 2 / 4 | standard |  |
| Apothecary | Potion and Perfume Crafting | 3 | 1 / 2 / 4 | standard |  |
| Apprentice | Echo Release | 3 | 1 / 2 / 4 | standard |  |
| Apprentice | Keyhole Script | 3 | 1 / 2 / 4 | standard |  |
| Apprentice | Symbol Capture | 3 | 1 / 2 / 4 | standard |  |
| Arbiter | Cityline Jurisdiction | 3 | 1 / 2 / 4 | standard |  |
| Arbiter | Judicial Exile | 3 | 1 / 2 / 4 | standard |  |
| Arbiter | Sequestration Order | 3 | 1 / 2 / 4 | standard |  |
| Assassin | Glassheart Reprieve | 3 | 1 / 2 / 4 | standard |  |
| Assassin | Sable Ember | 3 | 1 / 2 / 4 | standard |  |
| Assassin | Velvet Threads | 3 | 1 / 2 / 4 | standard |  |
| Bard | Amplification | 3 | 1 / 2 / 4 | standard | Normalized to shared Sequence 6 ladder. |
| Bard | Authentication | 3 | 1 / 2 / 4 | standard | Normalized to shared Sequence 6 ladder. |
| Bard | Nullification | 3 | 1 / 2 / 4 | standard | Normalized to shared Sequence 6 ladder. |
| Corpse Collector | Knowledge of Spirit World | 3 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Language of the Dead | 3 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Resurrection | 3 | 1 / 2 / 4 | standard |  |
| Criminal | Language of Foulness | 3 | 1 / 2 / 4 | standard |  |
| Criminal | Malice Premonition | 3 | 1 / 2 / 4 | standard |  |
| Criminal | Sulfur Fireball | 3 | 1 / 2 / 4 | standard |  |
| Hunter | Crossfire Conspiracy | 3 | 1 / 2 / 4 | standard |  |
| Hunter | Feigned Retreat | 3 | 1 / 2 / 4 | standard |  |
| Hunter | Kindling Edict | 3 | 1 / 2 / 4 | standard |  |
| Lawyer | Corrosion Sentence | 3 | 1 / 2 / 4 | standard |  |
| Lawyer | Distortion Decree | 3 | 1 / 2 / 4 | standard |  |
| Lawyer | Weakness Deposition | 3 | 1 / 2 / 4 | standard |  |
| Marauder | Ability Siphoning | 3 | 1 / 2 / 4 | standard |  |
| Marauder | Motive Embezzlement | 3 | 1 / 2 / 4 | standard |  |
| Marauder | Stolen Footing | 3 | 1 / 2 / 4 | standard |  |
| Monster | Calamity Attraction | 3 | 1 / 2 / 4 | standard |  |
| Monster | Disaster Skim | 3 | 1 / 2 / 4 | standard |  |
| Monster | Psyche Storm | 3 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Elemental Cipher Scroll | 3 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Scroll Making | 3 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Secret Voice Scroll | 3 | 1 / 2 / 4 | standard |  |
| Planter | Cross-breeding | 3 | 1 / 2 / 4 | standard |  |
| Planter | Knowledge of Life | 3 | 1 / 2 / 4 | standard |  |
| Planter | Poison Creation | 3 | 1 / 2 / 4 | standard |  |
| Prisoner | Corpse String | 3 | 1 / 2 / 4 | standard |  |
| Prisoner | Frostbound Decay | 3 | 1 / 2 / 4 | standard |  |
| Prisoner | Zombie Husk | 3 | 1 / 2 / 4 | standard |  |
| Reader | Analytic Imitation | 3 | 1 / 2 / 4 | standard |  |
| Reader | Axiomatic Refutation | 3 | 1 / 2 / 4 | standard |  |
| Reader | Polymathic Synthesis | 3 | 1 / 2 / 4 | standard |  |
| Sailor | Sea Voice Requisition | 3 | 1 / 2 / 4 | standard |  |
| Sailor | Tempest Glide | 3 | 1 / 2 / 4 | standard |  |
| Sailor | Windblade Tithe | 3 | 1 / 2 / 4 | standard |  |
| Savant | Artifact Calibration | 3 | 1 / 2 / 4 | standard |  |
| Savant | Manufacturing | 3 | 1 / 2 / 4 | standard |  |
| Savant | Ritual Fixture Integration | 3 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Cellular Reconstitution | 3 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Corrosive Flesh Bomb | 3 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Flesh Creek | 3 | 1 / 2 / 4 | standard |  |
| Seer | Faceless Mold | 3 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Featureless Countenance | 3 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Temperament Trace | 3 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Night Canticle | 3 | 1 / 2 / 4 | standard |  |
| Sleepless | Requiem | 3 | 1 / 2 / 4 | standard |  |
| Sleepless | Soul Sight | 3 | 1 / 2 / 4 | standard |  |
| Spectator | Dragon Scales | 3 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Hypnosis | 3 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Psychological Invisibility | 3 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Warrior | Dawn Armour | 3 | 1 / 2 / 4 | standard |  |
| Warrior | Light of Dawn | 3 | 1 / 2 / 4 | standard |  |
| Warrior | Sword of Dawn | 3 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 6 abilities now present a `Baseline (3 Spirituality)` text line that matches the actual level-based system cost.
- Bard `Authentication`, `Amplification`, and `Nullification` now use the shared Sequence 6 pricing spine.
- Spectator keeps compressed pricing only on bounded `Hypnosis` and `Dragon Scales`; `Psychological Invisibility` stays on the standard ladder.
