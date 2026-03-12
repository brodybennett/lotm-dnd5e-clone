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

function buildActivity({
  id,
  activationType,
  durationUnits,
  targetUnits = 'ft'
}) {
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
    const pathwayKey = '!items!lotmPathway00012';
    const pathway = await getOptionalJson(pathwaysDb, pathwayKey);
    if (!pathway) throw new Error('Assassin pathway (lotmPathway00012) not found.');

    pathway.system = pathway.system ?? {};
    pathway.system.description = pathway.system.description ?? { value: '', chat: '' };
    pathway.system.description.value =
      '<p><strong>Pathway Vector:</strong> seductive predation through shadowed mobility, emotional leverage, and taunting confidence that turns hesitation into openings.</p>' +
      '<p><strong>Sequence 9 Package (Total Budget 2):</strong> Predator\'s Footwork, Barbed Whisper.</p>' +
      '<p><strong>Sequence 8 Package (Gain Budget +3):</strong> Instigation, Malice Appraisal, plus one legacy scope upgrade to Barbed Whisper.</p>' +
      '<p><strong>Sequence 7 Package (Gain Budget +13):</strong> Ruinous Allure, Black Flame Kiss, Mirror-Frost Veil, plus two legacy upgrades (Predator\'s Footwork and Instigation).</p>' +
      '<p><strong>Sequence 6 Package (Gain Budget +9):</strong> Velvet Threads, Sable Ember, Glassheart Reprieve, plus two legacy upgrades (Barbed Whisper and Malice Appraisal).</p>' +
      '<p><strong>Sequence 5 Package (Gain Budget +13):</strong> Contagion Waltz, Needle Tresses, Mirror Fever Parlor, plus two legacy upgrades (Ruinous Allure and Instigation).</p>' +
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Sapping Plague, Petrifying Tresses, Mirror Procession, Despair Chorus, plus two legacy upgrades (Contagion Waltz and Velvet Threads).</p>' +
      '<p><strong>Sequence 3 Package (Gain Budget +20):</strong> Mirror Persona, Predatory Rebirth, Stoneheart Enticement, Withering Promise, plus two legacy upgrades (Mirror Procession and Needle Tresses).</p>' +
      '<p><strong>Sequence 2 Package (Gain Budget +50):</strong> Cataclysm Waltz, Mirror Ruin Court, Cursed Refrain, Glacial Inferno, plus two legacy upgrades (Mirror Persona and Sapping Plague).</p>' +
      '<p><strong>Sequence 1-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 2 (Catastrophe), Assassin graduates from local despair into angel-tier collapse authority: mirrored projection multiplies, plagues breach saintly resilience, and taunting words become long-tail destinies of ruin.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!jmuQee6mCwV4wjQa';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Assassin folder (jmuQee6mCwV4wjQa) not found.');

    folder.description = 'Sequence abilities for the Assassin pathway (authored through Sequence 2).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-assassin',
      latestAuthoredSequence: 2
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyMirrorPersonaKey = '!items!lotmAbilityI3001';
    const legacyPlagueKey = '!items!lotmAbilityI4001';
    const legacyMirrorPersona = await getOptionalJson(abilitiesDb, legacyMirrorPersonaKey);
    const legacyPlague = await getOptionalJson(abilitiesDb, legacyPlagueKey);
    if (!legacyMirrorPersona) throw new Error('Legacy target lotmAbilityI3001 not found.');
    if (!legacyPlague) throw new Error('Legacy target lotmAbilityI4001 not found.');

    const mirrorPersonaHeader = '<h3>Legacy Upgrade (Sequence 2 - Scope)</h3>';
    const mirrorPersonaText =
      '<p>At Sequence 2, Mirror Persona blossoms into an angel-tier mirror network. ' +
      'Your maximum simultaneous personas becomes <strong>5</strong>. ' +
      'When you cast an Assassin charm, curse, or plague ability through a persona, choose one failed target: it cannot benefit from cover against your next ability before end of turn. ' +
      'If you spent at least <strong>+3 Spirituality</strong> on Mirror Persona, one destroyed persona reforms at the end of your turn (once per round).</p>';
    const mirrorPersonaDescription = String(legacyMirrorPersona.system?.description?.value ?? '');
    if (!mirrorPersonaDescription.includes(mirrorPersonaHeader)) {
      legacyMirrorPersona.system.description.value = `${mirrorPersonaDescription}${mirrorPersonaHeader}${mirrorPersonaText}`;
    }
    legacyMirrorPersona._stats = buildStats(now + 2, legacyMirrorPersona._stats);
    await abilitiesDb.put(legacyMirrorPersonaKey, JSON.stringify(legacyMirrorPersona));

    const plagueHeader = '<h3>Legacy Upgrade (Sequence 2 - Potency)</h3>';
    const plagueText =
      '<p>At Sequence 2, Sapping Plague erodes even saint-level resilience. ' +
      'A creature that would normally resist disease instead makes its first save at advantage rather than ignoring the effect. ' +
      'When a target fails by 5 or more, it suffers <em>internal collapse</em> until end of your next turn: -Potency to Strength and Constitution saves, and it cannot regain hit points from non-mythic sources. ' +
      'If cast with at least <strong>+3 Spirituality</strong>, choose one failed target each round to take additional necrotic damage equal to <strong>Potency</strong>.</p>';
    const plagueDescription = String(legacyPlague.system?.description?.value ?? '');
    if (!plagueDescription.includes(plagueHeader)) {
      legacyPlague.system.description.value = `${plagueDescription}${plagueHeader}${plagueText}`;
    }
    legacyPlague._stats = buildStats(now + 3, legacyPlague._stats);
    await abilitiesDb.put(legacyPlagueKey, JSON.stringify(legacyPlague));

    const existingA2001 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI2001');
    const existingA2002 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI2002');
    const existingA2003 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI2003');
    const existingA2004 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityI2004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityI2001',
        name: 'Cataclysm Waltz',
        type: 'spell',
        img: 'icons/magic/lightning/bolt-impact-cloud-to-ground.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (3 Spirituality):</strong> Action. Select a 40-foot-radius zone within 150 feet and name its hidden fault line (infrastructure, morale, terrain, weather, or ritual flow). For 1 minute (concentration), creatures of your choice in the zone make a Constitution save when they enter or start their turn there. On failure, they take cold or fire damage (your choice each round) equal to <strong>2 x Potency</strong>, and the zone imposes one collapse rider you chose at cast time: fractured footing (difficult terrain), panic cadence (disadvantage on concentration checks), or faulted timing (no reactions).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 60 feet and you may choose two collapse riders instead of one.</li><li><strong>+4 Spirituality:</strong> At the start of each of your turns, trigger one pulse event in the zone (hail shards, boiling vapor, seismic rip, or black-frost gust). Failed creatures take extra damage equal to <strong>Potency</strong>.</li><li><strong>+7 Spirituality:</strong> One chosen structure or ongoing area effect in the zone must pass a GM-set stability check or collapse/terminate.</li></ul><p><em>Counterplay:</em> forced movement out of the zone, anti-weather barriers, and structural stabilization rituals reduce collapse value.</p><p><em>Corruption Hook:</em> If you weaponize this for spectacle against noncombat populations, gain 1 Corruption.</p>',
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
              type: 'space',
              special: 'catastrophe zone'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'sphere'
            }
          },
          range: {
            units: 'ft',
            value: '150',
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 7,
          school: 'evo',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'a cracked compass sealed in frost and ash',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq2Act001: buildActivity({
              id: 'assnSeq2Act001',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-cataclysm-waltz',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        _stats: buildStats(now + 4, existingA2001?._stats),
        sort: 300000,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI2002',
        name: 'Mirror Ruin Court',
        type: 'spell',
        img: 'icons/magic/perception/silhouette-stealth-shadow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Establish a 1-minute mirror tribunal around yourself (30-foot radius, concentration). Instantly separate up to five mirror selves that occupy visible reflective anchors. While active, you may originate one Assassin ability each round from any active mirror self, and once per round you may move your true body to one active mirror as a free action.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Radius becomes 60 feet, and each mirror self can make a taunting feint; creatures within 10 feet of a self must pass a Wisdom save or suffer disadvantage on their first attack roll before your next turn.</li><li><strong>+4 Spirituality:</strong> Once per cast, collapse one active mirror anchor to create a 15-foot mirror rupture. Creatures inside make a Dexterity save or take psychic damage equal to <strong>2 x Potency</strong> and become blinded until end of turn.</li><li><strong>+6 Spirituality:</strong> If you drop to 0 hit points while at least one mirror self remains, consume one mirror self to remain at 1 hit point and immediately end one charm, fear, or restraint affecting you.</li></ul><p><em>Counterplay:</em> shattering mirrors, anti-illusion fields, and forcing open terrain with no reflective anchors weakens this ability.</p><p><em>Corruption Hook:</em> If you force civilians to watch their own mirrored deaths for amusement, gain 1 Corruption.</p>',
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
              type: 'self',
              special: 'mirror court aura'
            },
            template: {
              units: 'ft',
              contiguous: false,
              type: 'radius'
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
          level: 7,
          school: 'ill',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'five mirrored shards tied with black thread',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq2Act002: buildActivity({
              id: 'assnSeq2Act002',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-mirror-ruin-court',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        _stats: buildStats(now + 5, existingA2002?._stats),
        sort: 300001,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI2003',
        name: 'Cursed Refrain',
        type: 'spell',
        img: 'icons/magic/unholy/strike-body-life-soul-purple.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Speak or inscribe a double-meaning phrase and bind it to one object or one audible sentence for 24 hours. The first creature that touches the object or fully hears the sentence becomes marked by your catastrophe curse for 1 minute (Wisdom save negates). A marked target suffers one mishap whenever it fails an ability check, attack roll, or save (once per round): take psychic damage equal to <strong>Potency</strong>, fall prone, or lose reactions (your choice each trigger).</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+2 Spirituality:</strong> Duration becomes 7 days and the mark may transfer once to a creature within 10 feet when the original marked target succeeds a save.</li><li><strong>+4 Spirituality:</strong> Marked targets have disadvantage on checks to detect traps, ambushes, and hostile intent.</li><li><strong>+6 Spirituality:</strong> Once per cast, when a marked target critically fails any d20 test, trigger a major mishap: it takes psychic damage equal to <strong>3 x Potency</strong> and is stunned until end of turn.</li></ul><p><em>Counterplay:</em> curse cleansing, silence or language barriers, and wards against symbolic contagion can neutralize this effect.</p><p><em>Corruption Hook:</em> Planting destiny curses into households with no strategic purpose adds 1 Corruption.</p>',
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
            value: '24',
            units: 'hour'
          },
          target: {
            affects: {
              choice: false,
              count: '1',
              type: 'object',
              special: 'object or sentence carrier'
            },
            template: {
              units: '',
              contiguous: false,
              type: ''
            }
          },
          range: {
            units: 'touch',
            value: null,
            special: 'or audible to 30 ft when spoken'
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 7,
          school: 'nec',
          properties: ['vocal'],
          materials: {
            value: 'a wax-sealed scrap with a lover\'s broken vow',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq2Act003: buildActivity({
              id: 'assnSeq2Act003',
              activationType: 'action',
              durationUnits: 'hour'
            })
          },
          identifier: 'lotm-assassin-cursed-refrain',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        _stats: buildStats(now + 6, existingA2003?._stats),
        sort: 300002,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityI2004',
        name: 'Glacial Inferno',
        type: 'spell',
        img: 'icons/magic/fire/flame-burning-skull-orange.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Action. Choose one mode in a 30-foot-radius zone within 120 feet for 1 minute (concentration): <strong>white freeze</strong> or <strong>black heat</strong>. White freeze: creatures of your choice in zone make Constitution saves; on failure they take cold damage equal to <strong>2 x Potency</strong> and speed is reduced by 20 feet until end of turn. Black heat: failed targets take fire damage equal to <strong>2 x Potency</strong> and cannot benefit from resistance granted by mundane gear until start of your next turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 45 feet.</li><li><strong>+3 Spirituality:</strong> At the start of each of your turns, switch between white freeze and black heat without ending the effect; each switch forces an immediate save on creatures currently in zone.</li><li><strong>+5 Spirituality:</strong> Failed targets also suffer thermal disorientation until end of turn: disadvantage on opportunity attacks and concentration checks.</li></ul><p><em>Counterplay:</em> movement out of area, high-tier elemental protection, and environment-control abilities reduce impact.</p><p><em>Corruption Hook:</em> cycling freeze and heat on captives for interrogation theater adds 1 Corruption.</p>',
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
              type: 'space',
              special: 'temperature catastrophe zone'
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
          level: 7,
          school: 'evo',
          properties: ['vocal', 'somatic', 'concentration'],
          materials: {
            value: 'one vial of floodwater and one coal from a funeral pyre',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            assnSeq2Act004: buildActivity({
              id: 'assnSeq2Act004',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-assassin-glacial-inferno',
          method: 'spell',
          prepared: 1,
          spiritualityCost: null,
          sourceClass: 'lotm-assassin'
        },
        effects: [],
        folder: 'jmuQee6mCwV4wjQa',
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
        _stats: buildStats(now + 7, existingA2004?._stats),
        sort: 300003,
        ownership: {
          default: 0
        }
      }
    ];

    for (const doc of abilityDocs) {
      await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
    }

    console.log(JSON.stringify({
      pathwayUpdated: pathwayKey,
      folderUpdated: folderKey,
      legacyUpdated: [legacyMirrorPersonaKey, legacyPlagueKey],
      abilitiesWritten: abilityDocs.map((doc) => `!items!${doc._id}`),
      mapping: abilityDocs.map((doc) => ({
        id: doc._id,
        grantedSequence: doc.flags?.lotm?.grantedSequence ?? null,
        systemLevel: doc.system?.level ?? null
      }))
    }, null, 2));
  } finally {
    await pathwaysDb.close();
    await abilitiesDb.close();
  }
})();
