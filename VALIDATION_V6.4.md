# Ver.6.4 validation

- `src/utils/scoreColor.ts` を追加し、75〜95点を水色MAX→白→ピンクMAXへ連続補間し、範囲外は端色に固定。
- `ScoreBadge` と `MapPanel` が同じ色関数を使用していることを確認。
- 地図マーカーは button 要素で、マウス/タッチ/キーボード操作が可能。
- マーカークリック後の情報カードに46px以上の詳細リンクを配置。
- Google Maps 詳細URLは既存 `googleMapsDetailsUrl()` を再利用。
- Supabase schema と検索・スコア計算ロジックは変更なし。
