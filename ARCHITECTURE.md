# Architecture — Ver.6.3

```text
Browser (React / Vite)
  ├─ Google Maps JavaScript API
  │    ├─ current location map
  │    ├─ hotel / address text search
  │    └─ coverage-oriented ramen discovery
  │         ├─ Nearby: ramen_restaurant / POPULARITY
  │         ├─ Nearby: ramen_restaurant / DISTANCE
  │         ├─ Text query variants
  │         └─ adaptive cell searches when a 20-result ceiling is hit
  │
  ├─ Place ID de-duplication
  ├─ exact radius filter (500m / 1km / 1.5km / 3km)
  ├─ open-now filter (default ON)
  ├─ Chain Prior matching
  ├─ transient Google-rating initial adjustment
  └─ Jigo score ranking

Supabase
  ├─ jigo_user_feedback_v6
  └─ jigo_feedback_stats_v6
```

## Key rules

- Distance never changes the Jigo score.
- Google rating is only a transient initial adjustment and is not persisted.
- Google Place ID is the linkage key.
- Chain Prior is 4-axis and uses 6 virtual votes in addition to the neutral 85 × 4 prior.
- Non-chain stores use neutral 85 × 4 prior.
- Google adjustment is max ±2 for both chain and non-chain stores and decays to zero at 5 user ratings.
- User-facing Jigo scores are shown to one decimal place.
- The map automatically fits the selected search radius (500m / 1km / 1.5km / 3km).
- Technical prior/correction details are kept out of the consumer-facing UI.
