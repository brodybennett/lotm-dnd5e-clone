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
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Light of Dawn, Dawn Armour, Sword of Dawn, plus two legacy upgrades (Weapon Mastery and Iron Body Discipline).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Protection, Illusion Immunity, Unbreakable Defense, plus two legacy upgrades (Light of Dawn and Dawn Armour).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Guardian), Dawn Paladin momentum condenses into fortress-level interception, anti-deception clarity, and near-immovable defensive commitment.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const lightOfDawnKey = '!items!lotmAbilityW6001';
    const lightOfDawn = await getOptionalJson(abilitiesDb, lightOfDawnKey);
    if (!lightOfDawn) throw new Error('Legacy target lotmAbilityW6001 not found.');
    const lodHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    if (!String(lightOfDawn.system?.description?.value ?? '').includes(lodHeader)) {
      lightOfDawn.system.description.value +=
        `${lodHeader}<p>At Sequence 5, Light of Dawn can anchor an allied defensive line. ` +
        `When cast with at least <strong>+1 Spirituality</strong>, designate one allied creature within 15 feet as a ward anchor. ` +
        `Both you and the anchor count as aura origins for ally-support effects until the end of your next turn.</p>`;
    }
    lightOfDawn._stats = buildStats(now + 2, lightOfDawn._stats);
    await abilitiesDb.put(lightOfDawnKey, JSON.stringify(lightOfDawn));

    const dawnArmourKey = '!items!lotmAbilityW6002';
    const dawnArmour = await getOptionalJson(abilitiesDb, dawnArmourKey);
    if (!dawnArmour) throw new Error('Legacy target lotmAbilityW6002 not found.');
    const daHeader = '<h3>Legacy Upgrade (Sequence 5 - Potency)</h3>';
    if (!String(dawnArmour.system?.description?.value ?? '').includes(daHeader)) {
      dawnArmour.system.description.value +=
        `${daHeader}<p>At Sequence 5, your armor absorbs heavier punishment. ` +
        `Increase Dawn Armour temporary hit points by <strong>+Potency</strong>, and the once-per-cast reaction reduction gains an additional <strong>+Potency</strong>.</p>`;
    }
    dawnArmour._stats = buildStats(now + 3, dawnArmour._stats);
    await abilitiesDb.put(dawnArmourKey, JSON.stringify(dawnArmour));

    const w5001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW5001');
    const w5002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW5002');
    const w5003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW5003');

    const abilities = [
      {
        _id: 'lotmAbilityW5001',
        name: 'Protection',
        type: 'spell',
        img: 'icons/magic/defensive/shield-barrier-glowing-triangle-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when an ally within 20 feet is hit by an attack. Conjure two invisible dawn walls and intercept: reduce the damage to that ally by <strong>Potency + proficiency bonus</strong>, and you may immediately move up to 10 feet toward them. If you end adjacent, you can choose to take any remaining damage yourself.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range increases to 30 feet, and the reduction becomes <strong>2 x Potency + proficiency bonus</strong>.</li><li><strong>+2 Spirituality:</strong> If the triggering attack is melee, you may force the attacker to make a Strength save or be pushed 10 feet away from the protected ally.</li><li><strong>+4 Spirituality:</strong> Until the start of your next turn, both you and the protected ally gain resistance to weapon damage from non-magical attacks.</li></ul><p><em>Counterplay:</em> Multiple separated threats can overwhelm interception range and reaction limits.</p><p><em>Corruption Hook:</em> If you use this to shield cruelty while ignoring innocents, gain 1 Corruption.</p>',
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
              type: 'ally',
              special: 'ally within 20 feet who was hit'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '20',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 4,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a shield strap worn in prior battles',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq5Act001: buildActivity({
              id: 'warriorSeq5Act001',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-protection',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 4, w5001Existing?._stats),
        sort: 800400,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW5002',
        name: 'Illusion Immunity',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-glow-angry-small-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Passive + reaction utility. You are immune to ordinary illusions and gain advantage on checks/saves against supernatural illusion and misdirection effects. As a reaction, when you or an ally within 15 feet fails an illusion-related save, allow a reroll with <strong>+Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Reaction range becomes 30 feet.</li><li><strong>+2 Spirituality:</strong> If the reroll succeeds, the source of the illusion is outlined by dawn light until the end of your next turn.</li><li><strong>+4 Spirituality:</strong> For 1 minute, allies within 10 feet gain your baseline advantage against illusion and misdirection effects.</li></ul><p><em>Counterplay:</em> Non-illusion control, plain stealth, and non-visual deception still function normally.</p><p><em>Corruption Hook:</em> If you weaponize truth-sight for petty humiliation, gain 1 Corruption.</p>',
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
              type: 'ally',
              special: 'you or one ally failing an illusion save'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '15',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 4,
          school: 'div',
          properties: ['somatic'],
          materials: {
            value: 'a clear lens etched with a dawn glyph',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq5Act002: buildActivity({
              id: 'warriorSeq5Act002',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-illusion-immunity',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 5, w5002Existing?._stats),
        sort: 800401,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW5003',
        name: 'Unbreakable Defense',
        type: 'spell',
        img: 'icons/skills/melee/shield-block-bash-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Enter a full defensive commitment for 1 round. While active, attacks against you have disadvantage, you gain resistance to all damage types except psychic, and you cannot be forcibly moved. While this state is active, your outgoing weapon attacks are made with disadvantage.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li><li><strong>+2 Spirituality:</strong> Adjacent allies also gain half-cover while you maintain the stance.</li><li><strong>+4 Spirituality:</strong> Once during the stance, you may nullify one non-psychic damaging effect that targets you or an adjacent ally.</li></ul><p><em>Counterplay:</em> Psychic pressure, displacement before activation, and baiting offense windows can break this fortress rhythm.</p><p><em>Corruption Hook:</em> If you use this to stall while allies commit atrocities, gain 1 Corruption.</p>',
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
          level: 4,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a fragment of weathered fortress stone',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq5Act003: buildActivity({
              id: 'warriorSeq5Act003',
              activationType: 'bonus',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-warrior-unbreakable-defense',
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
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 6, w5003Existing?._stats),
        sort: 800402,
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
      legacyUpdated: [lightOfDawnKey, dawnArmourKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
