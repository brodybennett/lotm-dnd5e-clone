const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU7001';
const ABILITY_2_ID = 'lotmAbilityU7002';
const ABILITY_3_ID = 'lotmAbilityU7003';

const LEGACY_A_ID = 'lotmAbilityU9001';
const LEGACY_B_ID = 'lotmAbilityU8001';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 7, <strong>Shacklecraft</strong> can be threaded directly through your assault rhythm. ' +
  'While you are under <strong>Werewolf Transformation</strong> or <strong>Leashed Frenzy</strong>, once per turn when you hit with a melee, unarmed, or improvised attack, ' +
  'you may trigger Shacklecraft\'s baseline bind attempt against that same target without spending an action. ' +
  'This free trigger still allows a save and cannot apply the +2 restrain rider unless you paid that upcast on a full cast this turn.</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 7, <strong>Leashed Frenzy</strong> gains feral striking pressure. ' +
  'While Leashed Frenzy is active, your first qualifying hit each turn deals additional damage equal to <strong>Potency</strong> (for a total of +2 x Potency on that hit). ' +
  'If you cast Leashed Frenzy with at least <strong>+2 Spirituality</strong>, its first forced-movement rider each turn becomes 10 feet instead of 5.</p>';

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
    img: 'icons/creatures/mammals/wolf-howl-moon-black.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>' +
          '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Leashed Frenzy, Bound Shadow, plus one legacy scope upgrade to Shacklecraft.</p>' +
          '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Werewolf Transformation, Dark Horror, Repel Light, plus two legacy upgrades (Shacklecraft and Leashed Frenzy).</p>' +
          '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Werewolf), restraint no longer means immobility: you weaponize suppression into feral bursts, predatory regeneration, and darkness pressure while full-moon instability remains a live corruption risk.</p>',
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
      level: 2,
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
        grantedSequence: 7
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 7).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 7)
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
      name: 'Werewolf Transformation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Transform for 1 minute into a controlled werewolf state. You gain +10 feet speed, advantage on Perception checks using smell/hearing, and natural claw attacks (or empowered unarmed strikes) that count as magical. Once per turn on a qualifying hit, deal extra damage equal to <strong>Potency</strong>. At the end of each of your turns, make a Wisdom save (DC 8 + Potency). On a failure, you cannot take reactions until the start of your next turn and must move toward the nearest hostile creature if able.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Gain temporary HP equal to <strong>Potency</strong>, and advantage on checks/saves to resist grapple, prone, or forced movement.</li>' +
        '<li><strong>+2 Spirituality:</strong> Your first two qualifying hits each turn gain the extra Potency damage, and on the first hit you may force a Strength save to push the target 5 feet.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per turn after your first qualifying hit, make one additional claw or unarmed attack against a different creature within reach. If you fail your end-turn save by 5 or more while this tier is active, gain 1 Corruption.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> radiant/theurgical pressure, reach kiting, and forced repositioning can blunt your transformed tempo.</p>' +
        '<p><em>Corruption Hook:</em> Full Moon scenes may impose disadvantage on the end-turn control save at GM discretion unless mitigated by preparation.</p>',
      img: 'icons/creatures/mammals/wolf-howl-moon-black.webp',
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
      materials: 'a black-green fang or tuft of dark fur',
      identifier: 'lotm-prisoner-werewolf-transformation',
      activityId: 'prisonerSeq7Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000200
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Dark Horror',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Condense darkness like cold frost around one creature within 60 feet. The target makes a Wisdom save. On a failure, it becomes frightened of you until the end of your next turn, its speed is reduced by 10 feet, and it has disadvantage on its next attack roll before that time. On success, it suffers only the speed reduction.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional creature within 10 feet of the original target (separate save).</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; affected creatures repeat the save at end of each turn to end the frightened and disadvantage riders.</li>' +
        '<li><strong>+4 Spirituality:</strong> The zone around each failed target (10-foot radius) becomes heavy dimness for 1 minute; hostile creatures in that zone treat it as difficult terrain and cannot take reactions on the turn they fail their save.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> fear immunity, bright-radiant suppression, and line-of-sight denial reduce this control package.</p>' +
        '<p><em>Corruption Hook:</em> If you repeatedly use this to psychologically break noncombatants, gain 1 Corruption.</p>',
      img: 'icons/magic/death/projectile-skull-fire-purple.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic'],
      materials: 'a chilled coal wrapped in dark cloth',
      identifier: 'lotm-prisoner-dark-horror',
      activityId: 'prisonerSeq7Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000201
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Repel Light',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, deepen surrounding dimness within 15 feet of you; mundane faint light is suppressed to shadow. While active, you gain +<strong>Potency</strong> to Stealth checks in dim light/darkness and advantage on checks against visual tracking or superficial spirit-reading. Once per turn, when a hostile creature enters the aura, it takes a -1 penalty to Perception checks until the start of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Aura radius becomes 20 feet, and one ally within 15 feet also gains the Stealth bonus.</li>' +
        '<li><strong>+2 Spirituality:</strong> You may move the aura center up to 20 feet as a bonus action each turn while it remains within 60 feet of you.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once during the duration, suppress one non-sunlight magical light source in the aura until the end of your next turn, and mark one creature in the aura: it cannot benefit from invisibility against you until start of your next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> strong sunlight effects, wide-area radiant fields, and blind-fight senses reduce this ability\'s advantage.</p>' +
        '<p><em>Corruption Hook:</em> If used to conceal predation against helpless targets, gain 1 Corruption.</p>',
      img: 'icons/magic/light/explosion-star-small-blue-yellow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'ill',
      properties: ['somatic', 'material'],
      materials: 'a soot-blackened lens shard',
      identifier: 'lotm-prisoner-repel-light',
      activityId: 'prisonerSeq7Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000202
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
