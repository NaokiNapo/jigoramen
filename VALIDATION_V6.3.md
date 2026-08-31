# Validation — Ver.6.3

- TypeScript/TSX syntax: 13 source files checked with TypeScript transpileModule; 0 diagnostics.
- Internal relative imports: no missing targets found.
- UI text audit: removed requested Chain Prior / initial estimate / Google correction explanatory labels from `src/`.
- Default radius: 500m.
- Default open-now: true.
- Ramen all-option label: `すべて`.
- Map: selected radius is passed to MapPanel and `fitBounds` is calculated from the origin and radius.
- Non-chain Google correction remains bounded to ±2 and is not rounded until the final 0.1-point score.

Full `npm run typecheck` / `npm run build` could not be completed in the container because `npm install` timed out before dependencies were installed. Run them on the Windows development machine.
