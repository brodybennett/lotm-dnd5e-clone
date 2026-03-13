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
      '<p><strong>Sequence 4 Package (Gain Budget +33):</strong> Iron-Blooded Courage, Augmented Armament, Galvanized Body, Calamity Giant Form, plus two legacy upgrades (Cull and Crossfire Conspiracy).</p>' +
      '<p><strong>Sequence 3-0 Status:</strong> Pending authoring in later sequence-focused runs.</p>' +
      '<p><strong>Continuity Anchor:</strong> At Sequence 4 (Iron-blooded Knight), Hunter steps into demigod-scale war authority: fearless command presence, weapon transmutation into explosive killing tools, and flame-formed repositioning that sustains reaper pressure.</p>';
    pathway._stats = buildStats(now, pathway._stats);
    await pathwaysDb.put(pathwayKey, JSON.stringify(pathway));

    const folderKey = '!folders!vB18zSgRsDmrUAjW';
    const folder = await getOptionalJson(abilitiesDb, folderKey);
    if (!folder) throw new Error('Hunter folder (vB18zSgRsDmrUAjW) not found.');

    folder.description = 'Sequence abilities for the Hunter pathway (authored through Sequence 4).';
    folder.flags = folder.flags ?? {};
    folder.flags.lotm = {
      ...(folder.flags.lotm ?? {}),
      pathwayIdentifier: 'lotm-hunter',
      latestAuthoredSequence: 4
    };
    folder._stats = buildStats(now + 1, folder._stats);
    await abilitiesDb.put(folderKey, JSON.stringify(folder));

    const legacyCullKey = '!items!lotmAbilityH5002';
    const legacyCrossfireKey = '!items!lotmAbilityH6001';
    const legacyCull = await getOptionalJson(abilitiesDb, legacyCullKey);
    const legacyCrossfire = await getOptionalJson(abilitiesDb, legacyCrossfireKey);
    if (!legacyCull) throw new Error('Legacy target lotmAbilityH5002 not found.');
    if (!legacyCrossfire) throw new Error('Legacy target lotmAbilityH6001 not found.');

    const cullHeader = '<h3>Legacy Upgrade (Sequence 4 - Potency)</h3>';
    const cullText =
      '<p>At Sequence 4, Cull reaches demigod execution threshold. ' +
      'When you use Cull against a target marked by Weakness Survey or Crossfire Conspiracy, add bonus damage equal to <strong>Potency</strong>. ' +
      'If that target is bloodied, its first saving throw against Cull this round is made with disadvantage (once per target per round).</p>';
    const cullDescription = String(legacyCull.system?.description?.value ?? '');
    if (!cullDescription.includes(cullHeader)) {
      legacyCull.system.description.value = `${cullDescription}${cullHeader}${cullText}`;
    }
    legacyCull._stats = buildStats(now + 2, legacyCull._stats);
    await abilitiesDb.put(legacyCullKey, JSON.stringify(legacyCull));

    const crossfireHeader = '<h3>Legacy Upgrade (Sequence 4 - Scope)</h3>';
    const crossfireText =
      '<p>At Sequence 4, Crossfire Conspiracy can interlock multiple kill corridors. ' +
      'When cast with at least <strong>+2 Spirituality</strong>, choose a second point within 20 feet of the first crossfire anchor. ' +
      'Triggered movement and reaction-attack benefits can originate from either anchor, but each creature can trigger only one anchor per round. ' +
      'Once per short rest, this dual-anchor spread can be used without paying the +2 surcharge.</p>';
    const crossfireDescription = String(legacyCrossfire.system?.description?.value ?? '');
    if (!crossfireDescription.includes(crossfireHeader)) {
      legacyCrossfire.system.description.value = `${crossfireDescription}${crossfireHeader}${crossfireText}`;
    }
    legacyCrossfire._stats = buildStats(now + 3, legacyCrossfire._stats);
    await abilitiesDb.put(legacyCrossfireKey, JSON.stringify(legacyCrossfire));

    const existingAbility1 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH4001');
    const existingAbility2 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH4002');
    const existingAbility3 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH4003');
    const existingAbility4 = await getOptionalJson(abilitiesDb, '!items!lotmAbilityH4004');

    const abilityDocs = [
      {
        _id: 'lotmAbilityH4001',
        name: 'Iron-Blooded Courage',
        type: 'spell',
        img: 'icons/magic/control/fear-fright-monster-yellow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Enter iron-blooded command stance for 1 minute. You gain advantage on saves against fear, charm, and panic effects. Allies within 15 feet that can hear you add <strong>+1</strong> to the same saves. Once per round when an ally in aura succeeds such a save, one hostile creature within 30 feet takes fire damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Aura radius becomes 25 feet.</li><li><strong>+2 Spirituality:</strong> Allies in aura also gain advantage on checks against forced retreat and morale collapse effects.</li><li><strong>+4 Spirituality:</strong> Once during duration, when a creature in aura would fail a fear/charm/panic save, turn that failure into a success and force one visible hostile creature to make a Wisdom save or become <strong>frightened</strong> of your line until end of its next turn.</li></ul><p><em>Counterplay:</em> silence, isolation, and effects that remove allies from command range can break aura value.</p><p><em>Corruption Hook:</em> if you use this resolve to drive allies into pointless slaughter, gain 1 Corruption.</p>',
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
          level: 5,
          school: 'abj',
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
            hunterSeq4Act001: buildActivity({
              id: 'hunterSeq4Act001',
              activationType: 'bonus',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-iron-blooded-courage',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 4, existingAbility1?._stats),
        sort: 900500,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH4002',
        name: 'Augmented Armament',
        type: 'spell',
        img: 'icons/weapons/swords/sword-broad-serrated-glow.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Action. Imbue up to two ordinary objects or wielded weapons for 1 minute. Each imbued object can be used as a weapon with damage and force comparable to heavy battlefield armaments, and its first hit each round deals bonus fire damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Imbue one additional object.</li><li><strong>+2 Spirituality:</strong> First hit each round from an imbued weapon causes a 5-foot blast; creatures in blast make Dexterity save or take fire damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> Once per round, if two different imbued weapons hit the same target, cancel one minor defensive rider on that target and apply a second Potency fire instance.</li></ul><p><em>Counterplay:</em> disarm, object suppression, and anti-enhancement fields reduce transformed weapon value.</p><p><em>Corruption Hook:</em> if you weaponize common tools against noncombatants for intimidation, gain 1 Corruption.</p>',
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
              type: 'object',
              special: 'ordinary objects or wielded weapons'
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
            special: ''
          },
          uses: {
            max: '',
            spent: 0,
            recovery: []
          },
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a drop of oil mixed with ash from a battlefield fire',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq4Act002: buildActivity({
              id: 'hunterSeq4Act002',
              activationType: 'action',
              durationUnits: 'minute'
            })
          },
          identifier: 'lotm-hunter-augmented-armament',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 5, existingAbility2?._stats),
        sort: 900501,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH4003',
        name: 'Galvanized Body',
        type: 'spell',
        img: 'icons/magic/defensive/armor-stone-skin.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (1 Spirituality):</strong> Bonus action. Galvanize your body and manifested flames into black steel for 1 round. You gain resistance to nonmagical bludgeoning, piercing, slashing, and fire damage. Forced movement against you is reduced by 10 feet (minimum 0). Once per round when a creature hits you with a melee attack, it takes fire damage equal to <strong>Potency</strong>.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li><li><strong>+2 Spirituality:</strong> While active, ignore nonmagical difficult terrain and your first melee weapon hit each round deals additional fire damage equal to <strong>Potency</strong>.</li><li><strong>+4 Spirituality:</strong> While active, you cannot be knocked prone by creatures of sequence 5 or lower. When the effect ends, emit a 10-foot steel-ember burst; creatures in burst make Constitution save or take fire damage equal to <strong>Potency</strong> and have speed reduced by 10 feet until end of their next turn.</li></ul><p><em>Counterplay:</em> acid or lightning-heavy assault, spirit suppression, and displacement effects that bypass movement pressure reduce this stance\'s value.</p><p><em>Corruption Hook:</em> if you use Galvanized Body to force allies into attrition they cannot survive, gain 1 Corruption.</p>',
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
            units: 'round'
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
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'a strip of blackened steel wrapped around a burning wick',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq4Act003: buildActivity({
              id: 'hunterSeq4Act003',
              activationType: 'bonus',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-hunter-galvanized-body',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 6, existingAbility3?._stats),
        sort: 900502,
        ownership: {
          default: 0
        }
      },
      {
        _id: 'lotmAbilityH4004',
        name: 'Calamity Giant Form',
        type: 'spell',
        img: 'icons/creatures/magical/humanoid-silhouette-rune-blue.webp',
        system: {
          description: {
            value: '<p><strong>Baseline (2 Spirituality):</strong> Bonus action. Release incomplete Calamity Giant form for 1 round. Your size increases by one category (max Huge), melee reach increases by 5 feet, and your weapon attacks gain bonus fire damage equal to <strong>Potency</strong>. Creatures of sequence 5 or lower that start within 10 feet must pass a Wisdom save or become disoriented until end of turn.</p><p><strong>Higher Spend (upcast):</strong></p><ul><li><strong>+1 Spirituality:</strong> Duration becomes 2 rounds.</li><li><strong>+2 Spirituality:</strong> Gain resistance to bludgeoning, piercing, and slashing damage while transformed.</li><li><strong>+4 Spirituality:</strong> When form ends, emit a 15-foot shockwave; creatures in area make Constitution save or take fire + force damage equal to <strong>Potency</strong> and fall <strong>prone</strong>.</li></ul><p><em>Backlash:</em> each use forces a corruption or frenzy check; on failure, gain one stage of reckless-war impulse until short rest.</p><p><em>Counterplay:</em> reaction denial, mental disruption, and terrain bottlenecks can reduce giant-form conversion.</p>',
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
            units: 'round'
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
          level: 5,
          school: 'trs',
          properties: ['somatic'],
          materials: {
            value: 'an iron-black bone shard scorched from within',
            consumed: false,
            cost: 0,
            supply: 0
          },
          preparation: {
            mode: 'always',
            prepared: false
          },
          activities: {
            hunterSeq4Act004: buildActivity({
              id: 'hunterSeq4Act004',
              activationType: 'bonus',
              durationUnits: 'round'
            })
          },
          identifier: 'lotm-hunter-calamity-giant-form',
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
            grantedSequence: 4
          }
        },
        _stats: buildStats(now + 7, existingAbility4?._stats),
        sort: 900503,
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
      legacyUpdated: [legacyCullKey, legacyCrossfireKey],
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
