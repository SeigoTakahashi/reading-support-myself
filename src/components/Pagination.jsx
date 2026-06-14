// ページネーションコンポーネント
export default function Pagination({
  total = 0, // 合計アイテム数
  pageSize = 10, // 1ページあたりのアイテム数
  currentPage = 1, // 現在のページ番号
  onPageChange = () => {}, // ページ変更時のコールバック
  visibleCount = 5, // 表示するページ番号の数
}) {
  // 合計ページ数、表示中のアイテム範囲を計算
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(total, currentPage * pageSize);

  // 表示中のページ範囲を計算
  let startPage = Math.max(1, currentPage - Math.floor(visibleCount / 2));
  let endPage = startPage + visibleCount - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - visibleCount + 1);
  }

  // ページ番号の配列を作成
  const pages = [];
  for (let p = startPage; p <= endPage; p++) pages.push(p);

  return (
    <div className="my-8 flex items-center justify-end md:justify-between">
      {/* アイテム表示範囲のテキスト */}
      <p className="text-sm text-gray-500 hidden md:inline-flex">
        全 <span className="font-semibold text-gray-900">{total}</span> 冊中{" "}
        <span className="font-semibold text-gray-900">
          {startIndex}-{endIndex}
        </span>{" "}
        冊を表示
      </p>

      <div className="flex items-center gap-2">
        {/* 前へボタン */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {pages.map((page) => (
          // 各ページ番号ボタン
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md"
                : "border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* 次へボタン */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
