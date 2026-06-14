import { X, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContextConsumer } from "../../AuthContext";

// ナビゲーションメニューコンポーネント
const Navigation = ({ navigation, currentPath, onClose }) => {
  return (
    <>
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        {navigation.map((group) => (
          <div className="mb-6" key={group.groupName}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              {group.groupName}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                // 階層が深いパスにも対応
                const isActive =
                  currentPath === item.path ||
                  (item.path !== "/" &&
                    currentPath.startsWith(item.path + "/"));
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`
                          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                          transition-all duration-200 group relative overflow-hidden no-underline
                          ${
                            isActive
                              ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-200"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }
                        `}
                    >
                      {/* アイコンとラベル */}
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 transition-all ${
                            isActive ? "scale-110" : "group-hover:scale-110"
                          }`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="font-semibold text-sm">
                          {item.label}
                        </span>
                      </div>
                      {/* バッジ表示 */}
                      {item.badge && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white/20"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
};

// ベーステンプレート: サイドバー
export default function Sidebar({ isOpen, onClose, navigation, currentPath }) {
  // ナビゲーション
  const navigate = useNavigate();

  // Authコンテキストからログアウト関数を取得
  const { logout } = AuthContextConsumer();

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await logout();
      // サイドバーを閉じる
      onClose();

      // ログインページへリダイレクト
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      {/* モバイル用のオーバーレイ（背景のぼかしとクリックで閉じる機能） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* サイドバー本体 */}
      <aside
        className={`
        fixed lg:fixed inset-y-0 left-0 z-50 lg:z-30
        w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200/50
        transform transition-all duration-300 ease-out shadow-2xl lg:shadow-none
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 lg:hidden border-b border-gray-200/50">
            <span className="font-bold text-lg text-gray-900">メニュー</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* ナビゲーションメニュー */}
          <Navigation
            navigation={navigation}
            currentPath={currentPath}
            onClose={onClose}
          />

          {/* ログアウトリンク */}
          <div className="p-4 border-t border-gray-200/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold text-sm">ログアウト</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
