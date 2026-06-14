import { test, expect } from "@playwright/test";

test("BookInfoInputPage: タイトル検索で結果を選んでフォームに反映されること", async ({ page }) => {
  // 擬似ログイン注入
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test1@example.com",
      displayName: "testuser",
    })};`,
  });

  // Firestore をモックして外部アクセスを遮断
  await page.route("**/firestore.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ documents: [] }) });
  });
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // アプリが叩くプロキシ（Gin API サーバー）をモックして安定した検索結果を返す
  // モックレスポンスを即座に返すことで安定性を確保
  await page.route("**/gin-api-server.onrender.com/books**", async (route) => {
    const mock = {
      kind: "books#volumes",
      totalItems: 1,
      items: [
        {
          id: "test-volume-1",
          volumeInfo: {
            title: "吾輩は猫である",
            authors: ["夏目漱石"],
            publisher: "青空文庫",
            publishedDate: "1905",
            categories: ["小説"],
            imageLinks: { thumbnail: "https://placehold.co/100x150" },
            pageCount: 300,
            description: "吾輩は猫である、名前はまだ無い。",
            industryIdentifiers: [
              { type: "ISBN_13", identifier: "9784000000000" },
            ],
          },
        },
      ],
    };
    // 少し遅延を入れて実際のAPIコールをシミュレート（安定性のため短く）
    await new Promise(resolve => setTimeout(resolve, 100));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mock) });
  });

  // ページを開く
  await page.goto("/mylibrary/input");

  // メインタイトルが表示されるまで待つ
  await page.getByRole("heading", { name: /本を追加/ }).waitFor({ timeout: 10_000 });

  // デフォルトはスキャンモードなので、タイトル検索モードに切り替える
  const titleBtn = page.getByRole("button", { name: "タイトル検索" });
  await expect(titleBtn).toBeVisible();
  await titleBtn.click();

  // 検索入力にキーワードを入力
  const searchInput = page.locator('input[aria-label="タイトルで検索"]');
  await searchInput.fill("吾輩は猫である");
  
  // 検索実行ボタンをクリック
  const searchBtn = page.getByRole("button", { name: "検索実行" });
  await searchBtn.click();

  // ローディングインジケーターが消えるまで待つ（検索が完了するまで）
  // loading.title が false になるのを待つため、検索ボタンが再度有効になるのを待機
  await page.waitForTimeout(500); // モックなので短い待機で十分

  // 検索結果ヘッダーが表示されることを確認
  const resultsHeader = page.getByText(/検索結果 \(1件\)/);
  await resultsHeader.waitFor({ state: "visible", timeout: 10000 });
  await expect(resultsHeader).toBeVisible();

  // 検索結果の項目をクリックして選択
  // より確実なセレクタ: タイトルテキストを含むdiv要素
  const resultItem = page.locator('div[role="button"]').filter({ hasText: "吾輩は猫である" }).first();
  await expect(resultItem).toBeVisible();
  await resultItem.click();

  // 選択後、フォームのタイトル・著者・出版社・ページ数・あらすじが反映されることを確認
  const titleField = page.locator('input[placeholder="タイトルを入力"]');
  await expect(titleField).toHaveValue("吾輩は猫である");

  const authorField = page.getByPlaceholder("著者を入力");
  await expect(authorField).toHaveValue("夏目漱石");

  const publisherField = page.getByPlaceholder("出版社を入力");
  await expect(publisherField).toHaveValue("青空文庫");

  const pagesField = page.getByPlaceholder("ページ数を入力");
  await expect(pagesField).toHaveValue("300");

  const descField = page.locator('textarea[placeholder="書籍のあらすじや概要を入力"]');
  await expect(descField).toHaveValue("吾輩は猫である、名前はまだ無い。");

  // 表紙画像が表示されることを確認
  const coverImg = page.locator('img[alt="Book cover"]');
  await expect(coverImg).toBeVisible();

  // 保存ボタンはフォームにタイトルが入ったので有効になるはず（保存は実行しない）
  const saveBtn = page.getByRole("button", { name: /ライブラリに追加/ });
  await expect(saveBtn).toBeEnabled();
});
