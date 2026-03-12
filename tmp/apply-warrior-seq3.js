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
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Mercury Liquefaction, Silver Rapier, Light Concealment, Hurricane of Light, plus two legacy upgrades (Eye of Demon Hunting and Weapon Ointment Mastery).</p>' +
      '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Silver Knight), demon-hunting perception evolves into liquid-metal adaptation, dawn-edge transfiguration, and battlefield light storms, while concealment and prediction denial keep the line from being read.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const eyeKey = '!items!lotmAbilityW4001';
    const eye = await getOptionalJson(abilitiesDb, eyeKey);
    if (!eye) throw new Error('Legacy target lotmAbilityW4001 not found.');
    const eyeHeader = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
    if (!String(eye.system?.description?.value ?? '').includes(eyeHeader)) {
      eye.system.description.value +=
        `${eyeHeader}<p>At Sequence 3, Eye of Demon Hunting reads deeper structural flaws. ` +
        `Increase its weakness-exploitation bonus by <strong>+Potency</strong> when the target is corrupted, possessed, or using a transformed body state. ` +
        `If you spend at least +2 Spirituality, the first successful hit against that target this round also suppresses one movement-based escape rider.</p>`;
    }
    eye._stats = buildStats(now + 2, eye._stats);
    await abilitiesDb.put(eyeKey, JSON.stringify(eye));

    const ointmentKey = '!items!lotmAbilityW4002';
    const ointment = await getOptionalJson(abilitiesDb, ointmentKey);
    if (!ointment) throw new Error('Legacy target lotmAbilityW4002 not found.');
    const ointmentHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    if (!String(ointment.system?.description?.value ?? '').includes(ointmentHeader)) {
      ointment.system.description.value +=
        `${ointmentHeader}<p>At Sequence 3, weapon compounds are stabilized for high-tempo use. ` +
        `Once per round, reduce Weapon Ointment Mastery spirituality surcharge by <strong>1</strong> (minimum 0). ` +
        `If this discount is used, one profile-switch this turn does not consume your normal switch allowance.</p>`;
    }
    ointment._stats = buildStats(now + 3, ointment._stats);
    await abilitiesDb.put(ointmentKey, JSON.stringify(ointment));

    const w3001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW3001');
    const w3002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW3002');
    const w3003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW3003');
    const w3004Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW3004');

    const abilities = [
      {
        _id: 'lotmAbilityW3001',
        name: 'Mercury Liquefaction',
        type: 'spell',
        img: 'icons/magic/water/projectile-ice-black.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Transform into a silvery liquid state for 1 round. In this state you can flow through gaps up to 1 inch wide, gain resistance to non-magical bludgeoning/piercing/slashing damage, and move through hostile spaces without provoking opportunity attacks. You cannot cast non-Warrior spells while liquefied.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li><li><strong>+2 Spirituality:</strong> While liquefied, you can restrain one adjacent creature at end of your movement (Strength save ends at end of its turn).</li><li><strong>+4 Spirituality:</strong> Entering or leaving liquefaction emits a slicing mercury burst in 5 feet; creatures take damage equal to <strong>Potency</strong> on a failed Dexterity save (half on success).</li></ul><p><em>Counterplay:</em> Area containment, anti-transformation fields, and high heat/cold hazards can limit flow-state value.</p><p><em>Corruption Hook:</em> Every cast forces a stability check; failure adds one stage of predatory impulse until short rest.</p>',
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
          level: 6,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a drop of quicksilver sealed in wax',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq3Act001: buildActivity({
              id: 'warriorSeq3Act001',
              activationType: 'bonus',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-warrior-mercury-liquefaction',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 4, w3001Existing?._stats),
        sort: 800600,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW3002',
        name: 'Silver Rapier',
        type: 'spell',
        img: 'icons/weapons/swords/rapier-ornate-gold.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Materialize a silver dawn rapier for 1 minute. It counts as magical, has top-tier precision, and on hit can sever one minor defensive link (ward thread, spectral tether, low-tier shield rider). Against corrupted or undead targets, add <strong>+Potency</strong> damage.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may throw the rapier to 30 feet and immediately recall it without using an object interaction.</li><li><strong>+2 Spirituality:</strong> First hit each turn also applies a purification mark; marked target has disadvantage on one save against your next Warrior ability this round.</li><li><strong>+4 Spirituality:</strong> You may split the rapier into two mirrored blades for 1 round, making one additional off-hand strike each turn (no ability modifier to damage unless already granted).</li></ul><p><em>Counterplay:</em> Weapon disarm zones and heavy reach denial weaken rapier tempo.</p><p><em>Corruption Hook:</em> If used for slaughter without cause, gain 1 Corruption.</p>',
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
          level: 6,
          school: 'evc',
          properties: ['somatic'],
          materials: {
            value: 'a thin silver wire wrapped around a hilt fragment',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq3Act002: buildActivity({
              id: 'warriorSeq3Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-silver-rapier',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 5, w3002Existing?._stats),
        sort: 800601,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW3003',
        name: 'Light Concealment',
        type: 'spell',
        img: 'icons/magic/light/rays-hidden-cage-yellow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Fold surrounding dawn-glare around yourself for 1 minute. You become visually indistinct, gaining advantage on Stealth checks in lit areas and forcing disadvantage on attack rolls made by creatures farther than 20 feet away. Your hostile actions do not automatically end this effect, but they reveal your exact position until end of current turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend concealment to one ally within 15 feet.</li><li><strong>+2 Spirituality:</strong> Concealed targets gain resistance to opportunity-attack damage.</li><li><strong>+4 Spirituality:</strong> Once during duration, teleport up to 20 feet to a visible lit space, leaving a decoy silhouette until the start of your next turn.</li></ul><p><em>Counterplay:</em> Tremorsense, blindsight, and locked-area effects can still pin your location.</p><p><em>Corruption Hook:</em> If used to betray your defended line, gain 1 Corruption.</p>',
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
          level: 6,
          school: 'ill',
          properties: ['somatic'],
          materials: {
            value: 'a mirror shard coated with pale oil',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq3Act003: buildActivity({
              id: 'warriorSeq3Act003',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-warrior-light-concealment',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 6, w3003Existing?._stats),
        sort: 800602,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW3004',
        name: 'Hurricane of Light',
        type: 'spell',
        img: 'icons/magic/light/projectile-flare-blast.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Ignite transparent dawn flame and sweep a 20-foot cone of raging light. Creatures in the cone make a Dexterity save; on fail they take radiant/slashing damage equal to <strong>2 x Potency</strong> and lose concentration on ongoing effects, on success half damage and maintain concentration.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Cone increases to 30 feet.</li><li><strong>+2 Spirituality:</strong> Failed targets are also pushed 10 feet and cannot take reactions until start of your next turn.</li><li><strong>+4 Spirituality:</strong> The cone leaves a lingering dawn storm zone (10-foot radius at cone end) until end of your next turn; creatures entering it take Potency radiant damage once per round.</li></ul><p><em>Backlash:</em> After casting, make a willpower check; on failure, you gain one stage of overheat/frenzy penalty until short rest.</p><p><em>Counterplay:</em> Spread formations, hard cover, and reaction displacement can blunt cone impact.</p>',
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
              special: 'creatures in a 20-foot cone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'cone'
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
          school: 'evc',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a strip of silver cloth ignited with dawn fire',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq3Act004: buildActivity({
              id: 'warriorSeq3Act004',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-hurricane-of-light',
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
            grantedSequence: 3
          }
        },
        _stats: buildStats(now + 7, w3004Existing?._stats),
        sort: 800603,
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
      legacyUpdated: [eyeKey, ointmentKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
