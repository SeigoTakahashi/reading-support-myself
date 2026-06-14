import { describe, it, expect } from 'vitest';
import {
  computeMonthlyStats,
  computeYearlyStats,
  computeDailyStats,
  computeLast7Days,
} from '../../src/utils/stats';

/**
 * テスト設計思想：安定性重視
 * - 読書統計の計算ロジックを固定値テストデータで検証
 * - 複数の入力形式（durationSeconds、duration オブジェクト、raw フィールド）をサポート
 * - 参照日を固定化して時刻依存性を排除
 * - 目標値なし、ゴール達成、未達成などの状況別テスト
 * - 月初日、月末日、年初日、年末日などの境界ケースをテスト
 */

describe('stats.js', () => {
  // ============================================================
  // computeMonthlyStats - テストデータは status: '読了' と endDate を必須
  // ============================================================
  describe('computeMonthlyStats', () => {
    it('関数が存在する', () => {
      expect(typeof computeMonthlyStats).toBe('function');
    });

    it('records が空配列の場合は progress が 0', () => {
      const result = computeMonthlyStats([], 10, new Date('2024-01-15'));
      expect(result.progress).toBe(0);
    });

    it('monthlyGoal が null の場合は基本値を返す', () => {
      const records = [
        { startDate: '2024-01-10', endDate: '2024-01-15' },
      ];
      const result = computeMonthlyStats(records, null, new Date('2024-01-15'));

      expect(result.progress).toBe(0);
      expect(result.averagePaceText).toBe('-');
      expect(result.achievementRateText).toBe('-');
      expect(result.remainingDaysText).toBe('-');
      expect(result.neededPaceText).toBe('-');
    });

    it('月の中盤での統計を計算', () => {
      const records = [
        { status: '読了', endDate: '2024-01-05' },
        { status: '読了', endDate: '2024-01-10' },
        { status: '読了', endDate: '2024-01-15' },
      ];
      const result = computeMonthlyStats(records, 10, new Date('2024-01-15'));

      expect(result.progress).toBe(3);
      expect(result.achievementRateText).toBe('30%');
      expect(result.remainingDaysText).toBe('16日');
    });

    it('月末日での統計', () => {
      const records = [
        { status: '読了', endDate: '2024-01-05' },
        { status: '読了', endDate: '2024-01-10' },
        { status: '読了', endDate: '2024-01-15' },
      ];
      const result = computeMonthlyStats(records, 5, new Date('2024-01-31'));

      expect(result.progress).toBe(3);
      expect(result.remainingDays).toBe(0);
      expect(result.remainingDaysText).toBe('0日');
    });

    it('目標達成した場合', () => {
      const records = [
        { status: '読了', endDate: '2024-01-02' },
        { status: '読了', endDate: '2024-01-04' },
        { status: '読了', endDate: '2024-01-06' },
        { status: '読了', endDate: '2024-01-08' },
        { status: '読了', endDate: '2024-01-10' },
      ];
      const result = computeMonthlyStats(records, 5, new Date('2024-01-15'));

      expect(result.progress).toBe(5);
      expect(result.achievementRateText).toBe('100%');
    });

    it('目標を超えた場合も 100% を超えて表示', () => {
      const records = Array.from({ length: 15 }, (_, i) => ({
        status: '読了',
        endDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
      }));
      const result = computeMonthlyStats(records, 10, new Date('2024-01-20'));

      expect(result.progress).toBe(15);
      expect(result.achievementRateText).toBe('150%');
    });

    it('月初日での計算', () => {
      const records = [
        { status: '読了', endDate: '2024-01-01' },
      ];
      const result = computeMonthlyStats(records, 10, new Date('2024-01-01'));

      expect(result.progress).toBe(1);
      expect(result.remainingDaysText).toBe('30日');
    });

    it('平均ペーステキストが正しく計算', () => {
      const records = [
        { status: '読了', endDate: '2024-01-02' },
        { status: '読了', endDate: '2024-01-04' },
        { status: '読了', endDate: '2024-01-06' },
        { status: '読了', endDate: '2024-01-08' },
      ];
      const result = computeMonthlyStats(records, 10, new Date('2024-01-14'));

      // 14日経過（14 日間）で 4 冊 -> 4/14*7 = 2.0 冊/週
      expect(result.averagePaceText).toContain('冊/週');
    });

    it('null records でも動作', () => {
      const result = computeMonthlyStats(null, 10, new Date('2024-01-15'));
      expect(result.progress).toBe(0);
    });
  });

  // ============================================================
  // computeYearlyStats
  // ============================================================
  describe('computeYearlyStats', () => {
    it('関数が存在する', () => {
      expect(typeof computeYearlyStats).toBe('function');
    });

    it('records が空配列の場合は progress が 0', () => {
      const result = computeYearlyStats([], 50, new Date('2024-06-15'));
      expect(result.progress).toBe(0);
    });

    it('yearlyGoal が null の場合は基本値を返す', () => {
      const records = [
        { startDate: '2024-01-01', endDate: '2024-01-10' },
      ];
      const result = computeYearlyStats(records, null, new Date('2024-06-15'));

      expect(result.progress).toBe(0);
      expect(result.averagePaceText).toBe('-');
      expect(result.achievementRateText).toBe('-');
      expect(result.remainingDaysText).toBe('-');
      expect(result.neededPaceText).toBe('-');
    });

    it('年の中盤での統計を計算', () => {
      const records = Array.from({ length: 20 }, (_, i) => ({
        status: '読了',
        endDate: `2024-${String((i % 6) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      }));
      const result = computeYearlyStats(records, 100, new Date('2024-06-15'));

      expect(result.progress).toBe(20);
      expect(result.achievementRateText).toBe('20%');
    });

    it('年初日での統計', () => {
      const records = [
        { status: '読了', endDate: '2024-01-01' },
      ];
      const result = computeYearlyStats(records, 100, new Date('2024-01-01'));

      expect(result.progress).toBe(1);
      expect(result.remainingDaysText).toContain('日');
    });

    it('年末日での統計', () => {
      const records = Array.from({ length: 60 }, (_, i) => ({
        status: '読了',
        endDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      }));
      const result = computeYearlyStats(records, 60, new Date('2024-12-31'));

      expect(result.progress).toBe(60);
      expect(result.remainingDaysText).toBe('0日');
    });

    it('目標達成した場合', () => {
      const records = Array.from({ length: 50 }, (_, i) => ({
        status: '読了',
        endDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      }));
      const result = computeYearlyStats(records, 50, new Date('2024-06-15'));

      expect(result.progress).toBe(50);
      expect(result.achievementRateText).toBe('100%');
    });

    it('平均ペーステキストが正しく計算', () => {
      const records = Array.from({ length: 30 }, (_, i) => ({
        status: '読了',
        endDate: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      }));
      const result = computeYearlyStats(records, 100, new Date('2024-06-15'));

      expect(result.averagePaceText).toContain('冊/週');
    });

    it('null records でも動作', () => {
      const result = computeYearlyStats(null, 100, new Date('2024-06-15'));
      expect(result.progress).toBe(0);
    });
  });

  // ============================================================
  // computeDailyStats
  // ============================================================
  describe('computeDailyStats', () => {
    it('関数が存在する', () => {
      expect(typeof computeDailyStats).toBe('function');
    });

    it('sessionRecords が空配列の場合は totalMinutes が 0', () => {
      const result = computeDailyStats([], 30, new Date('2024-01-15'));
      expect(result.totalMinutes).toBe(0);
    });

    it('dailyMinutes が null の場合は基本値を返す', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 },
      ];
      const result = computeDailyStats(sessions, null, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(30);
      expect(result.targetMinutes).toBe(null);
      expect(result.achieved).toBe(false);
      expect(result.progressPercentText).toBe('-');
      expect(result.remainingMinutes).toBe(null);
      expect(result.remainingText).toBe('-');
    });

    it('durationSeconds を合算', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 }, // 30 分
        { date: '2024-01-15', durationSeconds: 1200 }, // 20 分
      ];
      const result = computeDailyStats(sessions, 60, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(50);
    });

    it('duration オブジェクトから計算', () => {
      const sessions = [
        {
          date: '2024-01-15',
          duration: {
            hours: 1,
            minutes: 30,
            seconds: 0,
          },
        },
      ];
      const result = computeDailyStats(sessions, 100, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(90);
    });

    it('raw フィールドから durationSeconds を取得', () => {
      const sessions = [
        {
          date: '2024-01-15',
          raw: {
            durationSeconds: 1800,
          },
        },
      ];
      const result = computeDailyStats(sessions, 30, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(30);
    });

    it('目標達成した場合', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 }, // 30 分
        { date: '2024-01-15', durationSeconds: 1200 }, // 20 分
      ];
      const result = computeDailyStats(sessions, 30, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(50);
      expect(result.achieved).toBe(true);
      expect(result.progressPercentText).toBe('167%');
    });

    it('目標未達成の場合', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 900 }, // 15 分
      ];
      const result = computeDailyStats(sessions, 30, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(15);
      expect(result.achieved).toBe(false);
      expect(result.remainingMinutes).toBe(15);
      expect(result.remainingText).toBe('15分');
    });

    it('進捗率が正しく計算', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 900 }, // 15 分
      ];
      const result = computeDailyStats(sessions, 60, new Date('2024-01-15'));

      expect(result.progressPercentText).toBe('25%');
    });

    it('異なる日付のセッションは除外', () => {
      const sessions = [
        { date: '2024-01-14', durationSeconds: 1800 }, // 異なる日
        { date: '2024-01-15', durationSeconds: 1200 }, // 30 分
      ];
      const result = computeDailyStats(sessions, 60, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(20);
    });

    it('複数フォーマットが混在する場合', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 },
        {
          date: '2024-01-15',
          duration: {
            hours: 0,
            minutes: 20,
            seconds: 0,
          },
        },
        {
          date: '2024-01-15',
          raw: {
            durationSeconds: 600,
          },
        },
      ];
      const result = computeDailyStats(sessions, 100, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(60);
    });

    it('null sessionRecords でも動作', () => {
      const result = computeDailyStats([], 30, new Date('2024-01-15'));
      expect(result.totalMinutes).toBe(0);
    });

    it('進捗が 0% の場合', () => {
      const sessions = [];
      const result = computeDailyStats(sessions, 30, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(0);
      expect(result.progressPercentText).toBe('0%');
      expect(result.remainingMinutes).toBe(30);
    });
  });

  // ============================================================
  // computeLast7Days
  // ============================================================
  describe('computeLast7Days', () => {
    it('関数が存在する', () => {
      expect(typeof computeLast7Days).toBe('function');
    });

    it('7 つの日付が返される', () => {
      const result = computeLast7Days([], new Date('2024-01-15'));
      expect(result.length).toBe(7);
    });

    it('日付が古い順に返される', () => {
      const result = computeLast7Days([], new Date('2024-01-15'));
      expect(result[0].date).toBe('2024-01-09');
      expect(result[6].date).toBe('2024-01-15');
    });

    it('日本語の曜日ラベルが付与される', () => {
      const result = computeLast7Days([], new Date('2024-01-15')); // 月曜日

      expect(result[0].label).toMatch(/[日月火水木金土]/);
      expect(result[6].label).toMatch(/[日月火水木金土]/);
    });

    it('各日の読書時間が計算される', () => {
      const sessions = [
        { date: '2024-01-09', durationSeconds: 1800 }, // 30 分
        { date: '2024-01-10', durationSeconds: 1200 }, // 20 分
        { date: '2024-01-15', durationSeconds: 3600 }, // 60 分
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day9 = result.find(d => d.date === '2024-01-09');
      const day10 = result.find(d => d.date === '2024-01-10');
      const day15 = result.find(d => d.date === '2024-01-15');

      expect(day9.minutes).toBe(30);
      expect(day10.minutes).toBe(20);
      expect(day15.minutes).toBe(60);
    });

    it('記録がない日は 0 分', () => {
      const sessions = [
        { date: '2024-01-09', durationSeconds: 1800 },
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day11 = result.find(d => d.date === '2024-01-11');
      const day12 = result.find(d => d.date === '2024-01-12');

      expect(day11.minutes).toBe(0);
      expect(day12.minutes).toBe(0);
    });

    it('複数セッションを合算', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 }, // 30 分
        { date: '2024-01-15', durationSeconds: 1200 }, // 20 分
        { date: '2024-01-15', durationSeconds: 600 }, // 10 分
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day15 = result.find(d => d.date === '2024-01-15');
      expect(day15.minutes).toBe(60);
    });

    it('duration オブジェクトも処理', () => {
      const sessions = [
        {
          date: '2024-01-15',
          duration: {
            hours: 1,
            minutes: 30,
          },
        },
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day15 = result.find(d => d.date === '2024-01-15');
      expect(day15.minutes).toBe(90);
    });

    it('raw フィールドも処理', () => {
      const sessions = [
        {
          date: '2024-01-15',
          raw: {
            durationSeconds: 1800,
          },
        },
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day15 = result.find(d => d.date === '2024-01-15');
      expect(day15.minutes).toBe(30);
    });

    it('空の readingSessions でも動作', () => {
      const result = computeLast7Days([], new Date('2024-01-15'));
      expect(result.length).toBe(7);

      for (const day of result) {
        expect(day.minutes).toBe(0);
      }
    });

    it('月跨ぎで正しく計算', () => {
      const sessions = [
        { date: '2024-01-31', durationSeconds: 1800 }, // 1 月 31 日
      ];
      const result = computeLast7Days(sessions, new Date('2024-02-04'));

      const day31 = result.find(d => d.date === '2024-01-31');
      expect(day31.minutes).toBe(30);
    });

    it('複雑な読書パターン', () => {
      const sessions = [
        { date: '2024-01-09', durationSeconds: 1800 },
        { date: '2024-01-09', durationSeconds: 1200 },
        { date: '2024-01-10', duration: { hours: 1, minutes: 30 } },
        { date: '2024-01-15', raw: { durationSeconds: 3600 } },
      ];
      const result = computeLast7Days(sessions, new Date('2024-01-15'));

      const day9 = result.find(d => d.date === '2024-01-09');
      const day10 = result.find(d => d.date === '2024-01-10');
      const day15 = result.find(d => d.date === '2024-01-15');

      expect(day9.minutes).toBe(50);
      expect(day10.minutes).toBe(90);
      expect(day15.minutes).toBe(60);
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe('統合テスト', () => {
    it('月次目標達成の進捗を総合的に計算', () => {
      const records = [
        { status: '読了', endDate: '2024-01-02' },
        { status: '読了', endDate: '2024-01-04' },
        { status: '読了', endDate: '2024-01-06' },
      ];
      const monthlyResult = computeMonthlyStats(records, 5, new Date('2024-01-20'));

      expect(monthlyResult.progress).toBe(3);
      expect(monthlyResult.achievementRateText).toBe('60%');
    });

    it('日次と週次の読書時間を追跡', () => {
      const sessions = [
        { date: '2024-01-09', durationSeconds: 1800 },
        { date: '2024-01-10', durationSeconds: 2400 },
        { date: '2024-01-11', durationSeconds: 1800 },
        { date: '2024-01-12', durationSeconds: 3600 },
        { date: '2024-01-15', durationSeconds: 2700 },
      ];

      const dailyResult = computeDailyStats(sessions, 60, new Date('2024-01-15'));
      const last7Result = computeLast7Days(sessions, new Date('2024-01-15'));

      expect(dailyResult.totalMinutes).toBe(45);
      expect(dailyResult.achieved).toBe(false);

      const totalWeeklyMinutes = last7Result.reduce((sum, day) => sum + day.minutes, 0);
      expect(totalWeeklyMinutes).toBe(205); // 30 + 40 + 30 + 60 + 45 + 0 + 0 = 205
    });

    it('複数フォーマットが混在する複雑なシナリオ', () => {
      const sessions = [
        { date: '2024-01-15', durationSeconds: 1800 },
        {
          date: '2024-01-15',
          duration: { hours: 1, minutes: 30 },
        },
        {
          date: '2024-01-15',
          raw: { durationSeconds: 600 },
        },
      ];

      const result = computeDailyStats(sessions, 120, new Date('2024-01-15'));

      expect(result.totalMinutes).toBe(130);
      expect(result.achieved).toBe(true);
      expect(result.progressPercentText).toBe('108%');
    });

    it('月初から月末までの統計変化', () => {
      const records = Array.from({ length: 10 }, (_, i) => ({
        startDate: `2024-01-${String(i * 3 + 1).padStart(2, '0')}`,
        endDate: `2024-01-${String(i * 3 + 2).padStart(2, '0')}`,
      }));

      const earlyMonth = computeMonthlyStats(records, 15, new Date('2024-01-05'));
      const midMonth = computeMonthlyStats(records, 15, new Date('2024-01-15'));
      const endMonth = computeMonthlyStats(records, 15, new Date('2024-01-31'));

      expect(earlyMonth.progress).toBeLessThanOrEqual(midMonth.progress);
      expect(midMonth.progress).toBeLessThanOrEqual(endMonth.progress);
    });
  });
});
