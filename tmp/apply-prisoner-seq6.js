const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU6001';
const ABILITY_2_ID = 'lotmAbilityU6002';
const ABILITY_3_ID = 'lotmAbilityU6003';

const LEGACY_A_ID = 'lotmAbilityU9001';
const LEGACY_B_ID = 'lotmAbilityU8002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 6, <strong>Shacklecraft</strong> carries corpse-cold pressure. ' +
  'When a creature fails Shacklecraft\'s save, it takes additional necrotic or cold damage equal to <strong>Potency</strong> (your choice). ' +
  'If the target is already grappled, restrained, or immobilized, this bonus damage increases to <strong>2 x Potency</strong> once per turn.</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 6, <strong>Bound Shadow</strong> can anchor through death traces. ' +
  'When you cast Bound Shadow with at least <strong>+1 Spirituality</strong>, choose one corpse, undead, or blood-marked location within 60 feet as a secondary anchor. ' +
  'A marked target entering or starting its turn within 10 feet of that anchor repeats the baseline anti-hide/escape rider until the start of your next turn. ' +
  'Once per cast, you may shift the secondary anchor up to 20 feet as a bonus action.</p>';

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
    img: 'icons/creatures/undead/zombie-hunched-armor-green.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>' +
          '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Leashed Frenzy, Bound Shadow, plus one legacy scope upgrade to Shacklecraft.</p>' +
          '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Werewolf Transformation, Dark Horror, Repel Light, plus two legacy upgrades (Shacklecraft and Leashed Frenzy).</p>' +
          '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Zombie Husk, Frostbound Decay, Corpse String, plus two legacy upgrades (Shacklecraft and Bound Shadow).</p>' +
          '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Zombie), restraint becomes corpse-hard persistence: feral motion is hardened into steel-like survivability, cold-field confinement, and dead-hand control that drags foes into kill lanes.</p>',
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
      level: 3,
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
        grantedSequence: 6
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 6).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 6)
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
      name: 'Zombie Husk',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Harden into a corpse-steel state for 10 minutes. Gain temporary HP equal to <strong>2 x Potency</strong>, resistance to poison damage, and advantage on checks/saves against being shoved, knocked prone, or grappled. If you take non-radiant weapon damage, reduce it by 1 (minimum 0) while this state lasts.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Temporary HP becomes <strong>3 x Potency</strong>, and you gain advantage on Constitution saves against ongoing effects.</li>' +
        '<li><strong>+2 Spirituality:</strong> Once per round as a reaction when hit, reduce incoming bludgeoning/piercing/slashing damage by <strong>Potency</strong>.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once while active, when you would drop to 0 HP, drop to 1 instead and immediately force adjacent hostiles (within 5 feet) to make a Constitution save or have speed reduced to 0 until end of turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> radiant/theurgical damage, spirit-body attacks, and sustained control can bypass or outlast this shell.</p>' +
        '<p><em>Corruption Hook:</em> If you lean on this state to casually butcher subdued enemies, gain 1 Corruption.</p>',
      img: 'icons/creatures/undead/zombie-hunched-armor-green.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic'],
      materials: 'a strip of embalming cloth and a gray nail fragment',
      identifier: 'lotm-prisoner-zombie-husk',
      activityId: 'prisonerSeq6Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000300
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Frostbound Decay',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Condense corpse-cold frost in a 15-foot radius centered on a point within 60 feet for 1 minute (concentration). The area is difficult terrain for hostiles. A hostile creature entering or starting its turn in the area makes a Constitution save; on failure, its speed is halved until the start of its next turn and it takes cold damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 20 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> On a failed save, target also loses reactions until the start of its next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a creature fails this save, you may pull it up to 10 feet toward the area center. If it was already slowed by this ability, it must also pass a Strength save or become restrained until end of turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> teleportation, flight with no ground contact, and anti-terrain movement modes reduce this field.</p>' +
        '<p><em>Corruption Hook:</em> If used only to prolong terror in helpless crowds, gain 1 Corruption.</p>',
      img: 'icons/magic/water/barrier-ice-crystal-wall-jagged-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '15-foot-radius point you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'frosted grave-soil packed in black cloth',
      identifier: 'lotm-prisoner-frostbound-decay',
      activityId: 'prisonerSeq6Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000301
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Corpse String',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Animate one Small or Medium corpse within 30 feet for 1 minute as a tethered puppet under your command (speed 20). On each of your turns, command it to do one: <strong>Pin</strong> (adjacent creature makes Strength save or is grappled until end of its next turn), <strong>Rake</strong> (adjacent creature takes necrotic damage equal to <strong>Potency</strong>), or <strong>Block</strong> (its space and adjacent 5 feet become difficult terrain for hostiles until your next turn).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> You may animate one additional valid corpse.</li>' +
        '<li><strong>+2 Spirituality:</strong> Command range becomes 60 feet, and each puppet gains +<strong>Potency</strong> to grapple escape DC.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a puppet successfully Pins a target, you may force that target to make a Constitution save or suffer speed 0 until end of turn and take additional necrotic damage equal to <strong>Potency</strong>.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> corpse denial, radiant consecration, and forced puppet displacement can break this control loop.</p>' +
        '<p><em>Corruption Hook:</em> If you animate civilian dead purely for intimidation theater, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-skeleton-assembled-bone-white.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one Small or Medium corpse within range',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a knotted tendon cord or rusted restraint wire',
      identifier: 'lotm-prisoner-corpse-string',
      activityId: 'prisonerSeq6Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000302
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
