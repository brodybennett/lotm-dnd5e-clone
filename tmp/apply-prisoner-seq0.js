const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU0001';
const ABILITY_2_ID = 'lotmAbilityU0002';
const ABILITY_3_ID = 'lotmAbilityU0003';
const ABILITY_4_ID = 'lotmAbilityU0004';

const LEGACY_A_ID = 'lotmAbilityU2004';
const LEGACY_B_ID = 'lotmAbilityU3002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 0, <strong>Curse Vessel Domain</strong> can overlap with symbolic curse strata. ' +
  'Once per cast, create a second linked vessel zone (15-foot radius) within 90 feet of the first. ' +
  'Creatures that fail saves in either zone can be treated as if they failed in both for one chosen rider this round. ' +
  'The overlap may be sustained for up to 3 rounds.</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 0, <strong>Transfiguration Curse</strong> gains king-tier conversion pressure. ' +
  'On the first failed save each cast, target takes immediate psychic damage equal to <strong>2 x Potency</strong> and has disadvantage on its next save against your pathway abilities. ' +
  'If target is already affected by a Binding or Curse zone of yours, this bonus becomes <strong>3 x Potency</strong> (once per cast).</p>';

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
    img: 'icons/magic/death/skull-energy-light-white.webp',
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
          '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Silent Curse Brewing, Transfiguration Curse, Cursed Artifact Possession, plus two legacy upgrades (Source of Curses and Wraith Possession).</p>' +
          '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Dwelling Space, Bane Gaze, Spirit Siphon, Curse Vessel Domain, plus two legacy upgrades (Source of Curses and Wraith Possession).</p>' +
          '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Abomination Manifestation, Deviant Conversion, Black Mire Seal, Invisible Curse, plus two legacy upgrades (Transfiguration Curse and Source of Curses).</p>' +
          '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Temperance Sovereignty, Deviant Dominion, Binding Unity, Symbolic Curse, plus two legacy upgrades (Curse Vessel Domain and Transfiguration Curse).</p>' +
          '<p><strong>Pathway Completion:</strong> Sequence 9 through Sequence 0 authored.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Chained), the pathway reaches concentrated authority over Curses, Restraint, Deviants, and Objects: symbolic curse routing, king-level suppression of deviance, and overwhelming temperance control.</p>',
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
      level: 9,
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
        grantedSequence: 0
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 0).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 0)
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
      name: 'Temperance Sovereignty',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Target up to two creatures within 120 feet. Each makes a Wisdom save. On failure, choose two seals for 1 minute (save ends each turn): <strong>Impulse Seal</strong> (cannot take reactions), <strong>Drive Seal</strong> (speed halved, cannot Dash), <strong>Focus Seal</strong> (disadvantage on concentration checks), or <strong>Violence Seal</strong> (cannot make opportunity attacks and deals -Potency damage on first hit each turn).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Target one additional creature.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a sealed target fails any save, you may impose one extra seal until the end of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> anti-curse sanctification, strong temperance wards, and line-of-effect breaks can reduce seal persistence.</p>' +
        '<p><em>Corruption Hook:</em> Using sovereign seals to strip free will of bystanders for vanity grants 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'up to two creatures to temperance-seal',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a linked tri-ring chain inscribed with restraint sigils',
      identifier: 'lotm-prisoner-temperance-sovereignty',
      activityId: 'prisonerSeq0Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Deviant Dominion',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Choose up to two deviants, transformed creatures, or cursed targets within 90 feet. They make Wisdom saves. On failure, they fall under your dominion until the end of your next turn: you choose movement and one action each (no high-tier spellcasting). Non-deviant targets that fail are partially converted, taking psychic damage equal to <strong>Potency</strong> and losing reactions.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional target.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a dominated target drops a creature to 0 HP, another failed target in range must make a Wisdom save or become frightened until end of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> mind-shielding, purity rites, and severing deviant tags can disrupt control authority.</p>' +
        '<p><em>Corruption Hook:</em> Forcing allies to slaughter each other when surrender is possible grants 1 Corruption.</p>',
      img: 'icons/creatures/magical/humanoid-silhouette-dashing-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'up to two deviant or cursed targets',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a black-thread leash tied to a broken doll hand',
      identifier: 'lotm-prisoner-deviant-dominion',
      activityId: 'prisonerSeq0Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Binding Unity',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Establish a 30-foot-radius unity field centered on a point within 90 feet for 1 minute (concentration). Hostile creatures in the field make Strength saves on entry/start turn. On failure, they are restrained until end of turn and cannot benefit from teleportation, forced incorporeality, or object-based evasion until the start of their next turn. Objects and summoned constructs in zone are also treated as difficult terrain to move.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 40 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, choose one failed target: it must make an additional Wisdom save or lose one active buff/effect of your choice until end of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> disrupting concentration, zone displacement, and anti-binding relics reduce lock strength.</p>' +
        '<p><em>Corruption Hook:</em> Sealing innocents in unity fields for collective punishment grants 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '30-foot-radius binding field',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'two linked manacles fused by black wax',
      identifier: 'lotm-prisoner-binding-unity',
      activityId: 'prisonerSeq0Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Symbolic Curse',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Through one valid symbolic medium (name, blood, signature object, sworn oath, or marked icon), curse one creature you know within 1 mile. Target makes a Wisdom save. On failure, it suffers one symbolic affliction for 1 minute (save ends each turn): <strong>Wither</strong> (psychic damage = Potency each turn), <strong>Shudder</strong> (disadvantage on attacks), or <strong>Sever</strong> (cannot regain HP). On success, half psychic damage.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional valid target within 300 feet of the first.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> If strong/direct link is valid, ignore range limit and choose two afflictions on initial failure (one target only).</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> severed links, identity obfuscation, and high-tier cleansing rituals can break symbolic routing.</p>' +
        '<p><em>Corruption Hook:</em> Cursing for private revenge rather than pathway duty grants 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-rough-white-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature via symbolic medium',
      rangeUnits: 'spec',
      rangeValue: null,
      rangeSpecial: '1 mile through valid symbolic link',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a marked sigil tablet and one target-linked medium',
      identifier: 'lotm-prisoner-symbolic-curse',
      activityId: 'prisonerSeq0Act004',
      now: now + 7,
      existing: existingAbility4,
      sort: 2000903
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
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(LEGACY_A_HEADER),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: legacyBKey,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(LEGACY_B_HEADER),
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
