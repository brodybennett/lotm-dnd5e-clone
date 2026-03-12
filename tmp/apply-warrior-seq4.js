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
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Eye of Demon Hunting, Weapon Ointment Mastery, Mind Concealment, Incomplete Mythical Creature Form, plus two legacy upgrades (Protection and Light of Dawn).</p>' +
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Demon Hunter), the pathway crosses into saint-tier authority: enemy nature and weakness are read at a glance, intent is concealed from foresight, and incomplete cyclopean divinity can be released at heavy madness risk.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const protectionKey = '!items!lotmAbilityW5001';
    const protection = await getOptionalJson(abilitiesDb, protectionKey);
    if (!protection) throw new Error('Legacy target lotmAbilityW5001 not found.');
    const protectionHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    if (!String(protection.system?.description?.value ?? '').includes(protectionHeader)) {
      protection.system.description.value +=
        `${protectionHeader}<p>At Sequence 4, your protective walls gain saint-tier anchoring. ` +
        `When Protection is used with at least <strong>+2 Spirituality</strong>, you may anchor the barrier to terrain until the end of your next turn. ` +
        `While anchored, the barrier blocks low-tier Spirit World traversal attempts through its space and weakens one Curse-type effect crossing it (GM adjudication).</p>`;
    }
    protection._stats = buildStats(now + 2, protection._stats);
    await abilitiesDb.put(protectionKey, JSON.stringify(protection));

    const lightOfDawnKey = '!items!lotmAbilityW6001';
    const lightOfDawn = await getOptionalJson(abilitiesDb, lightOfDawnKey);
    if (!lightOfDawn) throw new Error('Legacy target lotmAbilityW6001 not found.');
    const lodHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    if (!String(lightOfDawn.system?.description?.value ?? '').includes(lodHeader)) {
      lightOfDawn.system.description.value +=
        `${lodHeader}<p>At Sequence 4, Light of Dawn can be condensed directly onto weapons and carried objects. ` +
        `Choose up to <strong>Potency</strong> allied weapons or items in the aura; each deals +1 radiant damage on the next hit/effect this round and counts as dawn-attuned for corruption suppression.</p>`;
    }
    lightOfDawn._stats = buildStats(now + 3, lightOfDawn._stats);
    await abilitiesDb.put(lightOfDawnKey, JSON.stringify(lightOfDawn));

    const w4001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW4001');
    const w4002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW4002');
    const w4003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW4003');
    const w4004Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW4004');

    const abilities = [
      {
        _id: 'lotmAbilityW4001',
        name: 'Eye of Demon Hunting',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-green.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Focus your hunt-sense on one visible creature within 60 feet. You immediately identify whether it is corrupted, possessed, disguised, or under an active curse, and learn one exploitable weakness (defense gap, movement tell, or resistance seam). The next attack or save DC you or an ally apply against that target before the end of your next turn gains <strong>+Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may analyze up to two additional visible creatures.</li><li><strong>+2 Spirituality:</strong> You also reveal one active defensive rider (shield, ward, concealment layer) on each analyzed target.</li><li><strong>+4 Spirituality:</strong> For 1 round, analyzed targets cannot hide their intentions from your party within 30 feet; reaction-based ambush bonuses against you are suppressed.</li></ul><p><em>Counterplay:</em> High-sequence conceptual concealment or remote proxies can blur readings.</p><p><em>Corruption Hook:</em> If you use this purely to exploit innocent fear, gain 1 Corruption.</p>',
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
              type: 'creature',
              special: 'visible creature'
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
          level: 5,
          school: 'div',
          properties: ['somatic'],
          materials: {
            value: 'a hunter sigil painted in dusk ash',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq4Act001: buildActivity({
              id: 'warriorSeq4Act001',
              activationType: 'bonus',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-eye-of-demon-hunting',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 4, w4001Existing?._stats),
        sort: 800500,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW4002',
        name: 'Weapon Ointment Mastery',
        type: 'spell',
        img: 'icons/consumables/potions/potion-round-corked-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Apply saint-grade dawn ointment to up to two wielded weapons for 1 minute. Choose one profile for each weapon: <em>Severing</em> (+Potency damage vs armored/construct targets), <em>Purging</em> (+Potency radiant vs corrupted/undead), or <em>Binding</em> (first hit each turn forces Strength save or speed -10 feet).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 10 minutes.</li><li><strong>+2 Spirituality:</strong> You may switch one weapon profile once per turn without spending an action.</li><li><strong>+4 Spirituality:</strong> If both of your weapons hit the same target in a round, trigger an additional Potency damage burst and cancel one minor defensive rider on that target.</li></ul><p><em>Counterplay:</em> Disarm effects and range denial reduce dual-weapon leverage.</p><p><em>Corruption Hook:</em> If you brew or apply these compounds for cruelty experiments, gain 1 Corruption.</p>',
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
              count: '2',
              type: 'object',
              special: 'wielded weapons'
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
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'two vials of prepared dawn ointment',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq4Act002: buildActivity({
              id: 'warriorSeq4Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-weapon-ointment-mastery',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 5, w4002Existing?._stats),
        sort: 800501,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW4003',
        name: 'Mind Concealment',
        type: 'spell',
        img: 'icons/magic/control/debuff-energy-hold-teal-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Conceal your actions and intentions for 1 minute. Divination, prophecy, and danger-sense checks against you take disadvantage, and your movement/preparation cannot be read by ordinary precognitive effects.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend concealment to one ally within 15 feet.</li><li><strong>+2 Spirituality:</strong> Up to Potency allies within 15 feet gain a reduced version (they force neutralized foresight, but not full concealment).</li><li><strong>+4 Spirituality:</strong> For 1 round, enemy precognition in a 20-foot zone around you is treated as unreliable noise; once, you may invalidate an enemy reaction that depended on foresight.</li></ul><p><em>Counterplay:</em> Non-divinatory tracking, broad area denial, and raw perception can still locate you.</p><p><em>Corruption Hook:</em> If used to hide treachery against your sworn line, gain 1 Corruption.</p>',
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
          level: 5,
          school: 'ill',
          properties: ['somatic'],
          materials: {
            value: 'a strip of black cloth soaked in dawn tincture',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq4Act003: buildActivity({
              id: 'warriorSeq4Act003',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-mind-concealment',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 6, w4003Existing?._stats),
        sort: 800502,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW4004',
        name: 'Incomplete Mythical Creature Form',
        type: 'spell',
        img: 'icons/creatures/magical/humanoid-silhouette-rune-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Release an incomplete cyclopean form for 1 round. Increase your size category by one step (max Huge), gain advantage on Strength checks/saves, and your melee reach increases by 5 feet. Creatures of lower sequence than 4 that start within 10 feet must succeed on a Wisdom save or become disoriented until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li><li><strong>+2 Spirituality:</strong> Your melee attacks gain bonus damage equal to Potency while transformed.</li><li><strong>+4 Spirituality:</strong> When form ends, emit a shockwave in 10 feet; creatures make a Constitution save or take Potency force damage and fall prone.</li></ul><p><em>Backlash:</em> Each use forces a corruption check; on failure, gain one stage of frenzy impulse until short rest.</p><p><em>Counterplay:</em> Mental disruption, forced separation, and terrain constraints can reduce form value.</p>',
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
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a drop of your own blood mixed with gray ash',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq4Act004: buildActivity({
              id: 'warriorSeq4Act004',
              activationType: 'bonus',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-warrior-incomplete-mythical-creature-form',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 7, w4004Existing?._stats),
        sort: 800503,
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
      legacyUpdated: [protectionKey, lightOfDawnKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
