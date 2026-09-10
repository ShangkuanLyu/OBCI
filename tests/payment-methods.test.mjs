// Runs with `npm test` (node --test). The payment-intent value set of the
// membership application (src/lib/utils/payment-methods.mjs) must match
// the list validated by submit_membership_application_v2 and the radio
// labels must exist in both message catalogues.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PAYMENT_METHODS,
  isPaymentMethod,
  paymentMethodLabel,
} from "../src/lib/utils/payment-methods.mjs";

const root = new URL("../", import.meta.url);
const read = (rel) => readFile(new URL(rel, root), "utf8");

describe("payment methods", () => {
  test("the three manual methods, in form order", () => {
    assert.deepEqual([...PAYMENT_METHODS], ["bank_transfer", "cheque", "credit_card"]);
  });

  test("isPaymentMethod accepts only the stored values", () => {
    for (const value of PAYMENT_METHODS) assert.equal(isPaymentMethod(value), true);
    for (const value of ["", "card", "BANK_TRANSFER", null, undefined, 1])
      assert.equal(isPaymentMethod(value), false);
  });

  test("admin labels per locale; unknown or missing → em dash", () => {
    assert.equal(paymentMethodLabel("bank_transfer", "zh"), "银行转账");
    assert.equal(paymentMethodLabel("bank_transfer", "en"), "Bank transfer");
    assert.equal(paymentMethodLabel("cheque", "zh"), "支票");
    assert.equal(paymentMethodLabel("cheque", "en"), "Cheque");
    assert.match(paymentMethodLabel("credit_card", "zh"), /^信用卡/);
    assert.match(paymentMethodLabel("credit_card", "en"), /^Credit card/);
    assert.equal(paymentMethodLabel(null, "zh"), "—");
    assert.equal(paymentMethodLabel(undefined, "en"), "—");
    assert.equal(paymentMethodLabel("paypal", "en"), "—");
  });

  test("the v2 RPC validates exactly this list", async () => {
    const sql = await read("supabase/migrations/20260902120000_application_form_v2.sql");
    const quoted = PAYMENT_METHODS.map((value) => `'${value}'`).join(", ");
    assert.ok(sql.includes(`p_payment_method not in (${quoted})`), "RPC value list");
    assert.ok(sql.includes("p_payment_method text default null"), "RPC parameter");
    assert.ok(sql.includes("raise exception 'invalid payment method'"), "RPC error text");
    assert.ok(sql.includes("raise exception 'company address required'"));
    assert.ok(sql.includes("raise exception 'company phone required'"));
  });

  test("radio labels exist in both catalogues", async () => {
    for (const locale of ["zh", "en"]) {
      const { apply } = JSON.parse(await read(`messages/${locale}.json`));
      for (const key of [
        "paymentMethod",
        "paymentMethodBankTransfer",
        "paymentMethodCheque",
        "paymentMethodCreditCard",
        "errorPaymentMethod",
        "errorCompanyAddressRequired",
        "errorCompanyPhoneRequired",
      ])
        assert.equal(typeof apply[key], "string", `${locale}: apply.${key}`);
    }
  });
});
