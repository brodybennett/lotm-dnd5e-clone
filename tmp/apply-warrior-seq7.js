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

function buildActivity({ id, activationType, durationUnits }) {
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
        units: 'ft'
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
    const pathwayKey = '!items!lotmPathway00011';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Warrior pathway (lotmPathway00011) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> stoic frontline command through trained violence, iron resolve, and twilight-forged endurance.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Combat Mastery, Physical Enhancement.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Supernatural Resistance, Close-Quarters Mastery, plus one legacy scope upgrade to Combat Mastery.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Weapon Mastery, Iron Body Discipline, Twilight Reversal, plus two legacy upgrades (Close-Quarters Mastery and Supernatural Resistance).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Weapon Master), the pathway moves from brutal close-combat aptitude into full-spectrum weapon dominion and steadier anti-supernatural combat posture.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const cqmKey = '!items!lotmAbilityW8002';
    const cqm = await getOptionalJson(abilitiesDb, cqmKey);
    if (!cqm) throw new Error('Legacy target lotmAbilityW8002 not found.');
    const cqmHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    if (!String(cqm.system?.description?.value ?? '').includes(cqmHeader)) {
      cqm.system.description.value +=
        `${cqmHeader}<p>At Sequence 7, your close-combat leverage is sharper. ` +
        `When you cast Close-Quarters Mastery with at least <strong>+2 Spirituality</strong>, ` +
        `the first creature that fails its Strength save also takes bonus damage equal to <strong>Potency</strong>. ` +
        `If you choose to move the target instead of knocking it prone, increase that forced movement to 10 feet.</p>`;
    }
    cqm._stats = buildStats(now + 2, cqm._stats);
    await abilitiesDb.put(cqmKey, JSON.stringify(cqm));

    const srKey = '!items!lotmAbilityW8001';
    const sr = await getOptionalJson(abilitiesDb, srKey);
    if (!sr) throw new Error('Legacy target lotmAbilityW8001 not found.');
    const srHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    if (!String(sr.system?.description?.value ?? '').includes(srHeader)) {
      sr.system.description.value +=
        `${srHeader}<p>At Sequence 7, your body learns to hold resistance with less strain. ` +
        `Once per round, when you trigger Supernatural Resistance, reduce its spirituality surcharge by <strong>1</strong> (minimum 0). ` +
        `If the trigger came from within 10 feet, you may also move 5 feet without provoking opportunity attacks.</p>`;
    }
    sr._stats = buildStats(now + 3, sr._stats);
    await abilitiesDb.put(srKey, JSON.stringify(sr));

    const w7001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW7001');
    const w7002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW7002');
    const w7003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW7003');

    const abilities = [
      {
        _id: 'lotmAbilityW7001',
        name: 'Weapon Mastery',
        type: 'spell',
        img: 'icons/weapons/swords/sword-broad-steel.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, choose one wielded weapon. You gain <strong>+Potency</strong> to attack rolls made with it and ignore disadvantage from unfamiliar weapon forms. If the weapon carries a harmful drawback from a mystical or sealed effect, reduce that drawback by one step (GM adjudication) while this ability lasts.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may apply the baseline mastery to two different weapons you wield or carry.</li><li><strong>+2 Spirituality:</strong> Once per turn on a hit with a mastered weapon, add bonus damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Until the start of your next turn, attacks with mastered weapons ignore resistance to non-magical weapon damage.</li></ul><p><em>Counterplay:</em> Disarm, forced movement, and anti-weapon zones still interrupt your preferred pressure loop.</p><p><em>Corruption Hook:</em> If you activate this to revel in massacre instead of discipline, gain 1 Corruption.</p>',
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
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a weapon oilcloth marked with dusk sigils',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq7Act001: buildActivity({
              id: 'warriorSeq7Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-weapon-mastery',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-warrior'
        },
        effects: [],
        folder: 'HU7eK5t0hJEd93Ug',
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
        _stats: buildStats(now + 4, w7001Existing?._stats),
        sort: 800200,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW7002',
        name: 'Iron Body Discipline',
        type: 'spell',
        img: 'icons/magic/defensive/armor-shield-steel.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Steel your body for 10 minutes. Gain temporary hit points equal to <strong>2 x Potency</strong>, and advantage on checks/saves against being grappled, shoved, or knocked prone.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Temporary hit points become <strong>3 x Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Until the start of your next turn, you have resistance to bludgeoning, piercing, and slashing damage from non-magical attacks.</li><li><strong>+4 Spirituality:</strong> For 1 round, you cannot be forcibly moved and automatically succeed one Strength or Constitution save.</li></ul><p><em>Counterplay:</em> Control effects targeting mind or spirit can still bypass this body-focused discipline.</p><p><em>Corruption Hook:</em> If used to torture or crush captives, gain 1 Corruption.</p>',
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
            value: 'a strip of tempered steel wire',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq7Act002: buildActivity({
              id: 'warriorSeq7Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-iron-body-discipline',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-warrior'
        },
        effects: [],
        folder: 'HU7eK5t0hJEd93Ug',
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
        _stats: buildStats(now + 5, w7002Existing?._stats),
        sort: 800201,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW7003',
        name: 'Twilight Reversal',
        type: 'spell',
        img: 'icons/magic/time/arrows-circling-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a creature within 5 feet misses you with an attack. Immediately make one melee attack against that creature. On a hit, the target must succeed on a Strength save or be pushed 5 feet and lose reactions until the end of its turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Reaction attack gains <strong>+Potency</strong> to the attack roll.</li><li><strong>+2 Spirituality:</strong> On hit, add bonus damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> You may shift up to 10 feet before or after the reaction attack without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> Reach attackers, ranged pressure, and effects that deny reactions can shut this down.</p><p><em>Corruption Hook:</em> If you repeatedly bait weaker foes to break them for sport, gain 1 Corruption.</p>',
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
              type: 'creature',
              special: 'creature within 5 feet that misses you'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '5',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 2,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a fragment of dusk-colored leather',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq7Act003: buildActivity({
              id: 'warriorSeq7Act003',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-twilight-reversal',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-warrior'
        },
        effects: [],
        folder: 'HU7eK5t0hJEd93Ug',
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
        _stats: buildStats(now + 6, w7003Existing?._stats),
        sort: 800202,
        ownership: {
          default: 0
        }
      }
    ];

    for (const ability of abilities) {
      await abilitiesDb.put(`!items!${ability._id}`, JSON.stringify(ability));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [cqmKey, srKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
