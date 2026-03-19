# LoTM Spirituality Reserve Alignment

This report checks spirituality cost normalization against the implemented runtime max spirituality formula, not only against shifted base reserve values.

Runtime formula confirmed in `dnd5e.mjs`:

```text
spiritualityMax = spiritualityBase + spiritAbility.mod * (2 + tier)
```

Where:

- `spiritualityBase` comes from the shared sequence budget plus pathway resource shift.
- `spiritAbility` comes from each pathway's scaling profile in `pathway-scaling.mjs`.
- Tier bands are `9-7`, `6-5`, `4-3`, `2-1`, `0`, which produce spirit scales `2`, `3`, `4`, `5`, `6`.

## Affordability Rule

- Baseline cost should remain cheap enough that the lowest-reserve pathway at that sequence can use the new-sequence ability repeatedly without collapsing its reserve economy.
- Standard top spend should feel premium, but the lowest-reserve pathway should still be able to afford at least one use and usually two or more from full reserve.
- Compressed ladders are reserved for bounded utility, support, or information effects and are evaluated against the same reserve floor.
- Sequence normalization should therefore be checked against the lowest runtime max spirituality at that sequence, not the average or the highest-reserve pathway.

## Sequence Reserve Pressure

| Sequence | Base Cost | Standard Top Cost | Lowest Runtime SPI Max | Highest Runtime SPI Max | Base Cost Share of Low Max | Standard Top Share of Low Max | Base Casts from Low Max | Top Casts from Low Max | Status |
|---|---:|---:|---|---|---:|---:|---:|---:|---|
| 9 | 0 | 4 | Criminal (7) | Apprentice (9) | 0.0% | 57.1% | N/A | 1.75 | Normalized and validated |
| 8 | 1 | 5 | Criminal (10) | Apothecary (12) | 10.0% | 50.0% | 10 | 2 | Normalized and validated |
| 7 | 2 | 6 | Warrior (21) | Apothecary (27) | 9.5% | 28.6% | 10.50 | 3.50 | Normalized and validated |
| 6 | 3 | 7 | Warrior (30) | Apprentice (39) | 10.0% | 23.3% | 10 | 4.29 | Normalized and validated |
| 5 | 4 | 8 | Warrior (42) | Spectator (54) | 9.5% | 19.0% | 10.50 | 5.25 | Normalized and validated |
| 4 | 5 | 9 | Criminal (77) | Spectator (93) | 6.5% | 11.7% | 15.40 | 8.56 | Pending full audit |
| 3 | 6 | 10 | Criminal (95) | Spectator (115) | 6.3% | 10.5% | 15.83 | 9.50 | Pending full audit |
| 2 | 7 | 11 | Warrior (151) | Spectator (170) | 4.6% | 7.3% | 21.57 | 13.73 | Pending full audit |
| 1 | 8 | 12 | Corpse Collector (224) | Spectator (247) | 3.6% | 5.4% | 28 | 18.67 | Pending full audit |
| 0 | 9 | 13 | Planter (329) | Sailor (376) | 2.7% | 4.0% | 36.56 | 25.31 | Pending full audit |

## Audited Low-Sequence Validation

These are the sequences already normalized in live data during the current pass.

| Sequence | Base Cost | Standard Top Cost | Lowest Runtime SPI Max | Base Share | Top Share | Base Casts | Top Casts |
|---|---:|---:|---:|---:|---:|---:|---:|
| 9 | 0 | 4 | 7 | 0.0% | 57.1% | N/A | 1.75 |
| 8 | 1 | 5 | 10 | 10.0% | 50.0% | 10 | 2 |
| 7 | 2 | 6 | 21 | 9.5% | 28.6% | 10.50 | 3.50 |
| 6 | 3 | 7 | 30 | 10.0% | 23.3% | 10 | 4.29 |
| 5 | 4 | 8 | 42 | 9.5% | 19.0% | 10.50 | 5.25 |

Validation notes:

- Sequence 9 baseline `0` consumes `0.0%` of the lowest runtime reserve (`7`), while standard top spend `4` consumes `57.1%`.
- Sequence 8 baseline `1` consumes `10.0%` of the lowest runtime reserve (`10`), while standard top spend `5` consumes `50.0%`.
- Sequence 7 baseline `2` consumes `9.5%` of the lowest runtime reserve (`21`), while standard top spend `6` consumes `28.6%`.
- Sequence 6 baseline `3` consumes `10.0%` of the lowest runtime reserve (`30`), while standard top spend `7` consumes `23.3%`.
- Sequence 5 baseline `4` consumes `9.5%` of the lowest runtime reserve (`42`), while standard top spend `8` consumes `19.0%`.
- The current normalized Sequence `9-5` spine therefore stays in line with runtime max spirituality and does not need additional reserve-driven repricing.

## Highest Reserve Snapshots

| Sequence | Rank | Pathway | Shifted SPI Base | Spirit Anchor Score | Spirit Scale | Runtime SPI Max |
|---|---|---|---:|---|---:|---:|
| 7 | Highest | Apothecary | 25 | WIS 12 (+1) | 2 | 27 |
| 7 | Top 2 | Spectator | 27 | INT 11 (+0) | 2 | 27 |
| 7 | Top 3 | Apprentice | 26 | INT 11 (+0) | 2 | 26 |
| 5 | Highest | Spectator | 51 | INT 13 (+1) | 3 | 54 |
| 5 | Top 2 | Apprentice | 50 | INT 12 (+1) | 3 | 53 |
| 5 | Top 3 | Secrets Suppliant | 50 | INT 12 (+1) | 3 | 53 |
| 2 | Highest | Spectator | 155 | INT 16 (+3) | 5 | 170 |
| 2 | Top 2 | Apprentice | 155 | INT 14 (+2) | 5 | 165 |
| 2 | Top 3 | Sailor | 155 | CHA 14 (+2) | 5 | 165 |
| 0 | Highest | Sailor | 364 | CHA 15 (+2) | 6 | 376 |
| 0 | Top 2 | Mystery Pryer | 350 | INT 15 (+2) | 6 | 362 |
| 0 | Top 3 | Savant | 350 | INT 15 (+2) | 6 | 362 |

## Design Conclusion

- Use the live spell-level baseline cost as the default sequence spine: Sequence `9 -> 0`, `8 -> 1`, `7 -> 2`, `6 -> 3`, `5 -> 4`, `4 -> 5`, `3 -> 6`, `2 -> 7`, `1 -> 8`, `0 -> 9`.
- Keep the standard `+1 / +2 / +4` ladder as the default premium structure unless the ability is explicitly bounded enough to justify a compressed `+1 / +2 / +3` ladder.
- Judge affordability against the lowest runtime max spirituality at that sequence. If a future sequence pass produces a top spend that pushes well beyond roughly half of the lowest reserve without encounter-shaping payoff, it should be repriced downward or its effect narrowed.
- Conversely, if a supposedly premium spend becomes trivial relative to reserve and no longer feels like a meaningful escalation, it should gain scope or pay a steeper surcharge.
