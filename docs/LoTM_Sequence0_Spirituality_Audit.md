# LoTM Sequence 0 Spirituality Audit

This report audits live Sequence 0 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-9 ability set.

## Sequence 0 Cost Logic

- Base cast at Sequence 0 should be `9 Spirituality`; live level-9 abilities already derive that cost automatically from item level.
- Sequence 0 uses five valid pricing families because god-tier reserve pools are enormous and top-end spends need clear differentiation to remain meaningful:
- `+1 / +2 / +4` for bounded or primarily tactical god-tier abilities.
- `+2 / +4 / +6` for precise but still premium god-tier control or support authorities.
- `+2 / +4 / +8` for broad authority, domain, command, or sovereign mobility effects.
- `+4 / +8 / +12` for large-scale sovereign battlefield or conceptual dominion effects.
- `+6 / +12 / +18` for absolute reality, fate, psyche, death, or sun-authority effects where the top spend should still feel materially premium even at god-tier reserves.

## Findings

- Sequence 0 showed extreme authored-text drift beneath the live level-9 cost; many abilities still advertised `0-8` spirituality baselines while the real system baseline is already `9`.
- Bard remained the largest outlier in the full audit, with baselines up to `30` and surcharges as high as `+12 / +20 / +30`.
- Corpse Collector and Spectator were still authored with enormous premium ladders, while Seer mixed `+5 / +10 / +15`, `+6 / +12 / +18`, and `+6 / +12 / +20` inside the same package.
- Apprentice, Arbiter, Assassin, Planter, and Reader each had near-miss or bespoke god-tier ladders that did not resolve into a small consistent set of families.
- Actual level-9 Seer and Spectator abilities were missing `grantedSequence = 0`, and actual level-9 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.

## Live Sequence 0 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Blood Moon Companion | 9 | 1 / 2 / 4 | standard |  |
| Apothecary | Companion of All Life | 9 | 1 / 2 / 4 | standard |  |
| Apothecary | Moon | 9 | 1 / 2 / 4 | standard |  |
| Apothecary | Origin of Fertility | 9 | 1 / 2 / 4 | standard |  |
| Apprentice | Anyspace Arrival | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Apprentice | Seal Recomposition | 9 | 2 / 4 / 6 | focused-premium |  |
| Apprentice | Threshold Sovereignty | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Apprentice | Veiled Interstice | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Apprentice | Worldline Archive | 9 | 2 / 4 / 6 | focused-premium |  |
| Arbiter | Abstract Equilibrium | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Arbiter | Disorder Arbitration | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Arbiter | Underlying Edict | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Arbiter | World Verdict | 9 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Assassin | Coronation of Chaos | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Assassin | Mirror World Sovereignty | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Assassin | Venomous Prophecy | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Assassin | Worldfall Mandate | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Bard | Contract Dominion | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Bard | Inextinguishable Light | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Bard | Omnipresent Light | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Bard | Order Absolute | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Bard | Sacred Sun | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Corpse Collector | Conceptual Extinction | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Corpse Collector | Endpoint Dominion | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Corpse Collector | Pallor of Eternal Rest | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Corpse Collector | Throne of the Dead | 9 | 6 / 12 / 18 | absolute-premium | Normalized to absolute-premium ladder. |
| Criminal | Abyss of the Heart | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Criminal | Degeneration Dominion | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Criminal | Embodiment of Malice | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Criminal | Sovereign of Corrosion | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Hunter | Astral Fog of War | 9 | 2 / 4 / 8 | authority-premium |  |
| Hunter | Conquest Dominion | 9 | 2 / 4 / 8 | authority-premium |  |
| Hunter | Lord of War | 9 | 2 / 4 / 8 | authority-premium |  |
| Hunter | Termination Spear | 9 | 2 / 4 / 8 | authority-premium |  |
| Lawyer | Autocrat Decree | 9 | 1 / 2 / 4 | standard |  |
| Lawyer | Fundamental Distortion | 9 | 1 / 2 / 4 | standard |  |
| Lawyer | Mausoleum Return | 9 | 1 / 2 / 4 | standard |  |
| Lawyer | Order Cataclysm | 9 | 1 / 2 / 4 | standard |  |
| Marauder | Authority Theft | 9 | 1 / 2 / 4 | standard |  |
| Marauder | Error | 9 | 1 / 2 / 4 | standard |  |
| Marauder | Total Decryption | 9 | 1 / 2 / 4 | standard |  |
| Marauder | Worm Legion | 9 | 1 / 2 / 4 | standard |  |
| Monster | Embodiment of Fate | 9 | 1 / 2 / 4 | standard |  |
| Monster | Probability Dominion | 9 | 1 / 2 / 4 | standard |  |
| Monster | River Roaming | 9 | 1 / 2 / 4 | standard |  |
| Monster | Tunnel Effect | 9 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Digital Genesis Mandate | 9 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Doctrine of Hidden Instruction | 9 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Hermit Apotheosis | 9 | 2 / 4 / 6 | focused-premium |  |
| Mystery Pryer | Omniscient Revision | 9 | 1 / 2 / 4 | standard |  |
| Planter | Bountiful Earth | 9 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Planter | Genesis Transmutation | 9 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Planter | Mother's Authority | 9 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Planter | Universal Return | 9 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Prisoner | Binding Unity | 9 | 1 / 2 / 4 | standard |  |
| Prisoner | Deviant Dominion | 9 | 1 / 2 / 4 | standard |  |
| Prisoner | Symbolic Curse | 9 | 1 / 2 / 4 | standard |  |
| Prisoner | Temperance Sovereignty | 9 | 1 / 2 / 4 | standard |  |
| Reader | Concept Aperture | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Reader | Disaster Thesis | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Reader | Universal Non-Authority Imitation | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Reader | White Tower Omniscience | 9 | 4 / 8 / 12 | sovereign-premium | Normalized to sovereign-premium ladder. |
| Sailor | Heavenfall Tribunal | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Sailor | Sovereign of Tempest | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Sailor | Tyrant's Edict | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Sailor | World-Sea Dominion | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Savant | Civilization Refactoring | 9 | 2 / 4 / 8 | authority-premium |  |
| Savant | Law Refactoring | 9 | 2 / 4 / 8 | authority-premium |  |
| Savant | Reality Knowledge | 9 | 2 / 4 / 8 | authority-premium |  |
| Savant | Spirit World Mentor | 9 | 2 / 4 / 8 | authority-premium |  |
| Secrets Suppliant | Black Eucharist | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Secrets Suppliant | Degenerate Genesis | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Secrets Suppliant | Profane Proclamation | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Secrets Suppliant | Shadow Crucifixion | 9 | 4 / 8 / 12 | sovereign-premium |  |
| Seer | Blind Stupidity | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Seer | Fool Fate | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Seer | Fool Time | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Seer | Miracle Maze | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Sleepless | Concealment Authority | 9 | 2 / 4 / 8 | authority-premium | Sequence tag repaired. |
| Sleepless | Dark Side of the Universe | 9 | 2 / 4 / 8 | authority-premium | Sequence tag repaired. |
| Sleepless | Horror Sovereignty | 9 | 2 / 4 / 8 | authority-premium | Sequence tag repaired. |
| Sleepless | Misfortune and Catastrophe | 9 | 2 / 4 / 8 | authority-premium | Sequence tag repaired. |
| Spectator | Discernment Horizon | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Spectator | Dream Dominion | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Spectator | Envisioning Authority | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Spectator | Loss of Control | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Spectator | Psyche Rewrite | 9 | 6 / 12 / 18 | absolute-premium | Absolute-premium ladder retained. |
| Warrior | Decay Verdict | 9 | 1 / 2 / 4 | standard |  |
| Warrior | Land of Twilight | 9 | 1 / 2 / 4 | standard |  |
| Warrior | Proxy of War | 9 | 1 / 2 / 4 | standard |  |
| Warrior | Purifying End | 9 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live level-9 abilities now present `Baseline (9 Spirituality)` to match the actual system cost.
- Bard and Corpse Collector now use the shared absolute-premium `9 / +6 / +12 / +18` family instead of bespoke extreme surcharges.
- Seer and Spectator retain absolute-premium god-tier ladders once baseline drift is corrected.
- Reader and Assassin now sit on the sovereign-premium `9 / +4 / +8 / +12` family; Arbiter sits on the authority-premium `9 / +2 / +4 / +8` family; Planter sits on the focused-premium `9 / +2 / +4 / +6` family.
- All actual Sequence 0 level-9 items now carry `flags.lotm.grantedSequence = 0`.
