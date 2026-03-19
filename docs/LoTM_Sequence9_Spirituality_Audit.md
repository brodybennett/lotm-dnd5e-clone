# LoTM Sequence 9 Spirituality Audit

This report audits live Sequence 9 pathway abilities in `packs/lotm_abilities` and normalizes only spirituality pricing or supporting sequence metadata.

## Sequence 9 Cost Logic

- Base cast at Sequence 9 should remain `0 Spirituality`; it is the entry-sequence baseline and the live system already derives that from item level `0`.
- Standard Sequence 9 upcast ladder is `+1 / +2 / +4`.
- `+1` is for scope/range expansion or a light reliability/numerical bump.
- `+2` is for a second meaningful rider, ally-sharing, moderate action pressure, or a stronger tactical swing.
- `+4` is for sustained control, multi-target swing, repeatable scene leverage, or a clearly encounter-shaping upgrade.
- A compressed `+1 / +2 / +3` ladder is acceptable only for narrow non-damaging utility or information abilities whose top spend still does not create a full encounter swing.

## Findings

- `18` pathways were already on the standard `+1 / +2 / +4` ladder.
- `2` pathways, Apprentice and Spectator, were on a justified compressed utility ladder; these were retained.
- `1` pathway, Bard, was materially overpriced at `+2 / +4 / +6` despite effects comparable to other Sequence 9 support and tempo abilities. Both Bard abilities were normalized to `+1 / +2 / +4`.
- `2` pathways, Seer and Spectator, had live Sequence 9 abilities missing `flags.lotm.grantedSequence = 9`. Those tags were repaired so later sequence-grouped audits can include them cleanly.

## Live Sequence 9 Table

| Pathway | Ability | Base | Upcast Ladder | Ladder Type | Notes |
|---|---|---:|---|---|---|
| Apothecary | Moonlit Distillation | 0 | 1 / 2 / 4 | standard |  |
| Apothecary | Vital Herb Sight | 0 | 1 / 2 / 4 | standard |  |
| Apprentice | Hidden Vector | 0 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Apprentice | Oblique Entry | 0 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Arbiter | Authority Bearing | 0 | 1 / 2 / 4 | standard |  |
| Arbiter | Preliminary Verdict | 0 | 1 / 2 / 4 | standard |  |
| Assassin | Barbed Whisper | 0 | 1 / 2 / 4 | standard |  |
| Assassin | Predator's Footwork | 0 | 1 / 2 / 4 | standard |  |
| Bard | Radiant Footwork | 0 | 1 / 2 / 4 | standard | Normalized to standard ladder. |
| Bard | Sunrise Chorus | 0 | 1 / 2 / 4 | standard | Normalized to standard ladder. |
| Corpse Collector | Spirit Vision | 0 | 1 / 2 / 4 | standard |  |
| Corpse Collector | Undead Physique | 0 | 1 / 2 / 4 | standard |  |
| Criminal | Criminal Proficiency | 0 | 1 / 2 / 4 | standard |  |
| Criminal | Predatory Physique | 0 | 1 / 2 / 4 | standard |  |
| Hunter | Killzone Instinct | 0 | 1 / 2 / 4 | standard |  |
| Hunter | Scorchline Trapcraft | 0 | 1 / 2 / 4 | standard |  |
| Lawyer | Law Proficiency | 0 | 1 / 2 / 4 | standard |  |
| Lawyer | Order Citation | 0 | 1 / 2 / 4 | standard |  |
| Marauder | Superior Observation | 0 | 1 / 2 / 4 | standard |  |
| Marauder | Theft | 0 | 1 / 2 / 4 | standard |  |
| Monster | Calamity Instinct | 0 | 1 / 2 / 4 | standard |  |
| Monster | Fickle Coin | 0 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Eyes of Mystery Prying | 0 | 1 / 2 / 4 | standard |  |
| Mystery Pryer | Quick Rituals | 0 | 1 / 2 / 4 | standard |  |
| Planter | Cultivator's Hands | 0 | 1 / 2 / 4 | standard |  |
| Planter | Season Reading | 0 | 1 / 2 / 4 | standard |  |
| Prisoner | Contained Burst | 0 | 1 / 2 / 4 | standard |  |
| Prisoner | Shacklecraft | 0 | 1 / 2 / 4 | standard |  |
| Reader | Close Reading | 0 | 1 / 2 / 4 | standard |  |
| Reader | Indexed Safeguard | 0 | 1 / 2 / 4 | standard |  |
| Sailor | Phantom Scales | 0 | 1 / 2 / 4 | standard |  |
| Sailor | Riptide Command | 0 | 1 / 2 / 4 | standard |  |
| Savant | Mechanics Comprehension | 0 | 1 / 2 / 4 | standard |  |
| Savant | Precision Recall | 0 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Litany of Hidden Tongues | 0 | 1 / 2 / 4 | standard |  |
| Secrets Suppliant | Penitent Veil | 0 | 1 / 2 / 4 | standard |  |
| Seer | Omen Thread | 0 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Seer | Spirit Veil Sight | 0 | 1 / 2 / 4 | standard | Sequence tag repaired. |
| Sleepless | Dream Residue Reading | 0 | 1 / 2 / 4 | standard |  |
| Sleepless | Nocturnality | 0 | 1 / 2 / 4 | standard |  |
| Spectator | Body Language Analysis | 0 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Spectator | Detached Mind | 0 | 1 / 2 / 3 | compressed | Compressed utility ladder retained. |
| Warrior | Combat Mastery | 0 | 1 / 2 / 4 | standard |  |
| Warrior | Physical Enhancement | 0 | 1 / 2 / 4 | standard |  |

## Applied Changes


## Normalization Notes

- Bard now pays standard Sequence 9 prices for early-party support instead of Sequence 7-6 style surcharges.
- Apprentice retains cheaper top-end spends because both abilities stay narrow, positional, and non-damaging even at maximum upcast.
- Spectator retains cheaper top-end spends because its Sequence 9 reads remain bounded by uncertainty, target readability, and low direct combat swing.
