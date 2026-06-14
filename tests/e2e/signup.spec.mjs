import { test, expect } from "@playwright/test";

test("SignupPage: UI, password toggle, loading and error flow", async ({
  page,
}) => {
  // 開始ページへ
  await page.goto("/signup");

  // ユーザー名・メール・パスワード・確認パスワードが表示されている
  await expect(page.locator("#username")).toBeVisible();
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
  await expect(page.locator("#confirmPassword")).toBeVisible();

  // パスワード表示切替（password input の隣のボタンをクリック）
  const toggleBtn = page.locator("input#password + button");
  await toggleBtn.click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");

  // 入力を埋める
  await page.fill("#username", "tester");
  await page.fill("#email", "test@example.com");
  await page.fill("#password", "password123");
  await page.fill("#confirmPassword", "password123");

  // Firebase の REST エンドポイント (identitytoolkit) をモックしてエラーを返す
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    // 少し遅延を入れてローディング UI の表示を確認できるようにする
    await new Promise((r) => setTimeout(r, 500));
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "EMAIL_EXISTS" } }),
    });
  });

  // 新規登録ボタンをクリック -> ローディングが表示され、エラーメッセージが出ることを検証
  await page.click('button:has-text("新規登録")');

  // ローディングスピナー（SVG の animate-spin が付与される）を確認
  await expect(page.locator("svg.animate-spin")).toBeVisible();

  // エラー表示を待つ（SignupPage のタイトルは "登録できませんでした"）
  await expect(page.locator("text=登録できませんでした")).toBeVisible();

  // 閉じるボタンでエラーを閉じる
  await page.click('button[aria-label="メッセージを閉じる"]');
  await expect(page.locator("text=登録できませんでした")).toHaveCount(0);
});
