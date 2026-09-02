// Runs with `npm test` (node --test). Pins the confirmed Chinese name of the
// fourth membership tier — 小型企业会员, never 小微企业会员 — across every
// source the site can render it from: the preview fixture override, the
// (unapplied) seed migration's statements and the message catalogues.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { FIXTURE_MEMBERSHIP_NAME_OVERRIDES } from "../src/lib/fixtures/design-review.ts";

const root = new URL("../", import.meta.url);
const read = (rel) => readFile(new URL(rel, root), "utf8");

describe("membership tier names", () => {
  test("fixture override: small → 小型企业会员 / Small Enterprise Member; the other tiers keep their confirmed names", () => {
    assert.equal(FIXTURE_MEMBERSHIP_NAME_OVERRIDES.small.name_zh, "小型企业会员");
    assert.equal(FIXTURE_MEMBERSHIP_NAME_OVERRIDES.small.name_en, "Small Enterprise Member");
    assert.equal(FIXTURE_MEMBERSHIP_NAME_OVERRIDES["corporate-group"].name_zh, "企业顶级会员");
    assert.equal(FIXTURE_MEMBERSHIP_NAME_OVERRIDES["corporate-group"].name_en, undefined);
    assert.equal(FIXTURE_MEMBERSHIP_NAME_OVERRIDES.individual.turnover_zh, "自然人创业者");
    assert.deepEqual(Object.keys(FIXTURE_MEMBERSHIP_NAME_OVERRIDES).sort(), [
      "corporate-group",
      "individual",
      "small",
    ]);
    for (const value of Object.values(FIXTURE_MEMBERSHIP_NAME_OVERRIDES))
      for (const text of Object.values(value)) {
        assert.doesNotMatch(text, /小微/);
        assert.doesNotMatch(text, /micro/i);
      }
  });

  test("seed migration writes 小型企业会员 / Small Enterprise Member (SQL statements, comments excluded)", async () => {
    const sql = await read("supabase/migrations/20260902121000_obai_rebrand_content_seed.sql");
    const statements = sql
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");
    assert.match(
      statements,
      /set name_zh = '小型企业会员',\s*\n\s*name_en = 'Small Enterprise Member'\s*\nwhere code = 'small'/,
    );
    assert.doesNotMatch(statements, /小微/);
    assert.doesNotMatch(statements, /micro/i);
  });

  test("message catalogues never mention 小微 or a Micro tier", async () => {
    for (const file of ["messages/zh.json", "messages/en.json"]) {
      const text = await read(file);
      assert.doesNotMatch(text, /小微/, file);
      assert.doesNotMatch(text, /micro enterprise|small and micro/i, file);
    }
  });
});
