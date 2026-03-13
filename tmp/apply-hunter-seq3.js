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
    const pathwayKey = '!items!lotmPathway00013';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Hunter pathway (lotmPathway00013) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> relentless battlefield pursuit through predatory senses, prepared kill zones, and command-by-pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Killzone Instinct, Scorchline Trapcraft.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Incendiary Taunt, Warline Rally, plus one legacy scope upgrade to Killzone Instinct.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Fire Raven Volley, Wall of Fire, Blazing Spear, plus two legacy upgrades (Killzone Instinct and Incendiary Taunt).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Crossfire Conspiracy, Kindling Edict, Feigned Retreat, plus two legacy upgrades (Scorchline Trapcraft and Warline Rally).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Weakness Survey, Cull, Precision Barrage, plus two legacy upgrades (Fire Raven Volley and Crossfire Conspiracy).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Iron-Blooded Courage, Augmented Armament, Galvanized Body, Calamity Giant Form, plus two legacy upgrades (Cull and Crossfire Conspiracy).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Chain of Command, Fogfront Dominion, Provocation Decree, Siegefire Homily, plus two legacy upgrades (Iron-Blooded Courage and Crossfire Conspiracy).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (War Bishop), Hunter evolves from personal iron-blood pressure into formation-scale battle authority: command relays, fog-shaped engagement control, and fiery decrees that force enemy lines to break.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyIronKey = '!items!lotmAbilityH4001';
    const legacyCrossfireKey = '!items!lotmAbilityH6001';
    const legacyIron = await getOptionalJson(abilitiesDb, legacyIronKey);
    const legacyCrossfire = await getOptionalJson(abilitiesDb, legacyCrossfireKey);
    if (!legacyIron) throw new Error('Legacy target lotmAbilityH4001 not found.');
    if (!legacyCrossfire) throw new Error('Legacy target lotmAbilityH6001 not found.');

    const ironHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const ironText =
      '<p>At Sequence 3, Iron-Blooded Courage can propagate through your command web. ' +
      'While <em>Chain of Command</em> is active, linked allies can relay Iron-Blooded Courage benefits as secondary aura nodes (one relay hop, max 60 feet from you). ' +
      'A creature can benefit from only one relayed instance per round. ' +
      'If Iron-Blooded Courage was cast with at least <strong>+2 Spirituality</strong>, the first enemy frightened by that aura each round also has speed reduced by 10 feet until end of its next turn.</p>';
    const ironDescription = String(legacyIron.system?.description?.value ?? '');
    if (!ironDescription.includes(ironHeader)) {
      legacyIron.system.description.value = `${ironDescription}${ironHeader}${ironText}`;
    }
    legacyIron._stats = buildStats(now + 2, legacyIron._stats);
    await abilitiesDb.put(legacyIronKey, JSON.stringify(legacyIron));

    const crossfireHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const crossfireText =
      '<p>At Sequence 3, Crossfire Conspiracy becomes drilled battlefield reflex. ' +
      'Once per round, the first ally movement granted by Crossfire does not consume that ally\'s reaction. ' +
      'If you cast Crossfire Conspiracy with at least <strong>+2 Spirituality</strong>, you may immediately apply Weakness Survey to one triggered creature without spending an additional action (still follows Weakness Survey targeting limits).</p>';
    const crossfireDescription = String(legacyCrossfire.system?.description?.value ?? '');
    if (!crossfireDescription.includes(crossfireHeader)) {
      legacyCrossfire.system.description.value = `${crossfireDescription}${crossfireHeader}${crossfireText}`;
    }
    legacyCrossfire._stats = buildStats(now + 3, legacyCrossfire._stats);
    await abilitiesDb.put(legacyCrossfireKey, JSON.stringify(legacyCrossfire));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH3001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH3002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH3003');
    const existingAbility4 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH3004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH3001',
        name: 'Chain of Command',
        type: 'spell',
        img: 'icons/tools/flags/banner-standard-red.webp',
        system: {
          description: {
            value: `<p><strong>Baseline (1 Spirituality):</strong> Action. Forge a command chain with up to 3 willing allies within 120 feet who can hear you for 10 minutes (concentration). Once per round, designate one hostile creature seen by any linked ally. The first linked ally to hit that creature each round adds <strong>+1 fire damage</strong>, and one other linked ally may move up to 10 feet without provoking opportunity attacks from it.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Link one additional ally.</li><li><strong>+2 Spirituality:</strong> If a designated target is hit by 2+ linked allies in the same round, it takes fire damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Once per round when you hit the designated target, one linked ally may use a reaction to make one weapon attack against it.</li></ul><p><em>Counterplay:</em> deafness, silence, and forced separation from command range can break chain efficiency.</p><p><em>Corruption Hook:</em> if you treat allies as disposable chess pieces for ego rather than victory, gain 1 Corruption.</p>`,
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
              count: '3',
              type: 'ally',
              special: 'willing allies that can hear you'
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
          school: 'enc',
          properties: ['vocal', 'concentration'],
          materials: {
            value: 'a strip of scorched command pennant',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq3Act001: buildActivity({
              id: 'hunterSeq3Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-chain-of-command',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900600,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH3002',
        name: 'Fogfront Dominion',
        type: 'spell',
        img: 'icons/magic/air/fog-gas-smoke-dense-gray.webp',
        system: {
          description: {
            value: `<p><strong>Baseline (1 Spirituality):</strong> Action. Raise a 30-foot-radius battlefield fog centered on a point within 90 feet for 1 minute (concentration). Creatures inside are heavily obscured to enemies farther than 15 feet away, and ranged attacks that cross the fog boundary are made with disadvantage. Allies linked by Chain of Command ignore this penalty. Once per round, you may treat one linked ally inside the fog as your origin point for line-of-sight checks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 40 feet.</li><li><strong>+2 Spirituality:</strong> Create a second 15-foot-radius fog pocket within 30 feet of the main zone, or move the main zone up to 10 feet at start of your turn.</li><li><strong>+4 Spirituality:</strong> Enemies that enter or start turn in fog must pass a Wisdom save or lose <strong>reactions</strong> until end of their next turn.</li></ul><p><em>Counterplay:</em> strong wind, anti-concealment effects, and elevation control can reduce fog dominance.</p><p><em>Corruption Hook:</em> if you use fog cover to burn civilians while denying evacuation, gain 1 Corruption.</p>`,
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
              special: 'center point for a 30-foot-radius fog zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'ash from three separate campfires',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq3Act002: buildActivity({
              id: 'hunterSeq3Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-fogfront-dominion',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900601,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH3003',
        name: 'Provocation Decree',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-snare-red.webp',
        system: {
          description: {
            value: `<p><strong>Baseline (1 Spirituality):</strong> Action. Issue a domineering war decree to up to 3 hostile creatures within 60 feet that can hear you. Each target makes a Wisdom save. On failure, you choose one effect: it must move up to half its speed toward a frontline space you designate, or it has disadvantage on its next attack roll that does not include one target you nominate. A target can only be forced-moved this way once per round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect two additional creatures.</li><li><strong>+2 Spirituality:</strong> Failed save also deals fire damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Failed creatures also cannot take <strong>reactions</strong> and have speed reduced by 10 feet until end of their next turn.</li></ul><p><em>Counterplay:</em> creatures immune to charm/fear-like command pressure, deafness, and magical silence reduce decree impact.</p><p><em>Corruption Hook:</em> if you repeatedly use decrees to incite pointless massacres, gain 1 Corruption.</p>`,
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
              special: 'hostile creatures that can hear you'
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
          school: 'enc',
          properties: ['vocal'],
          materials: {
            value: 'a brass whistle blackened by flame',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq3Act003: buildActivity({
              id: 'hunterSeq3Act003',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-provocation-decree',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900602,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH3004',
        name: 'Siegefire Homily',
        type: 'spell',
        img: 'icons/magic/fire/explosion-embers-evade-silhouette.webp',
        system: {
          description: {
            value: `<p><strong>Baseline (2 Spirituality):</strong> Action. Consecrate a 15-foot-radius siegefire district centered on a point within 120 feet for 1 minute (concentration). When created and at the start of each of your turns, choose up to <strong>Potency</strong> creatures in the zone. Chosen enemies make a Dexterity save; on failure they take fire damage equal to <strong>Potency</strong> and have speed reduced by 10 feet until start of your next turn. Allies in the zone can choose to gain +1 weapon damage this round, then take 1 fire damage at end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 20 feet.</li><li><strong>+2 Spirituality:</strong> Enemies that fail while marked by Weakness Survey or Crossfire Conspiracy are also knocked <strong>prone</strong>.</li><li><strong>+4 Spirituality:</strong> Once during duration, detonate the district; creatures in zone make a Constitution save or take fire damage equal to <strong>2 x Potency</strong> and become <strong>frightened</strong> of your line until end of their next turn.</li></ul><p><em>Backlash:</em> each cast requires a discipline check; on failure, gain one stage of reckless-war impulse until short rest.</p><p><em>Counterplay:</em> spread formations, concentration breaks, and forced relocation can blunt district pressure.</p>`,
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
              special: 'a 15-foot-radius district point'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'evc',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a bishop-marked iron censer filled with coal dust',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq3Act004: buildActivity({
              id: 'hunterSeq3Act004',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-siegefire-homily',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
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
        _stats: buildStats(now + 7, existingAbility4?._stats),
        sort: 900603,
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
      legacyUpdated: [legacyIronKey, legacyCrossfireKey],
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      grantedSequenceMapping: abilityDocs.map((doc) => ({
        id: doc._id,
        grantedSequence: doc.flags?.lotm?.grantedSequence ?? null,
        systemLevel: doc.system?.level ?? null,
        sourceClass: doc.system?.sourceClass ?? null,
        identifier: doc.system?.identifier ?? null
      }))
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
