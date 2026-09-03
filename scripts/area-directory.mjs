import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

export const SITE_ORIGIN = 'https://www.jigoramen.com'

export async function loadAreaDirectory(projectRoot = process.cwd()) {
  const regions = JSON.parse(await readFile(resolve(projectRoot, 'src/data/areaDirectory.json'), 'utf8'))
  const prefectures = regions.flatMap((region) => region.prefectures.map((prefecture) => ({ ...prefecture, regionName: region.region })))
  const areas = prefectures.flatMap((prefecture) => prefecture.areas.map((area) => resolveArea(prefecture, area)))
  validateDirectory(regions, prefectures, areas)
  return { regions, prefectures, areas }
}

export function directoryMetadata() {
  return { title: 'エリアから探す | 事後ラー', description: '全国の主要エリアから、今営業中のラーメン店を検索。地方、都道府県、エリアの順に選んで、その時に合う一杯を探せます。', canonical: `${SITE_ORIGIN}/area` }
}

export function prefectureMetadata(prefecture) {
  return {
    title: `${prefecture.shortName}の深夜ラーメン｜エリアから探す | 事後ラー`,
    description: `${prefecture.name}の対応エリアから、今営業中のラーメン店を探せます。距離やラーメンの種類、今の気分から、夜の一杯に合うエリアを選べます。`,
    canonical: `${SITE_ORIGIN}/area/${prefecture.slug}`,
    lead: `${prefecture.name}で事後ラーを探せる対応エリアを掲載しています。行きたい地域を選び、今営業中のラーメン店検索へ進めます。`,
  }
}

function resolveArea(prefecture, area) {
  return {
    ...area,
    regionName: prefecture.regionName,
    prefectureName: prefecture.name,
    prefectureShortName: prefecture.shortName,
    prefectureSlug: prefecture.slug,
    searchQuery: area.searchQuery ?? `${prefecture.name}${area.name}`,
    title: area.title ?? `${area.name}の深夜ラーメン｜今営業中の店を探す | 事後ラー`,
    description: area.description ?? `${area.name}周辺で今営業中のラーメン店を検索。距離やラーメンの種類、今の気分から、飲み会や外出後にその時に合う一杯を探せます。`,
    canonical: `${SITE_ORIGIN}/area/${area.slug}`,
    lead: area.lead ?? `飲み会や外出のあとに、${area.name}周辺で今営業中のラーメン店を探せます。現在地・距離・ラーメンの種類・気分などから、その時に合う一杯を検索できます。`,
    feature: area.feature ?? `${area.name}は${prefecture.name}にあるエリアです。夜の食事や飲み会、外出のあとにラーメンを探したいときは、現在地からの距離や営業状況、ラーメンの種類を見ながら候補を比べられます。時間帯によって営業状況が変わるため、来店前に最新情報をご確認ください。`,
  }
}

function validateDirectory(regions, prefectures, areas) {
  const regionNames = regions.map((region) => region.region)
  const prefectureSlugs = prefectures.map((prefecture) => prefecture.slug)
  const areaSlugs = areas.map((area) => area.slug)
  assertUnique(regionNames, '地方名')
  assertUnique(prefectureSlugs, '都道府県slug')
  assertUnique(areaSlugs, 'エリアslug')
  const collisions = prefectureSlugs.filter((slug) => areaSlugs.includes(slug))
  if (collisions.length) throw new Error(`都道府県とエリアのURLが重複しています: ${collisions.join(', ')}`)
}

function assertUnique(values, label) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
  if (duplicates.length) throw new Error(`${label}が重複しています: ${[...new Set(duplicates)].join(', ')}`)
}
