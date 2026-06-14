// 分析ユーティリティ
// 純粋関数をエクスポートし、テストしやすくします

import { toNumber, parseToDate } from "./format-datetime";

// 最多ジャンル計算
export const computeMostReadGenre = (libraryRecords = []) => {
  // 完了（読了）の本を対象にジャンル集計を行う
  const counts = {};
  for (const r of libraryRecords || []) {
    const status = r.status || "";
    const genre = r.genre || "不明";
    if (status === "読了") {
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }

  // 読了が無ければ、すべてのステータスで集計してみる
  const hasAny = Object.keys(counts).length > 0;
  if (!hasAny) {
    for (const r of libraryRecords || []) {
      const genre = r.genre || "不明";
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }

  let topGenre = null;
  let topCount = 0;
  for (const [g, c] of Object.entries(counts)) {
    if (c > topCount) {
      topCount = c;
      topGenre = g;
    }
  }

  return { genre: topGenre, count: topCount };
};

// 総合ページ数計算
export const computeTotalPages = (libraryRecords = []) => {
  // 合計ページは読了済みの本のpages合計を想定
  let total = 0;
  for (const r of libraryRecords || []) {
    const status = r.status || "";
    if (status === "読了") {
      total += toNumber(r.pages);
    }
  }
  return total;
};

// ステータスごとの件数集計
export const computeStatusCounts = (libraryRecords = []) => {
  const counts = { 未読: 0, 読書中: 0, 読了: 0 };
  let total = 0;
  for (const r of libraryRecords || []) {
    const s = r.status || "未読";
    if (s === "未読" || s === "読書中" || s === "読了") {
      counts[s] = (counts[s] || 0) + 1;
    } else {
      // 未知のステータスは未読に含めないが合計には加える
      // ここでは未知ステータスは無視しておく
    }
    total += 1;
  }

  const completed = counts["読了"] || 0;
  const completionRate =
    total > 0 ? Math.round((completed / total) * 1000) / 10 : 0; // 小数1位

  return { counts, total, completionRate };
};

// 総合ハイライト計算
export const computeHighlights = (libraryRecords = []) => {
  const mostReadGenre = computeMostReadGenre(libraryRecords);
  const totalPages = computeTotalPages(libraryRecords);
  const status = computeStatusCounts(libraryRecords);

  return {
    mostReadGenre,
    totalPages,
    statusCounts: status.counts,
    totalItems: status.total,
    completionRate: status.completionRate,
  };
};

// --- 追加: ランキング関連のユーティリティ ---

// ページ数ランキング (既読/読了を優先して集計し、上位 N を返す)
export const computePagesRanking = (libraryRecords = [], top = 5) => {
  const candidates = (libraryRecords || []).filter(
    (r) => (r.status || "") === "読了",
  );
  const source = candidates.length > 0 ? candidates : libraryRecords || [];

  const arr = source
    .map((r) => ({
      id: r.id || null,
      title: r.title || "無題",
      pages: toNumber(r.pages),
    }))
    .filter((x) => x.pages > 0)
    .sort((a, b) => b.pages - a.pages)
    .slice(0, top);

  return arr;
};

// 読了期間ランキング（読了済みで startDate と endDate があるものを対象、長い順）
export const computeReadDurationRanking = (libraryRecords = [], top = 5) => {
  const items = [];
  for (const r of libraryRecords || []) {
    if ((r.status || "") !== "読了") continue;
    const s = parseToDate(r.startDate);
    const e = parseToDate(r.endDate);
    if (!s || !e) continue;
    const days = Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
    items.push({
      id: r.id || null,
      title: r.title || "無題",
      days,
      startDate: s,
      endDate: e,
    });
  }

  return items.sort((a, b) => b.days - a.days).slice(0, top);
};

// ジャンルランキング（読了を優先して集計、上位 N を返す）
export const computeGenreRanking = (libraryRecords = [], top = 5) => {
  const counts = {};
  const completed = (libraryRecords || []).filter(
    (r) => (r.status || "") === "読了",
  );
  const source = completed.length > 0 ? completed : libraryRecords || [];
  for (const r of source) {
    const g = r.genre || "不明";
    counts[g] = (counts[g] || 0) + 1;
  }

  const arr = Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);

  return arr;
};

// 作者ランキング（authors フィールドが配列/文字列どちらでも対応、上位 N）
export const computeAuthorRanking = (libraryRecords = [], top = 5) => {
  const counts = {};
  const completed = (libraryRecords || []).filter(
    (r) => (r.status || "") === "読了",
  );
  const source = completed.length > 0 ? completed : libraryRecords || [];

  for (const r of source) {
    const a = r.authors || r.author || "不明";
    if (Array.isArray(a)) {
      for (const au of a) {
        const key = (au || "").toString();
        if (!key) continue;
        counts[key] = (counts[key] || 0) + 1;
      }
    } else if (typeof a === "string") {
      const parts = a
        .split(/、|,| and |&/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        for (const p of parts) counts[p] = (counts[p] || 0) + 1;
      } else {
        const key = a || "不明";
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }

  const arr = Object.entries(counts)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top);

  return arr;
};

// 月間読了数を計算（指定月から過去N月分）
// monthOffset: 0 = 直近月, 1 = その前の月, ...
// months: 表示月数（デフォルト 6）
export const computeMonthlyCompletions = (
  libraryRecords = [],
  monthOffset = 0,
  months = 6,
) => {
  const data = [];
  const now = new Date();
  const baseMonth = new Date(
    now.getFullYear(),
    now.getMonth() - monthOffset,
    1,
  );

  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(
      baseMonth.getFullYear(),
      baseMonth.getMonth() - i,
      1,
    );
    const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
    const label = `${month.getMonth() + 1}月`;

    let count = 0;
    for (const r of libraryRecords || []) {
      if ((r.status || "") !== "読了") continue;
      const endDate = parseToDate(r.endDate);
      if (!endDate) continue;
      const rMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}`;
      if (rMonth === monthStr) count++;
    }
    data.push({ month: monthStr, label, count });
  }

  return data;
};

// 指定月の読了冊数をカウント（単一月）
export const countCompletedInMonth = (libraryRecords = [], year, month) => {
  let count = 0;
  for (const r of libraryRecords || []) {
    if ((r.status || "") !== "読了") continue;
    const endDate = parseToDate(r.endDate);
    if (!endDate) continue;
    if (endDate.getFullYear() === year && endDate.getMonth() + 1 === month)
      count++;
  }
  return count;
};

// 年間読了数を計算（指定年から過去N年分）
// yearOffset: 0 = 直近年, 1 = その前の年, ...
// years: 表示年数（デフォルト 6）
export const computeYearlyCompletions = (
  libraryRecords = [],
  yearOffset = 0,
  years = 6,
) => {
  const data = [];
  const now = new Date();
  const baseYear = now.getFullYear() - yearOffset;

  for (let i = years - 1; i >= 0; i--) {
    const year = baseYear - i;
    const label = `${year}年`;

    let count = 0;
    for (const r of libraryRecords || []) {
      if ((r.status || "") !== "読了") continue;
      const endDate = parseToDate(r.endDate);
      if (!endDate) continue;
      if (endDate.getFullYear() === year) count++;
    }
    data.push({ year, label, count });
  }

  return data;
};

// 指定年の読了冊数をカウント（単一年）
export const countCompletedInYear = (libraryRecords = [], year) => {
  let count = 0;
  for (const r of libraryRecords || []) {
    if ((r.status || "") !== "読了") continue;
    const endDate = parseToDate(r.endDate);
    if (!endDate) continue;
    if (endDate.getFullYear() === year) count++;
  }
  return count;
};

export default {
  computeMostReadGenre,
  computeTotalPages,
  computeStatusCounts,
  computeHighlights,
  computePagesRanking,
  computeReadDurationRanking,
  computeGenreRanking,
  computeAuthorRanking,
  computeMonthlyCompletions,
  countCompletedInMonth,
  computeYearlyCompletions,
  countCompletedInYear,
};
