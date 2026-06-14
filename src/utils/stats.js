import { parseToDate, pad, toDateStr } from "./format-datetime";
import { countCompletedInMonth, countCompletedInYear } from "./analysis";

// 共通の数値フォーマット
const formatNumber = (n, digits = 1) => {
  if (typeof n !== "number" || !isFinite(n)) return "-";
  return Number(n.toFixed(digits));
};

// 1) 今月の統計情報をまとめて計算する関数
// 引数: records (library records), monthlyGoal (数値|null), referenceDate
// 戻り値: { progress, averagePaceText, achievementRateText, remainingDays, remainingDaysText, neededPaceText }
export const computeMonthlyStats = (
  records = [],
  monthlyGoal = null,
  referenceDate = new Date()
) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth() + 1;
  const progress = countCompletedInMonth(records, year, month);

  if (monthlyGoal == null) {
    return {
      progress,
      averagePaceText: "-",
      achievementRateText: "-",
      remainingDays: null,
      remainingDaysText: "-",
      neededPaceText: "-",
    };
  }

  const today = referenceDate;
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const elapsedDays = today.getDate();
  const remainingDays = Math.max(daysInMonth - elapsedDays, 0);

  const averagePace = elapsedDays > 0 ? (progress * 7) / elapsedDays : 0;
  const averagePaceText = `${formatNumber(averagePace, 1)}冊/週`;
  const achievementRate =
    monthlyGoal > 0 ? Math.round((progress / monthlyGoal) * 100) : 0;
  const achievementRateText = `${achievementRate}%`;

  const neededPaceText = (() => {
    const remainingBooks = Math.max(monthlyGoal - progress, 0);
    if (remainingDays <= 0) return remainingBooks <= 0 ? "0 冊/週" : "-";
    const remainingWeeks = remainingDays / 7;
    const perWeek =
      remainingWeeks > 0 ? remainingBooks / remainingWeeks : Infinity;
    return `${formatNumber(perWeek, 2)}冊/週`;
  })();

  return {
    progress, // 読了数
    averagePaceText, // 平均ペース
    achievementRateText, // 達成率
    remainingDays, // 残り日数
    remainingDaysText: `${remainingDays}日`, // 残り日数テキスト
    neededPaceText, // 必要ペーステキスト
  };
};

// 2) 年間の統計情報をまとめて計算する関数
// 引数: records, yearlyGoal, referenceDate
// 戻り値: { progress, averagePaceText, achievementRateText, remainingDaysText, neededPaceText }
export const computeYearlyStats = (
  records = [],
  yearlyGoal = null,
  referenceDate = new Date()
) => {
  const year = referenceDate.getFullYear();
  const progress = countCompletedInYear(records, year);

  if (yearlyGoal == null) {
    return {
      progress,
      averagePaceText: "-",
      achievementRateText: "-",
      remainingDaysText: "-",
      neededPaceText: "-",
    };
  }

  const today = referenceDate;
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const startOfNextYear = new Date(today.getFullYear() + 1, 0, 1);
  const msPerDay = 24 * 60 * 60 * 1000;
  const elapsedDays = Math.floor((today - startOfYear) / msPerDay) + 1;
  const daysInYear = Math.floor((startOfNextYear - startOfYear) / msPerDay);
  const remainingDays = Math.max(daysInYear - elapsedDays, 0);

  const averagePace = elapsedDays > 0 ? (progress * 7) / elapsedDays : 0;
  const averagePaceText = `${formatNumber(averagePace, 1)}冊/週`;
  const achievementRate =
    yearlyGoal > 0 ? Math.round((progress / yearlyGoal) * 100) : 0;
  const achievementRateText = `${achievementRate}%`;

  const neededPaceText = (() => {
    const remainingBooks = Math.max(yearlyGoal - progress, 0);
    if (remainingDays <= 0) return remainingBooks <= 0 ? "0 冊/週" : "-";
    const remainingWeeks = remainingDays / 7;
    const perWeek =
      remainingWeeks > 0 ? remainingBooks / remainingWeeks : Infinity;
    return `${formatNumber(perWeek, 2)}冊/週`;
  })();

  return {
    progress, // 読了数
    averagePaceText, // 平均ペース
    achievementRateText, // 達成率
    remainingDaysText: `${remainingDays}日`, // 残り日数テキスト
    neededPaceText, // 必要ペーステキスト
  };
};

// 3) 毎日の読書時間を集計する関数
// sessionRecords: 読書セッションの配列。各要素は少なくとも下記のどれかを持つことを期待
// - date: 'YYYY-MM-DD' 形式の文字列
// - durationSeconds: セッションの合計秒数
// - duration: { hours, minutes, seconds }
// dailyMinutes: 目標の分数（例: 30）
// referenceDate: 集計対象の日（デフォルトは今日）
// 戻り値: { totalMinutes, targetMinutes, achieved, progressPercentText, remainingMinutes, remainingText }
export const computeDailyStats = (
  sessionRecords = [],
  dailyMinutes = null,
  referenceDate = new Date()
) => {
  // 日付を YYYY-MM-DD 形式に揃える
  const refY = referenceDate.getFullYear();
  const refM = pad(referenceDate.getMonth() + 1);
  const refD = pad(referenceDate.getDate());
  const refDateStr = `${refY}-${refM}-${refD}`;

  // 指定日分の合計秒数を計算
  let totalSeconds = 0;
  for (const s of sessionRecords) {
    // まず日付マッチを確認
    const recDate = (s && (s.date || (s.raw && s.raw.date))) || null;
    if (recDate && String(recDate) !== refDateStr) continue;

    // durationSeconds を優先
    if (typeof s.durationSeconds === "number") {
      totalSeconds += s.durationSeconds;
      continue;
    }

    // duration オブジェクトから計算
    if (s.duration && typeof s.duration === "object") {
      const h = Number(s.duration.hours || 0);
      const m = Number(s.duration.minutes || 0);
      const sec = Number(s.duration.seconds || 0);
      totalSeconds += h * 3600 + m * 60 + sec;
      continue;
    }

    // raw に durationSeconds がある場合や createdAt を日付として使う場合のフォールバック
    if (s.raw) {
      if (typeof s.raw.durationSeconds === "number") {
        totalSeconds += s.raw.durationSeconds;
        continue;
      }
      // createdAt が Firestore タイムスタンプ等の場合は parseToDate を試す
      const created = parseToDate(s.raw.createdAt);
      if (created) {
        const cy = created.getFullYear();
        const cm = pad(created.getMonth() + 1);
        const cd = pad(created.getDate());
        const createdStr = `${cy}-${cm}-${cd}`;
        if (createdStr === refDateStr) {
          // duration がない場合は 0 とみなす
        }
      }
    }
  }

  const totalMinutes = Math.floor(totalSeconds / 60);

  if (dailyMinutes == null) {
    return {
      totalMinutes,
      targetMinutes: null,
      achieved: false,
      progressPercentText: "-",
      remainingMinutes: null,
      remainingText: "-",
    };
  }

  const achieved = totalMinutes >= dailyMinutes;
  const remainingMinutes = Math.max(dailyMinutes - totalMinutes, 0);
  const progressPercent =
    dailyMinutes > 0 ? Math.round((totalMinutes / dailyMinutes) * 100) : 0;
  const progressPercentText = `${progressPercent}%`;

  return {
    totalMinutes,
    targetMinutes: dailyMinutes,
    achieved,
    progressPercentText,
    remainingMinutes,
    remainingText: `${remainingMinutes}分`,
  };
};

// 直近7日分の合計（古い日 -> 今日）を返すヘルパー
// readingSessions: セッション配列
// referenceDate: 基準日（デフォルトは today）
// 戻り値: [{ date: 'YYYY-MM-DD', label: '月', minutes: Number }, ...]
export const computeLast7Days = (
  readingSessions = [],
  referenceDate = new Date()
) => {
  const jpWeekday = (d) => {
    const arr = ["日", "月", "火", "水", "木", "金", "土"];
    return arr[d.getDay()];
  };

  const days = [];
  const today = new Date(referenceDate);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = toDateStr(d);
    let totalSec = 0;
    for (const s of readingSessions) {
      const recDate = (s && (s.date || (s.raw && s.raw.date))) || null;
      if (recDate && String(recDate) !== ds) continue;

      if (typeof s.durationSeconds === "number") {
        totalSec += s.durationSeconds;
        continue;
      }
      if (s.duration && typeof s.duration === "object") {
        const h = Number(s.duration.hours || 0);
        const m = Number(s.duration.minutes || 0);
        const sec = Number(s.duration.seconds || 0);
        totalSec += h * 3600 + m * 60 + sec;
        continue;
      }
      if (s.raw && typeof s.raw.durationSeconds === "number") {
        totalSec += s.raw.durationSeconds;
      }
    }
    days.push({
      date: ds,
      label: jpWeekday(d),
      minutes: Math.floor(totalSec / 60),
    });
  }
  return days;
};
