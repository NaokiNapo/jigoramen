# Ver.6 changes

- Removed Yahoo and Foursquare completely.
- Removed Supabase Edge Function dependency.
- Added 30-brand Chain Prior master with four axes.
- Added alias-based chain matching from Google place display names.
- Added Bayesian-style virtual vote blending:
  - neutral 85 = 4 votes
  - matched Chain Prior = 6 votes
  - user feedback = N real votes
- Non-chain restaurants start at 85.
- User feedback gradually dominates the prior and can converge toward 70–100.
- Added Google rating/count as optional reference display only; never used in Jigo score.
- Added Ver.6 feedback aggregate schema.
- Feedback submission refreshes scores immediately.
