/**
 * Membership fee display. Dependency-free so it runs under `node --test`
 * (tests/fee.test.mjs).
 *
 * Confirmed format (2026-09-02): `A$480`, `A$1,980` — the "A$" prefix and a
 * comma thousands separator in both languages, never "AU$", "AUD $" or a
 * bare number. The per-year suffix comes from the message catalogue
 * (`membership.perYear`) and is appended by the page.
 */

export function groupThousands(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const digits = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return amount < 0 ? `-${digits}` : digits;
}

/** "A$1,980" for AUD (the only published currency); other ISO codes fall
 *  back to "<CODE> 1,980" rather than guessing a symbol. */
export function formatFeeAmount(
  amount: number,
  currency?: string | null,
): string {
  // The column is numeric(10,2) ≥ 0; anything else is a data error and must
  // fail the build loudly rather than render "A$NaN".
  if (!Number.isFinite(amount) || amount < 0)
    throw new RangeError(`formatFeeAmount: invalid amount ${String(amount)}`);
  const code = (currency ?? "").trim().toUpperCase() || "AUD";
  const grouped = groupThousands(amount);
  return code === "AUD" ? `A$${grouped}` : `${code} ${grouped}`;
}
