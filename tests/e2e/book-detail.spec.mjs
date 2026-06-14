import { test, expect } from "@playwright/test";

test("BookInfoDetailPage: 書籍が見つからない場合の表示確認 (Firestore をモック、擬似ログイン注入)", async ({ page }) => {
  // 擬似ログインユーザーを注入
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test1@example.com",
      displayName: "testuser",
    })};`,
  });

  // Firestore をモックして安定化（空レスポンス）
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ documents: [] }),
    });
  });

  // identitytoolkit のダミー
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // 存在しない ID で詳細ページへ移動
  await page.goto("/mylibrary/detail/not-found-id");

  // ローディングを考慮して、書籍が見つからない旨のメッセージを待機して確認
  await page.waitForSelector("text=書籍が見つかりません", { timeout: 15_000 });
  await expect(page.getByText("書籍が見つかりません", { exact: true })).toBeVisible();

  // 編集・削除ボタンは表示されていないはず（該当書籍がないため）
  await expect(page.getByRole("button", { name: /編集/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /削除/ })).toHaveCount(0);
});
