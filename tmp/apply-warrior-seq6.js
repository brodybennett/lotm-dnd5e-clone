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
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Dawn Paladin), giant-forged physique and twilight discipline bloom into controlled Dawn authority that purifies, hardens, and cuts through corruption.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const weaponMasteryKey = '!items!lotmAbilityW7001';
    const weaponMastery = await getOptionalJson(abilitiesDb, weaponMasteryKey);
    if (!weaponMastery) throw new Error('Legacy target lotmAbilityW7001 not found.');
    const wmHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    if (!String(weaponMastery.system?.description?.value ?? '').includes(wmHeader)) {
      weaponMastery.system.description.value +=
        `${wmHeader}<p>At Sequence 6, your mastery projects farther. ` +
        `When Weapon Mastery is active and you spend at least <strong>+1 Spirituality</strong>, ` +
        `you can apply mastered-weapon bonuses to one ally within 10 feet until the start of your next turn. ` +
        `The ally gains only accuracy/form control benefits, not your full damage riders.</p>`;
    }
    weaponMastery._stats = buildStats(now + 2, weaponMastery._stats);
    await abilitiesDb.put(weaponMasteryKey, JSON.stringify(weaponMastery));

    const ironBodyKey = '!items!lotmAbilityW7002';
    const ironBody = await getOptionalJson(abilitiesDb, ironBodyKey);
    if (!ironBody) throw new Error('Legacy target lotmAbilityW7002 not found.');
    const ibHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    if (!String(ironBody.system?.description?.value ?? '').includes(ibHeader)) {
      ironBody.system.description.value +=
        `${ibHeader}<p>At Sequence 6, your discipline wastes less spirituality. ` +
        `Once per short rest, reduce Iron Body Discipline's spirituality surcharge by <strong>1</strong> (minimum 0). ` +
        `If the discount is used while bloodied, you also gain 5 feet of movement until end of turn.</p>`;
    }
    ironBody._stats = buildStats(now + 3, ironBody._stats);
    await abilitiesDb.put(ironBodyKey, JSON.stringify(ironBody));

    const w6001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW6001');
    const w6002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW6002');
    const w6003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW6003');

    const abilities = [
      {
        _id: 'lotmAbilityW6001',
        name: 'Light of Dawn',
        type: 'spell',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Emit sacred dawn light in a 20-foot radius for 1 minute (concentration). Illusions and ordinary darkness in the area are suppressed, invisible creatures relying on shadow concealment are revealed, and undead/shadow creatures in the aura have disadvantage on their first attack roll each turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius increases to 30 feet.</li><li><strong>+2 Spirituality:</strong> When activated, choose up to Potency allies in the aura; each gains advantage on the next save against fear, charm, or corruption-typed effects before your next turn.</li><li><strong>+4 Spirituality:</strong> Undead, wraith, shadow, and explicitly corrupted entities in the aura take radiant damage equal to Potency at the start of their turns for 1 round (once per creature per cast).</li></ul><p><em>Counterplay:</em> Very high-sequence concealment, heavy cover, and line-of-effect breaks still limit reveal and pressure.</p><p><em>Corruption Hook:</em> If you unleash this to punish innocents under the pretext of purity, gain 1 Corruption.</p>',
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
              type: 'self',
              special: '20-foot dawn aura'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          school: 'evc',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a polished shard of pale metal',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq6Act001: buildActivity({
              id: 'warriorSeq6Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-light-of-dawn',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 4, w6001Existing?._stats),
        sort: 800300,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW6002',
        name: 'Dawn Armour',
        type: 'spell',
        img: 'icons/equipment/chest/breastplate-cuirass-steel-grey.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Conjure silver dawn armor for 10 minutes. Gain temporary hit points equal to <strong>2 x Potency</strong> and a <strong>+1 AC</strong> bonus while not incapacitated. This armor has no movement penalty.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Temporary hit points become <strong>3 x Potency</strong>.</li><li><strong>+2 Spirituality:</strong> As a reaction once while active, reduce incoming damage by <strong>Potency + proficiency bonus</strong>.</li><li><strong>+4 Spirituality:</strong> When the armor would be broken (temp HP reduced to 0), it immediately reforms with Potency temporary HP once per cast.</li></ul><p><em>Counterplay:</em> Repeated burst damage and anti-magic suppression can strip this defense before it stabilizes.</p><p><em>Corruption Hook:</em> If you use this solely to dominate the weak, gain 1 Corruption.</p>',
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
          level: 3,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a tiny mirror etched with a dawn line',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq6Act002: buildActivity({
              id: 'warriorSeq6Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-dawn-armour',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 5, w6002Existing?._stats),
        sort: 800301,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW6003',
        name: 'Sword of Dawn',
        type: 'spell',
        img: 'icons/weapons/swords/sword-winged-pink.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Condense a dawn-forged weapon for 1 minute (greatsword by default; you may choose axe, spear, or dagger form). It counts as magical, deals radiant damage, and each hit applies a mild purification rider that cancels one minor shadow/corruption buff on the target (GM adjudication).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may reshape the weapon form once during the duration without spending an action.</li><li><strong>+2 Spirituality:</strong> Hits deal additional radiant damage equal to <strong>Potency</strong> against undead, evil spirits, and corruption-aspected entities.</li><li><strong>+4 Spirituality:</strong> You may shatter the weapon as an action to create a 10-foot <em>Hurricane of Light</em>; creatures in the area make a Dexterity save, taking radiant/slashing damage equal to <strong>2 x Potency</strong> on failure (half on success). After this burst, you cannot reconjure Sword of Dawn until after a short rest.</li></ul><p><em>Counterplay:</em> Disarms, long-range pressure, and anti-summoning effects can interrupt the weapon window.</p><p><em>Corruption Hook:</em> If used as an excuse for indiscriminate purges, gain 1 Corruption.</p>',
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
          level: 3,
          school: 'evc',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a strip of pale cloth wrapped around a hilt',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq6Act003: buildActivity({
              id: 'warriorSeq6Act003',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-sword-of-dawn',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 6, w6003Existing?._stats),
        sort: 800302,
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
      legacyUpdated: [weaponMasteryKey, ironBodyKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
