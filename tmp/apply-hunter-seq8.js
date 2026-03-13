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
    if (!pathway) throw new Error('Hunter pathway (lotmPathway00013) not found. Author Sequence 9 first.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> relentless battlefield pursuit through predatory senses, prepared kill zones, and command-by-pressure.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Killzone Instinct, Scorchline Trapcraft.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Incendiary Taunt, Warline Rally, plus one legacy scope upgrade to Killzone Instinct.</p>' +
      '<p><strong>Sequence 7-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 8 (Provoker), Hunter evolves from personal pursuit into overt tempo control, forcing hostile focus and driving allies forward through dominating war-cries.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 8).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 8
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyKey = '!items!lotmAbilityH9001';
    const legacyAbility = await getOptionalJson(abilitiesDb, legacyKey);
    if (!legacyAbility) throw new Error('Legacy target lotmAbilityH9001 not found.');

    const legacyHeader = '<h3>Legacy Upgrade (Sequence 8 - Scope)</h3>';
    const legacyText =
      '<p>At Sequence 8, your quarry pressure can split across a second lane. ' +
      'When you cast Killzone Instinct with at least <strong>+1 Spirituality</strong>, choose one additional creature within 30 feet of your primary quarry. ' +
      'Until the start of your next turn, your pursuit-hit rider may trigger once against each marked creature (still max once per creature). ' +
      'Once per short rest, you can apply this split-mark rider without paying the +1 surcharge.</p>';
    const existingLegacyDescription = String(legacyAbility.system?.description?.value ?? '');
    if (!existingLegacyDescription.includes(legacyHeader)) {
      legacyAbility.system.description.value = `${existingLegacyDescription}${legacyHeader}${legacyText}`;
    }
    legacyAbility._stats = buildStats(now + 2, legacyAbility._stats);
    await abilitiesDb.put(legacyKey, JSON.stringify(legacyAbility));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH8001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH8002');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH8001',
        name: 'Incendiary Taunt',
        type: 'spell',
        img: 'icons/magic/fire/explosion-flame-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Target one creature within 60 feet that can hear and understand you. It makes a Wisdom save. On a failure, until the end of your next turn it has disadvantage on attack rolls that do not include you as a target, and the first time it damages a creature other than you, it takes <strong>+1 fire damage</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Target one additional creature in range (separate saves).</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; affected creatures repeat the save at end of each turn, ending on a success.</li><li><strong>+4 Spirituality:</strong> On initial failed save, target loses <strong>reactions</strong> until the start of its next turn, and the retaliation damage becomes <strong>+Potency fire</strong>.</li></ul><p><em>Counterplay:</em> Deafness, language barriers, charm immunity, and disciplined focus effects weaken this provocation.</p><p><em>Corruption Hook:</em> If you incite pointless slaughter where withdrawal was viable, gain 1 Corruption.</p>',
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
              special: 'creature that can hear and understand you'
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
          level: 1,
          school: 'enc',
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
            hunterSeq8Act001: buildActivity({
              id: 'hunterSeq8Act001',
              activationType: 'action',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-incendiary-taunt',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 3, existingAbility1?._stats),
        sort: 900100,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH8002',
        name: 'Warline Rally',
        type: 'spell',
        img: 'icons/skills/social/intimidation-impressing.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Shout a domineering command to up to two allies within 30 feet who can hear you. Until the start of your next turn, each chosen ally gains 5 feet of movement when moving toward a hostile creature and deals <strong>+1 damage</strong> on its first weapon hit this turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect up to three allies, and bonus damage becomes <strong>+Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute; each affected ally can gain the movement rider once per round while it can hear you.</li><li><strong>+4 Spirituality:</strong> When an affected ally drops a creature to 0 hit points, that ally gains temporary hit points equal to <strong>Potency</strong> and may move up to 10 feet without provoking opportunity attacks (once per round).</li></ul><p><em>Counterplay:</em> Silence effects, fear, broken formation, and terrain separation can break command coverage.</p><p><em>Corruption Hook:</em> If you drive allies into clearly unwinnable charges for ego, gain 1 Corruption.</p>',
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
              count: '2',
              type: 'ally',
              special: 'allies that can hear you'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'ft',
            value: '30',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 1,
          school: 'trs',
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
            hunterSeq8Act002: buildActivity({
              id: 'hunterSeq8Act002',
              activationType: 'bonus',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-warline-rally',
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
            grantedSequence: 8
          }
        },
        _stats: buildStats(now + 4, existingAbility2?._stats),
        sort: 900101,
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
      legacyUpdated: legacyKey,
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
