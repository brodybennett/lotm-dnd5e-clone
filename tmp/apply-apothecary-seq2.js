const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY3001';
const LEGACY_B_KEY = '!items!lotmAbilityY4001';

const ABILITY_1_KEY = '!items!lotmAbilityY2001';
const ABILITY_2_KEY = '!items!lotmAbilityY2002';
const ABILITY_3_KEY = '!items!lotmAbilityY2003';
const ABILITY_4_KEY = '!items!lotmAbilityY2004';

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
      level: 7,
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
        grantedSequence: 2
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
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Wings of Darkness, Corrosive Claw, Abyss Shackles, plus two legacy upgrades (Vital Herb Sight and Beast Communion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Discerning Spiritual Materials, Potion and Perfume Crafting, Crimson Pulse Reading, plus two legacy upgrades (Moonlit Distillation and Beast Communion).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Full Moon, Moonlight Transformation, Flash, plus two legacy upgrades (Wings of Darkness and Beast Communion).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Spirituality Manipulation, Moon Paper Figurine, Gaze of Darkness, Bat Swarm Transformation, plus two legacy upgrades (Abyss Shackles and Potion and Perfume Crafting).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Door of Summoning, Contract of the Crimson Court, Bat Wing Isolation, Crimson Full Moon Rite, plus two legacy upgrades (Full Moon and Discerning Spiritual Materials).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Creation Authority, Spirituality Tide Dominion, Moonlight Metamorphosis, Sovereign Summoning Gates, plus two legacy upgrades (Door of Summoning and Spirituality Manipulation).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Life-Giver), summoner authority matures into moon-creation dominion: direct life restoration, regional spirituality control, and multi-gate summoning under stable ritual cadence.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: PATHWAY_IDENTIFIER,
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(FOLDER_KEY, JSON.stringify(folder));

    const legacyA = await getOptionalJson(abilitiesDb, LEGACY_A_KEY);
    const legacyB = await getOptionalJson(abilitiesDb, LEGACY_B_KEY);
    if (!legacyA) throw new Error('Legacy target lotmAbilityY3001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY4001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 2, <strong>Door of Summoning</strong> can be routed through life-giver moon channels. ' +
      'When you cast Door of Summoning with at least <strong>+2 Spirituality</strong>, you may establish one secondary relay gate within 40 feet of the primary gate. ' +
      'A summoned unit may pass through one relay gate hop per round without spending movement, and commands issued from either gate are treated as if you had line of sight. ' +
      'If the cast includes <strong>+4 Spirituality</strong>, this relay option can support one additional lesser summon.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 2 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 2, <strong>Spirituality Manipulation</strong> inherits life-giver throughput control. ' +
      'Once per round while Spirituality Manipulation is active, you may choose one affected ally to recover spent Spirituality equal to <strong>Potency</strong> (minimum 1) or convert one failed save against fear, charm, poison, or disease into a success. ' +
      'If Spirituality Manipulation was cast with <strong>+4 Spirituality</strong>, you may apply both riders to different allies in the same round.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const ability3Existing = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);
    const ability4Existing = await getOptionalJson(abilitiesDb, ABILITY_4_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityY2001',
      name: 'Creation Authority',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Directly treat one living creature within 60 feet for 1 minute (concentration) without medicine. Immediately restore HP equal to <strong>2 x Potency</strong> and end one of these conditions: poisoned, diseased, frightened, or charmed. Until the effect ends, the target regains additional HP equal to <strong>Potency</strong> at the start of each of your turns.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> affect one additional living target within 20 feet of the first.</li><li><strong>+2 Spirituality:</strong> each affected target also gains advantage on Constitution saves and death saves until the effect ends.</li><li><strong>+4 Spirituality:</strong> once during duration, when an affected target would drop to 0 HP, it instead drops to 1 HP and immediately regains HP equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> anti-healing fields, curse lockouts, and concentration disruption can suppress the treatment flow.</p><p><em>Corruption Hook:</em> forcing obedience in exchange for life treatment adds 1 Corruption.</p>',
      img: 'icons/magic/life/heart-cross-strong-flame-purple-orange.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'living creature under direct life treatment',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'moonwater in a silver ampoule and a living herb root',
      identifier: 'lotm-apothecary-creation-authority',
      activityId: 'apothSeq2CreateAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800700
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY2002',
      name: 'Spirituality Tide Dominion',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Establish a 30-foot-radius moon-tide field centered within 120 feet for 1 minute (concentration). Choose one mode each round at start of your turn: <strong>Recovery</strong> (up to Potency allies recover 1 spent Spirituality), <strong>Drain</strong> (up to Potency hostiles make a Constitution save or lose 1 spent Spirituality equivalent and take psychic damage equal to <strong>Potency</strong>), or <strong>Instability</strong> (hostiles in field have disadvantage on concentration checks).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 40 feet, or choose two modes in the same round.</li><li><strong>+2 Spirituality:</strong> hostile failures in Drain mode also cannot take reactions until end of turn.</li><li><strong>+4 Spirituality:</strong> for 1 minute, your presence in the field grants allies advantage on saves against fear, charm, poison, and disease, and enemies that fail Drain take <strong>2 x Potency</strong> psychic damage instead.</li></ul><p><em>Counterplay:</em> anti-domain seals, forced displacement, and spirituality-shield effects reduce tide pressure.</p><p><em>Corruption Hook:</em> draining civilians to sustain dominion adds 1 Corruption.</p>',
      img: 'icons/magic/water/orb-ice-blue.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'moon-tide district',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a crimson moon sigil pressed into sea-salt',
      identifier: 'lotm-apothecary-spirituality-tide-dominion',
      activityId: 'apothSeq2TideAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800701
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY2003',
      name: 'Moonlight Metamorphosis',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Condense into moonlight form for 1 minute. You gain 60-foot fly speed, can move through spaces as narrow as 1 inch, and ignore nonmagical difficult terrain. While transformed, you gain resistance to necrotic, poison, and psychic damage, and you can end movement in dim light even if no natural moonlight is present.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> one willing ally within 10 feet may move with you as a moon-trail step up to 20 feet.</li><li><strong>+2 Spirituality:</strong> unfurl giant bat-wing afterimage once per round; enemies you pass within 5 feet must pass a Wisdom save or have disadvantage on their next attack roll before end of turn.</li><li><strong>+4 Spirituality:</strong> once during duration, split into three moonlight echoes for one round; you may cast one non-concentration Apothecary ability through any echo, then recombine.</li></ul><p><em>Counterplay:</em> radiant flood, anti-transformation effects, and sealed spaces can limit movement expression.</p><p><em>Corruption Hook:</em> using metamorphosis to stalk helpless targets for pleasure adds 1 Corruption.</p>',
      img: 'icons/magic/light/beam-rays-blue-large.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: '',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic'],
      materials: 'a moon-silver feather and preserved sanguine essence',
      identifier: 'lotm-apothecary-moonlight-metamorphosis',
      activityId: 'apothSeq2MetaAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800702
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityY2004',
      name: 'Sovereign Summoning Gates',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Open two sovereign moon gates within 120 feet for 1 minute (concentration). You may summon one major contracted entity or two lesser entities distributed across the gates. Summons can traverse between gates once per round as teleport movement. While both gates remain open, command range extends to 300 feet and summoned entities gain <strong>+Potency</strong> on one attack or utility check each round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> open a third gate, or increase gate duration to 10 minutes.</li><li><strong>+2 Spirituality:</strong> when a summon emerges from a gate, one hostile within 10 feet must pass a Wisdom save or lose reactions until end of turn.</li><li><strong>+4 Spirituality:</strong> once per round, you may trigger a gate conjunction pulse between two gates; creatures on the line between them make a Constitution save or take psychic damage equal to <strong>2 x Potency</strong> and have speed reduced by 15 feet until start of your next turn.</li></ul><p><em>Counterplay:</em> anti-summon boundaries, gate-anchor destruction, and concentration breaks can collapse the network.</p><p><em>Corruption Hook:</em> expanding gates in populated districts to farm unrest adds 1 Corruption.</p>',
      img: 'icons/magic/symbols/runes-star-purple.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '2',
      targetSpecial: 'sovereign gate anchor points',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'con',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'three signed summons, moonstone dust, and a blood-sealed ring',
      identifier: 'lotm-apothecary-sovereign-summoning-gates',
      activityId: 'apothSeq2GateAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1800703
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

    console.log(
      JSON.stringify(
        {
          pathwayKey: PATHWAY_KEY,
          pathwayId: verifyPathway?._id,
          pathwayIdentifier: verifyPathway?.system?.identifier,
          folderKey: FOLDER_KEY,
          folderId: verifyFolder?._id,
          folderName: verifyFolder?.name,
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
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY, ABILITY_4_KEY],
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
            },
            {
              _id: verifyAbility3?._id,
              name: verifyAbility3?.name,
              folder: verifyAbility3?.folder,
              sourceClass: verifyAbility3?.system?.sourceClass,
              grantedSequence: verifyAbility3?.flags?.lotm?.grantedSequence,
              level: verifyAbility3?.system?.level
            },
            {
              _id: verifyAbility4?._id,
              name: verifyAbility4?.name,
              folder: verifyAbility4?.folder,
              sourceClass: verifyAbility4?.system?.sourceClass,
              grantedSequence: verifyAbility4?.flags?.lotm?.grantedSequence,
              level: verifyAbility4?.system?.level
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
