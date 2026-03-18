const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY3004';
const LEGACY_B_KEY = '!items!lotmAbilityY2004';

const ABILITY_1_KEY = '!items!lotmAbilityY1001';
const ABILITY_2_KEY = '!items!lotmAbilityY1002';
const ABILITY_3_KEY = '!items!lotmAbilityY1003';
const ABILITY_4_KEY = '!items!lotmAbilityY1004';

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
      '<p><strong>Sequence 1 Package (Gain Budget +74):</strong> Sublime Moon Visage, Living Miracle Atelier, Crimson Moon Sovereignty, Unrefused Summons, plus two legacy upgrades (Crimson Full Moon Rite and Sovereign Summoning Gates).</p>' +
      '<p><strong>Sequence 0 Status:</strong> Pending authoring in a later sequence-focused run.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 1 (Beauty Goddess), life-giver authority becomes symbolic law: beauty pressure, moon-environment control, and irresistible summoning are expressed as calm, sovereign ritual governance.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 1).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityY3004 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY2004 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 1 - Potency)</h3>';
    const legacyAText =
      '<p>At Sequence 1, <strong>Crimson Full Moon Rite</strong> carries divine-beauty pressure. ' +
      'While the rite is active, hostile creatures that fail its Wisdom save also suffer <strong>-Potency</strong> on their next attack roll or save before the end of their next turn. ' +
      'If the rite was cast with at least <strong>+2 Spirituality</strong>, this penalty also applies to one additional failed target each round. ' +
      'If cast with <strong>+4 Spirituality</strong>, allies selected by the rite recover 1 spent Spirituality the first time each enters the district (once per creature per cast).</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 1 - Efficiency)</h3>';
    const legacyBText =
      '<p>At Sequence 1, <strong>Sovereign Summoning Gates</strong> gain queen-grade command economy. ' +
      'The first summon issued from the gate network each round does not increase Spirituality cost from command riders. ' +
      'Once per round, when a summoned unit passes through a sovereign gate, you may immediately apply one baseline effect of Contract of the Crimson Court to it without additional action. ' +
      'If Sovereign Summoning Gates was cast with <strong>+4 Spirituality</strong>, this free contract rider can affect two summons per round instead of one.</p>';
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
      id: 'lotmAbilityY1001',
      name: 'Sublime Moon Visage',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Unveil transcendent moon-beauty in a 60-foot aura for 1 minute (concentration). Hostile creatures that see you make a Wisdom save. On failure, they are awe-locked until end of their next turn: they cannot willingly move closer, have disadvantage on attacks against you, and cannot target you with hostile effects unless you harmed them since your previous turn. Allies in aura gain advantage on saves against fear and charm.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> aura radius becomes 90 feet, or include one ally each round to gain <strong>+Potency</strong> on one social or command check.</li><li><strong>+2 Spirituality:</strong> failed hostiles also lose reactions and suffer <strong>-Potency</strong> on concentration checks until start of their next turn.</li><li><strong>+4 Spirituality:</strong> once per round, a failed hostile must choose: immediately end one hostile effect it maintains, or take psychic damage equal to <strong>2 x Potency</strong>.</li></ul><p><em>Counterplay:</em> blind/sightless targeting, anti-charm wards, and mirrored occlusion can limit visage impact.</p><p><em>Corruption Hook:</em> weaponizing reverence to erase others\' agency for vanity adds 1 Corruption.</p>',
      img: 'icons/magic/light/hand-sparks-smoke-teal.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'self',
      targetCount: '1',
      targetSpecial: 'emanated beauty aura',
      rangeUnits: 'self',
      rangeValue: null,
      rangeSpecial: '',
      school: 'enc',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'a polished crimson mirror anointed with moonwater',
      identifier: 'lotm-apothecary-sublime-moon-visage',
      activityId: 'apothSeq1VisageAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800800
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY1002',
      name: 'Living Miracle Atelier',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Establish a 40-foot moonlit atelier for 10 minutes (concentration). Choose up to <strong>Potency</strong> living creatures in the atelier each round. Chosen creatures immediately recover HP equal to <strong>2 x Potency</strong>, end one of poisoned, diseased, frightened, charmed, or minor corruption symptoms, and gain resistance to necrotic and poison until start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 60 feet, or double the number of chosen creatures this round.</li><li><strong>+2 Spirituality:</strong> chosen creatures also recover 1 spent Spirituality and have advantage on death saves until the effect ends.</li><li><strong>+4 Spirituality:</strong> once per creature during duration, when a chosen creature would drop to 0 HP, it instead drops to 1 HP, regains HP equal to <strong>Potency</strong>, and may move 10 feet without provoking opportunity attacks.</li></ul><p><em>Counterplay:</em> anti-healing sigils, curse anchors, and concentration breaks can collapse atelier output.</p><p><em>Corruption Hook:</em> selectively denying life support to enforce devotion adds 1 Corruption.</p>',
      img: 'icons/magic/life/tree-glowing-silhouette-green.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'moonlit life atelier district',
      rangeUnits: 'ft',
      rangeValue: '120',
      rangeSpecial: '',
      school: 'abj',
      properties: ['vocal', 'somatic', 'material', 'concentration'],
      materials: 'living mistletoe, blood-ink formula, and a silver distillation coil',
      identifier: 'lotm-apothecary-living-miracle-atelier',
      activityId: 'apothSeq1AtelierAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800801
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY1003',
      name: 'Crimson Moon Sovereignty',
      description:
        '<p><strong>Baseline (3 Spirituality):</strong> Action. Declare a sovereign crimson moon phase over a 90-foot-radius area centered within 300 feet for 1 minute (concentration). You choose one environmental law each round: <strong>Still Tide</strong> (hostile movement speed -15 feet), <strong>Veiled Night</strong> (hostiles have disadvantage on Perception checks relying on sight), or <strong>Gentle Dominion</strong> (allies gain +Potency on one save each round). The visible moonlight tone in the area changes to your chosen crimson shade.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> radius becomes 120 feet, or switch laws once during the same round.</li><li><strong>+2 Spirituality:</strong> hostiles entering or starting turn in area must pass a Wisdom save or cannot take reactions until end of turn.</li><li><strong>+4 Spirituality:</strong> once during duration, suspend one hostile zone effect of Sequence 3 or lower within the area for 1 round, or purge one allied zone from suppressive terrain penalties for 1 round.</li></ul><p><em>Counterplay:</em> anti-domain authorities, weather override effects, and distance/cover denial can limit sovereignty control.</p><p><em>Corruption Hook:</em> rewriting moon ambience to induce dependency cult behavior adds 1 Corruption.</p>',
      img: 'icons/magic/light/orbs-firefly-hand-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'space',
      targetCount: '1',
      targetSpecial: 'sovereign moon phase district',
      rangeUnits: 'ft',
      rangeValue: '300',
      rangeSpecial: '',
      school: 'ill',
      properties: ['vocal', 'somatic', 'concentration'],
      materials: 'crimson moonstone powder dissolved in night dew',
      identifier: 'lotm-apothecary-crimson-moon-sovereignty',
      activityId: 'apothSeq1SovAct03',
      now: now + 6,
      existing: ability3Existing,
      sort: 1800802
    });

    const ability4 = buildAbilityDoc({
      id: 'lotmAbilityY1004',
      name: 'Unrefused Summons',
      description:
        '<p><strong>Baseline (4 Spirituality):</strong> Action. Issue a sovereign summoning call to up to <strong>Potency</strong> eligible beings within 500 feet that can perceive moonlight or your spiritual mark (plants, animals, humans, or supernatural entities of lower sequence band at GM discretion). Each target makes a Wisdom save. On failure, it must approach a point you designate within 30 feet of you or a sovereign gate by safest route and cannot take hostile actions against you until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> double eligible target count, or extend range to 1,000 feet in open night conditions.</li><li><strong>+2 Spirituality:</strong> failed targets are also marked for 1 minute; marked targets suffer <strong>-Potency</strong> on checks to resist your command and summoning abilities.</li><li><strong>+4 Spirituality:</strong> once per cast, convert one failed target into a calm vassal state for 1 minute (save ends each turn); while vassalized, it cannot deliberately harm your designated allies and can perform one complex non-suicidal task.</li></ul><p><em>Counterplay:</em> anti-command protections, deafness/sense denial, and sequence superiority can negate or reduce compulsory call effects.</p><p><em>Corruption Hook:</em> compulsively bending innocents to your call for convenience adds 1 Corruption.</p>',
      img: 'icons/magic/control/debuff-energy-hold-purple.webp',
      activationType: 'action',
      durationValue: '',
      durationUnits: 'inst',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'multiple eligible beings per cast',
      rangeUnits: 'ft',
      rangeValue: '500',
      rangeSpecial: '',
      school: 'con',
      properties: ['vocal', 'somatic', 'material'],
      materials: 'a blood-sealed summons decree and moon-scribed silver bell',
      identifier: 'lotm-apothecary-unrefused-summons',
      activityId: 'apothSeq1SummonAct04',
      now: now + 7,
      existing: ability4Existing,
      sort: 1800803
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
              hasLegacyHeader: String(verifyLegacyA?.system?.description?.value ?? '').includes(legacyAHeader),
              grantedSequence: verifyLegacyA?.flags?.lotm?.grantedSequence,
              level: verifyLegacyA?.system?.level
            },
            {
              key: LEGACY_B_KEY,
              id: verifyLegacyB?._id,
              name: verifyLegacyB?.name,
              hasLegacyHeader: String(verifyLegacyB?.system?.description?.value ?? '').includes(legacyBHeader),
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
