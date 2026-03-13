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
    const pathwayId = 'lotmPathway00013';
    const pathwayKey = `!items!${pathwayId}`;
    const existingPathway = await getOptionalJson(pathwaysDb, pathwayKey);

    const pathwayDoc = {
      _id: pathwayId,
      name: 'Hunter',
      type: 'class',
      img: 'icons/skills/ranged/target-bullseye-arrow-glowing.webp',
      system: {
        description: {
          value: '<p><strong>Pathway Vector:</strong> relentless battlefield pursuit through predatory senses, prepared kill zones, and command-by-pressure.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Killzone Instinct, Scorchline Trapcraft.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Hunter) starts with heightened hunting intuition and trap-led tempo control, setting up the escalation toward Sequence 8 (Provoker).</p>',
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
        identifier: 'lotm-hunter',
        levels: 1,
        advancement: [],
        spellcasting: {
          progression: 'full',
          ability: 'dex',
          preparation: {
            formula: ''
          }
        },
        wealth: '4d4*10',
        primaryAbility: {
          value: ['dex'],
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
      sort: 1300000,
      ownership: {
        default: 0
      }
    };

    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    const folderDoc = {
      ...(existingFolder ?? {
        name: 'Hunter',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 900000,
        _id: 'vB18zSgRsDmrUAjW',
        description: '',
        color: null,
        flags: {}
      }),
      description: 'Sequence abilities for the Hunter pathway.',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: 'lotm-hunter',
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH9001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH9002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH9001',
        name: 'Killzone Instinct',
        type: 'spell',
        img: 'icons/skills/ranged/arrows-triple-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Mark one creature you can see within 60 feet as your quarry for 1 minute. You gain advantage on Wisdom (Perception) and Wisdom (Survival) checks to detect or track the quarry. Once per turn, if you moved at least 10 feet toward the quarry before hitting it with a weapon attack, deal <strong>+1 damage</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> The bonus damage becomes <strong>+Potency</strong> and can be fire damage.</li><li><strong>+2 Spirituality:</strong> On your first qualifying hit this turn, the quarry must pass a Wisdom save or lose <strong>reactions</strong> until the start of its next turn.</li><li><strong>+4 Spirituality:</strong> When you hit the quarry, choose one ally who can hear your command within 30 feet. That ally gains <strong>+Potency</strong> to its next weapon damage roll against the quarry before the start of your next turn.</li></ul><p><em>Counterplay:</em> Breaking line of sight, concealment, and forced repositioning can deny your movement condition and tracking edge.</p><p><em>Corruption Hook:</em> If you maintain this mark on a helpless noncombatant for intimidation alone, gain 1 Corruption.</p>',
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
              type: 'creature',
              special: 'your marked quarry'
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
          level: 0,
          school: 'trs',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a strip of red cloth tied to your weapon grip',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq9Act001: buildActivity({
              id: 'hunterSeq9Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-killzone-instinct',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        sort: 900000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH9002',
        name: 'Scorchline Trapcraft',
        type: 'spell',
        img: 'icons/magic/fire/embers-evade.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Place a hidden scorchline trap in one unoccupied 5-foot space within 30 feet. The trap lasts 1 hour. The first creature that enters or starts its turn there makes a Dexterity save. On a failure, it takes <strong>+1 fire damage</strong> and its speed is reduced by 10 feet until the end of its next turn. The trap then ends.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Damage becomes <strong>+Potency fire damage</strong>.</li><li><strong>+2 Spirituality:</strong> The trigger becomes a 10-foot burst centered on the trapped space, affecting up to two creatures of your choice in that burst.</li><li><strong>+4 Spirituality:</strong> When the trap triggers, one ally who can hear your shouted order within 30 feet may move up to 10 feet without provoking opportunity attacks and can immediately make one weapon attack (reaction).</li></ul><p><em>Counterplay:</em> Careful searching, forced detonation from range, and heavy rain or magical cold can reduce or reveal trap effectiveness.</p><p><em>Corruption Hook:</em> If you arm this trap where bystanders are likely to trigger it first, gain 1 Corruption.</p>',
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
            value: '1',
            units: 'hour'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'creature',
              special: 'creature entering trapped space'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'square'
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
          school: 'evo',
          properties: ['vocal', 'somatic', 'material'],
          materials: {
            value: 'charcoal dust and a snapped arrowhead',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq9Act002: buildActivity({
              id: 'hunterSeq9Act002',
              activationType: 'action',
              durationUnits: 'hour'
            })
          },
          identifier: 'lotm-hunter-scorchline-trapcraft',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        sort: 900001,
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
        systemLevel: doc.system?.level ?? null,
        sourceClass: doc.system?.sourceClass ?? null,
        identifier: doc.system?.identifier ?? null
      }))
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
