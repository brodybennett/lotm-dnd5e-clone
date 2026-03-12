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

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const pathwayKey = '!items!lotmPathway00011';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Warrior pathway (lotmPathway00011) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> stoic frontline command through trained violence, iron resolve, and twilight-forged endurance.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Combat Mastery, Physical Enhancement.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Supernatural Resistance, Close-Quarters Mastery, plus one legacy scope upgrade to Combat Mastery.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Pugilist), the pathway hardens from trained soldiering into body-first supernatural resistance and decisive close-quarters pressure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!HU7eK5t0hJEd93Ug';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Warrior folder (HU7eK5t0hJEd93Ug) not found.');

    folder.description = 'Sequence abilities for the Warrior pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-warrior',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const combatMasteryKey = '!items!lotmAbilityW9001';
    const combatMastery = await getOptionalJson(abilitiesDb, combatMasteryKey);
    if (!combatMastery) throw new Error('Legacy target lotmAbilityW9001 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, your melee pressure can cover a second lane. ' +
      'When you cast Combat Mastery with at least <strong>+1 Spirituality</strong>, choose one additional creature within 5 feet of your original target. ' +
      'Until the end of your turn, you may apply Combat Mastery\'s bonus damage rider once against each of those two creatures (still max once per target). ' +
      'Once per short rest, this lane-split rider can be applied without paying the +1 surcharge.</p>';
    const existingDescription = String(combatMastery.system?.description?.value ?? '');
    if (!existingDescription.includes(legacyHeader)) {
      combatMastery.system.description.value = `${existingDescription}${legacyHeader}${legacyText}`;
    }
    combatMastery._stats = buildStats(now + 2, combatMastery._stats);
    await abilitiesDb.put(combatMasteryKey, JSON.stringify(combatMastery));

    const w8001Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW8001');
    const w8002Existing = await getOptionalJson(abilitiesDb, '!items!lotmAbilityW8002');

    const abilities = [
      {
        _id: 'lotmAbilityW8001',
        name: 'Supernatural Resistance',
        type: 'spell',
        img: 'icons/magic/defensive/shield-barrier-deflect-gold.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when you are targeted by a supernatural effect that forces a saving throw or deals force, necrotic, psychic, radiant, or lightning damage. Gain <strong>+1d4</strong> to that saving throw; if the effect deals damage, reduce the damage by <strong>Potency</strong> on a success.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Saving throw bonus becomes <strong>+Potency</strong>, and you reduce damage by Potency even on a failed save.</li><li><strong>+2 Spirituality:</strong> If the triggering effect would inflict <em>charmed</em>, <em>frightened</em>, <em>restrained</em>, or <em>paralyzed</em>, you may ignore that condition until the end of your next turn.</li><li><strong>+4 Spirituality:</strong> Until the start of your next turn, you have advantage on saving throws against supernatural effects and resistance to one damage type from the triggering effect.</li></ul><p><em>Counterplay:</em> Multi-instance control chains can tax reactions; non-supernatural physical pressure bypasses this trigger.</p><p><em>Corruption Hook:</em> If you invoke this only to prolong a fight for cruelty, gain 1 Corruption.</p>',
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
            type: 'reaction',
            condition: '',
            value: null
          },
          duration: {
            value: '',
            units: 'inst'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'self',
              special: ''
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'self',
            value: null,
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 1,
          school: 'abj',
          properties: ['somatic'],
          materials: {
            value: 'a strip of hardened leather',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq8Act001: buildActivity({
              id: 'warriorSeq8Act001',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-supernatural-resistance',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 3, w8001Existing?._stats),
        sort: 800100,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityW8002',
        name: 'Close-Quarters Mastery',
        type: 'spell',
        img: 'icons/skills/melee/hand-grip-sword-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Until the end of this turn, your melee attacks against creatures within 5 feet gain <strong>+1</strong> to hit. On your first hit this turn, the target must pass a Strength save or be moved 5 feet to a space you choose within your reach.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Hit bonus becomes <strong>+Potency</strong> for this turn.</li><li><strong>+2 Spirituality:</strong> On a failed save from the baseline effect, you may knock the target <em>prone</em> instead of moving it.</li><li><strong>+4 Spirituality:</strong> After resolving your first hit, you may immediately make one additional melee attack against a different creature within 5 feet (once per turn).</li></ul><p><em>Counterplay:</em> Reach weapons, forced displacement, and difficult terrain break your preferred threat band.</p><p><em>Corruption Hook:</em> If you use this to beat helpless targets as spectacle, gain 1 Corruption.</p>',
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
            type: 'bonus',
            condition: '',
            value: null
          },
          duration: {
            value: '',
            units: 'inst'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'creature',
              special: 'creature within 5 feet'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '5',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 1,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a cracked knuckle guard',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            warriorSeq8Act002: buildActivity({
              id: 'warriorSeq8Act002',
              activationType: 'bonus',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-warrior-close-quarters-mastery',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 4, w8002Existing?._stats),
        sort: 800101,
        ownership: {
          default: 0
        }
      }
    ];

    for (const ability of abilities) {
      await abilitiesDb.put(`!items!${ability._id}`, JSON.stringify(ability));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: combatMasteryKey,
      abilitiesWritten: abilities.map((a) => `!items!${a._id}`)
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
