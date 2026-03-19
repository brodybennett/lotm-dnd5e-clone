# LoTM Sequence 1 Spirituality Audit

This report audits live Sequence 1 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-8 ability set.

## Sequence 1 Cost Logic

- Base cast at Sequence 1 should be `8 Spirituality`; live level-8 abilities already derive that cost automatically from item level.
- Sequence 1 supports four valid pricing families because reserve floors are now large enough that premium spends need stronger differentiation:
- `+1 / +2 / +4` for bounded or primarily tactical abilities.
- `+2 / +4 / +6` for strong flexible control, rule-edit, or narrower high-tier premium abilities.
- `+2 / +4 / +8` for broad authority, sovereign forms, battlefield domains, or mass command.
- `+4 / +8 / +12` for apex reality-edit, spirit-sovereign, or scene-warping authorities whose spend should still feel meaningfully premium at Sequence 1 reserves.

## Findings

- Sequence 1 again showed major authored-text drift under the live level-8 cost; many abilities still advertised baselines between `0` and `12` even though the actual system baseline is already `8`.
- Bard remained massively over-surcharged, with baselines between `16` and `20` and upcast ladders as high as `+8 / +14 / +20`.
- Corpse Collector, Seer, and Spectator were already authored as apex-style packages conceptually, but their baseline text still lagged far below the real level-8 cost.
- Arbiter's `+1 / +3 / +6` ladders and Planter's `+2 / +3 / +5` ladder did not match any coherent Sequence 1 pricing family and were normalized.
- Actual level-8 Seer and Spectator abilities were missing `grantedSequence = 1`, and actual level-8 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.

## Live Sequence 1 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Crimson Moon Sovereignty | 8 | 1 / 2 / 4 | standard |  |
| Apothecary | Living Miracle Atelier | 8 | 1 / 2 / 4 | standard |  |
| Apothecary | Sublime Moon Visage | 8 | 1 / 2 / 4 | standard |  |
| Apothecary | Unrefused Summons | 8 | 1 / 2 / 4 | standard |  |
| Apprentice | Exile Corridor | 8 | 2 / 4 / 8 | authority-premium |  |
| Apprentice | Foldspace Sanctuary | 8 | 2 / 4 / 8 | authority-premium |  |
| Apprentice | Spatial Dominion | 8 | 2 / 4 / 8 | authority-premium |  |
| Apprentice | Worldline Traverse | 8 | 2 / 4 / 8 | authority-premium |  |
| Arbiter | Anomaly Arbitration | 8 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Arbiter | Order Proxy | 8 | 2 / 4 / 8 | authority-premium |  |
| Arbiter | Remote Judgment | 8 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Arbiter | Statute Reformation | 8 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Assassin | Apocalypse Overture | 8 | 2 / 4 / 8 | authority-premium |  |
| Assassin | Ninefold Mirror Host | 8 | 2 / 4 / 8 | authority-premium |  |
| Assassin | Panic Coronation | 8 | 2 / 4 / 8 | authority-premium |  |
| Assassin | Ruinous Prophecy | 8 | 2 / 4 / 8 | authority-premium |  |
| Bard | Eternal Daytime | 8 | 4 / 8 / 12 | apex-premium | Normalized to apex-premium ladder. |
| Bard | Holy Kingdom | 8 | 4 / 8 / 12 | apex-premium | Normalized to apex-premium ladder. |
| Bard | Incarnation of Order | 8 | 4 / 8 / 12 | apex-premium | Normalized to apex-premium ladder. |
| Bard | Servant of Faith | 8 | 4 / 8 / 12 | apex-premium | Normalized to apex-premium ladder. |
| Corpse Collector | Death Decree | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Corpse Collector | Final Judgment Sigil | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Corpse Collector | Pale World | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Corpse Collector | Sovereign of Spirits | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Criminal | Filthy Kingdom | 8 | 2 / 4 / 8 | authority-premium |  |
| Criminal | Flames of the Abyss | 8 | 2 / 4 / 8 | authority-premium |  |
| Criminal | King of Filth | 8 | 2 / 4 / 8 | authority-premium |  |
| Criminal | The Corroder | 8 | 2 / 4 / 8 | authority-premium |  |
| Hunter | Casting Soldiers | 8 | 1 / 2 / 4 | standard |  |
| Hunter | Conquest Will | 8 | 1 / 2 / 4 | standard |  |
| Hunter | Spear of Destruction | 8 | 2 / 4 / 8 | authority-premium |  |
| Hunter | War Commander Banner | 8 | 1 / 2 / 4 | standard |  |
| Lawyer | Abolition Edict | 8 | 1 / 2 / 4 | standard |  |
| Lawyer | Definition Override | 8 | 1 / 2 / 4 | standard |  |
| Lawyer | Mausoleum Exclusion | 8 | 1 / 2 / 4 | standard |  |
| Lawyer | Order Repeal | 8 | 1 / 2 / 4 | standard |  |
| Marauder | Error Envoy | 8 | 1 / 2 / 4 | standard |  |
| Marauder | Fate Forgery | 8 | 1 / 2 / 4 | standard |  |
| Marauder | Mirrored Usurpation | 8 | 1 / 2 / 4 | standard |  |
| Marauder | Trojan Reign | 8 | 1 / 2 / 4 | standard |  |
| Monster | Cycle of Fate | 8 | 1 / 2 / 4 | standard |  |
| Monster | Dream Revelation | 8 | 1 / 2 / 4 | standard |  |
| Monster | Fated Connection | 8 | 1 / 2 / 4 | standard |  |
| Monster | Reboot | 8 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Arcana Bestowal | 8 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Emperor's Query | 8 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Imperial Knowledge Embodiment | 8 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Sovereign Revision Field | 8 | 1 / 2 / 4 | standard |  |
| Planter | Child of Nature | 8 | 1 / 2 / 4 | standard |  |
| Planter | Natural Concept Sovereignty | 8 | 1 / 2 / 4 | standard |  |
| Planter | Various Escape Techniques | 8 | 1 / 2 / 4 | standard |  |
| Planter | World Creation | 8 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Prisoner | Abomination Manifestation | 8 | 1 / 2 / 4 | standard |  |
| Prisoner | Black Mire Seal | 8 | 1 / 2 / 4 | standard |  |
| Prisoner | Deviant Conversion | 8 | 1 / 2 / 4 | standard |  |
| Prisoner | Invisible Curse | 8 | 1 / 2 / 4 | standard |  |
| Reader | Concept Errata | 8 | 2 / 4 / 8 | authority-premium |  |
| Reader | Exact Imitation | 8 | 2 / 4 / 8 | authority-premium |  |
| Reader | Omniscient Survey | 8 | 2 / 4 / 8 | authority-premium |  |
| Reader | Optimal Branch Decree | 8 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Heavenly Punishment | 8 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Incarnation of Light | 8 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Ocean of Lightning | 8 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Storm Hell | 8 | 2 / 4 / 8 | authority-premium |  |
| Savant | Civilization Engine | 8 | 2 / 4 / 8 | authority-premium |  |
| Savant | Civilization Works | 8 | 2 / 4 / 8 | authority-premium |  |
| Savant | Enlightenment Matrix | 8 | 2 / 4 / 8 | authority-premium |  |
| Savant | History Projection | 8 | 2 / 4 / 8 | authority-premium |  |
| Secrets Suppliant | Corrosion of Betrayal | 8 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Dark Angel Descent | 8 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Degenerate Ocean | 8 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Shadow of the Sun | 8 | 1 / 2 / 4 | standard |  |
| Seer | Grafting | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Seer | Regenerate | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Seer | Spirit World Decree | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Seer | Spirit-Body Seam | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Sleepless | Commander of Spirits | 8 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Knight's Physique | 8 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Misfortune | 8 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Servant of Darkness | 8 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Spectator | Coincidence | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Spectator | Dream of Reality | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Spectator | Envisioning | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Spectator | Psyche | 8 | 4 / 8 / 12 | apex-premium | Apex-premium ladder retained. |
| Warrior | Delegated Godmark | 8 | 1 / 2 / 4 | standard |  |
| Warrior | Proxy Manifestation | 8 | 1 / 2 / 4 | standard |  |
| Warrior | Right Hand of Twilight | 8 | 1 / 2 / 4 | standard |  |
| Warrior | Unyielding Glory Cage | 8 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live level-8 abilities now present `Baseline (8 Spirituality)` to match the actual system cost.
- Bard now uses the shared apex-premium `8 / +4 / +8 / +12` family instead of bespoke extreme surcharges.
- Corpse Collector, Seer, and Spectator retain coherent apex-premium `8 / +4 / +8 / +12` ladders once baseline drift is corrected.
- Arbiter and Planter outlier ladders were normalized into the focused-premium `8 / +2 / +4 / +6` family.
- All actual Sequence 1 level-8 items now carry `flags.lotm.grantedSequence = 1`.
