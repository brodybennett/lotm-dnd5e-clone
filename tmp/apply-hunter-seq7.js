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
      '<p><strong>Sequence 6-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 7 (Pyromaniac / Fire Mage), Hunter pressure escalates into overt battlefield fire-shaping that rewards aggressive pursuit and punishing provocation lines.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 7).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 7
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKillzoneKey = '!items!lotmAbilityH9001';
    const legacyTauntKey = '!items!lotmAbilityH8001';
    const legacyKillzone = await getOptionalJson(abilitiesDb, legacyKillzoneKey);
    const legacyTaunt = await getOptionalJson(abilitiesDb, legacyTauntKey);
    if (!legacyKillzone) throw new Error('Legacy target lotmAbilityH9001 not found.');
    if (!legacyTaunt) throw new Error('Legacy target lotmAbilityH8001 not found.');

    const killzoneLegacyHeader = '<h3>Legacy Upgrade (Sequence 7 - Potency)</h3>';
    const killzoneLegacyText =
      '<p>At Sequence 7, Killzone Instinct burns hotter once you commit to the chase. ' +
      'If you cast Killzone Instinct with at least <strong>+1 Spirituality</strong>, your first qualifying hit each turn against the marked quarry deals an additional <strong>+1 fire damage</strong>. ' +
      'If that hit followed at least 15 feet of movement toward the quarry, the target must pass a Constitution save or take fire damage equal to <strong>Potency</strong> at the start of its next turn. ' +
      'This delayed burn can trigger once per cast.</p>';
    const killzoneDescription = String(legacyKillzone.system?.description?.value ?? '');
    if (!killzoneDescription.includes(killzoneLegacyHeader)) {
      legacyKillzone.system.description.value = `${killzoneDescription}${killzoneLegacyHeader}${killzoneLegacyText}`;
    }
    legacyKillzone._stats = buildStats(now + 2, legacyKillzone._stats);
    await abilitiesDb.put(legacyKillzoneKey, JSON.stringify(legacyKillzone));

    const tauntLegacyHeader = '<h3>Legacy Upgrade (Sequence 7 - Efficiency)</h3>';
    const tauntLegacyText =
      '<p>At Sequence 7, Incendiary Taunt rides your pursuit rhythm with less strain. ' +
      'Once per round, if your taunt target is currently marked by Killzone Instinct, reduce Incendiary Taunt\'s spirituality surcharge by <strong>1</strong> (minimum 0). ' +
      'When this discount applies and the target fails its save, you may move up to 5 feet toward it without provoking opportunity attacks from that target.</p>';
    const tauntDescription = String(legacyTaunt.system?.description?.value ?? '');
    if (!tauntDescription.includes(tauntLegacyHeader)) {
      legacyTaunt.system.description.value = `${tauntDescription}${tauntLegacyHeader}${tauntLegacyText}`;
    }
    legacyTaunt._stats = buildStats(now + 3, legacyTaunt._stats);
    await abilitiesDb.put(legacyTauntKey, JSON.stringify(legacyTaunt));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH7001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH7002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH7003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH7001',
        name: 'Fire Raven Volley',
        type: 'spell',
        img: 'icons/magic/fire/projectile-fireball-smoke-large.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Summon two fire ravens for 1 minute. At the end of each of your turns, each raven can dive one creature you can see within 60 feet (Dexterity save each). On a failure, the target takes <strong>+1 fire damage</strong> and cannot benefit from half cover against your attacks until the start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Summon one additional raven.</li><li><strong>+2 Spirituality:</strong> Failed saves take fire damage equal to <strong>Potency</strong> instead of +1.</li><li><strong>+4 Spirituality:</strong> Command all ravens to strike one target in a single pass; on failed save, that target loses <strong>reactions</strong> until the start of its next turn and takes an extra fire damage equal to <strong>Potency</strong>.</li></ul><p><em>Counterplay:</em> total cover, anti-summoning suppression, and long-range disengagement reduce raven pressure.</p><p><em>Corruption Hook:</em> if you repeatedly use summoned flames to terrorize civilians, gain 1 Corruption.</p>',
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
              special: 'creature you can see'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '60',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 2,
          school: 'evo',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'three black feathers singed at the tips',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq7Act001: buildActivity({
              id: 'hunterSeq7Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-fire-raven-volley',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900200,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH7002',
        name: 'Wall of Fire',
        type: 'spell',
        img: 'icons/magic/fire/barrier-wall-flame-ring-yellow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Raise a 20-foot wall of fire within 60 feet for 1 minute (concentration). A creature that enters the wall or starts its turn adjacent to it makes a Dexterity save. On a failure, it takes <strong>+1 fire damage</strong> and its speed is reduced by 10 feet until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Failed save damage becomes fire damage equal to <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Increase wall length to 40 feet, or form a 10-foot radius ring.</li><li><strong>+4 Spirituality:</strong> Once per round, move the wall up to 10 feet. Creatures passed through by the moving wall must save or be <strong>prone</strong> after damage resolves.</li></ul><p><em>Counterplay:</em> forced displacement on you, concentration breaks, and resistant targets limit wall control.</p><p><em>Corruption Hook:</em> if you trap allies or innocents in flames to force obedience, gain 1 Corruption.</p>',
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
            value: '1',
            units: 'minute'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'creature',
              special: 'creatures entering or adjacent to wall'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'line'
            }
          },
          range: {
            units: 'ft',
            value: '60',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 2,
          school: 'evo',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a strip of charred leather',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq7Act002: buildActivity({
              id: 'hunterSeq7Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-wall-of-fire',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900201,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH7003',
        name: 'Blazing Spear',
        type: 'spell',
        img: 'icons/magic/fire/projectile-fireball-trail-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Action. Hurl a blazing spear at a creature within 120 feet. Make a spell attack. On hit, deal fire damage equal to <strong>Potency</strong> and push the target 5 feet directly away from you.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Range becomes 150 feet and the attack ignores half cover.</li><li><strong>+2 Spirituality:</strong> On hit, the spear detonates; creatures of your choice within 10 feet of the target make Dexterity saves or take fire damage equal to <strong>Potency</strong> (half on success).</li><li><strong>+4 Spirituality:</strong> On hit, the main target ignites for 1 minute; at the start of each of its turns it takes fire damage equal to <strong>Potency</strong> (Constitution save ends).</li></ul><p><em>Counterplay:</em> fire resistance, anti-projectile wards, and full cover mitigate spear pressure.</p><p><em>Corruption Hook:</em> if you continue immolating defeated enemies as spectacle, gain 1 Corruption.</p>',
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
              special: ''
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
          level: 2,
          school: 'evo',
          properties: ['vocal', 'somatic'],
          materials: {
            value: 'a bronze arrowhead heated over open flame',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq7Act003: buildActivity({
              id: 'hunterSeq7Act003',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-blazing-spear',
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
            grantedSequence: 7
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900202,
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
      legacyUpdated: [legacyKillzoneKey, legacyTauntKey],
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
