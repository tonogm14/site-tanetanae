/**
 * Sitemap generator — runs at build time before Vite.
 * Reads all WordPress post sitemaps and rewrites URLs to the new site structure.
 *
 * Usage: node scripts/generate-sitemap.js
 * Output: public/sitemap.xml, public/robots.txt
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const SITE_URL = (process.env.SITE_URL || 'https://www.tanetanae.com').replace(/\/$/, '');
const WP_BASE  = (process.env.WP_BASE  || 'https://cms.tanetanae.com').replace(/\/$/, '');
const WP_API   = (process.env.WP_API_URL || `${WP_BASE}/wp-json/wp/v2`);

// Public categories in the new site
const CATEGORIES = [
  'sucesos', 'deportes', 'indigenas', 'trinidad-y-tobago',
  'guyana', 'videos', 'opinion', 'especiales',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 15000 }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

function extractLocs(xml) {
  const locs = [];
  const locRe = /<loc>([^<]+)<\/loc>/g;
  const modRe = /<lastmod>([^<]+)<\/lastmod>/g;
  let m, n;
  while ((m = locRe.exec(xml)) !== null) {
    const lastmodMatch = modRe.exec(xml);
    locs.push({ loc: m[1].trim(), lastmod: lastmodMatch?.[1]?.trim() || null });
  }
  return locs;
}

function slugFromUrl(url) {
  // e.g. https://www.tanetanae.com/post-slug/ → post-slug
  return url.replace(/\/$/, '').split('/').pop();
}

function xmlEntry(loc, lastmod, priority = '0.7') {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    `    <changefreq>weekly</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const today = new Date().toISOString().split('T')[0];
  const entries = [];

  // Homepage
  entries.push(xmlEntry(`${SITE_URL}/`, today, '1.0'));

  // Static pages
  entries.push(xmlEntry(`${SITE_URL}/buscar`, today, '0.5'));

  // Category pages
  for (const slug of CATEGORIES) {
    entries.push(xmlEntry(`${SITE_URL}/categoria/${slug}`, today, '0.8'));
  }

  // Posts — read all WordPress post sitemaps
  console.log('Fetching WordPress post sitemaps…');
  let postCount = 0;
  let sitemapIndex = 1;

  while (true) {
    const sitemapUrl = `${WP_BASE}/post-sitemap${sitemapIndex === 1 ? '' : sitemapIndex}.xml`;
    let xml;
    try {
      xml = await fetch(sitemapUrl);
    } catch {
      break;
    }

    if (!xml.includes('<loc>') || xml.includes('<sitemapindex')) break;

    const locs = extractLocs(xml);
    if (!locs.length) break;

    for (const { loc, lastmod } of locs) {
      if (!loc.startsWith(WP_BASE) && !loc.startsWith('https://tanetanae.com')) continue;
      const slug = slugFromUrl(loc);
      if (!slug) continue;
      entries.push(xmlEntry(`${SITE_URL}/${slug}`, lastmod, '0.7'));
      postCount++;
    }

    console.log(`  sitemap ${sitemapIndex}: ${locs.length} posts`);
    sitemapIndex++;

    // Safety: don't loop forever
    if (sitemapIndex > 30) break;
  }

  console.log(`Total posts indexed: ${postCount}`);

  // Write sitemap.xml
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
  ].join('\n');

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');
  console.log(`✓ public/sitemap.xml written (${entries.length} URLs)`);

  // Write robots.txt
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ].join('\n');

  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');
  console.log('✓ public/robots.txt written');
}

main().catch(err => {
  console.error('Sitemap generation failed:', err.message);
  // Don't fail the build — proceed without sitemap
  process.exit(0);
});
