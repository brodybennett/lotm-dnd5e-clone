# LoTM Sequence 4 Spirituality Audit

This report audits live Sequence 4 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus missing sequence metadata.

## Sequence 4 Cost Logic

- Base cast at Sequence 4 should be `5 Spirituality`; live level-5 abilities already derive that cost automatically from item level.
- Standard Sequence 4 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for the first meaningful expansion in area, target count, rider strength, or tactical reliability.
- `+2` is for major control, sustained value, or a second large rider.
- `+4` is for clear encounter-shaping escalation, domain authority, or a qualitatively stronger end-state.
- Sequence 4 reserve pressure is light relative to max spirituality, so fairness here is driven more by cross-pathway consistency than by raw affordability.

## Findings

- Sequence 4 showed the broadest authored-text drift so far. Many abilities still advertised `0-4` spirituality baselines even though the live system already charges `5` from item level.
- Bard remained heavily over-surcharged across the full package, with baseline text as high as `8-10` and ladders at `+3 / +6 / +9` or `+4 / +8 / +12`.
- Corpse Collector and Spectator were still authored on a synthetic `0 + 2 / 4 / 6` spine despite Sequence 4 now living on the level-5 economy.
- Sailor's major authority tools, Reader's `Grand Synthesis Rite`, and Seer's `Bizarro Tableau` were also carrying unnecessary `+2 / +4 / +6` premiums relative to comparable Sequence 4 control tools.
- Seer and Spectator Sequence 4 abilities were missing `flags.lotm.grantedSequence = 4`; those tags were repaired for future grouped audits.
- Explicit four-step ladders were retained where they represent a genuine additional escalation tier rather than a surcharge replacing the standard three-step spine.

## Live Sequence 4 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Bat Swarm Transformation | 5 | 1 / 2 / 4 | standard |  |
| Apothecary | Gaze of Darkness | 5 | 1 / 2 / 4 | standard |  |
| Apothecary | Moon Paper Figurine | 5 | 1 / 2 / 4 | standard |  |
| Apothecary | Spirituality Manipulation | 5 | 1 / 2 / 4 | standard |  |
| Apprentice | Boundary Observatory | 5 | 1 / 2 / 4 | standard |  |
| Apprentice | Far Step Gate | 5 | 1 / 2 / 4 | standard |  |
| Apprentice | Folded Detour | 5 | 1 / 2 / 4 | standard |  |
| Apprentice | Transit Reversal | 5 | 1 / 2 / 4 | standard |  |
| Arbiter | Boundary Edict | 5 | 1 / 2 / 4 | standard |  |
| Arbiter | Imperative Law | 5 | 1 / 2 / 4 | standard |  |
| Arbiter | Mandate Convergence | 5 | 1 / 2 / 4 | standard |  |
| Arbiter | Overruling Verdict | 5 | 1 / 2 / 4 | standard |  |
| Assassin | Despair Chorus | 5 | 1 / 2 / 4 | standard |  |
| Assassin | Mirror Procession | 5 | 1 / 2 / 4 | standard |  |
| Assassin | Petrifying Tresses | 5 | 1 / 2 / 4 | standard |  |
| Assassin | Sapping Plague | 5 | 1 / 2 / 4 | standard |  |
| Bard | Flaring Sun | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Bard | Holy Eye | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Bard | Purification | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Bard | Unshadowed Domain | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Corpse Collector | Reincarnation | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Corpse Collector | Sealing Edict | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Corpse Collector | Spirit World Traversal | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Corpse Collector | Underworld Authority | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Criminal | Demon of the Body | 5 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Demon of the Mind | 5 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Filthy Language | 5 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Hellfire Projection | 5 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Hunter | Augmented Armament | 5 | 1 / 2 / 4 | standard |  |
| Hunter | Calamity Giant Form | 5 | 1 / 2 / 4 | standard |  |
| Hunter | Galvanized Body | 5 | 1 / 2 / 4 | standard |  |
| Hunter | Iron-Blooded Courage | 5 | 1 / 2 / 4 | standard |  |
| Lawyer | Bestowment Sentence | 5 | 1 / 2 / 4 | standard |  |
| Lawyer | Exploit Clause | 5 | 1 / 2 / 4 | standard |  |
| Lawyer | Magnify Decree | 5 | 1 / 2 / 4 | standard |  |
| Lawyer | Sovereign Disorder | 5 | 1 / 2 / 4 | standard |  |
| Marauder | Function Theft | 5 | 1 / 2 / 4 | standard |  |
| Marauder | Host Override | 5 | 1 / 2 / 4 | standard |  |
| Marauder | Life Theft | 5 | 1 / 2 / 4 | standard |  |
| Marauder | Parasitism | 5 | 1 / 2 / 4 | standard |  |
| Monster | Absolute Foresight | 5 | 1 / 2 / 4 | standard |  |
| Monster | Group Blessing | 5 | 1 / 2 / 4 | standard |  |
| Monster | Mercury Body | 5 | 1 / 2 / 4 | standard |  |
| Monster | Misfortune Field | 5 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Knowledge Storm Form | 5 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Mystical Re-enactment | 5 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Planted Prying Eye | 5 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Star Pillar | 5 | 1 / 2 / 4 | standard |  |
| Planter | Artificial Life Creation | 5 | 1 / 2 / 4 | standard |  |
| Planter | Creature Commanding | 5 | 1 / 2 / 4 | standard |  |
| Planter | Life Aura | 5 | 1 / 2 / 4 | standard |  |
| Planter | Mutation | 5 | 1 / 2 / 4 | standard |  |
| Prisoner | Marionette Grip | 5 | 1 / 2 / 4 | standard |  |
| Prisoner | Poltergeist | 5 | 1 / 2 / 4 | standard |  |
| Prisoner | Source of Curses | 5 | 1 / 2 / 4 | standard |  |
| Prisoner | Sympathetic Effigy | 5 | 1 / 2 / 4 | standard |  |
| Reader | Causal Annotation Field | 5 | 1 / 2 / 4 | standard |  |
| Reader | Grand Synthesis Rite | 5 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Reader | Probabilistic Foresight | 5 | 1 / 2 / 4 | standard |  |
| Reader | Theorem Reversal | 5 | 1 / 2 / 4 | standard |  |
| Sailor | Cataclysmic Roar | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Sailor | Hurricane Dominion | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Sailor | Thunder Chain Edict | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Sailor | Tsunami Judgment | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Savant | Alchemy | 5 | 1 / 2 / 4 | standard |  |
| Savant | Mechanical Body Retrofit | 5 | 1 / 2 / 4 | standard |  |
| Savant | Rapid Fabrication | 5 | 1 / 2 / 4 | standard |  |
| Savant | Soul Infusion | 5 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Black Armor | 5 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Cull of Spiritual Flesh | 5 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Depravity Flock | 5 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Shadow Enclosure | 5 | 1 / 2 / 4 | standard |  |
| Seer | Bizarro Tableau | 5 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Seer | Kaleidoscopic Divination | 5 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Marionette Interchange | 5 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Worm Bestowal | 5 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Concealment | 5 | 1 / 2 / 4 | standard |  |
| Sleepless | Curse of Misfortune | 5 | 1 / 2 / 4 | standard |  |
| Sleepless | Hair Entanglement | 5 | 1 / 2 / 4 | standard |  |
| Sleepless | Night Domain | 5 | 1 / 2 / 4 | standard |  |
| Spectator | Consciousness Stroll | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Spectator | Manipulation | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Spectator | Mental Plague | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Spectator | Mind Dragon Breath | 5 | 1 / 2 / 4 | standard | Normalized to shared Sequence 4 spine. |
| Warrior | Eye of Demon Hunting | 5 | 1 / 2 / 4 | standard |  |
| Warrior | Incomplete Mythical Creature Form | 5 | 1 / 2 / 4 | standard |  |
| Warrior | Mind Concealment | 5 | 1 / 2 / 4 | standard |  |
| Warrior | Weapon Ointment Mastery | 5 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 4 abilities now present `Baseline (5 Spirituality)` to match the actual level-based system cost.
- Bard, Corpse Collector, Sailor, and Spectator now follow the shared Sequence 4 `5 / +1 / +2 / +4` spine.
- Reader's `Grand Synthesis Rite` and Seer's `Bizarro Tableau` were normalized to remove bespoke surcharge pricing.
- Extended four-step ladders on explicit escalation abilities were left intact when they add an extra premium tier instead of replacing the standard one.
