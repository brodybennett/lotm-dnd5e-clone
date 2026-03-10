const { Level } = require("level");

const STEP5_TITLE = "Step 5: Character Creation Details";
const STEP5_REPLACEMENT = `
Now fill in the rest of your character sheet.

Record Pathway Features
Review your pathway reference in @UUID[Compendium.lotm.lotm_rules.JournalEntry.phbCharacterClas]{Character Pathways} and note the Sequence 9 package on your sheet. If a feature offers choices, resolve them now.

Fill In Core Numbers
Saving Throws: add your Sequence Bonus and applicable modifiers as normal.
Skills: add your Sequence Bonus where proficient, plus pathway check edge where applicable.
Passive Perception: 10 + Spirituality (Perception) modifier.

Hit Points and Spirituality
HP and Spirituality use sequence-based values, not class hit-die tables:
HP_max = HP_base + CON_mod * (3 + Tier) + PathwayDurabilityAdj
SP_max = SP_base + SPI_mod * (2 + Tier) + PathwaySpiritualAdj
Use the sequence advancement table to determine HP_base and SP_base.

Initiative and Armor Class
Initiative starts from Dexterity and then applies pathway-derived edge and instability penalties.
Armor Class follows normal baseline rules unless a pathway feature overrides it.

Attacks, Save DC, and Ability Use
Attack rolls and save DCs use pathway progression through Sequence Bonus and Potency.
Ability usage is tracked with Spirituality cost instead of spell slots in the standard pathway flow.
Use @UUID[Compendium.lotm.lotm_rules.JournalEntry.phbEquipment0000]{Equipment} for weapon and armor properties.
`.trim();

/**
 * Convert dnd5e compendium references to lotm_rules references when the target journal/page exists.
 * @param {string} content
 * @param {Map<string, { pages?: string[] }>} journals
 * @returns {{ content: string, replacements: number }}
 */
function convertJournalUuidReferences(content, journals) {
  let replacements = 0;
  const converted = content.replace(
    /Compendium\.dnd5e\.[^.]+\.JournalEntry\.([A-Za-z0-9]+)(?:\.JournalEntryPage\.([A-Za-z0-9]+))?/g,
    (match, journalId, pageId) => {
      const journal = journals.get(journalId);
      if ( !journal ) return match;
      if ( pageId && !journal.pages?.includes(pageId) ) return match;
      replacements++;
      return `Compendium.lotm.lotm_rules.JournalEntry.${journalId}${pageId ? `.JournalEntryPage.${pageId}` : ""}`;
    }
  );
  return { content: converted, replacements };
}

(async () => {
  const dbPath = process.argv[2] ?? "packs/lotm_rules";
  const db = new Level(dbPath, { valueEncoding: "utf8" });
  await db.open();

  const journals = new Map();
  for await (const [, value] of db.iterator({ gte: "!journal!", lt: "!journal!~" })) {
    const journal = JSON.parse(value);
    journals.set(journal._id, journal);
  }

  let pagesUpdated = 0;
  let uuidReplacements = 0;
  let step5Updated = false;

  for (const journal of journals.values()) {
    for (const pageId of journal.pages ?? []) {
      const pageKey = `!journal.pages!${journal._id}.${pageId}`;
      let rawPage;
      try {
        rawPage = await db.get(pageKey);
      } catch {
        continue;
      }
      const page = JSON.parse(rawPage);
      if ( page.type !== "text" ) continue;
      page.text ??= { format: 1, content: "" };
      const original = String(page.text.content ?? "");
      let updated = original;

      if ( String(page.name ?? "").trim() === STEP5_TITLE ) {
        updated = STEP5_REPLACEMENT;
        step5Updated = true;
      }

      const conversion = convertJournalUuidReferences(updated, journals);
      updated = conversion.content;
      uuidReplacements += conversion.replacements;

      if ( updated === original ) continue;
      page.text.content = updated;
      await db.put(pageKey, JSON.stringify(page));
      pagesUpdated++;
    }
  }

  await db.close();

  const summary = {
    dbPath,
    pagesUpdated,
    uuidReplacements,
    step5Updated
  };
  console.log(JSON.stringify(summary, null, 2));
})();
