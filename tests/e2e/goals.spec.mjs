import { test, expect } from "@playwright/test";

test("GoalsPage: 安定表示と主要UI確認 (Firestore をモック、擬似ログイン注入)", async ({
  page,
}) => {
  // テスト用の擬似ログインを注入して ProtectedRoute をバイパス
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
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({}),
    });
  });

  // ページへ移動
  await page.goto("/goals");

  // メイン見出しを待機
  const mainHeading = page.getByRole("heading", { name: /読書目標/ });
  await mainHeading.waitFor({ timeout: 10_000 });
  await expect(mainHeading).toBeVisible();

  // 各カードの見出しが表示されることを確認
  await expect(
    page.getByRole("heading", { name: "月間読了目標" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "年間読了目標" }),
  ).toBeVisible();

  // 月間目標ブロック内の「目標冊数」ラベルがあることを確認
  await expect(page.getByText("目標冊数").first()).toBeVisible();
});
