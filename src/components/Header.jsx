import { Link } from "react-router-dom";
import { Book, Menu, Sparkles, Plus } from "lucide-react";
import { AuthContextConsumer } from "../../AuthContext";

// ベーステンプレート: ヘッダー
export default function Header({ onMenuClick }) {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 fixed top-0 left-0 lg:left-72 right-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* モバイルメニューアイコン */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          {/* タイトル・ロゴ（"/"へのリンク） */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-linear-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg rotate-3">
                <Book className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-linear-to-br from-yellow-300 to-amber-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                Bookworm
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
