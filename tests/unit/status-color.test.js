import { describe, it, expect } from "vitest";
import { getStatusColor } from "../../src/utils/status-color";

/**
 * テスト設計思想：安定性重視
 * - ステータスごとの色クラス取得ロジックを検証
 * - 各ステータスが正確な Tailwind CSS クラスを返すことを確認
 * - null/undefined や未知のステータスでもデフォルト色を返すことを確認
 */

describe("status-color.js", () => {
  describe("getStatusColor", () => {
    it("関数が存在する", () => {
      expect(typeof getStatusColor).toBe("function");
    });

    // ========================================
    // 各ステータスの色クラスを検証
    // ========================================

    it("「読書中」ステータスでsky色クラスを返す", () => {
      const result = getStatusColor("読書中");
      expect(result).toBe("bg-sky-50 text-sky-700 border-sky-200/60");
    });

    it("「読了」ステータスでemerald色クラスを返す", () => {
      const result = getStatusColor("読了");
      expect(result).toBe(
        "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      );
    });

    it("「未読」ステータスでzinc色クラスを返す", () => {
      const result = getStatusColor("未読");
      expect(result).toBe("bg-zinc-100 text-zinc-600 border-zinc-200/80");
    });

    // ========================================
    // エッジケースとデフォルト値の検証
    // ========================================

    it("null でもデフォルト色（zinc）を返す", () => {
      const result = getStatusColor(null);
      expect(result).toBe("bg-zinc-100 text-zinc-600 border-zinc-200/80");
    });

    it("undefined でもデフォルト色（zinc）を返す", () => {
      const result = getStatusColor(undefined);
      expect(result).toBe("bg-zinc-100 text-zinc-600 border-zinc-200/80");
    });

    it("空文字列でもデフォルト色（zinc）を返す", () => {
      const result = getStatusColor("");
      expect(result).toBe("bg-zinc-100 text-zinc-600 border-zinc-200/80");
    });

    it("未知のステータスでデフォルト色（zinc）を返す", () => {
      const result = getStatusColor("進行中");
      expect(result).toBe("bg-zinc-100 text-zinc-600 border-zinc-200/80");
    });

    // ========================================
    // 色クラスの構造検証
    // ========================================

    it("すべての色クラスが「背景」「テキスト」「枠線」を含む", () => {
      const statuses = ["読書中", "読了", "未読"];
      for (const status of statuses) {
        const result = getStatusColor(status);
        expect(result).toMatch(/^bg-/);
        expect(result).toContain("text-");
        expect(result).toContain("border-");
      }
    });

    it("Tailwind CSS のカラースキームを使用", () => {
      const result1 = getStatusColor("読書中");
      expect(result1).toMatch(/bg-\w+-\d+/);
      expect(result1).toMatch(/text-\w+-\d+/);
      expect(result1).toMatch(/border-\w+-\d+(\/\d+)?/);
    });

    // ========================================
    // 一貫性の検証
    // ========================================

    it("同じステータスで常に同じ色を返す", () => {
      const result1 = getStatusColor("読了");
      const result2 = getStatusColor("読了");
      const result3 = getStatusColor("読了");
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it("デフォルト値は「未読」と同じ", () => {
      const unread = getStatusColor("未読");
      const unknown = getStatusColor("不明なステータス");
      expect(unread).toBe(unknown);
    });

    // ========================================
    // 色彩設計の確認
    // ========================================

    it("各ステータスが異なる色を使用", () => {
      const colors = new Set();
      colors.add(getStatusColor("読書中"));
      colors.add(getStatusColor("読了"));
      colors.add(getStatusColor("未読"));
      expect(colors.size).toBe(3); // 3つのステータスで異なる色
    });

    it("「読書中」と「読了」は異なる色", () => {
      const reading = getStatusColor("読書中");
      const completed = getStatusColor("読了");
      expect(reading).not.toBe(completed);
    });

    it("「読書中」と「未読」は異なる色", () => {
      const reading = getStatusColor("読書中");
      const unread = getStatusColor("未読");
      expect(reading).not.toBe(unread);
    });

    it("「読了」と「未読」は異なる色", () => {
      const completed = getStatusColor("読了");
      const unread = getStatusColor("未読");
      expect(completed).not.toBe(unread);
    });

    // ========================================
    // 色クラスの正確性の詳細検証
    // ========================================

    it("「読書中」は sky スキームを使用", () => {
      const result = getStatusColor("読書中");
      expect(result).toContain("bg-sky-50");
      expect(result).toContain("text-sky-700");
      expect(result).toContain("border-sky-200/60");
    });

    it("「読了」は emerald スキームを使用", () => {
      const result = getStatusColor("読了");
      expect(result).toContain("bg-emerald-50");
      expect(result).toContain("text-emerald-700");
      expect(result).toContain("border-emerald-200/60");
    });

    it("「未読」は zinc スキームを使用", () => {
      const result = getStatusColor("未読");
      expect(result).toContain("bg-zinc-100");
      expect(result).toContain("text-zinc-600");
      expect(result).toContain("border-zinc-200/80");
    });
  });
});
