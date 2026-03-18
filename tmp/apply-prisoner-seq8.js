const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU8001';
const ABILITY_2_ID = 'lotmAbilityU8002';

const LEGACY_ABILITY_ID = 'lotmAbilityU9001';
const LEGACY_HEADER = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
const LEGACY_TEXT =
  '<p>At Sequence 8, <strong>Shacklecraft</strong> can propagate through shared confinement lines. ' +
  'When you cast Shacklecraft with at least <strong>+1 Spirituality</strong> and the primary target fails its save, ' +
  'choose one additional creature within 10 feet of that target. The second creature makes the same save; on a failure, it suffers the baseline speed reduction and anti-Dash rider until the start of your next turn. ' +
  'Once per short rest, you may apply this propagation rider without paying the +1 surcharge.</p>';

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
    img: 'icons/sundries/survival/cuffs-shackles-steel.webp',
    system: {
      ...(existing?.system ?? {}),
      description: {
        value:
          '<p><strong>Pathway Vector:</strong> restrained, tense, defiant control through confinement techniques, suppressed force, and tightly timed bursts of violence.</p>' +
          '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Shacklecraft, Contained Burst.</p>' +
          '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Leashed Frenzy, Bound Shadow, plus one legacy scope upgrade to Shacklecraft.</p>' +
          '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Lunatic), the pathway shifts from simple restraint into weaponized self-suppression: chained instinct can be released for short violent peaks while identity and aura become harder to read, trace, and exploit.</p>',
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
        grantedSequence: 8
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 8).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 8)
        }
      },
      _stats: buildStats(now + 1, existingFolder._stats)
    };
    await abilitiesDb.put(folderKey, JSON.stringify(folderDoc));

    const legacyKey = `!items!${LEGACY_ABILITY_ID}`;
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) throw new Error(`Legacy target ${LEGACY_ABILITY_ID} not found.`);

    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(LEGACY_HEADER)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${LEGACY_HEADER}${LEGACY_TEXT}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existingAbility2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Leashed Frenzy',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. For 1 minute, you release a controlled fracture of restraint. You gain +10 feet speed, advantage on Strength checks/saves to grapple, shove, or break restraint, and once per turn your first melee, unarmed, or improvised hit deals extra damage equal to <strong>Potency</strong>. At the end of each of your turns, make a Wisdom save (DC 8 + Potency). On failure, until the start of your next turn you cannot take reactions and must move at least 10 feet toward the nearest hostile creature if able.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> While active, you also gain advantage on saves against being Charmed or Frightened, and you ignore difficult terrain created by mundane debris, ropes, or collapsed barriers.</li>' +
        '<li><strong>+2 Spirituality:</strong> Your extra damage applies to the first <strong>two</strong> qualifying hits each turn, and on the first hit you may push the target 5 feet.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per turn after your first qualifying hit, make one additional melee or improvised attack against a different creature within reach. If you fail your end-turn save by 5 or more while this tier is active, gain 1 Corruption.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> forced movement, blind zones, and kiting at reach can waste your burst windows and force bad movement lines.</p>' +
        '<p><em>Corruption Hook:</em> If you intentionally trigger frenzy to maul subdued targets, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/unarmed-punch-fist-yellow-red.webp',
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
      materials: 'a strip of chain wrapped around your wrist',
      identifier: 'lotm-prisoner-leashed-frenzy',
      activityId: 'prisonerSeq8Act001',
      now: now + 3,
      existing: existingAbility1,
      sort: 2000100
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Bound Shadow',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Weave a restraint-signature veil around yourself for 10 minutes. During this time, hostile divination, spirit-sight tracking, or identity-reading attempts against you are obscured; the source must win an ability check against your feature DC to get clear information. Also, choose one creature within 60 feet you can see; until the end of your next turn, that creature cannot gain benefit from invisibility against you, and it has disadvantage on checks made to Hide or Escape from your grapple/restraint effects.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Extend the veil to one ally within 30 feet, and extend the anti-hide rider duration to 1 minute (target repeats a Wisdom save at end of each turn to end it).</li>' +
        '<li><strong>+2 Spirituality:</strong> Select up to two creatures for the anti-hide rider, and while veiled you gain +<strong>Potency</strong> to checks to pursue, track, or intercept marked targets.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once while active, when a marked target moves or teleports, use your reaction to move up to 15 feet and immediately force that target to make a Strength save; on failure, its speed becomes 0 until the end of the turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> anti-magic suppression, range denial, and pre-planted false traces can still break your pursuit net.</p>' +
        '<p><em>Corruption Hook:</em> If you use this veil to stalk non-hostile civilians for coercion, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-chains-shadow.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self and one creature you can see',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a blackened chain link or soot-stained lockpick',
      identifier: 'lotm-prisoner-bound-shadow',
      activityId: 'prisonerSeq8Act002',
      now: now + 4,
      existing: existingAbility2,
      sort: 2000101
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
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacy: {
            key: legacyKey,
            id: verifyLegacy?._id,
            name: verifyLegacy?.name,
            hasLegacyHeader: String(verifyLegacy?.system?.description?.value ?? '').includes(
              LEGACY_HEADER
            ),
            grantedSequence: verifyLegacy?.flags?.lotm?.grantedSequence,
            level: verifyLegacy?.system?.level
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
