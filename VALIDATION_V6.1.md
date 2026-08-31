# Ver.6.1 Validation

## Static checks
- TS/TSX syntax: TypeScript transpileModuleで確認
- Internal relative imports: 全て解決
- Runtime Foursquare/Yahoo references: なし
- Supabase schema: Ver.6を継続利用（変更なし）

## Score behavior
Google initial target:
- ★3.5以下 -> 80
- ★3.8 -> 83
- ★4.0 -> 85
- ★4.2 -> 87
- ★4.5以上 -> 90

Google correction decay:
- User 0 reviews -> 100%
- 1 -> 80%
- 2 -> 60%
- 3 -> 40%
- 4 -> 20%
- 5+ -> 0%

Non-chain example, Google ★4.5:
- 0 reviews -> 90
- 1 -> 89相当（ユーザー平均の影響は別途加算）
- 2 -> 88相当
- 3 -> 87相当
- 4 -> 86相当
- 5+ -> Google補正0

## Limitations of this validation environment
`npm install`はネットワーク待ちでタイムアウトしたため、依存関係込みの `npm run typecheck` / `npm run build` はローカルWindowsで実行してください。
