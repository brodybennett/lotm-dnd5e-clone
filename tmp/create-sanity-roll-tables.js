const path = require("path");
const crypto = require("crypto");
const { ClassicLevel } = require("./node-tools/node_modules/classic-level");

const ROOT = path.join(__dirname, "..");
const PACK_PATH = path.join(ROOT, "packs", "lotm_tables");

const NOW = Date.now();
const USER_ID = "PlJLjweCoMIT3aIO";
const CORE_VERSION = "13.351";
const SYSTEM_ID = "lotm";
const SYSTEM_VERSION = "5.2.6";

const id = (value) => crypto.createHash("sha1").update(value).digest("hex").slice(0, 16);

function docStats() {
  return {
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null,
    coreVersion: CORE_VERSION,
    systemId: SYSTEM_ID,
    systemVersion: SYSTEM_VERSION,
    createdTime: NOW,
    modifiedTime: NOW,
    lastModifiedBy: USER_ID
  };
}

function embeddedStats() {
  return {
    coreVersion: CORE_VERSION,
    systemId: null,
    systemVersion: null,
    createdTime: null,
    modifiedTime: null,
    lastModifiedBy: null,
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null
  };
}

function html(...parts) {
  return parts.filter(Boolean).map((part) => `<p>${part}</p>`).join("");
}

const folderName = "Sanity & Corruption";
const folderId = id(`folder:${folderName}`);

const tables = [
  {
    name: "Failed Sanity Check (Corruption 0-25)",
    img: "icons/magic/control/fear-fright-monster-green.webp",
    sort: 100000,
    description: html(
      "Roll when a creature fails a sanity check and its corruption is 25 or lower.",
      "These effects are unsettling but still mostly recoverable with rest, reassurance, or a few steady breaths."
    ),
    results: [
      "Your thoughts snag on one trivial detail. You have disadvantage on the next Wisdom (Perception) or Intelligence (Investigation) check you make before the end of the scene.",
      "A whisper that may not exist answers your inner monologue. You cannot take reactions until the start of your next turn.",
      "You compulsively check a weapon, charm, notebook, or pocketed item. Lose your bonus action on your next turn.",
      "Every shadow looks a fraction too deep. Reduce your speed by 10 feet until the end of your next turn.",
      "You hesitate before meeting anyone's eyes. You have disadvantage on the next Charisma check you make this scene.",
      "Your pulse spikes and your hands tremble. You have disadvantage on the next attack roll you make before the end of your next turn.",
      "You mutter a warning only you understand. An ally who hears you has advantage on their next check to realize you are disturbed.",
      "A brief wave of nausea hits. You cannot willingly move closer to the source of the check until the end of your next turn.",
      "For a moment, every sound arrives a beat late. You have disadvantage on initiative if combat begins within the next minute.",
      "You force the feeling down, but it lingers. Gain 1 temporary corruption unless you spend 1 minute grounding yourself after the scene."
    ]
  },
  {
    name: "Failed Sanity Check (Corruption 26-50)",
    img: "icons/magic/control/fear-fright-monster-yellow.webp",
    sort: 200000,
    description: html(
      "Roll when a creature fails a sanity check and its corruption is between 26 and 50.",
      "The mind starts externalizing fear, obsession, and mistrust in ways other people can notice."
    ),
    results: [
      "You become certain someone nearby is hiding the truth. You have disadvantage on Insight checks, but advantage on checks made to detect lies or hidden movement, for 10 minutes.",
      "A symbol, face, or phrase repeats in your head until it drowns out reason. You must use your next action either to speak about it, sketch it, or stare at it if present.",
      "You mistake an ally's movement for a threat. Immediately use your reaction, if available, to step 10 feet away or make one unarmed strike against empty space.",
      "Your breathing turns ragged and shallow. You cannot Dash or take bonus actions for 1 minute.",
      "You hear distant chanting behind every other sound. You have disadvantage on concentration checks and Wisdom saves until the end of the scene.",
      "A surge of grim clarity strips away empathy. You have disadvantage on Persuasion checks and advantage on Intimidation checks for 10 minutes.",
      "Your reflection does not seem to copy you quite right. You are frightened of reflective surfaces until the end of the scene, though creatures are not included.",
      "You compulsively count heartbeats, footsteps, or breaths. You have disadvantage on Dexterity checks for 10 minutes.",
      "A buried memory surfaces at the worst possible time. You are stunned until the end of your current turn, then can act normally.",
      "The failure leaves a stain on your spirit. Gain 1d4 corruption."
    ]
  },
  {
    name: "Failed Sanity Check (Corruption 51-75)",
    img: "icons/magic/control/fear-fright-monster-orange.webp",
    sort: 300000,
    description: html(
      "Roll when a creature fails a sanity check and its corruption is between 51 and 75.",
      "The boundary between instinct, omen, and reality starts to fray in dangerous ways."
    ),
    results: [
      "You are overwhelmed by hostile visions. You are frightened of the nearest creature, object, or doorway associated with the trigger for 1 minute. Repeat the sanity check at the end of each of your turns, ending the effect on a success.",
      "You lash out before thought can catch up. Immediately make one weapon attack against the nearest creature in reach. If no target is in reach, move up to your speed toward perceived danger instead.",
      "Your mind slips half a second out of step. You are incapacitated until the end of your next turn.",
      "You become convinced an ally has already died and is only pretending. You cannot benefit from the Help action or willingly receive healing from allies for 10 minutes.",
      "An occult taboo grips you. Choose one of the following at random: speaking, touching bare skin, or crossing a threshold. You refuse to do it for 1 minute unless physically forced.",
      "Your body floods with panic. Drop one held item of the GM's choice and move up to your speed toward cover or concealment.",
      "You blurt out a secret, suspicion, or hidden fear. You automatically fail the next Deception check you make this scene, and creatures listening learn something compromising or intimate.",
      "Reality buckles around one repeated omen. Until the end of the scene, you have disadvantage on all Intelligence, Wisdom, and Charisma checks except those related to the check's source.",
      "Your spiritual defenses crack open. Gain 1d6 corruption and disadvantage on the next sanity check you make before finishing a short or long rest.",
      "You collapse into a fugue state. You are charmed by the source of the failed sanity check, if it is a creature, for 1 minute. If there is no creature source, you are instead incapacitated for 1 minute. Repeat the sanity check at the end of each of your turns, ending the effect on a success."
    ]
  },
  {
    name: "Failed Sanity Check (Corruption 76-100)",
    img: "icons/magic/control/fear-fright-monster-red.webp",
    sort: 400000,
    description: html(
      "Roll when a creature fails a sanity check and its corruption is between 76 and 100.",
      "At this level the psyche is splintering under pressure, and the fallout should feel catastrophic, visible, and hard to contain."
    ),
    results: [
      "Your sense of self tears loose. You are stunned for 1 round, then gain 1d10 corruption.",
      "You interpret everyone nearby as an intruder in your destiny. For 1 minute, you must use your action each turn to attack, flee from, or violently resist the nearest creature. Repeat the sanity check at the end of each of your turns, ending the effect on a success.",
      "Something behind your eyes answers the trigger. The GM gains one immediate narrative truth about what your corruption wants, and you act to advance it for the next round unless restrained.",
      "You seize up as layered voices argue through your mouth. You are incapacitated for 1 minute, and each ally within 10 feet who hears you must succeed on a DC 10 Wisdom save or lose their reaction from the shock.",
      "You suffer a total break from context. For 10 minutes, you cannot distinguish ally from stranger except by direct proof, and all creatures have advantage on Deception checks against you.",
      "The corruption surges into your body. Gain 2d6 corruption and one level of exhaustion.",
      "You become fixated on a terrible revelation. You immediately move toward the source of the failed check by the safest route available and provoke no self-preserving hesitation for 1 minute.",
      "A protective instinct mutates into possession. Choose the nearest creature you care about; for 1 minute you refuse to let anyone else approach them, by force if necessary. Repeat the sanity check at the end of each of your turns, ending the effect on a success.",
      "Your mind cannot hold the shape of the world. You fall unconscious for 1d10 minutes or until you take damage, whichever comes first, and wake with no memory of the collapse.",
      "The failure leaves a lasting fracture. Gain 1d10 corruption, and until you finish a long rest you have disadvantage on all sanity checks and death saving throws."
    ]
  }
];

function buildFolder(existing) {
  return {
    name: folderName,
    type: "RollTable",
    folder: null,
    sorting: "a",
    sort: 400000,
    _id: folderId,
    description: "",
    color: "#8a1c1c",
    flags: {},
    _stats: existing?._stats ? { ...existing._stats, modifiedTime: NOW, lastModifiedBy: USER_ID } : docStats()
  };
}

function buildTable(table, existing) {
  const tableId = id(`table:${table.name}`);
  const resultIds = table.results.map((_, index) => id(`result:${table.name}:${index + 1}`));
  return {
    key: `!tables!${tableId}`,
    id: tableId,
    resultIds,
    doc: {
      _id: tableId,
      name: table.name,
      img: table.img,
      description: table.description,
      results: resultIds,
      replacement: true,
      displayRoll: true,
      folder: folderId,
      flags: {},
      _stats: existing?._stats ? { ...existing._stats, modifiedTime: NOW, lastModifiedBy: USER_ID } : docStats(),
      formula: "1d10",
      sort: table.sort,
      ownership: { default: 0 }
    }
  };
}

function buildResult(tableName, tableImg, text, rangeStart, resultId) {
  return {
    type: "text",
    weight: 1,
    range: [rangeStart, rangeStart],
    drawn: false,
    _id: resultId,
    img: tableImg,
    flags: {},
    _stats: embeddedStats(),
    description: text,
    name: ""
  };
}

(async () => {
  const db = new ClassicLevel(PACK_PATH, { valueEncoding: "utf8" });
  await db.open();

  try {
    const existing = new Map();
    for await (const [key, value] of db.iterator()) existing.set(key, value);

    const ops = [];

    const existingFolder = existing.get(`!folders!${folderId}`)
      ? JSON.parse(existing.get(`!folders!${folderId}`))
      : null;
    ops.push({
      type: "put",
      key: `!folders!${folderId}`,
      value: JSON.stringify(buildFolder(existingFolder))
    });

    for (const table of tables) {
      const built = buildTable(
        table,
        existing.get(`!tables!${id(`table:${table.name}`)}`)
          ? JSON.parse(existing.get(`!tables!${id(`table:${table.name}`)}`))
          : null
      );

      for (const key of existing.keys()) {
        if (key.startsWith(`!tables.results!${built.id}.`)) ops.push({ type: "del", key });
      }

      ops.push({
        type: "put",
        key: built.key,
        value: JSON.stringify(built.doc)
      });

      table.results.forEach((text, index) => {
        const result = buildResult(table.name, table.img, text, index + 1, built.resultIds[index]);
        ops.push({
          type: "put",
          key: `!tables.results!${built.id}.${result._id}`,
          value: JSON.stringify(result)
        });
      });
    }

    await db.batch(ops);

    const summary = [];
    for (const table of tables) {
      const tableId = id(`table:${table.name}`);
      let resultCount = 0;
      for await (const [key] of db.iterator()) {
        if (key.startsWith(`!tables.results!${tableId}.`)) resultCount++;
      }
      summary.push({ name: table.name, resultCount });
    }

    console.log(JSON.stringify({
      folder: folderName,
      tableCount: tables.length,
      tables: summary
    }, null, 2));
  } finally {
    await db.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
