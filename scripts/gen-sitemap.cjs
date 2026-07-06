/**
 * gen-sitemap.cjs — write public/sitemap.xml from the app's routes + plant slugs.
 * Re-run after adding/removing plants:  node scripts/gen-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://ottormaastar.aulenor.com';
const LASTMOD = '2026-07-06'; // bump when content changes materially

const src = fs.readFileSync(path.join(__dirname, '../src/data/plants.ts'), 'utf8');
const slugs = [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

const staticRoutes = ['/', '/catalog', '/search', '/about', '/legal'];
const routes = [...staticRoutes, ...slugs.map((s) => `/plant/${s}`)];

const urls = routes
  .map(
    (r) =>
      `  <url>\n    <loc>${ORIGIN}${r}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <changefreq>monthly</changefreq>\n  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml);
console.log(`Wrote public/sitemap.xml with ${routes.length} URLs (${slugs.length} plants).`);
