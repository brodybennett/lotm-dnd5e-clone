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
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Tempest Muster, Cataclysm Front, Fog of War Ascendant, Meteoric Descent, plus two legacy upgrades (Chain of Command and Weakness Survey).</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Casting Soldiers, Conquest Will, War Commander Banner, Spear of Destruction, plus two legacy upgrades (Tempest Muster and Weakness Survey).</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Lord of War, Conquest Dominion, Astral Fog of War, Termination Spear, plus two legacy upgrades (Spear of Destruction and Weakness Survey).</p>' +
      '<p><strong>Sequence Track Status:</strong> Authored through Sequence 0 (complete standard pathway progression).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Red Priest), battlefield command becomes planetary conquest authority: the line can share power across war formations, convert conquered space into soldier-ground, sever mystical targeting via astral fog, and deliver destruction strikes that terminate escape continuity.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacySpearKey = '!items!lotmAbilityH1004';
    const legacyWeaknessKey = '!items!lotmAbilityH5001';
    const legacySpear = await getOptionalJson(abilitiesDb, legacySpearKey);
    const legacyWeakness = await getOptionalJson(abilitiesDb, legacyWeaknessKey);
    if (!legacySpear) throw new Error('Legacy target lotmAbilityH1004 not found.');
    if (!legacyWeakness) throw new Error('Legacy target lotmAbilityH5001 not found.');

    const spearHeader = '<h3>Legacy Upgrade (Sequence 0 - Efficiency)</h3>';
    const spearText =
      '<p>At Sequence 0, Spear of Destruction can be issued through the war network instead of personal line-only execution. ' +
      'Once per round, if a target is marked by Weakness Survey or constrained by Astral Fog of War, you may reduce Spear of Destruction\'s first upcast surcharge by <strong>2</strong> (minimum 0). ' +
      'If cast with this reduction, one linked ally under Lord of War may immediately reposition 15 feet without provoking opportunity attacks.</p>';
    const spearDescription = String(legacySpear.system?.description?.value ?? '');
    if (!spearDescription.includes(spearHeader)) {
      legacySpear.system.description.value = `${spearDescription}${spearHeader}${spearText}`;
    }
    legacySpear._stats = buildStats(now + 2, legacySpear._stats);
    await abilitiesDb.put(legacySpearKey, JSON.stringify(legacySpear));

    const weaknessHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const weaknessText =
      '<p>At Sequence 0, Weakness Survey now reveals conquest-continuity weak points. ' +
      'When marking a target, choose one continuity lane: true body, projection chain, substitute web, or supporting battlefield structure. ' +
      'The first time each round a marked target is hit by Spear of Destruction or Conquest Dominion, add damage equal to <strong>2 x Potency</strong>. ' +
      'If that hit landed on a projection/substitute, half this bonus transmits to one linked source.</p>';
    const weaknessDescription = String(legacyWeakness.system?.description?.value ?? '');
    if (!weaknessDescription.includes(weaknessHeader)) {
      legacyWeakness.system.description.value = `${weaknessDescription}${weaknessHeader}${weaknessText}`;
    }
    legacyWeakness._stats = buildStats(now + 3, legacyWeakness._stats);
    await abilitiesDb.put(legacyWeaknessKey, JSON.stringify(legacyWeakness));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH0001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH0002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH0003');
    const existingAbility4 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH0004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH0001',
        name: 'Lord of War',
        type: 'spell',
        img: 'icons/tools/flags/banner-flag-red-white.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (5 Spirituality):</strong> Bonus action. Proclaim planetary war-link for 1 minute (concentration). Choose up to 12 allied creatures within 1 kilometer that you can identify. Linked allies can share one selected Hunter rider each round (for example Chain of Command movement, Crossfire reaction pressure, or Iron-Blooded courage support). Once per round, you may swap positions with one linked ally you can sense.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Link up to 20 allies and increase swap range to 3 kilometers.</li><li><strong>+4 Spirituality:</strong> Two different linked allies each round may each trigger one shared Hunter rider instead of one total trigger.</li><li><strong>+8 Spirituality:</strong> Once per round, one linked ally may temporarily count as your sequence level for one non-ultimate Hunter rider resolution (GM adjudicated).</li></ul><p><em>Counterplay:</em> anti-command sanctums, mass communication disruption, and symbol-jamming rituals reduce link throughput.</p><p><em>Corruption Hook:</em> if you force linked allies into unwinnable slaughter to display status, gain 1 Corruption.</p>',
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
              count: '12',
              type: 'ally',
              special: 'identified allied creatures'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '1000',
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
            value: 'a blood-rusted command seal bound to a war banner thread',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq0Act001: buildActivity({
              id: 'hunterSeq0Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-lord-of-war',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900900,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH0002',
        name: 'Conquest Dominion',
        type: 'spell',
        img: 'icons/magic/control/control-influence-rally-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (6 Spirituality):</strong> Action. Declare conquered ground in a 100-foot-radius zone within 300 feet for 1 minute (concentration). Hostile creatures in the zone make a Wisdom save when they enter or start their turn there. On failure, they become conquest-tagged until end of their next turn: they cannot willingly move away from your chosen front vector and lose reactions. If a conquest-tagged creature drops to 0 HP, you may raise one temporary soldier construct from local debris/flame until end of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 150 feet and two temporary soldiers can be maintained at once.</li><li><strong>+4 Spirituality:</strong> Once per round, force one conquest-tagged target to make one basic attack against a target you designate (save negates).</li><li><strong>+8 Spirituality:</strong> Creatures that fail the save by 5 or more are treated as your soldiers for movement/pathing interaction until end of their next turn (cannot use unique ultimates while compelled).</li></ul><p><em>Counterplay:</em> command immunity, anti-compulsion protections, and leaving the dominion perimeter can reduce hold.</p><p><em>Corruption Hook:</em> if you sustain dominion to enslave surrendered populations, gain 1 Corruption.</p>',
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
              special: 'conquered battlefield zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'enc',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'soil from a field won in blood',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq0Act002: buildActivity({
              id: 'hunterSeq0Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-conquest-dominion',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900901,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH0003',
        name: 'Astral Fog of War',
        type: 'spell',
        img: 'icons/magic/air/fog-gas-smoke-swirling-gray.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Action. Spread astral-grade fog in a 180-foot-radius zone within 500 feet for 10 minutes (concentration). Creatures inside suffer disrupted hearing/smell/spiritual intuition and cannot receive precise external curse/divination targeting support. Allied units acknowledged by you ignore your fog penalties. Once per round, one allied unit in fog may reposition 15 feet without provoking opportunity attacks from non-sequence-0 foes.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 240 feet or create a second 90-foot fog node linked to the first.</li><li><strong>+4 Spirituality:</strong> Hostile teleportation/spirit traversal attempted inside fog requires a successful save; on failure it is canceled and the creature loses reactions.</li><li><strong>+8 Spirituality:</strong> For one round each minute, fog silences all non-Red-Priest command channels inside it except yours (GM adjudicated for equivalent sequence entities).</li></ul><p><em>Counterplay:</em> anti-illusion domains, overwhelming weather-purge rituals, and leaving fog space reduce suppression.</p><p><em>Corruption Hook:</em> using fog to erase witness protection for atrocities adds 1 Corruption.</p>',
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
              special: 'astral fog zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
            }
          },
          range: {
            units: 'ft',
            value: '500',
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
            value: 'sealed mist from an astral stormfront',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq0Act003: buildActivity({
              id: 'hunterSeq0Act003',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-astral-fog-of-war',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900902,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH0004',
        name: 'Termination Spear',
        type: 'spell',
        img: 'icons/weapons/polearms/spear-flared-steel.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (7 Spirituality):</strong> Action. Forge destruction authority into a violet-black spear and strike one creature, projection, substitute, or structure within 300 feet. Target makes a Constitution save. On failure, it takes fire + force damage equal to <strong>4 x Potency</strong>, loses reactions, and cannot benefit from ordinary resurrection/revival riders until scene end unless protected by advanced preparation. If the struck target is a projection/substitute, half damage transmits to one linked source.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Choose area mode (30-foot-radius impact) instead of single-target mode.</li><li><strong>+4 Spirituality:</strong> On failed saves, target also has speed 0 and cannot use teleport-like movement until end of its next turn.</li><li><strong>+8 Spirituality:</strong> If used against a target marked by Weakness Survey and it fails by 5 or more, apply execution lock: it cannot gain defensive boons from allied channels until end of your next turn.</li></ul><p><em>Backlash:</em> after each cast, make a control check; on failure, gain one stage of blood-war frenzy until short rest.</p><p><em>Counterplay:</em> rapid displacement, sacrificial decoys, and anti-destruction sanctums can reduce conversion.</p>',
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
              special: 'single target or area impact depending on spend'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'evc',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a spearhead quenched in sacrificial flame and rust',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq0Act004: buildActivity({
              id: 'hunterSeq0Act004',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-termination-spear',
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
            grantedSequence: 0
          }
        },
        _stats: buildStats(now + 7, existingAbility4?._stats),
        sort: 900903,
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
      legacyUpdated: [legacySpearKey, legacyWeaknessKey],
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
