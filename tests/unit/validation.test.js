import { validateForm, isValidIsbn } from "../../src/utils/validation";
import { describe, test, expect } from "vitest";

// バリデーションユーティリティのテスト
describe("validation utilities", () => {
  // 正しいフォームはバリデーションを通過する
  test("valid form passes", () => {
    const form = {
      title: "テスト本",
      pages: "123",
      publishedDate: "2020-01-15",
      startDate: "2020-01-01",
      endDate: "2020-01-10",
      isbn: "9783161484100", // 有効なISBN-13
    };
    const res = validateForm(form);
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  // タイトルが未入力の場合は失敗する
  test("missing title fails", () => {
    const form = { ...emptyForm(), title: "" };
    const res = validateForm(form);
    expect(res.valid).toBe(false);
    expect(res.errors.title).toBeDefined();
  });

  // ページ数が不正な場合は失敗する
  test("invalid pages fail", () => {
    const form = { ...emptyForm(), title: "a", pages: "-5" };
    const res = validateForm(form);
    expect(res.valid).toBe(false);
    expect(res.errors.pages).toBeDefined();
  });

  // 出版日のフォーマットが不正な場合は失敗する
  test("invalid publishedDate format fails", () => {
    const form = { ...emptyForm(), title: "a", publishedDate: "20200101" };
    const res = validateForm(form);
    expect(res.valid).toBe(false);
    expect(res.errors.publishedDate).toBeDefined();
  });

  // 開始日と終了日の順序が不正な場合は失敗する
  test("date order invalid fails", () => {
    const form = {
      ...emptyForm(),
      title: "a",
      startDate: "2021-01-10",
      endDate: "2021-01-01",
    };
    const res = validateForm(form);
    expect(res.valid).toBe(false);
    expect(res.errors.dateOrder).toBeDefined();
  });

  // ISBNのバリデーションテスト
  test("invalid isbn fails and valid isbn passes", () => {
    expect(isValidIsbn("1234567890")).toBe(false); // 無効なISBN
    expect(isValidIsbn("048665088X")).toBe(true); // 有効なISBN-10
    expect(isValidIsbn("9783161484100")).toBe(true); // 有効なISBN-13
  });
});

// 空のフォームを返すヘルパー関数
function emptyForm() {
  return {
    title: "a",
    pages: "",
    publishedDate: "",
    startDate: "",
    endDate: "",
    isbn: "",
  };
}
