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
    const pathwayKey = '!items!lotmPathway00012';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Assassin pathway (lotmPathway00012) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> seductive predation through shadowed mobility, emotional leverage, and taunting confidence that turns hesitation into openings.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Predator\'s Footwork, Barbed Whisper.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Instigation, Malice Appraisal, plus one legacy scope upgrade to Barbed Whisper.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Ruinous Allure, Black Flame Kiss, Mirror-Frost Veil, plus two legacy upgrades (Predator\'s Footwork and Instigation).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Velvet Threads, Sable Ember, Glassheart Reprieve, plus two legacy upgrades (Barbed Whisper and Malice Appraisal).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Contagion Waltz, Needle Tresses, Mirror Fever Parlor, plus two legacy upgrades (Ruinous Allure and Instigation).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Sapping Plague, Petrifying Tresses, Mirror Procession, Despair Chorus, plus two legacy upgrades (Contagion Waltz and Velvet Threads).</p>' +
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Despair), Assassin gains demigod-tier battlefield authority: epidemic pressure, petrifying hair control, mirror-projection misdirection, and collapse of enemy morale.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyContagionKey = '!items!lotmAbilityI5001';
    const legacyThreadsKey = '!items!lotmAbilityI6001';
    const legacyContagion = await getOptionalJson(abilitiesDb, legacyContagionKey);
    const legacyThreads = await getOptionalJson(abilitiesDb, legacyThreadsKey);
    if (!legacyContagion) throw new Error('Legacy target lotmAbilityI5001 not found.');
    if (!legacyThreads) throw new Error('Legacy target lotmAbilityI6001 not found.');

    const contagionHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const contagionText =
      '<p>At Sequence 4, Contagion Waltz can unfold as a layered outbreak. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, split the effect into two outbreak nodes within 60 feet of each other (each node uses the base radius). ' +
      'A creature can only be affected by one node per round. Once per short rest, this split can be used without the +2 surcharge.</p>';
    const contagionDescription = String(legacyContagion.system?.description?.value ?? '');
    if (!contagionDescription.includes(contagionHeader)) {
      legacyContagion.system.description.value = `${contagionDescription}${contagionHeader}${contagionText}`;
    }
    legacyContagion._stats = buildStats(now + 2, legacyContagion._stats);
    await abilitiesDb.put(legacyContagionKey, JSON.stringify(legacyContagion));

    const threadsHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const threadsText =
      '<p>At Sequence 4, Velvet Threads carry early petrification pressure. ' +
      'When a target fails a save against Velvet Threads, it gains one <em>stone-mark</em> (max 2) until the end of your next turn. ' +
      'At 2 marks, the target is <strong>restrained</strong> until end of turn. ' +
      'If it fails another relevant save while restrained this way, it takes necrotic damage equal to <strong>2 x Potency</strong>.</p>';
    const threadsDescription = String(legacyThreads.system?.description?.value ?? '');
    if (!threadsDescription.includes(threadsHeader)) {
      legacyThreads.system.description.value = `${threadsDescription}${threadsHeader}${threadsText}`;
    }
    legacyThreads._stats = buildStats(now + 3, legacyThreads._stats);
    await abilitiesDb.put(legacyThreadsKey, JSON.stringify(legacyThreads));

    const existingA4001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI4001');
    const existingA4002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI4002');
    const existingA4003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI4003');
    const existingA4004 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI4004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI4001',
        name: 'Sapping Plague',
        type: 'spell',
        img: 'icons/magic/death/disease-infection-water-teal.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Create a 30-foot plague zone centered on a point within 120 feet for 1 minute (concentration). Creatures of your choice entering the zone or starting their turn there make a Constitution save. On failure, they take necrotic damage equal to <strong>Potency</strong> and suffer <em>sapped vigor</em>: -10 feet speed and disadvantage on Strength checks until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 40 feet.</li><li><strong>+2 Spirituality:</strong> Failed targets also take a <strong>-Potency</strong> penalty to concentration checks and cannot regain hit points until start of your next turn.</li><li><strong>+4 Spirituality:</strong> Choose one strain each round while active (rigidity, flesh-rot, or spirituality drain). Failed targets suffer an additional rider tied to that strain until end of turn.</li></ul><p><em>Counterplay:</em> strong wind control, radiant cleansing, and anti-disease wards reduce spread efficiency.</p><p><em>Corruption Hook:</em> If you release this into civilian crowds for spectacle, gain 1 Corruption.</p>',
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
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'space',
              special: 'plague zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '120',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 5,
          school: 'nec',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a vial of stagnant water',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq4Act001: buildActivity({
              id: 'assnSeq4Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-sapping-plague',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 4, existingA4001?._stats),
        sort: 500000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI4002',
        name: 'Petrifying Tresses',
        type: 'spell',
        img: 'icons/skills/melee/strike-dagger-blood-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Your hair becomes snake-like and stone-cold for 1 minute. Once per turn when you hit a creature with a melee attack or a thread effect, it must make a Constitution save. On failure, it gains one <em>petrify stack</em> (max 2) until end of your next turn. At 2 stacks, the target is restrained until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> First failed save each round also deals necrotic damage equal to <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Restrained targets from this ability cannot take reactions until start of their next turn.</li><li><strong>+4 Spirituality:</strong> If a target at 2 stacks fails another save against this ability, it is <em>partially petrified</em> for 1 round (speed 0, disadvantage on Dexterity saves, can still act).</li></ul><p><em>Counterplay:</em> condition cleansing, movement denial on you, and ranged pressure reduce stack application rate.</p><p><em>Corruption Hook:</em> If you inflict petrification solely to torment captives, gain 1 Corruption.</p>',
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
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a brittle scale fragment',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq4Act002: buildActivity({
              id: 'assnSeq4Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-petrifying-tresses',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 5, existingA4002?._stats),
        sort: 500001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI4003',
        name: 'Mirror Procession',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Summon up to two mirror projections of yourself at reflective surfaces within 300 feet for 1 minute (concentration). Projections cannot deal damage directly, but each can deliver one social or curse-origin effect per round as though you occupied its space. While at least one projection remains, attacks against you from creatures farther than 30 feet are made at disadvantage unless the attacker can see your true body clearly.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Create one additional projection (max 3).</li><li><strong>+2 Spirituality:</strong> Once per round, swap positions with one projection as a free effect on your turn.</li><li><strong>+4 Spirituality:</strong> Failed saves against effects delivered via projection also inflict <em>despair mark</em> until end of your next turn (target has disadvantage on checks to identify illusions and hidden movement).</li></ul><p><em>Counterplay:</em> destroying or veiling reflective anchors limits projection lanes.</p><p><em>Corruption Hook:</em> If you use projections only to terrorize innocents, gain 1 Corruption.</p>',
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
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'space',
              special: 'reflective anchor points'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '300',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 5,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a silver-backed mirror sliver',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq4Act003: buildActivity({
              id: 'assnSeq4Act003',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-mirror-procession',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 6, existingA4003?._stats),
        sort: 500002,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI4004',
        name: 'Despair Chorus',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-hold-levitate-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose up to three creatures within 90 feet that can perceive you. Each makes a Wisdom save. On failure, it is afflicted by despair until the end of your next turn: it cannot gain advantage on attack rolls, and if it fails an attack or saving throw, it takes psychic damage equal to <strong>Potency</strong> (once per round).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional target.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn).</li><li><strong>+4 Spirituality:</strong> While a target remains afflicted, your plague and thread effects against it gain +Potency to their first damage instance each round.</li></ul><p><em>Counterplay:</em> fear/charm resistance, morale wards, and line-of-sight denial reduce impact.</p><p><em>Corruption Hook:</em> If you weaponize this to drive allies into hopeless surrender for vanity, gain 1 Corruption.</p>',
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
              count: '3',
              type: 'creature',
              special: 'creatures that can perceive you'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '90',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 5,
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
            assnSeq4Act004: buildActivity({
              id: 'assnSeq4Act004',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-despair-chorus',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 7, existingA4004?._stats),
        sort: 500003,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [legacyContagionKey, legacyThreadsKey],
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      mapping: abilityDocs.map((doc) => ({
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
