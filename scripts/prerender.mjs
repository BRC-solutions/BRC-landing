import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function escapeJsonForScript(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function replaceOrInsertMeta(html, selector, tag) {
  const patterns = {
    description: /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    keywords: /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
    robots: /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    ogType: /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    ogTitle: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    ogDescription: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    ogUrl: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    ogImage: /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    twitterTitle: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    twitterDescription: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    twitterImage: /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
  };
  const pattern = patterns[selector];
  if (pattern?.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function applyRouteHead(template, { canonical, route, schema, seo }) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttribute(canonical)}" />`);
  html = replaceOrInsertMeta(html, "description", `<meta name="description" content="${escapeAttribute(seo.description)}" />`);
  html = replaceOrInsertMeta(html, "keywords", `<meta name="keywords" content="${escapeAttribute(seo.keywords)}" />`);
  html = replaceOrInsertMeta(
    html,
    "robots",
    `<meta name="robots" content="${route.page === "audit" ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
  );
  html = replaceOrInsertMeta(html, "ogType", `<meta property="og:type" content="${escapeAttribute(seo.type)}" />`);
  html = replaceOrInsertMeta(html, "ogTitle", `<meta property="og:title" content="${escapeAttribute(seo.title)}" />`);
  html = replaceOrInsertMeta(html, "ogDescription", `<meta property="og:description" content="${escapeAttribute(seo.description)}" />`);
  html = replaceOrInsertMeta(html, "ogUrl", `<meta property="og:url" content="${escapeAttribute(canonical)}" />`);
  html = replaceOrInsertMeta(html, "ogImage", `<meta property="og:image" content="${escapeAttribute(seo.image)}" />`);
  html = replaceOrInsertMeta(html, "twitterTitle", `<meta name="twitter:title" content="${escapeAttribute(seo.title)}" />`);
  html = replaceOrInsertMeta(html, "twitterDescription", `<meta name="twitter:description" content="${escapeAttribute(seo.description)}" />`);
  html = replaceOrInsertMeta(html, "twitterImage", `<meta name="twitter:image" content="${escapeAttribute(seo.image)}" />`);

  const jsonLd = `<script type="application/ld+json">${escapeJsonForScript(schema)}</script>`;
  if (/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i.test(html)) {
    html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i, jsonLd);
  } else {
    html = html.replace("</head>", `    ${jsonLd}\n  </head>`);
  }

  return html;
}

function outputPathForRoute(routePath) {
  const cleanPath = routePath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!cleanPath) return path.join(distDir, "index.html");
  return path.join(distDir, cleanPath, "index.html");
}

function injectRenderedApp(html, appHtml) {
  const rootStart = html.indexOf('<div id="root">');
  const bodyEnd = html.indexOf("</body>", rootStart);
  if (rootStart === -1 || bodyEnd === -1) {
    throw new Error("Could not find root container or body close in built HTML.");
  }
  const beforeRoot = html.slice(0, rootStart);
  const afterRoot = html.slice(bodyEnd);
  return `${beforeRoot}<div id="root">${appHtml}</div>\n  ${afterRoot}`;
}

async function writeRouteHtml(routePath, html) {
  const filePath = outputPathForRoute(routePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, html);
}

function sitemapPriority(route) {
  if (route.page === "home") return "1.0";
  if (route.page === "feature" || route.page === "migration") return "0.9";
  if (route.page === "industry" || route.slug === "pricing" || route.slug === "help") return "0.8";
  if (route.page === "content" && route.articleId) return "0.7";
  if (route.page === "contact") return "0.7";
  return "0.5";
}

function sitemapChangefreq(route) {
  if (route.page === "feature" || route.page === "industry" || route.page === "migration") return "weekly";
  if (route.page === "content" && route.articleId) return "weekly";
  if (route.slug === "pricing" || route.slug === "help") return "weekly";
  return "monthly";
}

async function writeSitemap(routes, routePath) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((route) => {
      const routeUrl = `https://brcapp.io${routePath(route) === "/" ? "/" : routePath(route)}`;
      return [
        "  <url>",
        `    <loc>${routeUrl}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <changefreq>${sitemapChangefreq(route)}</changefreq>`,
        `    <priority>${sitemapPriority(route)}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap);
}

const vite = await createServer({
  appType: "custom",
  customLogger: {
    error(message, options) {
      if (String(message).includes("WebSocket server error")) return;
      console.error(message, options?.error || "");
    },
    hasErrorLogged() {
      return false;
    },
    info() {},
    warn(message) {
      console.warn(message);
    },
    warnOnce(message) {
      console.warn(message);
    },
  },
  logLevel: "warn",
  root: rootDir,
  server: { hmr: false, middlewareMode: true },
});

try {
  const template = await fs.readFile(path.join(distDir, "index.html"), "utf8");
  const {
    default: App,
    buildStructuredData,
    getPrerenderRoutes,
    routePath,
    seoForRoute,
  } = await vite.ssrLoadModule("/src/App.jsx");
  const routes = getPrerenderRoutes();

  for (const route of routes) {
    const seo = seoForRoute(route);
    const canonical = `https://brcapp.io${seo.path === "/" ? "/" : seo.path}`;
    const schema = buildStructuredData(route, seo);
    const appHtml = renderToString(React.createElement(App, { initialRoute: route }));
    const routeHtml = injectRenderedApp(
      applyRouteHead(template, { canonical, route, schema, seo }),
      appHtml,
    );
    await writeRouteHtml(routePath(route), routeHtml);
  }
  await writeSitemap(routes, routePath);

  console.log(`Pre-rendered ${routes.length} landing routes.`);
} finally {
  await vite.close();
}
