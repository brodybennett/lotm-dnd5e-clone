const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ9001';
const LEGACY_B_KEY = '!items!lotmAbilityZ8001';

const ABILITY_1_KEY = '!items!lotmAbilityZ7001';
const ABILITY_2_KEY = '!items!lotmAbilityZ7002';
const ABILITY_3_KEY = '!items!lotmAbilityZ7003';

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
        grantedSequence: 7
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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9+8 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, territorial enforcement, and interrogation-grade soul pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Interrogator), Arbiter evolves from static enforcement into active spirit-body coercion that prepares the more formal sentencing authority of Sequence 6 (Judge).</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 7, <strong>Authority Bearing</strong> becomes an interrogation relay instead of a single reaction choke point. ' +
      'While your target is inside your Jurisdiction Field or marked by Recognition Warrant, the first valid <strong>Objection</strong> each round does not spend your reaction. ' +
      'If you spend at least <strong>+1 Spirituality</strong> when activating Authority Bearing, the first free Objection each round also imposes a 10-foot speed reduction on a failed save until the end of that target\'s next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const legacyBText =
      '<p>At Sequence 7, <strong>Jurisdiction Field</strong> gains punitive force suitable for an Interrogator. ' +
      'When a creature fails its field save and still violates a declared rule, it takes spiritual backlash equal to <strong>Potency</strong> (once per creature per round). ' +
      'If Jurisdiction Field is upcast by at least <strong>+2 Spirituality</strong>, violating creatures also take a <strong>-Potency</strong> penalty on their next Wisdom save before the end of their next turn.</p>';
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
      id: 'lotmAbilityZ7001',
      name: 'Illusory Torture Device',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Conjure one interrogation implement of phantom law (branding iron, chain hook, pressure wedge, or restraint seal) against a creature within 5 feet. The target makes a Wisdom save. On a failure, it takes spirit-body pressure equal to <strong>Potency</strong> and cannot take reactions until the start of its next turn. Whether it fails or succeeds, the target has disadvantage on its next check made to resist questioning, conceal evidence, or maintain deception before end of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Reach increases to 10 feet <strong>or</strong> summon a second device against a different target within reach (separate save).</li><li><strong>+2 Spirituality:</strong> On a failed save, choose one rider: speed becomes 0 until end of turn, <strong>or</strong> target cannot benefit from invisibility/concealment against you until end of next turn.</li><li><strong>+4 Spirituality:</strong> Duration becomes 1 minute (concentration). Once per round as a bonus action, you may reactivate one current device effect against a target in reach (repeat save).</li></ul><p><em>Counterplay:</em> distance management, anti-illusion wards, fear immunity, and save-focused discipline reduce coercive payoff.</p><p><em>Corruption Hook:</em> if you inflict interrogative pain on compliant innocents, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-levitate-pink.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature within close interrogation reach',
      rangeUnits: 'ft',
      rangeValue: '5',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a small iron seal engraved with a case number',
      identifier: 'lotm-arbiter-illusory-torture-device',
      activityId: 'arbiterSeq7Interrogate01',
      now: now + 4,
      existing: existing1,
      sort: 1800200
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ7002',
      name: 'Psychic Lashing',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. For 1 minute, your held weapon or baton is wrapped in adjudicative lightning. Your weapon attacks can affect spirit-body entities, and once per turn when you hit, add psychic lash damage equal to <strong>Potency</strong>. A struck creature must succeed on a Wisdom save or suffer <strong>-1</strong> on its next attack roll before end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> One additional ally within 30 feet can receive a lesser lash buff for 1 round (their next hit this round gains half Potency, rounded up, and can affect spirit-body targets).</li><li><strong>+2 Spirituality:</strong> Save penalty becomes <strong>-Potency</strong>, and on failed save the target cannot take opportunity attacks until start of its next turn.</li><li><strong>+4 Spirituality:</strong> Once each round when a lashed target fails a save against one of your Arbiter abilities, you may immediately move up to 10 feet without provoking opportunity attacks and make one weapon attack against that target.</li></ul><p><em>Counterplay:</em> disarms, anti-lightning shielding, and long-range disengagement reduce lash uptime.</p><p><em>Corruption Hook:</em> if you escalate force to sadistic excess after compliance is secured, gain 1 Corruption.</p>',
      img: 'icons/magic/lightning/bolt-strike-blue.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self weapon empowerment',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'evo',
      properties: ['somatic'],
      materials: 'a conductive cord tied around the grip',
      identifier: 'lotm-arbiter-psychic-lashing',
      activityId: 'arbiterSeq7Lash02',
      now: now + 5,
      existing: existing2,
      sort: 1800201
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ7003',
      name: 'Psychic Piercing',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Fire a focused verdict spike from your gaze at one creature within 30 feet. The target makes a Wisdom save. On a failure, it takes psychic/spirit-body damage equal to <strong>Potency</strong> and has disadvantage on concentration checks and Deception checks until the end of its next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range increases to 60 feet <strong>or</strong> affect one additional creature within 10 feet of the first target (separate save).</li><li><strong>+2 Spirituality:</strong> On failed save, choose one rider: target cannot take reactions until start of next turn, <strong>or</strong> target&apos;s speed is reduced by 10 feet until end of next turn.</li><li><strong>+4 Spirituality:</strong> If a target fails this save while inside your Jurisdiction Field, you may force an immediate secondary Wisdom save; on failure, it is unable to cast or use supernatural abilities until the end of its next turn.</li></ul><p><em>Counterplay:</em> line-of-sight breaks, reflective barriers, and psychic resistance reduce piercing certainty.</p><p><em>Corruption Hook:</em> if you use soul-piercing on witnesses solely to destroy testimony, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-green.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature in line of sight',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'evo',
      properties: ['vocal'],
      materials: 'a clear lens marked with an enforcement sigil',
      identifier: 'lotm-arbiter-psychic-piercing',
      activityId: 'arbiterSeq7Pierce03',
      now: now + 6,
      existing: existing3,
      sort: 1800202
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
