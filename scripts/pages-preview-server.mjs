// GitHub Pages behaviour emulator for the static export produced by
// scripts/build-static-preview.sh. Serves the staged directory under the
// base path:
//  * directory URLs serve their index.html;
//  * URLs missing the trailing slash 301-redirect to the slashed form
//    (matching Pages' directory handling);
//  * unknown paths serve 404.html with status 404;
//  * / redirects into the base path (the real host 404s there; locally we
//    redirect for convenience).
//
// Configuration (env): PREVIEW_ROOT (staged dir), PREVIEW_BASE (default
// /OBCI), PREVIEW_PORT (default 4173).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { tmpdir } from "node:os";

const ROOT = process.env.PREVIEW_ROOT ?? join(tmpdir(), "obai-preview-site");
const BASE = process.env.PREVIEW_BASE ?? "/OBCI";
const PORT = Number(process.env.PREVIEW_PORT ?? 4173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
};

async function send(res, status, filePath) {
  try {
    const body = await readFile(filePath);
    res.writeHead(status, {
      "content-type": MIME[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

async function notFound(res) {
  if (await send(res, 404, join(ROOT, "404.html"))) return;
  res.writeHead(404, { "content-type": "text/plain" });
  res.end("404");
}

createServer(async (req, res) => {
  // GitHub Pages only serves GET/HEAD; a POST (e.g. a form submitted with
  // JavaScript disabled) gets 405, never a query string full of data.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    return res.end();
  }
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return notFound(res);
  }

  if (pathname === "/" || pathname === "") {
    res.writeHead(302, { location: `${BASE}/` });
    return res.end();
  }
  if (!pathname.startsWith(BASE + "/") && pathname !== BASE) {
    return notFound(res);
  }
  if (pathname === BASE) {
    res.writeHead(301, { location: `${BASE}/` });
    return res.end();
  }

  let rel = normalize(pathname.slice(BASE.length)).replace(/^\/+/, "");
  if (rel.includes("..")) return notFound(res);
  if (rel === "") rel = "index.html";

  const full = join(ROOT, rel);
  try {
    const info = await stat(full);
    if (info.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, { location: pathname + "/" + url.search });
        return res.end();
      }
      if (await send(res, 200, join(full, "index.html"))) return;
      return notFound(res);
    }
    if (await send(res, 200, full)) return;
    return notFound(res);
  } catch {
    if (await send(res, 200, full + ".html")) return;
    if (await send(res, 200, join(full, "index.html"))) return;
    return notFound(res);
  }
}).listen(PORT, () => {
  console.log(
    `GitHub Pages preview: http://localhost:${PORT}${BASE}/zh/ (and /en/) from ${ROOT}`,
  );
});
