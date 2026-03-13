const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00017';
const FOLDER_KEY = '!folders!ukRXXDOSR2TXowMz';
const LEGACY_KEY = '!items!lotmAbilityF9001';
const ABILITY_1_KEY = '!items!lotmAbilityF8001';
const ABILITY_2_KEY = '!items!lotmAbilityF8002';
const PATHWAY_IDENTIFIER = 'lotm-planter';

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
    folder: 'ukRXXDOSR2TXowMz',
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
    if (!pathway) throw new Error('Planter pathway (lotmPathway00017) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> nurturing cultivation through patient labor, life-giving guidance, and cyclical awareness of weather and growth.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Cultivator&#39;s Hands, Season Reading.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Herbal Diagnosis, Restorative Sap, plus one legacy efficiency upgrade to Cultivator&#39;s Hands.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Doctor), Planter expands from environmental stewardship into early healing praxis: reading life signs, stabilizing allies, and preserving rhythm over panic.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Planter folder (ukRXXDOSR2TXowMz) not found.');

    folder.name = 'Planter';
    folder.description = 'Sequence abilities for the Planter pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-planter',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyAbility = await getOptionalJson(abilitiesDb, LEGACY_KEY);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityF9001 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Efficiency)</h3>';
    const legacyText =
      '<p>At Sequence 8, your tending rhythm becomes clinically precise. ' +
      'When you use Cultivator&#39;s Hands and choose <strong>Nurture</strong>, the target also gains <strong>+1</strong> to one Medicine check made before the next short rest. ' +
      'If you spend at least <strong>+1 Spirituality</strong>, you may apply Nurture to one additional allied creature within 10 feet of the tended target. ' +
      'Once per short rest, this secondary Nurture application does not require the +1 surcharge.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(LEGACY_KEY, JSON.stringify(legacyAbility));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityF8001',
      name: 'Herbal Diagnosis',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Examine one creature within 10 feet by pulse, breath, skin tone, and odor. Learn one condition category currently affecting it (injury, poison, disease, exhaustion, or spiritual strain), and choose one response until the end of your next turn:</p><ul><li><strong>Stabilize:</strong> If the target is at 0 HP, it becomes stable.</li><li><strong>Guide Treatment:</strong> The next allied Medicine or Herbalism Kit check to treat that creature gains advantage.</li><li><strong>Prevent Worsening:</strong> The creature gains +1d4 on its next saving throw against poison, disease, or exhaustion.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 30 feet and you may diagnose one additional creature.</li><li><strong>+2 Spirituality:</strong> Guide Treatment also grants <strong>+Potency</strong> to the same check; Prevent Worsening can affect up to <strong>Potency</strong> creatures within 10 feet of the primary target.</li><li><strong>+4 Spirituality:</strong> For 1 minute, diagnosed allies gain resistance to poison damage and advantage on saves against disease and exhaustion while within 20 feet of you.</li></ul><p><em>Counterplay:</em> Illusions, concealed symptoms, rapidly mutating toxins, or anti-divination effects can distort diagnosis.</p><p><em>Corruption Hook:</em> If you intentionally withhold urgent treatment to gain leverage over a patient, gain 1 Corruption.</p>',
      img: 'icons/consumables/plants/herb-bundle-hanging.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature whose condition you assess',
      rangeUnits: 'ft',
      rangeValue: '10',
      rangeSpecial: '',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a clean linen strip and crushed bitterleaf',
      identifier: 'lotm-planter-herbal-diagnosis',
      activityId: 'planterSeq8DiagAct01',
      now: now + 3,
      existing: ability1Existing,
      sort: 1500100
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityF8002',
      name: 'Restorative Sap',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Coat a creature within 30 feet in a thin medicinal aura for 1 minute. The target immediately regains <strong>Potency</strong> HP and gains advantage on one death saving throw or one saving throw against poison/disease made before the effect ends.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Healing becomes <strong>Potency + SB</strong>, and you may affect one additional creature within 10 feet of the first.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes. While the aura lasts, the target regains additional HP equal to <strong>Potency</strong> the first time each round it starts its turn below half HP.</li><li><strong>+4 Spirituality:</strong> Burst of renewal: each affected creature immediately ends one of the following on itself if present: poisoned, diseased, or one level of exhaustion from non-magical causes; then it gains temporary HP equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> Fire, necrotic blight, anti-healing effects, or deliberate wound reopening can reduce sustained benefit.</p><p><em>Corruption Hook:</em> If you reserve healing only for status while letting preventable deaths occur, gain 1 Corruption.</p>',
      img: 'icons/skills/wounds/blood-cells-disease-green.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature receiving restorative treatment',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a vial of diluted herbal resin',
      identifier: 'lotm-planter-restorative-sap',
      activityId: 'planterSeq8HealAct02',
      now: now + 4,
      existing: ability2Existing,
      sort: 1500101
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
})();
