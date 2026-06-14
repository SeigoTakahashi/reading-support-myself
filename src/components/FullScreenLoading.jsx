import { Book, Sparkles } from "lucide-react";

// フルスクリーンローディング（初回読み込み用）
export default function FullScreenLoading() {
  return (
    <div className="fixed inset-0 bg-linear-to-br from-white-50 via-white-50 to-orange-50 flex items-center justify-center z-50">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-linear-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-linear-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-linear-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 flex flex-col items-center">
        {/* ロゴアニメーション */}
        <div className="relative mb-8">
          {/* 本のアイコン */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-linear-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl shadow-2xl shadow-orange-300/50 animate-pulse"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <div
              className="absolute inset-2 bg-linear-to-br from-amber-300 via-orange-300 to-rose-300 rounded-3xl opacity-50 animate-ping"
              style={{ animationDuration: "1.5s" }}
            ></div>
            <Book
              className="w-16 h-16 text-white relative z-10 animate-bounce"
              strokeWidth={2.5}
              style={{ animationDuration: "1s" }}
            />
            <Sparkles className="w-6 h-6 text-yellow-200 absolute top-2 right-2 animate-pulse" />
          </div>
        </div>

        {/* テキスト */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent mb-3 animate-pulse">
            Bookworm
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            読書の世界へようこそ...
          </p>
        </div>

        {/* プログレスバー */}
        <div className="w-80 h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
          <div className="h-full bg-linear-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full animate-progress shadow-lg"></div>
        </div>

        {/* ローディングドット */}
        <div className="flex items-center gap-2 mt-6">
          <div
            className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
            style={{ animationDelay: "100ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
            style={{ animationDelay: "250ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
