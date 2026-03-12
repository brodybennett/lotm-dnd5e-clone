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
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Mirror Persona, Predatory Rebirth, Stoneheart Enticement, Withering Promise, plus two legacy upgrades (Mirror Procession and Needle Tresses).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Cataclysm Waltz, Mirror Ruin Court, Cursed Refrain, Glacial Inferno, plus two legacy upgrades (Mirror Persona and Sapping Plague).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Apocalypse Overture, Ninefold Mirror Host, Ruinous Prophecy, Panic Coronation, plus two legacy upgrades (Cataclysm Waltz and Withering Promise).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Apocalypse), Assassin evolves from regional catastrophe into angel-tier collapse orchestration: ninefold mirror pressure, weather-and-system fault exploitation, and destiny-grade double-meaning curses.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyCataclysmKey = '!items!lotmAbilityI2001';
    const legacyPromiseKey = '!items!lotmAbilityI3004';
    const legacyCataclysm = await getOptionalJson(abilitiesDb, legacyCataclysmKey);
    const legacyPromise = await getOptionalJson(abilitiesDb, legacyPromiseKey);
    if (!legacyCataclysm) throw new Error('Legacy target lotmAbilityI2001 not found.');
    if (!legacyPromise) throw new Error('Legacy target lotmAbilityI3004 not found.');

    const cataclysmHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const cataclysmText =
      '<p>At Sequence 1, Cataclysm Waltz can be threaded into multi-point failure. ' +
      'When you cast Cataclysm Waltz with at least <strong>+2 Spirituality</strong>, create a second linked zone within 120 feet of the first (half radius). ' +
      'Once per round, you may trigger one pulse event from each zone. ' +
      'A creature that fails saves against both zones in the same round takes additional psychic damage equal to <strong>Potency</strong>.</p>';
    const cataclysmDescription = String(legacyCataclysm.system?.description?.value ?? '');
    if (!cataclysmDescription.includes(cataclysmHeader)) {
      legacyCataclysm.system.description.value = `${cataclysmDescription}${cataclysmHeader}${cataclysmText}`;
    }
    legacyCataclysm._stats = buildStats(now + 2, legacyCataclysm._stats);
    await abilitiesDb.put(legacyCataclysmKey, JSON.stringify(legacyCataclysm));

    const promiseHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const promiseText =
      '<p>At Sequence 1, Withering Promise becomes second-nature predatory timing. ' +
      'Once per round, when a creature within 60 feet takes the Help action, attempts to comfort an ally, or grants advantage to another creature, ' +
      'you may cast Withering Promise as a <strong>reaction</strong> at baseline spirituality cost. ' +
      'If that reaction cast lands, reduce the first upcast surcharge you apply to it by <strong>1</strong> (minimum 0).</p>';
    const promiseDescription = String(legacyPromise.system?.description?.value ?? '');
    if (!promiseDescription.includes(promiseHeader)) {
      legacyPromise.system.description.value = `${promiseDescription}${promiseHeader}${promiseText}`;
    }
    legacyPromise._stats = buildStats(now + 3, legacyPromise._stats);
    await abilitiesDb.put(legacyPromiseKey, JSON.stringify(legacyPromise));

    const existingA1001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI1001');
    const existingA1002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI1002');
    const existingA1003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI1003');
    const existingA1004 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI1004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI1001',
        name: 'Apocalypse Overture',
        type: 'spell',
        img: 'icons/magic/lightning/bolt-impact-cloud-to-ground.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Action. Open a 60-foot catastrophe field centered on a point within 180 feet for 1 minute (concentration). Choose two vectors when cast: <em>storm shear</em>, <em>collapse seam</em>, or <em>panic fracture</em>. Creatures of your choice entering or starting their turn in the field make a Constitution save. On failure, they take damage equal to <strong>3 x Potency</strong> (lightning for storm shear, bludgeoning for collapse seam, psychic for panic fracture) and suffer that vector\'s rider until end of turn: no reactions (storm shear), prone on first voluntary movement (collapse seam), or no Help action and disadvantage on Insight checks (panic fracture).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 90 feet.</li><li><strong>+4 Spirituality:</strong> Failed creatures suffer two chosen vectors instead of one.</li><li><strong>+8 Spirituality:</strong> Once per round, designate one structure or ongoing non-artifact area effect in the field. It must pass a GM-set stability check or be suppressed/collapsed for 1 round.</li></ul><p><em>Counterplay:</em> anti-weather bulwarks, rapid repositioning, and structural stabilizers can blunt the overture.</p><p><em>Corruption Hook:</em> If you invoke this against civilian districts only to display authority, gain 1 Corruption.</p>',
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
              special: 'catastrophe field'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '180',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 8,
          school: 'evo',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a cracked weather map traced with perfumed ink',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq1Act001: buildActivity({
              id: 'assnSeq1Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-apocalypse-overture',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 4, existingA1001?._stats),
        sort: 200000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI1002',
        name: 'Ninefold Mirror Host',
        type: 'spell',
        img: 'icons/magic/perception/silhouette-stealth-shadow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Bonus action. For 1 minute (concentration), split into three mirror selves anchored in reflective surfaces within 120 feet. Each round, you may originate one Assassin ability from any self, and once per round you may exchange positions with one self as a free action. Enemies have disadvantage on opportunity attacks against your movement while any mirror self remains.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Increase maximum selves to five.</li><li><strong>+4 Spirituality:</strong> Increase maximum selves to nine. When a self is destroyed, creatures within 5 feet of it make a Wisdom save or take psychic damage equal to <strong>Potency</strong>.</li><li><strong>+8 Spirituality:</strong> If you would be reduced to 0 hit points, consume two active selves to remain at 1 hit point, teleport to one consumed self\'s space, and immediately end one charm, fear, or restraint on yourself.</li></ul><p><em>Counterplay:</em> reflection denial, anti-illusion sanctums, and wide-area blind zones can collapse the host network.</p><p><em>Corruption Hook:</em> using mirror selves to stage false massacres purely to break morale adds 1 Corruption.</p>',
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
              special: 'mirror-host state'
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
          level: 8,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'nine slivers from a broken dressing mirror',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq1Act002: buildActivity({
              id: 'assnSeq1Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-ninefold-mirror-host',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 5, existingA1002?._stats),
        sort: 200001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI1003',
        name: 'Ruinous Prophecy',
        type: 'spell',
        img: 'icons/magic/unholy/strike-body-life-soul-purple.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Action. Speak a double-meaning promise to one creature within 120 feet that can hear and understand you. The target makes a Wisdom save. On a failure, it is marked for 24 hours with three <em>ruin tallies</em>. Once per round when the marked target fails a d20 test or benefits from an ally\'s support action, it loses one tally and you choose one mishap: psychic damage equal to <strong>2 x Potency</strong>, lose reactions until end of turn, or disadvantage on its next saving throw before end of turn. When the last tally is removed, the target suffers <strong>catastrophic hesitation</strong> until end of its next turn (cannot benefit from advantage).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Duration becomes 7 days and the mark can transfer once to a creature within 15 feet of the marked target when it succeeds a save against one of your abilities.</li><li><strong>+4 Spirituality:</strong> Mark up to two additional creatures (separate saves).</li><li><strong>+8 Spirituality:</strong> Once per cast, when a marked creature critically fails any d20 test, it takes psychic damage equal to <strong>3 x Potency</strong> and is stunned until end of turn.</li></ul><p><em>Counterplay:</em> curse cleansing, silence or language barriers, and omen-ward rituals can strip the prophecy.</p><p><em>Corruption Hook:</em> planting ruin marks in families or lovers for sport adds 1 Corruption.</p>',
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
            value: '24',
            units: 'hour'
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
            value: '120',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 8,
          school: 'nec',
          properties: ['vocal'],
          materials: {
            value: 'a ribbon inked with a broken vow',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq1Act003: buildActivity({
              id: 'assnSeq1Act003',
              activationType: 'action',
              durationUnits: 'hour'
            })
          },
          identifier: 'lotm-assassin-ruinous-prophecy',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 6, existingA1003?._stats),
        sort: 200002,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI1004',
        name: 'Panic Coronation',
        type: 'spell',
        img: 'icons/magic/control/fear-fright-monster-grin-red-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Action. Proclaim yourself the safest liar in the room, seeding social catastrophe in a 50-foot-radius zone within 150 feet for 1 minute (concentration). Creatures of your choice in the zone make a Wisdom save when they enter or start their turn there. On a failure, they are <em>paranoia-struck</em> until end of turn: they cannot use Help, have disadvantage on Persuasion and Insight checks, and if an ally misses an attack near them, they must spend 10 feet of movement away from that ally if able.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 80 feet.</li><li><strong>+4 Spirituality:</strong> A creature that fails by 5 or more must use its reaction to make one weapon attack against the nearest creature it distrusts (GM adjudicates if no valid target).</li><li><strong>+8 Spirituality:</strong> Once per round, choose one organized hostile group in the zone (squad, cell, cult team). It must pass a group Wisdom check or lose coordinated tactics until your next turn (no shared advantage, no combo triggers).</li></ul><p><em>Counterplay:</em> immunity to charm/fear, disciplined command channels, and anti-emotion fields can stabilize formations.</p><p><em>Corruption Hook:</em> escalating peaceful negotiations into bloodshed purely to enjoy control adds 1 Corruption.</p>',
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
              special: 'social-collapse zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '150',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 8,
          school: 'enc',
          properties: ['vocal', 'concentration'],
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
            assnSeq1Act004: buildActivity({
              id: 'assnSeq1Act004',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-panic-coronation',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 7, existingA1004?._stats),
        sort: 200003,
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
      legacyUpdated: [legacyCataclysmKey, legacyPromiseKey],
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
