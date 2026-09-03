import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { loadAreaDirectory, SITE_ORIGIN } from './area-directory.mjs'

const projectRoot = process.cwd()
const { prefectures, areas } = await loadAreaDirectory(projectRoot)
const paths = ['/', '/privacy', '/terms', '/contact', '/about', '/area', ...prefectures.map((prefecture) => `/area/${prefecture.slug}`), ...areas.map((area) => `/area/${area.slug}`)]
if (new Set(paths).size !== paths.length) throw new Error('sitemap URLが重複しています')
const urls = paths.map((path) => `  <url>\n    <loc>${SITE_ORIGIN}${path}</loc>\n  </url>`).join('\n')
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
await writeFile(resolve(projectRoot, 'public/sitemap.xml'), sitemap, 'utf8')
console.log(`Generated sitemap.xml (${paths.length} URLs)`)
