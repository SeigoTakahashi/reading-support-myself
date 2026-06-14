import { test, expect } from "@playwright/test";

test("NotFoundPage: 404 表示とホームへの遷移確認", async ({ page }) => {
  // テスト用の擬似ログインを注入して認証関連のリダイレクトを回避
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test1@example.com",
      displayName: "testuser",
    })};`,
  });

  // Firebase や Google API 呼び出しをモックして開発データに触れない
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ documents: [] }),
    });
  });
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // 存在しないパスへ遷移
  await page.goto("/this-route-does-not-exist-xyz");

  // 404 ページのヘッダと説明が表示されることを確認
  // 一意に取得するため先頭のマッチを待機し、タイムアウトを延長
  const fourOhFour = page.locator("text=404").first();
  await fourOhFour.waitFor({ timeout: 10_000 });
  await expect(fourOhFour).toBeVisible();
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible();
  await expect(page.getByText("すみません、探しているページは見つかりませんでした。", { exact: true })).toBeVisible();

  // ホームへ戻るボタンをクリックするとルートに戻り、ダッシュボードの挨拶が見える
  const homeBtn = page.getByRole("button", { name: "ホームへ戻る" });
  await expect(homeBtn).toBeVisible();
  await homeBtn.click();

  // 戻った先のトップページの主要ヘッダが表示されるまで待つ
  await page.waitForSelector("text=おかえりなさい、読書家さん！", { timeout: 10_000 });
  await expect(page.locator("text=おかえりなさい、読書家さん！")).toBeVisible();
});
