// Payment methods an applicant can declare on the membership application
// (membership_applications.payment_method). There is no online payment:
// the fee is settled manually after approval (owner decision D7,
// 2026-09-10) — bank transfer, cheque, or credit card via the secretariat.
// The value set is mirrored 1:1 by submit_membership_application_v2
// (supabase/migrations/20260902120000_application_form_v2.sql).
// No React and no DOM, so it runs under `node --test`
// (tests/payment-methods.test.mjs).

/** @typedef {"bank_transfer" | "cheque" | "credit_card"} PaymentMethod */

/** Accepted values, in the order the form and the admin views list them. */
export const PAYMENT_METHODS = /** @type {const} */ ([
  "bank_transfer",
  "cheque",
  "credit_card",
]);

/** Admin labels (the admin keeps the inline zh/en pattern). */
const ADMIN_LABELS = /** @type {Record<PaymentMethod, { zh: string; en: string }>} */ ({
  bank_transfer: { zh: "银行转账", en: "Bank transfer" },
  cheque: { zh: "支票", en: "Cheque" },
  credit_card: { zh: "信用卡（联系秘书处）", en: "Credit card (via the secretariat)" },
});

/**
 * @param {unknown} value
 * @returns {value is PaymentMethod}
 */
export function isPaymentMethod(value) {
  return (
    typeof value === "string" &&
    PAYMENT_METHODS.includes(/** @type {PaymentMethod} */ (value))
  );
}

/**
 * Admin display label of a stored value; "—" for null / unknown values
 * (rows submitted before the field existed, or hand-edited data).
 * @param {string | null | undefined} value
 * @param {"zh" | "en" | string} locale
 * @returns {string}
 */
export function paymentMethodLabel(value, locale) {
  if (!isPaymentMethod(value)) return "—";
  const label = ADMIN_LABELS[value];
  return locale === "zh" ? label.zh : label.en;
}
