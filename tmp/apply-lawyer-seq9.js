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
    const pathwayId = 'lotmPathway00021';
    const pathwayKey = `!items!${pathwayId}`;
    const existingPathway = await getOptionalJson(pathwaysDb, pathwayKey);

    const pathwayDoc = {
      _id: pathwayId,
      name: 'Lawyer',
      type: 'class',
      img: 'icons/sundries/documents/document-sealed-red-tan.webp',
      system: {
        description: {
          value: '<p><strong>Pathway Vector:</strong> impartial adjudication through precise rhetoric, loophole analysis, and order-backed injunctions that constrain hostile conduct.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Law Proficiency, Order Citation.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Lawyer) establishes procedural authority and battlefield rulings, with advancement aimed toward Sequence 8 (Barbarian) for stronger coercive enforcement.</p>',
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
        identifier: 'lotm-lawyer',
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
      sort: 2100000,
      ownership: {
        default: 0
      }
    };

    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = '!folders!F7OA4PBTMNaIeTZQ';
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    const folderDoc = {
      ...(existingFolder ?? {
        name: 'Lawyer',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 1700000,
        _id: 'F7OA4PBTMNaIeTZQ',
        description: '',
        color: null,
        flags: {}
      }),
      description: 'Sequence abilities for the Lawyer pathway.',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: 'lotm-lawyer',
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityX9001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityX9002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityX9001',
        name: 'Law Proficiency',
        type: 'spell',
        img: 'icons/skills/social/diplomacy-handshake-yellow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, enter an adjudication stance. Name one observed process, rule, contract term, battlefield pattern, or standing order affecting creatures you can see within 60 feet. Once per round, when a creature violates that named process, use your reaction to issue an <strong>Objection</strong>: either apply <strong>-1</strong> to that creature\'s triggering roll/check/save, or grant <strong>+1</strong> to one allied roll/check/save directly contesting that creature before the start of your next turn. While this stance is active, you have advantage on Intelligence (Investigation) and Wisdom (Insight) checks made to identify loopholes, contradictions, or procedural weaknesses.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Track two named processes simultaneously instead of one.</li><li><strong>+2 Spirituality:</strong> Your Objection modifier becomes <strong>Potency</strong> instead of 1.</li><li><strong>+4 Spirituality:</strong> If a roll modified by your Objection fails, the violator loses <strong>reactions</strong> until the start of its next turn and cannot benefit from the Help action on that declared process during the same round.</li></ul><p><em>Counterplay:</em> unstructured chaos, random action selection, silence fields, and forced displacement reduce the value of your named process analysis.</p><p><em>Corruption Hook:</em> If you knowingly weaponize private legal knowledge to trap uninformed civilians, gain 1 Corruption.</p>',
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
          school: 'div',
          properties: ['vocal'],
          materials: {
            value: 'a marked legal codex or sealed brief',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            lawyerSeq9Act001: buildActivity({
              id: 'lawyerSeq9Act001',
              activationType: 'bonus',
              durationUnits: 'minute',
              targetUnits: 'self'
            })
          },
          identifier: 'lotm-lawyer-law-proficiency',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-lawyer'
        },
        effects: [],
        folder: 'F7OA4PBTMNaIeTZQ',
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
        sort: 1700000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityX9002',
        name: 'Order Citation',
        type: 'spell',
        img: 'icons/sundries/documents/document-sealed-signatures-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Choose one creature within 60 feet that can hear and understand you. Declare one explicit injunction clause: <em>Attack</em>, <em>Advance toward a named creature/zone</em>, <em>Cast or use a supernatural ability</em>, or <em>Interact with a named object or mechanism</em>. The target makes a Wisdom save. On a failure, until the end of its next turn, the first time it attempts the enjoined conduct it must choose one: (1) cancel the action and lose 10 feet of movement, or (2) proceed, but make the triggering roll/check at disadvantage and lose reactions until the start of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase range to 120 feet <strong>or</strong> declare a second injunction clause for the same target.</li><li><strong>+2 Spirituality:</strong> Affect one additional creature within 30 feet of the first target (separate save), <strong>or</strong> extend duration to 1 minute (concentration, repeat save at end of each affected turn).</li><li><strong>+4 Spirituality:</strong> The first failed creature that violates an injunction takes spiritual backlash equal to <strong>Potency</strong>, and its speed becomes 0 until the end of the current turn.</li></ul><p><em>Counterplay:</em> deafness, language denial, command immunity, and breaking line of effect before declaration can nullify this citation.</p><p><em>Corruption Hook:</em> If you intentionally draft impossible clauses to condemn innocents, gain 1 Corruption.</p>',
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
            value: '60',
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
            value: 'a stamped citation card',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            lawyerSeq9Act002: buildActivity({
              id: 'lawyerSeq9Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-lawyer-order-citation',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-lawyer'
        },
        effects: [],
        folder: 'F7OA4PBTMNaIeTZQ',
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
        sort: 1700001,
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
