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
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Weather Warlock), Hunter authority expands from battlefield command to regional weather dominion, army-wide power sharing, and catastrophic approach vectors that force enemies into your chosen kill geometry.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyChainKey = '!items!lotmAbilityH3001';
    const legacyWeaknessKey = '!items!lotmAbilityH5001';
    const legacyChain = await getOptionalJson(abilitiesDb, legacyChainKey);
    const legacyWeakness = await getOptionalJson(abilitiesDb, legacyWeaknessKey);
    if (!legacyChain) throw new Error('Legacy target lotmAbilityH3001 not found.');
    if (!legacyWeakness) throw new Error('Legacy target lotmAbilityH5001 not found.');

    const chainHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const chainText =
      '<p>At Sequence 2, Chain of Command inherits <em>Gathering</em>-grade scale. ' +
      'When you cast Chain of Command with at least <strong>+2 Spirituality</strong>, establish up to two relay cadres within 1 kilometer of you. ' +
      'For command riders that target allies, treat any ally in those cadres as linked if they can hear at least one relay captain. ' +
      'Once per round, one linked ally may channel one Hunter ability rider you designate (for example Crossfire Conspiracy movement or Iron-Blooded Courage save bonus) without requiring direct line of sight to you.</p>';
    const chainDescription = String(legacyChain.system?.description?.value ?? '');
    if (!chainDescription.includes(chainHeader)) {
      legacyChain.system.description.value = `${chainDescription}${chainHeader}${chainText}`;
    }
    legacyChain._stats = buildStats(now + 2, legacyChain._stats);
    await abilitiesDb.put(legacyChainKey, JSON.stringify(legacyChain));

    const weaknessHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const weaknessText =
      '<p>At Sequence 2, Weakness Survey can read systemic faults instead of single-point flaws. ' +
      'Marked targets reveal one whole-structure vulnerability (true body, substitute pattern, avatar network, or barrier framework). ' +
      'The first time each round a marked target is hit by Cull, Siegefire Homily, or Cataclysm Front, add fire damage equal to <strong>Potency</strong>; if the target relies on substitutes or split bodies, this bonus also applies to one linked manifestation.</p>';
    const weaknessDescription = String(legacyWeakness.system?.description?.value ?? '');
    if (!weaknessDescription.includes(weaknessHeader)) {
      legacyWeakness.system.description.value = `${weaknessDescription}${weaknessHeader}${weaknessText}`;
    }
    legacyWeakness._stats = buildStats(now + 3, legacyWeakness._stats);
    await abilitiesDb.put(legacyWeaknessKey, JSON.stringify(legacyWeakness));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH2001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH2002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH2003');
    const existingAbility4 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH2004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH2001',
        name: 'Tempest Muster',
        type: 'spell',
        img: 'icons/magic/air/wind-swirl-gray-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Invoke Weather Warlock gathering for 1 minute. Choose up to 4 allied creatures within 300 feet that can hear you. Each gains a storm mark. Once per round, a marked ally can add <strong>+1 fire or lightning damage</strong> to one hit and may spend your spirituality pool (up to 1 point) for one Hunter rider you permit this turn. While this effect lasts, you can sense all marked allies\' direction and status.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark two additional allies.</li><li><strong>+2 Spirituality:</strong> Marked allies also gain +10 feet movement and advantage on checks/saves against fear and forced retreat.</li><li><strong>+4 Spirituality:</strong> Once per round, two different marked allies may each trigger one borrowed Hunter rider instead of one total trigger.</li></ul><p><em>Counterplay:</em> silence, mass disorientation, and command-line severance reduce muster throughput.</p><p><em>Corruption Hook:</em> if you force exhausted allies to overdraw spirituality for glory, gain 1 Corruption.</p>',
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
              count: '4',
              type: 'ally',
              special: 'allies that can hear you'
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
          level: 7,
          school: 'enc',
          properties: ['vocal'],
          materials: {
            value: 'a banner tassel soaked in stormwater',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq2Act001: buildActivity({
              id: 'hunterSeq2Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-tempest-muster',
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
            grantedSequence: 2
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900700,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH2002',
        name: 'Cataclysm Front',
        type: 'spell',
        img: 'icons/magic/lightning/bolt-strike-clouds-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Action. Establish a storm front in a 40-foot-radius zone centered on a point within 300 feet for 1 minute (concentration). At cast and start of each of your turns, choose up to <strong>Potency</strong> creatures in zone. Each chosen creature makes a Dexterity save; on failure, takes lightning + fire damage equal to <strong>Potency</strong> and is pushed up to 10 feet. You choose rain, hail, or dense fog mode for secondary effects (slick ground, chip damage, or sight disruption).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 60 feet.</li><li><strong>+2 Spirituality:</strong> You can place one additional 20-foot storm node within 60 feet of the main front.</li><li><strong>+4 Spirituality:</strong> Once during duration, call a sky-bridge strike; all enemies in the main zone make a Constitution save or take fire + lightning damage equal to <strong>2 x Potency</strong> and lose reactions until end of their next turn.</li></ul><p><em>Counterplay:</em> anti-weather sanctums, spread formations, and concentration disruption limit attrition.</p><p><em>Corruption Hook:</em> if you call cataclysm on noncombat settlements for intimidation, gain 1 Corruption.</p>',
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
              special: 'storm-front center point'
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
          level: 7,
          school: 'evc',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'charred iron powder mixed with rainwater',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq2Act002: buildActivity({
              id: 'hunterSeq2Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-cataclysm-front',
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
            grantedSequence: 2
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900701,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH2003',
        name: 'Fog of War Ascendant',
        type: 'spell',
        img: 'icons/magic/air/fog-gas-smoke-swirling-pink.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Unfurl a sovereign fog in a 60-foot-radius zone within 240 feet for 10 minutes (concentration). Creatures in fog have suppressed hearing/smell-based tracking and disadvantage on attempts to target by distant divination-like effects. You and up to <strong>Potency</strong> allies designated at cast are unaffected by your fog\'s obscuring penalties and ignore one hostile sensory penalty each round while inside.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 90 feet.</li><li><strong>+2 Spirituality:</strong> Designate up to two additional unaffected allies and allow one protected ally per round to move 10 feet as a free step.</li><li><strong>+4 Spirituality:</strong> Hostiles that fail a Wisdom save while in fog cannot use teleport-like movement and cannot receive precise external targeting support until end of their next turn.</li></ul><p><em>Counterplay:</em> overwhelming wind, anti-illusion perception, and forcing combat outside fog deny value.</p><p><em>Corruption Hook:</em> if you weaponize fog to conceal atrocities against captives, gain 1 Corruption.</p>',
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
              special: 'sovereign fog center point'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          level: 7,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'fogwater condensed from a battlefield dawn',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq2Act003: buildActivity({
              id: 'hunterSeq2Act003',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-fog-of-war-ascendant',
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
            grantedSequence: 2
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900702,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH2004',
        name: 'Meteoric Descent',
        type: 'spell',
        img: 'icons/magic/fire/beam-jet-stream-trails-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Transform into a meteor-lance of flame and wind, moving up to 120 feet in a straight or arcing line. Choose up to <strong>Potency</strong> creatures crossed by the line. Each makes a Dexterity save; on failure it takes fire damage equal to <strong>Potency</strong> and is knocked prone. You end at a space you can occupy and may make one weapon attack as part of this action.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Movement range becomes 180 feet.</li><li><strong>+2 Spirituality:</strong> Damage becomes fire + force equal to <strong>Potency</strong>, and creatures that fail also lose reactions until start of your next turn.</li><li><strong>+4 Spirituality:</strong> At destination, create a 15-foot impact zone; enemies in zone make Constitution save or take fire damage equal to <strong>2 x Potency</strong> and become <strong>frightened</strong> of you until end of their next turn.</li></ul><p><em>Backlash:</em> if cast repeatedly in a short span, make a discipline check after each use; failure inflicts one stage of overheat-frenzy until short rest.</p><p><em>Counterplay:</em> reaction denial, anti-mobility fields, and prepared interception lines reduce impact routes.</p>',
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
            value: '',
            units: 'inst'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'self',
              special: 'meteor-lance movement path'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'line'
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
          level: 7,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a sliver of black steel heated until violet-red',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq2Act004: buildActivity({
              id: 'hunterSeq2Act004',
              activationType: 'bonus',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-meteoric-descent',
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
            grantedSequence: 2
          }
        },
        _stats: buildStats(now + 7, existingAbility4?._stats),
        sort: 900703,
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
      legacyUpdated: [legacyChainKey, legacyWeaknessKey],
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
