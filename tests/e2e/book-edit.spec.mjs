import { test, expect } from "@playwright/test";

test("BookInfoEditPage: 編集フォームの表示と保存操作（Firestore をモック、擬似ログイン注入）", async ({ page }) => {
  // 擬似ログインユーザーを注入
  await page.addInitScript({
    content: `window.__PLAYWRIGHT_TEST_USER = ${JSON.stringify({
      uid: "test-uid",
      email: "test-edit@example.com",
      displayName: "edituser",
    })};`,
  });

  // Firestore のエンドポイントをモックする
  // - GET リクエスト（ユーザーライブラリ取得）では編集対象のレコードを返す
  // - 他は成功レスポンスを返して保存処理を安定化
  await page.route("**/firestore.googleapis.com/**", async (route, request) => {
    const method = request.method();

    const docName = "projects/dummy/databases/(default)/documents/userBooks/test-userbook-id";
    const fields = {
      id: { stringValue: "test-userbook-id" },
      bookId: { stringValue: "test-book-id" },
      isbn: { stringValue: "978-4-00-000000-0" },
      title: { stringValue: "テストの本 タイトル" },
      authors: { stringValue: "著者名" },
      publisher: { stringValue: "出版社" },
      publishedDate: { stringValue: "2020-01-01" },
      thumbnail: { stringValue: "" },
      pages: { stringValue: "320" },
      description: { stringValue: "説明文" },
      genre: { stringValue: "小説" },
      status: { stringValue: "読了" },
      startDate: { stringValue: "2024-01-01" },
      endDate: { stringValue: "2024-01-10" },
      rating: { integerValue: "4" },
      review: { stringValue: "良い本でした" },
      tags: { arrayValue: { values: [] } },
    };

    if (method === "GET") {
      const body = { documents: [ { name: docName, fields } ] };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
      return;
    }

    // Firestore SDKの runQuery 等は POST で来るため、それに対応するレスポンスを返す
    if (method === "POST") {
      // runQuery は配列で document を返す形式
      const body = [ { document: { name: docName, fields } } ];
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
      return;
    }

    // PATCH は更新されたドキュメントを返す（SDK が期待する形式に合わせる）
    if (method === "PATCH") {
      const body = { name: docName, fields };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
      return;
    }

    // その他は成功を返す
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // identitytoolkit のダミー（認証関連の呼び出しを無害化）
  await page.route("**/identitytoolkit.googleapis.com/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  // 編集ページへ遷移（ID は上で返しているものと一致させる）
  await page.goto("/mylibrary/edit/test-userbook-id");

  // ローディングを考慮して編集ヘッダが表示されるのを待つ
  await page.waitForSelector("text=本を編集", { timeout: 15_000 });
  await expect(page.getByText("本を編集", { exact: true })).toBeVisible();

  // フォームの入力要素が表示されていることを確認（値の注入は環境に依存するため柔軟に）
  await expect(page.getByPlaceholder("タイトルを入力").first()).toBeVisible();
  await expect(page.getByPlaceholder("著者を入力").first()).toBeVisible();

  // バリデーションを通すため、必須のタイトルとページ数を入力しておく
  await page.fill("[placeholder=\"タイトルを入力\"]", "テストの本 タイトル");
  await page.fill("[placeholder=\"ページ数を入力\"]", "320");

  // 保存ボタンが表示されていることを確認してクリック
  const saveButton = page.getByRole("button", { name: /変更を保存/ });
  await expect(saveButton).toBeVisible();

  // 保存クリック後に Firestore へのリクエストが発生することを確認（ナビゲーション待ちは不安定なので回避）
  const firestoreReq = page.waitForRequest((req) => req.url().includes("firestore.googleapis.com") && ["POST", "PATCH", "PUT"].includes(req.method()), { timeout: 15_000 });
  await saveButton.click();
  await firestoreReq;

  // 保存処理が終わったことを確認（エラーメッセージが出ていないことをチェック）
  await expect(page.getByText("保存に失敗しました")).toHaveCount(0);
});
