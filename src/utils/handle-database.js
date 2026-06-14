import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Firebase Firestore クエリヘルパー
 * @param {string} collectionName - コレクション名
 * @param {object|array} conditions - 検索条件
 *   オブジェクト形式: { field: value } （複数フィールドは AND 結合）
 *   配列形式: [{ field, operator, value }] （operator: "==", "<", ">", "<=", ">=" など）
 * @returns {Promise<QuerySnapshot>} Firestore QuerySnapshot
 */
export const findDocuments = async (collectionName, conditions = {}) => {
  try {
    const constraintsArray = [];

    // conditions がオブジェクトの場合、キーバリューペアを where 制約に変換
    if (typeof conditions === "object" && !Array.isArray(conditions)) {
      Object.entries(conditions).forEach(([field, value]) => {
        constraintsArray.push(where(field, "==", value));
      });
    }
    // conditions が配列の場合、そのまま where 制約に変換
    else if (Array.isArray(conditions)) {
      conditions.forEach(({ field, operator = "==", value }) => {
        constraintsArray.push(where(field, operator, value));
      });
    }

    const q = query(collection(db, collectionName), ...constraintsArray);
    return await getDocs(q);
  } catch (err) {
    console.error(`Error finding documents in ${collectionName}:`, err);
    throw err;
  }
};

// books コレクションに対して upsert 処理
// ISBN またはタイトルで既存レコードを検索し、存在すれば更新、なければ新規作成
// bookData: { isbn, title, authors, publisher, publishedDate, thumbnail, pages, description }
export const upsertBook = async (bookData) => {
  try {
    // ISBN で検索
    if (bookData.isbn) {
      const qs = await findDocuments("books", { isbn: bookData.isbn });
      if (!qs.empty) {
        // 既存レコードが見つかった場合は更新
        const docRef = qs.docs[0].ref;
        await updateDoc(docRef, { ...bookData, updatedAt: new Date() });
        return { success: true, id: docRef.id, created: false };
      }
    }

    // タイトルで検索
    if (bookData.title) {
      const qs = await findDocuments("books", { title: bookData.title });
      if (!qs.empty) {
        // 既存レコードが見つかった場合は更新
        const docRef = qs.docs[0].ref;
        await updateDoc(docRef, { ...bookData, updatedAt: new Date() });
        return { success: true, id: docRef.id, created: false };
      }
    }

    // もし見つからなければ新規作成
    const newRef = await addDoc(collection(db, "books"), {
      ...bookData,
      createdAt: new Date(),
    });
    return { success: true, id: newRef.id, created: true };
  } catch (e) {
    console.error("Error upserting book: ", e);
    return { success: false, error: e };
  }
};

// userBooks コレクションに新規作成
// userBookData: { bookId, genre, status, startDate, endDate, rating, review, tags }
export const createUserBook = async (userBookData, userId) => {
  try {
    if (!userId)
      return { success: false, error: { message: "userId is required" } };
    // userBooksに新規作成
    const payload = {
      ...userBookData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(collection(db, "userBooks"), payload);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("Error creating userBook: ", e);
    return { success: false, error: e };
  }
};

// 本の upsert（更新または新規作成）を行い、その本に紐づく userBook を作成
// bookData: { isbn, title, authors, publisher, publishedDate, thumbnail, pages, description }
// userBookData: { genre, status, startDate, endDate, rating, review, tags }
export const upsertBookAndCreateUserBook = async (
  bookData,
  userBookData,
  userId,
) => {
  try {
    // book の upsert を実行
    const upsertResult = await upsertBook(bookData);
    if (!upsertResult.success)
      return { success: false, error: upsertResult.error };

    const bookId = upsertResult.id;

    // 重複チェック: 同じ userId と bookId の userBook がすでに存在しないか確認
    try {
      const dupQs = await findDocuments("userBooks", { userId, bookId });
      if (!dupQs.empty) {
        // すでに同じ本がユーザーのライブラリに存在する
        return {
          success: false,
          error: {
            code: "duplicate_userbook",
            message: "この本は既にあなたのライブラリに追加されています",
          },
        };
      }
    } catch (err) {
      console.warn("Duplicate check failed:", err);
      // 重複チェック失敗は致命的ではないので続行
    }

    const userBookPayload = {
      bookId,
      ...userBookData,
    };

    // userBook を作成
    const userBookResult = await createUserBook(userBookPayload, userId);
    if (!userBookResult.success)
      return { success: false, error: userBookResult.error };

    return {
      success: true,
      bookId,
      userBookId: userBookResult.id,
      createdBook: upsertResult.created,
    };
  } catch (e) {
    console.error("Error in upsertBookAndCreateUserBook: ", e);
    return { success: false, error: e };
  }
};

// ユーザーのマイライブラリを取得（userBooks と books をマージ）
// マージされたレコードの配列を返す
export const getUserLibrary = async (userId) => {
  try {
    if (!userId)
      return { success: false, error: { message: "userId is required" } };
    // userBooks コレクションから該当ユーザーの記録を取得
    const qs = await findDocuments("userBooks", { userId });
    const merged = [];

    for (const docSnap of qs.docs) {
      const userBook = docSnap.data();
      const userBookId = docSnap.id;
      const bookId = userBook.bookId;

      // bookId が存在する場合は、対応する book ドキュメントを取得
      let bookData = {};
      if (bookId) {
        try {
          const bq = query(
            collection(db, "books"),
            where("__name__", "==", bookId),
          );
          const bqs = await getDocs(bq);
          if (!bqs.empty) {
            bookData = bqs.docs[0].data();
          }
        } catch (err) {
          console.warn("Failed to fetch book for userBook", userBookId, err);
        }
      }

      // userBooks と books をマージして配列に追加
      merged.push({
        id: userBookId,
        bookId: bookId || null,
        title: bookData.title || userBook.title || "",
        thumbnail: bookData.thumbnail || userBook.thumbnail || null,
        authors: bookData.authors || userBook.authors || "",
        pages: bookData.pages || userBook.pages || "",
        publisher: bookData.publisher || userBook.publisher || "",
        publishedDate: bookData.publishedDate || userBook.publishedDate || "",
        description: bookData.description || userBook.description || "",
        isbn: bookData.isbn || userBook.isbn || "",
        // userBooks 側の情報
        genre: userBook.genre || "",
        status: userBook.status || "",
        startDate: userBook.startDate || "",
        endDate: userBook.endDate || "",
        rating: userBook.rating ?? null,
        review: userBook.review || "",
        tags: userBook.tags || [],
        createdAt: userBook.createdAt || null,
        updatedAt: userBook.updatedAt || userBook.createdAt || null,
      });
    }

    return { success: true, records: merged };
  } catch (e) {
    console.error("Error getting user library: ", e);
    return { success: false, error: e };
  }
};

// userBooks のレコードを更新するユーティリティ
export const updateUserBook = async (userBookId, userBookData) => {
  try {
    if (!userBookId)
      return { success: false, error: { message: "userBookId is required" } };
    const ref = doc(db, "userBooks", userBookId);
    await updateDoc(ref, { ...userBookData, updatedAt: new Date() });
    return { success: true };
  } catch (e) {
    console.error("Error updating userBook: ", e);
    return { success: false, error: e };
  }
};

// book ドキュメントを更新するユーティリティ
export const updateBook = async (bookId, bookData) => {
  try {
    if (!bookId)
      return { success: false, error: { message: "bookId is required" } };
    const ref = doc(db, "books", bookId);
    await updateDoc(ref, { ...bookData, updatedAt: new Date() });
    return { success: true };
  } catch (e) {
    console.error("Error updating book: ", e);
    return { success: false, error: e };
  }
};

// userBooks のレコードを削除するユーティリティ
export const deleteUserBook = async (userBookId) => {
  try {
    if (!userBookId)
      return { success: false, error: { message: "userBookId is required" } };
    const ref = doc(db, "userBooks", userBookId);
    // まず userBook を取得して関連する readingRecords の情報を得る
    try {
      const ubSnap = await getDoc(ref);
      if (ubSnap.exists()) {
        const ub = ubSnap.data();
        const userId = ub.userId;
        const bookId = ub.bookId;

        // userBookId を参照する readingRecords を削除
        try {
          const rrQs = await findDocuments("readingRecords", { userBookId });
          for (const d of rrQs.docs) {
            await deleteDoc(d.ref);
          }
        } catch (err) {
          console.warn(
            "Failed to cascade-delete readingRecords by userBookId:",
            err,
          );
        }

        // さらに、同ユーザーの同じ bookId を参照する readingRecords も削除（重複防止は不要）
        if (bookId && userId) {
          try {
            const rrQs2 = await findDocuments("readingRecords", {
              bookId,
              userId,
            });
            for (const d of rrQs2.docs) {
              await deleteDoc(d.ref);
            }
          } catch (err) {
            console.warn(
              "Failed to cascade-delete readingRecords by bookId:",
              err,
            );
          }
        }
      }
    } catch (err) {
      console.warn("Failed to fetch userBook before delete:", err);
    }

    await deleteDoc(ref);
    return { success: true };
  } catch (e) {
    console.error("Error deleting userBook: ", e);
    return { success: false, error: e };
  }
};

// ユーザーの読書目標 (monthly, yearly) を取得するユーティリティ
// - 初回はドキュメントが存在しないため { monthly: null, yearly: null } を返す
// - 返り値は安定した構造を持ち、テストしやすい形にする
export const getUserGoals = async (userId) => {
  try {
    if (!userId)
      return { success: false, error: { message: "userId is required" } };
    const ref = doc(db, "userGoals", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // 初回は明示的に null を返すことで「未設定」を表現
      return {
        success: true,
        exists: false,
        goals: { monthly: null, yearly: null },
      };
    }
    const data = snap.data();
    return {
      success: true,
      exists: true,
      goals: {
        monthly: data.monthly ?? null,
        yearly: data.yearly ?? null,
      },
      raw: data,
    };
  } catch (e) {
    console.error("Error getting user goals:", e);
    return { success: false, error: e };
  }
};

// ユーザーの読書目標を挿入・更新するユーティリティ
// - merge オプションを用いて既存フィールドを上書きしない
// - monthly/yearly は明示的に null を渡せる（未設定に戻す）
// - 呼び出し方: upsertUserGoals(userId, { monthly: 10 }) や upsertUserGoals(userId, { yearly: 120 })
export const upsertUserGoals = async (
  userId,
  { monthly = undefined, yearly = undefined } = {},
) => {
  try {
    if (!userId)
      return { success: false, error: { message: "userId is required" } };
    const ref = doc(db, "userGoals", userId);

    // undefined のフィールドは送らない（意図せず既存値を上書きしないため）
    const payload = {
      ...(monthly !== undefined ? { monthly } : {}),
      ...(yearly !== undefined ? { yearly } : {}),
      updatedAt: new Date(),
    };

    await setDoc(ref, payload, { merge: true });
    return { success: true };
  } catch (e) {
    console.error("Error upserting user goals:", e);
    return { success: false, error: e };
  }
};

// 初回ログイン時に呼び出して、未設定のユーザーに既定の目標ドキュメントを作成する
// - 既に存在する場合は何もしない
export const ensureUserGoals = async (userId) => {
  try {
    if (!userId)
      return { success: false, error: { message: "userId is required" } };
    const existing = await getUserGoals(userId);
    if (!existing.success) return existing;
    if (existing.exists) return { success: true, created: false };

    const ref = doc(db, "userGoals", userId);
    const payload = { monthly: null, yearly: null, createdAt: new Date() };
    await setDoc(ref, payload, { merge: true });
    return { success: true, created: true };
  } catch (e) {
    console.error("Error ensuring user goals:", e);
    return { success: false, error: e };
  }
};
