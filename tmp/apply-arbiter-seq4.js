const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

const LEGACY_A_KEY = '!items!lotmAbilityZ9001';
const LEGACY_B_KEY = '!items!lotmAbilityZ6001';

const ABILITY_1_KEY = '!items!lotmAbilityZ4001';
const ABILITY_2_KEY = '!items!lotmAbilityZ4002';
const ABILITY_3_KEY = '!items!lotmAbilityZ4003';
const ABILITY_4_KEY = '!items!lotmAbilityZ4004';

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
      level: 5,
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
        grantedSequence: 4
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
    if (!pathway) throw new Error('Arbiter pathway not found. Sequence 9-5 authoring is required first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, punitive enforcement, and high-order imperative lawcraft.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Illusory Torture Device, Psychic Lashing, Psychic Piercing, plus two legacy upgrades (Authority Bearing and Jurisdiction Field).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Judicial Exile, Sequestration Order, Cityline Jurisdiction, plus two legacy upgrades (Authority Bearing and Recognition Warrant).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Punishment Mark, Layered Prohibition, Disciplinary Aura, plus two legacy upgrades (Authority Bearing and Psychic Lashing).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Imperative Law, Boundary Edict, Overruling Verdict, Mandate Convergence, plus two legacy upgrades (Authority Bearing and Judicial Exile).</p>' +
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Imperative Mage), Arbiter gains broad law-setting authority that can impose layered constraints over wider spans and convert violations into immediate sentence momentum.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityZ9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityZ6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 4, <strong>Authority Bearing</strong> reaches imperative-grade sentence force. ' +
      'When your Objection triggers from an active Imperative Law, Layered Prohibition, or Boundary Edict, the target suffers both the Objection penalty and immediate spiritual backlash equal to <strong>Potency</strong> (once per target per round). ' +
      'If Authority Bearing was upcast by at least <strong>+2 Spirituality</strong>, the first affected target each round also has disadvantage on its next save against one of your Arbiter abilities before the end of its next turn.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 4, <strong>Judicial Exile</strong> expands from single-target banishment into line and zone sentencing. ' +
      'When cast inside your active jurisdiction, you may define either a 30-foot line or a 15-foot-radius area as the exile vector; all hostile creatures in that shape make saves separately. ' +
      'If Judicial Exile is upcast by at least <strong>+1 Spirituality</strong>, affected spirit-body entities cannot pass back across that vector until the end of their next turn.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const existing1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const existing2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const existing3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const existing4 = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityZ4001',
      name: 'Imperative Law',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish one broad law in a 40-foot-radius zone centered within 120 feet for 1 minute (concentration). Choose a law class such as <em>No hostile movement past declared boundary</em>, <em>No supernatural displacement</em>, <em>No weapon attacks</em>, or <em>No concealment inside jurisdiction</em>. Hostiles in the zone make a Wisdom save when the law appears and at the start of each of their turns. On failure, they must comply; if they violate, they proceed with disadvantage and take spiritual backlash equal to <strong>1</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase radius to 60 feet or declare a second compatible law class.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes, and you may recenter the law zone by up to 20 feet as a bonus action once each round.</li><li><strong>+4 Spirituality:</strong> Duration becomes 15 minutes, and failed violators also lose reactions until the start of their next turn.</li></ul><p><em>Counterplay:</em> law-compliant action lines, command immunity, and jurisdiction exit reduce imperative control pressure.</p><p><em>Corruption Hook:</em> if you draft imperative laws to institutionalize injustice, gain 1 Corruption.</p>',
      img: 'icons/sundries/books/book-symbol-scales.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'imperative law zone',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a metal page etched with two formal statutes',
      identifier: 'lotm-arbiter-imperative-law',
      activityId: 'arbiterSeq4Law01',
      now: now + 4,
      existing: existing1,
      sort: 1800500
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ4002',
      name: 'Boundary Edict',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Draw a luminous boundary line up to 60 feet long within 120 feet for 1 minute. A hostile creature that crosses it or begins its turn straddling it makes a Wisdom save. On failure, choose one: push it 15 feet back across the line, or reduce speed to 0 until end of turn. Allies crossing the boundary gain advantage on saves against forced movement until start of their next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend boundary to 90 feet, or create a ring (20-foot radius) instead of a line.</li><li><strong>+2 Spirituality:</strong> Failed crossers also take spiritual backlash equal to <strong>Potency</strong> and cannot take reactions until start of next turn.</li><li><strong>+4 Spirituality:</strong> Boundary lasts 10 minutes. Once per round, when a creature fails at the boundary, you may immediately apply Judicial Exile rider push (no extra save, no upcast) to that creature.</li></ul><p><em>Counterplay:</em> teleportation, flight above boundary volume, and anti-barrier effects mitigate edict lock.</p><p><em>Corruption Hook:</em> if you seal exits to trap noncombatants in harm, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-pentagon-magenta.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'line or ring boundary',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['somatic', 'material'],
      materials: 'chalk mixed with consecrated brass dust',
      identifier: 'lotm-arbiter-boundary-edict',
      activityId: 'arbiterSeq4Boundary02',
      now: now + 5,
      existing: existing2,
      sort: 1800501
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityZ4003',
      name: 'Overruling Verdict',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a creature within 120 feet declares an action that violates one of your active laws, verdicts, or prohibitions. The creature makes a Charisma save. On failure, the declared action is canceled and it must choose a different legal action or lose the action. On success, it proceeds but takes <strong>-1</strong> to the triggering roll/check.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Increase trigger range to 180 feet, or include one additional violating creature as part of the same reaction window (separate save).</li><li><strong>+2 Spirituality:</strong> Penalty scales to <strong>-Potency</strong>, and failed targets lose reactions until the start of their next turn.</li><li><strong>+4 Spirituality:</strong> Once per round, if a target fails this save, you may immediately trigger Punishment Mark rider effects on it even if it is not currently marked (temporary mark expires end of turn).</li></ul><p><em>Counterplay:</em> anti-command immunity, concealment of action declarations, and timing disruption reduce overrule consistency.</p><p><em>Corruption Hook:</em> if you overrule lawful defense to preserve personal status, gain 1 Corruption.</p>',
      img: 'icons/skills/melee/blade-tip-chipped-blood-red.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature declaring a violating action',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal'],
      materials: 'a black-ink verdict docket',
      identifier: 'lotm-arbiter-overruling-verdict',
      activityId: 'arbiterSeq4Overrule03',
      now: now + 6,
      existing: existing3,
      sort: 1800502
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityZ4004',
      name: 'Mandate Convergence',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Choose up to two hostile creatures within 90 feet currently affected by any of your Arbiter effects. For 1 minute (concentration), their violations feed one shared disciplinary track. The first time each target violates a law, prohibition, or verdict each round, choose one convergence result: (a) both targets take spiritual backlash equal to <strong>Potency</strong>, or (b) one target is immobilized until end of turn while the other has disadvantage on its next save before end of next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional target, or increase range to 150 feet.</li><li><strong>+2 Spirituality:</strong> You may choose a different convergence result for each trigger, and one ally within 30 feet gains <strong>+Potency</strong> to its next contested check against one converged target.</li><li><strong>+4 Spirituality:</strong> Once per round when a converged target fails a save, you may immediately cast Overruling Verdict against it as a free rider (no upcast).</li></ul><p><em>Counterplay:</em> breaking Arbiter debuffs, splitting distance, and immunity to movement/control effects reduce convergence payoff.</p><p><em>Corruption Hook:</em> if you deliberately engineer collective punishment against bystanders, gain 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-teal-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'hostiles already under Arbiter effects',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic'],
      materials: 'paired writ seals joined by silver thread',
      identifier: 'lotm-arbiter-mandate-convergence',
      activityId: 'arbiterSeq4Converge04',
      now: now + 7,
      existing: existing4,
      sort: 1800503
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));
    await abilitiesDb.put(ABILITY_3_KEY, JSON.stringify(ability3));
    await abilitiesDb.put(ABILITY_4_KEY, JSON.stringify(ability4));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const verifyLegacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const verifyAbility3 = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const verifyAbility4 = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    console.log(JSON.stringify({
      pathwayWritten: PATHWAY_KEY,
      folderWritten: FOLDER_KEY,
      legacyUpdated: [LEGACY_A_KEY, LEGACY_B_KEY],
      abilitiesWritten: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
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
        sequenceAbilities: [verifyAbility1, verifyAbility2, verifyAbility3, verifyAbility4].map((doc) => ({
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
