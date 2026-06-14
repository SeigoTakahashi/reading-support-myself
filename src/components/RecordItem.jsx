import { Clock, Calendar, Trash2 } from "lucide-react";

export default function RecordItem({
  book,
  date,
  duration,
  thumbnail,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow group">
      {/* 本のサムネイル表示部分: サムネイルがあれば画像を表示、なければグラデーションのプレースホルダー */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={book}
          className="w-10 h-14 rounded-lg shadow-sm object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-14 bg-linear-to-br from-gray-400 to-gray-600 rounded-lg shadow-sm shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        {/* 本のタイトル表示部分 */}
        <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
          {book}
        </h4>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
          {/* 日付表示部分 */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
          {/* 読書時間表示部分 */}
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap sm:whitespace-normal">
              {duration}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* 削除ボタン */}
        <button
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => {
            if (typeof onDelete === "function") onDelete();
          }}
          aria-label={`delete-${book}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
        </button>
      </div>
    </div>
  );
}
