import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { directoryMetadata, loadAreaDirectory, prefectureMetadata } from './area-directory.mjs'

const projectRoot = process.cwd()
const distRoot = resolve(projectRoot, 'dist')
const template = await readFile(resolve(distRoot, 'index.html'), 'utf8')
const { regions, prefectures, areas } = await loadAreaDirectory(projectRoot)

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Unable to find ${label} in Vite output`)
  return html.replace(pattern, replacement)
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

function renderDirectoryBody() {
  const regionLinks = regions.map((region, index) => `<a href="#region-${index + 1}">${escapeHtml(region.region)}</a>`).join('')
  const regionSections = regions.map((region, index) => {
    const cards = region.prefectures.map((prefecture) => `<a href="/area/${prefecture.slug}"><strong>${escapeHtml(prefecture.name)}</strong><span>${escapeHtml(prefecture.areas.map((area) => area.name).join('・'))}</span><small>エリアを選ぶ →</small></a>`).join('')
    return `<section class="panel directory-region" id="region-${index + 1}"><div class="section-heading"><span>02</span><div><h2>${escapeHtml(region.region)}</h2><p>都道府県を選ぶ</p></div></div><div class="prefecture-card-grid">${cards}</div></section>`
  }).join('')
  return `<div class="area-shell directory-shell"><header class="area-hero directory-hero"><a class="area-back-link" href="/">← ホームに戻る</a><span class="eyebrow">AREA</span><h1>エリアから<em>探す</em></h1><p>全国の主要エリアから、今営業中のラーメン店を探せます。地方、都道府県、エリアの順に選んでください。</p><ol class="directory-flow" aria-label="エリア選択の流れ"><li><span>STEP 1</span>地方を選ぶ</li><li><span>STEP 2</span>都道府県を選ぶ</li><li><span>STEP 3</span>エリアを選ぶ</li></ol></header><main class="area-content directory-content"><section class="panel directory-step"><div class="section-heading"><span>01</span><div><h2>地方を選ぶ</h2><p>探したい地方へ移動します。</p></div></div><nav class="directory-region-nav" aria-label="地方を選ぶ">${regionLinks}</nav></section>${regionSections}</main><footer class="area-footer"><a href="/">事後ラーの検索画面へ</a></footer></div>`
}

function renderPrefectureBody(prefecture) {
  const metadata = prefectureMetadata(prefecture)
  const links = prefecture.areas.map((area) => `<a href="/area/${area.slug}"><span>${escapeHtml(area.name)}</span><small>今営業中のラーメン店を探す →</small></a>`).join('')
  return `<div class="area-shell prefecture-shell"><header class="area-hero"><a class="area-back-link" href="/">← ホームに戻る</a><span class="eyebrow">AREA / ${escapeHtml(prefecture.regionName)}</span><h1>${escapeHtml(prefecture.shortName)}で<em>深夜ラーメン</em>のエリアを探す</h1><p>${escapeHtml(metadata.lead)}</p></header><main class="area-content"><section class="panel area-other prefecture-areas"><div class="section-heading"><span>03</span><div><h2>${escapeHtml(prefecture.name)}の対応エリア</h2><p>エリアを選んで検索へ進みます。</p></div></div><nav class="area-link-grid" aria-label="${escapeHtml(prefecture.name)}のエリア">${links}</nav></section></main><footer class="area-footer"><a href="/area">全国のエリア一覧へ</a></footer></div>`
}

function renderAreaBody(area) {
  const otherAreas = areas.filter((candidate) => candidate.prefectureSlug === area.prefectureSlug && candidate.slug !== area.slug)
  const links = otherAreas.map((candidate) => `<a href="/area/${candidate.slug}"><span>${escapeHtml(candidate.name)}</span><small>今営業中のラーメン店を探す →</small></a>`).join('')
  return `<div class="area-shell"><header class="area-hero"><a class="area-back-link" href="/">← ホームに戻る</a><span class="eyebrow">AREA GUIDE</span><h1>${escapeHtml(area.name)}で<em>今営業中</em>のラーメン店を探す</h1><p>${escapeHtml(area.lead)}</p><a class="button button--primary area-cta" href="/?area=${encodeURIComponent(area.slug)}">${escapeHtml(area.name)}でおすすめを検索</a></header><main class="area-content"><section class="panel area-feature"><div class="section-heading"><span>01</span><div><h2>${escapeHtml(area.name)}で深夜ラーメンを探す</h2><p>${escapeHtml(area.name)}周辺の特徴</p></div></div><p>${escapeHtml(area.feature)}</p><p class="area-note">営業時間や営業状況は変わる場合があります。来店前に店舗の最新情報をご確認ください。</p></section><section class="panel area-other"><div class="section-heading"><span>02</span><div><h2>ほかのエリアから探す</h2><p>${escapeHtml(area.prefectureName)}の対応エリアから選べます。</p></div></div><nav class="area-link-grid" aria-label="ほかのエリア">${links}</nav></section></main><footer class="area-footer"><a href="/area/${area.prefectureSlug}">${escapeHtml(area.prefectureName)}のエリア一覧へ</a><a href="/">事後ラーの検索画面へ</a></footer></div>`
}

async function writePage(slug, metadata, body) {
  let html = applyMetadata(template, metadata)
  html = replaceRequired(html, /<div id="root"><\/div>/, `<div id="root">${body}</div>`, 'root element')
  const directory = resolve(distRoot, 'area', ...slug.split('/').filter(Boolean))
  await mkdir(directory, { recursive: true })
  await writeFile(resolve(directory, 'index.html'), html, 'utf8')
}

await writePage('', directoryMetadata(), renderDirectoryBody())
for (const prefecture of prefectures) await writePage(prefecture.slug, prefectureMetadata(prefecture), renderPrefectureBody(prefecture))
for (const area of areas) await writePage(area.slug, area, renderAreaBody(area))
console.log(`Prerendered 1 directory, ${prefectures.length} prefectures, and ${areas.length} areas`)
