import areaPageData from './areaPages.json'

export type AreaPageConfig = {
  slug: string
  name: string
  title: string
  description: string
  canonical: string
  lead: string
  feature: string
}

export const areaPages: AreaPageConfig[] = areaPageData

export const areaPagesByPath = Object.fromEntries(
  areaPages.map((area) => [`/area/${area.slug}`, area]),
) as Record<string, AreaPageConfig>
