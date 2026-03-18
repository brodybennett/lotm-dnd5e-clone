const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK3001'; // Corruption Cant
const LEGACY_B_KEY = '!items!lotmAbilityK4001'; // Demon of the Mind

const ABILITY_1_ID = 'lotmAbilityK1001';
const ABILITY_2_ID = 'lotmAbilityK1002';
const ABILITY_3_ID = 'lotmAbilityK1003';
const ABILITY_4_ID = 'lotmAbilityK1004';

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
      level: 8,
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
        grantedSequence: 1
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
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Corruption Cant, Mind-Spirit Hex, Distant Blather, Prayer Interception, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Seed of Malice, Blood Sovereign, Abyssal Dread Mandate, Coagulated Rebirth, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> King of Filth, The Corroder, Flames of the Abyss, Filthy Kingdom, plus two legacy upgrades (Corruption Cant and Demon of the Mind).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Filthy Monarch), Bloody Archduke authority matures into sovereign contamination law: filth becomes a battlefield medium, corrosion overcomes defenses over time, and abyssal flame layers burning, toxins, corruption, and corrosion into one punitive vector.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 1 authored in this run; Sequence 0 remains for a later sequence-focused run.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 1).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 1
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK3001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK4001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 1, <strong>Corruption Cant</strong> can carry through polluted domains rather than only direct speech lanes. ' +
      'When you cast Corruption Cant in an area affected by one of your Filthy Monarch abilities, its range doubles and you may route it through one contaminated zone to strike targets that are behind full cover but still inside that zone. ' +
      'Targets that fail against this routed cast also gain one stack of <strong>Filth Mark</strong> until end of scene (max 1), enabling one later Filthy Monarch rider to treat them as if they failed by 5 or more.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, <strong>Demon of the Mind</strong> graduates from demigod suppression to monarch-grade mental ruin. ' +
      'Failed targets take additional psychic damage equal to <strong>Potency</strong> at effect start and again the first time they fail a repeated save during this cast. ' +
      'If the target is currently Frightened, Corroded, or Poisoned by one of your Filthy Monarch abilities, it makes its first save against Demon of the Mind with disadvantage.</p>';
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
      name: 'King of Filth',
      description:
        '<p><strong>Baseline (6 Spirituality):</strong> Action. Declare filthy sovereignty in a 40-foot radius centered on a point within 120 feet for 1 minute (concentration). Hostile creatures in the area make a Constitution save at start of turn. On failure they become <strong>Contaminated</strong>: take necrotic+poison damage equal to <strong>Potency + pathway tier</strong>, have disadvantage on checks to resist corruption, and cannot benefit from temporary HP until start of their next turn.</p>' +
        '<p><strong>Monarch Clause:</strong> You can identify and command \"dirty/sinful/unclean\" battlefield elements (blood pools, corpse sludge, toxic runoff, ritual grime) within the domain; once per round as a bonus action, move one such hazard up to 20 feet and force one creature it touches to repeat the save.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> radius becomes 60 feet.</li>' +
        '<li><strong>+4 Spirituality:</strong> Contaminated creatures also suffer <strong>-Potency</strong> to attack rolls against you until start of their next turn.</li>' +
        '<li><strong>+8 Spirituality:</strong> once during duration, enthrone filth collapse: every contaminated target in the domain repeats save with disadvantage or is knocked prone, loses reactions, and takes additional damage equal to <strong>Potency</strong>.</li>' +
        '</ul><p><em>Counterplay:</em> sanctified ground, purification burst effects, and forced relocation out of domain weaken this authority.</p>' +
        '<p><em>Corruption Hook:</em> invoking this in civilian shelters for terror control gives 1 Corruption.</p>',
      img: 'icons/magic/unholy/hand-fire-skeleton-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'sphere',
      targetCount: '1',
      targetSpecial: '40-foot radius centered on chosen point',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a shard of altar grime mixed with old blood',
      identifier: 'lotm-criminal-king-of-filth',
      activityId: 'criminalSeq1Filth01',
      now: now + 4,
      existing: existing1,
      sort: 1900900
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'The Corroder',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Select one creature, object, barrier, or magical ward within 120 feet. It must make a Constitution save (or Strength for unattended structures). On failure, it takes corrosion damage equal to <strong>2 x Potency + pathway tier</strong> and gains <strong>Corroded</strong> for 1 minute: AC reduced by 2 (min 10), nonmagical armor/shield and mundane barriers lose integrity, and concentration checks suffer disadvantage.</p>' +
        '<p><strong>Penetration Clause:</strong> Corrosion from this ability ignores generic fire-only protections and bypasses one layer of temporary barrier HP.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> target one additional creature/object within 30 feet of the first.</li>' +
        '<li><strong>+4 Spirituality:</strong> on failed save, target also takes <strong>Potency</strong> corrosion damage at start of each turn while Corroded.</li>' +
        '<li><strong>+8 Spirituality:</strong> against structures and fortifications, convert to siege mode: double baseline damage and force immediate integrity collapse test (GM structure rules).</li>' +
        '</ul><p><em>Counterplay:</em> purification metals, corrosion immunity, and barrier refresh cycles limit sustained breach.</p>' +
        '<p><em>Corruption Hook:</em> if used to slowly dissolve restrained foes, gain 1 Corruption.</p>',
      img: 'icons/magic/acid/projectile-faceted-glob.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature, object, or barrier in sight',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'evc',
      properties: ['somatic', 'material'],
      materials: 'a rusted needle and condensed black acid',
      identifier: 'lotm-criminal-the-corroder',
      activityId: 'criminalSeq1Corrode02',
      now: now + 5,
      existing: existing2,
      sort: 1900901
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Flames of the Abyss',
      description:
        '<p><strong>Baseline (5 Spirituality):</strong> Action. Exhale or project abyssal flame in a 30-foot cone (or 20-foot radius within 120 feet). Targets make a Dexterity save. On failure they take mixed damage equal to <strong>3 x Potency</strong> split across burn, corrosion, toxin, and corruption aspects; on success half. Until start of your next turn, affected area becomes abyssal fire terrain.</p>' +
        '<p><strong>Composite Clause:</strong> resistance to ordinary fire only mitigates the burn component; corrosion/toxin/corruption components still apply unless separately resisted.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> area increases by one step (cone 45 feet or radius 30 feet).</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets are also Poisoned until end of their next turn and take <strong>Potency</strong> damage when they move more than 10 feet.</li>' +
        '<li><strong>+8 Spirituality:</strong> flames persist for 1 minute; once per round you may surge one 10-foot strip of existing abyssal flame up to 30 feet in any direction.</li>' +
        '</ul><p><em>Counterplay:</em> broad-spectrum resistances, terrain denial, and forced spread formation reduce impact.</p>' +
        '<p><em>Corruption Hook:</em> if you use this to make examples of noncombatants, gain 1 Corruption.</p>',
      img: 'icons/magic/fire/flame-burning-skull-orange.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'cone',
      targetCount: '1',
      targetSpecial: '30-foot cone or 20-foot-radius point blast',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'evc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'sulfur crystal, rot oil, and scorched bone ash',
      identifier: 'lotm-criminal-flames-of-the-abyss',
      activityId: 'criminalSeq1Flame03',
      now: now + 6,
      existing: existing3,
      sort: 1900902
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Filthy Kingdom',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Bonus action. Assume a monarch-state for 1 minute (concentration). You become heavily resistant to contamination and crowd control: gain resistance to poison, necrotic, and nonmagical weapon damage, ignore difficult terrain from filth/blood/corrosion, and enemies within 15 feet suffer disadvantage on checks to hide or remain undetected from you.</p>' +
        '<p><strong>Sovereign Presence:</strong> once per turn when you deal damage with a Filthy Monarch ability, choose one rider for the damaged target until start of your next turn: <strong>Silenced Nerves</strong> (cannot take reactions), <strong>Weak Flesh</strong> (cannot regain HP), or <strong>Sickened Will</strong> (disadvantage on next mental save).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+2 Spirituality:</strong> duration becomes 10 minutes.</li>' +
        '<li><strong>+4 Spirituality:</strong> your first failed save each round is treated as success.</li>' +
        '<li><strong>+8 Spirituality:</strong> once while active, when reduced to 0 HP you instead drop to 1 HP, erupt with a 15-foot corruption burst (Con save or take <strong>2 x Potency</strong> and become Frightened until end of next turn), then Filthy Kingdom ends.</li>' +
        '</ul><p><em>Counterplay:</em> anti-transformation fields, purification beams, and forced separation can reduce dominance uptime.</p>' +
        '<p><em>Corruption Hook:</em> if you remain in this state to abuse subdued enemies, gain 1 Corruption.</p>',
      img: 'icons/magic/unholy/silhouette-evil-horned-giant.webp',
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
      materials: 'a cracked crown ornament coated in black sludge',
      identifier: 'lotm-criminal-filthy-kingdom',
      activityId: 'criminalSeq1Kingdom04',
      now: now + 7,
      existing: existing4,
      sort: 1900903
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
