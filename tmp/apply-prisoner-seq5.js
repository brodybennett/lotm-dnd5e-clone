const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU5001';
const ABILITY_2_ID = 'lotmAbilityU5002';
const ABILITY_3_ID = 'lotmAbilityU5003';

const LEGACY_A_ID = 'lotmAbilityU8002';
const LEGACY_B_ID = 'lotmAbilityU7002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 5, <strong>Bound Shadow</strong> can be invoked as a snap-veil under pressure. ' +
  'Once per short rest, when a creature fails a save against your Wraith Possession, Dark Horror, or Frostbound Decay, you may cast Bound Shadow as a <strong>bonus action</strong> at baseline cost against that creature or its current location.</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 5, <strong>Dark Horror</strong> can propagate through reflective surfaces. ' +
  'When Dark Horror affects a creature within 10 feet of a mirror, polished metal, ice sheet, or standing water reflection, choose one additional creature within 15 feet of that reflection. ' +
  'The second creature must make the same save against Dark Horror\'s baseline rider (once per cast).</p>';

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
    img: 'icons/creatures/undead/ghost-shadow-blue.webp',
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
          '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Wraith), restraint slips into spirit-flesh infiltration: you become a near-phantom hunter using mirror traversal, possession control, and soul-pressure while full-moon curse risk remains active.</p>',
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
      level: 4,
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
        grantedSequence: 5
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
    if (!existingFolder) {
      throw new Error(`Expected ability folder ${FOLDER_ID} (${PATHWAY_NAME}) to exist.`);
    }

    const currentLatest = Number(existingFolder?.flags?.lotm?.latestAuthoredSequence ?? 9);
    const folderDoc = {
      ...existingFolder,
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 5).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 5)
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

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Wraith Transformation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Transform for 1 minute into a spirit-flesh phantom state. You gain fly speed 30 (hover), can pass through non-magical obstacles up to 5 feet thick (cannot end movement inside objects), and gain resistance to non-magical bludgeoning/piercing/slashing damage. You may also make one spirit lash each turn that deals psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Passing-through thickness becomes 10 feet, and you gain advantage on Stealth checks in dim light/darkness.</li>' +
        '<li><strong>+2 Spirituality:</strong> Gain partial psychic reflection. Once per round when you take psychic damage, attacker makes Wisdom save or takes psychic damage equal to <strong>Potency</strong>.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once during duration, if reduced to 0 HP, remain at 1 HP and become incorporeal until end of your next turn. After this triggers, gain 1 Corruption.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> purification/theurgical effects and spirit-harming tools bypass much of this state.</p>' +
        '<p><em>Corruption Hook:</em> Remaining too long in phantom state around full-moon pressure can escalate instability at GM discretion.</p>',
      img: 'icons/creatures/undead/ghost-shadow-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic'],
      materials: 'a mirror shard dipped in cold grave-water',
      identifier: 'lotm-prisoner-wraith-transformation',
      activityId: 'prisonerSeq5Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000400
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Wraith Possession',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 30 feet that you can see. It makes a Wisdom save. On failure, you partially overlap with its spirit until the start of your next turn: it cannot take reactions, and on its turn you choose either its movement (up to half speed) or one action (no spellcasting above cantrip-equivalent). On success, target takes psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Range becomes 60 feet, and failed target also has disadvantage on concentration checks until start of your next turn.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (target repeats Wisdom save at end of each turn to end).</li>' +
        '<li><strong>+4 Spirituality:</strong> While possession persists, when target takes damage from your abilities, it takes additional psychic damage equal to <strong>Potency</strong> once per round.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> strong will defenses, anti-possession wards, and line-of-sight denial reduce reliability.</p>' +
        '<p><em>Corruption Hook:</em> Forcing self-harm through possession outside immediate tactical need grants 1 Corruption.</p>',
      img: 'icons/magic/death/skeleton-skull-soul-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature you can see',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a thread of hair wrapped around a polished nail',
      identifier: 'lotm-prisoner-wraith-possession',
      activityId: 'prisonerSeq5Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000401
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Mirror Blink',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Teleport up to 30 feet between two reflective points (mirror, still water, polished metal, ice, or eye reflections at GM discretion) you can perceive. After teleporting, gain advantage on your next Stealth or Grapple check before end of turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Range becomes 60 feet, and you may bring one willing ally within 5 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> After blinking, choose one creature within 10 feet; it makes a Wisdom save or cannot take reactions until start of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> Chain one additional blink immediately (different destination), and your first attack or ability against a creature this turn gains +<strong>Potency</strong> to hit or DC.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> shattered/covered reflections, anti-teleport zones, and bright purification fields can suppress this mobility.</p>' +
        '<p><em>Corruption Hook:</em> Using mirror routes to stalk non-hostile civilians for predation grants 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-small-blue.webp',
      activationType: 'bonus',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'ill',
      properties: ['somatic', 'material'],
      materials: 'a sliver of mirror or blackened coin',
      identifier: 'lotm-prisoner-mirror-blink',
      activityId: 'prisonerSeq5Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000402
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, legacyAKey);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, legacyBKey);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);

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
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`, `!items!${ABILITY_3_ID}`],
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
