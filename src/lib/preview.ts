/**
 * Preview-deployment flag (NEXT_PUBLIC_PREVIEW_DEPLOYMENT=1).
 *
 * Set only by the isolated review deployment (e.g. the OBCI-preview
 * repository) — never by the production workflow. When active:
 *  - every page carries noindex/nofollow and robots.txt disallows all;
 *  - every form that would write to the production database intercepts
 *    submission client-side and shows a preview notice instead
 *    (applications, contact enquiries, newsletter sign-ups, uploads).
 */
export function isPreviewDeployment(): boolean {
  return process.env.NEXT_PUBLIC_PREVIEW_DEPLOYMENT === "1";
}
