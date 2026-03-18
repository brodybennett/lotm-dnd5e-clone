const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_ID = 'lotmPathway00022';
const PATHWAY_KEY = `!items!${PATHWAY_ID}`;
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const FOLDER_ID = 'eiKFQVwZoYCkBNOF';
const FOLDER_KEY = `!folders!${FOLDER_ID}`;

const ABILITY_KEYS = ['!items!lotmAbilityZ9001', '!items!lotmAbilityZ9002'];

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
    const existingPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const existingFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);

    const pathwayDoc = {
      _id: PATHWAY_ID,
      name: 'Arbiter',
      type: 'class',
      img: 'icons/skills/social/trading-currency-coins.webp',
      system: {
        description: {
          value: '<p><strong>Pathway Vector:</strong> impartial authority through declared order, conflict de-escalation, and firm preliminary verdicts against violations.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p><p><strong>Sequence 8-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> Sequence 9 (Arbiter) establishes lawful command presence and single-target compliance pressure, preparing continuity into Sequence 8 (Sheriff) where jurisdiction and detection authority broaden.</p>',
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
        identifier: PATHWAY_IDENTIFIER,
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
      sort: 2200000,
      ownership: {
        default: 0
      }
    };

    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathwayDoc));

    const folderDoc = {
      ...(existingFolder ?? {
        name: 'Arbiter',
        type: 'Item',
        folder: null,
        sorting: 'a',
        sort: 1800000,
        _id: FOLDER_ID,
        description: '',
        color: null,
        flags: {}
      }),
      name: 'Arbiter',
      description: 'Sequence abilities for the Arbiter pathway (authored through Sequence 9).',
      flags: {
        ...(existingFolder?.flags ?? {}),
        lotm: {
          ...(existingFolder?.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: 9
        }
      },
      _stats: buildStats(now + 1, existingFolder?._stats)
    };

    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folderDoc));

    const existingAbility1 = await getOptionalJson(abilitiesDb, ABILITY_KEYS[0]);
    const existingAbility2 = await getOptionalJson(abilitiesDb, ABILITY_KEYS[1]);

    const abilityDocs = [
      {
        _id: 'lotmAbilityZ9001',
        name: 'Authority Bearing',
        type: 'spell',
        img: 'icons/skills/social/intimidation-impressing.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Designate one creature you can see within 60 feet that can hear and understand you as a reviewed subject for 1 minute. While it is designated, you have advantage on Insight checks against it. Once per round, when that subject makes an attack roll, ability check, or save that directly opposes a clear command you issued this round (for example: stand down, hold position, drop the weapon), you may use your reaction to issue an <strong>Objection</strong>. The subject makes a Wisdom save. On a failure, apply <strong>-1</strong> to the triggering roll and the subject cannot take reactions until the start of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase range to 120 feet <strong>or</strong> designate one additional subject.</li><li><strong>+2 Spirituality:</strong> The Objection penalty becomes <strong>Potency</strong> instead of 1.</li><li><strong>+4 Spirituality:</strong> On a failed Objection save, the subject also has disadvantage on its next attack roll or contested check before the end of its next turn.</li></ul><p><em>Counterplay:</em> effects that prevent hearing or understanding, strict cover denial, and high-discipline targets reduce this ability&apos;s influence.</p><p><em>Corruption Hook:</em> If you use your authority to silence lawful testimony for personal gain, gain 1 Corruption.</p>',
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
            value: 'a stamped badge or brass authority token',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            arbiterSeq9Act001: buildActivity({
              id: 'arbiterSeq9Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-arbiter-authority-bearing',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: PATHWAY_IDENTIFIER
        },
        effects: [],
        folder: FOLDER_ID,
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
        sort: 1800000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityZ9002',
        name: 'Preliminary Verdict',
        type: 'spell',
        img: 'icons/sundries/documents/document-sealed-signatures-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Choose one creature within 60 feet that can hear and understand you. Declare one clause: <em>No attack</em>, <em>No advance toward a named creature/zone</em>, or <em>No supernatural ability use</em> until the end of the target\'s next turn. The target makes a Wisdom save. On a failure, it is bound by that clause. If it attempts the prohibited conduct, it may continue but immediately suffers disadvantage on the triggering roll/check and loses reactions until the start of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase range to 120 feet <strong>or</strong> add one additional clause to the same target.</li><li><strong>+2 Spirituality:</strong> Affect one additional creature within 30 feet of the first target (separate save), <strong>or</strong> extend duration to 1 minute (concentration, repeat save at end of each affected turn).</li><li><strong>+4 Spirituality:</strong> The first failed target that violates a clause takes spiritual backlash equal to <strong>Potency</strong>, and its speed becomes 0 until the end of the current turn.</li></ul><p><em>Counterplay:</em> deafness, language barriers, immunity to command effects, and line-of-effect breaks before declaration can negate this verdict.</p><p><em>Corruption Hook:</em> If you knowingly issue impossible clauses to entrap innocents, gain 1 Corruption.</p>',
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
            value: 'a signed writ fragment',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            arbiterSeq9Act002: buildActivity({
              id: 'arbiterSeq9Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-arbiter-preliminary-verdict',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: PATHWAY_IDENTIFIER
        },
        effects: [],
        folder: FOLDER_ID,
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
        sort: 1800001,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyAbilities = [];
    for (const key of ABILITY_KEYS) {
      verifyAbilities.push(await getOptionalJson(abilitiesDb, key));
    }

    console.log(JSON.stringify({
      pathwayWritten: PATHWAY_KEY,
      folderWritten: FOLDER_KEY,
      abilitiesWritten: ABILITY_KEYS,
      verification: {
        pathway: {
          id: verifyPathway?._id,
          identifier: verifyPathway?.system?.identifier,
          name: verifyPathway?.name
        },
        folder: {
          id: verifyFolder?._id,
          name: verifyFolder?.name,
          pathwayIdentifier: verifyFolder?.flags?.lotm?.pathwayIdentifier,
          latestAuthoredSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence
        },
        abilities: verifyAbilities.map((doc) => ({
          id: doc?._id,
          name: doc?.name,
          folder: doc?.folder,
          sourceClass: doc?.system?.sourceClass,
          grantedSequence: doc?.flags?.lotm?.grantedSequence ?? null,
          systemLevel: doc?.system?.level ?? null
        }))
      }
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
