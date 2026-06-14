import { describe, it, expect } from 'vitest';
import {
  toMilliseconds,
  formatJapaneseDate,
  parseToDate,
  formatSeconds,
  pad,
  toDateStr,
  toNumber,
  formatDuration,
} from '../../src/utils/format-datetime';

/**
 * テスト設計思想：安定性重視
 * - 多様な入力形式（Date, 数値, 文字列, Timestamp等）に対応
 * - エッジケース（null, undefined, 無効な値）を安全に処理
 * - 日本語日時フォーマットの解析精度を確認
 * - エラーが発生せず予測可能な値を返すことを重視
 */

describe('format-datetime.js', () => {
  // ============================================================
  // toMilliseconds
  // ============================================================
  describe('toMilliseconds', () => {
    it('nullを0に変換', () => {
      expect(toMilliseconds(null)).toBe(0);
    });

    it('undefinedを0に変換', () => {
      expect(toMilliseconds(undefined)).toBe(0);
    });

    it('秒単位の数値をミリ秒に変換', () => {
      const seconds = 1000;
      const result = toMilliseconds(seconds);
      expect(result).toBe(seconds * 1000);
    });

    it('すでにミリ秒の数値はそのまま返す', () => {
      const milliseconds = 1609459200000; // 2021-01-01 00:00:00 UTC
      const result = toMilliseconds(milliseconds);
      expect(result).toBe(milliseconds);
    });

    it('Dateオブジェクトをミリ秒に変換', () => {
      const date = new Date('2024-01-01');
      const result = toMilliseconds(date);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('ISO形式の文字列をパースできる', () => {
      const isoStr = '2024-01-15T10:30:00Z';
      const result = toMilliseconds(isoStr);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('日本語形式の日時文字列をパースできる', () => {
      const jpStr = '2024年1月15日 10:30:00 UTC+9';
      const result = toMilliseconds(jpStr);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('Firestore Timestampオブジェクト（toDate）に対応', () => {
      const timestamp = {
        toDate: () => new Date('2024-01-01'),
      };
      const result = toMilliseconds(timestamp);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('Firestore Timestamp（seconds/nanoseconds）に対応', () => {
      const timestamp = {
        seconds: 1704067200,
        nanoseconds: 500000000,
      };
      const result = toMilliseconds(timestamp);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('無効な文字列を0に変換', () => {
      const result = toMilliseconds('invalid date string');
      expect(result).toBe(0);
    });

    it('不正なオブジェクトを0に変換', () => {
      const result = toMilliseconds({});
      expect(result).toBe(0);
    });

    it('toDate関数がエラーを投げても0を返す', () => {
      const timestamp = {
        toDate: () => {
          throw new Error('Timestamp error');
        },
      };
      const result = toMilliseconds(timestamp);
      expect(result).toBe(0);
    });
  });

  // ============================================================
  // formatJapaneseDate
  // ============================================================
  describe('formatJapaneseDate', () => {
    it('Dateオブジェクトを "yyyy-MM-dd" にフォーマット', () => {
      const date = new Date('2024-01-15');
      const result = formatJapaneseDate(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('ISO文字列をフォーマット', () => {
      const result = formatJapaneseDate('2024-01-15');
      expect(result).toBe('2024-01-15');
    });

    it('nullを "-" に変換', () => {
      const result = formatJapaneseDate(null);
      expect(result).toBe('-');
    });

    it('undefinedを "-" に変換', () => {
      const result = formatJapaneseDate(undefined);
      expect(result).toBe('-');
    });

    it('無効な値を "-" に変換', () => {
      const result = formatJapaneseDate('invalid');
      expect(result).toBe('-');
    });

    it('0を "-" に変換', () => {
      const result = formatJapaneseDate(0);
      expect(result).toBe('-');
    });

    it('ミリ秒の数値をフォーマット', () => {
      const millis = new Date('2024-01-15').getTime();
      const result = formatJapaneseDate(millis);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('月と日が2桁でパディングされる', () => {
      const date = new Date('2024-01-01');
      const result = formatJapaneseDate(date);
      expect(result).toBe('2024-01-01');
    });

    it('単月単日も2桁でパディングされる', () => {
      const date = new Date('2024-03-05');
      const result = formatJapaneseDate(date);
      expect(result).toBe('2024-03-05');
    });
  });

  // ============================================================
  // parseToDate
  // ============================================================
  describe('parseToDate', () => {
    it('Dateオブジェクトを返す', () => {
      const date = new Date('2024-01-15');
      const result = parseToDate(date);
      expect(result instanceof Date).toBe(true);
    });

    it('ISO文字列をDateに変換', () => {
      const result = parseToDate('2024-01-15');
      expect(result instanceof Date).toBe(true);
    });

    it('ミリ秒の数値をDateに変換', () => {
      const millis = new Date('2024-01-15').getTime();
      const result = parseToDate(millis);
      expect(result instanceof Date).toBe(true);
    });

    it('nullでnullを返す', () => {
      const result = parseToDate(null);
      expect(result).toBeNull();
    });

    it('undefinedでnullを返す', () => {
      const result = parseToDate(undefined);
      expect(result).toBeNull();
    });

    it('無効な文字列でnullを返す', () => {
      const result = parseToDate('invalid date');
      expect(result).toBeNull();
    });

    it('0でnullを返す', () => {
      const result = parseToDate(0);
      expect(result).toBeNull();
    });

    it('Timestamp.toDate()を持つオブジェクトに対応', () => {
      const timestamp = {
        toDate: () => new Date('2024-01-15'),
      };
      const result = parseToDate(timestamp);
      expect(result instanceof Date).toBe(true);
    });

    it('Timestamp.seconds/nanosecondsに対応', () => {
      const timestamp = {
        seconds: 1704067200,
        nanoseconds: 0,
      };
      const result = parseToDate(timestamp);
      expect(result instanceof Date).toBe(true);
    });
  });

  // ============================================================
  // formatSeconds
  // ============================================================
  describe('formatSeconds', () => {
    it('秒数を "X時間 Y分" に変換', () => {
      const result = formatSeconds(3665); // 1時間 1分 5秒
      expect(result).toBe('1時間 1分');
    });

    it('1時間未満は分のみ表示', () => {
      const result = formatSeconds(600); // 10分
      expect(result).toBe('10分');
    });

    it('1分未満は秒で表示', () => {
      const result = formatSeconds(45);
      expect(result).toBe('45秒');
    });

    it('0秒', () => {
      const result = formatSeconds(0);
      expect(result).toBe('0秒');
    });

    it('nullを0秒として扱う', () => {
      const result = formatSeconds(null);
      expect(result).toBe('0秒');
    });

    it('undefinedを0秒として扱う', () => {
      const result = formatSeconds(undefined);
      expect(result).toBe('0秒');
    });

    it('文字列を数値に変換して処理', () => {
      const result = formatSeconds('600');
      expect(result).toBe('10分');
    });

    it('複数時間の表示', () => {
      const result = formatSeconds(7325); // 2時間 2分 5秒
      expect(result).toBe('2時間 2分');
    });
  });

  // ============================================================
  // pad
  // ============================================================
  describe('pad', () => {
    it('1桁を2桁にパディング', () => {
      const result = pad(5);
      expect(result).toBe('05');
    });

    it('2桁はそのまま', () => {
      const result = pad(25);
      expect(result).toBe('25');
    });

    it('カスタム桁数でパディング', () => {
      const result = pad(5, 3);
      expect(result).toBe('005');
    });

    it('既に足りている桁数はパディングしない', () => {
      const result = pad(123, 2);
      expect(result).toBe('123');
    });

    it('0をパディング', () => {
      const result = pad(0);
      expect(result).toBe('00');
    });

    it('負の数をパディング', () => {
      const result = pad(-5);
      expect(result).toBe('-5');
    });

    it('文字列を数値に変換してパディング', () => {
      const result = pad('5');
      expect(result).toBe('05');
    });
  });

  // ============================================================
  // toDateStr
  // ============================================================
  describe('toDateStr', () => {
    it('Dateを "yyyy-MM-dd" に変換', () => {
      const date = new Date('2024-01-15');
      const result = toDateStr(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('ISO文字列をそのまま返す', () => {
      const isoStr = '2024-01-15';
      const result = toDateStr(isoStr);
      expect(result).toBe('2024-01-15');
    });

    it('nullを空文字列に変換', () => {
      const result = toDateStr(null);
      expect(result).toBe('');
    });

    it('undefinedを空文字列に変換', () => {
      const result = toDateStr(undefined);
      expect(result).toBe('');
    });

    it('月と日が2桁でパディング', () => {
      const date = new Date('2024-01-05');
      const result = toDateStr(date);
      expect(result).toBe('2024-01-05');
    });

    it('ミリ秒の数値をDateとして扱う', () => {
      const millis = new Date('2024-01-15').getTime();
      const result = toDateStr(millis);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('0を空文字列に変換', () => {
      const result = toDateStr(0);
      expect(result).toBe('');
    });
  });

  // ============================================================
  // toNumber
  // ============================================================
  describe('toNumber', () => {
    it('数値をそのまま返す', () => {
      expect(toNumber(42)).toBe(42);
    });

    it('文字列を数値に変換', () => {
      expect(toNumber('42')).toBe(42);
    });

    it('小数を数値に変換', () => {
      expect(toNumber('3.14')).toBe(3.14);
    });

    it('nullを0に変換', () => {
      expect(toNumber(null)).toBe(0);
    });

    it('undefinedを0に変換', () => {
      expect(toNumber(undefined)).toBe(0);
    });

    it('無効な文字列を0に変換', () => {
      expect(toNumber('invalid')).toBe(0);
    });

    it('空文字列を0に変換', () => {
      expect(toNumber('')).toBe(0);
    });

    it('負の数を変換', () => {
      expect(toNumber('-42')).toBe(-42);
    });

    it('Infinityを処理', () => {
      const result = toNumber('Infinity');
      expect(result).toBe(Infinity); // Number('Infinity') は Infinity を返す
    });

    it('先頭の空白を無視', () => {
      expect(toNumber('  42  ')).toBe(42);
    });
  });

  // ============================================================
  // formatDuration
  // ============================================================
  describe('formatDuration', () => {
    it('秒数を "X時間Y分" に変換', () => {
      const result = formatDuration(3665); // 1時間 1分 5秒
      expect(result).toBe('1時間1分');
    });

    it('1時間未満は分のみ表示', () => {
      const result = formatDuration(600); // 10分
      expect(result).toBe('10分');
    });

    it('ちょうど1時間', () => {
      const result = formatDuration(3600);
      expect(result).toBe('1時間');
    });

    it('複数時間', () => {
      const result = formatDuration(7325); // 2時間 2分 5秒
      expect(result).toBe('2時間2分');
    });

    it('0を "0分" に変換', () => {
      const result = formatDuration(0);
      expect(result).toBe('0分');
    });

    it('nullを "0分" に変換', () => {
      const result = formatDuration(null);
      expect(result).toBe('0分');
    });

    it('undefinedを "0分" に変換', () => {
      const result = formatDuration(undefined);
      expect(result).toBe('0分');
    });

    it('負の数を "0分" に変換', () => {
      const result = formatDuration(-100);
      expect(result).toBe('0分');
    });

    it('文字列を数値に変換して処理', () => {
      const result = formatDuration('600');
      expect(result).toBe('10分');
    });

    it('小数秒は切り捨て', () => {
      const result = formatDuration(3661.5); // 1時間 1分 1.5秒
      expect(result).toBe('1時間1分');
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe('統合テスト', () => {
    it('日付の往復変換が保持される', () => {
      const originalDate = new Date('2024-01-15T10:30:00Z');
      const dateStr = toDateStr(originalDate);
      const parsedDate = parseToDate(dateStr);
      
      // 日付部分は一致（時刻は文字列化で失われる）
      expect(formatJapaneseDate(originalDate)).toBe(dateStr);
      expect(formatJapaneseDate(parsedDate)).toBe(dateStr);
    });

    it('複数形式の入力が同じ結果を生成', () => {
      const isoStr = '2024-01-15';
      const date = new Date('2024-01-15');
      const millis = date.getTime();

      const result1 = formatJapaneseDate(isoStr);
      const result2 = formatJapaneseDate(date);
      const result3 = formatJapaneseDate(millis);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('時間フォーマットの統一性', () => {
      const seconds = 5465; // 1時間 31分 5秒

      const fmt1 = formatSeconds(seconds);
      const fmt2 = formatDuration(seconds);

      // 両者とも "1時間" を含む
      expect(fmt1).toContain('1時間');
      expect(fmt2).toContain('1時間');
      expect(fmt1).toContain('31分');
      expect(fmt2).toContain('31分');
    });

    it('ユーザー入力の耐性テスト', () => {
      const inputs = [
        null,
        undefined,
        '',
        'invalid',
        NaN,
        Infinity,
        -1,
        {},
        [],
      ];

      for (const input of inputs) {
        // エラーが発生せず、予測可能な値を返すことを確認
        expect(() => {
          toNumber(input);
          toDateStr(input);
          formatJapaneseDate(input);
          parseToDate(input);
        }).not.toThrow();
      }
    });
  });
});
