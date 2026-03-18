const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU2001';
const ABILITY_2_ID = 'lotmAbilityU2002';
const ABILITY_3_ID = 'lotmAbilityU2003';
const ABILITY_4_ID = 'lotmAbilityU2004';

const LEGACY_A_ID = 'lotmAbilityU4001';
const LEGACY_B_ID = 'lotmAbilityU5002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 2, <strong>Source of Curses</strong> advances into vessel-grade condemnation. ' +
  'When you establish a curse line with verified core intel (true name, blood, or long-carried personal object), the target takes immediate psychic damage equal to <strong>2 x Potency</strong> on the first failed save. ' +
  'If the target is already afflicted by your Sequence 2 curse effects, add one extra curse mode without extra cost (once per cast).</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 2, <strong>Wraith Possession</strong> can project through your dwelling channels and cursed media. ' +
  'Range increases by 30 feet when cast from within your active Dwelling Space or through a possessed object, and on a failed save you may also pull one creature within 10 feet of the primary target 5 feet toward it. ' +
  'This secondary pull can trigger once per round.</p>';

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
          '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Ancient Bane), restraint becomes territorial and nearly undying: a bound dwelling anchors your existence, witnessing foes are tainted by bane pressure, and curses spread through vessel channels.</p>',
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
      level: 7,
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
        grantedSequence: 2
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 2).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 2)
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
      name: 'Dwelling Space',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> 1-minute ritual action. Bind one unattended object or fixed location within 30 feet as your dwelling anchor for 24 hours. While within 120 feet of the anchor, gain resistance to psychic damage and advantage on saves against fear/charm. Once per round when reduced to 0 HP in this radius, remain at 1 HP instead and the anchor cracks (this safeguard can trigger once per long rest).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Anchor radius becomes 180 feet and you can sense all creatures entering or leaving it.</li>' +
        '<li><strong>+2 Spirituality:</strong> You may maintain a second lesser anchor (same duration, no 0-HP safeguard).</li>' +
        '<li><strong>+4 Spirituality:</strong> As a reaction when targeted by an attack within anchor radius, teleport to a point adjacent to the anchor and the attack is made at disadvantage.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> locating and breaking/consecrating anchors strips most benefits.</p>' +
        '<p><em>Corruption Hook:</em> Nesting an anchor in places of mass suffering for power gain grants 1 Corruption.</p>',
      img: 'icons/magic/earth/barrier-stone-explosion-debris.webp',
      activationType: 'action',
      durationValue: '24',
      durationUnits: 'hour',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'one unattended object or fixed location anchor',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a chained nail sealed with your blood',
      identifier: 'lotm-prisoner-dwelling-space',
      activityId: 'prisonerSeq2Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Bane Gaze',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose creatures that can see you in a 30-foot cone. Each target makes a Wisdom save. On failure, it suffers bane pressure for 1 minute (save ends each turn): disadvantage on its first d20 test each round and it takes psychic damage equal to <strong>Potency</strong> if it willingly moves closer to you. On success, target takes half psychic damage.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Cone becomes 60 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Failed targets also have speed reduced by 10 feet while effect lasts.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, when a failed target rolls a natural 1, you may force it to reroll one successful attack or save made before end of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> vision denial, reflection disruption, and strong will wards reduce effectiveness.</p>' +
        '<p><em>Corruption Hook:</em> Deliberately inflicting despair on noncombatants as theater grants 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'cone',
      targetCount: '1',
      targetSpecial: 'creatures that witness your gaze',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a black lens wrapped in chain-thread',
      identifier: 'lotm-prisoner-bane-gaze',
      activityId: 'prisonerSeq2Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Spirit Siphon',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature or spirit within 90 feet. It makes a Constitution save. On failure, you wrench at its spirit: it takes psychic damage equal to <strong>Potency</strong>, cannot benefit from invisibility/ethereal hiding until the end of your next turn, and is pulled up to 10 feet toward you.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Range becomes 150 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Affect one additional target within 15 feet of the first (separate save).</li>' +
        '<li><strong>+4 Spirituality:</strong> On failed save, target is spiritually exposed for 1 minute (save ends each turn): first pathway effect each round against it has +2 DC or +Potency to attack roll.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> anti-spirit shells, consecrated ground, and mobility breaks interrupt pull chains.</p>' +
        '<p><em>Corruption Hook:</em> Repeatedly draining weakened spirits for convenience power grants 1 Corruption.</p>',
      img: 'icons/magic/death/ghost-spirit-horns-blue.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature or spirit target',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a frost-cracked vial of grave mist',
      identifier: 'lotm-prisoner-spirit-siphon',
      activityId: 'prisonerSeq2Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Curse Vessel Domain',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Unfurl a 20-foot-radius cursed domain centered on a point within 60 feet for 1 minute (concentration). Enemies entering or starting turn inside make a Wisdom save. On failure, choose one each round: restrained by spectral bindings until end of turn, silenced until end of turn, or psychic damage equal to <strong>Potency</strong>. A creature that fails by 5 or more also cannot teleport until start of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Radius becomes 30 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round, you may retarget one curse result from a successful saver to another creature that failed a save this round within the domain.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> leaving the domain, ritual disruption, and anti-curse sanctification reduce its lock power.</p>' +
        '<p><em>Corruption Hook:</em> Maintaining the domain over civilians for prolonged terror grants 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-aura-psychic.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '20-foot-radius curse vessel zone',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'a marked doll vessel inscribed with chain sigils',
      identifier: 'lotm-prisoner-curse-vessel-domain',
      activityId: 'prisonerSeq2Act004',
      now: now + 7,
      existing: existingAbility4,
      sort: 2000703
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
