import { useState } from "react";

/**
 * 複数のローディング状態を管理するカスタムフック
 * @param {string[]} loadingKeys - ローディング状態のキー配列
 * @returns {Object} { loading, setAllLoading, setLoadingKey }
 *   - loading: ローディング状態オブジェクト
 *   - setAllLoading: すべてのキーを同じ値に設定
 *   - setLoadingKey: 特定のキーのみ更新
 */
export const useMultipleLoading = (loadingKeys = []) => {
  const [loading, setLoading] = useState(
    Object.fromEntries(loadingKeys.map((key) => [key, false]))
  );

  const setAllLoading = (value) => {
    setLoading((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((key) => [key, value])
      )
    );
  };

  const setLoadingKey = (key, value) => {
    setLoading((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return { loading, setAllLoading, setLoadingKey };
};
