// バリデーションユーティリティ
// 入力データの整合性チェックを行う

// ISBN-10 チェックサム検証
function isValidIsbn10(isbn) {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const chars = isbn.split("");
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const c = chars[i] === "X" ? 10 : parseInt(chars[i], 10);
    sum += c * (10 - i);
  }
  return sum % 11 === 0;
}

// ISBN-13 チェックサム検証
function isValidIsbn13(isbn) {
  if (!/^\d{13}$/.test(isbn)) return false;
  const digits = isbn.split("").map((d) => parseInt(d, 10));
  const sum = digits
    .slice(0, 12)
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

// ISBN 全体の検証（10桁または13桁）
function isValidIsbn(isbn) {
  if (!isbn) return false;
  const normalized = isbn.replace(/[^0-9X]/gi, "");
  if (normalized.length === 10) return isValidIsbn10(normalized);
  if (normalized.length === 13) return isValidIsbn13(normalized);
  return false;
}

// 日付の形式 yyyy-mm-dd を簡易検証（厳密な存在する日付チェックも行う）
function isValidDateString(dateStr) {
  if (!dateStr) return true; // 空は許容（必須ではない）
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map((s) => parseInt(s, 10));
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

// ページ数の検証
function isValidPages(pages) {
  if (pages === "" || pages === null || pages === undefined) return true; // 空は許容
  const n = Number(pages);
  if (!Number.isInteger(n)) return false;
  if (n <= 0) return false;
  return true;
}

// メインのバリデーション関数
// formData は BookInfoInputPage の state 形式を想定
function validateForm(formData) {
  const errors = {};

  // タイトル必須
  if (!formData.title || formData.title.trim() === "") {
    errors.title = "タイトルは必須です";
  }

  // ページ数
  if (!isValidPages(formData.pages)) {
    errors.pages = "ページ数は正の整数で入力してください";
  }

  // 出版日形式
  if (formData.publishedDate && !isValidDateString(formData.publishedDate)) {
    errors.publishedDate = "出版日は yyyy-mm-dd の形式で入力してください";
  }

  // 日付整合性（開始日 <= 終了日）
  if (formData.startDate && formData.endDate) {
    if (
      !isValidDateString(formData.startDate) ||
      !isValidDateString(formData.endDate)
    ) {
      errors.dateOrder = "開始日・終了日の形式が不正です";
    } else {
      const s = new Date(formData.startDate);
      const e = new Date(formData.endDate);
      if (s.getTime() > e.getTime()) {
        errors.dateOrder = "開始日は終了日以下である必要があります";
      }
    }
  }

  // ISBN 検証（空は許容）
  if (formData.isbn && formData.isbn.trim() !== "") {
    const raw = formData.isbn.replace(/[^0-9X]/gi, "");
    if (!(raw.length === 10 || raw.length === 13)) {
      errors.isbn = "ISBN は 10 桁または 13 桁で入力してください";
    } else if (!isValidIsbn(raw)) {
      errors.isbn = "ISBN の形式が不正です（チェックサム）";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// 最初のエラーキーにフォーカスする
const focusFirstError = (errors, refs) => {
  const order = ["title", "isbn", "pages", "publishedDate", "dateOrder"];
  for (const key of order) {
    if (errors[key]) {
      switch (key) {
        case "title":
          refs.current.title?.focus();
          break;
        case "isbn":
          refs.current.isbn?.focus();
          break;
        case "pages":
          refs.current.pages?.focus();
          break;
        case "publishedDate":
          refs.current.publishedDate?.focus();
          break;
        case "dateOrder":
          // 日付の不整合は開始日にフォーカス
          refs.current.startDate?.focus();
          break;
        default:
          break;
      }
      break;
    }
  }
};

export {
  focusFirstError,
  isValidIsbn10,
  isValidIsbn13,
  isValidIsbn,
  isValidDateString,
  isValidPages,
  validateForm,
};
