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
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Pleasure), Assassin pressure becomes tactile and invasive: thread control, black-flame internal disruption, and mirror-frost recovery under pursuit.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyWhisperKey = '!items!lotmAbilityI9002';
    const legacyAppraisalKey = '!items!lotmAbilityI8002';
    const legacyWhisper = await getOptionalJson(abilitiesDb, legacyWhisperKey);
    const legacyAppraisal = await getOptionalJson(abilitiesDb, legacyAppraisalKey);
    if (!legacyWhisper) throw new Error('Legacy target lotmAbilityI9002 not found.');
    if (!legacyAppraisal) throw new Error('Legacy target lotmAbilityI8002 not found.');

    const whisperHeader = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
    const whisperText =
      '<p>At Sequence 6, Barbed Whisper cuts deeper. ' +
      'When a target fails Barbed Whisper\'s save, it takes psychic damage equal to <strong>Potency</strong>. ' +
      'If you spent at least <strong>+2 Spirituality</strong>, that damage becomes <strong>2 x Potency</strong> for one failed target of your choice.</p>';
    const whisperDescription = String(legacyWhisper.system?.description?.value ?? '');
    if (!whisperDescription.includes(whisperHeader)) {
      legacyWhisper.system.description.value = `${whisperDescription}${whisperHeader}${whisperText}`;
    }
    legacyWhisper._stats = buildStats(now + 2, legacyWhisper._stats);
    await abilitiesDb.put(legacyWhisperKey, JSON.stringify(legacyWhisper));

    const appraisalHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const appraisalText =
      '<p>At Sequence 6, Malice Appraisal settles into second-nature reading. ' +
      'Once per short rest, you may activate Malice Appraisal without spending spirituality and without a save for one target that has damaged you since the end of your last turn. ' +
      'This free read lasts until the end of your next turn.</p>';
    const appraisalDescription = String(legacyAppraisal.system?.description?.value ?? '');
    if (!appraisalDescription.includes(appraisalHeader)) {
      legacyAppraisal.system.description.value = `${appraisalDescription}${appraisalHeader}${appraisalText}`;
    }
    legacyAppraisal._stats = buildStats(now + 3, legacyAppraisal._stats);
    await abilitiesDb.put(legacyAppraisalKey, JSON.stringify(legacyAppraisal));

    const existingA6001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI6001');
    const existingA6002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI6002');
    const existingA6003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI6003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI6001',
        name: 'Velvet Threads',
        type: 'spell',
        img: 'icons/magic/control/debuff-chains-ropes-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Project nearly invisible hair-threads at one creature within 60 feet. It makes a Dexterity save. On a failure, it is <em>thread-bound</em> until the end of your next turn: speed reduced by 10 feet and it cannot take the Dash action. While bound, the first time it moves voluntarily each round, it takes slashing damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature in range (separate save).</li><li><strong>+2 Spirituality:</strong> On a failed save, choose one: target drops a held item, or it cannot take reactions until the start of its next turn.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (save ends each turn), and you may drag one failed target up to 10 feet once per turn while it remains bound.</li></ul><p><em>Counterplay:</em> Teleportation, incorporeal movement, and cutting line effects reduce thread control value.</p><p><em>Corruption Hook:</em> If you bind a helpless target only to prolong humiliation, gain 1 Corruption.</p>',
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
          level: 3,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a braided lock of hair',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq6Act001: buildActivity({
              id: 'assnSeq6Act001',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-velvet-threads',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 4, existingA6001?._stats),
        sort: 700000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI6002',
        name: 'Sable Ember',
        type: 'spell',
        img: 'icons/magic/fire/flame-burning-hand.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Kindle a quiet black flame within one creature you can see within 60 feet. It makes a Constitution save. On a failure, it takes psychic damage equal to <strong>Potency</strong> and cannot benefit from invisibility until the start of your next turn. If it is under a curse or possession effect, it has disadvantage on checks to maintain that effect for 1 round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> The flame also deals fire damage equal to <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Choose one ongoing magical debuff on yourself or an ally within 30 feet; make a spellcasting check against the effect\'s DC. On success, suppress that effect until the end of your next turn.</li><li><strong>+4 Spirituality:</strong> On a failed save, the target is <em>hollow-burned</em> for 1 minute (save ends each turn), taking psychic damage equal to Potency at the start of its turn.</li></ul><p><em>Counterplay:</em> High-constitution foes and anti-fire/anti-psychic wards reduce effectiveness.</p><p><em>Corruption Hook:</em> If you burn through a target\'s mind for spectacle after surrender, gain 1 Corruption.</p>',
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
          level: 3,
          school: 'evo',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a pinch of black ash',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq6Act002: buildActivity({
              id: 'assnSeq6Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-sable-ember',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 5, existingA6002?._stats),
        sort: 700001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI6003',
        name: 'Glassheart Reprieve',
        type: 'spell',
        img: 'icons/magic/water/projectile-icecicles-salvo.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you take damage. Encase yourself in mirror-frost for an instant: reduce the triggering damage by <strong>Potency</strong>, then teleport up to 10 feet to a space you can see that contains reflective surface, ice, or polished metal within 5 feet. You leave a brittle shell in your prior space until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Damage reduction becomes <strong>2 x Potency</strong>.</li><li><strong>+2 Spirituality:</strong> The brittle shell bursts when struck or stepped on, forcing adjacent creatures to make a Dexterity save or take cold damage equal to Potency and have speed reduced by 10 feet until end of turn.</li><li><strong>+4 Spirituality:</strong> You may bring one willing adjacent ally when teleporting; both of you gain advantage on the next Dexterity save before the end of your next turn.</li></ul><p><em>Counterplay:</em> Antiteleport zones and reflection-poor environments limit reposition options.</p><p><em>Corruption Hook:</em> If you abandon allies to secure only your own escape when a shared retreat is viable, gain 1 Corruption.</p>',
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
          level: 3,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a mirrored bead',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq6Act003: buildActivity({
              id: 'assnSeq6Act003',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-glassheart-reprieve',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 6, existingA6003?._stats),
        sort: 700002,
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
      legacyUpdated: [legacyWhisperKey, legacyAppraisalKey],
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
