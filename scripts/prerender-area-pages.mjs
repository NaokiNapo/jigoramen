import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const projectRoot = process.cwd()
const distRoot = resolve(projectRoot, 'dist')
const template = await readFile(resolve(distRoot, 'index.html'), 'utf8')
const areas = JSON.parse(
  await readFile(resolve(projectRoot, 'src/data/areaPages.json'), 'utf8'),
)

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Unable to find ${label} in Vite output`)
  }
  return html.replace(pattern, replacement)
}

function replaceMeta(html, attribute, key, content) {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${key}"[\\s\\S]*?\\/>`,
  )
  return replaceRequired(
    html,
    pattern,
    `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`,
    `${attribute}="${key}"`,
  )
}

function renderBody(area) {
  const otherAreas = areas.filter((candidate) => candidate.slug !== area.slug)
  const otherLinks = otherAreas
    .map((candidate) => `
              <a href="/area/${candidate.slug}">
                <span>${escapeHtml(candidate.name)}</span>
                <small>今営業中のラーメン店を探す →</small>
              </a>`)
    .join('')

  return `<div class="area-shell">
      <header class="area-hero">
        <a class="area-back-link" href="/">← 事後ラーに戻る</a>
        <span class="eyebrow">AREA GUIDE</span>
        <h1>${escapeHtml(area.name)}で<em>今営業中</em>のラーメン店を探す</h1>
        <p>${escapeHtml(area.lead)}</p>
        <a class="button button--primary area-cta" href="/">${escapeHtml(area.name)}でラーメンを探す</a>
      </header>
      <main class="area-content">
        <section class="panel area-feature">
          <div class="section-heading">
            <span>01</span>
            <div>
              <h2>${escapeHtml(area.name)}で深夜ラーメンを探す</h2>
              <p>${escapeHtml(area.name)}周辺の特徴</p>
            </div>
          </div>
          <p>${escapeHtml(area.feature)}</p>
          <p class="area-note">営業時間や営業状況は変わる場合があります。来店前に店舗の最新情報をご確認ください。</p>
        </section>
        <section class="panel area-other">
          <div class="section-heading">
            <span>02</span>
            <div>
              <h2>ほかのエリアから探す</h2>
              <p>大阪の夜に合わせてエリアを選べます。</p>
            </div>
          </div>
          <nav class="area-link-grid" aria-label="ほかのエリア">${otherLinks}
          </nav>
        </section>
      </main>
      <footer class="area-footer">
        <a href="/">事後ラーの検索画面へ</a>
      </footer>
    </div>`
}

for (const area of areas) {
  let html = template
  html = replaceRequired(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(area.title)}</title>`,
    'title',
  )
  html = replaceRequired(
    html,
    /<link\s+rel="canonical"[\s\S]*?\/>/,
    `<link rel="canonical" href="${escapeHtml(area.canonical)}" />`,
    'canonical',
  )
  html = replaceMeta(html, 'name', 'description', area.description)
  html = replaceMeta(html, 'property', 'og:title', area.title)
  html = replaceMeta(html, 'property', 'og:description', area.description)
  html = replaceMeta(html, 'property', 'og:url', area.canonical)
  html = replaceMeta(html, 'name', 'twitter:title', area.title)
  html = replaceMeta(html, 'name', 'twitter:description', area.description)
  html = replaceRequired(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${renderBody(area)}</div>`,
    'root element',
  )

  const outputDirectory = resolve(distRoot, 'area', area.slug)
  await mkdir(outputDirectory, { recursive: true })
  await writeFile(resolve(outputDirectory, 'index.html'), html, 'utf8')
  console.log(`Prerendered /area/${area.slug}`)
}
