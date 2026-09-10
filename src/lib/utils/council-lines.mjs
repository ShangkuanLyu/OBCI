// Pure parser / formatter for the admin "council roster" textarea
// (site_settings.council.members): one member per line,
//   name_en | name_zh | note_en | note_zh
// No React and no DOM, so it runs under `node --test`
// (tests/council-lines.test.mjs). The parsed shape is the one
// src/services/content.ts reads back for /about/leadership and
// /about/structure.

/**
 * @typedef {{ name_en: string; name_zh: string; note_en: string; note_zh: string }} CouncilMember
 */

/** Hard cap on roster length (the admin textarea is parsed to at most this
 *  many members; further lines are ignored). */
export const COUNCIL_MAX_MEMBERS = 60;

/**
 * Parse the textarea into members. Blank lines are skipped; cells are
 * trimmed; a line needs at least one name. A missing Chinese name falls
 * back to the English one (and vice versa), matching the roster rule
 * "name_zh = name_en when no Chinese name is given". Notes are optional.
 *
 * @param {string | null | undefined} text
 * @param {{ max?: number }} [options]
 * @returns {CouncilMember[]}
 */
export function parseCouncilLines(text, options = {}) {
  const max = options.max ?? COUNCIL_MAX_MEMBERS;
  /** @type {CouncilMember[]} */
  const members = [];
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const [name_en = "", name_zh = "", note_en = "", note_zh = ""] = line
      .split("|")
      .map((cell) => cell.trim());
    if (!name_en && !name_zh) continue;
    members.push({
      name_en: name_en || name_zh,
      name_zh: name_zh || name_en,
      note_en,
      note_zh,
    });
    if (members.length >= max) break;
  }
  return members;
}

/**
 * Inverse of parseCouncilLines for pre-filling the textarea. Trailing empty
 * cells are dropped so a member without notes prints as `name_en | name_zh`.
 *
 * @param {ReadonlyArray<Partial<CouncilMember>>} members
 * @returns {string}
 */
export function formatCouncilLines(members) {
  return members
    .map((member) => {
      const cells = [
        member.name_en ?? "",
        member.name_zh ?? "",
        member.note_en ?? "",
        member.note_zh ?? "",
      ];
      while (cells.length > 1 && cells[cells.length - 1] === "") cells.pop();
      return cells.join(" | ");
    })
    .join("\n");
}
