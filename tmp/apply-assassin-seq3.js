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
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Unaging), Assassin turns battlefield presence into death-defying mirror authority, sustained predation, and irresistible curses masked as intimate conversation.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyMirrorKey = '!items!lotmAbilityI4003';
    const legacyNeedleKey = '!items!lotmAbilityI5002';
    const legacyMirror = await getOptionalJson(abilitiesDb, legacyMirrorKey);
    const legacyNeedle = await getOptionalJson(abilitiesDb, legacyNeedleKey);
    if (!legacyMirror) throw new Error('Legacy target lotmAbilityI4003 not found.');
    if (!legacyNeedle) throw new Error('Legacy target lotmAbilityI5002 not found.');

    const mirrorHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const mirrorText =
      '<p>At Sequence 3, Mirror Procession can host your true predatory posture. ' +
      'When Mirror Procession is active, you may designate one image as your <em>anchor reflection</em>. ' +
      'Once per round, you can speak or cast a charm/curse ability as though originating from that anchor image. ' +
      'If you spent at least <strong>+2 Spirituality</strong> when creating Mirror Procession, the anchor may be reassigned to another surviving image as a free action once per round.</p>';
    const mirrorDescription = String(legacyMirror.system?.description?.value ?? '');
    if (!mirrorDescription.includes(mirrorHeader)) {
      legacyMirror.system.description.value = `${mirrorDescription}${mirrorHeader}${mirrorText}`;
    }
    legacyMirror._stats = buildStats(now + 2, legacyMirror._stats);
    await abilitiesDb.put(legacyMirrorKey, JSON.stringify(legacyMirror));

    const needleHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    const needleText =
      '<p>At Sequence 3, Needle Tresses advance toward true stone-shearing control. ' +
      'When Needle Tresses hits, the target gains one <em>calcification mark</em> until end of your next turn. ' +
      'At 2 marks, it suffers disadvantage on Dexterity saves. At 3 marks, it is <strong>restrained</strong> until end of turn. ' +
      'If you spent at least <strong>+2 Spirituality</strong> on the cast, a target reaching 3 marks also takes necrotic damage equal to <strong>Potency</strong>.</p>';
    const needleDescription = String(legacyNeedle.system?.description?.value ?? '');
    if (!needleDescription.includes(needleHeader)) {
      legacyNeedle.system.description.value = `${needleDescription}${needleHeader}${needleText}`;
    }
    legacyNeedle._stats = buildStats(now + 3, legacyNeedle._stats);
    await abilitiesDb.put(legacyNeedleKey, JSON.stringify(legacyNeedle));

    const existingA3001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI3001');
    const existingA3002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI3002');
    const existingA3003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI3003');
    const existingA3004 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI3004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI3001',
        name: 'Mirror Persona',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Conjure one predatory mirror persona in a reflective surface within 120 feet for 10 minutes (concentration). While it persists, you can perceive from its location and treat it as the origin for one Assassin charm, curse, or social-control ability each round. Once per round, as a bonus action, you may swap positions with it if both spaces are on solid ground.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Create one additional persona (max 2); choose which persona is your casting origin each round.</li><li><strong>+2 Spirituality:</strong> A creature that fails a save against one of your abilities originating from a persona also takes psychic damage equal to <strong>Potency</strong> (once per round).</li><li><strong>+4 Spirituality:</strong> If you would be reduced to 0 hit points while at least one persona remains, shatter one persona to remain at 1 hit point, teleport to that persona\'s space, and end Mirror Persona.</li></ul><p><em>Counterplay:</em> destroying reflective anchors, anti-teleport seals, and effects that block line of sight shut down projection routes.</p><p><em>Corruption Hook:</em> If you use personas to humiliate powerless civilians as performance, gain 1 Corruption.</p>',
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
            value: '10',
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'space',
              special: 'reflective anchor point'
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
          level: 6,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a silvered shard kissed with blood',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq3Act001: buildActivity({
              id: 'assnSeq3Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-mirror-persona',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 4, existingA3001?._stats),
        sort: 400000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI3002',
        name: 'Predatory Rebirth',
        type: 'spell',
        img: 'icons/magic/death/undead-shadow-skull-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Reaction, triggered when you are reduced to 0 hit points and a reflective surface is within 30 feet. Your body collapses into a dead mirror shell while your true self steps into reflection. At the start of your next turn, reappear in that reflective space with 1 hit point and immediately move up to 15 feet without provoking opportunity attacks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Reappear with temporary hit points equal to <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> End one of the following conditions on reappearance: charmed, frightened, or restrained.</li><li><strong>+4 Spirituality:</strong> Leave a dying mirror phantom in your previous space for 1 round; attackers that strike it must pass a Wisdom save or take psychic damage equal to <strong>Potency</strong> and lose reactions until the start of their next turn.</li></ul><p><em>Counterplay:</em> shattering nearby mirrors first, anti-resurrection fields, and spirit-severing effects can prevent trigger resolution.</p><p><em>Corruption Hook:</em> Repeatedly using false death to terrorize allies erodes empathy; each abusive use can add 1 Corruption.</p>',
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
            condition: 'when reduced to 0 hit points with reflective surface nearby',
            value: null
          },
          duration: {
            value: '1',
            units: 'round'
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
          level: 6,
          school: 'nec',
          properties: ['somatic'],
          materials: {
            value: 'a hand mirror wrapped in black silk',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq3Act002: buildActivity({
              id: 'assnSeq3Act002',
              activationType: 'reaction',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-assassin-predatory-rebirth',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 5, existingA3002?._stats),
        sort: 400001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI3003',
        name: 'Stoneheart Enticement',
        type: 'spell',
        img: 'icons/magic/control/debuff-chains-ropes-purple.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose one creature within 90 feet that can see and hear you. It makes a Wisdom save. On a failure, it is charmed by your taunting invitation until end of your next turn and gains one <em>stone-mark</em>. At the start of each of your turns while it remains charmed, it makes a Constitution save; on failure it gains another stone-mark (max 3). At 2 marks, speed is reduced by 15 feet. At 3 marks, the target is <strong>restrained</strong> until the end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature (separate saves).</li><li><strong>+2 Spirituality:</strong> A failed initial Wisdom save also removes the target\'s reactions until start of its next turn.</li><li><strong>+4 Spirituality:</strong> A target that reaches 3 stone-marks must make an immediate Constitution save; on failure it becomes <strong>petrified</strong> until the end of your next turn.</li></ul><p><em>Counterplay:</em> charm immunity, line-of-sight denial, and purification effects that remove petrification pressure can break the escalation.</p><p><em>Corruption Hook:</em> If you deliberately petrify captives for aesthetic cruelty, gain 1 Corruption.</p>',
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
            units: 'inst'
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
            value: '90',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 6,
          school: 'enc',
          properties: ['vocal'],
          materials: {
            value: 'powdered marble mixed with perfume',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq3Act003: buildActivity({
              id: 'assnSeq3Act003',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-assassin-stoneheart-enticement',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 6, existingA3003?._stats),
        sort: 400002,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI3004',
        name: 'Withering Promise',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-snare-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Deliver a double-edged statement to one creature within 60 feet that can hear and understand you. It makes a Wisdom save. On a failure, it is cursed for 1 minute (save ends at end of each of its turns): the first time each round it targets an ally with a beneficial effect or uses the Help action, it instead takes psychic damage equal to <strong>Potency</strong> and suffers disadvantage on its next attack roll or ability check before end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature in range (separate save).</li><li><strong>+2 Spirituality:</strong> Failed targets also have disadvantage on Insight checks and cannot benefit from advantage granted by allies until the start of your next turn.</li><li><strong>+4 Spirituality:</strong> Once per round when a cursed target fails a save against one of your charm, plague, or petrification effects, you regain 1 spent Spirituality (max once per cast).</li></ul><p><em>Counterplay:</em> silence, language barriers, and curse-cleansing rituals can cut this off early.</p><p><em>Corruption Hook:</em> If you seed this curse into family or ally bonds for entertainment, gain 1 Corruption.</p>',
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
          level: 6,
          school: 'nec',
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
            assnSeq3Act004: buildActivity({
              id: 'assnSeq3Act004',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-withering-promise',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 7, existingA3004?._stats),
        sort: 400003,
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
      legacyUpdated: [legacyMirrorKey, legacyNeedleKey],
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
