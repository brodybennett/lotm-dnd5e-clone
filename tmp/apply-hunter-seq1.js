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
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Conqueror), Hunter turns large-scale weather command into angel-tier subjugation authority: converting matter into soldiers, forcing surrender in body and will, and coordinating massed ranks into decisive annihilation strikes.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyMusterKey = '!items!lotmAbilityH2001';
    const legacyWeaknessKey = '!items!lotmAbilityH5001';
    const legacyMuster = await getOptionalJson(abilitiesDb, legacyMusterKey);
    const legacyWeakness = await getOptionalJson(abilitiesDb, legacyWeaknessKey);
    if (!legacyMuster) throw new Error('Legacy target lotmAbilityH2001 not found.');
    if (!legacyWeakness) throw new Error('Legacy target lotmAbilityH5001 not found.');

    const musterHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const musterText =
      '<p>At Sequence 1, Tempest Muster can support true war-scale formations. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, designate up to two command circles within 1 kilometer of you; ' +
      'allies inside either circle count as storm-marked for movement and morale riders. ' +
      'Once per round, one marked ally in each circle may trigger one shared Hunter rider even if they are not in direct line of sight of you.</p>';
    const musterDescription = String(legacyMuster.system?.description?.value ?? '');
    if (!musterDescription.includes(musterHeader)) {
      legacyMuster.system.description.value = `${musterDescription}${musterHeader}${musterText}`;
    }
    legacyMuster._stats = buildStats(now + 2, legacyMuster._stats);
    await abilitiesDb.put(legacyMusterKey, JSON.stringify(legacyMuster));

    const weaknessHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const weaknessText =
      '<p>At Sequence 1, Weakness Survey can lock onto a target\'s true continuity. ' +
      'When you mark a target, choose one continuity thread (true body, projection chain, substitute network, or core structure). ' +
      'The first time each round that target is hit by Cull or Spear of Destruction, add damage equal to <strong>Potency</strong>; ' +
      'if the hit was against a projection or substitute, this bonus transmits to one valid linked source.</p>';
    const weaknessDescription = String(legacyWeakness.system?.description?.value ?? '');
    if (!weaknessDescription.includes(weaknessHeader)) {
      legacyWeakness.system.description.value = `${weaknessDescription}${weaknessHeader}${weaknessText}`;
    }
    legacyWeakness._stats = buildStats(now + 3, legacyWeakness._stats);
    await abilitiesDb.put(legacyWeaknessKey, JSON.stringify(legacyWeakness));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH1001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH1002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH1003');
    const existingAbility4 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH1004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH1001',
        name: 'Casting Soldiers',
        type: 'spell',
        img: 'icons/magic/fire/flame-burning-creature-skeleton.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Conquer nearby matter and flames into a soldier cohort for 1 minute (concentration). Choose up to <strong>Potency + 2</strong> Medium objects/fragments in a 60-foot radius. They become iron-black flame soldiers under your command, each with 1 hit and one basic strike. Once per round, one soldier can deliver one Hunter rider currently active on you (such as Crossfire movement pressure or Iron-Blooded save pressure).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Create two additional soldiers.</li><li><strong>+2 Spirituality:</strong> Soldiers gain resistance to nonmagical weapon damage and move +10 feet.</li><li><strong>+4 Spirituality:</strong> Once per round, two different soldiers may each trigger one Hunter rider instead of one total trigger.</li></ul><p><em>Counterplay:</em> anti-animation wards, widespread object destruction, and command-disruption effects reduce cohort value.</p><p><em>Corruption Hook:</em> if you animate civilian remains or sacred relics for spectacle, gain 1 Corruption.</p>',
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
              special: 'objects and fragments in a 60-foot radius'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          level: 8,
          school: 'trs',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'charred figurines etched with command runes',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq1Act001: buildActivity({
              id: 'hunterSeq1Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-casting-soldiers',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900800,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH1002',
        name: 'Conquest Will',
        type: 'spell',
        img: 'icons/magic/control/control-influence-crown-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Impose angelic subjugation on up to 2 hostile creatures within 120 feet that can hear or see you. Each target makes a Wisdom save. On failure, it becomes conquest-marked until end of your next turn: it has disadvantage on attacks not designated by you, and if it willingly moves away from your chosen front line, it takes psychic damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional creature.</li><li><strong>+2 Spirituality:</strong> On failed save, target also cannot take reactions and loses one active morale/resolve rider.</li><li><strong>+4 Spirituality:</strong> If a target fails by 5 or more, you can force one immediate movement up to half its speed or one basic attack against a target you designate.</li></ul><p><em>Counterplay:</em> mind-shielding, command immunity, and line-of-command breaks can resist forced submission.</p><p><em>Corruption Hook:</em> if you repeatedly use conquest pressure to enslave surrendered foes outside wartime necessity, gain 1 Corruption.</p>',
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
              count: '2',
              type: 'creature',
              special: 'hostile creatures that can hear or see you'
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
          school: 'enc',
          properties: ['vocal'],
          materials: {
            value: 'an iron command signet marked with dried blood',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq1Act002: buildActivity({
              id: 'hunterSeq1Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-conquest-will',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900801,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH1003',
        name: 'War Commander Banner',
        type: 'spell',
        img: 'icons/tools/flags/banner-wave-blue-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Bonus action. Plant a symbolic war-banner for 1 minute (concentration). Choose up to 8 willing allies within 300 feet. While linked, they count as one command team: once per round you may let one linked ally borrow one Hunter ability rider of Sequence 4 or lower currently available to you, paying its spiritual surcharge from your pool. Linked allies also gain +1 to saves against fear/charm/panic effects.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Link four additional allies.</li><li><strong>+2 Spirituality:</strong> Two different linked allies each round may borrow one rider instead of one total borrow.</li><li><strong>+4 Spirituality:</strong> Once per round, one linked ally can be treated as the origin point for your command/fog effects (Chain of Command, Fogfront Dominion, Fog of War Ascendant).</li></ul><p><em>Counterplay:</em> silence zones, anti-link ritual fields, and killing/displacing banner nodes reduce team coherence.</p><p><em>Corruption Hook:</em> if you deliberately overburn linked allies as expendable batteries, gain 1 Corruption.</p>',
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
              count: '8',
              type: 'ally',
              special: 'willing linked allies'
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
          level: 8,
          school: 'enc',
          properties: ['vocal', 'concentration'],
          materials: {
            value: 'a war-banner threaded with black steel wire',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq1Act003: buildActivity({
              id: 'hunterSeq1Act003',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-war-commander-banner',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900802,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH1004',
        name: 'Spear of Destruction',
        type: 'spell',
        img: 'icons/weapons/polearms/spear-flared-bronze.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (4 Spirituality):</strong> Action. Condense violet destruction flame into a spear and strike one creature, construct, or manifested phenomenon within 180 feet. Target makes a Constitution save. On failure, it takes fire + force damage equal to <strong>3 x Potency</strong>, loses reactions, and cannot benefit from minor substitute/projection riders until end of your next turn. On success, it takes half damage.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> The spear can instead hit a 20-foot radius area; each hostile creature in area saves separately.</li><li><strong>+4 Spirituality:</strong> Against targets marked by Weakness Survey, failed saves transmit half of this damage to one linked projection/substitute/true-body thread.</li><li><strong>+8 Spirituality:</strong> If a marked target fails by 5 or more, it suffers execution trauma: it cannot regain hit points and has speed 0 until end of its next turn.</li></ul><p><em>Backlash:</em> each use forces a control check; on failure, gain one stage of blood-war frenzy until short rest.</p><p><em>Counterplay:</em> rapid displacement, sacrificial decoys, and anti-destruction sanctums can reduce spear conversion.</p>',
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
              special: 'one target or one area depending on spend'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'evc',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a black-steel spearhead quenched in blood and ash',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq1Act004: buildActivity({
              id: 'hunterSeq1Act004',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-spear-of-destruction',
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
            grantedSequence: 1
          }
        },
        _stats: buildStats(now + 7, existingAbility4?._stats),
        sort: 900803,
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
      legacyUpdated: [legacyMusterKey, legacyWeaknessKey],
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
