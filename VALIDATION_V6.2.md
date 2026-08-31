# Validation — Ver.6.2

## Static checks completed

- `src/scoring/scoring.ts`
  - non-chain Google adjustment = max ±2
  - chain Google adjustment = max ±2
  - user-feedback decay still reaches 0% Google influence at 5 samples
  - score rounding remains one decimal place
- `src/App.tsx`
  - default radius = 500m
  - available radius values = 500m / 1km / 1.5km / 3km
  - UI non-chain initial range = 83.0–87.0
- `src/services/googleMaps.ts`
  - primary Nearby Search uses `ramen_restaurant`
  - both POPULARITY and DISTANCE ranking are queried
  - multiple text-query variants are merged
  - a 20-result response activates cell-based supplemental searches
  - candidates are de-duplicated by Place ID
  - exact distance filter is applied after merging
- TypeScript parser pass: no TS1xxx syntax/parser errors were detected with the globally available compiler.

## Build limitation in this environment

`npm install` could not complete because outbound npm dependency retrieval timed out in the execution environment. Therefore a dependency-backed `npm run typecheck` / `npm run build` was not claimed here. Run both on the Windows development machine after `npm install`.

## Runtime test to perform

1. Search from a point for which 一蘭 道頓堀店 is actually within the selected radius.
2. Start with 500m and `営業中のみ` OFF.
3. Confirm that multiple results beyond the former 20-result ceiling are returned in a dense district.
4. If the store is farther than 500m in straight-line distance, change to 1km; the exact-radius filter intentionally excludes it at 500m.
