// Prerenders the home page and /about, /privacy, /terms, /contact into static HTML.
// Runs after `vite build` and prerender-area-pages.mjs (which reads the untouched dist/index.html).
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'

const projectRoot = process.cwd()
const distRoot = resolve(projectRoot, 'dist')
const ssrOutDir = resolve(projectRoot, 'dist-ssr')

await build({
  logLevel: 'warn',
  build: {
    ssr: 'src/prerender-entry.tsx',
    outDir: ssrOutDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
})

const entryFile = (await readdir(ssrOutDir)).find((name) => /^prerender-entry\.(m?js)$/.test(name))
if (!entryFile) throw new Error('SSR build output (prerender-entry.js) was not found')
const { renderHome, renderStaticPages } = await import(pathToFileURL(resolve(ssrOutDir, entryFile)).href)

const template = await readFile(resolve(distRoot, 'index.html'), 'utf8')

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Unable to find ${label} in Vite output`)
  return html.replace(pattern, () => replacement)
}

function replaceMeta(html, attribute, key, content) {
  return replaceRequired(html, new RegExp(`<meta\\s+${attribute}="${key}"[\\s\\S]*?\\/>`), `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`, `${attribute}="${key}"`)
}

function applyMetadata(html, metadata) {
  let output = replaceRequired(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`, 'title')
  output = replaceRequired(output, /<link\s+rel="canonical"[\s\S]*?\/>/, `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" />`, 'canonical')
  output = replaceMeta(output, 'name', 'description', metadata.description)
  output = replaceMeta(output, 'property', 'og:title', metadata.title)
  output = replaceMeta(output, 'property', 'og:description', metadata.description)
  output = replaceMeta(output, 'property', 'og:url', metadata.canonical)
  output = replaceMeta(output, 'name', 'twitter:title', metadata.title)
  return replaceMeta(output, 'name', 'twitter:description', metadata.description)
}

function injectRoot(html, body) {
  return replaceRequired(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, 'root element')
}

for (const page of renderStaticPages()) {
  const directory = resolve(distRoot, ...page.path.split('/').filter(Boolean))
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), injectRoot(applyMetadata(template, page.metadata), page.html), 'utf8')
}

// Home page last: it overwrites dist/index.html, which the other pages use as their template.
await writeFile(resolve(distRoot, 'index.html'), injectRoot(template, renderHome()), 'utf8')

await rm(ssrOutDir, { recursive: true, force: true })
console.log('Prerendered home, /about, /privacy, /terms, /contact')
