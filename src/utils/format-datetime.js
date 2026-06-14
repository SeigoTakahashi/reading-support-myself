// createdAt の形式をミリ秒に変換するヘルパー関数
// 対応例:
// - Firestore Timestamp (toDate を持つ)
// - seconds/milliseconds の数値
// - Date オブジェクト
// - ISO 文字列 ("1999-10-01" など)
// - 日本語表記の例: "2025年10月19日 11:41:30 UTC+9"
export const toMilliseconds = (dateInput) => {
  if (dateInput == null) return 0;

  // 数値の場合（秒またはミリ秒）
  if (typeof dateInput === "number") {
    return dateInput < 1e12 ? dateInput * 1000 : dateInput;
  }

  // Date オブジェクトの場合
  if (dateInput instanceof Date) {
    return dateInput.getTime();
  }

  // 文字列の場合
  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();

    // 日本語日時形式: "2025年10月19日 11:41:30 UTC+9"
    const jpMatch = trimmed.match(
      /^\s*(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2}):(\d{2})\s+UTC([+-]?\d{1,2})(?::?(\d{2}))?\s*$/
    );
    if (jpMatch) {
      const [, year, month, day, hour, minute, second, tzHourStr, tzMinStr] =
        jpMatch;
      const tzHour = parseInt(tzHourStr || "0", 10);
      const tzSign = tzHourStr && tzHourStr.startsWith("-") ? -1 : 1;
      const tzHourAbs = String(Math.abs(tzHour)).padStart(2, "0");
      const tzMinute = tzMinStr ? String(tzMinStr).padStart(2, "0") : "00";
      const timezone = (tzSign === -1 ? "-" : "+") + tzHourAbs + ":" + tzMinute;
      const isoString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}T${String(hour).padStart(
        2,
        "0"
      )}:${minute}:${second}${timezone}`;
      const millis = Date.parse(isoString);
      return isNaN(millis) ? 0 : millis;
    }

    // ISO 文字列など
    const millis = Date.parse(trimmed);
    return isNaN(millis) ? 0 : millis;
  }

  // Firestore Timestamp オブジェクトの場合
  if (typeof dateInput.toDate === "function") {
    try {
      return dateInput.toDate().getTime();
    } catch {
      return 0;
    }
  }

  // Firestore Timestamp の seconds/nanoseconds プロパティの場合
  if (typeof dateInput.seconds === "number") {
    const seconds = dateInput.seconds || 0;
    const nanoseconds = dateInput.nanoseconds || dateInput.nanosecond || 0;
    return seconds * 1000 + Math.floor(nanoseconds / 1e6);
  }

  return 0;
};

// 日付整形フォーマット：形式 "yyyy-MM-dd"
export const formatJapaneseDate = (dateInput) => {
  if (!dateInput) return "-";
  const milliseconds = toMilliseconds(dateInput);
  if (!milliseconds) return "-";
  try {
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "-";
  }
};

// parseToDate: 入力を Date に変換して返す（失敗時は null）
// 内部で toMilliseconds を呼び出すことで、Firestore Timestamp / seconds/nanoseconds /
// ISO 文字列 / Date / number 等に対応する
export const parseToDate = (val) => {
  if (val == null) return null;
  const ms = toMilliseconds(val);
  if (!ms) return null;
  const d = new Date(ms);
  return isNaN(d.getTime()) ? null : d;
};


export const formatSeconds = (secs) => {
  const s = Number(secs) || 0;
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  if (hours > 0) return `${hours}時間 ${minutes}分`;
  if (minutes > 0) return `${minutes}分`;
  return `${s}秒`;
};

// pad: 数値を指定の文字数で0パディング（デフォルト2桁）
export const pad = (n, digits = 2) => String(n).padStart(digits, "0");

// toDateStr: Date を "yyyy-MM-dd" 形式の文字列に変換
export const toDateStr = (d) => {
  if (!d) return "";
  if (typeof d === "string") return d;
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

// toNumber: 任意の値を安全に数値に変換（失敗時は0）
export const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

// formatDuration: 秒数を "X時間Y分" 形式で表示
export const formatDuration = (secs = 0) => {
  if (!secs || secs <= 0) return "0分";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0 && m > 0) return `${h}時間${m}分`;
  if (h > 0) return `${h}時間`;
  return `${m}分`;
};
