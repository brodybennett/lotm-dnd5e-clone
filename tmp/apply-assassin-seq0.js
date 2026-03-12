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
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Worldfall Mandate, Mirror World Sovereignty, Venomous Prophecy, Coronation of Chaos, plus two legacy upgrades (Apocalypse Overture and Withering Promise).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Demoness/Primordial Demoness), Assassin becomes a true calamity sovereign: disasters can be layered as social, structural, and environmental collapse while mirror-world rule enables omnidirectional predation and taunting fate-binding.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyOvertureKey = '!items!lotmAbilityI1001';
    const legacyPromiseKey = '!items!lotmAbilityI3004';
    const legacyOverture = await getOptionalJson(abilitiesDb, legacyOvertureKey);
    const legacyPromise = await getOptionalJson(abilitiesDb, legacyPromiseKey);
    if (!legacyOverture) throw new Error('Legacy target lotmAbilityI1001 not found.');
    if (!legacyPromise) throw new Error('Legacy target lotmAbilityI3004 not found.');

    const overtureHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const overtureText =
      '<p>At Sequence 0, Apocalypse Overture becomes a true prelude to worldfall. ' +
      'Creatures that fail its save by 5 or more gain a <em>doom brand</em> until end of your next turn: they take additional damage equal to <strong>Potency</strong> whenever they fail any saving throw. ' +
      'If Apocalypse Overture was cast with at least <strong>+4 Spirituality</strong>, one doom-branded target each round also loses resistance to one damage type you are dealing in that field until start of its next turn.</p>';
    const overtureDescription = String(legacyOverture.system?.description?.value ?? '');
    if (!overtureDescription.includes(overtureHeader)) {
      legacyOverture.system.description.value = `${overtureDescription}${overtureHeader}${overtureText}`;
    }
    legacyOverture._stats = buildStats(now + 2, legacyOverture._stats);
    await abilitiesDb.put(legacyOvertureKey, JSON.stringify(legacyOverture));

    const promiseHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const promiseText =
      '<p>At Sequence 0, Withering Promise can propagate through trust networks. ' +
      'When a creature fails against Withering Promise, choose up to two creatures within 15 feet that can hear and understand you; each must make a Wisdom save or suffer the baseline curse until end of your next turn. ' +
      'If the original cast spent at least <strong>+2 Spirituality</strong>, this propagation can occur once each round while the original target remains cursed.</p>';
    const promiseDescription = String(legacyPromise.system?.description?.value ?? '');
    if (!promiseDescription.includes(promiseHeader)) {
      legacyPromise.system.description.value = `${promiseDescription}${promiseHeader}${promiseText}`;
    }
    legacyPromise._stats = buildStats(now + 3, legacyPromise._stats);
    await abilitiesDb.put(legacyPromiseKey, JSON.stringify(legacyPromise));

    const existingA0001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI0001');
    const existingA0002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI0002');
    const existingA0003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI0003');
    const existingA0004 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI0004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI0001',
        name: 'Worldfall Mandate',
        type: 'spell',
        img: 'icons/magic/lightning/bolt-impact-cloud-to-ground.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (5 Spirituality):</strong> Action. Declare collapse over a 120-foot-radius area within 300 feet for 1 minute (concentration). Choose two catastrophe vectors: <em>storm shear</em>, <em>abyssal wildfire</em>, <em>seismic fracture</em>, or <em>panic cascade</em>. Creatures of your choice entering or starting in the area make a Constitution save. On failure, they take damage equal to <strong>3 x Potency</strong> of the vector type and suffer its rider until end of turn: no reactions (storm shear), healing received is halved (abyssal wildfire), speed becomes 0 until first save at end of turn (seismic fracture), or cannot benefit from Help/advantage granted by allies (panic cascade).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Radius becomes 180 feet.</li><li><strong>+6 Spirituality:</strong> Choose a third vector at cast time.</li><li><strong>+10 Spirituality:</strong> Once per round, force one structure or ongoing non-artifact area effect in the zone to make a GM-set stability check; on failure it is suppressed or collapses for 1 round.</li></ul><p><em>Counterplay:</em> anti-domain anchors, forced relocation, and saint-tier weather wards can blunt zone pressure.</p><p><em>Corruption Hook:</em> If used to annihilate neutral populations for prestige, gain 1 Corruption.</p>',
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
              special: 'catastrophe dominion'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
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
          level: 9,
          school: 'evo',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a cracked atlas bound in black silk',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq0Act001: buildActivity({
              id: 'assnSeq0Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-worldfall-mandate',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 4, existingA0001?._stats),
        sort: 100000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI0002',
        name: 'Mirror World Sovereignty',
        type: 'spell',
        img: 'icons/magic/perception/silhouette-stealth-shadow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Bonus action. Open mirror sovereignty for 10 minutes (concentration). Create up to nine sovereign reflections in reflective anchors within 300 feet. Once per round, you may originate one Assassin ability from any reflection and may exchange positions with one reflection as a free action. While active, attack rolls made against you have disadvantage if at least three reflections remain.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Reflections gain mirror-bite. A creature that destroys or passes through one makes a Wisdom save or takes psychic damage equal to <strong>Potency</strong> and is frightened until end of turn.</li><li><strong>+6 Spirituality:</strong> Once per round, pull one creature within 30 feet of a reflection into a mirror pocket until the end of its next turn (Wisdom save negates).</li><li><strong>+10 Spirituality:</strong> If you would be reduced to 0 hit points, consume three reflections to remain at 1 hit point, teleport to one consumed reflection\'s space, and end all charm/fear/restrained conditions on yourself.</li></ul><p><em>Counterplay:</em> reflection denial, anti-illusion sanctums, and effects that sever teleportation can dismantle this network.</p><p><em>Corruption Hook:</em> If used to stage terror theater in populated mirrors for pleasure, gain 1 Corruption.</p>',
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
            value: '10',
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'self',
              special: 'mirror sovereignty state'
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
          level: 9,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'nine mirror needles sealed in a perfume vial',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq0Act002: buildActivity({
              id: 'assnSeq0Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-mirror-world-sovereignty',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 5, existingA0002?._stats),
        sort: 100001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI0003',
        name: 'Venomous Prophecy',
        type: 'spell',
        img: 'icons/magic/unholy/strike-body-life-soul-purple.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Action. Deliver a taunting double-meaning prophecy to up to three creatures within 180 feet that can hear and understand you. Each target makes a Wisdom save. On failure, it is marked for 7 days with five <em>ruin tallies</em>. Once per round when a marked creature fails a d20 test, attempts to aid an ally, or receives assistance, it loses one tally and suffers one mishap of your choice: psychic damage equal to <strong>2 x Potency</strong>, lose reactions until end of turn, or disadvantage on its next saving throw before end of turn. When the final tally is removed, the creature becomes <em>doom-sick</em> until end of its next turn and cannot benefit from advantage.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Mark up to two additional targets (separate saves).</li><li><strong>+6 Spirituality:</strong> Duration becomes 30 days and each target\'s mark may transfer once to a creature within 15 feet when it succeeds a save against your abilities.</li><li><strong>+10 Spirituality:</strong> Once per cast, when a marked target critically fails any d20 roll, it takes psychic damage equal to <strong>4 x Potency</strong> and is stunned until end of turn.</li></ul><p><em>Counterplay:</em> curse cleansing rites, anti-omen wards, and communication denial can neutralize this prophecy chain.</p><p><em>Corruption Hook:</em> Marking households or faithful allies for entertainment adds 1 Corruption.</p>',
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
            value: '168',
            units: 'hour'
          },
          target: {
            affects: {
              choice: false,
              count: '3',
              type: 'creature',
              special: 'creatures that can hear and understand you'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
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
          level: 9,
          school: 'nec',
          properties: ['vocal'],
          materials: {
            value: 'a ribbon sewn with a broken oath',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq0Act003: buildActivity({
              id: 'assnSeq0Act003',
              activationType: 'action',
              durationUnits: 'hour'
            })
          },
          identifier: 'lotm-assassin-venomous-prophecy',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 6, existingA0003?._stats),
        sort: 100002,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI0004',
        name: 'Coronation of Chaos',
        type: 'spell',
        img: 'icons/magic/control/fear-fright-monster-grin-red-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Action. Crown yourself as the only reliable liar in a 100-foot-radius zone within 240 feet for 1 minute (concentration). Creatures of your choice in the zone make a Wisdom save when they enter or start their turn there. On failure, they are paranoia-struck until end of turn: they cannot use Help, have disadvantage on Insight and Persuasion checks, and treat allies as lightly obscured for targeting decisions.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+3 Spirituality:</strong> Radius becomes 150 feet.</li><li><strong>+6 Spirituality:</strong> A target that fails by 5 or more must use its reaction to make one attack against the nearest creature it distrusts (if valid target exists).</li><li><strong>+10 Spirituality:</strong> Once per round, choose one hostile organized group in the zone. It makes a group Wisdom check; on failure, it loses coordinated tactics until your next turn (no shared advantage, no combo riders, no command-triggered movement).</li></ul><p><em>Counterplay:</em> charm/fear immunity, disciplined command channels, and anti-emotion fields can stabilize formations.</p><p><em>Corruption Hook:</em> Escalating peace talks into massacre to savor control adds 1 Corruption.</p>',
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
              special: 'social catastrophe court'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '240',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 9,
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
            assnSeq0Act004: buildActivity({
              id: 'assnSeq0Act004',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-coronation-of-chaos',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 7, existingA0004?._stats),
        sort: 100003,
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
      legacyUpdated: [legacyOvertureKey, legacyPromiseKey],
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
