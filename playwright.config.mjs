// Playwright 設定ファイル
// 目的: CI とローカルの両方で E2E テストを実行できるように設定する。
// - `webServer` によりビルド済みのアプリを `npm run preview` で立ち上げてからテストを実行する。
// - テストは `tests/e2e` ディレクトリに置く。

import { defineConfig, devices } from '@playwright/test';

// Playwright テスト設定
// ローカルのプレビューサーバーを起動するか、環境変数で指定された baseURL を使うかを切り替え
const envBase = process.env.PLAYWRIGHT_BASE_URL || '';
const baseURL = envBase && envBase.length > 0 ? envBase : 'http://127.0.0.1:5173';

const config = {
  // テストファイルの場所
  testDir: 'tests/e2e',

  // 各テストの最大許容時間（ms）
  timeout: 30_000,

  // expect() のタイムアウト
  expect: {
    timeout: 5000,
  },

  // 並列実行の設定（ここでは false にして順序依存のテストを避ける）
  fullyParallel: false,

  // レポーター設定: コンソールリスト + HTML レポートを出力
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],

  use: {
    // テストで使う baseURL（環境変数で上書き可能）
    baseURL,

    // CI 向けにヘッドレスで動かす設定
    headless: true,

    // ビューポートサイズ
    viewport: { width: 1280, height: 720 },

    // アクションごとの最大待ち時間
    actionTimeout: 10_000,

    // 開発用の自己署名証明書などを無視する場合に有効
    ignoreHTTPSErrors: true,
  },
};

// If baseURL is local (default), configure webServer to start preview.
if (!envBase) {
  config.webServer = {
    command: 'npm run preview -- --port 5173',
    port: 5173,
    reuseExistingServer: true,
    // サーバー起動に許す最大待機時間（ms）
    timeout: 120_000,
  };
}

export default defineConfig(config);
