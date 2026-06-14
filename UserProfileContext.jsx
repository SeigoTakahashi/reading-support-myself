import { createContext, useState, useContext, useCallback } from "react";

// Context生成（ユーザープロフィール関連情報を管理）
const UserProfileContext = createContext();

// UserProfileContextProvider
export const UserProfileContextProvider = ({ children }) => {
  // ユーザーレベル情報（{ level, title, earned, total }）
  const [userLevel, setUserLevel] = useState(null);
  // 獲得済み実績（{ DEBUT: true, GENRE_EXPLORER: false, ... }）
  const [userAchievements, setUserAchievements] = useState(null);
  // 最多ジャンル情報（{ genre, count }）
  const [mostReadGenre, setMostReadGenre] = useState(null);
  // 総読書時間（秒数）
  const [totalReadingTime, setTotalReadingTime] = useState(null);
  // ステータスごとの件数（{ 未読: N, 読書中: N, 読了: N, total, completionRate }）
  const [statusCounts, setStatusCounts] = useState(null);

  // レベル情報を更新するメソッド
  const updateUserLevel = useCallback((levelData) => {
    setUserLevel(levelData);
  }, []);

  // 実績情報を更新するメソッド
  const updateUserAchievements = useCallback((achievementsData) => {
    setUserAchievements(achievementsData);
  }, []);

  // 最多ジャンル情報を更新するメソッド
  const updateMostReadGenre = useCallback((genreData) => {
    setMostReadGenre(genreData);
  }, []);

  // 総読書時間を更新するメソッド
  const updateTotalReadingTime = useCallback((timeData) => {
    setTotalReadingTime(timeData);
  }, []);

  // ステータスごとの件数を更新するメソッド
  const updateStatusCounts = useCallback((countsData) => {
    setStatusCounts(countsData);
  }, []);

  // レベル情報をリセット
  const resetUserLevel = useCallback(() => {
    setUserLevel(null);
  }, []);

  // 実績情報をリセット
  const resetUserAchievements = useCallback(() => {
    setUserAchievements(null);
  }, []);

  // プロフィール全体をリセット
  const resetProfile = useCallback(() => {
    setUserLevel(null);
    setUserAchievements(null);
    setMostReadGenre(null);
    setTotalReadingTime(null);
    setStatusCounts(null);
  }, []);

  const value = {
    userLevel,
    updateUserLevel,
    resetUserLevel,
    userAchievements,
    updateUserAchievements,
    resetUserAchievements,
    mostReadGenre,
    updateMostReadGenre,
    totalReadingTime,
    updateTotalReadingTime,
    statusCounts,
    updateStatusCounts,
    resetProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
  );
};

// UserProfileContext を使うカスタムフック
export const UserProfileContextConsumer = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "UserProfileContextConsumer must be used within UserProfileContextProvider"
    );
  }
  return context;
};
