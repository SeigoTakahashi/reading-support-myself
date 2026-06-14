import { test, expect } from "@playwright/test";

test("Dashboard: 安定表示 (テスト用ログインを注入し、Firestore をモック)", async ({
  page,
}) => {
  // テスト実行前に Playwright から擬似ログインユーザーを注入
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test1@example.com",
      displayName: "testuser",
    })};`,
  });

  // Firestore などの Google API 呼び出しをモックして、開発データに触れないようにする
  // 安定性重視のため、空のドキュメント配列など簡素な成功レスポンスを返す
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ documents: [] }),
    });
  });

  // 万が一 identitytoolkit などにアクセスされても安全なダミーを返す
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  // アプリを開く（baseURL は playwright.config で設定済み）
  await page.goto("/");

  // ProtectedRoute やローディングを考慮して、主要ヘッダが見えるまで待つ
  await page.waitForSelector("text=おかえりなさい、読書家さん！", {
    timeout: 20_000,
  });
  await expect(page.locator("text=おかえりなさい、読書家さん！")).toBeVisible();

  // 統計カードのラベルが表示されていることを確認（厳密一致で安定化）
  await expect(page.getByText("今月", { exact: true })).toBeVisible();
  await expect(page.getByText("進行中", { exact: true })).toBeVisible();
  await expect(page.getByText("達成率", { exact: true })).toBeVisible();
});
