const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK2001'; // Seed of Malice
const LEGACY_B_KEY = '!items!lotmAbilityK3001'; // Corruption Cant

const ABILITY_1_ID = 'lotmAbilityK0001';
const ABILITY_2_ID = 'lotmAbilityK0002';
const ABILITY_3_ID = 'lotmAbilityK0003';
const ABILITY_4_ID = 'lotmAbilityK0004';

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
        grantedSequence: 0
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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Criminal pathway (lotmPathway00019) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> ruthless predation through cold intent, blood-soaked intimidation, and domination of weakness and desire.</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Seed of Malice, Blood Sovereign, Abyssal Dread Mandate, Coagulated Rebirth, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> King of Filth, The Corroder, Flames of the Abyss, Filthy Kingdom, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 0 Package (Gain Budget +114):</strong> Abyss of the Heart, Embodiment of Malice, Degeneration Dominion, Sovereign of Corrosion, plus two legacy upgrades (Seed of Malice and Corruption Cant).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 0 (Abyss), all prior tools become conceptual law. Malice is no longer an effect but a state you impose; corrosion and filth become world conditions; and the abyss in the heart is weaponized as a battlefield-scale domain.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 0 authored in this run; Criminal pathway progression complete from Sequence 9 to Sequence 0.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 0).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 0
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK2001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK3001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 0 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 0, <strong>Seed of Malice</strong> is elevated from a survivability vector to conceptual infestation. ' +
      'When a Seed of Malice is active, you may treat the seeded target as if it were inside your Abyss of the Heart domain regardless of distance on the same plane. ' +
      'When you trigger Seed of Malice damage, add <strong>pathway tier</strong> true damage, and if the target currently carries two or more Abyss conditions, the seed eruption also forces a Wisdom save or inflicts one round of blank-minded incapacitation.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 0 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 0, <strong>Corruption Cant</strong> can propagate through the abyss in all minds present on the battlefield. ' +
      'When cast inside Abyss of the Heart or within terrain contaminated by Sovereign of Corrosion, Corruption Cant can jump from each failed target to one additional creature within 20 feet (separate save), once per original target. ' +
      'If cast with at least <strong>+4 Spirituality</strong>, the jump ignores language barriers and hearing restrictions as long as the target has a functioning mind.</p>';
    const legacyBDescription = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDescription.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDescription}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const existing2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const existing3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const existing4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    const ability1 = buildAbilityDoc({
      id: ABILITY_1_ID,
      name: 'Abyss of the Heart',
      description:
        '<p><strong>Baseline (10 Spirituality):</strong> Action. Manifest a conceptual abyss-domain in a 90-foot radius centered on a point within 300 feet for 1 minute (concentration). Hostile creatures in the domain make a Wisdom save at the start of each turn. On failure, they take mind-corruption damage equal to <strong>2 x Potency + pathway tier</strong>, cannot gain advantage on mental saves/checks, and suffer one <strong>Abyss Mark</strong> (max 3). At 3 marks, the target&apos;s mind goes blank until end of its current turn and it cannot take reactions until start of its next turn.</p>' +
        '<p><strong>Abyss Clause:</strong> while active, you can perceive fear, depravity, and killing intent inside the domain regardless of invisibility or mundane concealment.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+4 Spirituality:</strong> radius increases to 120 feet.</li>' +
        '<li><strong>+8 Spirituality:</strong> establish a linked secondary abyss zone (60-foot radius) within 1 mile of the primary; both zones share marks and concentration.</li>' +
        '<li><strong>+12 Spirituality:</strong> once during duration, trigger an Abyss Collapse pulse: every creature with 2+ marks repeats the save with disadvantage or becomes Frightened and Incapacitated until end of current turn.</li>' +
        '</ul><p><em>Counterplay:</em> purifying authorities, anti-domain suppression, and immediate extraction from area reduce pressure.</p>' +
        '<p><em>Corruption Hook:</em> if you invoke this to weaponize civilian panic rather than active threats, gain 1 Corruption.</p>',
      img: 'icons/magic/unholy/orb-hands-fire-black.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '90-foot radius centered on point',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a black mirror shard soaked in blood and ash',
      identifier: 'lotm-criminal-abyss-of-the-heart',
      activityId: 'criminalSeq0Abyss01',
      now: now + 4,
      existing: existing1,
      sort: 1901000
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Embodiment of Malice',
      description:
        '<p><strong>Baseline (9 Spirituality):</strong> Bonus action. Become embodied malice for 1 minute: your form can liquefy into black intent-fluid, move through occupied spaces and 1-inch openings, and gain resistance to all damage except radiant and true damage. Once per round when you pass through or strike a creature, it makes a Wisdom save; on failure it gains one Abyss Mark and takes psychic+necrotic damage equal to <strong>Potency + pathway tier</strong>.</p>' +
        '<p><strong>Incarnation Clause:</strong> while transformed, you can enter a creature&apos;s shadow/contact aura (not possession) and emerge within 30 feet of it as a free reposition once per turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+4 Spirituality:</strong> duration becomes 10 minutes.</li>' +
        '<li><strong>+8 Spirituality:</strong> each failed mark application also forces a Constitution save or causes bleeding through all orifices, taking <strong>Potency</strong> extra damage at start of next turn.</li>' +
        '<li><strong>+12 Spirituality:</strong> once during transformation, choose one creature with 2+ marks within 120 feet; it must succeed on Wisdom save or immediately drops to 0 HP if not legendary/mythic (otherwise takes <strong>3 x Potency</strong> true damage).</li>' +
        '</ul><p><em>Counterplay:</em> radiant lockdown, sanctified barriers, and mark-cleansing interrupt kill chains.</p>' +
        '<p><em>Corruption Hook:</em> if used for executions after surrender, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-ghost-scream-teal.webp',
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
      properties: ['somatic', 'material'],
      materials: 'a vial of congealed demon blood and void soot',
      identifier: 'lotm-criminal-embodiment-of-malice',
      activityId: 'criminalSeq0Malice02',
      now: now + 5,
      existing: existing2,
      sort: 1901001
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Degeneration Dominion',
      description:
        '<p><strong>Baseline (8 Spirituality):</strong> Action. Impose degeneration law on up to five creatures within 180 feet (Constitution save). On failure, each target takes corruption damage equal to <strong>2 x Potency</strong>, loses one active buff/effect of your choice that is non-artifact level, and gains disadvantage on all recovery/healing checks/saves until end of its next turn.</p>' +
        '<p><strong>Dominion Clause:</strong> for 1 minute, a failed target that attempts to heal or recover resources takes necrotic damage equal to <strong>Potency</strong> and regains half the normal value.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+4 Spirituality:</strong> affect three additional targets.</li>' +
        '<li><strong>+8 Spirituality:</strong> on failed save, target also loses reactions and bonus actions until start of its next turn.</li>' +
        '<li><strong>+12 Spirituality:</strong> establish degenerative field for 1 minute in a 40-foot radius around one failed target; creatures entering/starting there repeat the baseline save once per round.</li>' +
        '</ul><p><em>Counterplay:</em> high-tier purification, immunity to conditions, and resource denial of the caster reduce uptime.</p>' +
        '<p><em>Corruption Hook:</em> if you deliberately degrade allies or innocents for convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/death/undead-skeleton-weapon-pink.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '5',
      targetSpecial: 'creatures you can perceive',
      rangeUnits: 'ft',
      rangeValue: '180',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a cracked rib of an angelic corpse',
      identifier: 'lotm-criminal-degeneration-dominion',
      activityId: 'criminalSeq0Degenerate03',
      now: now + 6,
      existing: existing3,
      sort: 1901002
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Sovereign of Corrosion',
      description:
        '<p><strong>Baseline (8 Spirituality):</strong> Action. Mark one 80-foot line, 40-foot cone, or 30-foot radius point within 240 feet with sovereign corrosion. Creatures and structures in area make Dexterity save (creatures) or Strength save (structures). On failure they take layered damage equal to <strong>2 x Potency + pathway tier</strong> and gain <strong>Corroded</strong>: AC and save DCs reduced by 2 (min thresholds per GM rules), concentration checks at disadvantage, and non-artifact barriers lose integrity each round for 1 minute.</p>' +
        '<p><strong>Sovereign Clause:</strong> while corrosion persists, you can reshape one contiguous 20-foot segment each round as a bonus action.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+4 Spirituality:</strong> increase selected area by one step and extend range to 300 feet.</li>' +
        '<li><strong>+8 Spirituality:</strong> failed targets also become Poisoned and cannot regain HP until start of your next turn.</li>' +
        '<li><strong>+12 Spirituality:</strong> once during duration, force a world-rot pulse: all currently Corroded targets repeat save with disadvantage or take true damage equal to <strong>Potency</strong> and lose one additional non-artifact defensive effect.</li>' +
        '</ul><p><em>Counterplay:</em> supreme purification domains, immunity matrices, and forced disengagement from corroded zones mitigate damage race.</p>' +
        '<p><em>Corruption Hook:</em> if cast to collapse refugee routes and maximize suffering, gain 1 Corruption.</p>',
      img: 'icons/magic/acid/projectile-bolts-circular.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'special',
      targetCount: '1',
      targetSpecial: 'line, cone, or radius zone',
      rangeUnits: 'ft',
      rangeValue: '240',
      rangeSpecial: '',
      school: 'evc',
      properties: ['somatic', 'material'],
      materials: 'black acid pearl and sacrificial blood sigil',
      identifier: 'lotm-criminal-sovereign-of-corrosion',
      activityId: 'criminalSeq0Corrode04',
      now: now + 7,
      existing: existing4,
      sort: 1901003
    });

    await abilitiesDb.put(`!items!${ABILITY_1_ID}`, JSON.stringify(ability1));
    await abilitiesDb.put(`!items!${ABILITY_2_ID}`, JSON.stringify(ability2));
    await abilitiesDb.put(`!items!${ABILITY_3_ID}`, JSON.stringify(ability3));
    await abilitiesDb.put(`!items!${ABILITY_4_ID}`, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verify1 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_1_ID}`);
    const verify2 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_2_ID}`);
    const verify3 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_3_ID}`);
    const verify4 = await getOptionalJson(abilitiesDb, `!items!${ABILITY_4_ID}`);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacyUpdated: [
            {
              key: LEGACY_A_KEY,
              id: verifyLegacyA?._id,
              name: verifyLegacyA?.name,
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(
                legacyAHeader
              ),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: LEGACY_B_KEY,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(
                legacyBHeader
              ),
              grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
              level: verifyLegacyB?.system?.level
            }
          ],
          abilityKeys: [
            `!items!${ABILITY_1_ID}`,
            `!items!${ABILITY_2_ID}`,
            `!items!${ABILITY_3_ID}`,
            `!items!${ABILITY_4_ID}`
          ],
          abilityReadBack: [
            {
              id: verify1?._id,
              name: verify1?.name,
              sourceClass: verify1?.system?.sourceClass,
              identifier: verify1?.system?.identifier,
              grantedSequence: verify1?.flags?.lotm?.grantedSequence,
              level: verify1?.system?.level,
              folder: verify1?.folder
            },
            {
              id: verify2?._id,
              name: verify2?.name,
              sourceClass: verify2?.system?.sourceClass,
              identifier: verify2?.system?.identifier,
              grantedSequence: verify2?.flags?.lotm?.grantedSequence,
              level: verify2?.system?.level,
              folder: verify2?.folder
            },
            {
              id: verify3?._id,
              name: verify3?.name,
              sourceClass: verify3?.system?.sourceClass,
              identifier: verify3?.system?.identifier,
              grantedSequence: verify3?.flags?.lotm?.grantedSequence,
              level: verify3?.system?.level,
              folder: verify3?.folder
            },
            {
              id: verify4?._id,
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
