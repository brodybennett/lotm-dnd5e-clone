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
    if (!pathway) throw new Error('Assassin pathway (lotmPathway00012) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> seductive predation through shadowed mobility, emotional leverage, and taunting confidence that turns hesitation into openings.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Predator\'s Footwork, Barbed Whisper.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Instigation, Malice Appraisal, plus one legacy scope upgrade to Barbed Whisper.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Instigator), Assassin expands from personal huntcraft into directed social violence, lighting emotional fuses while remaining mobile and hard to pin down.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = '!items!lotmAbilityI9002';
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityI9002 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, your barbed language carries into nearby fault lines. ' +
      'When you cast Barbed Whisper with at least <strong>+1 Spirituality</strong> and a target fails its save, ' +
      'choose one additional creature within 10 feet of that target that can hear and understand you. ' +
      'That second creature must make its own save against the same selected baseline effect. ' +
      'Once per short rest, you may apply this second-target rider without paying the +1 surcharge.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI8001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI8002');

    const abilities = [
      {
        _id: 'lotmAbilityI8001',
        name: 'Instigation',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-hold-levitate-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 60 feet that can hear and understand you. It makes a Wisdom save. On a failure, until the end of your next turn it cannot take the Help action, has disadvantage on Insight checks against your speech, and the first time another creature within 30 feet damages it this round, it must use its reaction to make one weapon attack against that creature (or move up to 10 feet toward it if no legal attack is possible).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature within range (separate saves).</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; each affected target may repeat the save at the end of each of its turns, ending the effect on a success.</li><li><strong>+4 Spirituality:</strong> On initial failed save, target also takes psychic damage equal to <strong>Potency</strong>, and while affected it has disadvantage on Charisma checks made to de-escalate conflict.</li></ul><p><em>Counterplay:</em> Deafness, language barriers, emotion-suppressing effects, and disciplined formations blunt this ability.</p><p><em>Corruption Hook:</em> If you trigger mass violence where no strategic objective exists, gain 1 Corruption.</p>',
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
          level: 1,
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
            assnSeq8Act001: buildActivity({
              id: 'assnSeq8Act001',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-instigation',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 3, existingAbility1?._stats),
        sort: 900000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI8002',
        name: 'Malice Appraisal',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Read one creature within 60 feet that you can see. It makes a Wisdom save. On a failure, for 1 minute you discern its dominant immediate hostility, desire, or fear. While this read persists, you gain advantage on Deception, Insight, Intimidation, or Persuasion checks against it, and the first attack it makes against you each round takes a penalty of <strong>-1</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Read up to three creatures in range (separate saves).</li><li><strong>+2 Spirituality:</strong> Against a read target, your first saving throw each round gains <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> When a read target fails an attack against you, you may use your reaction to move up to 10 feet without provoking opportunity attacks from that target, and your next social check against that target before end of turn gains <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> Creatures with unreadable minds, mind-blank effects, or blocked line of sight negate this read.</p><p><em>Corruption Hook:</em> If you exploit an intimate fear revealed by this ability for cruelty rather than objective, gain 1 Corruption.</p>',
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
              special: 'creature you can see'
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
          school: 'div',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a drop of bitter perfume',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq8Act002: buildActivity({
              id: 'assnSeq8Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-malice-appraisal',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 4, existingAbility2?._stats),
        sort: 900001,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilities) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: legacyKey,
      abilitiesWritten: abilities.map((doc) => `!items!${doc._id}`),
      mapping: abilities.map((doc) => ({
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
