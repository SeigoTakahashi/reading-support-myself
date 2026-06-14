import { useState, useEffect } from "react";
import { getUserGoals } from "../utils/handle-database";

/**
 * ユーザーの目標情報を取得するCustom Hook
 * - ローディング状態を管理
 * - エラーハンドリング
 * - 目標の存在判定を含む
 *
 * @param {string} userId - ユーザーID
 * @returns {Object} { data, loading, error, exists }
 *   - data: 目標情報（{ monthly, yearly }）
 *   - loading: ローディング中かどうか
 *   - error: エラー情報（null = エラーなし）
 *   - exists: 目標が存在するかどうか
 */
export const useUserGoals = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(null);
      setExists(false);
      return;
    }

    const fetchGoals = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getUserGoals(userId);

        if (result.success) {
          setData(result.goals);
          setExists(result.exists);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err);
        console.error("Error fetching user goals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  return { data, loading, error, exists };
};
