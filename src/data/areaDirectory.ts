import directoryData from './areaDirectory.json'

const SITE_ORIGIN = 'https://www.jigoramen.com'

export type PageMetadata = {
  title: string
  description: string
  canonical: string
}

type AreaSource = {
  name: string
  slug: string
  searchQuery?: string
  title?: string
  description?: string
  lead?: string
  feature?: string
}

export type AreaPageConfig = AreaSource & PageMetadata & {
  searchQuery: string
  regionName: string
  prefectureName: string
  prefectureShortName: string
  prefectureSlug: string
  lead: string
  feature: string
}

export type PrefecturePageConfig = PageMetadata & {
  regionName: string
  name: string
  shortName: string
  slug: string
  lead: string
  areas: AreaPageConfig[]
}

export type AreaRegion = {
  region: string
  prefectures: PrefecturePageConfig[]
}

type DirectorySource = {
  region: string
  prefectures: Array<{
    name: string
    shortName: string
    slug: string
    areas: AreaSource[]
  }>
}

function resolveArea(
  regionName: string,
  prefecture: DirectorySource['prefectures'][number],
  area: AreaSource,
): AreaPageConfig {
  return {
    ...area,
    regionName,
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

export const areaDirectory: AreaRegion[] = (directoryData as DirectorySource[]).map((region) => ({
  region: region.region,
  prefectures: region.prefectures.map((prefecture) => {
    const areas = prefecture.areas.map((area) => resolveArea(region.region, prefecture, area))
    return {
      regionName: region.region,
      name: prefecture.name,
      shortName: prefecture.shortName,
      slug: prefecture.slug,
      title: `${prefecture.shortName}の深夜ラーメン｜エリアから探す | 事後ラー`,
      description: `${prefecture.name}の対応エリアから、今営業中のラーメン店を探せます。距離やラーメンの種類、今の気分から、夜の一杯に合うエリアを選べます。`,
      canonical: `${SITE_ORIGIN}/area/${prefecture.slug}`,
      lead: `${prefecture.name}で事後ラーを探せる対応エリアを掲載しています。行きたい地域を選び、今営業中のラーメン店検索へ進めます。`,
      areas,
    }
  }),
}))

export const prefecturePages = areaDirectory.flatMap((region) => region.prefectures)
export const areaPages = prefecturePages.flatMap((prefecture) => prefecture.areas)

export const prefecturePagesByPath = Object.fromEntries(
  prefecturePages.map((prefecture) => [`/area/${prefecture.slug}`, prefecture]),
) as Record<string, PrefecturePageConfig>

export const areaPagesByPath = Object.fromEntries(
  areaPages.map((area) => [`/area/${area.slug}`, area]),
) as Record<string, AreaPageConfig>

export const areaPagesBySlug = Object.fromEntries(
  areaPages.map((area) => [area.slug, area]),
) as Record<string, AreaPageConfig>

export const areaDirectoryMetadata: PageMetadata = {
  title: 'エリアから探す | 事後ラー',
  description: '全国の主要エリアから、今営業中のラーメン店を検索。地方、都道府県、エリアの順に選んで、その時に合う一杯を探せます。',
  canonical: `${SITE_ORIGIN}/area`,
}
