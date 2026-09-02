import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  enIntroMetrics,
  zhIntroMetrics,
  countWords,
  countChars,
} from "../src/lib/apply/intro-limits.ts";

describe("Chinese introduction (500 characters)", () => {
  test("counts code points, trimming ASCII and ideographic spaces", () => {
    assert.equal(countChars("　大洋洲工商协会 　"), 7);
    assert.equal(zhIntroMetrics("大".repeat(500)).ok, true);
    assert.equal(zhIntroMetrics("大".repeat(501)).ok, false);
    assert.equal(zhIntroMetrics("").count, 0);
  });
});

describe("English introduction (500 words)", () => {
  test("counts whitespace-separated words", () => {
    assert.equal(countWords("  one two\n three  "), 3);
    assert.equal(enIntroMetrics("word ".repeat(500)).ok, true);
    assert.equal(enIntroMetrics("word ".repeat(501)).ok, false);
  });

  test("applies the 4000-character hard ceiling the RPC enforces", () => {
    const longWords = Array.from({ length: 400 }, () => "abcdefghijk").join(" ");
    assert.equal(countWords(longWords), 400);
    assert.equal(enIntroMetrics(longWords).ok, false);
  });

  test("accepts exactly 4000 characters and rejects 4001", () => {
    // 100 tokens of 39 letters + 99 separators = 3999 chars; pad to 4000.
    const atLimit = Array.from({ length: 100 }, () => "a".repeat(39)).join(" ") + "b";
    assert.equal(countChars(atLimit), 4000);
    assert.equal(enIntroMetrics(atLimit).ok, true);
    assert.equal(enIntroMetrics(atLimit + "c").ok, false);
  });

  test("treats ideographic spaces as word separators like the RPC", () => {
    assert.equal(countWords("one　two　three"), 3);
    assert.equal(countWords("　one　two　"), 2);
  });
});

describe("Metrics shape used by the form", () => {
  test("reports unit and limit so the counters can render them", () => {
    assert.deepEqual(zhIntroMetrics("你好"), {
      count: 2,
      limit: 500,
      unit: "chars",
      ok: true,
    });
    assert.deepEqual(enIntroMetrics("hello world"), {
      count: 2,
      limit: 500,
      unit: "words",
      ok: true,
    });
  });

  test("counts astral code points as single characters", () => {
    assert.equal(countChars("𠀀𠀁"), 2);
    assert.equal(zhIntroMetrics("𠀀".repeat(500)).ok, true);
  });
});
