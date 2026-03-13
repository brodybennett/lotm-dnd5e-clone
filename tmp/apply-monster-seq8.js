const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
    duplicateSource: existing?.duplicateSource ?? null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: existing?.exportSource ?? null
  };
}

function buildActivity({ id, activationType, durationUnits, targetUnits = 'ft' }) {
  return {
    type: 'utility',
    _id: id,
    sort: 0,
    activation: {
      type: activationType,
      value: null,
      override: false
    },
    consumption: {
      scaling: {
        allowed: false
      },
      spellSlot: true,
      targets: []
    },
    description: {
      chatFlavor: ''
    },
    duration: {
      units: durationUnits,
      concentration: false,
      override: false
    },
    effects: [],
    range: {
      override: false
    },
    target: {
      template: {
        contiguous: false,
        units: targetUnits
      },
      affects: {
        choice: false
      },
      override: false,
      prompt: true
    },
    uses: {
      spent: 0,
      recovery: [],
      max: ''
    },
    roll: {
      prompt: false,
      visible: false,
      name: '',
      formula: ''
    },
    name: '',
    img: '',
    appliedEffects: []
  };
}

async function getOptionalJson(db, key) {
  try {
    const raw = await db.get(key);
    if (raw === undefined || raw === null || raw === '') return null;
    return JSON.parse(raw);
  } catch (err) {
    if (err?.code === 'LEVEL_NOT_FOUND') return null;
    throw err;
  }
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const pathwayKey = '!items!lotmPathway00016';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Monster pathway (lotmPathway00016) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> whimsical fate-walking through lucky accidents, uncanny danger sense, and sudden reversals that resist rigid planning.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Calamity Instinct, Fickle Coin.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Weighted Outcome, Fortune Drift, plus one legacy scope upgrade to Fickle Coin.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Robot), Monster evolves from raw omen reflexes into semi-deliberate probability routing: outcomes are still fickle, but reversals can be nudged toward tactical intent.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!FCnegTZeThIPZUlC';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Monster folder (FCnegTZeThIPZUlC) not found.');

    folder.description = 'Sequence abilities for the Monster pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-monster',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = '!items!lotmAbilityO9002';
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityO9002 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, Fickle Coin can chain linked luck. ' +
      'When you cast Fickle Coin with at least <strong>+1 Spirituality</strong>, choose one secondary creature within 15 feet of the primary target. ' +
      'Apply the same rolled coin face to the secondary target. ' +
      'Once per short rest, you may apply this chain rider without paying the +1 surcharge.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityO8001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityO8002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityO8001',
        name: 'Weighted Outcome',
        type: 'spell',
        img: 'icons/sundries/gaming/dice-pair-white-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 60 feet. It makes a Wisdom save. On a failure, choose <strong>Boon Tilt</strong> or <strong>Bane Tilt</strong>. Until the start of your next turn, the first d20 test that creature makes gains a fate die rider.</p><ul><li><strong>Boon Tilt:</strong> roll 1d6. On 1-2, apply <strong>-1d4</strong>; on 3-6, apply <strong>+1d4</strong>.</li><li><strong>Bane Tilt:</strong> roll 1d6. On 1-4, apply <strong>-1d4</strong>; on 5-6, apply <strong>+1d4</strong>.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Replace the 1d4 modifier with <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; the target repeats the save at the end of each of its turns, ending the effect on a success. While active, the rider applies to the first d20 test it makes each round.</li><li><strong>+4 Spirituality:</strong> Affect one additional creature in range with separate save and independent tilt choice.</li></ul><p><em>Counterplay:</em> luck-sealing wards, immunity to mental influence, and effects that avoid d20 tests can blunt this ability.</p><p><em>Corruption Hook:</em> if you repeatedly gamble allies into bad odds for amusement, gain 1 Corruption.</p>',
            chat: ''
          },
          source: {
            custom: '',
            rules: '2024',
            revision: 1,
            license: '',
            book: 'LoTM Core'
          },
          activation: {
            type: 'action',
            condition: '',
            value: null
          },
          duration: {
            value: '',
            units: 'inst'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'creature',
              special: ''
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '60',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 1,
          school: 'enc',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a marked coin split with two colors',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            monsterSeq8Act001: buildActivity({
              id: 'monsterSeq8Act001',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-monster-weighted-outcome',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-monster'
        },
        effects: [],
        folder: 'FCnegTZeThIPZUlC',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 3, existingAbility1?._stats),
        sort: 2200100,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityO8002',
        name: 'Fortune Drift',
        type: 'spell',
        img: 'icons/magic/air/wind-swirl-gray-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, at the start of each of your turns roll 1d4 to determine your movement skew:</p><ul><li><strong>1 - Stutter:</strong> speed reduced by 5 feet this turn, but gain <strong>+1d4</strong> on your first Dexterity saving throw this turn.</li><li><strong>2-3 - Drift:</strong> speed increased by 5 feet this turn.</li><li><strong>4 - Slipstream:</strong> speed increased by 10 feet this turn, and your first movement this turn ignores opportunity attacks.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> roll 2d4 and choose which result to use each turn.</li><li><strong>+2 Spirituality:</strong> choose one ally within 30 feet when cast; that ally gains the same rolled movement result each turn while it remains within 30 feet of you.</li><li><strong>+4 Spirituality:</strong> once per round, when you roll a 1 you may treat it as a 2, and whenever you roll a 4 your first attack before end of turn gains <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> restrained/grappled conditions, movement denial fields, and forced repositioning can override drift gains.</p><p><em>Corruption Hook:</em> if you deliberately drag companions into danger because fate "will probably save them," gain 1 Corruption.</p>',
            chat: ''
          },
          source: {
            custom: '',
            rules: '2024',
            revision: 1,
            license: '',
            book: 'LoTM Core'
          },
          activation: {
            type: 'bonus',
            condition: '',
            value: null
          },
          duration: {
            value: '1',
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'self',
              special: ''
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'self',
            value: null,
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 1,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a loop of tangled thread',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            monsterSeq8Act002: buildActivity({
              id: 'monsterSeq8Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-monster-fortune-drift',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-monster'
        },
        effects: [],
        folder: 'FCnegTZeThIPZUlC',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 4, existingAbility2?._stats),
        sort: 2200101,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    const verifyLegacy = await getOptionalJson(abilitiesDb, legacyKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityO8001');
    const verifyAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityO8002');
    const legacyApplied = String(verifyLegacy?.system?.description?.value ?? '').includes(legacyHeader);

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      legacyUpdated: legacyKey,
      legacyApplied,
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      grantedSequenceMapping: [
        {
          id: verifyAbility1?._id,
          grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence ?? null,
          systemLevel: verifyAbility1?.system?.level ?? null,
          sourceClass: verifyAbility1?.system?.sourceClass ?? null,
          identifier: verifyAbility1?.system?.identifier ?? null
        },
        {
          id: verifyAbility2?._id,
          grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence ?? null,
          systemLevel: verifyAbility2?.system?.level ?? null,
          sourceClass: verifyAbility2?.system?.sourceClass ?? null,
          identifier: verifyAbility2?.system?.identifier ?? null
        }
      ]
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();