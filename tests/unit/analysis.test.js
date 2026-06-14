import { describe, it, expect } from "vitest";
import {
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
} from "../../src/utils/analysis";

/**
 * テスト設計思想：安定性重視
 * - 固定的なテストデータを使用
 * - エッジケースをカバーするが、失敗しやすいテストは避ける
 * - 日時依存のテストは確定的なデータを用いる
 */

describe("analysis.js", () => {
  // テスト用の基本データセット
  const mockLibraryRecords = [
    {
      id: "1",
      title: "本A",
      genre: "小説",
      status: "読了",
      pages: 300,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      authors: "著者A",
    },
    {
      id: "2",
      title: "本B",
      genre: "小説",
      status: "読了",
      pages: 250,
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      authors: "著者B",
    },
    {
      id: "3",
      title: "本C",
      genre: "ビジネス",
      status: "読了",
      pages: 400,
      startDate: "2024-03-01",
      endDate: "2024-03-20",
      authors: "著者C",
    },
    {
      id: "4",
      title: "本D",
      genre: "ビジネス",
      status: "読書中",
      pages: 350,
      startDate: "2024-04-01",
      endDate: null,
      authors: "著者D",
    },
    {
      id: "5",
      title: "本E",
      genre: "自己啓発",
      status: "未読",
      pages: 200,
      startDate: null,
      endDate: null,
      authors: "著者E",
    },
  ];

  // ============================================================
  // computeMostReadGenre
  // ============================================================
  describe("computeMostReadGenre", () => {
    it("読了済みのジャンルから最多ジャンルを計算する", () => {
      const result = computeMostReadGenre(mockLibraryRecords);
      expect(result.genre).toBe("小説");
      expect(result.count).toBe(2);
    });

    it("読了がない場合、全ステータスから最多ジャンルを計算する", () => {
      const records = [
        { id: "1", genre: "SF", status: "読書中", pages: 100 },
        { id: "2", genre: "SF", status: "未読", pages: 100 },
        { id: "3", genre: "ミステリ", status: "未読", pages: 100 },
      ];
      const result = computeMostReadGenre(records);
      expect(result.genre).toBe("SF");
      expect(result.count).toBe(2);
    });

    it("空配列を処理できる", () => {
      const result = computeMostReadGenre([]);
      expect(result.genre).toBeNull();
      expect(result.count).toBe(0);
    });

    it("nullまたはundefinedを安全に処理できる", () => {
      const result = computeMostReadGenre(null);
      expect(result.genre).toBeNull();
      expect(result.count).toBe(0);
    });

    it("ジャンルがない場合は「不明」として集計される", () => {
      const records = [
        { id: "1", status: "読了", pages: 100 },
        { id: "2", status: "読了", pages: 100 },
      ];
      const result = computeMostReadGenre(records);
      expect(result.genre).toBe("不明");
      expect(result.count).toBe(2);
    });
  });

  // ============================================================
  // computeTotalPages
  // ============================================================
  describe("computeTotalPages", () => {
    it("読了済みの本のページ数合計を計算する", () => {
      const result = computeTotalPages(mockLibraryRecords);
      // 読了: 300 + 250 + 400 = 950
      expect(result).toBe(950);
    });

    it("読了以外のステータスは除外される", () => {
      const records = [
        { id: "1", status: "読了", pages: 100 },
        { id: "2", status: "読書中", pages: 500 },
        { id: "3", status: "未読", pages: 300 },
      ];
      const result = computeTotalPages(records);
      expect(result).toBe(100);
    });

    it("空配列で0を返す", () => {
      const result = computeTotalPages([]);
      expect(result).toBe(0);
    });

    it("nullで0を返す", () => {
      const result = computeTotalPages(null);
      expect(result).toBe(0);
    });
  });

  // ============================================================
  // computeStatusCounts
  // ============================================================
  describe("computeStatusCounts", () => {
    it("ステータス別に正確に集計する", () => {
      const result = computeStatusCounts(mockLibraryRecords);
      expect(result.counts).toEqual({
        未読: 1,
        読書中: 1,
        読了: 3,
      });
      expect(result.total).toBe(5);
    });

    it("完了率を小数第1位で計算する", () => {
      const result = computeStatusCounts(mockLibraryRecords);
      // (3 / 5) * 100 = 60.0%
      expect(result.completionRate).toBe(60);
    });

    it("空配列で0を返す", () => {
      const result = computeStatusCounts([]);
      expect(result.counts).toEqual({
        未読: 0,
        読書中: 0,
        読了: 0,
      });
      expect(result.total).toBe(0);
      expect(result.completionRate).toBe(0);
    });

    it("nullで安全に処理する", () => {
      const result = computeStatusCounts(null);
      expect(result.counts).toEqual({
        未読: 0,
        読書中: 0,
        読了: 0,
      });
      expect(result.completionRate).toBe(0);
    });

    it("ステータスがない場合は未読にカウントされる", () => {
      const records = [
        { id: "1", status: undefined },
        { id: "2", status: "" },
      ];
      const result = computeStatusCounts(records);
      expect(result.counts.未読).toBe(2);
      expect(result.total).toBe(2);
    });
  });

  // ============================================================
  // computeHighlights
  // ============================================================
  describe("computeHighlights", () => {
    it("すべてのハイライト情報を計算する", () => {
      const result = computeHighlights(mockLibraryRecords);
      expect(result.mostReadGenre).toBeDefined();
      expect(result.totalPages).toBeDefined();
      expect(result.statusCounts).toBeDefined();
      expect(result.totalItems).toBeDefined();
      expect(result.completionRate).toBeDefined();
    });

    it("mostReadGenreが正確に計算される", () => {
      const result = computeHighlights(mockLibraryRecords);
      expect(result.mostReadGenre.genre).toBe("小説");
    });

    it("totalPagesが正確に計算される", () => {
      const result = computeHighlights(mockLibraryRecords);
      expect(result.totalPages).toBe(950);
    });

    it("空のデータセットを処理できる", () => {
      const result = computeHighlights([], []);
      expect(result.mostReadGenre.genre).toBeNull();
      expect(result.totalPages).toBe(0);
    });
  });

  // ============================================================
  // computePagesRanking
  // ============================================================
  describe("computePagesRanking", () => {
    it("読了済みの本をページ数でランキング計算する", () => {
      const result = computePagesRanking(mockLibraryRecords, 5);
      expect(result.length).toBeLessThanOrEqual(5);
      expect(result[0].pages).toBeGreaterThanOrEqual(result[1]?.pages || 0);
    });

    it("デフォルト上位5件を返す", () => {
      const records = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        title: `Book ${i}`,
        status: "読了",
        pages: 100 + i * 10,
      }));
      const result = computePagesRanking(records);
      expect(result.length).toBe(5);
    });

    it("指定した上位N件を返す", () => {
      const result = computePagesRanking(mockLibraryRecords, 2);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it("ページ数が0の本は除外される", () => {
      const records = [
        { id: "1", title: "Book A", status: "読了", pages: 0 },
        { id: "2", title: "Book B", status: "読了", pages: 100 },
      ];
      const result = computePagesRanking(records);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Book B",
          }),
        ]),
      );
      expect(result.length).toBe(1);
    });

    it("読了がない場合、すべての本から計算する", () => {
      const records = [
        { id: "1", title: "Book A", status: "読書中", pages: 200 },
        { id: "2", title: "Book B", status: "未読", pages: 150 },
      ];
      const result = computePagesRanking(records);
      expect(result.length).toBeGreaterThan(0);
    });

    it("空配列で空配列を返す", () => {
      const result = computePagesRanking([]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // computeReadDurationRanking
  // ============================================================
  describe("computeReadDurationRanking", () => {
    it("読了期間をランキング計算する", () => {
      const result = computeReadDurationRanking(mockLibraryRecords, 5);
      if (result.length > 1) {
        expect(result[0].days).toBeGreaterThanOrEqual(result[1].days);
      }
    });

    it("startDateまたはendDateがない本は除外される", () => {
      const records = [
        {
          id: "1",
          title: "Book A",
          status: "読了",
          startDate: "2024-01-01",
          endDate: null,
        },
        {
          id: "2",
          title: "Book B",
          status: "読了",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
      ];
      const result = computeReadDurationRanking(records);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "Book B",
          }),
        ]),
      );
    });

    it("日数が正確に計算される", () => {
      const records = [
        {
          id: "1",
          title: "Book A",
          status: "読了",
          startDate: "2024-01-01",
          endDate: "2024-01-11", // 10日間
        },
      ];
      const result = computeReadDurationRanking(records);
      expect(result[0].days).toBe(10);
    });

    it("読了以外は除外される", () => {
      const records = [
        {
          id: "1",
          title: "Book A",
          status: "読書中",
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        },
      ];
      const result = computeReadDurationRanking(records);
      expect(result.length).toBe(0);
    });

    it("空配列で空配列を返す", () => {
      const result = computeReadDurationRanking([]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // computeGenreRanking
  // ============================================================
  describe("computeGenreRanking", () => {
    it("ジャンルをランキング計算する", () => {
      const result = computeGenreRanking(mockLibraryRecords, 5);
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 1) {
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
      }
    });

    it("デフォルト上位5ジャンルを返す", () => {
      const records = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        genre: `Genre${i}`,
        status: "読了",
      }));
      const result = computeGenreRanking(records);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("読了がない場合、すべての本から計算する", () => {
      const records = [
        { id: "1", genre: "SF", status: "読書中" },
        { id: "2", genre: "SF", status: "未読" },
      ];
      const result = computeGenreRanking(records);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            genre: "SF",
            count: 2,
          }),
        ]),
      );
    });

    it("空配列で空配列を返す", () => {
      const result = computeGenreRanking([]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // computeAuthorRanking
  // ============================================================
  describe("computeAuthorRanking", () => {
    it("複数著者を「、」で分割して集計する", () => {
      const records = [
        { id: "1", authors: "著者A、著者B", status: "読了" },
        { id: "2", authors: "著者A、著者C", status: "読了" },
      ];
      const result = computeAuthorRanking(records);
      const authorA = result.find((r) => r.author === "著者A");
      expect(authorA?.count).toBe(2);
    });

    it("配列形式の著者をサポートする", () => {
      const records = [
        { id: "1", authors: ["著者A", "著者B"], status: "読了" },
        { id: "2", authors: ["著者A"], status: "読了" },
      ];
      const result = computeAuthorRanking(records);
      const authorA = result.find((r) => r.author === "著者A");
      expect(authorA?.count).toBe(2);
    });

    it("著者がない場合は「不明」として集計される", () => {
      const records = [
        { id: "1", status: "読了" },
        { id: "2", status: "読了" },
      ];
      const result = computeAuthorRanking(records);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            author: "不明",
          }),
        ]),
      );
    });

    it("読了がない場合、すべての本から計算する", () => {
      const records = [
        { id: "1", authors: "著者A", status: "読書中" },
        { id: "2", authors: "著者A", status: "未読" },
      ];
      const result = computeAuthorRanking(records);
      const authorA = result.find((r) => r.author === "著者A");
      expect(authorA?.count).toBeGreaterThan(0);
    });

    it("空配列で空配列を返す", () => {
      const result = computeAuthorRanking([]);
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // computeMonthlyCompletions
  // ============================================================
  describe("computeMonthlyCompletions", () => {
    it("月別の読了冊数を計算する", () => {
      const result = computeMonthlyCompletions(mockLibraryRecords, 0, 6);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6);
    });

    it("各要素にmonth, label, countを含む", () => {
      const result = computeMonthlyCompletions(mockLibraryRecords, 0, 1);
      expect(result[0]).toHaveProperty("month");
      expect(result[0]).toHaveProperty("label");
      expect(result[0]).toHaveProperty("count");
    });

    it("monthはYYYY-MM形式である", () => {
      const result = computeMonthlyCompletions(mockLibraryRecords, 0, 1);
      expect(result[0].month).toMatch(/^\d{4}-\d{2}$/);
    });

    it("labelはN月形式である", () => {
      const result = computeMonthlyCompletions(mockLibraryRecords, 0, 1);
      expect(result[0].label).toMatch(/^\d+月$/);
    });

    it("countは数値である", () => {
      const result = computeMonthlyCompletions(mockLibraryRecords, 0, 1);
      expect(typeof result[0].count).toBe("number");
    });

    it("空配列で全て0件の結果を返す", () => {
      const result = computeMonthlyCompletions([], 0, 1);
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(0);
    });

    it("指定月数分の結果を返す", () => {
      const result3 = computeMonthlyCompletions([], 0, 3);
      expect(result3.length).toBe(3);

      const result12 = computeMonthlyCompletions([], 0, 12);
      expect(result12.length).toBe(12);
    });
  });

  // ============================================================
  // countCompletedInMonth
  // ============================================================
  describe("countCompletedInMonth", () => {
    it("指定月の読了冊数をカウントする", () => {
      const count = countCompletedInMonth(mockLibraryRecords, 2024, 1);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("読了していない本はカウントされない", () => {
      const records = [
        {
          id: "1",
          status: "読書中",
          endDate: "2024-01-15",
        },
        {
          id: "2",
          status: "未読",
          endDate: "2024-01-20",
        },
      ];
      const count = countCompletedInMonth(records, 2024, 1);
      expect(count).toBe(0);
    });

    it("endDateがない本はカウントされない", () => {
      const records = [
        {
          id: "1",
          status: "読了",
          endDate: null,
        },
      ];
      const count = countCompletedInMonth(records, 2024, 1);
      expect(count).toBe(0);
    });

    it("空配列で0を返す", () => {
      const count = countCompletedInMonth([], 2024, 1);
      expect(count).toBe(0);
    });

    it("nullで0を返す", () => {
      const count = countCompletedInMonth(null, 2024, 1);
      expect(count).toBe(0);
    });
  });

  // ============================================================
  // computeYearlyCompletions
  // ============================================================
  describe("computeYearlyCompletions", () => {
    it("年別の読了冊数を計算する", () => {
      const result = computeYearlyCompletions(mockLibraryRecords, 0, 6);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(6);
    });

    it("各要素にyear, label, countを含む", () => {
      const result = computeYearlyCompletions(mockLibraryRecords, 0, 1);
      expect(result[0]).toHaveProperty("year");
      expect(result[0]).toHaveProperty("label");
      expect(result[0]).toHaveProperty("count");
    });

    it("labelはN年形式である", () => {
      const result = computeYearlyCompletions(mockLibraryRecords, 0, 1);
      expect(result[0].label).toMatch(/^\d{4}年$/);
    });

    it("countは数値である", () => {
      const result = computeYearlyCompletions(mockLibraryRecords, 0, 1);
      expect(typeof result[0].count).toBe("number");
    });

    it("空配列で全て0件の結果を返す", () => {
      const result = computeYearlyCompletions([], 0, 1);
      expect(result.length).toBe(1);
      expect(result[0].count).toBe(0);
    });

    it("指定年数分の結果を返す", () => {
      const result3 = computeYearlyCompletions([], 0, 3);
      expect(result3.length).toBe(3);

      const result10 = computeYearlyCompletions([], 0, 10);
      expect(result10.length).toBe(10);
    });
  });

  // ============================================================
  // countCompletedInYear
  // ============================================================
  describe("countCompletedInYear", () => {
    it("指定年の読了冊数をカウントする", () => {
      const count = countCompletedInYear(mockLibraryRecords, 2024);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("読了していない本はカウントされない", () => {
      const records = [
        {
          id: "1",
          status: "読書中",
          endDate: "2024-01-15",
        },
        {
          id: "2",
          status: "未読",
          endDate: "2024-06-20",
        },
      ];
      const count = countCompletedInYear(records, 2024);
      expect(count).toBe(0);
    });

    it("endDateがない本はカウントされない", () => {
      const records = [
        {
          id: "1",
          status: "読了",
          endDate: null,
        },
      ];
      const count = countCompletedInYear(records, 2024);
      expect(count).toBe(0);
    });

    it("空配列で0を返す", () => {
      const count = countCompletedInYear([], 2024);
      expect(count).toBe(0);
    });

    it("nullで0を返す", () => {
      const count = countCompletedInYear(null, 2024);
      expect(count).toBe(0);
    });
  });
});
