# 事後ラー Web Ver.6.3 — Coverage Search + Chain Prior + User Feedback

## Ver.6.3のポイント

Ver.6.1系は Google Places の Text Search を1回だけ実行していたため、難波・道頓堀などラーメン店が密集する地域では Google の1回20件上限に当たり、半径内にある店舗でも候補から漏れることがありました。

Ver.6.3では店舗候補の**網羅性を優先**して、Google Placesを複数経路で検索します。

1. Nearby Search `ramen_restaurant` / POPULARITY
2. Nearby Search `ramen_restaurant` / DISTANCE
3. Text Search（主要キーワード）
4. 表記揺れ・カテゴリ補完用Text Search
5. いずれかの検索が20件上限に達した場合は、検索範囲を複数セルに分割してNearby Search
6. Google Place IDで重複除去
7. 選択した半径で最終的に厳密フィルタ
8. 事後ラー度を計算して順位付け

Googleの検索順位・距離は事後ラー度には加点しません。距離は検索条件と同点時の表示順にだけ使います。

## 検索範囲

- 500m（デフォルト）
- 1km
- 1.5km
- 3km

## 検索キーワード

「おまかせ」は以下を補完検索します。

- ラーメン
- 中華そば
- つけ麺
- 油そば
- まぜそば

ラーメン種類指定時も、例えば家系なら「家系ラーメン」「横浜家系ラーメン」、豚骨なら「豚骨ラーメン」「博多ラーメン」のように表記揺れを補完します。

## スコア

4軸:

- 二人で座りやすい 35%
- 会話を続けやすい 25%
- 二人で居やすい 25%
- 利用時の摩擦が少ない 15%

ユーザーの1〜5評価は70〜100へ変換し、事後ラー度・4軸・今夜の相性は小数点第一位まで表示します。

### Chain Prior

チェーン店:

`(85 × 4 + Chain Prior × 6 + ユーザー平均 × N) / (10 + N)`

非チェーン:

`(85 × 4 + ユーザー平均 × N) / (4 + N)`

### Google初期補正

Google★はユーザー評価が少ない期間の補助値です。

- Google ★4.0 → 中心
- Google ★3.5以下 / ★4.5以上で補正量をクリップ
- **非チェーン: 85から最大±2点**（★3.5以下→83、★4.0→85、★4.5以上→87）
- **Chain Prior対象店: Chain Priorを優先し最大±2点**
- ユーザー評価0件: Google補正100%
- 1件: 80%
- 2件: 60%
- 3件: 40%
- 4件: 20%
- 5件以上: 0%

Google★・口コミ件数・Google由来補正値はSupabaseへ保存しません。

> 本番公開前の注意: Google Maps Platformの現行規約にはGoogle Maps Contentを基に別コンテンツを作成することへの制限があります。Google★から事後ラー度を補正する機能はプロトタイプ検証用として扱い、本番商用利用前にGoogleへの確認または法務確認を行ってください。必要なら `VITE_USE_GOOGLE_RATING_INITIAL_ADJUSTMENT=false` で無効化できます。

## 検索起点

1. 現在地
2. ホテル名
3. 住所

## セットアップ

### 1. 展開

例:

```powershell
cd C:\dev\jigoramen-web-v6.2-coverage
```

### 2. `.env`

```env
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAP_ID=...
VITE_SHOW_GOOGLE_RATING=true
VITE_USE_GOOGLE_RATING_INITIAL_ADJUSTMENT=true
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Supabase

Ver.6の `jigo_user_feedback_v6` / `jigo_feedback_stats_v6` をそのまま使用します。Ver.6の `supabase/schema.sql` を実行済みならSQLの再実行は不要です。

### 4. 起動

```powershell
npm install
npm run typecheck
npm run build
npm run dev
```

Google APIキーのHTTP referrerには、実際にViteが使うポートを許可してください。

- `http://localhost:5173/*`
- `http://localhost:5174/*`

## APIコストについて

Ver.6.3は単発Text Searchより検索回数が増えます。通常は中央のNearby/Text検索から開始し、Google側の20件上限に達した密集地域でのみセル分割検索を追加します。プロトタイプでは網羅性を優先していますが、本番前には検索回数・Places SKU課金を計測して調整してください。

## Chain Prior

`src/data/chainPriors.ts` に30ブランドを収録しています。詳細は `CHAIN_PRIOR_MASTER.md` を参照してください。


## Ver.6.3 UI / behavior changes

- 検索範囲のデフォルト: 500m
- 「今営業中の店だけ」: デフォルトON
- ラーメン種類の「おまかせ」表記を「すべて」に変更
- 事後ラー度・4軸・地図ピンは小数点第一位まで表示
- Google初期補正はチェーン/非チェーンとも最大±2点。内部では連続値で計算し、最終表示のみ0.1点に丸める
- Chain Prior / 初期推定 / Google補正率などの技術的な説明を利用者向け画面から削除
- 店舗カードの補助情報は「ユーザーフィードバック件数」「信頼度」を中心に簡素化
- 地図表示は選択した500m / 1km / 1.5km / 3kmの検索半径全体が入るよう自動調整
- 小さな注記として、フィードバック増加で精度が上がり、データ不足時はGoogle Maps評価等を参考に暫定算出する旨を表示

## Ver.6.4 UI update

- 事後ラー度の背景色は、低スコア=水色、85付近=白、高スコア=ピンクの連続グラデーションです。
- 地図の点数マーカーをタップすると店舗情報カードが開き、大きな「Googleマップで詳細を見る」ボタンから詳細へ移動できます。


## Ver.6.5: 一覧の並び替え

検索結果上部の「並び替え」から、以下を選択できます。

- 事後ラー度（高い順）
- 距離（近い順）
- Googleマップ評価（高い順）

初期値は「事後ラー度（高い順）」です。Google評価が取得できない店舗は、Googleマップ評価順では末尾に表示します。
