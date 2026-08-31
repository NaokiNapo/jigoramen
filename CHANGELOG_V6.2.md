# Ver.6.2

## Search coverage

- Replaced the single `Place.searchByText()` ramen query with a multi-path Google Places search.
- Stage 1: `Place.searchNearby()` for `ramen_restaurant`, ranked by both POPULARITY and DISTANCE, plus the primary text query.
- Stage 2: search synonymous text queries such as ラーメン / 中華そば / つけ麺 / 油そば / まぜそば (or style-specific variants).
- Stage 3: when any Google call reaches the 20-result ceiling, split the selected radius into smaller nearby-search cells and merge all results by Google Place ID.
- Apply the selected 500m / 1km / 1.5km / 3km radius again after merging, so search cells never broaden the user's final search range.
- Permanently closed places are removed.
- `営業中のみ` is evaluated after candidate collection from `currentOpeningHours` when available.

## Scoring

- Non-chain Google initial adjustment changed from max ±3 to **max ±2**.
- Chain Google adjustment remains max ±2 and Chain Prior remains dominant.
- Google adjustment still decays to zero at 5 user ratings.
- Jigo score remains displayed to one decimal place.

## Other

- Default search radius remains 500m.
- Search origin remains Current location / Hotel / Address.
- Supabase schema is unchanged from Ver.6.
- Updated `@types/google.maps` to 3.66.x for the current Places JavaScript API types.
