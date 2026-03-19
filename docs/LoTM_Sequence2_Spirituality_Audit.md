# LoTM Sequence 2 Spirituality Audit

This report audits live Sequence 2 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus sequence metadata on the actual level-7 ability set.

## Sequence 2 Cost Logic

- Base cast at Sequence 2 should be `7 Spirituality`; live level-7 abilities already derive that cost automatically from item level.
- Sequence 2 uses three valid pricing families based on impact and flexibility against the much larger runtime reserve pool:
- `+1 / +2 / +4` for bounded, narrower, or primarily tactical abilities.
- `+2 / +4 / +6` for strong flexible control, information, or multi-role premium abilities.
- `+2 / +4 / +8` for broad authority, sovereign forms, mass command, or scene-shaping effects.
- Sequence 2 reserve floors are large enough that a flat `+1 / +2 / +4` spine no longer makes every premium spend feel meaningful, so higher ladders are valid when the effect profile supports them.

## Findings

- Sequence 2 showed broad baseline text drift under the live level-7 cost; many abilities still advertised `0-6` spirituality baselines despite actual level-derived cost `7`.
- Bard was still massively over-surcharged, with baselines as high as `10-14` and ladders at `+5 / +10 / +15` or `+6 / +12 / +18`.
- Corpse Collector and Spectator were still authored on synthetic `+3 / +6 / +9` premium ladders that overshot the new Sequence 2 pricing families.
- Apprentice and Assassin each had internal ladder drift inside the same package, with some abilities landing between standard and premium families without a clear power justification.
- Actual level-7 Seer and Spectator abilities were missing `grantedSequence = 2`, and actual level-7 Sleepless abilities were still incorrectly tagged as Sequence 3. Those metadata errors were repaired.

## Live Sequence 2 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Creation Authority | 7 | 1 / 2 / 4 | standard |  |
| Apothecary | Moonlight Metamorphosis | 7 | 1 / 2 / 4 | standard |  |
| Apothecary | Sovereign Summoning Gates | 7 | 1 / 2 / 4 | standard |  |
| Apothecary | Spirituality Tide Dominion | 7 | 1 / 2 / 4 | standard |  |
| Apprentice | Coordinate Exile | 7 | 1 / 2 / 4 | standard | Normalized to standard ladder. |
| Apprentice | Domain Stitch | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Apprentice | Starfold Passage | 7 | 2 / 4 / 8 | authority-premium |  |
| Apprentice | Threshold Mandate | 7 | 1 / 2 / 4 | standard | Normalized to standard ladder. |
| Arbiter | Balanced Battlefield | 7 | 1 / 2 / 4 | standard |  |
| Arbiter | Counterweight Sentence | 7 | 1 / 2 / 4 | standard |  |
| Arbiter | Disorder Census | 7 | 1 / 2 / 4 | standard |  |
| Arbiter | Equilibrium Decree | 7 | 1 / 2 / 4 | standard |  |
| Assassin | Cataclysm Waltz | 7 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Assassin | Cursed Refrain | 7 | 2 / 4 / 6 | focused-premium |  |
| Assassin | Glacial Inferno | 7 | 1 / 2 / 4 | standard | Normalized to standard ladder. |
| Assassin | Mirror Ruin Court | 7 | 2 / 4 / 6 | focused-premium |  |
| Bard | Justice Trial | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Bard | Praise the Sun | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Bard | Solar Envoy | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Bard | Spear of Light | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Corpse Collector | Death Consul's Decree | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Corpse Collector | King of the Dead | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Corpse Collector | Nation of the Dead | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Corpse Collector | Soul Shepherding | 7 | 2 / 4 / 8 | authority-premium | Normalized to authority-premium ladder. |
| Criminal | Abyssal Dread Mandate | 7 | 2 / 4 / 8 | authority-premium |  |
| Criminal | Blood Sovereign | 7 | 2 / 4 / 8 | authority-premium |  |
| Criminal | Coagulated Rebirth | 7 | 2 / 4 / 8 | authority-premium |  |
| Criminal | Seed of Malice | 7 | 2 / 4 / 8 | authority-premium |  |
| Hunter | Cataclysm Front | 7 | 1 / 2 / 4 | standard |  |
| Hunter | Fog of War Ascendant | 7 | 1 / 2 / 4 | standard |  |
| Hunter | Meteoric Descent | 7 | 1 / 2 / 4 | standard |  |
| Hunter | Tempest Muster | 7 | 1 / 2 / 4 | standard |  |
| Lawyer | Airborne Exploit | 7 | 1 / 2 / 4 | standard |  |
| Lawyer | Authority Distortion | 7 | 1 / 2 / 4 | standard |  |
| Lawyer | Entropy Writ | 7 | 1 / 2 / 4 | standard |  |
| Lawyer | Extinction Verdict | 7 | 1 / 2 / 4 | standard |  |
| Marauder | Destiny Slip | 7 | 1 / 2 / 4 | standard |  |
| Marauder | Destiny Trojan | 7 | 1 / 2 / 4 | standard |  |
| Marauder | Loopholes | 7 | 1 / 2 / 4 | standard |  |
| Marauder | Sixfold Plunder | 7 | 1 / 2 / 4 | standard |  |
| Monster | Inevitable Node | 7 | 1 / 2 / 4 | standard |  |
| Monster | Revelation of Fate | 7 | 1 / 2 / 4 | standard |  |
| Monster | Spoken Prophecy | 7 | 1 / 2 / 4 | standard |  |
| Monster | Words of Fortune | 7 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Deletion Protocol | 7 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Information Torrent Manifestation | 7 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Revision Mandate | 7 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Sage Counterfate | 7 | 1 / 2 / 4 | standard |  |
| Planter | Cycle Incarnation | 7 | 1 / 2 / 4 | standard |  |
| Planter | Desolate Domain | 7 | 1 / 2 / 4 | standard |  |
| Planter | Gift of the Land | 7 | 1 / 2 / 4 | standard |  |
| Planter | Sovereign Broodcraft | 7 | 1 / 2 / 4 | standard |  |
| Prisoner | Bane Gaze | 7 | 1 / 2 / 4 | standard |  |
| Prisoner | Curse Vessel Domain | 7 | 1 / 2 / 4 | standard |  |
| Prisoner | Dwelling Space | 7 | 1 / 2 / 4 | standard |  |
| Prisoner | Spirit Siphon | 7 | 1 / 2 / 4 | standard |  |
| Reader | Epistemic Sovereignty | 7 | 2 / 4 / 6 | focused-premium |  |
| Reader | Flaw Deconstruction | 7 | 2 / 4 / 6 | focused-premium |  |
| Reader | Omniform Replication | 7 | 2 / 4 / 6 | focused-premium |  |
| Reader | Wisest Branch Selection | 7 | 2 / 4 / 6 | focused-premium |  |
| Sailor | Descent of Calamity | 7 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Magnetic Pole Pull | 7 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Sound of Horror | 7 | 2 / 4 / 8 | authority-premium |  |
| Sailor | Source of Wrath | 7 | 2 / 4 / 8 | authority-premium |  |
| Savant | Essence Analysis | 7 | 1 / 2 / 4 | standard |  |
| Savant | Law Parameter Shift | 7 | 2 / 4 / 8 | authority-premium |  |
| Savant | Manufacturing Authority | 7 | 2 / 4 / 8 | authority-premium |  |
| Savant | Mentor Protocol | 7 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Corrupted Dominion | 7 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Exile by Decree | 7 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Profane Eucharist | 7 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Profane Language | 7 | 1 / 2 / 4 | standard |  |
| Seer | Historical Reconstitution | 7 | 2 / 4 / 6 | focused-premium | Sequence tag repaired. |
| Seer | Miracle Script | 7 | 2 / 4 / 6 | focused-premium | Sequence tag repaired. |
| Seer | Thread Dominion | 7 | 2 / 4 / 6 | focused-premium | Sequence tag repaired. |
| Seer | Wish Reservoir | 7 | 2 / 4 / 6 | focused-premium | Sequence tag repaired. |
| Sleepless | Conceal Secrets | 7 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Concealed | 7 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Concealed World | 7 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Reverse Concealment | 7 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Spectator | Consciousness Trace | 7 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Spectator | Discernment | 7 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Spectator | Dream Maze | 7 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Spectator | Idealized Projection | 7 | 2 / 4 / 6 | focused-premium | Normalized to focused-premium ladder. |
| Warrior | Cage of Glory | 7 | 1 / 2 / 4 | standard |  |
| Warrior | Passage of Twilight | 7 | 1 / 2 / 4 | standard |  |
| Warrior | Purifying Devastation | 7 | 1 / 2 / 4 | standard |  |
| Warrior | Twilight Greatsword | 7 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live level-7 abilities now present `Baseline (7 Spirituality)` to match the actual system cost.
- Bard and Corpse Collector now sit on the shared authority-premium `7 / +2 / +4 / +8` family instead of bespoke extreme surcharges.
- Spectator now sits on the focused-premium `7 / +2 / +4 / +6` family rather than `+3 / +6 / +9`.
- Apprentice and Assassin near-miss ladders were normalized to the nearest consistent family instead of leaving ad hoc `+1 / +3 / +6`, `+1 / +3 / +5`, or `+2 / +4 / +7` progressions in place.
- All actual Sequence 2 level-7 items now carry `flags.lotm.grantedSequence = 2`.
