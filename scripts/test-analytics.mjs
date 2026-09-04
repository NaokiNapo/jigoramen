// Runs real component handlers with mocked React hooks, APIs and gtag; no network or database writes.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'

function loadModule(path, dependencies, window, dev = false) {
  const source = readFileSync(resolve(path), 'utf8').replaceAll('import.meta.env.DEV', String(dev))
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports, window, URLSearchParams, console,
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`)
      return dependencies[name]
    },
  }, { filename: path })
  return exports
}

const events = []
const browserWindow = {
  gtag: (...args) => events.push(JSON.parse(JSON.stringify(args))),
  location: { search: '' }, history: { state: null, replaceState() {} }, setTimeout() {},
}
const analytics = loadModule('src/utils/analytics.ts', {}, browserWindow)
assert.doesNotThrow(() => loadModule('src/utils/analytics.ts', {}, undefined).trackEvent('search', {}))
assert.doesNotThrow(() => loadModule('src/utils/analytics.ts', {}, {}).trackEvent('search', {}))
assert.doesNotThrow(() => loadModule('src/utils/analytics.ts', {}, { gtag() { throw Error('blocked') } }).trackEvent('search', {}))
analytics.trackEvent('shop_click', { place_id: 'test', google_rating: undefined, distance_meters: NaN })
assert.deepEqual(events.pop(), ['event', 'shop_click', { place_id: 'test' }])
loadModule('src/utils/analytics.ts', {}, browserWindow, true).trackEvent('view_change', { view: 'map', result_count: 1 })
assert.equal(events.pop()[2].debug_mode, true)

let states = [], cursor = 0, effects = []
const react = {
  useState(initial) {
    const index = cursor++
    if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial
    return [states[index], (next) => { states[index] = typeof next === 'function' ? next(states[index]) : next }]
  },
  useMemo(fn) { return fn() }, useEffect(fn) { effects.push(fn) },
}
const jsx = { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) }
function render(Component, props = {}) { cursor = 0; return Component(props) }
function reset() { states = []; effects = []; events.length = 0; browserWindow.location.search = '' }
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...nodes(tree.props?.children)]
}
function find(tree, predicate) { const node = nodes(tree).find(predicate); assert.ok(node, 'UI handler not found'); return node.props }
const byClass = (tree, name) => find(tree, (node) => node.props?.className === name)
const namedButton = (tree, text) => find(tree, (node) => node.type === 'button' && node.props.children === text)
function expectNames(names) { assert.deepEqual(events.map((event) => event[1]), names) }

const evaluation = { baseScore: 85, axes: { pair: 85, conversation: 85, comfort: 85, ease: 85 }, sampleCount: 2, confidence: 'low' }
const restaurant = { placeId: 'test-place', name: 'Test ramen', location: { lat: 35, lng: 139 }, distanceMeters: 100, googleRating: 4, evaluation }
const address = { placeId: 'test-origin', label: '東京都渋谷区', formattedAddress: '東京都渋谷区', location: { lat: 35, lng: 139 } }
let ramenResults = [restaurant], ramenError = false, feedbackError = false, statsError = false
const area = { name: '渋谷', slug: 'shibuya', searchQuery: '東京都渋谷区', prefectureName: '東京都', prefectureShortName: '東京', prefectureSlug: 'tokyo', regionName: '関東' }
const common = { react, 'react/jsx-runtime': jsx }
const App = loadModule('src/App.tsx', {
  ...common, './utils/analytics': analytics,
  './data/areaDirectory': { areaPagesBySlug: { shibuya: area } },
  './services/geolocation': { getCurrentLocation: async () => address.location },
  './services/googleMaps': {
    searchAddresses: async () => [address], searchHotels: async () => [],
    searchRamen: async () => { if (ramenError) throw Error('API failed'); return ramenResults },
  },
  './services/supabase': { hasSupabaseConfig: true, fetchFeedbackStats: async () => { if (statsError) throw Error('stats failed'); return new Map() } },
  './scoring/scoring': { evaluateRestaurant: () => evaluation, applyMood: (value) => value },
  './components/RestaurantCard': { RestaurantCard() {} }, './components/FeedbackModal': { FeedbackModal() {} }, './components/MapPanel': { MapPanel() {} },
}, browserWindow).default

reset()
render(App); let tree = render(App)
expectNames([]) // StrictMode-style repeated render cannot emit events.
await byClass(tree, 'search-button').onClick()
expectNames([]) // Missing origin.
await namedButton(tree, '現在地を取得').onClick()
tree = render(App)
await byClass(tree, 'search-button').onClick()
expectNames(['search', 'search_result'])
assert.deepEqual(events[0][2], { origin_type: 'current', ramen_type: 'ramen', radius_km: 0.5, open_now: true, mood: 'none' })
assert.equal(events[1][2].result_count, 1)
assert.equal('debug_mode' in events[0][2], false)
events.length = 0
tree = render(App)
namedButton(tree, '一覧').onClick(); expectNames([])
namedButton(tree, '地図').onClick(); expectNames(['view_change'])
assert.deepEqual(events[0][2], { view: 'map', result_count: 1 })
tree = render(App); namedButton(tree, '地図').onClick(); expectNames(['view_change'])
find(tree, (node) => node.props?.['aria-label'] === '一覧の並び替え').onChange({ target: { value: 'distance' } })
expectNames(['view_change', 'sort_change'])
assert.deepEqual(events[1][2], { sort_mode: 'distance', result_count: 1 })
tree = render(App); find(tree, (node) => node.props?.['aria-label'] === '一覧の並び替え').onChange({ target: { value: 'distance' } })
expectNames(['view_change', 'sort_change'])

events.length = 0; ramenResults = []; await byClass(tree, 'search-button').onClick()
expectNames(['search', 'search_result']); assert.equal(events[1][2].result_count, 0)
events.length = 0; ramenError = true; await byClass(tree, 'search-button').onClick(); expectNames(['search']); ramenError = false
events.length = 0; ramenResults = [restaurant]; statsError = true; await byClass(tree, 'search-button').onClick(); expectNames(['search']); statsError = false

reset(); browserWindow.location.search = '?area=shibuya'; render(App)
const cleanup = effects[0](); await new Promise((resolve) => setImmediate(resolve)); tree = render(App)
expectNames([]) // Area import itself never emits.
await byClass(tree, 'search-button').onClick(); expectNames(['search', 'search_result'])
assert.equal(events[0][2].area_name, '渋谷'); assert.equal(events[0][2].origin_type, 'address'); cleanup()

const AreaPage = loadModule('src/AreaPage.tsx', { ...common, './utils/analytics': analytics, './data/areaDirectory': { areaPages: [area] } }, browserWindow).default
reset(); tree = render(AreaPage, { area }); render(AreaPage, { area }); expectNames([])
byClass(tree, 'button button--primary area-cta').onClick(); expectNames(['area_cta_click'])
assert.deepEqual(events[0][2], { area_name: '渋谷', area_slug: 'shibuya', prefecture_name: '東京都', region_name: '関東' })

const Card = loadModule('src/components/RestaurantCard.tsx', {
  ...common, '../utils/analytics': analytics, '../scoring/scoring': { confidenceLabel: () => 'test' }, '../utils/distance': { formatDistance: () => '100m' },
  '../services/googleMaps': { googleMapsDetailsUrl: () => 'https://www.google.com/maps/' }, './ScoreBadge': { ScoreBadge() {} },
}, browserWindow).RestaurantCard
reset(); tree = render(Card, { restaurant, moodActive: false, onFeedback() {} })
byClass(tree, 'button button--primary').onClick(); expectNames(['shop_click'])
assert.deepEqual(events[0][2], { place_id: 'test-place', shop_name: 'Test ramen', jigo_score: 85, distance_meters: 100, google_rating: 4, sample_count: 2 })

const Modal = loadModule('src/components/FeedbackModal.tsx', {
  ...common, '../utils/analytics': analytics,
  '../services/supabase': { submitFeedback: async () => { if (feedbackError) throw Error('failed') } },
}, browserWindow).FeedbackModal
reset(); tree = render(Modal, { restaurant, onClose() {}, onSubmitted() {} })
await byClass(tree, 'button button--primary button--wide').onClick(); expectNames(['feedback_submit'])
assert.deepEqual(events[0][2], { place_id: 'test-place', pair_score: 3, conversation_score: 3, comfort_score: 3, ease_score: 3 })
events.length = 0; feedbackError = true; await byClass(tree, 'button button--primary button--wide').onClick(); expectNames([])
feedbackError = false; tree = render(Modal, { restaurant, onClose() {}, onSubmitted() { throw Error('refresh failed') } })
await byClass(tree, 'button button--primary button--wide').onClick(); expectNames(['feedback_submit']) // Save succeeded even if refresh fails.
console.log('PASS: all 7 events, counts, result-zero, failure branches, area import silence, parameter allowlists, missing/throwing gtag, production/dev debug mode. No external calls.')
