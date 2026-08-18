/**
 * Prefix a /public asset path with the deployment base path.
 * Needed because next/image does not apply basePath to unoptimized
 * images in static export (GitHub Pages serves the site under /OBCI).
 * NEXT_PUBLIC_BASE_PATH is inlined at build time; empty for dev/Vercel.
 */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
