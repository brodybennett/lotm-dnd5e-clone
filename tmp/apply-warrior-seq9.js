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

function buildActivity({
  id,
  activationType,
  durationUnits,
  rangeUnits
}) {
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
        units: rangeUnits
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
    const pathwayId = 'lotmPathway00011';
    const pathwayKey = `!items!${pathwayId}`;
    const existingPathway = await getOptionalJson(pathwaysDb, pathwayKey);

    const pathwayDoc = {
      _id: pathwayId,
      name: 'Warrior',
      type: 'class',
      img: 'icons/skills/melee/shield-block-bash-blue.webp',
      system: {
        description: {
          value: '<p><strong>Pathway Vector:</strong> stoic frontline command through trained violence, iron resolve, and twilight-forged endurance.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Combat Mastery, Physical Enhancement.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Warrior) establishes disciplined close-quarters dominance and refusal to break under pressure, with growth aimed toward Sequence 8 (Pugilist).</p>',
          chat: ''
        },
        source: {
          custom: '',
          rules: '2024',
          revision: 1,
          license: '',
          book: 'LoTM Core'
        },
        startingEquipment: [],
        identifier: 'lotm-warrior',
        levels: 1,
        advancement: [],
        spellcasting: {
          progression: 'full',
          ability: 'str',
          preparation: {
            formula: ''
          }
        },
        wealth: '4d4*10',
        primaryAbility: {
          value: ['str'],
          all: false
        },
        hd: {
          denomination: 'd8',
          spent: 0,
          additional: ''
        }
      },
      effects: [],
      folder: null,
      flags: {
        lotm: {
          sourceBook: 'LoTM Core'
        }
      },
      _stats: buildStats(now, existingPathway?._stats),
      sort: 1100000,
      ownership: {
        default: 0
      }
    };

    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);

    const folderDoc = {
      ...(existingFolder ?? {
        name: 'Warrior',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 800000,
        _id: 'HU7eK5t0hJEd93Ug',
        description: '',
        color: null,
        flags: {}
      }),
      description: 'Sequence abilities for the Warrior pathway.',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: 'lotm-warrior',
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW9001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW9002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityW9001',
        name: 'Combat Mastery',
        type: 'spell',
        img: 'icons/skills/melee/sword-damaged-broken-glow-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Enter a twilight stance for 1 minute. Once per turn when you hit with a melee weapon or unarmed strike, add <strong>+1 damage</strong>. You also gain advantage on Strength (Athletics) checks to shove, hold, or disarm.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> The bonus damage becomes <strong>+Potency</strong> for this turn.</li><li><strong>+2 Spirituality:</strong> On one hit this turn, force a Strength save. Fail: target is <strong>prone</strong> or loses <strong>reactions</strong> until your next turn (your choice).</li><li><strong>+4 Spirituality:</strong> In dim light, darkness, or heavy weather, make one additional melee attack after resolving the triggering hit (once per turn).</li></ul><p><em>Counterplay:</em> Reach control, forced movement, and blindness break your preferred range and reduce output.</p><p><em>Corruption Hook:</em> If you use this to execute a surrendered foe, gain 1 Corruption.</p>',
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
          level: 0,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a worn weapon grip or gauntlet strap',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq9Act001: buildActivity({
              id: 'warriorSeq9Act001',
              activationType: 'bonus',
              durationUnits: 'minute',
              rangeUnits: 'ft'
            })
          },
          identifier: 'lotm-warrior-combat-mastery',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-warrior'
        },
        effects: [],
        folder: 'HU7eK5t0hJEd93Ug',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 9
          }
        },
        _stats: buildStats(now + 2, existingAbility1?._stats),
        sort: 800000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW9002',
        name: 'Physical Enhancement',
        type: 'spell',
        img: 'icons/magic/defensive/armor-shield-barrier-steel.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Fortify your body for 10 minutes. Gain temporary hit points equal to <strong>Potency</strong>, and gain advantage on checks or saves against being pushed, knocked prone, or grappled.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Temporary hit points become <strong>2 × Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Until the start of your next turn, gain resistance to non-magical bludgeoning, piercing, and slashing damage.</li><li><strong>+4 Spirituality:</strong> If an effect would knock you prone, stun you, or grapple you this round, you can ignore that effect once.</li></ul><p><em>Counterplay:</em> Mental control, illusion, and spirit attacks bypass most of this defense.</p><p><em>Corruption Hook:</em> If you use this to brutalize noncombatants, gain 1 Corruption.</p>',
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
            value: '10',
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
          level: 0,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a strip of dusk-dyed cloth',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq9Act002: buildActivity({
              id: 'warriorSeq9Act002',
              activationType: 'bonus',
              durationUnits: 'minute',
              rangeUnits: 'ft'
            })
          },
          identifier: 'lotm-warrior-physical-enhancement',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-warrior'
        },
        effects: [],
        folder: 'HU7eK5t0hJEd93Ug',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 9
          }
        },
        _stats: buildStats(now + 3, existingAbility2?._stats),
        sort: 800001,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
