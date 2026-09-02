/**
 * Deployment base path for hand-built URLs. next.config.ts applies
 * `basePath` only to the static export (STATIC_EXPORT=1 — GitHub Pages
 * serves the site under /OBCI); a Node host serves from the root even if
 * NEXT_PUBLIC_BASE_PATH happens to be set. STATIC_EXPORT is not a
 * NEXT_PUBLIC_ variable, so this is server/build-time only: a client
 * component would see "" and mismatch the server markup.
 */
export function basePath(): string {
  return process.env.STATIC_EXPORT === "1"
    ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "")
    : "";
}

/**
 * Prefix a /public asset path with the deployment base path.
 * Needed because next/image does not apply basePath to unoptimized
 * images in static export.
 */
export function assetPath(path: string): string {
  return `${basePath()}${path}`;
}
