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
      '<p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 6 (Conspirer), Hunter turns raw pyromania into battlefield orchestration: baiting movement, staged retreats, and command-led fire traps that force enemy mistakes.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 6).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 6
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyTrapKey = '!items!lotmAbilityH9002';
    const legacyRallyKey = '!items!lotmAbilityH8002';
    const legacyTrap = await getOptionalJson(abilitiesDb, legacyTrapKey);
    const legacyRally = await getOptionalJson(abilitiesDb, legacyRallyKey);
    if (!legacyTrap) throw new Error('Legacy target lotmAbilityH9002 not found.');
    if (!legacyRally) throw new Error('Legacy target lotmAbilityH8002 not found.');

    const trapHeader = '<h3>Legacy Upgrade (Sequence 6 - Scope)</h3>';
    const trapText =
      '<p>At Sequence 6, Scorchline Trapcraft can be chained into a planned crossfire lane. ' +
      'When you cast Scorchline Trapcraft with at least <strong>+1 Spirituality</strong>, you may place a second linked scorchline in an unoccupied space within 15 feet of the first. ' +
      'When either linked trap triggers, the second trap ignites at end of the triggering creature\'s turn (if still armed). ' +
      'Once per short rest, this linked placement can be used without paying the +1 surcharge.</p>';
    const trapDescription = String(legacyTrap.system?.description?.value ?? '');
    if (!trapDescription.includes(trapHeader)) {
      legacyTrap.system.description.value = `${trapDescription}${trapHeader}${trapText}`;
    }
    legacyTrap._stats = buildStats(now + 2, legacyTrap._stats);
    await abilitiesDb.put(legacyTrapKey, JSON.stringify(legacyTrap));

    const rallyHeader = '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>';
    const rallyText =
      '<p>At Sequence 6, Warline Rally is easier to sustain during coordinated pushes. ' +
      'Once per round, if at least one enemy took fire damage from your pathway abilities since the end of your last turn, reduce one upcast surcharge on Warline Rally by <strong>1</strong> (minimum 0). ' +
      'When this reduction applies, one affected ally may draw or stow a weapon as part of its granted movement.</p>';
    const rallyDescription = String(legacyRally.system?.description?.value ?? '');
    if (!rallyDescription.includes(rallyHeader)) {
      legacyRally.system.description.value = `${rallyDescription}${rallyHeader}${rallyText}`;
    }
    legacyRally._stats = buildStats(now + 3, legacyRally._stats);
    await abilitiesDb.put(legacyRallyKey, JSON.stringify(legacyRally));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH6001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH6002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH6003');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH6001',
        name: 'Crossfire Conspiracy',
        type: 'spell',
        img: 'icons/skills/ranged/arrow-flying-triple-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Mark up to two hostile creatures within 60 feet that can hear you for 1 minute. The first time each marked creature each round either moves 10+ feet or attacks one of your allies, it takes <strong>+1 fire damage</strong>, and one ally within 30 feet that can hear you may move up to 5 feet without provoking opportunity attacks from that creature.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Mark one additional creature.</li><li><strong>+2 Spirituality:</strong> The fire rider becomes fire damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Once per round when a marked creature triggers this effect, one ally who moved from the baseline rider may also make one weapon attack against that creature as a reaction.</li></ul><p><em>Counterplay:</em> deafness, broken command lines, and forced separation from allies can reduce crossfire value.</p><p><em>Corruption Hook:</em> if you manufacture betrayal among allies for amusement rather than necessity, gain 1 Corruption.</p>',
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
              count: '2',
              type: 'creature',
              special: 'hostile creatures that can hear you'
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
          level: 3,
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
            hunterSeq6Act001: buildActivity({
              id: 'hunterSeq6Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-crossfire-conspiracy',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900300,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH6002',
        name: 'Kindling Edict',
        type: 'spell',
        img: 'icons/skills/social/intimidation-impressing.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Bonus action. Command up to three allies within 30 feet that can hear you. Until the start of your next turn, each chosen ally gains 10 feet movement when advancing toward a hostile creature and deals <strong>+1 fire damage</strong> on its first weapon hit this turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect up to four allies, and bonus fire damage becomes <strong>Potency</strong>.</li><li><strong>+2 Spirituality:</strong> Duration becomes 1 minute. Each affected ally can gain the movement rider once per round while it can hear you.</li><li><strong>+4 Spirituality:</strong> When an affected ally hits a creature already taking fire damage from your pathway abilities, that creature must pass a Wisdom save or lose <strong>reactions</strong> until the start of its next turn (once per creature per round).</li></ul><p><em>Counterplay:</em> silence, fear, and line-break tactics can disrupt the command chain.</p><p><em>Corruption Hook:</em> if you order hopeless frontal charges for ego, gain 1 Corruption.</p>',
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
              count: '3',
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
          level: 3,
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
            hunterSeq6Act002: buildActivity({
              id: 'hunterSeq6Act002',
              activationType: 'bonus',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-kindling-edict',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900301,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH6003',
        name: 'Feigned Retreat',
        type: 'spell',
        img: 'icons/skills/melee/shield-block-fire-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (0 Spirituality):</strong> Reaction when a hostile creature ends movement within 15 feet of you or an ally within 30 feet that can hear you. Up to two allies within 30 feet may each move up to 10 feet without provoking opportunity attacks from that triggering creature. The trigger creature must pass a Dexterity save or take <strong>+1 fire damage</strong> and have its speed reduced by 10 feet until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Affect one additional ally with the retreat movement.</li><li><strong>+2 Spirituality:</strong> Failed save fire damage becomes <strong>Potency</strong>, and the target is knocked <strong>prone</strong> if it moved 20+ feet this turn.</li><li><strong>+4 Spirituality:</strong> After allies complete retreat movement, you may place one temporary scorchline in an adjacent 5-foot space to one moved ally; it lasts until the end of your next turn and triggers Scorchline Trapcraft baseline effects once.</li></ul><p><em>Counterplay:</em> ranged pressure, reaction denial, and non-movement burst attacks can bypass this retreat trap.</p><p><em>Corruption Hook:</em> if you repeatedly sacrifice expendable allies as deliberate bait, gain 1 Corruption.</p>',
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
              type: 'creature',
              special: 'triggering hostile creature'
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
          level: 3,
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
            hunterSeq6Act003: buildActivity({
              id: 'hunterSeq6Act003',
              activationType: 'reaction',
              durationUnits: 'inst'
            })
          },
          identifier: 'lotm-hunter-feigned-retreat',
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
            grantedSequence: 6
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900302,
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
      legacyUpdated: [legacyTrapKey, legacyRallyKey],
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
