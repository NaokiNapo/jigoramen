# Ver.6.1 変更点

- ユーザー評価が少ない店舗について、Google Mapsの星評価を初期補正として利用。
- 非チェーンはGoogle ★4.0=85を中心に、★3.5以下=80、★4.5以上=90へクリップ。
- Chain Prior対象店はChain Priorを主軸にし、Google補正は最大±2点に抑制。
- Google補正はユーザー評価件数に応じて線形減衰し、5件で0%。
- Google rating / userRatingCount / Google由来初期補正値はSupabaseへ保存しない。
- 事後ラー度、今夜の相性、4軸スコアの表示を整数化。
- 検索起点に「住所」を追加。Google Places Text Searchで候補を選択して周辺検索できる。
- Yahoo / Foursquareは引き続き不使用。
