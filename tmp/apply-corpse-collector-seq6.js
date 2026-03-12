const { ClassicLevel } = require('./node-tools/node_modules/classic-level');

const CORE_VERSION = '13.351';
const SYSTEM_ID = 'lotm';
const SYSTEM_VERSION = '5.2.6';
const MODIFIER = 'codex';

function touchStats(existing, now) {
  return {
    ...(existing ?? {}),
    duplicateSource: existing?.duplicateSource ?? null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: existing?.exportSource ?? null
  };
}

function newStats(now) {
  return {
    duplicateSource: null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime: now,
    modifiedTime: now,
    lastModifiedBy: MODIFIER,
    exportSource: null
  };
}

function appendLegacyBlock(doc, header, html) {
  const text = String(doc.system?.description?.value ?? '');
  if (!text.includes(header)) {
    doc.system.description.value = text + header + html;
  }
}

(async () => {
  const now = Date.now();

  const pathwaysDb = new ClassicLevel('packs/lotm_pathways', { valueEncoding: 'utf8' });
  const abilitiesDb = new ClassicLevel('packs/lotm_abilities', { valueEncoding: 'utf8' });

  await pathwaysDb.open();
  await abilitiesDb.open();

  const pathwayKey = '!items!lotmPathway00010';
  const pathway = JSON.parse(await pathwaysDb.get(pathwayKey));
  pathway.system.description.value = '<p><strong>Pathway Vector:</strong> solemn stewardship of corpses, spirit perception, and measured decay that treats death as inevitable order rather than panic or spectacle.</p><p><strong>Sequence 9 Package (Total Budget 2):</strong> Undead Physique, Spirit Vision.</p><p><strong>Sequence 8 Package (Gain Budget +3):</strong> Death Eyes, Grave Whisper, plus one legacy scope upgrade to Spirit Vision.</p><p><strong>Sequence 7 Package (Gain Budget +13):</strong> Spirit Channelling, Spirit Affinity, Zombie Disguise, plus two legacy upgrades (Undead Physique and Grave Whisper).</p><p><strong>Sequence 6 Package (Gain Budget +9):</strong> Language of the Dead, Resurrection, Knowledge of Spirit World, plus two legacy upgrades (Spirit Channelling and Death Eyes).</p><p><strong>Sequence 5-0 Status:</strong> Pending authoring in later sequence-focused runs.</p><p><strong>Continuity Anchor:</strong> At Sequence 6 (Spirit Guide), the pathway transitions from mediumship to sustained command over deceased spirits and practical deathcraft logistics.</p>';
  pathway._stats = touchStats(pathway._stats, now + 1);
  await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

  const folderKey = '!folders!zFhCGCq7OxUkeaTp';
  const folder = JSON.parse(await abilitiesDb.get(folderKey));
  folder.description = 'Sequence abilities for the Corpse Collector pathway (authored through Sequence 6).';
  folder.flags = folder.flags ?? {};
  folder.flags.lotm = {
    ...(folder.flags.lotm ?? {}),
    pathwayIdentifier: 'lotm-corpse-collector',
    latestAuthoredSequence: 6
  };
  folder._stats = touchStats(folder._stats, now + 2);
  await abilitiesDb.put(folderKey, JSON.stringify(folder));

  const spiritChannellingKey = '!items!lotmAbilityC7001';
  const spiritChannelling = JSON.parse(await abilitiesDb.get(spiritChannellingKey));
  appendLegacyBlock(
    spiritChannelling,
    '<h3>Legacy Upgrade (Sequence 6 - Potency)</h3>',
    '<p>At Sequence 6, Spirit Channelling gains stronger command pressure. Once per turn when a target fails the save prompted by Disturb or Anchor mode, you may impose one additional rider: reduce speed by 10 feet, prevent reactions until end of turn, or force disadvantage on the next saving throw against your Death Pathway ability before the end of your next turn. In addition, if cast with at least <strong>+2 Spirituality</strong>, the channel can maintain one pre-bound minor spirit for 1 hour outside combat.</p>'
  );
  spiritChannelling._stats = touchStats(spiritChannelling._stats, now + 3);
  await abilitiesDb.put(spiritChannellingKey, JSON.stringify(spiritChannelling));

  const deathEyesKey = '!items!lotmAbilityC8001';
  const deathEyes = JSON.parse(await abilitiesDb.get(deathEyesKey));
  appendLegacyBlock(
    deathEyes,
    '<h3>Legacy Upgrade (Sequence 6 - Efficiency)</h3>',
    '<p>At Sequence 6, Death Eyes becomes easier to keep online in extended operations. Once per short rest, you can apply the baseline mark to one visible target as part of rolling initiative (no action). Also, while the mark persists, your first failed check each scene to identify an undead or spirit weak point may be rerolled. If cast with at least <strong>+1 Spirituality</strong>, this reroll can be granted to one ally within 30 feet instead.</p>'
  );
  deathEyes._stats = touchStats(deathEyes._stats, now + 4);
  await abilitiesDb.put(deathEyesKey, JSON.stringify(deathEyes));

  const docs = [
    {
      _id: 'lotmAbilityC6001',
      name: 'Language of the Dead',
      type: 'spell',
      img: 'icons/magic/symbols/runes-carved-stone-purple.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, utter a grave-script command at one creature with a soul within 60 feet. The target makes a Charisma save. On a failure, its Spirit Body is momentarily displaced from its flesh: it takes psychic damage equal to your Potency and cannot take reactions until the start of your next turn. Undead and spirits instead suffer disadvantage on their next saving throw against your Death Pathway abilities this round.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> You may target up to two creatures within range; resolve saves separately.</li><li><strong>+2 Spirituality:</strong> On a failed save, choose one extra effect: speed reduced by 15 feet, or the target cannot regain hit points until end of your next turn.</li><li><strong>+4 Spirituality:</strong> If a target fails by 5 or more, you may force a brief spirit-stagger: it drops concentration and has disadvantage on attacks until the end of its next turn.</li></ul><p><em>Counterplay:</em> mindless constructs, soul-anchoring rituals, and high-authority spiritual defenses can reduce or negate spirit displacement.</p><p><em>Corruption Hook:</em> using the language to torment surrendered or helpless souls adds 1 Corruption.</p>',
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
          units: 'round'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'creature with a soul'
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
        school: 'nec',
        properties: ['vocal', 'somatic'],
        materials: {
          value: 'a funerary tablet fragment etched with spirit script',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq6Act001: {
            type: 'utility',
            _id: 'corpseSeq6Act001',
            sort: 0,
            activation: {
              type: 'action',
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
              units: 'round',
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
          }
        },
        identifier: 'lotm-corpse-collector-language-of-the-dead',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
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
      _stats: newStats(now + 5),
      sort: 2100300,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC6002',
      name: 'Resurrection',
      type: 'spell',
      img: 'icons/magic/death/undead-skeleton-rags.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action targeting one humanoid or beast corpse within 10 feet that died within the last day, raise it as a mindless skeleton or zombie for 10 minutes (concentration). It acts on your initiative, obeys simple commands, cannot cast spells, and crumbles when duration ends. You may have only one baseline resurrected servant active at a time.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 1 hour and the servant gains temporary HP equal to your Potency.</li><li><strong>+2 Spirituality:</strong> Raise up to two corpses (same action) if both are within 10 feet of each other; both remain mindless and simple-command only.</li><li><strong>+4 Spirituality:</strong> Choose one raised servant to receive a reinforced frame: advantage on saves against turning effects and +10 feet movement while under your command.</li></ul><p><em>Counterplay:</em> sanctified remains, complete dismemberment, radiant purification, or anti-necromancy wards can block or collapse reanimation.</p><p><em>Corruption Hook:</em> repeatedly raising named dead against prior vows or family rites can add 1 Corruption per scene.</p>',
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
          value: '10',
          units: 'minute'
        },
        target: {
          affects: {
            choice: false,
            count: '1',
            type: 'creature',
            special: 'corpse of a humanoid or beast'
          },
          template: {
            units: '',
            contiguous: false,
            type: ''
          }
        },
        range: {
          units: 'ft',
          value: '10',
          special: ''
        },
        uses: {
          max: '',
          spent: 0,
          recovery: []
        },
        level: 3,
        school: 'nec',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'grave wax and a knotted black cord',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq6Act002: {
            type: 'utility',
            _id: 'corpseSeq6Act002',
            sort: 0,
            activation: {
              type: 'action',
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
              units: 'minute',
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
          }
        },
        identifier: 'lotm-corpse-collector-resurrection',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
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
      _stats: newStats(now + 6),
      sort: 2100301,
      ownership: {
        default: 0
      }
    },
    {
      _id: 'lotmAbilityC6003',
      name: 'Knowledge of Spirit World',
      type: 'spell',
      img: 'icons/magic/perception/orb-crystal-ball-scrying-blue.webp',
      system: {
        description: {
          value: '<p><strong>Baseline (0 Spirituality):</strong> As an action, project your awareness into overlapping Spirit World traces in a 60-foot radius for 1 minute (concentration). Choose one result on success (Spirituality check vs GM DC by scene complexity): identify nearest spirit crossing, identify whether a ward/ritual has recent Underworld contact, or reveal one hidden approach route usable in the next 10 minutes. You and one ally gain <strong>+1d4</strong> on the next relevant check tied to that result.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Radius becomes 120 feet and you may choose two results instead of one.</li><li><strong>+2 Spirituality:</strong> Duration becomes 10 minutes; once during duration, negate disadvantage on one perception/investigation check caused by darkness, spirit fog, or corpse aura.</li><li><strong>+4 Spirituality:</strong> Mark one spirit crossing for 1 hour. Allies you designate can traverse that marked path with advantage on checks to avoid spirit ambushes or soul-suppressing hazards.</li></ul><p><em>Counterplay:</em> high-sequence concealment, false crossings, and sealed Underworld gates can produce incomplete or misleading maps.</p><p><em>Corruption Hook:</em> over-reliance on spirit routes that endanger civilians to preserve tempo may add 1 Corruption.</p>',
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
          special: '60-foot spirit-trace radius'
        },
        uses: {
          max: '',
          spent: 0,
          recovery: []
        },
        level: 3,
        school: 'div',
        properties: ['vocal', 'somatic', 'concentration'],
        materials: {
          value: 'chalked spirit-circle and a drop of your blood',
          consumed: false,
          cost: 0,
          supply: 0
        },
        preparation: {
          mode: 'always',
          prepared: false
        },
        activities: {
          corpseSeq6Act003: {
            type: 'utility',
            _id: 'corpseSeq6Act003',
            sort: 0,
            activation: {
              type: 'action',
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
              units: 'minute',
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
          }
        },
        identifier: 'lotm-corpse-collector-knowledge-of-spirit-world',
        method: 'spell',
        prepared: 1,
        spiritualityCost: null,
        sourceClass: 'lotm-corpse-collector'
      },
      effects: [],
      folder: 'zFhCGCq7OxUkeaTp',
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
      _stats: newStats(now + 7),
      sort: 2100302,
      ownership: {
        default: 0
      }
    }
  ];

  for (const doc of docs) {
    await abilitiesDb.put(`!items!${doc._id}`, JSON.stringify(doc));
  }

  await pathwaysDb.close();
  await abilitiesDb.close();

  console.log(JSON.stringify({
    updatedPathway: pathwayKey,
    updatedFolder: folderKey,
    updatedLegacy: [spiritChannellingKey, deathEyesKey],
    wroteAbilities: docs.map(d => `!items!${d._id}`)
  }, null, 2));
})();
