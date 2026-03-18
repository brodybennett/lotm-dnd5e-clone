const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY7003';
const LEGACY_B_KEY = '!items!lotmAbilityY6002';

const ABILITY_1_KEY = '!items!lotmAbilityY4001';
const ABILITY_2_KEY = '!items!lotmAbilityY4002';
const ABILITY_3_KEY = '!items!lotmAbilityY4003';
const ABILITY_4_KEY = '!items!lotmAbilityY4004';

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
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Shaman King), Scarlet Scholar mooncraft reaches demigod authority: instant ritual-level spirituality handling, substitution control, and swarm-state survival while preserving medicinal precision and command discipline.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 4).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityY7003 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY6002 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const legacyAText =
      '<p>At Sequence 4, <strong>Abyss Shackles</strong> inherits demigod-level darkness leverage. ' +
      'When a target fails against Abyss Shackles and is in dim light or darkness, you may also suspend up to a 10-foot cube of unsecured structure or debris near it. ' +
      'That suspended mass creates difficult terrain in a 10-foot radius when dropped (no action) before the end of your next turn. ' +
      'If cast with at least <strong>+2 Spirituality</strong>, this suspended-mass rider can affect one additional failed target.</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 4 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 4, <strong>Potion and Perfume Crafting</strong> can be folded into near-instant moon ritual flow. ' +
      'Once per short rest, after you cast a Sequence 4 ability, you may immediately craft one baseline perfume/potion dose from Potion and Perfume Crafting as part of the same action economy. ' +
      'When used this way, the first upcast surcharge paid on that crafted dose in the same turn is reduced by <strong>1</strong> (minimum 0), and delivery range becomes 60 feet.</p>';
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
      id: 'lotmAbilityY4001',
      name: 'Spirituality Manipulation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Exert direct moon-spiritual control in a 30-foot radius within 90 feet for 1 minute. Choose one mode: (a) <strong>Moon Strength Drawing</strong> - up to <strong>Potency</strong> allies gain +Potency on one attack roll, save, or skill check each round; (b) <strong>Undead Conversion Pulse</strong> - one corpse or undead remnant in area is converted into a temporary servant under your command for 1 minute (GM stat baseline minion).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 40 feet, or activate both modes in the same cast.</li><li><strong>+2 Spirituality:</strong> Undead conversion can affect one additional valid corpse/remnant; Moon Strength mode can include one additional ally each round.</li><li><strong>+4 Spirituality:</strong> Maintain ritual pressure for 10 minutes. Once per round, when an affected ally fails a save against fear/charm/poison/disease, you may grant an immediate reroll with <strong>+Potency</strong>.</li></ul><p><em>Counterplay:</em> anti-necromancy wards, purified ground, and spirituality suppression fields can block either mode.</p><p><em>Corruption Hook:</em> if you mass-convert remains in sanctified civilian spaces for intimidation, gain 1 Corruption.</p>',
      img: 'icons/magic/life/heart-cross-strong-flame-purple-orange.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'moon-spiritual ritual zone',
      rangeUnits: 'ft',
      rangeValue: '90',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'moon-inscribed silver dust and a blood-sealed sigil strip',
      identifier: 'lotm-apothecary-spirituality-manipulation',
      activityId: 'apothSeq4SpiritAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800500
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY4002',
      name: 'Moon Paper Figurine',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Reaction when you are hit or fail a save. Condense nearby moonlight into a figurine and substitute positions with it. Reduce triggering damage by <strong>Potency</strong> and teleport up to 20 feet to an unoccupied space you can see. The figurine remains until start of your next turn and can be targeted instead of you by one incoming attack.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Teleport distance becomes 40 feet and reduction becomes <strong>2 x Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Create one additional figurine decoy within 10 feet of the first; attackers have disadvantage to identify your true position until start of your next turn.</li><li><strong>+4 Spirituality:</strong> If the trigger was a critical hit or failed save, you may fully negate the trigger and leave behind a delayed moonburst at the original spot; creatures within 10 feet make a Wisdom save or lose reactions until start of their next turn.</li></ul><p><em>Counterplay:</em> anti-teleport effects, moonlight denial, and true-sight style tracking reduce substitution success.</p><p><em>Corruption Hook:</em> if you bait allies into taking hits using false substitution cues, gain 1 Corruption.</p>',
      img: 'icons/commodities/materials/paper-folded-white.webp',
      activationType: 'reaction',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'self substitution response',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'ill',
      properties: ['somatic', 'material'],
      materials: 'a folded paper strip brushed with moonwater',
      identifier: 'lotm-apothecary-moon-paper-figurine',
      activityId: 'apothSeq4FigAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800501
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY4003',
      name: 'Gaze of Darkness',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Action. Lock a substitution gaze on one creature within 120 feet that can see you. It makes a Wisdom save. On failure, establish a darkness link until the end of your next turn. While linked, you may use a bonus action once to trigger one effect: <strong>Restrain</strong> (target speed 0 and no reactions until start of its next turn) or <strong>Rupture</strong> (psychic damage equal to <strong>Potency</strong> plus necrotic damage equal to <strong>Potency</strong>).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Extend range to 180 feet or link one additional creature (separate save).</li><li><strong>+2 Spirituality:</strong> Link duration becomes 1 minute (save ends each turn), and your trigger effect can be used once each round.</li><li><strong>+4 Spirituality:</strong> On a failed initial save, the target is also blinded by solidified darkness until end of its next turn; if already in dim light/darkness, it has disadvantage on the initial save.</li></ul><p><em>Counterplay:</em> broken line of sight, eye-obscuring effects, and anti-substitution wards can sever the link.</p><p><em>Corruption Hook:</em> if you repeatedly rupture helpless minds for experimentation, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/eye-ringed-glow-angry-red.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature that can see you',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'nec',
      properties: ['vocal', 'somatic'],
      materials: '',
      identifier: 'lotm-apothecary-gaze-of-darkness',
      activityId: 'apothSeq4GazeAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800502
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityY4004',
      name: 'Bat Swarm Transformation',
      description:
        '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Transform into a semi-illusory bat swarm for 1 minute. You gain 30-foot flight, can move through spaces as narrow as 1 foot, and have resistance to bludgeoning/piercing/slashing from nonmagical attacks. While transformed, you cannot wield heavy weapons, but once per round a creature you pass through takes psychic damage equal to <strong>Potency</strong> (Wisdom save half).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Flight speed becomes 50 feet and you may pass through one hostile creature space without provoking opportunity attacks.</li><li><strong>+2 Spirituality:</strong> At start of your turn, reform briefly and cast one non-concentration Apothecary ability with activation of action or bonus action, then return to swarm form (once per round).</li><li><strong>+4 Spirituality:</strong> If reduced to 0 HP while transformed, disperse instead: drop to 1 HP, teleport up to 30 feet to dim light/darkness, and end transformation (once per short rest).</li></ul><p><em>Counterplay:</em> large area fire/radiance, anti-transformation seals, and contained spaces with no valid exits can pressure swarm survival.</p><p><em>Corruption Hook:</em> if you terrorize civilians using swarm form to induce blood panic, gain 1 Corruption.</p>',
      img: 'icons/creatures/mammals/bats-moonlit-cluster.webp',
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
      properties: ['somatic', 'concentration'],
      materials: 'a drop of preserved sanguine essence',
      identifier: 'lotm-apothecary-bat-swarm-transformation',
      activityId: 'apothSeq4BatAct04',
      now: now + 7,
      existing: ability4Existing,
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
