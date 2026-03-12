const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = '0000000000000000';

function buildStats(now, existing = null) {
  const createdTime = existing?.createdTime ?? now;
  return {
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

function buildActivity({ id, activationType, durationUnits }) {
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
        units: 'ft'
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

function buildSeq2Ability({
  id,
  name,
  img,
  description,
  activationType,
  durationValue,
  durationUnits,
  targetType,
  targetCount,
  targetSpecial,
  templateType,
  templateUnits,
  rangeUnits,
  rangeValue,
  rangeSpecial,
  school,
  properties,
  materials,
  identifier,
  activityId,
  sort,
  existing,
  now
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
          units: templateUnits,
          contiguous: false,
          type: templateType
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
      sourceClass: 'lotm-warrior'
    },
    effects: [],
    folder: 'HU7eK5t0hJEd93Ug',
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
    const pathwayKey = '!items!lotmPathway00011';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Warrior pathway (lotmPathway00011) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> stoic frontline command through trained violence, iron resolve, and twilight-forged endurance.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Combat Mastery, Physical Enhancement.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Supernatural Resistance, Close-Quarters Mastery, plus one legacy scope upgrade to Combat Mastery.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Weapon Mastery, Iron Body Discipline, Twilight Reversal, plus two legacy upgrades (Close-Quarters Mastery and Supernatural Resistance).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Light of Dawn, Dawn Armour, Sword of Dawn, plus two legacy upgrades (Weapon Mastery and Iron Body Discipline).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Protection, Illusion Immunity, Unbreakable Defense, plus two legacy upgrades (Light of Dawn and Dawn Armour).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Eye of Demon Hunting, Weapon Ointment Mastery, Mind Concealment, Incomplete Mythical Creature Form, plus two legacy upgrades (Protection and Light of Dawn).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Mercury Liquefaction, Silver Rapier, Light Concealment, Hurricane of Light, plus two legacy upgrades (Eye of Demon Hunting and Weapon Ointment Mastery).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Twilight Greatsword, Cage of Glory, Passage of Twilight, Purifying Devastation, plus two legacy upgrades (Silver Rapier and Hurricane of Light).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Glory), simplified authorities of Combat, Twilight, and Holiness converge: the Silver Knight line becomes angelic battlefield law through sealing protection, time-decay pressure, and purifying devastation.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const rapierKey = '!items!lotmAbilityW3002';
    const rapier = await getOptionalJson(abilitiesDb, rapierKey);
    if (!rapier) throw new Error('Legacy target lotmAbilityW3002 not found.');
    const rapierHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    if (!String(rapier.system?.description?.value ?? '').includes(rapierHeader)) {
      rapier.system.description.value +=
        `${rapierHeader}<p>At Sequence 2, Silver Rapier may be projected as a twilight greatblade trace. ` +
        `When you spend at least +2 Spirituality on Silver Rapier, one hit this turn may originate from any visible point within 30 feet of the target, ` +
        `and the target's movement speed is reduced by 10 feet until the start of your next turn.</p>`;
    }
    rapier._stats = buildStats(now + 2, rapier._stats);
    await abilitiesDb.put(rapierKey, JSON.stringify(rapier));

    const hurricaneKey = '!items!lotmAbilityW3004';
    const hurricane = await getOptionalJson(abilitiesDb, hurricaneKey);
    if (!hurricane) throw new Error('Legacy target lotmAbilityW3004 not found.');
    const hurricaneHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    if (!String(hurricane.system?.description?.value ?? '').includes(hurricaneHeader)) {
      hurricane.system.description.value +=
        `${hurricaneHeader}<p>At Sequence 2, Hurricane of Light can be rendered as orange-red Twilight stormfire. ` +
        `Increase its baseline damage by <strong>+Potency</strong>. If cast with +4 Spirituality or higher, ` +
        `affected creatures that fail the save also suffer one round of slowed thought, losing reactions and suffering -10 feet speed.</p>`;
    }
    hurricane._stats = buildStats(now + 3, hurricane._stats);
    await abilitiesDb.put(hurricaneKey, JSON.stringify(hurricane));

    const w2001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW2001');
    const w2002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW2002');
    const w2003Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW2003');
    const w2004Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW2004');

    const abilities = [
      buildSeq2Ability({
        id: 'lotmAbilityW2001',
        name: 'Twilight Greatsword',
        img: 'icons/weapons/swords/greatsword-ornate-gold.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Condense an orange-red greatsword of twilight and strike one creature within 30 feet. On a failed save, it takes damage equal to <strong>3 x Potency</strong> and is slowed (speed -10 feet) until end of your next turn.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> You may target one additional creature within 10 feet of the first.</li>' +
          '<li><strong>+2 Spirituality:</strong> The strike can manifest from any visible point within 60 feet before converging on the target.</li>' +
          '<li><strong>+4 Spirituality:</strong> Failed targets are briefly twilight-frozen; they cannot take reactions and have disadvantage on one attack before your next turn.</li></ul>' +
          '<p><em>Counterplay:</em> Hard cover, displacement reactions, and anti-conjuration wards can blunt line-of-arrival pressure.</p>' +
          '<p><em>Corruption Hook:</em> Executing helpless targets with this art adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '',
        durationUnits: 'inst',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'one creature within 30 feet',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'ft',
        rangeValue: '30',
        rangeSpecial: '',
        school: 'evc',
        properties: ['vocal', 'somatic'],
        materials: 'a tarnished giant-warrior insignia',
        identifier: 'lotm-warrior-twilight-greatsword',
        activityId: 'warriorSeq2Act001',
        sort: 800700,
        existing: w2001Existing,
        now: now + 4
      }),
      buildSeq2Ability({
        id: 'lotmAbilityW2002',
        name: 'Cage of Glory',
        img: 'icons/magic/defensive/barrier-shield-dome-deflect-teal.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Raise a twilight-tinged protection cage in a 15-foot radius for 1 minute. Allies inside gain <strong>+Potency</strong> to defensive checks, and one hostile creature entering or starting turn inside must save or become restrained until end of its turn.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Radius becomes 20 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> The cage gains sealing effect against one ongoing ritual or cursed object influence in the area while you remain within 30 feet.</li>' +
          '<li><strong>+4 Spirituality:</strong> Choose up to two hostile creatures; on failed saves they cannot cross the cage boundary for 1 round.</li></ul>' +
          '<p><em>Counterplay:</em> Forcing the caster away or breaking concentration-like focus collapses advanced sealing riders.</p>' +
          '<p><em>Corruption Hook:</em> Using a cage for needless imprisonment adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '1',
        durationUnits: 'minute',
        targetType: 'sphere',
        targetCount: '1',
        targetSpecial: '15-foot-radius cage centered on a visible point',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '60',
        rangeSpecial: '',
        school: 'abj',
        properties: ['vocal', 'somatic'],
        materials: 'a ring of iron etched with twilight marks',
        identifier: 'lotm-warrior-cage-of-glory',
        activityId: 'warriorSeq2Act002',
        sort: 800701,
        existing: w2002Existing,
        now: now + 5
      }),
      buildSeq2Ability({
        id: 'lotmAbilityW2003',
        name: 'Passage of Twilight',
        img: 'icons/magic/time/clock-stopwatch-white-blue.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Invoke twilight passage on yourself for 1 minute. Once during duration, when you would be reduced to 0 HP, you may instead evaporate into spirit-state and reappear at the start of your next turn in an unoccupied space within 30 feet with HP equal to <strong>Potency</strong>.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Reappearance range becomes 60 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> On reappearance, remove one non-conceptual movement debuff or restraint.</li>' +
          '<li><strong>+4 Spirituality:</strong> You may target one willing ally within 30 feet instead of yourself; ally gains the baseline effect for 1 minute.</li></ul>' +
          '<p><em>Counterplay:</em> Anti-spirit locks, dimensional anchors, or area sanctification can prevent re-entry points.</p>' +
          '<p><em>Backlash:</em> Each trigger imposes one stage of age-strain until short rest.</p>',
        activationType: 'bonus',
        durationValue: '1',
        durationUnits: 'minute',
        targetType: 'self',
        targetCount: '1',
        targetSpecial: '',
        templateType: '',
        templateUnits: '',
        rangeUnits: 'self',
        rangeValue: null,
        rangeSpecial: '',
        school: 'trs',
        properties: ['somatic'],
        materials: 'dust from an ancient sundial',
        identifier: 'lotm-warrior-passage-of-twilight',
        activityId: 'warriorSeq2Act003',
        sort: 800702,
        existing: w2003Existing,
        now: now + 6
      }),
      buildSeq2Ability({
        id: 'lotmAbilityW2004',
        name: 'Purifying Devastation',
        img: 'icons/magic/light/explosion-star-large-orange.webp',
        description:
          '<p><strong>Baseline (0 Spirituality):</strong> Action. Detonate solemn twilight-dawn force in a 20-foot radius centered within 90 feet. Enemies save or take damage equal to <strong>2 x Potency</strong>; corrupted/undead targets also lose one active buff or rider on failure.</p>' +
          '<p><strong>Higher Spend (upcast):</strong></p>' +
          '<ul><li><strong>+1 Spirituality:</strong> Radius becomes 25 feet.</li>' +
          '<li><strong>+2 Spirituality:</strong> Allies in the area may immediately end one fear/charm effect.</li>' +
          '<li><strong>+4 Spirituality:</strong> Failed enemies gain twilight decay for 1 round, taking <strong>Potency</strong> damage at end of turn and suffering disadvantage on concentration checks.</li></ul>' +
          '<p><em>Counterplay:</em> Spread spacing, layered cover, and anti-radiant barriers reduce this abilitys impact.</p>' +
          '<p><em>Corruption Hook:</em> Repeated use for indiscriminate ruin adds 1 Corruption.</p>',
        activationType: 'action',
        durationValue: '',
        durationUnits: 'inst',
        targetType: 'creature',
        targetCount: '1',
        targetSpecial: 'creatures in a 20-foot-radius area',
        templateType: 'radius',
        templateUnits: 'ft',
        rangeUnits: 'ft',
        rangeValue: '90',
        rangeSpecial: '',
        school: 'evc',
        properties: ['vocal', 'somatic'],
        materials: 'a strip of linen burned in both dawn and dusk light',
        identifier: 'lotm-warrior-purifying-devastation',
        activityId: 'warriorSeq2Act004',
        sort: 800703,
        existing: w2004Existing,
        now: now + 7
      })
    ];

    for (const ability of abilities) {
      await abilitiesDb.put(`!items!${ability._id}`, JSON.stringify(ability));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [rapierKey, hurricaneKey],
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
