const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_NAME = 'Prisoner';
const PATHWAY_IDENTIFIER = 'lotm-prisoner';
const DEFAULT_PATHWAY_ID = 'lotmPathway00020';
const FOLDER_ID = 'WbvFQVEO6JXQDyHF';

const ABILITY_1_ID = 'lotmAbilityU3001';
const ABILITY_2_ID = 'lotmAbilityU3002';
const ABILITY_3_ID = 'lotmAbilityU3003';

const LEGACY_A_ID = 'lotmAbilityU4001';
const LEGACY_B_ID = 'lotmAbilityU5002';

const LEGACY_A_HEADER = '<h3>Legacy Upgrade (Sequence 3 - Potency)</h3>';
const LEGACY_A_TEXT =
  '<p>At Sequence 3, <strong>Source of Curses</strong> matures from linked torment into verdict-grade malediction. ' +
  'When a target fails its first save against Source of Curses each cast, it takes additional psychic damage equal to <strong>Potency</strong>. ' +
  'If you willingly take at least 1 self-inflicted damage while casting, increase that bonus to <strong>2 x Potency</strong> (once per cast).</p>';

const LEGACY_B_HEADER = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
const LEGACY_B_TEXT =
  '<p>At Sequence 3, <strong>Wraith Possession</strong> gains silence-channel efficiency. ' +
  'If the target is currently affected by your Silent Curse Brewing or cannot speak, reduce Wraith Possession cost by <strong>1 Spirituality</strong> (minimum 0). ' +
  'Once per short rest, cast Wraith Possession as a <strong>bonus action</strong> under those conditions.</p>';

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
          '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Silent Curse Brewing, Transfiguration Curse, Cursed Artifact Possession, plus two legacy upgrades (Source of Curses and Wraith Possession).</p>' +
          '<p><strong>Sequence 2-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
          '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Disciple of Silence), confinement becomes quiet inevitability: curses brew under silence, identities collapse into harmless forms, and control projects through possessed objects.</p>',
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
      level: 6,
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
        grantedSequence: 3
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
      description: 'Sequence abilities for the Prisoner pathway (authored through Sequence 3).',
      flags: {
        ...(existingFolder.flags ?? {}),
        lotm: {
          ...(existingFolder.flags?.lotm ?? {}),
          pathwayIdentifier: PATHWAY_IDENTIFIER,
          latestAuthoredSequence: Math.min(currentLatest, 3)
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
      name: 'Silent Curse Brewing',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Select one creature within 90 feet. It makes a Wisdom save. On a failure, it gains a brewed silence-curse for 1 minute (save ends at end of each turn). While cursed, the first time each round it speaks, uses a verbal component, or shouts, it takes psychic damage equal to <strong>Potency</strong> and you choose one rider: speed -10 feet, no reactions until the start of its next turn, or disadvantage on its next attack roll.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Affect one additional creature with a separate save.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes and the cursed target has disadvantage on the first save it makes to end the effect.</li>' +
        '<li><strong>+4 Spirituality:</strong> On initial failed save, target is also silenced until the end of its next turn and cannot activate command-word items.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> mute signaling discipline, curse cleansing, and anti-enchantment wards reduce its pressure loop.</p>' +
        '<p><em>Corruption Hook:</em> Deliberately using this to slowly torture captives in prolonged interrogation grants 1 Corruption.</p>',
      img: 'icons/magic/control/silhouette-aura-energy.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature marked by silence-curse',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a knotted thread dipped in wax and ash',
      identifier: 'lotm-prisoner-silent-curse-brewing',
      activityId: 'prisonerSeq3Act001',
      now: now + 4,
      existing: existingAbility1,
      sort: 2000600
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Transfiguration Curse',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Target one creature within 60 feet; it makes a Wisdom save. On failure, it is transfigured into a harmless doll-like form until the end of your next turn: speed becomes 10 feet, it cannot cast spells, cannot make attacks, and drops concentration. On success, it takes psychic damage equal to <strong>Potency</strong>.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Range becomes 90 feet.</li>' +
        '<li><strong>+2 Spirituality:</strong> Duration becomes 1 minute (save ends each turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> If target has an active sympathy link from your pathway abilities, choose one linked body/effect; that linked instance also suffers no reactions until the start of its next turn.</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> shape-stability protections, legendary resistances, and link disruption can block transformation.</p>' +
        '<p><em>Corruption Hook:</em> Repeatedly transfiguring surrendered enemies for spectacle grants 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-yellow.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'one creature to forcibly transfigure',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'trs',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a folded paper figurine marked with true-name sigils',
      identifier: 'lotm-prisoner-transfiguration-curse',
      activityId: 'prisonerSeq3Act002',
      now: now + 5,
      existing: existingAbility2,
      sort: 2000601
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Cursed Artifact Possession',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Possess one unattended object within 60 feet for 10 minutes (concentration). While possessing it, you perceive from the object\'s location and can move it up to 20 feet on each of your turns. Once per round, force one creature adjacent to the object to make a Strength save; on failure, chains/wrappings lash out and restrain it until the start of your next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p>' +
        '<ul>' +
        '<li><strong>+1 Spirituality:</strong> Possess one additional unattended object within range.</li>' +
        '<li><strong>+2 Spirituality:</strong> You may target a non-attuned held object; bearer makes a Strength save or drops it and takes psychic damage equal to <strong>Potency</strong>.</li>' +
        '<li><strong>+4 Spirituality:</strong> Once per round when a possessed object is destroyed, jump possession to another object within 30 feet without ending duration and emit a fear pulse (Wisdom save or frightened until end of its next turn).</li>' +
        '</ul>' +
        '<p><em>Counterplay:</em> attunement locks, consecrated relics, and object destruction can limit possession chains.</p>' +
        '<p><em>Corruption Hook:</em> Nesting in keepsakes of grieving families to extort them grants 1 Corruption.</p>',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
      activationType: 'bonus',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '1',
      targetSpecial: 'one unattended object to possess',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['somatic', 'material', 'concentration'],
      materials: 'a rusted ring threaded through black cloth',
      identifier: 'lotm-prisoner-cursed-artifact-possession',
      activityId: 'prisonerSeq3Act003',
      now: now + 6,
      existing: existingAbility3,
      sort: 2000602
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
