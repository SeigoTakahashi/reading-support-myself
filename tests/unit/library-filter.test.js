import { describe, it, expect } from "vitest";
import { applyFilters } from "../../src/utils/library-filter";

// テスト用の本データ群
const baseBooks = [
  {
    id: "b1",
    title: "あいうえお",
    authors: "著者A",
    tags: ["fiction", "classic"],
    genre: "Novel",
    createdAt: "2025年10月19日 11:41:30 UTC+9", // 日本語日時
    publishedDate: "1999-10-01",
    rating: 4.5,
    status: "読了",
  },
  {
    id: "b2",
    title: "かきくけこ",
    authors: "著者B",
    tags: ["essay", "life"],
    genre: "Essay",
    createdAt: "2025-10-18T02:30:00Z", // ISO UTC
    publishedDate: "2005-05-20",
    rating: 3,
    status: "読書中",
  },
  {
    id: "b3",
    title: "さしすせそ",
    authors: "著者C",
    tags: ["fiction", "mystery"],
    genre: "Novel",
    createdAt: 1697620000, // 秒数（例）
    publishedDate: "2010-01-01",
    rating: 5,
    status: "未読",
  },
];

describe("library-filter.applyFilters", () => {
  // 検索クエリによるフィルタリングテスト
  it("search by title or authors or tags", () => {
    const res = applyFilters(baseBooks, {
      searchQuery: "かき",
      filterStatus: "all",
      sortBy: "created-newest",
    });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe("b2");

    const res2 = applyFilters(baseBooks, {
      searchQuery: "fiction",
      filterStatus: "all",
      sortBy: "created-newest",
    });
    expect(res2.length).toBe(2);
  });

  // 読書状況ステータスフィルタリングテスト
  it("filter by status", () => {
    const res = applyFilters(baseBooks, {
      filterStatus: "completed",
      searchQuery: "",
      sortBy: "created-newest",
    });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe("b1");
  });

  // ソート順による並び替えテスト
  // 追加日のソートテスト
  it("sort by created newest/oldest", () => {
    const newest = applyFilters(baseBooks, {
      sortBy: "created-newest",
      filterStatus: "all",
      searchQuery: "",
    });
    const oldest = applyFilters(baseBooks, {
      sortBy: "created-oldest",
      filterStatus: "all",
      searchQuery: "",
    });

    // newest の先頭は b1（2025-10-19）であること
    expect(newest[0].id).toBe("b1");
    // oldest の先頭は b3（秒数として小さい）であること
    expect(oldest[0].id).toBe("b3");
  });

  // 発行日のソートテスト
  it("sort by published date", () => {
    const pn = applyFilters(baseBooks, {
      sortBy: "published-newest",
      filterStatus: "all",
      searchQuery: "",
    });
    expect(pn[0].id).toBe("b3"); // 2010
    const po = applyFilters(baseBooks, {
      sortBy: "published-oldest",
      filterStatus: "all",
      searchQuery: "",
    });
    expect(po[0].id).toBe("b1"); // 1999
  });
});
