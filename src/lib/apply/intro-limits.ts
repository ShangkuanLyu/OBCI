/**
 * Company-introduction limits for the membership application, mirrored
 * 1:1 by the submit_membership_application_v2 RPC:
 *  - Chinese introduction: at most 500 characters (code points);
 *  - English introduction: at most 500 words (whitespace-separated
 *    tokens), with a hard ceiling of 4000 characters.
 * Dependency-free so it runs under `node --test`.
 */

export const ZH_INTRO_MAX_CHARS = 500;
export const EN_INTRO_MAX_WORDS = 500;
export const EN_INTRO_MAX_CHARS = 4000;

export type IntroMetrics = {
  count: number;
  limit: number;
  unit: "chars" | "words";
  ok: boolean;
};

/** Trim the same character set on both sides (ASCII + ideographic space). */
export function trimIntro(text: string): string {
  return text.replace(/^[\s　]+|[\s　]+$/g, "");
}

export function countChars(text: string): number {
  return [...trimIntro(text)].length;
}

export function countWords(text: string): number {
  const trimmed = trimIntro(text);
  return trimmed === "" ? 0 : trimmed.split(/[\s　]+/).length;
}

export function zhIntroMetrics(text: string): IntroMetrics {
  const count = countChars(text);
  return {
    count,
    limit: ZH_INTRO_MAX_CHARS,
    unit: "chars",
    ok: count <= ZH_INTRO_MAX_CHARS,
  };
}

export function enIntroMetrics(text: string): IntroMetrics {
  const count = countWords(text);
  return {
    count,
    limit: EN_INTRO_MAX_WORDS,
    unit: "words",
    ok: count <= EN_INTRO_MAX_WORDS && countChars(text) <= EN_INTRO_MAX_CHARS,
  };
}
