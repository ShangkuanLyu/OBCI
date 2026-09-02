// Runs with `npm test` (node --test). Confirmed fee format: A$480 … A$4,980.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { formatFeeAmount, groupThousands } from "../src/lib/utils/fee.ts";

const messages = async (locale) =>
  JSON.parse(await readFile(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));

describe("membership fee format", () => {
  test("the five confirmed tiers", () => {
    assert.deepEqual(
      [480, 880, 1980, 2980, 4980].map((n) => formatFeeAmount(n, "AUD")),
      ["A$480", "A$880", "A$1,980", "A$2,980", "A$4,980"],
    );
  });

  test("same output for zh and en callers (no locale-dependent symbol)", () => {
    // The formatter is locale-free by design: no "AU$", "AUD $" or "$".
    for (const value of ["A$1,980"]) {
      assert.equal(formatFeeAmount(1980, "AUD"), value);
      assert.equal(formatFeeAmount(1980, "aud"), value);
      assert.equal(formatFeeAmount(1980, ""), value);
      assert.equal(formatFeeAmount(1980, null), value);
    }
    assert.doesNotMatch(formatFeeAmount(1980, "AUD"), /AU\$|AUD/);
  });

  test("numeric strings from the database and fractional amounts", () => {
    assert.equal(formatFeeAmount(Number("1980.00"), "AUD"), "A$1,980");
    assert.equal(formatFeeAmount(1979.5, "AUD"), "A$1,980");
  });

  test("grouping", () => {
    assert.equal(groupThousands(0), "0");
    assert.equal(groupThousands(999), "999");
    assert.equal(groupThousands(1000), "1,000");
    assert.equal(groupThousands(1234567), "1,234,567");
  });

  test("a non-AUD row is not mislabelled as A$", () => {
    assert.equal(formatFeeAmount(500, "USD"), "USD 500");
  });

  test("invalid amounts fail loudly instead of rendering A$NaN", () => {
    for (const bad of [NaN, Infinity, -1, Number("abc")])
      assert.throws(() => formatFeeAmount(bad, "AUD"), RangeError);
  });

  test("composed strings exactly as confirmed: A$480／年 … A$4,980／年 (zh) and A$480/year … (en)", async () => {
    const zh = (await messages("zh")).membership.perYear;
    const en = (await messages("en")).membership.perYear;
    const compose = (n, suffix) => `${formatFeeAmount(n, "AUD")}${suffix}`;
    assert.deepEqual(
      [480, 880, 1980, 2980, 4980].map((n) => compose(n, zh)),
      ["A$480／年", "A$880／年", "A$1,980／年", "A$2,980／年", "A$4,980／年"],
    );
    assert.deepEqual(
      [480, 880, 1980, 2980, 4980].map((n) => compose(n, en)),
      ["A$480/year", "A$880/year", "A$1,980/year", "A$2,980/year", "A$4,980/year"],
    );
    // zh keeps the full-width slash; en uses the ASCII slash; no spaces.
    assert.equal(zh, "／年");
    assert.equal(en, "/year");
  });
});
