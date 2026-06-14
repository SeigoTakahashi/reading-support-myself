import { describe, it, expect } from 'vitest';
import { ensureHttps } from '../../src/utils/secure-url';

/**
 * テスト設計思想：安定性重視
 * - URL 変換ロジックのエッジケースを全てテスト
 * - null/undefined/非文字列型の入力に対する安全な処理を確認
 * - プロトコル置換のパターンマッチング（大文字小文字など）を検証
 * - エラーハンドリングによる元の URL 返却を確認
 */

describe('secure-url.js', () => {
  // ============================================================
  // ensureHttps
  // ============================================================
  describe('ensureHttps', () => {
    it('関数が存在する', () => {
      expect(typeof ensureHttps).toBe('function');
    });

    it('null を渡すと null を返す', () => {
      const result = ensureHttps(null);
      expect(result).toBe(null);
    });

    it('undefined を渡すと undefined を返す', () => {
      const result = ensureHttps(undefined);
      expect(result).toBe(undefined);
    });

    it('空文字列を渡すと空文字列を返す', () => {
      const result = ensureHttps('');
      expect(result).toBe('');
    });

    it('数値を渡すとそのまま返す', () => {
      const num = 12345;
      const result = ensureHttps(num);
      expect(result).toBe(num);
    });

    it('オブジェクトを渡すとそのまま返す', () => {
      const obj = { url: 'http://example.com' };
      const result = ensureHttps(obj);
      expect(result).toBe(obj);
    });

    it('配列を渡すとそのまま返す', () => {
      const arr = ['http://example.com'];
      const result = ensureHttps(arr);
      expect(result).toBe(arr);
    });

    it('既に https で始まる URL はそのまま返す', () => {
      const url = 'https://example.com/path';
      const result = ensureHttps(url);
      expect(result).toBe(url);
    });

    it('http で始まる URL を https に置換', () => {
      const url = 'http://example.com';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com');
    });

    it('http で始まる URL の全てのパスを保持', () => {
      const url = 'http://example.com/path/to/image.jpg?query=123';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com/path/to/image.jpg?query=123');
    });

    it('プロトコル相対 URL に https: を追加', () => {
      const url = '//example.com/image.jpg';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('プロトコルなし（ファイルパス）はそのまま返す', () => {
      const url = '/images/book.jpg';
      const result = ensureHttps(url);
      expect(result).toBe('/images/book.jpg');
    });

    it('相対パスはそのまま返す', () => {
      const url = 'images/book.jpg';
      const result = ensureHttps(url);
      expect(result).toBe('images/book.jpg');
    });

    it('HTTP（大文字）で始まる URL はそのまま返す（大文字非対応）', () => {
      const url = 'HTTP://example.com';
      const result = ensureHttps(url);
      expect(result).toBe(url);
    });

    it('Http（大文字小文字混合）で始まる URL はそのまま返す（大文字非対応）', () => {
      const url = 'Http://example.com';
      const result = ensureHttps(url);
      expect(result).toBe(url);
    });

    it('複数の http が含まれる場合は先頭のみ置換', () => {
      const url = 'http://example.com?redirect=http://other.com';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com?redirect=http://other.com');
    });

    it('Firebase Storage URL（gs://)はそのまま返す', () => {
      const url = 'gs://bucket/path/image.jpg';
      const result = ensureHttps(url);
      expect(result).toBe(url);
    });

    it('data URI スキームはそのまま返す', () => {
      const url = 'data:image/png;base64,iVBORw0KGgoAAAA...';
      const result = ensureHttps(url);
      expect(result).toBe(url);
    });

    it('ホスト名のみの http URL を置換', () => {
      const url = 'http://example.com';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com');
    });

    it('ポート番号を含む http URL を置換', () => {
      const url = 'http://example.com:8080/path';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com:8080/path');
    });

    it('クエリパラメータを含む http URL を置換', () => {
      const url = 'http://example.com/search?q=book&page=1';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com/search?q=book&page=1');
    });

    it('フラグメント（#）を含む http URL を置換', () => {
      const url = 'http://example.com/page#section';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com/page#section');
    });

    it('特殊文字を含む URL でもエラーなく処理', () => {
      const url = 'http://example.com/path?text=こんにちは&emoji=🎉';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com/path?text=こんにちは&emoji=🎉');
    });

    it('double slash（//）が複数ある場合は最初のプロトコル部分のみ対象', () => {
      const url = 'http://example.com//double//slash';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com//double//slash');
    });

    it('空白を含む URL でもそのまま返す（エラーハンドリング）', () => {
      const url = 'http://example.com /path';
      const result = ensureHttps(url);
      expect(result).toBe('https://example.com /path');
    });

    it('long URL（1000 文字超）でも正常に処理', () => {
      const longPath = 'a'.repeat(1000);
      const url = `http://example.com/${longPath}`;
      const result = ensureHttps(url);
      expect(result).toBe(`https://example.com/${longPath}`);
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe('統合テスト', () => {
    it('複数の URL を順序に処理', () => {
      const urls = [
        'http://example1.com',
        'https://example2.com',
        '//example3.com',
        '/local/path',
        null,
      ];

      const results = urls.map(url => ensureHttps(url));

      expect(results[0]).toBe('https://example1.com');
      expect(results[1]).toBe('https://example2.com');
      expect(results[2]).toBe('https://example3.com');
      expect(results[3]).toBe('/local/path');
      expect(results[4]).toBe(null);
    });

    it('Google Books API の画像 URL を正規化', () => {
      const apiUrl = 'http://books.google.com/books/content?id=xyz&printsec=frontcover&img=1';
      const result = ensureHttps(apiUrl);
      expect(result).toBe('https://books.google.com/books/content?id=xyz&printsec=frontcover&img=1');
    });

    it('プロトコル相対 URL が https で統一', () => {
      const urls = [
        '//images.example.com/book1.jpg',
        '//cdn.example.com/book2.jpg',
      ];

      const results = urls.map(url => ensureHttps(url));

      expect(results[0]).toBe('https://images.example.com/book1.jpg');
      expect(results[1]).toBe('https://cdn.example.com/book2.jpg');
    });

    it('複数の URL 形式が混在する配列を処理', () => {
      const testCases = [
        { input: 'http://old.example.com', expected: 'https://old.example.com' },
        { input: 'https://secure.example.com', expected: 'https://secure.example.com' },
        { input: '//cdn.example.com', expected: 'https://cdn.example.com' },
        { input: null, expected: null },
        { input: undefined, expected: undefined },
        { input: '/static/image.jpg', expected: '/static/image.jpg' },
      ];

      for (const testCase of testCases) {
        const result = ensureHttps(testCase.input);
        expect(result).toBe(testCase.expected);
      }
    });
  });
});
