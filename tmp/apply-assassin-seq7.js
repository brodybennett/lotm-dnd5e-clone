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
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Witch), Assassin grows from incitement into charismatic calamity: predatory allure, spirit-burning black flame, and mirror-frost survival tricks.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyPredatorKey = '!items!lotmAbilityI9001';
    const legacyInstigationKey = '!items!lotmAbilityI8001';
    const legacyPredator = await getOptionalJson(abilitiesDb, legacyPredatorKey);
    const legacyInstigation = await getOptionalJson(abilitiesDb, legacyInstigationKey);
    if (!legacyPredator) throw new Error('Legacy target lotmAbilityI9001 not found.');
    if (!legacyInstigation) throw new Error('Legacy target lotmAbilityI8001 not found.');

    const predatorLegacyHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const predatorLegacyText =
      '<p>At Sequence 7, Predator\'s Footwork becomes easier to chain into high-pressure turns. ' +
      'Once per round, if you moved at least 15 feet before making your first qualifying attack, reduce one upcast surcharge on Predator\'s Footwork by <strong>1</strong> (minimum 0). ' +
      'When this discount applies, you may also draw or stow one light weapon as part of the same movement.</p>';
    const predatorDescription = String(legacyPredator.system?.description?.value ?? '');
    if (!predatorDescription.includes(predatorLegacyHeader)) {
      legacyPredator.system.description.value = `${predatorDescription}${predatorLegacyHeader}${predatorLegacyText}`;
    }
    legacyPredator._stats = buildStats(now + 2, legacyPredator._stats);
    await abilitiesDb.put(legacyPredatorKey, JSON.stringify(legacyPredator));

    const instigationLegacyHeader = '<h3>Legacy Upgrade (Sequence 7 - Scope)</h3>';
    const instigationLegacyText =
      '<p>At Sequence 7, Instigation can spread from the first fracture. ' +
      'When an affected target fails its save and is damaged by another creature, choose one creature within 10 feet of it that can hear and understand you. ' +
      'That creature must attempt a Wisdom save or suffer Instigation\'s baseline restrictions until the end of your next turn. ' +
      'This spread can occur once per cast.</p>';
    const instigationDescription = String(legacyInstigation.system?.description?.value ?? '');
    if (!instigationDescription.includes(instigationLegacyHeader)) {
      legacyInstigation.system.description.value = `${instigationDescription}${instigationLegacyHeader}${instigationLegacyText}`;
    }
    legacyInstigation._stats = buildStats(now + 3, legacyInstigation._stats);
    await abilitiesDb.put(legacyInstigationKey, JSON.stringify(legacyInstigation));

    const existingA7001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI7001');
    const existingA7002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI7002');
    const existingA7003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI7003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI7001',
        name: 'Ruinous Allure',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-hold-levitate-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. For 1 minute, your words and posture carry dangerous attraction. Choose one creature within 60 feet that can see and hear you; it makes a Wisdom save. On a failure, until the end of your next turn it has disadvantage on Insight checks against you, and when it targets a creature other than you with an attack, reduce that attack roll by <strong>Potency</strong> (once per round).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Choose one additional target in range (separate save).</li><li><strong>+2 Spirituality:</strong> Failed targets also lose reactions until the start of their next turn.</li><li><strong>+4 Spirituality:</strong> On a failed save, a target becomes emotionally fixated for 1 minute (save ends at end of each turn): it cannot take Help, and you gain advantage on your first Deception, Intimidation, or Persuasion check against it each round.</li></ul><p><em>Counterplay:</em> Deafness, obscured sight, charm immunity, and disciplined formations blunt the pressure.</p><p><em>Corruption Hook:</em> If you exploit this to isolate and torment a non-threat, gain 1 Corruption.</p>',
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
              special: 'creature that can see and hear you'
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
          level: 2,
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
            assnSeq7Act001: buildActivity({
              id: 'assnSeq7Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-ruinous-allure',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 4, existingA7001?._stats),
        sort: 800000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI7002',
        name: 'Black Flame Kiss',
        type: 'spell',
        img: 'icons/magic/fire/flame-burning-fist-strike.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Launch spirit-burning black flame at one creature within 60 feet. Make a spell attack. On hit, deal fire damage equal to <strong>Potency</strong> and psychic damage equal to <strong>Potency</strong>. Until the start of your next turn, the target cannot become invisible, and if it is a spirit-form or projected body, it has disadvantage on concentration checks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 90 feet, and on hit the target cannot regain hit points until the start of your next turn.</li><li><strong>+2 Spirituality:</strong> On hit, flames spread to one creature within 10 feet of the original target for fire damage equal to <strong>Potency</strong> (Dexterity save halves).</li><li><strong>+4 Spirituality:</strong> On hit, the main target makes a Constitution save; on a failure it is <em>seared</em> for 1 minute (save ends each turn), taking psychic damage equal to Potency at the start of each turn.</li></ul><p><em>Counterplay:</em> Fire resistance, anti-magic suppression, and broken line of sight reduce pressure.</p><p><em>Corruption Hook:</em> If you burn a target purely to savor suffering after victory is secured, gain 1 Corruption.</p>',
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
          level: 2,
          school: 'evo',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a soot-stained silk thread',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq7Act002: buildActivity({
              id: 'assnSeq7Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-black-flame-kiss',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 5, existingA7002?._stats),
        sort: 800001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI7003',
        name: 'Mirror-Frost Veil',
        type: 'spell',
        img: 'icons/magic/water/projectile-icecicles-salvo.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you are targeted by an attack or forced to make a Dexterity save. A mirror-thin frost veil flashes around you. Gain <strong>+Potency</strong> AC against the triggering attack or <strong>+Potency</strong> on the triggering Dexterity save. Then move up to 10 feet to an unoccupied space you can see; this movement does not provoke opportunity attacks from the triggering source. The space you left becomes slick terrain until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Movement increases to 20 feet and you can move through one creature\'s space during this reaction.</li><li><strong>+2 Spirituality:</strong> Choose one creature adjacent to your previous space; it must pass a Dexterity save or fall prone.</li><li><strong>+4 Spirituality:</strong> You may leave a mirror-decoy in your previous space until the start of your next turn; the first attack against you before then has disadvantage as long as the attacker can see the decoy.</li></ul><p><em>Counterplay:</em> Blind-fight senses, area effects, and cramped spaces reduce the veil\'s reposition value.</p><p><em>Corruption Hook:</em> If you use this to bait bystanders into danger for spectacle, gain 1 Corruption.</p>',
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
            type: 'reaction',
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
          level: 2,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a shard of polished glass',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq7Act003: buildActivity({
              id: 'assnSeq7Act003',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-mirror-frost-veil',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 6, existingA7003?._stats),
        sort: 800002,
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
      legacyUpdated: [legacyPredatorKey, legacyInstigationKey],
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
