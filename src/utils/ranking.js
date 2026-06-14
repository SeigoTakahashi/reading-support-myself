/**
 * userBooks のデータを集計して、読まれた本ランキングを計算
 * ISBN が欠損しているデータは除外
 * isPublic が true のものだけを対象
 * @param {Array} userBooksData - userBooks の配列
 * @returns {Array} [{ isbn, title, authors, thumbnail, genre, readCount, rating }]
 */
export const getReadBooksRanking = (userBooksData = []) => {
  try {
    const bookMap = new Map(); // { isbn: { title, authors, thumbnail, genre, readCount, totalRating, ratingCount } }

    for (const userBook of userBooksData) {
      // isPublic が true のみを対象
      if (userBook.isPublic !== true) {
        continue;
      }

      // ISBN が欠損している場合はスキップ
      if (!userBook.isbn) {
        continue;
      }

      const isbn = userBook.isbn;

      // ISBN をキーに集計
      if (bookMap.has(isbn)) {
        const existing = bookMap.get(isbn);
        existing.readCount += 1;
        // rating が存在すれば累積
        if (userBook.rating !== null && userBook.rating !== undefined) {
          existing.totalRating += userBook.rating;
          existing.ratingCount += 1;
        }
      } else {
        bookMap.set(isbn, {
          isbn,
          title: userBook.title || "不明な本",
          authors: userBook.authors || "",
          thumbnail: userBook.thumbnail || null,
          genre: userBook.genre || "",
          readCount: 1,
          totalRating: userBook.rating ?? 0,
          ratingCount: userBook.rating !== null && userBook.rating !== undefined ? 1 : 0,
        });
      }
    }

    // 読まれた本の降順でソート
    const books = Array.from(bookMap.values())
      .map((book) => ({
        ...book,
        rating: book.ratingCount > 0 ? book.totalRating / book.ratingCount : 0,
      }))
      .sort((a, b) => b.readCount - a.readCount);

    return books;
  } catch (e) {
    console.error("Error computing read books ranking:", e);
    return [];
  }
};

/**
 * userBooks のデータを集計して、高評価ランキングを計算
 * ISBN が欠損しているデータは除外
 * isPublic が true のものだけを対象
 * rating がある userBook のみを対象
 * @param {Array} userBooksData - userBooks の配列
 * @returns {Array} [{ isbn, title, authors, thumbnail, genre, rating, ratingCount }]
 */
export const getHighRatedBooksRanking = (userBooksData = []) => {
  try {
    const bookMap = new Map(); // { isbn: { title, authors, thumbnail, genre, totalRating, ratingCount } }

    for (const userBook of userBooksData) {
      // isPublic が true のみを対象
      if (userBook.isPublic !== true) {
        continue;
      }

      // rating が存在しない場合はスキップ
      if (userBook.rating === null || userBook.rating === undefined) {
        continue;
      }

      // ISBN が欠損している場合はスキップ
      if (!userBook.isbn) {
        continue;
      }

      const isbn = userBook.isbn;

      // ISBN をキーに集計
      if (bookMap.has(isbn)) {
        const existing = bookMap.get(isbn);
        existing.totalRating += userBook.rating;
        existing.ratingCount += 1;
      } else {
        bookMap.set(isbn, {
          isbn,
          title: userBook.title || "不明な本",
          authors: userBook.authors || "",
          thumbnail: userBook.thumbnail || null,
          genre: userBook.genre || "",
          totalRating: userBook.rating,
          ratingCount: 1,
        });
      }
    }

    // 平均評価の降順でソート
    const books = Array.from(bookMap.values())
      .map((book) => ({
        ...book,
        rating: book.totalRating / book.ratingCount,
      }))
      .sort((a, b) => b.rating - a.rating);

    return books;
  } catch (e) {
    console.error("Error computing high rated books ranking:", e);
    return [];
  }
};
