# LoTM Sequence 7 Spirituality Audit

This report audits live Sequence 7 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.

## Sequence 7 Cost Logic

- Base cast at Sequence 7 should be `2 Spirituality`; live level-2 abilities already derive that cost automatically from item level.
- Standard Sequence 7 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for the first meaningful expansion in reach, scope, damage, or rider strength.
- `+2` is for stronger control, added ally carry, longer utility, or a second real tactical rider.
- `+4` is for clear encounter-swing upgrades, broader target coverage, or a major extra effect.
- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded utility, soft control, or information abilities whose top-end output still does not match a full combat swing.

## Findings

- The dominant Sequence 7 issue was authored baseline text drifting below the live level-based system cost; many entries still displayed `0` or `1` despite actual cost `2`.
- Bard remained far above the shared band across all three Sequence 7 abilities and was normalized back to the common Sequence 7 spine.
- Spectator had one combat-swing ability (`Frenzy`) that already fit the standard `+1 / +2 / +4` ladder, while its other three bounded utility/control abilities appropriately kept the compressed ladder.
- Seer and Spectator Sequence 7 abilities were missing `flags.lotm.grantedSequence = 7`; those tags were repaired for future grouped audits.

## Live Sequence 7 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Abyss Shackles | 2 | 1 / 2 / 4 | standard |  |
| Apothecary | Corrosive Claw | 2 | 1 / 2 / 4 | standard |  |
| Apothecary | Wings of Darkness | 2 | 1 / 2 / 4 | standard |  |
| Apprentice | Crystal Route Reading | 2 | 1 / 2 / 4 | standard |  |
| Apprentice | Interference | 2 | 1 / 2 / 4 | standard |  |
| Apprentice | Silhouette Overlap | 2 | 1 / 2 / 4 | standard |  |
| Arbiter | Illusory Torture Device | 2 | 1 / 2 / 4 | standard |  |
| Arbiter | Psychic Lashing | 2 | 1 / 2 / 4 | standard |  |
| Arbiter | Psychic Piercing | 2 | 1 / 2 / 4 | standard |  |
| Assassin | Black Flame Kiss | 2 | 1 / 2 / 4 | standard |  |
| Assassin | Mirror-Frost Veil | 2 | 1 / 2 / 4 | standard |  |
| Assassin | Ruinous Allure | 2 | 1 / 2 / 4 | standard |  |
| Bard | Holy Light Summoning | 2 | 1 / 2 / 4 | standard | Normalized to shared Sequence 7 ladder. |
| Bard | Sun Halo | 2 | 1 / 2 / 4 | standard | Normalized to shared Sequence 7 ladder. |
| Bard | Sun Holy Water | 2 | 1 / 2 / 4 | standard | Normalized to shared Sequence 7 ladder. |
| Corpse Collector | Spirit Affinity | 2 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Spirit Channelling | 2 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Zombie Disguise | 2 | 1 / 2 / 4 | standard |  |
| Criminal | Devil Projection Rite | 2 | 1 / 2 / 4 | standard |  |
| Criminal | Killing Spree Script | 2 | 1 / 2 / 4 | standard |  |
| Criminal | Malice Interference | 2 | 1 / 2 / 4 | standard |  |
| Hunter | Blazing Spear | 2 | 1 / 2 / 4 | standard |  |
| Hunter | Fire Raven Volley | 2 | 1 / 2 / 4 | standard |  |
| Hunter | Wall of Fire | 2 | 1 / 2 / 4 | standard |  |
| Lawyer | Bribery | 2 | 1 / 2 / 4 | standard |  |
| Lawyer | Indebted Network | 2 | 1 / 2 / 4 | standard |  |
| Lawyer | Liability Transfer | 2 | 1 / 2 / 4 | standard |  |
| Marauder | Clause Hijack | 2 | 1 / 2 / 4 | standard |  |
| Marauder | Decryption | 2 | 1 / 2 / 4 | standard |  |
| Marauder | False Trail | 2 | 1 / 2 / 4 | standard |  |
| Monster | Jinx Bloom | 2 | 1 / 2 / 4 | standard |  |
| Monster | Lucky Pulse | 2 | 1 / 2 / 4 | standard |  |
| Monster | Sudden Reversal | 2 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Occult Backtrace | 2 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Premonitory Footnote | 2 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Threefold Formula | 2 | 1 / 2 / 4 | standard |  |
| Planter | Harvest Weather Rite | 2 | 1 / 2 / 4 | standard |  |
| Planter | Plant and Insect Commanding | 2 | 1 / 2 / 4 | standard |  |
| Planter | Seed Catalysation | 2 | 1 / 2 / 4 | standard |  |
| Prisoner | Dark Horror | 2 | 1 / 2 / 4 | standard |  |
| Prisoner | Repel Light | 2 | 1 / 2 / 4 | standard |  |
| Prisoner | Werewolf Transformation | 2 | 1 / 2 / 4 | standard |  |
| Reader | Inference Loop | 2 | 1 / 2 / 4 | standard |  |
| Reader | Rational Countermeasure | 2 | 1 / 2 / 4 | standard |  |
| Reader | Scene Reconstruction | 2 | 1 / 2 / 4 | standard |  |
| Sailor | Azure Surge | 2 | 1 / 2 / 4 | standard |  |
| Sailor | Drowning Film | 2 | 1 / 2 / 4 | standard |  |
| Sailor | Navigation | 2 | 1 / 2 / 4 | standard |  |
| Savant | Memory Indexing | 2 | 1 / 2 / 4 | standard |  |
| Savant | Ruin Route Solver | 2 | 1 / 2 / 4 | standard |  |
| Savant | Strengthened Knowledge | 2 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Black Chrysalis | 2 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Shadow Curse | 2 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Shadow Lurking | 2 | 1 / 2 / 4 | standard |  |
| Seer | Air Bullet | 2 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Flame Jump | 2 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Paper Figurine Substitute | 2 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Dream Invasion | 2 | 1 / 2 / 4 | standard |  |
| Sleepless | Dream Shaping | 2 | 1 / 2 / 4 | standard |  |
| Sleepless | Nightmare Limbs | 2 | 1 / 2 / 4 | standard |  |
| Sleepless | Nightmare State | 2 | 1 / 2 / 4 | standard |  |
| Spectator | Frenzy | 2 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Spectator | Placate | 2 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Psychological Cue | 2 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Telepathy | 2 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Warrior | Iron Body Discipline | 2 | 1 / 2 / 4 | standard |  |
| Warrior | Twilight Reversal | 2 | 1 / 2 / 4 | standard |  |
| Warrior | Weapon Mastery | 2 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 7 abilities now present a `Baseline (2 Spirituality)` text line that matches the actual level-based system cost.
- Bard `Sun Halo`, `Holy Light Summoning`, and `Sun Holy Water` now use the shared Sequence 7 pricing spine.
- Spectator keeps compressed pricing only on bounded non-burst tools (`Telepathy`, `Psychological Cue`, `Placate`); `Frenzy` remains on the standard ladder because it creates materially larger fight swing.
