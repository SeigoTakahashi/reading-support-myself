import { Book } from "lucide-react";

// インラインローディング（コンテンツ内）
export default function InlineLoading({ text = "読み込み中..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-6">
        {/* 回転する円 */}
        <div className="absolute inset-0 animate-spin">
          <div className="w-16 h-16 border-3 border-transparent border-t-amber-400 border-r-orange-400 rounded-full"></div>
        </div>

        {/* 本のアイコン */}
        <div className="w-16 h-16 flex items-center justify-center">
          <Book
            className="w-8 h-8 text-amber-600 animate-pulse"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* ローディングテキスト */}
      <p className="text-gray-600 font-medium">{text}</p>

      {/* ローディングドット */}
      <div className="flex items-center gap-2 mt-4">
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
  );
}
