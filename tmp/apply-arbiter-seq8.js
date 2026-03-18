const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00022';
const FOLDER_KEY = '!folders!eiKFQVwZoYCkBNOF';
const LEGACY_KEY = '!items!lotmAbilityZ9001';
const ABILITY_1_KEY = '!items!lotmAbilityZ8001';
const ABILITY_2_KEY = '!items!lotmAbilityZ8002';
const PATHWAY_IDENTIFIER = 'lotm-arbiter';

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
    const pathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    if (!pathway) throw new Error('Arbiter pathway (lotmPathway00022) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> impartial authority through declared order, conflict de-escalation, and procedurally bound enforcement.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Authority Bearing, Preliminary Verdict.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Jurisdiction Field, Recognition Warrant, plus one legacy scope upgrade to Authority Bearing.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Sheriff), Arbiter expands from single-target rulings into local territory control, abnormality detection, and persistent identity recognition.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Arbiter folder (eiKFQVwZoYCkBNOF) not found.');

    folder.name = 'Arbiter';
    folder.description = 'Sequence abilities for the Arbiter pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyAbility = await getOptionalJson(abilitiesDb, LEGACY_KEY);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityZ9001 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, <strong>Authority Bearing</strong> extends into Sheriff territory control. ' +
      'If your target is inside your <strong>Jurisdiction Field</strong>, your Objection trigger can also respond to boundary breaches, concealment attempts, and movement checks made to bypass declared zone rules (such as stealth crossings, forced advances, or unlawful withdrawals). ' +
      'If you spend at least <strong>+1 Spirituality</strong> when activating Authority Bearing, jurisdiction-linked Objections may be issued against that target anywhere inside your active field, even without direct line of sight.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(LEGACY_KEY, JSON.stringify(legacyAbility));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityZ8001',
      name: 'Jurisdiction Field',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Establish a 20-foot-radius enforcement zone centered on a point you can see within 90 feet for 10 minutes. Declare one explicit field rule: <em>No hostile advance past a named line</em>, <em>No drawn weapons</em>, or <em>No supernatural ability use</em>. A hostile creature that enters the zone or starts its turn there makes a Wisdom save. On a failure, it chooses: comply (cannot perform the prohibited conduct this turn) or violate (may proceed, but suffers disadvantage on the triggering roll/check and loses 10 feet of speed until end of turn). Allies in the zone gain advantage on Perception and Investigation checks to spot concealed movement, abnormal traces, or hidden contraband.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 30 feet <strong>or</strong> you may recenter the zone up to 20 feet as a bonus action once each round.</li><li><strong>+2 Spirituality:</strong> Declare one additional field rule, <strong>or</strong> increase placement range to 150 feet.</li><li><strong>+4 Spirituality:</strong> The first creature each round that fails and violates a rule also loses reactions until the start of its next turn and is mystically outlined; it cannot benefit from invisibility or concealment against creatures inside the zone until end of its next turn.</li></ul><p><em>Counterplay:</em> leaving the zone, command immunity, severe sensory denial, or overwhelming force projection can blunt field control.</p><p><em>Corruption Hook:</em> If you deliberately define field rules to extort lawful civilians, gain 1 Corruption.</p>',
      img: 'icons/magic/defensive/shield-barrier-blue.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'enforcement zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a chalk ring marked with a magistrate seal',
      identifier: 'lotm-arbiter-jurisdiction-field',
      activityId: 'arbiterSeq8Act001',
      now: now + 3,
      existing: ability1Existing,
      sort: 1800100
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityZ8002',
      name: 'Recognition Warrant',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Designate one creature you can see within 120 feet, or one person represented by a clear photo or sketch you study while inside your active jurisdiction. For 1 hour, that identity is warrant-tagged to your senses. You have advantage on checks to identify, track, or distinguish the target through mundane disguise and crowd confusion. Once per round, when the target within 60 feet attempts Stealth, Deception, or a contested movement check to evade enforcement, you may use your reaction to demand compliance: it makes a Wisdom save, and on a failure takes <strong>-1</strong> to the triggering check.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Tag one additional target <strong>or</strong> extend duration to 8 hours.</li><li><strong>+2 Spirituality:</strong> When a tagged target enters your <strong>Jurisdiction Field</strong>, you immediately learn its direction and approximate distance while it remains in that field, and its first save against one of your field rules this round is made with disadvantage.</li><li><strong>+4 Spirituality:</strong> Once per round, when a tagged target damages an ally within 60 feet, you may use your reaction to inflict spiritual backlash equal to <strong>Potency</strong>; the target&apos;s speed becomes 0 until end of the current turn.</li></ul><p><em>Counterplay:</em> identity-layering mysticism, perfect doubles, hard anti-divination barriers, and full sensory isolation can break warrant tracking.</p><p><em>Corruption Hook:</em> If you knowingly fabricate warrant identity evidence to condemn innocents, gain 1 Corruption.</p>',
      img: 'icons/skills/tracking/magnifying-glass-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature seen directly or known via clear likeness',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'material'],
      materials: 'a signed warrant slip and a personal identifying mark',
      identifier: 'lotm-arbiter-recognition-warrant',
      activityId: 'arbiterSeq8Act002',
      now: now + 4,
      existing: ability2Existing,
      sort: 1800101
    });

    await abilitiesDb.put(ABILITY_1_KEY, JSON.stringify(ability1));
    await abilitiesDb.put(ABILITY_2_KEY, JSON.stringify(ability2));

    const verifyPathway = await getOptionalJson(pathwaysDb, PATHWAY_KEY);
    const verifyFolder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    const verifyLegacy = await getOptionalJson(abilitiesDb, LEGACY_KEY);
    const verifyAbility1 = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const verifyAbility2 = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
          folderLatestAuthoredSequence: verifyFolder?.flags?.lotm?.latestAuthoredSequence,
          legacyUpdated: {
            key: LEGACY_KEY,
            id: verifyLegacy?._id,
            name: verifyLegacy?.name,
            hasLegacyHeader: String(verifyLegacy?.system?.description?.value ?? '').includes(
              legacyHeader
            ),
            grantedSequence: verifyLegacy?.flags?.lotm?.grantedSequence,
            level: verifyLegacy?.system?.level
          },
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY],
          abilityReadBack: [
            {
              _id: verifyAbility1?._id,
              name: verifyAbility1?.name,
              folder: verifyAbility1?.folder,
              sourceClass: verifyAbility1?.system?.sourceClass,
              grantedSequence: verifyAbility1?.flags?.lotm?.grantedSequence,
              level: verifyAbility1?.system?.level
            },
            {
              _id: verifyAbility2?._id,
              name: verifyAbility2?.name,
              folder: verifyAbility2?.folder,
              sourceClass: verifyAbility2?.system?.sourceClass,
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
