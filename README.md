# 読書管理システム (Bookworm)

読書状況を一元管理するためのシステムです。
ステータス管理（未読・読書中・読了）やレビュー、タグ付けなどの機能を提供します。

## 🚀 機能一覧
- **ダッシュボード**: 読書状況を可視化したデータによる全体の把握
- **マイライブラリ**: 書籍情報の一覧、追加、編集、削除
- **読書記録**: 読書記録の保存（タイマー形式、手動入力）、過去の記録閲覧
- **統計・分析**: 月ごとの読書数やページ数の可視化（グラフ表示）
- **読書目標**: 月・年・日ごとの読書目標設定と達成状況
- **実績・チャレンジ**: 読書家レベル、読書チャレンジの達成実績の確認
- **コミュニティ**: 他ユーザーの書籍レビューを閲覧するタイムライン、全ユーザーの書籍ランキング
- **おすすめ**: AIによるレコメンド、行動要約と提案

## 🛠 使用技術
### Backend / Frontend
- **Framework**: React / Gin
- **Language**: JavaScript / Go
- **Database**: Firebase
- **Authentication**: Firebase Authentication

### Test / Tooling
- **Testing**: Vitest / Playwright
- **Lint/Format**: ESLint / Prettier

## 📦 セットアップ
1. リポジトリをクローン
   ```bash
   git clone [https://github.com/SeigoTakahashi/reading-support.git](https://github.com/SeigoTakahashi/reading-support.git)
   cd reading-support

2. 依存関係のインストール

    ```bash
    npm install
    ```
    環境変数の設定 .env.example をコピーして .env を作成し、必要なAPIキー等を設定してください。

3. 開発サーバーの起動

    ```bash
    npm run dev
    ```

4. テスト
    ```bash
    # ユニットテスト (Vitest)
    npm run test

    # E2Eテスト (Playwright)
    npm run test:e2e
    ```