import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BaseTemplate from "../components/BaseTemplate";
import Breadcrumb from "../components/Breadcrumb";
import InlineLoading from "../components/InlineLoading";
import StarAndRating from "../components/StarAndRating";
import ConfirmModal from "../components/ConfirmModal";
import { deleteUserBook } from "../utils/handle-database";
import { navigateWithToast } from "../utils/navigation";
import { formatJapaneseDate } from "../utils/format-datetime";
import { getStatusColor, getStatusDotColor } from "../utils/status-color";
import {
  Tag,
  Edit,
  Trash2,
  Book,
  Building2,
  Calendar,
  UserRoundPen,
  CalendarArrowUp,
  CalendarArrowDown,
} from "lucide-react";
import { AuthContextConsumer } from "../../AuthContext";
import { MyLibraryContextConsumer } from "../../MyLibraryContext";
import { useUserLibrary } from "../hooks/useUserLibrary";

// 本の詳細（参照専用）
export default function BookInfoDetailPage() {
  const { id } = useParams(); // URLパラメータから本のIDを取得
  const navigate = useNavigate();
  const { loginUser } = AuthContextConsumer();
  const { decrementMylibraryCount } = MyLibraryContextConsumer();
  const { data: libraryData, loading: libraryLoading } = useUserLibrary(
    loginUser?.uid,
  );

  const [finding, setFinding] = useState(false);
  const [book, setBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);

  useEffect(() => {
    // ライブラリデータが読み込み中の場合
    if (libraryLoading) {
      setFinding(true);
      return;
    }

    // ライブラリデータから対象の本を検索
    const foundBook = (libraryData || []).find((b) => b.id === id);
    setBook(foundBook || null);
    setFinding(false);
  }, [id, libraryData, libraryLoading]);

  // 本が変わったら折りたたみ状態をリセット
  useEffect(() => {
    setShowFullSummary(false);
    setShowFullReview(false);
  }, [book]);

  // 本の削除処理
  const handleDelete = async () => {
    if (!book) return;
    setDeleting(true);
    try {
      const res = await deleteUserBook(book.id);
      if (!res.success) {
        console.error("Failed to delete userBook:", res.error);
        return;
      }

      // マイライブラリのカウントをデクリメント
      decrementMylibraryCount();

      // マイライブラリに戻り、トーストを表示
      navigateWithToast(navigate, "/mylibrary", "本を削除しました");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <BaseTemplate childrenPath={"/mylibrary"}>
      {/* パンくずリスト */}
      <Breadcrumb items={["メイン", "マイライブラリ", book?.title || "..."]} />

      {libraryLoading || !libraryData || finding ? (
        <InlineLoading />
      ) : !book ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-8 text-center shadow-xs">
          <h2 className="text-xl font-semibold text-zinc-900">
            書籍が見つかりません
          </h2>
          <p className="text-zinc-500 mt-2">
            この本はあなたのライブラリに存在しないか、読み込みに失敗しました。
          </p>
        </div>
      ) : (
        // メインのカードコンテナ
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 mb-10 shadow-sm">
          <div className="relative">
            {/* 編集・削除ボタン（右上配置） */}
            <div className="flex items-center justify-end gap-2 mb-6 md:absolute md:top-0 md:right-0 z-20">
              <button
                type="button"
                aria-label="編集"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/mylibrary/edit/${book.id}`);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs cursor-pointer"
              >
                <Edit className="w-4 h-4 text-zinc-500" />
                <span>編集</span>
              </button>
              <button
                type="button"
                aria-label="削除"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50/60 border border-red-200/80 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100/60 transition-all shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>削除</span>
              </button>
            </div>

            {/* コンテンツレイアウト */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* 左側: サムネイル画像 */}
              <div className="w-full md:w-56 shrink-0 mx-auto">
                <div className="w-full aspect-2/3 bg-zinc-100 rounded-xl shadow-md overflow-hidden relative border border-zinc-200/60">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={`${book.title}の表紙`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x450/f4f4f5/71717a?text=No+Cover`;
                        e.target.className = "w-full h-full object-contain p-4";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="w-12 h-12 text-zinc-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* 右側: 詳細テキストエリア */}
              <div className="flex-1 min-w-0">
                {/* ステータスバッジ（上部に配置して視認性アップ） */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      book?.status,
                    )}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(book?.status)}`}
                    />
                    {book?.status || "未設定"}
                  </span>
                </div>

                {/* タイトル */}
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 leading-snug">
                  {book.title}
                </h1>

                {/* 著者 */}
                <p className="text-base text-zinc-600 mb-4 font-medium flex items-center gap-1.5">
                  <UserRoundPen className="w-4 h-4 text-zinc-400 shrink-0" />
                  {book.authors || "不明"}
                </p>

                {/* 出版社・出版日・ページ数 */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-zinc-500 mb-5 pb-5 border-b border-zinc-100">
                  <div
                    className="flex items-center gap-1.5"
                    title={book.publisher}
                  >
                    <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{book.publisher || "-"}</span>
                  </div>
                  {book.publishedDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{formatJapaneseDate(book.publishedDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Book className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{book.pages ? `p.${book.pages}` : "-"}</span>
                  </div>
                </div>

                {/* 評価とジャンル */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <StarAndRating rating={book?.rating ?? null} />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
                    <Tag className="w-3.5 h-3.5" />
                    {book?.genre || "未分類"}
                  </span>
                </div>

                {/* タグ一覧 */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(book.tags || []).length === 0 ? (
                      <span className="text-zinc-400 text-xs">タグなし</span>
                    ) : (
                      (book.tags || []).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-2.5 py-1 bg-zinc-50 text-zinc-600 rounded-md text-xs font-medium border border-zinc-200/80"
                          title={tag}
                        >
                          #{tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 読書開始日 / 終了日 */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50/60 rounded-xl border border-zinc-200/60 mb-6">
                  <div>
                    <div className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <CalendarArrowUp className="w-3.5 h-3.5" />
                      読書開始日
                    </div>
                    <div className="text-sm font-semibold text-zinc-800">
                      {formatJapaneseDate(book.startDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-400 mb-1 flex items-center gap-1">
                      <CalendarArrowDown className="w-3.5 h-3.5" />
                      読書終了日
                    </div>
                    <div className="text-sm font-semibold text-zinc-800">
                      {formatJapaneseDate(book.endDate)}
                    </div>
                  </div>
                </div>

                {/* あらすじ */}
                <div className="mb-6 p-5 bg-zinc-50/40 rounded-xl border border-zinc-200/80">
                  <div className="text-sm font-bold text-zinc-800 mb-2.5 flex items-center gap-2">
                    <Book className="w-4 h-4 text-amber-600" />
                    あらすじ
                  </div>
                  <div className="text-zinc-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {(() => {
                      const summaryText =
                        book.summary || book.description || "";
                      const limit = 150;
                      const isLong = summaryText.length > limit;
                      if (!summaryText)
                        return (
                          <span className="text-zinc-400 text-xs">
                            あらすじはありません
                          </span>
                        );
                      return (
                        <>
                          {isLong && !showFullSummary
                            ? summaryText.slice(0, limit) + "..."
                            : summaryText}
                          {isLong && (
                            <button
                              type="button"
                              aria-expanded={showFullSummary}
                              onClick={() => setShowFullSummary((s) => !s)}
                              className="ml-2 text-xs font-medium text-amber-600 hover:underline cursor-pointer"
                            >
                              {showFullSummary ? "折りたたむ" : "続きを読む"}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* レビュー */}
                <div className="mb-6 p-5 bg-white rounded-xl border border-amber-200/60 shadow-2xs">
                  <div className="text-sm font-bold text-zinc-800 mb-2.5 flex items-center gap-2">
                    <Edit className="w-4 h-4 text-amber-600" />
                    あなたのレビュー・メモ
                  </div>
                  <div className="text-zinc-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {(() => {
                      const reviewText = book.review || "";
                      const limit = 150;
                      const isLong = reviewText.length > limit;
                      if (!reviewText)
                        return (
                          <span className="text-zinc-400 text-xs">
                            レビューはありません
                          </span>
                        );
                      return (
                        <>
                          {isLong && !showFullReview
                            ? reviewText.slice(0, limit) + "..."
                            : reviewText}
                          {isLong && (
                            <button
                              type="button"
                              aria-expanded={showFullReview}
                              onClick={() => setShowFullReview((s) => !s)}
                              className="ml-2 text-xs font-medium text-amber-600 hover:underline cursor-pointer"
                            >
                              {showFullReview ? "折りたたむ" : "続きを読む"}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* システム情報 */}
                <div className="pt-4 border-t border-zinc-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-400">
                  <div>
                    <span className="font-medium">追加日:</span>
                    <span className="ml-1.5">
                      {formatJapaneseDate(book.addedDate || book.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">最終更新日:</span>
                    <span className="ml-1.5">
                      {book?.updatedAt
                        ? formatJapaneseDate(book.updatedAt)
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ISBN:</span>
                    <span className="ml-1.5">{book.isbn || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 確認モーダル */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="本を削除しますか？"
        message={
          "この操作は元に戻せません。ライブラリから本を削除してもよろしいですか？"
        }
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </BaseTemplate>
  );
}
