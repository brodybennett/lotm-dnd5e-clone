const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Criminal';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const DEFAULT_PATHWAY_ID = 'lotmPathway00019';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const ABILITY_1_ID = 'lotmAbilityK8001';
const ABILITY_2_ID = 'lotmAbilityK8002';

const LEGACY_ABILITY_ID = 'lotmAbilityK9001';
const LEGACY_HEADER = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
const LEGACY_TEXT =
  '<p>At Sequence 8, <strong>Criminal Proficiency</strong> extends from close-kill instinct into battlefield reach. ' +
  'When you are under a demonic-state effect, your Criminal Proficiency applies to improvised thrown weapons (range 20/60), ' +
  'and once per turn after you hit with any weapon attack you can force the target to make a Wisdom save or suffer disadvantage on its next opportunity attack before the end of its next turn.</p>';

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
    if (doc?.system?.identifier === identifier) {
      return { key, doc };
    }
  }
  return null;
}

function buildPathwayDoc({ pathwayId, existing, now }) {
  return {
    _id: pathwayId,
    name: PATHWAY_NAME,
    type: 'class',
    img: 'icons/skills/melee/strike-dagger-arcane-pink.webp',
    system: {
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> ruthless predation through cold intent, violence discipline, and domination of fear and desire.</p>' +
          '<p><strong>Sequence 9 Anchor (Lore Baseline):</strong> Criminal Proficiency and hardened predatory physique establish all-weapon lethality.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Demonic Attribute, Crushing Slowness, and one legacy scope upgrade to Criminal Proficiency.</p>' +
          '<p><strong>Continuity Anchor:</strong> Sequence 8 (Unwinged Angel / Coldblooded) turns a mere killer into a demonic enforcer who slows prey, poisons space, and exerts blood-soaked coercion.</p>' +
          '<p><strong>Authoring Status:</strong> Sequence 8 authored in this run. Lower and higher sequences remain for later sequence-focused passes.</p>',
        chat: ''
      },
      source: {
        custom: '',
        rules: '2024',
        revision: 1,
        license: '',
        book: 'LoTM Core'
      },
      startingEquipment: [],
      identifier: PATHWAY_IDENTIFIER,
      levels: 1,
      advancement: [],
      spellcasting: {
        progression: 'full',
        ability: 'cha',
        preparation: {
          formula: ''
        }
      },
      wealth: '4d4*10',
      primaryAbility: {
        value: ['cha'],
        all: false
      },
      hd: {
        denomination: 'd8',
        spent: 0,
        additional: ''
      }
    },
    effects: [],
    folder: null,
    flags: {
      lotm: {
        sourceBook: 'LoTM Core'
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort: 1900000,
    ownership: {
      default: 0
    }
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
    _id: id,
    name,
    type: 'spell',
    img,
    system: {
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
      level: 1,
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
    effects: [],
    folder: FOLDER_ID,
    flags: {
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        sourceBook: 'LoTM Core',
        grantedSequence: 8
      }
    },
    _stats: buildStats(now, existing?._stats),
    sort,
    ownership: {
      default: 0
    }
  };
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const existingByIdentifier = await findPathwayByIdentifier(pathwaysDb, PATHWAY_IDENTIFIER);
    const pathwayId = existingByIdentifier?.doc?._id ?? DEFAULT_PATHWAY_ID;
    const pathwayKey = existingByIdentifier?.key ?? `!items!${pathwayId}`;
    const existingPathway =
      existingByIdentifier?.doc ?? (await getOptionalJson(pathwaysDb, pathwayKey));

    const pathwayDoc = buildPathwayDoc({ pathwayId, existing: existingPathway, now });
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathwayDoc));

    const folderKey = `!folders!${FOLDER_ID}`;
    const existingFolder = await getOptionalJson(abilitiesDb, folderKey);
    if (!existingFolder) {
      throw new Error(`Expected ability folder ${FOLDER_ID} (${PATHWAY_NAME}) to exist.`);
    }
    const folderDoc = {
      ...existingFolder,
      name: PATHWAY_NAME,
      description: 'Sequence abilities for the Criminal pathway (authored through Sequence 8).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: 8
        }
      },
      _stats: buildStats(now + 1, existingFolder._stats)
    };
    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const legacyKey = `!items!${LEGACY_ABILITY_ID}`;
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    let legacyPatched = false;
    if (legacyAbility) {
      const existingDescription = String(legacyAbility.system?.description?.value ?? '');
      if (!existingDescription.includes(LEGACY_HEADER)) {
        legacyAbility.system.description.value = `${existingDescription}${LEGACY_HEADER}${LEGACY_TEXT}`;
      }
      legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
      await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));
      legacyPatched = true;
    }

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Demonic Attribute',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. For 1 minute, your flesh hardens and your blood simmers with abyssal malice. You gain resistance to poison damage, advantage on Intimidation checks, and once per turn when you hit with a weapon attack you deal extra poison or necrotic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Choose one mutation for the duration: <em>Sulfur Spit</em> (30-foot ranged attack dealing <strong>Potency</strong> poison/fire), <em>Toxic Smoke</em> (10-foot aura of light obscurity and difficult terrain), or <em>Foul Murmur</em> (one creature you hit must pass a Wisdom save or cannot take reactions until start of its next turn).</li>' +
        '<li><strong>+2 Spirituality:</strong> Your first two weapon hits each turn gain the extra damage, and creatures damaged by you must pass a Constitution save or have speed reduced by 10 feet until the start of your next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> You become Large-sized (if space allows) until the effect ends; your melee reach increases by 5 feet, and when you reduce a creature to 0 HP you gain temporary HP equal to <strong>2 x Potency</strong>.</li>' +
        '</ul>' +
        '<p><strong>Legacy Upgrade Rider (Scope, Sequence 9):</strong> If you know <strong>Criminal Proficiency</strong>, this form extends it to improvised thrown weapons (20/60), and once per turn after a hit you may force a Wisdom save that imposes disadvantage on the target&apos;s next opportunity attack.</p>' +
        '<p><em>Counterplay:</em> anti-poison wards, forced movement, and anti-transformation restraints blunt this ability.</p>' +
        '<p><em>Corruption Hook:</em> If you intentionally indulge torture or cruelty while transformed, gain 1 Corruption.</p>',
      img: 'icons/creatures/magical/demon-horned-winged-shadow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic'],
      materials: {
        value: 'a drop of your own blood mixed with ash',
        consumed: false,
        cost: 0,
        supply: 0
      }.value,
      identifier: 'lotm-criminal-demonic-attribute',
      activityId: 'criminalSeq8Act01',
      now: now + 3,
      existing: existingAbility1,
      sort: 1900100
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Crushing Slowness',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Slam both hands toward one point you can see within 60 feet. Creatures of your choice in a 10-foot-radius sphere must make a Constitution save. On a failure, a target&apos;s speed is halved and it cannot take reactions until the start of your next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 15 feet and affected ground turns into sticky black mire; the area is difficult terrain until the end of your next turn.</li>' +
        '<li><strong>+2 Spirituality:</strong> Failed targets repeat the save at the end of each of their turns for up to 1 minute. While afflicted, whenever they Dash they take blood-rending damage equal to <strong>Potency</strong>.</li>' +
        '<li><strong>+4 Spirituality:</strong> Radius becomes 20 feet. On a failed save, targets also cannot take bonus actions until the end of their next turn, and at the start of each afflicted turn they take <strong>Potency</strong> necrotic damage from clotting pressure.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> teleportation, condition immunity, and forced cleansing magic can break or avoid the slow field.</p>' +
        '<p><em>Corruption Hook:</em> If you use this to prolong suffering after combat is decided, gain 1 Corruption.</p>',
      img: 'icons/magic/time/hourglass-brown-orange.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '10-foot radius at a point you can see',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'congealed blood dust and a snapped black feather',
      identifier: 'lotm-criminal-crushing-slowness',
      activityId: 'criminalSeq8Act02',
      now: now + 4,
      existing: existingAbility2,
      sort: 1900101
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, pathwayKey);
    const verifyFolder = await getOptionalJson(abilitiesDb, folderKey);
    const verifyLegacy = await getOptionalJson(abilitiesDb, legacyKey);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          legacy: {
            key: legacyKey,
            exists: !!verifyLegacy,
            patched: legacyPatched,
            hasLegacyHeader: String(verifyLegacy?.system?.description?.value ?? '').includes(
              LEGACY_HEADER
            )
          },
          abilityKeys: [`!items!${ABILITY_1_ID}`, `!items!${ABILITY_2_ID}`],
          abilityReadBack: [
            {
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              identifier: verifyAbility1?.system?.identifier,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
              identifier: verifyAbility2?.system?.identifier,
              grantedSequence: verifyAbility2?.flags?.lotm?.grantedSequence,
              level: verifyAbility2?.system?.level
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
