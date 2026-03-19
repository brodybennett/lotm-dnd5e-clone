# LoTM Sequence 3 Spirituality Audit

This report audits live Sequence 3 pathway abilities in `packs/lotm_abilities` and normalizes spirituality pricing text plus missing sequence metadata.

## Sequence 3 Cost Logic

- Base cast at Sequence 3 should be `6 Spirituality`; live level-6 abilities already derive that cost automatically from item level.
- Standard Sequence 3 upcast ladder is `+1 / +2 / +4` above the base cost.
- `+1` is for the first meaningful increase in scope, rider value, target count, or tactical reliability.
- `+2` is for major sustained pressure, stronger control, or a second substantial rider.
- `+4` is for clear saint-tier escalation, layered authority, or an encounter-shaping end-state.
- Sequence 3 reserve pressure is extremely forgiving relative to runtime max spirituality, so normalization here is primarily about internal logic and cross-pathway fairness.

## Findings

- Sequence 3 again showed major authored-text drift under the live level-based cost; most abilities were still labelled between `0` and `5` even though the real baseline is already `6`.
- Bard remained over-surcharged across the full package, including one `+4 / +8 / +12` ladder and two `+3 / +6 / +9` ladders.
- Corpse Collector and Spectator were still using a synthetic `0 + 2 / 4 / 6` economy that no longer matches the actual Sequence 3 reserve band.
- Sailor, Reader, and Seer each had premium `+2 / +4 / +6` ladders on abilities whose effect profile fits the shared saint-tier pricing spine.
- Seer and Spectator Sequence 3 abilities were missing `flags.lotm.grantedSequence = 3`; those tags were repaired.
- This pass scopes actual level-6 items only, because unrelated Sleepless legacy records are currently carrying stale `grantedSequence = 3` metadata despite belonging to higher item levels.

## Live Sequence 3 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Bat Wing Isolation | 6 | 1 / 2 / 4 | standard |  |
| Apothecary | Contract of the Crimson Court | 6 | 1 / 2 / 4 | standard |  |
| Apothecary | Crimson Full Moon Rite | 6 | 1 / 2 / 4 | standard |  |
| Apothecary | Door of Summoning | 6 | 1 / 2 / 4 | standard |  |
| Apprentice | Concealed Annex | 6 | 1 / 2 / 4 | standard |  |
| Apprentice | Space Integration | 6 | 1 / 2 / 4 | standard |  |
| Apprentice | Space Tearing | 6 | 1 / 2 / 4 | standard |  |
| Apprentice | Wandering | 6 | 1 / 2 / 4 | standard |  |
| Arbiter | Anomaly Quell | 6 | 1 / 2 / 4 | standard |  |
| Arbiter | Disorder Pursuit | 6 | 1 / 2 / 4 | standard |  |
| Arbiter | Metropolitan Partition | 6 | 1 / 2 / 4 | standard |  |
| Arbiter | Sword of Judgment | 6 | 1 / 2 / 4 | standard |  |
| Assassin | Mirror Persona | 6 | 1 / 2 / 4 | standard |  |
| Assassin | Predatory Rebirth | 6 | 1 / 2 / 4 | standard |  |
| Assassin | Stoneheart Enticement | 6 | 1 / 2 / 4 | standard |  |
| Assassin | Withering Promise | 6 | 1 / 2 / 4 | standard |  |
| Bard | Holy Contract | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Bard | Holy Equipment | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Bard | Judgment of Justice | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Bard | Justice Halo | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Corpse Collector | Death Gaze | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Corpse Collector | Ferryman | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Corpse Collector | Hands of Life and Death | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Corpse Collector | Styx Afloat | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Criminal | Corruption Cant | 6 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Distant Blather | 6 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Mind-Spirit Hex | 6 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Criminal | Prayer Interception | 6 | 1 / 2 / 4 / 6 | standard+extra | Explicit fourth escalation retained. |
| Hunter | Chain of Command | 6 | 1 / 2 / 4 | standard |  |
| Hunter | Fogfront Dominion | 6 | 1 / 2 / 4 | standard |  |
| Hunter | Provocation Decree | 6 | 1 / 2 / 4 | standard |  |
| Hunter | Siegefire Homily | 6 | 1 / 2 / 4 | standard |  |
| Lawyer | Distorted Advance | 6 | 1 / 2 / 4 | standard |  |
| Lawyer | Frenzied Fluctuation | 6 | 1 / 2 / 4 | standard |  |
| Lawyer | Strata Overrule | 6 | 1 / 2 / 4 | standard |  |
| Lawyer | Superior Mandate | 6 | 1 / 2 / 4 | standard |  |
| Marauder | Avatar Conspiracy | 6 | 1 / 2 / 4 | standard |  |
| Marauder | Deceit | 6 | 1 / 2 / 4 | standard |  |
| Marauder | Rule Skew | 6 | 1 / 2 / 4 | standard |  |
| Marauder | Triple Theft | 6 | 1 / 2 / 4 | standard |  |
| Monster | Keeper of Chaos | 6 | 1 / 2 / 4 | standard |  |
| Monster | Prayer Resonance | 6 | 1 / 2 / 4 | standard |  |
| Monster | Predestination Fracture | 6 | 1 / 2 / 4 | standard |  |
| Monster | Spiritual Baptism | 6 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Clairvoyant Branch | 6 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Fate Cross-Section | 6 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Prayer Echo | 6 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Re-enactment Ascendance | 6 | 1 / 2 / 4 | standard |  |
| Planter | Evil Spirit Transformation | 6 | 1 / 2 / 4 | standard |  |
| Planter | Life Deprivation | 6 | 1 / 2 / 4 | standard |  |
| Planter | Maternal Embrace | 6 | 1 / 2 / 4 | standard |  |
| Planter | Return to Earth | 6 | 1 / 2 / 4 | standard |  |
| Prisoner | Cursed Artifact Possession | 6 | 1 / 2 / 4 | standard |  |
| Prisoner | Silent Curse Brewing | 6 | 1 / 2 / 4 | standard |  |
| Prisoner | Transfiguration Curse | 6 | 1 / 2 / 4 | standard |  |
| Reader | Axiom Delineation | 6 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Reader | Clause Nullification | 6 | 1 / 2 / 4 | standard |  |
| Reader | Cognition Matrix | 6 | 1 / 2 / 4 | standard |  |
| Reader | Proofreading Mandate | 6 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Sailor | Abyssal Tide Warrant | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Sailor | Sea King's Territory | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Sailor | Storm Regalia | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Sailor | Thunderclap Mandate | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Savant | Absorption | 6 | 1 / 2 / 4 | standard |  |
| Savant | Dissociation | 6 | 1 / 2 / 4 | standard |  |
| Savant | Environment Controller | 6 | 1 / 2 / 4 | standard |  |
| Savant | Knowledge Spirit | 6 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Blasphemy | 6 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Inverted Covenant | 6 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Profane Tribunal | 6 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Trinity Seal | 6 | 1 / 2 / 4 | standard |  |
| Seer | Historical Borrowing | 6 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Seer | Historical Projection | 6 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Seer | Historical Void Hiding | 6 | 1 / 2 / 4 | standard | Targeted repricing to remove surcharge. |
| Sleepless | Horror Aura | 6 | 1 / 2 / 4 | standard |  |
| Sleepless | Nightmare World | 6 | 1 / 2 / 4 | standard |  |
| Sleepless | Sword of Darkness | 6 | 1 / 2 / 4 | standard |  |
| Spectator | Dream Weaving | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Spectator | Enhanced Mental Attributes | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Spectator | Plague Storm | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Spectator | Virtual Persona | 6 | 1 / 2 / 4 | standard | Normalized to shared Sequence 3 spine. |
| Warrior | Hurricane of Light | 6 | 1 / 2 / 4 | standard |  |
| Warrior | Light Concealment | 6 | 1 / 2 / 4 | standard |  |
| Warrior | Mercury Liquefaction | 6 | 1 / 2 / 4 | standard |  |
| Warrior | Silver Rapier | 6 | 1 / 2 / 4 | standard |  |

## Normalization Summary

- All live Sequence 3 abilities now present `Baseline (6 Spirituality)` to match the actual level-based system cost.
- Bard, Corpse Collector, Sailor, and Spectator now follow the shared Sequence 3 `6 / +1 / +2 / +4` spine.
- Reader's `Axiom Delineation` and `Proofreading Mandate`, plus Seer's historical suite, were normalized to remove bespoke surcharge ladders.
- Explicit four-step ladders on Criminal remain intact where they represent an added premium escalation rather than a replacement for the standard three-step structure.
