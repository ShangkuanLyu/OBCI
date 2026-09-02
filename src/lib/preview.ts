/**
 * Build-time review flags. All are NEXT_PUBLIC_* so they are inlined into
 * client bundles; reference them literally (never via a variable name) so
 * the bundler can constant-fold the branches.
 *
 * NEXT_PUBLIC_PREVIEW_DEPLOYMENT=1 — the isolated chamber-review deployment
 * (e.g. the OBCI-preview repository). Never set by the production workflow.
 * When active:
 *  - every page carries noindex/nofollow and robots.txt disallows all;
 *  - the site-wide review banner and module-level review notes render;
 *  - unapproved legal drafts render, labelled as internal review drafts;
 *  - content the chamber has not confirmed stays hidden (see lib/review.ts).
 *
 * NEXT_PUBLIC_DESIGN_FIXTURES=1 — renders the flag-gated design-review
 * fixtures for rows whose data migration has not been applied yet.
 *
 * NEXT_PUBLIC_INTERNAL_REVIEW=1 — local internal review build only
 * (scripts/build-static-preview.sh with PREVIEW=1). Additionally shows
 * unconfirmed contact details with an explicit "pending confirmation"
 * marker so the reviewer can check them. Never set by any deployed
 * workflow, including the public review preview.
 */
export function isPreviewDeployment(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_DEPLOYMENT === "1";
}

export function isInternalReview(): boolean {
  return process.env.NEXT_PUBLIC_INTERNAL_REVIEW === "1";
}

/**
 * Whether the public write paths (membership applications, enquiries,
 * newsletter sign-ups, document uploads) are disabled at the HTML level.
 * True for the review deployment AND for any fixture build, so a build
 * that shows provisional content can never accept real submissions.
 */
export function submissionsDisabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PREVIEW_DEPLOYMENT === "1" ||
    process.env.NEXT_PUBLIC_DESIGN_FIXTURES === "1" ||
    process.env.NEXT_PUBLIC_INTERNAL_REVIEW === "1"
  );
}
