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
  targetUnits = 'ft'
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
    const pathwayId = 'lotmPathway00012';
    const pathwayKey = `!items!${pathwayId}`;
    const existingPathway = await getOptionalJson(pathwaysDb, pathwayKey);

    const pathwayDoc = {
      _id: pathwayId,
      name: 'Assassin',
      type: 'class',
      img: 'icons/skills/melee/sword-damaged-broken-glow-red.webp',
      system: {
        description: {
          value: '<p><strong>Pathway Vector:</strong> seductive predation through shadowed mobility, emotional leverage, and taunting confidence that turns hesitation into openings.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Predator\'s Footwork, Barbed Whisper.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Assassin) starts with lethal agility, concealment, and pressure-through-words, with advancement aimed toward Sequence 8 (Instigator).</p>',
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
        identifier: 'lotm-assassin',
        levels: 1,
        advancement: [],
        spellcasting: {
          progression: 'full',
          ability: 'cha',
          preparation: {
            formula: ''
          }
        },
        wealth: '4d4*10',
        primaryAbility: {
          value: ['cha'],
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
      sort: 1200000,
      ownership: {
        default: 0
      }
    };

    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    const folderDoc = {
      ...(existingFolder ?? {
        name: 'Assassin',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 1000000,
        _id: 'jmuQee6mCwV4wjQa',
        description: '',
        color: null,
        flags: {}
      }),
      description: 'Sequence abilities for the Assassin pathway.',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: 'lotm-assassin',
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI9001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI9002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI9001',
        name: 'Predator\'s Footwork',
        type: 'spell',
        img: 'icons/skills/melee/sword-damaged-broken-glow-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, your gait turns predatory and precise. Your speed increases by 10 feet, and you gain advantage on Dexterity (Stealth) checks made in dim light or darkness. Once per turn, if you moved at least 10 feet before hitting with a finesse or light melee attack, add <strong>+1 damage</strong> and you may move 5 feet without provoking opportunity attacks from that target.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> The bonus damage becomes <strong>+Potency</strong>, and you may attempt to Hide as part of the same bonus action when in dim light, darkness, or heavy cover.</li><li><strong>+2 Spirituality:</strong> On your first qualifying hit this turn, the target must pass a Dexterity save or lose <strong>reactions</strong> until the start of its next turn.</li><li><strong>+4 Spirituality:</strong> If you begin the turn unseen or in dim light/darkness, you may leap or dash up to 20 feet (including vertical movement up to 10 feet) without triggering opportunity attacks, and your first qualifying hit this turn deals an additional <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> Bright illumination, forced reveal effects, and area denial reduce concealment and movement angles.</p><p><em>Corruption Hook:</em> If you use this to hunt a helpless target for sport, gain 1 Corruption.</p>',
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
            value: 'a dark silk ribbon tied at the wrist',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq9Act001: buildActivity({
              id: 'assnSeq9Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-predators-footwork',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        sort: 1000000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI9002',
        name: 'Barbed Whisper',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Speak to one creature within 30 feet that can hear and understand you, layering threat and flattery in the same sentence. The target makes a Wisdom save. On a failure, choose one effect until the end of your next turn: (a) the target has disadvantage on attack rolls against you, or (b) the target has disadvantage on Insight checks and Perception checks made to read your intent.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 60 feet, and you may target one additional creature with separate saves.</li><li><strong>+2 Spirituality:</strong> A failed target also cannot take <strong>reactions</strong> until the start of its next turn.</li><li><strong>+4 Spirituality:</strong> A failed target becomes emotionally fixated until the end of your next turn: it cannot benefit from the Help action, and you gain advantage on your next attack roll or social check against it before the effect ends.</li></ul><p><em>Counterplay:</em> Deafened targets, creatures that cannot understand you, or charm-immune minds ignore this ability.</p><p><em>Corruption Hook:</em> If you provoke allies into needless conflict just to test your influence, gain 1 Corruption.</p>',
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
              special: 'creature that can hear and understand you'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '30',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 0,
          school: 'enc',
          properties: ['vocal'],
          materials: {
            value: '',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq9Act002: buildActivity({
              id: 'assnSeq9Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-barbed-whisper',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        sort: 1000001,
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
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      grantedSequenceMapping: abilityDocs.map((doc) => ({
        id: doc._id,
        grantedSequence: doc.flags?.lotm?.grantedSequence ?? null,
        systemLevel: doc.system?.level ?? null
      }))
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
