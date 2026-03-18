const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

const PATHWAY_KEY = '!items!lotmPathway00018';
const FOLDER_KEY = '!folders!y19Aib8B9WnjpCGl';
const PATHWAY_IDENTIFIER = 'lotm-apothecary';
const FOLDER_ID = 'y19Aib8B9WnjpCGl';

const LEGACY_A_KEY = '!items!lotmAbilityY9001';
const LEGACY_B_KEY = '!items!lotmAbilityY8001';

const ABILITY_1_KEY = '!items!lotmAbilityY6001';
const ABILITY_2_KEY = '!items!lotmAbilityY6002';
const ABILITY_3_KEY = '!items!lotmAbilityY6003';

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
    if (!pathway) throw new Error('Apothecary pathway (lotmPathway00018) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> serene moonlit alchemy through diagnosis, gentle stabilization, and quiet control of medicinal flora.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Moonlit Distillation, Vital Herb Sight.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Beast Communion, Tranquil Menagerie, plus one legacy scope upgrade to Vital Herb Sight.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Wings of Darkness, Corrosive Claw, Abyss Shackles, plus two legacy upgrades (Vital Herb Sight and Beast Communion).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Discerning Spiritual Materials, Potion and Perfume Crafting, Crimson Pulse Reading, plus two legacy upgrades (Moonlit Distillation and Beast Communion).</p>' +
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Potions Professor), Vampire-level combat instincts mature into systematic reagent analysis and prepared elixir-perfume doctrine, retaining moon-calm cadence instead of reckless frenzy.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(PATHWAY_KEY, JSON.stringify(pathway));

    const folder = await getOptionalJson(abilitiesDb, FOLDER_KEY);
    if (!folder) throw new Error('Apothecary folder (y19Aib8B9WnjpCGl) not found.');

    folder.name = 'Apothecary';
    folder.description = 'Sequence abilities for the Apothecary pathway (authored through Sequence 6).';
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
    if (!legacyA) throw new Error('Legacy target lotmAbilityY9001 not found.');
    if (!legacyB) throw new Error('Legacy target lotmAbilityY8001 not found.');

    const legacyAHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const legacyAText =
      '<p>At Sequence 6, <strong>Moonlit Distillation</strong> can be prepared as a calm reserve tincture. ' +
      'At the end of a short rest, you may store one baseline dose in a sealed vial. ' +
      'Once before your next short rest, you may deliver that stored dose as a <strong>reaction</strong> to a creature in 30 feet when it fails a save against poison, disease, fear, or charm. ' +
      'Using the reserve vial reduces the first upcast surcharge on your next Moonlit Distillation this turn by 1 (minimum 0).</p>';
    const legacyADesc = String(legacyA.system?.description?.value ?? '');
    if (!legacyADesc.includes(legacyAHeader)) {
      legacyA.system.description.value = `${legacyADesc}${legacyAHeader}${legacyAText}`;
    }
    legacyA._stats = buildStats(now + 2, legacyA._stats);
    await abilitiesDb.put(LEGACY_A_KEY, JSON.stringify(legacyA));

    const legacyBHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const legacyBText =
      '<p>At Sequence 6, <strong>Beast Communion</strong> can be routed through pheromone-perfume markers. ' +
      'When you cast Beast Communion with at least <strong>+1 Spirituality</strong>, you may designate one marked scent point within 60 feet. ' +
      'A bonded Beast within 15 feet of that marker can receive your command as if it were within normal command distance, and one additional Beast within 10 feet of the marker can be included in your baseline bond target count once per cast.</p>';
    const legacyBDesc = String(legacyB.system?.description?.value ?? '');
    if (!legacyBDesc.includes(legacyBHeader)) {
      legacyB.system.description.value = `${legacyBDesc}${legacyBHeader}${legacyBText}`;
    }
    legacyB._stats = buildStats(now + 3, legacyB._stats);
    await abilitiesDb.put(LEGACY_B_KEY, JSON.stringify(legacyB));

    const ability1Existing = await getOptionalJson(abilitiesDb, ABILITY_1_KEY);
    const ability2Existing = await getOptionalJson(abilitiesDb, ABILITY_2_KEY);
    const ability3Existing = await getOptionalJson(abilitiesDb, ABILITY_3_KEY);

    const ability1 = buildAbilityDoc({
      id: 'lotmAbilityY6001',
      name: 'Discerning Spiritual Materials',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Action. Analyze up to two substances within 30 feet (herbs, blood, gland fluid, powder, residue, or prepared reagent) for 10 minutes. Learn their spiritual category, toxicity profile, and one safe or dangerous interaction. Before the effect ends, you gain advantage on one Medicine, Nature, Arcana, or Alchemist/Herbalism check involving those materials.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Analyze one additional substance, or extend range to 60 feet.</li><li><strong>+2 Spirituality:</strong> Identify one hidden impurity, curse-taint, or counterfeit marker and estimate handling risk; your next relevant crafting/check roll gains <strong>+Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Establish a 1-hour reagent map in a 30-foot area. Up to <strong>Potency</strong> allies in the map gain advantage on one check each to collect, stabilize, or neutralize local spiritual materials.</li></ul><p><em>Counterplay:</em> anti-divination seals, deliberately scrambled compounds, or rapidly mutating samples can return partial data.</p><p><em>Corruption Hook:</em> If you falsify analysis to trigger preventable poisoning, gain 1 Corruption.</p>',
      img: 'icons/commodities/materials/slime-gelatinous-green.webp',
      activationType: 'action',
      durationValue: '10',
      durationUnits: 'minute',
      targetType: 'object',
      targetCount: '2',
      targetSpecial: 'substances or spiritual residues',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic', 'material'],
      materials: 'a silver tasting spoon and moonflower filter cloth',
      identifier: 'lotm-apothecary-discerning-spiritual-materials',
      activityId: 'apothSeq6MatAct01',
      now: now + 4,
      existing: ability1Existing,
      sort: 1800300
    });

    const ability2 = buildAbilityDoc({
      id: 'lotmAbilityY6002',
      name: 'Potion and Perfume Crafting',
      description:
        '<p><strong>Baseline (1 Spirituality):</strong> Action. Rapidly craft one short-lived potion or perfume dose (expires after 1 hour). Choose one formula:</p><ul><li><strong>Solar Water:</strong> One target in 30 feet takes radiant damage equal to <strong>Potency</strong>; undead and vampire-type creatures have disadvantage on the save.</li><li><strong>Shadow Draft:</strong> One willing creature gains 10 feet movement and may Hide as part of movement once before end of next turn.</li><li><strong>Animal-Friendly Perfume:</strong> One ally gains advantage on Animal Handling checks and Beast reaction rolls for 10 minutes.</li></ul><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Craft one additional distinct dose, or deliver one crafted dose to a target within 60 feet.</li><li><strong>+2 Spirituality:</strong> Add one rider: anti-smell masking, anti-dream shielding, or dragon-breath burst (15-foot cone, damage equal to <strong>Potency</strong> fire, Dex save half).</li><li><strong>+4 Spirituality:</strong> Assemble a dual batch with one offensive and one support dose in the same action; one chosen dose can be consumed or applied as a bonus action this turn, and all crafted doses last 8 hours instead of 1 hour.</li></ul><p><em>Counterplay:</em> disrupted components, anti-potion fields, and conflicting concurrent potions can degrade effects.</p><p><em>Corruption Hook:</em> If you knowingly distribute unstable brews in civilian settings, gain 1 Corruption.</p>',
      img: 'icons/consumables/potions/bottle-round-corked-red.webp',
      activationType: 'action',
      durationValue: '1',
      durationUnits: 'hour',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature receiving crafted dose or spray',
      rangeUnits: 'ft',
      rangeValue: '30',
      rangeSpecial: '',
      school: 'trs',
      properties: ['somatic', 'material'],
      materials: 'a portable alchemy kit, distilled alcohol, and scent fixative',
      identifier: 'lotm-apothecary-potion-and-perfume-crafting',
      activityId: 'apothSeq6BrewAct02',
      now: now + 5,
      existing: ability2Existing,
      sort: 1800301
    });

    const ability3 = buildAbilityDoc({
      id: 'lotmAbilityY6003',
      name: 'Crimson Pulse Reading',
      description:
        '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Read heartbeat cadence and scent drift from one creature within 60 feet that you can hear or smell for 1 minute. You learn one of the following: immediate emotional state, whether it is likely lying in current speech, toxin burden category, or concealed scent trail direction. You gain advantage on your next Insight, Investigation, or Survival check against that target before the effect ends.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Read up to two additional creatures in range, or extend range to 120 feet.</li><li><strong>+2 Spirituality:</strong> Detect one invisible or obscured creature that fails to mask scent in 30 feet of the primary target, and gain <strong>+Potency</strong> on one social check against a read target.</li><li><strong>+4 Spirituality:</strong> For 1 minute, once per round when a read target makes an attack or Deception check, you may use your reaction to impose <strong>-Potency</strong> on the roll or grant <strong>+Potency</strong> to one allied opposing check.</li></ul><p><em>Counterplay:</em> complete scent suppression, silence barriers, or artificial pulse mimicry can blunt the read.</p><p><em>Corruption Hook:</em> If you exploit private biological tells to coerce consent, gain 1 Corruption.</p>',
      img: 'icons/magic/perception/orb-crystal-pink.webp',
      activationType: 'bonus',
      durationValue: '1',
      durationUnits: 'minute',
      targetType: 'creature',
      targetCount: '1',
      targetSpecial: 'creature you can hear or smell',
      rangeUnits: 'ft',
      rangeValue: '60',
      rangeSpecial: '',
      school: 'div',
      properties: ['somatic'],
      materials: 'a drop of blood on a moon-silver coin',
      identifier: 'lotm-apothecary-crimson-pulse-reading',
      activityId: 'apothSeq6PulseAct03',
      now: now + 6,
      existing: ability3Existing,
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
          abilityKeys: [ABILITY_1_KEY, ABILITY_2_KEY, ABILITY_3_KEY],
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
