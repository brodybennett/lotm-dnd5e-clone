const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00019';
const FOLDER_KEY = '!folders!tYIG59nsaRs7qkLm';
const PATHWAY_IDENTIFIER = 'lotm-criminal';
const FOLDER_ID = 'tYIG59nsaRs7qkLm';

const LEGACY_A_KEY = '!items!lotmAbilityK5001'; // Desire Control
const LEGACY_B_KEY = '!items!lotmAbilityK6001'; // Malice Premonition

const ABILITY_1_ID = 'lotmAbilityK3001';
const ABILITY_2_ID = 'lotmAbilityK3002';
const ABILITY_3_ID = 'lotmAbilityK3003';
const ABILITY_4_ID = 'lotmAbilityK3004';

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
        grantedSequence: 3
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
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Desire Control, Defiling Seed, Desire Incarnation, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Demon of the Mind, Demon of the Body, Filthy Language, Hellfire Projection, plus two legacy upgrades.</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Corruption Cant, Mind-Spirit Hex, Distant Blather, Prayer Interception, plus two legacy upgrades (Desire Control and Malice Premonition).</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 3 (Blatherer), Demon-tier pressure develops into corruption authority over mind and spirit: words become curses, distance becomes irrelevant once a link is formed, and malicious prayer channels can be hijacked for remote coercion.</p>' +
      '<p><strong>Authoring Status:</strong> Sequence 3 authored in this run; remaining sequences continue in sequence-focused runs.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Criminal folder (tYIG59nsaRs7qkLm) not found.');

    folder.name = 'Criminal';
    folder.description = 'Sequence abilities for the Criminal pathway (authored through Sequence 3).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 3
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityK5001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityK6001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 3 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 3, <strong>Desire Control</strong> can chain through broken resolve. ' +
      'When one target fails its initial save, choose one creature within 15 feet of that target that can see or hear either of you; it must make a Wisdom save against the same DC or suffer a reduced version of the chosen desire effect until the end of its next turn. ' +
      'If Desire Control is cast with at least <strong>+2 Spirituality</strong>, this chained target also takes psychic damage equal to <strong>Potency</strong> on a failed save.</p>';
    const legacyADescription = String(legacyA.system?.description?.value ?? '');
    if (!legacyADescription.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADescription}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 3 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 3, <strong>Malice Premonition</strong> refines into predictive interception. ' +
      'Once per round, when Malice Premonition is triggered by a hostile action you identified before initiative or via a Blatherer connection effect, reduce any spirituality spend on its chosen upcast rider by <strong>1</strong> (minimum 0). ' +
      'When this discount is applied, one ally within 30 feet also gains a <strong>+1d4</strong> bonus to the same triggering defense check.</p>';
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
      name: 'Corruption Cant',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Speak a blasphemous cant at up to two creatures within 90 feet that can hear you. Each target makes a Wisdom save. On failure, it takes psychic plus necrotic damage equal to <strong>Potency + Potency</strong>, has disadvantage on Intelligence, Wisdom, and Charisma checks, and cannot benefit from Help until the end of its next turn.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> affect one additional creature.</li>' +
        '<li><strong>+2 Spirituality:</strong> duration becomes 1 minute (repeat Wisdom save at end of each target turn).</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets also take <strong>Potency</strong> psychic damage at the start of their next turn and lose reactions until then.</li>' +
        '<li><strong>+6 Spirituality:</strong> once per cast, choose one failed target; if it fails a second save before the effect ends, it gains one stage of temporary madness (GM condition rider) for 1 round.</li>' +
        '</ul><p><em>Counterplay:</em> silence, psychic resistance, and anti-curse sanctification reduce disruption.</p>' +
        '<p><em>Corruption Hook:</em> if you use this purely to break bystanders into panic, gain 1 Corruption.</p>',
      img: 'icons/magic/unholy/orb-hands-pink.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '2',
      targetSpecial: 'creatures that can hear you',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a torn tongue-shaped parchment branded with ash',
      identifier: 'lotm-criminal-corruption-cant',
      activityId: 'criminalSeq3Cant01',
      now: now + 4,
      existing: existing1,
      sort: 1900700
    });

    const ability2 = buildAbilityDoc({
      id: ABILITY_2_ID,
      name: 'Mind-Spirit Hex',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Afflict one creature within 60 feet with a mind-spirit curse (Charisma save). On failure, choose one hex mode for 1 minute: <strong>Fracture</strong> (disadvantage on concentration checks and Insight checks), <strong>Dread Leak</strong> (cannot gain advantage from inspiration-style effects and takes <strong>Potency</strong> psychic damage whenever it fails a save), or <strong>Blood Pulse</strong> (speed reduced by 10 feet and takes <strong>Potency</strong> necrotic damage when it makes a weapon attack).</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> target one additional creature within 20 feet of the first.</li>' +
        '<li><strong>+2 Spirituality:</strong> failed targets must repeat their save at end of each turn; on two consecutive failures they cannot take bonus actions until they succeed once.</li>' +
        '<li><strong>+4 Spirituality:</strong> failed targets are also marked as spiritually exposed; first attack against each marked target each round gains <strong>+Potency</strong> damage.</li>' +
        '<li><strong>+6 Spirituality:</strong> when a failed target drops below half HP, it must make a Wisdom save or become Frightened of you until end of its next turn.</li>' +
        '</ul><p><em>Counterplay:</em> curse removal, mind warding, and fear immunity reduce rider pressure.</p>' +
        '<p><em>Corruption Hook:</em> if you extend this hex on surrendered foes for pleasure, gain 1 Corruption.</p>',
      img: 'icons/magic/death/skull-horned-worn-fire-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a nail soaked in rancid oil and dried blood',
      identifier: 'lotm-criminal-mind-spirit-hex',
      activityId: 'criminalSeq3Hex02',
      now: now + 5,
      existing: existing2,
      sort: 1900701
    });

    const ability3 = buildAbilityDoc({
      id: ABILITY_3_ID,
      name: 'Distant Blather',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish or exploit a blather link with one creature you have seen within the last day, whose blood/true name you possess, or already marked by one of your curse effects. While linked for 10 minutes, you may project your voice to that target regardless of normal hearing distance on the same plane. Each projection forces a Wisdom save; on failure the target takes psychic damage equal to <strong>Potency</strong> and has disadvantage on its next save against your abilities.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> link duration becomes 1 hour.</li>' +
        '<li><strong>+2 Spirituality:</strong> each failed projection also inflicts <strong>Potency</strong> necrotic damage and blocks reactions until start of target&apos;s next turn.</li>' +
        '<li><strong>+4 Spirituality:</strong> once during the link, force an immediate second save; on failure, target is Stunned until the end of its current turn.</li>' +
        '<li><strong>+6 Spirituality:</strong> if the target is below one-third HP when it fails a projection save, you may force a Constitution save; on failure it drops to 0 HP instead of taking the projection damage (once per long rest).</li>' +
        '</ul><p><em>Counterplay:</em> severing line-of-sympathy components, anti-scrying wards, and sanctified identity masking can break the link.</p>' +
        '<p><em>Corruption Hook:</em> if you exploit this to execute helpless civilians in safe shelters, gain 1 Corruption.</p>',
      img: 'icons/magic/control/silhouette-aura-energy.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'linked target',
      rangeUnits: 'special',
      rangeValue: null,
      rangeSpecial: 'same-plane via blather link',
      school: 'nec',
      properties: ['vocal', 'material'],
      materials: 'blood sigil, true-name scrap, or prior curse mark',
      identifier: 'lotm-criminal-distant-blather',
      activityId: 'criminalSeq3Distant03',
      now: now + 6,
      existing: existing3,
      sort: 1900702
    });

    const ability4 = buildAbilityDoc({
      id: ABILITY_4_ID,
      name: 'Prayer Interception',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. For 10 minutes, attune to malicious, fearful, or desire-laden prayer echoes within 1 mile. Once per round during attunement, you may identify one praying source (direction and emotional profile), then either whisper a sentence only it hears or impose a minor spiritual tremor: target makes a Charisma save or suffers <strong>-Potency</strong> on its next mental save/check.</p>' +
        '<p><strong>Higher Spend (upcast):</strong></p><ul>' +
        '<li><strong>+1 Spirituality:</strong> attunement radius becomes 3 miles.</li>' +
        '<li><strong>+2 Spirituality:</strong> you may affect up to <strong>Potency</strong> prayer sources per round (separate saves).</li>' +
        '<li><strong>+4 Spirituality:</strong> when a source fails, you may instantly apply one baseline rider from Corruption Cant or Mind-Spirit Hex (no additional damage dice) until end of its next turn.</li>' +
        '<li><strong>+6 Spirituality:</strong> once during attunement, compel one failed source to blurt a harmful truth aloud (social exposure effect; GM adjudication on exact disclosure).</li>' +
        '</ul><p><em>Counterplay:</em> consecrated zones, anti-divination rites, and silent prayer discipline reduce interception fidelity.</p>' +
        '<p><em>Corruption Hook:</em> if you intercept prayers only to torment desperate noncombatants, gain 1 Corruption.</p>',
      img: 'icons/magic/symbols/rune-sigil-horned-white-purple.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'attunement field centered on self',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '1-mile attunement radius',
      school: 'div',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a soot-black rosary bead and clotted wax',
      identifier: 'lotm-criminal-prayer-interception',
      activityId: 'criminalSeq3Prayer04',
      now: now + 7,
      existing: existing4,
      sort: 1900703
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
