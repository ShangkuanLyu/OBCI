// Runs with `npm test` (node --test). Parser behind the admin "council
// roster" textarea (src/lib/utils/council-lines.mjs): one member per line,
// `name_en | name_zh | note_en | note_zh`, capped at 60 members.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  COUNCIL_MAX_MEMBERS,
  formatCouncilLines,
  parseCouncilLines,
} from "../src/lib/utils/council-lines.mjs";

describe("parseCouncilLines", () => {
  test("parses name_en | name_zh | note_en | note_zh, trimming every cell", () => {
    const members = parseCouncilLines(
      " Hon. Bruce Atkinson AM | 布鲁斯·阿特金森 | Hon. Chairman | 荣誉主席 \n",
    );
    assert.deepEqual(members, [
      {
        name_en: "Hon. Bruce Atkinson AM",
        name_zh: "布鲁斯·阿特金森",
        note_en: "Hon. Chairman",
        note_zh: "荣誉主席",
      },
    ]);
  });

  test("a missing Chinese name falls back to the English one (and vice versa); notes default to empty", () => {
    assert.deepEqual(parseCouncilLines("Frank Perre"), [
      { name_en: "Frank Perre", name_zh: "Frank Perre", note_en: "", note_zh: "" },
    ]);
    assert.deepEqual(parseCouncilLines("Sheryl Leigh |"), [
      { name_en: "Sheryl Leigh", name_zh: "Sheryl Leigh", note_en: "", note_zh: "" },
    ]);
    assert.deepEqual(parseCouncilLines(" | 孙国照"), [
      { name_en: "孙国照", name_zh: "孙国照", note_en: "", note_zh: "" },
    ]);
  });

  test("blank and name-less lines are skipped; CRLF input is accepted; order is kept", () => {
    const members = parseCouncilLines(
      "\r\nSunny Sun | 孙国照\r\n\r\n | | note only\r\nJing Liu | 刘京\r\n",
    );
    assert.deepEqual(
      members.map((m) => m.name_en),
      ["Sunny Sun", "Jing Liu"],
    );
  });

  test("null / undefined input yields an empty roster", () => {
    assert.deepEqual(parseCouncilLines(null), []);
    assert.deepEqual(parseCouncilLines(undefined), []);
    assert.deepEqual(parseCouncilLines(""), []);
  });

  test("caps the roster at 60 members by default and honours a custom cap", () => {
    const lines = Array.from({ length: 75 }, (_, i) => `Member ${i + 1}`).join("\n");
    assert.equal(COUNCIL_MAX_MEMBERS, 60);
    assert.equal(parseCouncilLines(lines).length, 60);
    assert.equal(parseCouncilLines(lines, { max: 3 }).length, 3);
    assert.equal(parseCouncilLines(lines, { max: 3 })[2].name_en, "Member 3");
  });
});

describe("formatCouncilLines", () => {
  test("round-trips the parsed roster and drops trailing empty cells", () => {
    const text = [
      "Hon. Ken Smith AM | 肯·史密斯 | Founding President | 创会会长",
      "Frank Perre | Frank Perre",
      "Diana Lin | 林丹",
    ].join("\n");
    const members = parseCouncilLines(text);
    assert.equal(formatCouncilLines(members), text);
    assert.deepEqual(parseCouncilLines(formatCouncilLines(members)), members);
  });

  test("keeps an inner empty cell when a later note is set", () => {
    assert.equal(
      formatCouncilLines([{ name_en: "A", name_zh: "", note_en: "x", note_zh: "" }]),
      "A |  | x",
    );
    assert.equal(formatCouncilLines([]), "");
  });
});
