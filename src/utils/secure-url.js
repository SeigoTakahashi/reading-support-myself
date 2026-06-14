// 画像URLが http の場合 https に置換する関数
export const ensureHttps = (url) => {
  // url が null または非文字列の場合はそのまま返す
  if (!url || typeof url !== "string") return url;

  try {
    // 既に https の場合はそのまま返す
    if (url.startsWith("https://")) return url;
    // http の場合は https に置換
    if (url.startsWith("http://"))
      return url.replace(/^http:\/\//i, "https://");
    // プロトコル相対 URL (//example.com/...) の場合は https: を追加
    if (url.startsWith("//")) return `https:${url}`;
    return url;
  } catch (e) {
    console.error("Error ensuring HTTPS for URL:", e);
    return url;
  }
};
