# Vercel production deploy

This package already contains `.env.production` with the browser-public Vite variables required by the app.

Recommended deployment:
1. Push this folder to GitHub.
2. In Vercel, Add New > Project > Import the repository.
3. Framework Preset: Vite.
4. Build Command: npm run build
5. Output Directory: dist
6. Deploy.
7. Add the final `https://<project>.vercel.app/*` domain to the Google Maps API key HTTP referrer allowlist.

Production defaults:
- VITE_SHOW_GOOGLE_RATING=true
- VITE_USE_GOOGLE_RATING_INITIAL_ADJUSTMENT=true
