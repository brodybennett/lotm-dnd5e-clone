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

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  try {
    const pathwayKey = '!items!lotmPathway00013';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Hunter pathway (lotmPathway00013) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> relentless battlefield pursuit through predatory senses, prepared kill zones, and command-by-pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Killzone Instinct, Scorchline Trapcraft.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Incendiary Taunt, Warline Rally, plus one legacy scope upgrade to Killzone Instinct.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Fire Raven Volley, Wall of Fire, Blazing Spear, plus two legacy upgrades (Killzone Instinct and Incendiary Taunt).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Crossfire Conspiracy, Kindling Edict, Feigned Retreat, plus two legacy upgrades (Scorchline Trapcraft and Warline Rally).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Weakness Survey, Cull, Precision Barrage, plus two legacy upgrades (Fire Raven Volley and Crossfire Conspiracy).</p>' +
      '<p><strong>Sequence 4-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 5 (Reaper), Hunter pivots from pure setup into lethal execution: identifying critical vulnerabilities, harvesting exposed targets, and directing high-precision fire saturation.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 5).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 5
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyRavensKey = '!items!lotmAbilityH7001';
    const legacyCrossfireKey = '!items!lotmAbilityH6001';
    const legacyRavens = await getOptionalJson(abilitiesDb, legacyRavensKey);
    const legacyCrossfire = await getOptionalJson(abilitiesDb, legacyCrossfireKey);
    if (!legacyRavens) throw new Error('Legacy target lotmAbilityH7001 not found.');
    if (!legacyCrossfire) throw new Error('Legacy target lotmAbilityH6001 not found.');

    const ravensHeader = '<h3>Legacy Upgrade (Sequence 5 - Efficiency)</h3>';
    const ravensText =
      '<p>At Sequence 5, Fire Raven Volley can be folded into your execution rhythm. ' +
      'Once per round, if you used Weakness Survey or Cull this turn, reduce one upcast surcharge on Fire Raven Volley by <strong>1</strong> (minimum 0). ' +
      'When this reduction applies, one raven dive this round ignores half cover.</p>';
    const ravensDescription = String(legacyRavens.system?.description?.value ?? '');
    if (!ravensDescription.includes(ravensHeader)) {
      legacyRavens.system.description.value = `${ravensDescription}${ravensHeader}${ravensText}`;
    }
    legacyRavens._stats = buildStats(now + 2, legacyRavens._stats);
    await abilitiesDb.put(legacyRavensKey, JSON.stringify(legacyRavens));

    const crossfireHeader = '<h3>Legacy Upgrade (Sequence 5 - Scope)</h3>';
    const crossfireText =
      '<p>At Sequence 5, Crossfire Conspiracy can spread through exposed flanks. ' +
      'When a creature marked by Crossfire Conspiracy fails a save against one of your Sequence 5 abilities, choose one additional hostile creature within 10 feet of it. ' +
      'That creature becomes marked by Crossfire Conspiracy until the end of your next turn (once per cast).</p>';
    const crossfireDescription = String(legacyCrossfire.system?.description?.value ?? '');
    if (!crossfireDescription.includes(crossfireHeader)) {
      legacyCrossfire.system.description.value = `${crossfireDescription}${crossfireHeader}${crossfireText}`;
    }
    legacyCrossfire._stats = buildStats(now + 3, legacyCrossfire._stats);
    await abilitiesDb.put(legacyCrossfireKey, JSON.stringify(legacyCrossfire));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH5001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH5002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH5003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH5001',
        name: 'Weakness Survey',
        type: 'spell',
        img: 'icons/magic/perception/eye-ringed-glow-angry-small-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Mark one creature or structure within 120 feet for 1 minute. You discern one exploitable weakness (armor seam, stance flaw, unstable support, etc.). Once per round, the first ally who hits the marked target adds <strong>+1 fire damage</strong> and ignores half cover from that target.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark one additional target in range.</li><li><strong>+2 Spirituality:</strong> Against marked targets, the first allied hit each round gains bonus damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> When a marked target takes fire damage, it must pass a Wisdom save or lose <strong>reactions</strong> until the start of its next turn (once per target per round).</li></ul><p><em>Counterplay:</em> concealment, false signatures, and rapid repositioning can deny stable weakness reads.</p><p><em>Corruption Hook:</em> If you reveal vulnerabilities of noncombatants to stage cruelty, gain 1 Corruption.</p>',
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
            value: '1',
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'creature',
              special: 'creature or structure you can see'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '120',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 4,
          school: 'div',
          properties: ['vocal'],
          materials: {
            value: '',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq5Act001: buildActivity({
              id: 'hunterSeq5Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-weakness-survey',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900400,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH5002',
        name: 'Cull',
        type: 'spell',
        img: 'icons/skills/melee/strike-dagger-blood-red.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Infuse one weapon attack this turn with execution force. On hit, deal bonus damage equal to <strong>Potency</strong>. If the target is marked by Weakness Survey, it must pass a Constitution save or be unable to regain hit points until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Bonus damage becomes <strong>2 x Potency</strong>.</li><li><strong>+2 Spirituality:</strong> The infused strike can damage non-physical bodies, barriers, and conjured effects as if they were physical.</li><li><strong>+4 Spirituality:</strong> If the hit target is bloodied or below half HP, it takes an additional damage equal to <strong>Potency</strong> and must pass a Wisdom save or become <strong>frightened</strong> of you until end of its next turn.</li></ul><p><em>Counterplay:</em> misses waste the setup; displacement, disarm, and reaction denial can interrupt cull windows.</p><p><em>Corruption Hook:</em> If you repeatedly execute surrendered foes with Cull, gain 1 Corruption.</p>',
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
            type: 'action',
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
              special: 'creature hit by your infused attack'
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
            special: 'weapon range'
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 4,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a red cord wrapped around weapon grip',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq5Act002: buildActivity({
              id: 'hunterSeq5Act002',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-cull',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900401,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH5003',
        name: 'Precision Barrage',
        type: 'spell',
        img: 'icons/magic/fire/projectile-fireball-smoke-large.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Launch a controlled fire barrage at a point within 120 feet. Choose up to three creatures you can see within a 20-foot area around that point; each target makes a Dexterity save. On failure, target takes <strong>+1 fire damage</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Choose up to two additional targets in the area.</li><li><strong>+2 Spirituality:</strong> Failed saves take fire damage equal to <strong>Potency</strong> instead of +1.</li><li><strong>+4 Spirituality:</strong> You may split the barrage into two separate 15-foot areas within range; failed targets in either area are also pushed up to 10 feet in a direction you choose.</li></ul><p><em>Counterplay:</em> full cover, anti-fire resistance, and spread formations dilute barrage efficiency.</p><p><em>Corruption Hook:</em> If you repeatedly saturate occupied civilian zones for tactical convenience, gain 1 Corruption.</p>',
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
            type: 'action',
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
              count: '3',
              type: 'creature',
              special: 'creatures in chosen barrage area'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '120',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 4,
          school: 'evo',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'powdered charcoal in a brass tube',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq5Act003: buildActivity({
              id: 'hunterSeq5Act003',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-precision-barrage',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-hunter'
        },
        effects: [],
        folder: 'vB18zSgRsDmrUAjW',
        flags: {
          dnd5e: {
            riders: {
              activity: [],
              effect: []
            }
          },
          lotm: {
            sourceBook: 'LoTM Core',
            grantedSequence: 5
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900402,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    console.log(JSON.stringify({
      pathwayWritten: pathwayKey,
      folderWritten: folderKey,
      legacyUpdated: [legacyRavensKey, legacyCrossfireKey],
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      grantedSequenceMapping: abilityDocs.map((doc) => ({
        id: doc._id,
        grantedSequence: doc.flags?.lotm?.grantedSequence ?? null,
        systemLevel: doc.system?.level ?? null,
        sourceClass: doc.system?.sourceClass ?? null,
        identifier: doc.system?.identifier ?? null
      }))
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
