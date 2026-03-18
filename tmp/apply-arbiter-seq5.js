const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ9001';
const LEGACY_B_KEY = '!items!lotmAbilityZ7002';

const ABILITY_1_KEY = '!items!lotmAbilityZ5001';
const ABILITY_2_KEY = '!items!lotmAbilityZ5002';
const ABILITY_3_KEY = '!items!lotmAbilityZ5003';

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
    effects: [],
    folder: 'eiKFQVwZoYCkBNOF',
    flags: {
      dnd5e: {
        riders: {
          activity: [],
          effect: []
        }
      },
      lotm: {
        sourceBook: 'LoTM Core',
        grantedSequence: 5
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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-6 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, interrogation pressure, judicial sentencing, and disciplinary punishment command.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Disciplinary Paladin), Arbiter doctrine locks into punitive enforcement: repeated violations trigger immediate consequences, and stacked prohibitions convert local order into battlefield dominance.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ7002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 5, <strong>Authority Bearing</strong> can now designate non-living legal objects (bindings, seals, doors, and marked evidence) as reviewed subjects for enforcement interactions. ' +
      'When an entity tampers with a designated object inside your jurisdiction, you can trigger Objection as if that entity directly violated your command, and your Objection range extends to any point within your active Disciplinary Aura.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 5, <strong>Psychic Lashing</strong> becomes a punishment accelerator. ' +
      'Once per round, when a target marked by Punishment Mark violates a prohibition, you may apply Psychic Lashing\'s Potency bonus damage without requiring a new hit roll. ' +
      'If Psychic Lashing was upcast by at least <strong>+2 Spirituality</strong>, the first such automatic lash each round also strips the target of reactions until the start of its next turn.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const existing2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const existing3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityZ5001',
      name: 'Punishment Mark',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature or one non-living object within 90 feet. Creatures make a Wisdom save. On failure (or if object), it is marked for punishment for 1 minute (concentration). Once per round, when the marked target violates one of your declared rules/verdicts or damages an ally, choose one punishment rider: <strong>Shackle</strong> (speed becomes 0 until end of turn) or <strong>Judicial Strike</strong> (spiritual backlash equal to <strong>Potency</strong>).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark one additional valid target, or increase range to 150 feet.</li><li><strong>+2 Spirituality:</strong> When punishment triggers, one ally within 30 feet gains <strong>+Potency</strong> on its next attack or contested check against the marked target before end of next turn.</li><li><strong>+4 Spirituality:</strong> On the first punishment trigger each round, the marked target also loses reactions and has disadvantage on its next save against one of your Arbiter abilities before end of its next turn.</li></ul><p><em>Counterplay:</em> cleansing effects, command immunity, and forcing line breaks can reduce mark uptime.</p><p><em>Corruption Hook:</em> if you assign Punishment Mark to frame innocents as offenders, gain 1 Corruption.</p>',
      img: 'icons/magic/control/silhouette-hold-change-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature or non-living legal object',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a stamped punishment sigil on brass foil',
      identifier: 'lotm-arbiter-punishment-mark',
      activityId: 'arbiterSeq5Punish01',
      now: now + 4,
      existing: existing1,
      sort: 1800400
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ5002',
      name: 'Layered Prohibition',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Declare one prohibition clause in a 30-foot-radius zone centered within 90 feet for 1 minute (concentration): <em>no teleportation</em>, <em>no flight</em>, <em>no supernatural displacement</em>, <em>no weapon attacks</em>, or similar explicit form. Hostiles in the area make a Wisdom save; on failure, they cannot perform the prohibited action. If they attempt to violate anyway, they may proceed but immediately take disadvantage on the attempt and suffer spiritual backlash equal to <strong>1</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 40 feet, or add a second prohibition clause.</li><li><strong>+2 Spirituality:</strong> Backlash and penalties scale to <strong>Potency</strong>, and failed targets lose reactions until start of next turn after violating.</li><li><strong>+4 Spirituality:</strong> Add a third prohibition clause. Once per round, when a target fails and violates, you may immediately make one weapon attack or cast Judicial Exile against that target as a free rider (no upcast on rider).</li></ul><p><em>Counterplay:</em> leaving the zone, anti-command defenses, and non-prohibited action lines reduce lockdown effects.</p><p><em>Corruption Hook:</em> if you write prohibitions solely to preserve unjust privilege, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-black-pink.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'declared prohibition zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: 'a prohibition writ written in Ancient Hermes',
      identifier: 'lotm-arbiter-layered-prohibition',
      activityId: 'arbiterSeq5Prohibit02',
      now: now + 5,
      existing: existing2,
      sort: 1800401
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ5003',
      name: 'Disciplinary Aura',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Emanate a dawn-like command aura in a 20-foot radius around you for 1 minute. Hostile creatures entering the aura or starting their turns there make a Wisdom save. On failure, their speed is reduced by 10 feet and they have disadvantage on checks to resist command, restraint, or forced movement until end of turn. Allies in the aura gain advantage on saves against fear and mental coercion.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Aura radius increases to 30 feet, or you may exclude up to <strong>Potency</strong> creatures from its hostile effect.</li><li><strong>+2 Spirituality:</strong> Failed hostile saves also impose <strong>-Potency</strong> on the target\'s next save against one of your Arbiter abilities before end of next turn.</li><li><strong>+4 Spirituality:</strong> Once per round, when a hostile creature fails inside the aura, you may designate it as a temporary Punishment target until the end of its next turn (no additional save).</li></ul><p><em>Counterplay:</em> forced separation, silence denial, and anti-aura barriers reduce disciplinary projection.</p><p><em>Corruption Hook:</em> if you use aura pressure to terrorize compliant civilians, gain 1 Corruption.</p>',
      img: 'icons/magic/light/explosion-star-small-yellow.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self-centered authority aura',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'a polished badge bearing judgment scales',
      identifier: 'lotm-arbiter-disciplinary-aura',
      activityId: 'arbiterSeq5Aura03',
      now: now + 6,
      existing: existing3,
      sort: 1800402
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));
    await abilitiesDb.put(ABILITY_3_KEY, JSON.stringify(ability3));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);

    console.log(JSON.stringify({
      pathwayWritten: PATHWAY_KEY,
      folderWritten: FOLDER_KEY,
      legacyUpdated: [LEGACY_A_KEY, LEGACY_B_KEY],
      abilitiesWritten: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY],
      readBack: {
        pathway: {
          id: verifyPathway?._id,
          identifier: verifyPathway?.system?.identifier
        },
        folder: {
          id: verifyFolder?._id,
          latestAuthoredSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence
        },
        legacyA: {
          id: verifyLegacyA?._id,
          hasHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader),
          grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
          level: verifyLegacyA?.system?.level
        },
        legacyB: {
          id: verifyLegacyB?._id,
          hasHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader),
          grantedSequence: verifyLegacyB?.flags?.lotm?.grantedSequence,
          level: verifyLegacyB?.system?.level
        },
        sequenceAbilities: [verifyAbility1, verifyAbility2, verifyAbility3].map((doc) => ({
          id: doc?._id,
          name: doc?.name,
          sourceClass: doc?.system?.sourceClass,
          grantedSequence: doc?.flags?.lotm?.grantedSequence,
          level: doc?.system?.level,
          folder: doc?.folder
        }))
      }
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
