const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ9001';
const LEGACY_B_KEY = '!items!lotmAbilityZ8002';

const ABILITY_1_KEY = '!items!lotmAbilityZ6001';
const ABILITY_2_KEY = '!items!lotmAbilityZ6002';
const ABILITY_3_KEY = '!items!lotmAbilityZ6003';

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
        grantedSequence: 6
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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-7 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, territorial enforcement, interrogation pressure, and formal judicial sentencing.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Judge), Arbiter authority pivots from interrogation pressure into wider jurisdiction execution and explicit deprivation-style rulings, preparing for Sequence 5 disciplinary punishment authority.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ8002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 6, <strong>Authority Bearing</strong> gains judge-grade sentence force. ' +
      'Once per round, when your Objection causes a failed save, the target suffers spiritual backlash equal to <strong>Potency</strong>. ' +
      'If the target is currently affected by Judicial Exile or Sequestration Order, your Objection penalty is treated as <strong>Potency</strong> even when Authority Bearing was not upcast.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 6, <strong>Recognition Warrant</strong> extends beyond face memory into route and custody tracing. ' +
      'When a warrant-tagged target is inside your active jurisdiction, you can track its movement direction through opaque cover at up to 300 feet and identify one recent interaction target it contacted this scene (GM adjudication for layered illusions). ' +
      'If Recognition Warrant is upcast by at least <strong>+1 Spirituality</strong>, you may apply the warrant to one carried object or evidence bundle linked to that target for the same duration.</p>';
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
      id: 'lotmAbilityZ6001',
      name: 'Judicial Exile',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature within 60 feet. It makes a Wisdom save. On a failure, pronounce <strong>Exile</strong>: the target is blasted up to 20 feet away from a point you designate and cannot willingly move closer to that point until the end of its next turn. If forced movement is blocked, its speed becomes 0 until end of turn. Spirit-body creatures are affected normally.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase range to 120 feet <strong>or</strong> affect one additional creature within 15 feet of the first (separate save).</li><li><strong>+2 Spirituality:</strong> On failed save, the target also cannot take reactions until the start of its next turn, and suffers <strong>-Potency</strong> on its next movement-related check or contested reposition roll.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Each round a failed target that attempts to violate Exile suffers spiritual backlash equal to <strong>Potency</strong> and is pushed 10 feet away from the judged point.</li></ul><p><em>Counterplay:</em> teleportation escapes, displacement immunity, and anti-control protections reduce exile reliability.</p><p><em>Corruption Hook:</em> if you invoke Exile to purge lawful civilians for convenience, gain 1 Corruption.</p>',
      img: 'icons/magic/control/control-influence-crown-gold.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature in line of judgment',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic'],
      materials: 'a brass token stamped with the word EXILE',
      identifier: 'lotm-arbiter-judicial-exile',
      activityId: 'arbiterSeq6Exile01',
      now: now + 4,
      existing: existing1,
      sort: 1800300
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ6002',
      name: 'Sequestration Order',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose one creature within 60 feet that can hear and understand you. It makes a Charisma save. On a failure, sequester one category until end of its next turn: <em>supernatural ability use</em>, <em>weapon attacks</em>, or <em>reactions</em>. The target may still attempt prohibited conduct, but the first such attempt automatically suffers disadvantage and takes spiritual backlash equal to <strong>1</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Add one additional category to the same target <strong>or</strong> increase range to 120 feet.</li><li><strong>+2 Spirituality:</strong> Backlash and penalties scale to <strong>Potency</strong>, and failed targets cannot benefit from Help for prohibited actions.</li><li><strong>+4 Spirituality:</strong> Affect one additional target within 30 feet of the first (separate save), and duration extends to 1 minute (concentration, repeat save at end of each affected turn).</li></ul><p><em>Counterplay:</em> command immunity, silence/language denial, and category-agnostic tactics reduce sequestration impact.</p><p><em>Corruption Hook:</em> if you knowingly sequester self-defense from innocents under attack, gain 1 Corruption.</p>',
      img: 'icons/sundries/documents/document-sealed-black-red.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can hear and understand you',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'material'],
      materials: 'a folded sequestration writ bound with black cord',
      identifier: 'lotm-arbiter-sequestration-order',
      activityId: 'arbiterSeq6Sequest02',
      now: now + 5,
      existing: existing2,
      sort: 1800301
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ6003',
      name: 'Cityline Jurisdiction',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action while Jurisdiction Field is active. For 1 minute, extend your local authority net: your jurisdiction radius increases by 10 feet, you may sense the direction of the nearest current rule violator inside it, and once per round you can reposition up to 10 feet to any visible point inside the field without provoking opportunity attacks.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Jurisdiction radius increase becomes 20 feet <strong>or</strong> choose one ally who gains the same no-opportunity 10-foot reposition once this round.</li><li><strong>+2 Spirituality:</strong> The first hostile creature each round that fails a rule save inside your jurisdiction suffers <strong>-Potency</strong> to its next save before end of next turn.</li><li><strong>+4 Spirituality:</strong> Once per round, when a creature violates a jurisdiction rule, you may immediately issue either Judicial Exile or Sequestration Order against that creature as a free rider (target still saves normally; this free rider cannot be upcast).</li></ul><p><em>Counterplay:</em> leaving the jurisdiction, zone denial effects, and anti-teleport anchors blunt cityline advantages.</p><p><em>Corruption Hook:</em> if you weaponize jurisdiction expansion for collective punishment, gain 1 Corruption.</p>',
      img: 'icons/environment/city/road-intersection.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self jurisdiction extension',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic'],
      materials: 'a district map marked with a magistrate line',
      identifier: 'lotm-arbiter-cityline-jurisdiction',
      activityId: 'arbiterSeq6Cityline03',
      now: now + 6,
      existing: existing3,
      sort: 1800302
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
