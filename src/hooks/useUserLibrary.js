import { useState, useEffect } from "react";
import { getUserLibrary } from "../utils/handle-database";
import { MyLibraryContextConsumer } from "../../MyLibraryContext";

/**
 * ユーザーのマイライブラリを取得するCustom Hook
 * - セッションキャッシュから初期値を復元
 * - Firebaseから非同期に取得
 * - 冊数をMyLibraryContextに反映
 *
 * @param {string} userId - ユーザーID
 * @returns {Object} { data, loading, error }
 *   - data: ライブラリレコードの配列（null = 未取得）
 *   - loading: ローディング中かどうか
 *   - error: エラー情報（null = エラーなし）
 */
export const useUserLibrary = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateMylibraryCount } = MyLibraryContextConsumer();

  useEffect(() => {
    // まずセッションキャッシュからデータを復元してちらつきを防止（ユーザーIDで分離）
    try {
      const cacheKey = `userLibraryCache_${userId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const records = JSON.parse(cached);
        setData(records);
        updateMylibraryCount(records.length);
      }
    } catch (err) {
      console.error("Failed to restore cached library:", err);
    }

    // Firebaseからデータを取得
    const fetchLibrary = async () => {
      if (!userId) return;

      setLoading(true);
      const start = Date.now();
      setError(null);

      try {
        const result = await getUserLibrary(userId);

        if (result.success) {
          setData(result.records);

          // セッションキャッシュに保存（ユーザーIDで分離）
          try {
            const cacheKey = `userLibraryCache_${userId}`;
            sessionStorage.setItem(cacheKey, JSON.stringify(result.records));
          } catch (err) {
            console.error("Failed to cache library:", err);
          }

          // ライブラリ数をContextに反映
          const count = result.records.length;
          updateMylibraryCount(count);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching user library:", err);
      } finally {
        // fetchが終わってから「最低1.5秒経過」していなければ待つ
        const elapsed = Date.now() - start;
        const wait = Math.max(0, 1500 - elapsed);

        setTimeout(() => {
          setLoading(false);
        }, wait);
      }
    };

    fetchLibrary();
  }, [userId, updateMylibraryCount]);

  return { data, loading, error };
};
