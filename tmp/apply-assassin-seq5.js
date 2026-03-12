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
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Affliction), Assassin pressure weaponizes intimacy and proximity into escalating sickness, precise hair-threat control, and reflection-based entrapment.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyAllureKey = '!items!lotmAbilityI7001';
    const legacyInstigationKey = '!items!lotmAbilityI8001';
    const legacyAllure = await getOptionalJson(abilitiesDb, legacyAllureKey);
    const legacyInstigation = await getOptionalJson(abilitiesDb, legacyInstigationKey);
    if (!legacyAllure) throw new Error('Legacy target lotmAbilityI7001 not found.');
    if (!legacyInstigation) throw new Error('Legacy target lotmAbilityI8001 not found.');

    const allureHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    const allureText =
      '<p>At Sequence 5, Ruinous Allure primes targets for pain. ' +
      'When a target fails Ruinous Allure\'s save, the next disease, curse, or thread-binding effect you apply to it before the end of your next turn gains one of the following (your choice): ' +
      '(a) the target has disadvantage on its first saving throw against that effect, or (b) it takes psychic damage equal to <strong>Potency</strong> when the effect is applied.</p>';
    const allureDescription = String(legacyAllure.system?.description?.value ?? '');
    if (!allureDescription.includes(allureHeader)) {
      legacyAllure.system.description.value = `${allureDescription}${allureHeader}${allureText}`;
    }
    legacyAllure._stats = buildStats(now + 2, legacyAllure._stats);
    await abilitiesDb.put(legacyAllureKey, JSON.stringify(legacyAllure));

    const instigationHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const instigationText =
      '<p>At Sequence 5, Instigation can be threaded into your rhythm. ' +
      'Once per short rest, if you dealt damage to a creature this turn or it failed a social check against you this scene, you may cast Instigation as a <strong>bonus action</strong> at baseline cost. ' +
      'When used this way, its range is reduced to 30 feet.</p>';
    const instigationDescription = String(legacyInstigation.system?.description?.value ?? '');
    if (!instigationDescription.includes(instigationHeader)) {
      legacyInstigation.system.description.value = `${instigationDescription}${instigationHeader}${instigationText}`;
    }
    legacyInstigation._stats = buildStats(now + 3, legacyInstigation._stats);
    await abilitiesDb.put(legacyInstigationKey, JSON.stringify(legacyInstigation));

    const existingA5001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI5001');
    const existingA5002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI5002');
    const existingA5003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI5003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI5001',
        name: 'Contagion Waltz',
        type: 'spell',
        img: 'icons/magic/death/disease-infection-water-teal.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Infective mist spills from your movement in a 15-foot radius around you until the start of your next turn. Creatures of your choice entering the area or starting their turn there make a Constitution save. On a failure, they take necrotic damage equal to <strong>Potency</strong> and suffer <em>fevered distraction</em> (disadvantage on Perception and Insight checks) until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius increases to 20 feet.</li><li><strong>+2 Spirituality:</strong> Failed targets also have speed reduced by 10 feet until the end of their turn.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Affected creatures repeat the save at end of each turn; on each failure they take necrotic damage equal to Potency.</li></ul><p><em>Counterplay:</em> Wind control, flame cleansing, and high-constitution targets blunt spread pressure.</p><p><em>Corruption Hook:</em> If you deliberately spread this among bystanders for panic alone, gain 1 Corruption.</p>',
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
              type: 'self',
              special: 'aura affecting chosen creatures'
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
          level: 4,
          school: 'nec',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a stained lace handkerchief',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq5Act001: buildActivity({
              id: 'assnSeq5Act001',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-contagion-waltz',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 4, existingA5001?._stats),
        sort: 600000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI5002',
        name: 'Needle Tresses',
        type: 'spell',
        img: 'icons/skills/melee/strike-dagger-blood-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Animate your hair into razor filaments for 1 minute. Your melee reach increases by 5 feet for one attack each turn, and on hit you may deal extra piercing damage equal to <strong>Potency</strong> or force a Strength save to impose <em>stiffened limb</em> (target speed reduced by 10 feet until end of turn).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may apply both baseline riders on your first hit each turn.</li><li><strong>+2 Spirituality:</strong> When a target fails the save, it cannot take reactions until start of its next turn.</li><li><strong>+4 Spirituality:</strong> Once per turn on hit, you may tether the target to a point within 10 feet; until start of your next turn, if it moves away from that point it takes slashing damage equal to Potency.</li></ul><p><em>Counterplay:</em> Reach denial, forced displacement, and heavy armor can reduce conversion of rider pressure.</p><p><em>Corruption Hook:</em> If you use this only to maim without tactical need, gain 1 Corruption.</p>',
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
          level: 4,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a silver hairpin',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq5Act002: buildActivity({
              id: 'assnSeq5Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-needle-tresses',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 5, existingA5002?._stats),
        sort: 600001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI5003',
        name: 'Mirror Fever Parlor',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Establish a 20-foot zone within 60 feet anchored by reflective surfaces for 1 minute (concentration). Creatures you choose in the zone make a Wisdom save when they enter or start their turn there. On failure, they are <em>disoriented</em> until end of turn: they cannot take the Help action and have disadvantage on checks to navigate, investigate, or identify illusions in the zone.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Zone radius becomes 30 feet.</li><li><strong>+2 Spirituality:</strong> Failed targets also treat all creatures as lightly obscured for attack targeting decisions until end of turn (GM adjudication for ambiguous line checks).</li><li><strong>+4 Spirituality:</strong> Once per round when a target fails in the zone, you may reflect one active curse/debuff from yourself onto that target for 1 round (if valid target and effect type).</li></ul><p><em>Counterplay:</em> Reflection-breaking effects, blindsight, and area denial can collapse the parlor advantage.</p><p><em>Corruption Hook:</em> If you trap foes in mirrored panic merely for amusement, gain 1 Corruption.</p>',
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
              special: 'mirror-anchored zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
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
          level: 4,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a polished mirror shard',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq5Act003: buildActivity({
              id: 'assnSeq5Act003',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-mirror-fever-parlor',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 6, existingA5003?._stats),
        sort: 600002,
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
      legacyUpdated: [legacyAllureKey, legacyInstigationKey],
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
