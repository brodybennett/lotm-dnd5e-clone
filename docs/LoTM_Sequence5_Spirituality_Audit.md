# LoTM Sequence 5 Spirituality Audit

This report audits live Sequence 5 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus any missing sequence metadata.

## Sequence 5 Cost Logic

- Base cast at Sequence 5 should be `4 Spirituality`; live level-4 abilities already derive that cost automatically from item level.
- Standard Sequence 5 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for the first meaningful expansion in scope, target count, rider strength, or duration.
- `+2` is for major sustained value, stronger control, or a second large tactical rider.
- `+4` is for clear encounter-shaping improvement, layered authority, or a qualitatively stronger end-state.
- A compressed `+1 / +2 / +3` ladder remains acceptable only for bounded support or information abilities whose top-end output still sits below full encounter-swing tools.

## Findings

- Sequence 5 again showed broad authored-text drift below the live system cost; many abilities were still labelled `0`, `1`, `2`, or `3` despite actual level-based cost `4`.
- Bard remained materially overpriced across its Sequence 5 package and was normalized back to the shared Sequence 5 pricing spine.
- Corpse Collector's Sequence 5 package was also over-surcharged at `+2 / +4 / +6` relative to comparable authority-grade Sequence 5 tools and was normalized to the standard ladder.
- Spectator keeps compressed pricing only on `Guidance`, which remains bounded support rather than a full authority or battlefield swing.
- Seer and Spectator Sequence 5 abilities were missing `flags.lotm.grantedSequence = 5`; those tags were repaired for future grouped audits.

## Live Sequence 5 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Flash | 4 | 1 / 2 / 4 | standard |  |
| Apothecary | Full Moon | 4 | 1 / 2 / 4 | standard |  |
| Apothecary | Moonlight Transformation | 4 | 1 / 2 / 4 | standard |  |
| Apprentice | Astral Coordinate Record | 4 | 1 / 2 / 4 | standard |  |
| Apprentice | Positioning | 4 | 1 / 2 / 4 | standard |  |
| Apprentice | Traveler's Door | 4 | 1 / 2 / 4 | standard |  |
| Arbiter | Disciplinary Aura | 4 | 1 / 2 / 4 | standard |  |
| Arbiter | Layered Prohibition | 4 | 1 / 2 / 4 | standard |  |
| Arbiter | Punishment Mark | 4 | 1 / 2 / 4 | standard |  |
| Assassin | Contagion Waltz | 4 | 1 / 2 / 4 | standard |  |
| Assassin | Mirror Fever Parlor | 4 | 1 / 2 / 4 | standard |  |
| Assassin | Needle Tresses | 4 | 1 / 2 / 4 | standard |  |
| Bard | Light of Holiness | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Bard | Purification Halo | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Bard | Sanctified Verdict | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Corpse Collector | Death Envoy | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Corpse Collector | Door to the Underworld | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Corpse Collector | Internal Underworld | 4 | 1 / 2 / 4 | standard | Normalized to shared Sequence 5 ladder. |
| Criminal | Defiling Seed | 4 | 1 / 2 / 4 | standard |  |
| Criminal | Desire Control | 4 | 1 / 2 / 4 | standard |  |
| Criminal | Desire Incarnation | 4 | 1 / 2 / 4 | standard |  |
| Hunter | Cull | 4 | 1 / 2 / 4 | standard |  |
| Hunter | Precision Barrage | 4 | 1 / 2 / 4 | standard |  |
| Hunter | Weakness Survey | 4 | 1 / 2 / 4 | standard |  |
| Lawyer | Disorder Judgment | 4 | 1 / 2 / 4 | standard |  |
| Lawyer | Distance Misrule | 4 | 1 / 2 / 4 | standard |  |
| Lawyer | Procedural Misorder | 4 | 1 / 2 / 4 | standard |  |
| Marauder | Disguise | 4 | 1 / 2 / 4 | standard |  |
| Marauder | Dream Transfer | 4 | 1 / 2 / 4 | standard |  |
| Marauder | Thought Usurpation | 4 | 1 / 2 / 4 | standard |  |
| Monster | Banked Luck | 4 | 1 / 2 / 4 | standard |  |
| Monster | Curse of Misfortune | 4 | 1 / 2 / 4 | standard |  |
| Monster | Winner's Premonition | 4 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Star Concealment | 4 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Starlight Cage | 4 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Stellar Self | 4 | 1 / 2 / 4 | standard |  |
| Planter | Child of the Oak | 4 | 1 / 2 / 4 | standard |  |
| Planter | Underground Travel | 4 | 1 / 2 / 4 | standard |  |
| Planter | Wrath of Nature | 4 | 1 / 2 / 4 | standard |  |
| Prisoner | Mirror Blink | 4 | 1 / 2 / 4 | standard |  |
| Prisoner | Wraith Possession | 4 | 1 / 2 / 4 | standard |  |
| Prisoner | Wraith Transformation | 4 | 1 / 2 / 4 | standard |  |
| Reader | Formula Transposition | 4 | 1 / 2 / 4 | standard |  |
| Reader | Mystic Arts Prototype | 4 | 1 / 2 / 4 | standard |  |
| Reader | Rapid Rite | 4 | 1 / 2 / 4 | standard |  |
| Sailor | Lightning Bolt Arrow | 4 | 1 / 2 / 4 | standard |  |
| Sailor | Ocean Current Manipulation | 4 | 1 / 2 / 4 | standard |  |
| Sailor | Water Curtain | 4 | 1 / 2 / 4 | standard |  |
| Savant | Astronomy | 4 | 1 / 2 / 4 | standard |  |
| Savant | Blessing of Stars | 4 | 1 / 2 / 4 | standard |  |
| Savant | False Constellations | 4 | 1 / 2 / 4 | standard |  |
| Savant | Star of Curses | 4 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Commandeering Shadows | 4 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Devouring Rite | 4 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Grazing Sacrament | 4 | 1 / 2 / 4 | standard |  |
| Seer | Marionette Imprint | 4 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Spirit Thread Perception | 4 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Thread Seizure | 4 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Grave Lantern | 4 | 1 / 2 / 4 | standard |  |
| Sleepless | Spirit Commanding | 4 | 1 / 2 / 4 | standard |  |
| Sleepless | Spirit Vessel | 4 | 1 / 2 / 4 | standard |  |
| Spectator | Alteration | 4 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Spectator | Dream Traversal | 4 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Spectator | Guidance | 4 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Warrior | Illusion Immunity | 4 | 1 / 2 / 4 | standard |  |
| Warrior | Protection | 4 | 1 / 2 / 4 | standard |  |
| Warrior | Unbreakable Defense | 4 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 5 abilities now present a `Baseline (4 Spirituality)` text line that matches the actual level-based system cost.
- Bard and Corpse Collector now use the shared Sequence 5 pricing spine instead of bespoke premium surcharges.
- Spectator keeps compressed pricing only on bounded `Guidance`; `Alteration` and `Dream Traversal` remain on the standard ladder.
