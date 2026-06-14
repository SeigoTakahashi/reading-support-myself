import { describe, it, expect } from 'vitest';
import { getReadBooksRanking, getHighRatedBooksRanking } from '../../src/utils/ranking';

/**
 * テスト設計思想：安定性重視
 * - Firebase をモック化せず、純粋な計算関数のみをテスト
 * - userBooks 配列を固定値で渡して、集計ロジックを確認
 * - 複数ユーザーのデータを集計する動作を検証
 * - エッジケース（null, undefined, 欠損フィールド）をテスト
 * - 開発環境のデータに影響を与えない（純粋な計算のみ）
 */

describe('ranking.js', () => {
  // ============================================================
  // getReadBooksRanking
  // ============================================================
  describe('getReadBooksRanking', () => {
    it('関数が存在する', () => {
      expect(typeof getReadBooksRanking).toBe('function');
    });

    it('空配列を渡すと空配列を返す', () => {
      const result = getReadBooksRanking([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('null を渡すと空配列を返す', () => {
      const result = getReadBooksRanking(null);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('undefined を渡すと空配列を返す', () => {
      const result = getReadBooksRanking(undefined);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('isPublic が true の userBook のみをカウント', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: false,
          rating: 4,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].readCount).toBe(1);
    });

    it('ISBN がない userBook は除外', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 5,
        },
        {
          title: 'Book2',
          authors: ['Author2'],
          thumbnail: 'thumb2.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].isbn).toBe('978-1111111111');
    });

    it('同じ ISBN の複数 userBook を集計', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 4,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb1.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 3,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].readCount).toBe(3);
    });

    it('readCount でソート（降順）', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].readCount).toBeGreaterThanOrEqual(result[1].readCount);
    });

    it('rating の平均値を計算', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].rating).toBe(4); // (5 + 3) / 2
    });

    it('rating がない userBook は rating 計算に含めない', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: null,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].rating).toBe(5);
    });

    it('title がない場合は "不明な本" を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          authors: ['Author1'],
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].title).toBe('不明な本');
    });

    it('authors がない場合は空文字列を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].authors).toBe('');
    });

    it('thumbnail がない場合は null を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].thumbnail).toBeNull();
    });

    it('genre がない場合は空文字列を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result[0].genre).toBe('');
    });

    it('各書籍が isbn, title, authors, thumbnail, genre, readCount, rating を含む', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      const book = result[0];
      expect('isbn' in book).toBe(true);
      expect('title' in book).toBe(true);
      expect('authors' in book).toBe(true);
      expect('thumbnail' in book).toBe(true);
      expect('genre' in book).toBe(true);
      expect('readCount' in book).toBe(true);
      expect('rating' in book).toBe(true);
    });

    it('複数の異なる ISBN を処理できる', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
        },
        {
          isbn: '978-3333333333',
          title: 'Book3',
          authors: ['Author3'],
          isPublic: true,
        },
      ];

      const result = getReadBooksRanking(userBooks);

      expect(result.length).toBe(3);
    });
  });

  // ============================================================
  // getHighRatedBooksRanking
  // ============================================================
  describe('getHighRatedBooksRanking', () => {
    it('関数が存在する', () => {
      expect(typeof getHighRatedBooksRanking).toBe('function');
    });

    it('空配列を渡すと空配列を返す', () => {
      const result = getHighRatedBooksRanking([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('rating がない userBook は除外', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
          rating: null,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].isbn).toBe('978-1111111111');
    });

    it('isPublic が false の userBook は除外', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: false,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].isbn).toBe('978-1111111111');
    });

    it('ISBN がない userBook は除外', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].isbn).toBe('978-1111111111');
    });

    it('同じ ISBN の複数評価を集計', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result.length).toBe(1);
      expect(result[0].ratingCount).toBe(3);
    });

    it('rating の平均値を計算', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result[0].rating).toBe(4); // (5 + 3) / 2
    });

    it('rating でソート（降順）', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
          rating: 5,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result[0].rating).toBeGreaterThanOrEqual(result[1].rating);
    });

    it('複数ユーザーの評価を集計して平均を計算', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 4.5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3.5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      const expectedRating = (4.5 + 3.5 + 5) / 3;
      expect(result[0].rating).toBeCloseTo(expectedRating);
      expect(result[0].ratingCount).toBe(3);
    });

    it('各書籍が isbn, title, authors, thumbnail, genre, rating, ratingCount を含む', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          thumbnail: 'thumb.jpg',
          genre: 'Fiction',
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      const book = result[0];
      expect('isbn' in book).toBe(true);
      expect('title' in book).toBe(true);
      expect('authors' in book).toBe(true);
      expect('thumbnail' in book).toBe(true);
      expect('genre' in book).toBe(true);
      expect('rating' in book).toBe(true);
      expect('ratingCount' in book).toBe(true);
    });

    it('title がない場合は "不明な本" を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          authors: ['Author1'],
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result[0].title).toBe('不明な本');
    });

    it('authors がない場合は空文字列を使用', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          isPublic: true,
          rating: 4,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result[0].authors).toBe('');
    });

    it('複数の異なる ISBN を処理できる', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author2'],
          isPublic: true,
          rating: 4,
        },
        {
          isbn: '978-3333333333',
          title: 'Book3',
          authors: ['Author3'],
          isPublic: true,
          rating: 3,
        },
      ];

      const result = getHighRatedBooksRanking(userBooks);

      expect(result.length).toBe(3);
      expect(result[0].rating).toBeGreaterThanOrEqual(result[1].rating);
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe('統合テスト', () => {
    it('読まれた本と高評価ランキングで複数ユーザーのデータを集計', () => {
      const userBooks = [
        // ユーザーA が Book1 を読了（4点評価）
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author A'],
          isPublic: true,
          rating: 4,
        },
        // ユーザーB が Book1 を読了（5点評価）
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author A'],
          isPublic: true,
          rating: 5,
        },
        // ユーザーC が Book2 を読了（3点評価）
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author B'],
          isPublic: true,
          rating: 3,
        },
        // ユーザーD が Book2 を読了（未評価）
        {
          isbn: '978-2222222222',
          title: 'Book2',
          authors: ['Author B'],
          isPublic: true,
        },
      ];

      const readBooks = getReadBooksRanking(userBooks);
      const highRated = getHighRatedBooksRanking(userBooks);

      // 読まれた本ランキング：Book1 と Book2 の両方が含まれる
      expect(readBooks.length).toBe(2);
      expect(readBooks[0].readCount).toBe(2); // Book1 は 2 ユーザー

      // 高評価ランキング：rating がある userBook だけ
      expect(highRated.length).toBe(2);
      expect(highRated[0].ratingCount).toBeGreaterThanOrEqual(1);
    });

    it('公開設定と非公開設定が混在する場合', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 5,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: false,
          rating: 4,
        },
        {
          isbn: '978-1111111111',
          title: 'Book1',
          authors: ['Author1'],
          isPublic: true,
          rating: 3,
        },
      ];

      const readBooks = getReadBooksRanking(userBooks);
      const highRated = getHighRatedBooksRanking(userBooks);

      // 公開されたものだけカウント
      expect(readBooks[0].readCount).toBe(2);
      expect(highRated[0].ratingCount).toBe(2);
    });

    it('デフォルト値を持つ不完全なデータでも動作', () => {
      const userBooks = [
        {
          isbn: '978-1111111111',
          isPublic: true,
          // title, authors なし
        },
        {
          isbn: '978-2222222222',
          title: 'Book2',
          // authors なし
          isPublic: true,
          rating: 4,
        },
      ];

      const readBooks = getReadBooksRanking(userBooks);
      const highRated = getHighRatedBooksRanking(userBooks);

      expect(readBooks.length).toBe(2);
      expect(readBooks[0].title).toBe('不明な本');
      expect(highRated.length).toBe(1);
    });

    it('error が発生しても空配列を返す', () => {
      // 意図的に不正な値を渡す（関数は try-catch で処理）
      const result1 = getReadBooksRanking('invalid');
      const result2 = getHighRatedBooksRanking(123);

      expect(Array.isArray(result1)).toBe(true);
      expect(Array.isArray(result2)).toBe(true);
    });
  });
});
