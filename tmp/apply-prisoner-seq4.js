const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU4001';
const ABILITY_2_ID = 'lotmAbilityU4002';
const ABILITY_3_ID = 'lotmAbilityU4003';
const ABILITY_4_ID = 'lotmAbilityU4004';

const LEGACY_A_ID = 'lotmAbilityU5002';
const LEGACY_B_ID = 'lotmAbilityU6002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 4, <strong>Wraith Possession</strong> gains saint-tier soul pressure. ' +
  'When a target fails its first save against Wraith Possession each casting, it takes immediate psychic damage equal to <strong>Potency</strong>. ' +
  'If it is already cursed, restrained, or slowed by your pathway effects, this bonus becomes <strong>2 x Potency</strong> (once per round).</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 4, <strong>Frostbound Decay</strong> can bifurcate into puppet-stage kill lanes. ' +
  'When cast with at least <strong>+2 Spirituality</strong>, split the field into two 15-foot-radius zones within 60 feet of each other. ' +
  'A creature can only be affected by one zone per round, but your pull/lock riders can trigger from either zone. ' +
  'Once per short rest, this split can be used without paying the +2 surcharge.</p>';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
    ...(existing ?? {}),
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

async function findPathwayByIdentifier(db, identifier) {
  for await (const [key, raw] of db.iterator({ gte: '!items!', lt: '!items!~' })) {
    const doc = JSON.parse(raw);
    if (doc?.system?.identifier === identifier) return { key, doc };
  }
  return null;
}

function buildPathwayDoc({ pathwayId, existing, now }) {
  return {
    ...(existing ?? {}),
    _id: pathwayId,
    name: PATHWAY_NAME,
    type: 'class',
    img: 'icons/skills/wounds/anatomy-organ-brain-pink-red.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>' +
          '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Leashed Frenzy, Bound Shadow, plus one legacy scope upgrade to Shacklecraft.</p>' +
          '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Werewolf Transformation, Dark Horror, Repel Light, plus two legacy upgrades (Shacklecraft and Leashed Frenzy).</p>' +
          '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Zombie Husk, Frostbound Decay, Corpse String, plus two legacy upgrades (Shacklecraft and Bound Shadow).</p>' +
          '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Wraith Transformation, Wraith Possession, Mirror Blink, plus two legacy upgrades (Bound Shadow and Dark Horror).</p>' +
          '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Source of Curses, Poltergeist, Sympathetic Effigy, Marionette Grip, plus two legacy upgrades (Wraith Possession and Frostbound Decay).</p>' +
          '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Puppet), restraint becomes saint-tier curse architecture: established links, controlled inanimate violence, and layered confinement through puppet channels.</p>',
        chat: existing?.system?.description?.chat ?? ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      startingEquipment: existing?.system?.startingEquipment ?? [],
      identifier: PATHWAY_IDENTIFIER,
      levels: existing?.system?.levels ?? 1,
      advancement: existing?.system?.advancement ?? [],
      spellcasting: {
        progression: 'full',
        ability: 'wis',
        preparation: {
          formula: ''
        }
      },
      wealth: existing?.system?.wealth ?? '4d4*10',
      primaryAbility: {
        value: ['wis'],
        all: false
      },
      hd: {
        denomination: 'd8',
        spent: 0,
        additional: ''
      }
    },
    effects: existing?.effects ?? [],
    folder: existing?.folder ?? null,
    flags: {
      ...(existing?.flags ?? {}),
      lotm: {
        ...(existing?.flags?.lotm ?? {}),
        sourceBook: 'LoTM Core'
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort: existing?.sort ?? 2000000,
    ownership: existing?.ownership ?? { default: 0 }
  };
}

function buildAbilityDoc({
  id,
  name,
  description,
  img,
  activationType,
  durationValue,
  durationUnits,
  targetType,
  targetCount,
  targetSpecial,
  rangeUnits,
  rangeValue,
  rangeSpecial,
  school,
  properties,
  materials,
  identifier,
  activityId,
  now,
  existing,
  sort
}) {
  return {
    ...(existing ?? {}),
    _id: id,
    name,
    type: 'spell',
    img,
    system: {
      ...(existing?.system ?? {}),
      description: {
        value: description,
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
        type: activationType,
        condition: '',
        value: null
      },
      duration: {
        value: durationValue,
        units: durationUnits
      },
      target: {
        affects: {
          choice: false,
          count: targetCount,
          type: targetType,
          special: targetSpecial
        },
        template: {
          units: '',
          contiguous: false,
          type: ''
        }
      },
      range: {
        units: rangeUnits,
        value: rangeValue,
        special: rangeSpecial
      },
      uses: {
        max: '',
        spent: 0,
        recovery: []
      },
      level: 5,
      school,
      properties,
      materials: {
        value: materials,
        consumed: false,
        cost: 0,
        supply: 0
      },
      preparation: {
        mode: 'always',
        prepared: false
      },
      activities: {
        [activityId]: buildActivity({
          id: activityId,
          activationType,
          durationUnits
        })
      },
      identifier,
      method: 'spell',
      prepared: 1,
      spiritualityCost: null,
      sourceClass: PATHWAY_IDENTIFIER
    },
    effects: existing?.effects ?? [],
    folder: FOLDER_ID,
    flags: {
      ...(existing?.flags ?? {}),
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        ...(existing?.flags?.lotm ?? {}),
        sourceBook: 'LoTM Core',
        grantedSequence: 4
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort,
    ownership: existing?.ownership ?? { default: 0 }
  };
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const foundPathway = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = foundPathway?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = foundPathway?.key ?? `!items!${pathwayId}`;
    const existingPathway = foundPathway?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

    const pathwayDoc = buildPathwayDoc({ pathwayId, existing: existingPathway, now });
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = `!folders!${FOLDER_ID}`;
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    if (!existingFolder) throw new Error(`Expected ability folder ${FOLDER_ID} (${PATHWAY_NAME}) to exist.`);

    const currentLatest = Number(existingFolder?.flags?.lotm?.latestAuthoredSequence ?? 9);
    const folderDoc = {
      ...existingFolder,
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 4).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 4)
        }
      },
      _stats: buildStats(now + 1, existingFolder._stats)
    };
    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const legacyAKey = `!items!${LEGACY_A_ID}`;
    const legacyBKey = `!items!${LEGACY_B_ID}`;
    const legacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const legacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    if (!legacyA) throw new Error(`Legacy target ${LEGACY_A_ID} not found.`);
    if (!legacyB) throw new Error(`Legacy target ${LEGACY_B_ID} not found.`);

    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(LEGACY_A_HEADER)) {
      legacyA.system.description.value = `${legacyADesc}${LEGACY_A_HEADER}${LEGACY_A_TEXT}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(legacyAKey, JSON.stringify(legacyA));

    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(LEGACY_B_HEADER)) {
      legacyB.system.description.value = `${legacyBDesc}${LEGACY_B_HEADER}${LEGACY_B_TEXT}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(legacyBKey, JSON.stringify(legacyB));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existingAbility3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existingAbility4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Source of Curses',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose one creature within 90 feet and establish a curse line through name, blood, trace, or direct sight. Target makes a Wisdom save. On failure, choose one curse mode until the end of your next turn: <strong>Shackle Pain</strong> (psychic damage = Potency and disadvantage on next attack), <strong>Withering Step</strong> (speed halved, no Dash), or <strong>Sealed Pulse</strong> (cannot regain hit points). On success, target takes half psychic damage and no mode.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Target one additional creature with separate save.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> If target is already cursed/restrained/slowed by your pathway, apply a second curse mode at the same time (one target per cast).</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> anti-curse wards, severed line-of-sympathy, and spiritual cleansing reduce reliability.</p>' +
        '<p><em>Corruption Hook:</em> If you layer curses on helpless captives for ritual cruelty, gain 1 Corruption.</p>',
      img: 'icons/magic/death/hand-undeath-curses-grasp.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature linked by sight, name, or trace',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a marked wax seal or blood-thread knot',
      identifier: 'lotm-prisoner-source-of-curses',
      activityId: 'prisonerSeq4Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000500
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Poltergeist',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Awaken lifeless objects in a 20-foot radius centered on a point within 60 feet for 1 minute (concentration). Hostile creatures entering or starting turn in the zone make a Dexterity save. On failure, they take bludgeoning damage equal to <strong>Potency</strong> and treat the area as difficult terrain until end of turn. Unattended objects in zone can be repositioned up to 10 feet per round.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 30 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> On failed save, creature also drops one held item or loses reactions (your choice).</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, launch one awakened object as a focused strike: spell attack vs one creature in zone; on hit, deal additional damage equal to <strong>2 x Potency</strong> and push 10 feet.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> object-poor terrain, anti-telekinesis effects, and zone displacement can blunt this control.</p>' +
        '<p><em>Corruption Hook:</em> If used to animate funeral offerings as intimidation theater, gain 1 Corruption.</p>',
      img: 'icons/magic/control/telekinesis-stone-glow.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '20-foot-radius object-control zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'three small lifeless tokens (nail, coin, shard)',
      identifier: 'lotm-prisoner-poltergeist',
      activityId: 'prisonerSeq4Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000501
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Sympathetic Effigy',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Shape a temporary puppet effigy linked to one creature you can see within 60 feet for 1 minute (concentration). While linked, once per round as a bonus action choose one: <strong>Pinch Line</strong> (target takes psychic damage = Potency), <strong>Tug Tendon</strong> (target speed -10 until end of turn), or <strong>Mute Pulse</strong> (target has disadvantage on next concentration check before end of turn).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Link range becomes 90 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> You may affect one additional linked target (separate effigy check/save on cast).</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per cast, when a linked target fails a save against your pathway ability, immediately trigger one extra effigy option without using a bonus action.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> severing sympathy links, anti-ritual circles, and concealment of true identity reduce link reliability.</p>' +
        '<p><em>Corruption Hook:</em> If you create effigies from innocents solely to extort others, gain 1 Corruption.</p>',
      img: 'icons/commodities/treasure/token-gold-round.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature linked by temporary effigy',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'a wax doll core and one trace from the target',
      identifier: 'lotm-prisoner-sympathetic-effigy',
      activityId: 'prisonerSeq4Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000502
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Marionette Grip',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Cast invisible puppet strings onto one creature within 60 feet. Target makes a Strength save. On failure, it is restrained until the end of your next turn. While restrained this way, you may use a bonus action to move it up to 10 feet in a straight line. If moved into hazard/object, it takes bludgeoning damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional creature within 15 feet of the first target (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn); on each failed repeat save, target cannot take reactions until start of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a restrained target fails its save by 5 or more, you may force it to use its reaction for one basic attack against a target of your choice within reach.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> teleportation, enormous mass differences, and anti-control barriers reduce puppet-string authority.</p>' +
        '<p><em>Corruption Hook:</em> If you force allies to harm each other for spectacle after surrender, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature bound by puppet strings',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a knotted marionette wire loop',
      identifier: 'lotm-prisoner-marionette-grip',
      activityId: 'prisonerSeq4Act004',
      now: now + 7,
      existing: existingAbility4,
      sort: 2000503
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacy: [
            {
              key: legacyAKey,
              id: verifyLegacyA?._id,
              name: verifyLegacyA?.name,
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(
                LEGACY_A_HEADER
              ),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: legacyBKey,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(
                LEGACY_B_HEADER
              ),
              grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
              level: verifyLegacyB?.system?.level
            }
          ],
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`, `!items!${ABILITY_4_ID}`],
          abilityReadBack: [
            {
              _id: verify1?._id,
              name: verify1?.name,
              sourceClass: verify1?.system?.sourceClass,
              identifier: verify1?.system?.identifier,
              grantedSequence: verify1?.flags?.lotm?.grantedSequence,
              level: verify1?.system?.level,
              folder: verify1?.folder
            },
            {
              _id: verify2?._id,
              name: verify2?.name,
              sourceClass: verify2?.system?.sourceClass,
              identifier: verify2?.system?.identifier,
              grantedSequence: verify2?.flags?.lotm?.grantedSequence,
              level: verify2?.system?.level,
              folder: verify2?.folder
            },
            {
              _id: verify3?._id,
              name: verify3?.name,
              sourceClass: verify3?.system?.sourceClass,
              identifier: verify3?.system?.identifier,
              grantedSequence: verify3?.flags?.lotm?.grantedSequence,
              level: verify3?.system?.level,
              folder: verify3?.folder
            },
            {
              _id: verify4?._id,
              name: verify4?.name,
              sourceClass: verify4?.system?.sourceClass,
              identifier: verify4?.system?.identifier,
              grantedSequence: verify4?.flags?.lotm?.grantedSequence,
              level: verify4?.system?.level,
              folder: verify4?.folder
            }
          ]
        },
        null,
        2
      )
    );
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
