import { test, expect } from "@playwright/test";

test("MyLibraryPage: ヘッダと空状態の確認 (Firestore をモック、擬似ログイン注入)", async ({ page }) => {
  // テスト用の擬似ログインを注入して ProtectedRoute をバイパス
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test1@example.com",
      displayName: "testuser",
    })};`,
  });

  // Firestore をモックして安定化（空の documents を返す）
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ documents: [] }),
    });
  });

  // identitytoolkit も安全なダミーを返す
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // ページへ移動
  await page.goto("/mylibrary");

  // 見出しを待機して表示確認
  const heading = page.getByRole("heading", { name: /マイライブラリ/ });
  await heading.waitFor({ timeout: 10_000 });
  await expect(heading).toBeVisible();

  // ローディングが終わった後に表示されるトップの案内テキストを待機
  await page.waitForSelector("text=あなたの本棚には本がありません", { timeout: 10_000 });
  await expect(page.getByText("あなたの本棚には本がありません", { exact: true })).toBeVisible();

  // 本を追加リンクは複数箇所に存在するので先頭要素で確認して安定化
  await expect(page.getByRole("link", { name: "本を追加" }).first()).toBeVisible();
});
