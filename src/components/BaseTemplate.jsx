import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AuthContextConsumer } from "../../AuthContext";
import { MyLibraryContextConsumer } from "../../MyLibraryContext";
import { NAVIGATION } from "../../const";

// メインアプリケーション
export default function BaseTemplate({ children, childrenPath }) {
  // ライブラリのContext状態を取得
  const { mylibraryCount } = MyLibraryContextConsumer();

  // サイドバーの開閉状態
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // ナビゲーションメニューの定義
  // const.js の NAVIGATION を元に、ランタイムでバッジ等を差し替えたコピーを作る
  const navigation = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      // mylibrary の badgeKey を見て、ここで badge を差し替える
      if (item.badgeKey === "mylibraryCount") {
        return {
          ...item,
          badge: mylibraryCount !== null ? String(mylibraryCount) : "0",
        };
      }
      return item;
    }),
  }));

  return (
    <div className="min-h-dvh bg-linear-to-br from-gray-50 via-orange-50/30 to-amber-50/20 overscroll-none">
      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={navigation}
        currentPath={childrenPath || "/"} // 子コンポーネントからパスを受け取る
      />

      <div className="lg:ml-72">
        {/* ヘッダー */}
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          currentUser={{ name: "User" }}
        />

        {/* メインコンテンツ */}
        <main className="pt-16 lg:pt-20 pb-8">
          <div className="max-w-7xl mx-auto py-8 px-4 md:px-6 lg:px-8 animate-fadeIn">
            {/* BaseTemplateを共通レイアウトとして使用し、各ページコンテンツをここに表示 */}
            {children}
          </div>
        </main>
      </div>

      {/* モバイル用 右下固定の「本を追加」ボタン（本を追加ページ以外で表示） */}
      {childrenPath !== "/mylibrary/input" && (
        <Link
          to="/mylibrary/input"
          className="lg:hidden fixed right-4 bottom-6 z-50 w-14 h-14 rounded-full flex items-center justify-center bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-xl"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
}
