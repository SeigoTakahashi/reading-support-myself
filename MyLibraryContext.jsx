import { createContext, useState, useContext, useCallback } from "react";

// Context生成（ライブラリ関連情報を管理）
const MyLibraryContext = createContext();

// LibraryContextProvider
export const MyLibraryContextProvider = ({ children }) => {
  // マイライブラリの本の冊数
  const [mylibraryCount, setMylibraryCount] = useState(null);

  // 冊数を更新するメソッド
  const updateMylibraryCount = useCallback((count) => {
    setMylibraryCount(count);
  }, []);

  // 冊数をインクリメント
  const incrementMylibraryCount = useCallback(() => {
    setMylibraryCount((prev) => (prev !== null ? prev + 1 : 1));
  }, []);

  // 冊数をデクリメント
  const decrementMylibraryCount = useCallback(() => {
    setMylibraryCount((prev) => (prev !== null ? Math.max(prev - 1, 0) : 0));
  }, []);

  const value = {
    mylibraryCount,
    updateMylibraryCount,
    incrementMylibraryCount,
    decrementMylibraryCount,
  };

  return (
    <MyLibraryContext.Provider value={value}>{children}</MyLibraryContext.Provider>
  );
};

// MyLibraryContext を使うカスタムフック
export const MyLibraryContextConsumer = () => {
  const context = useContext(MyLibraryContext);
  if (!context) {
    throw new Error(
      "MyLibraryContextConsumer must be used within MyLibraryContextProvider"
    );
  }
  return context;
};
