import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { countWord } from "../src/lib/utils/count-word.ts";

describe("countWord (data-driven headings never contradict the rows)", () => {
  test("Chinese numerals up to ten, digits beyond", () => {
    assert.equal(countWord(6, "zh"), "六");
    assert.equal(countWord(7, "zh"), "七");
    assert.equal(countWord(10, "zh"), "十");
    assert.equal(countWord(12, "zh"), "12");
    assert.equal(countWord(0, "zh"), "零");
  });

  test("English number words up to ten, digits beyond", () => {
    assert.equal(countWord(6, "en"), "Six");
    assert.equal(countWord(3, "en"), "Three");
    assert.equal(countWord(11, "en"), "11");
  });
});
