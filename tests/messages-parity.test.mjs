// Runs with `npm test` (node --test). The two message catalogues must carry
// exactly the same key set (a key present in one locale only renders as a
// raw key path in the other) and no empty strings.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const load = async (locale) =>
  JSON.parse(await readFile(new URL(`messages/${locale}.json`, root), "utf8"));

function flatten(value, prefix = "") {
  if (value && typeof value === "object" && !Array.isArray(value))
    return Object.entries(value).flatMap(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key),
    );
  return [[prefix, value]];
}

describe("message catalogues", () => {
  test("zh and en have identical key sets", async () => {
    const zh = new Set(flatten(await load("zh")).map(([key]) => key));
    const en = new Set(flatten(await load("en")).map(([key]) => key));
    assert.deepEqual([...zh].filter((key) => !en.has(key)), [], "keys only in zh");
    assert.deepEqual([...en].filter((key) => !zh.has(key)), [], "keys only in en");
  });

  test("every leaf is a non-empty string", async () => {
    for (const locale of ["zh", "en"])
      for (const [key, value] of flatten(await load(locale)))
        assert.ok(
          typeof value === "string" && value.trim() !== "",
          `${locale}: ${key}`,
        );
  });
});
