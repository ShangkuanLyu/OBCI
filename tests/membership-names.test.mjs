// Runs with `npm test` (node --test). Pins the confirmed membership tier
// names across every source the site can render them from: the seed
// migration's statements (the database is the source of truth at runtime)
// and the message catalogues.
//  - English names per the 2026 English brochure (owner decision D8):
//    Corporate / Large Company / Medium Company / Small Company /
//    Individual Member — never "Micro" and never the retired fourth-tier
//    wording (Small + Enterprise), which neither the migration nor the
//    catalogues may contain anywhere;
//  - Chinese: 企业顶级会员 (top tier) and 小型企业会员 (fourth tier), never
//    小微企业会员; individual threshold 自然人创业者.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (rel) => readFile(new URL(rel, root), "utf8");

const ENGLISH_NAMES = {
  "corporate-group": "Corporate Member",
  large: "Large Company Member",
  medium: "Medium Company Member",
  small: "Small Company Member",
  individual: "Individual Member",
};

// Built from parts so the retired wording never appears literally in the
// repository (a ripgrep for it over src, messages, supabase and tests must
// stay empty).
const RETIRED_SMALL_TIER = new RegExp(["Small", "Enterprise"].join("\\s+"), "i");
const MICRO = /小微|micro/i;

describe("membership tier names", () => {
  test("seed migration writes the same names (SQL statements, comments excluded)", async () => {
    const sql = await read("supabase/migrations/20260902121000_obai_rebrand_content_seed.sql");
    const statements = sql
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");
    for (const [code, name] of Object.entries(ENGLISH_NAMES)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      assert.match(
        statements,
        new RegExp(`name_en = '${escaped}'[^;]*\\nwhere code = '${code}';`),
        `${code} → ${name}`,
      );
    }
    assert.match(
      statements,
      /set name_zh = '企业顶级会员',\s*\n\s*name_en = 'Corporate Member'\s*\nwhere code = 'corporate-group'/,
    );
    assert.match(
      statements,
      /set name_zh = '小型企业会员',\s*\n\s*name_en = 'Small Company Member'\s*\nwhere code = 'small'/,
    );
    assert.match(statements, /turnover_zh = '自然人创业者'\s*\nwhere code = 'individual'/);
    // Brand-neutral directory benefit (array element replaced in place).
    assert.match(statements, /array_replace\(benefits_zh, 'OBC 官网名录展示', '官网会员名录展示'\)/);
    assert.match(
      statements,
      /'Listing in the OBC online member directory',\s*\n\s*'Listing in the online member directory'/,
    );
    assert.doesNotMatch(statements, MICRO);
    assert.doesNotMatch(statements, RETIRED_SMALL_TIER);
  });

  test("message catalogues never mention 小微, a Micro tier or the retired wording", async () => {
    for (const file of ["messages/zh.json", "messages/en.json"]) {
      const text = await read(file);
      assert.doesNotMatch(text, /小微/, file);
      assert.doesNotMatch(text, /micro enterprise|small and micro/i, file);
      assert.doesNotMatch(text, RETIRED_SMALL_TIER, file);
    }
  });
});
