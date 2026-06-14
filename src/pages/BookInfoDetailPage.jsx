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
import { getStatusColor } from "../utils/status-color";
import {
  Tag,
  Edit,
  Trash2,
  Book,
  BookOpen,
  Globe,
  Heart,
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
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold">書籍が見つかりません</h2>
          <p className="text-gray-500 mt-2">
            この本はあなたのライブラリに存在しないか、読み込みに失敗しました。
          </p>
        </div>
      ) : (
        // メインのカードコンテナ (L257で開いたdiv)
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-10 shadow-xl">
          {/* カード全体 */}
          <div className="relative">
            {/* 編集・削除ボタン（md以上はカード右上に固定） */}
            <div className="md:absolute md:top-1 md:right-1 flex items-center justify-end gap-3 z-20 mb-3 md:mb-0">
              <button
                type="button"
                aria-label="編集"
                onClick={(e) => {
                  e.stopPropagation();
                  // 編集ページへ遷移
                  const id = book.id;
                  navigate(`/mylibrary/edit/${id}`);
                }}
                className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-11 md:w-auto h-11 md:h-auto"
              >
                <Edit className="w-5 h-5" />
                <span className="hidden md:inline">編集</span>
              </button>
              <button
                type="button"
                aria-label="削除"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium hover:bg-red-100 transition-colors w-11 md:w-auto h-11 md:h-auto"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden md:inline">削除</span>
              </button>
            </div>

            {/* コンテンツレイアウト */}
            <div className="flex flex-col md:flex-row gap-6 pt-2 md:pt-0">
              <div className="w-full md:w-64 h-auto shrink-0 mx-auto">
                {/* サムネイル画像 */}
                <div className="w-full aspect-2/3 bg-gray-100 rounded-md shadow-lg overflow-hidden relative">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail}
                      alt={`${book.title}の表紙`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/300x450/f0f9ff/1d4ed8?text=No+Cover`;
                        e.target.className = "w-full h-full object-contain p-4";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Book className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {/* タイトル（md以上ではボタンの下から表示するため上部マージンを確保） */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight md:mt-14">
                  {book.title}
                </h1>

                {/* 著者 */}
                <p className="text-lg text-gray-800 mb-2 font-medium">
                  <UserRoundPen className="w-4 h-4 inline-block mr-1 mb-1" />
                  {book.authors || "不明"}
                </p>

                {/* 出版社と出版日とページ数（各項目を別々の行に表示） */}
                <div className="mb-4 space-y-1.5">
                  {/* 出版社 */}
                  <div
                    className="text-sm text-gray-600 truncate"
                    title={book.publisher}
                  >
                    <Building2 className="w-4 h-4 inline-block mr-1 mb-1" />
                    {book.publisher || "-"}
                  </div>

                  {/* 出版日 */}
                  {book.publishedDate && (
                    <div className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline-block mr-1 mb-1" />
                      {formatJapaneseDate(book.publishedDate)}
                    </div>
                  )}

                  {/* ページ数 */}
                  <div className="text-sm text-gray-600">
                    <Book className="w-4 h-4 inline-block mr-1 mb-1" />
                    {book.pages ? `p.${book.pages}` : "-"}
                  </div>
                </div>

                {/* 評価とジャンル、ステータス */}
                <div className="flex items-center gap-4">
                  {/* 星評価 */}
                  <StarAndRating rating={book?.rating ?? null} />

                  {/* ジャンル */}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {book?.genre || "未分類"}
                  </span>
                </div>

                {/* タグ：レビュー/ジャンル/ステータスの下の段に表示 */}
                <div className="mt-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex flex-wrap items-start gap-2">
                    {(book.tags || []).length === 0 ? (
                      <span className="text-gray-500 text-sm">タグなし</span>
                    ) : (
                      (book.tags || []).map((tag, i) => (
                        <span
                          key={i}
                          className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                          title={tag}
                        >
                          #{tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 読書状況ステータス */}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 mb-3 rounded-full text-xs font-semibold border ${getStatusColor(
                    book?.status,
                  )}`}
                >
                  <BookOpen className="w-3 h-3 text-current" />
                  {book?.status || "未設定"}
                </span>

                {/* メタ情報グリッド（罫線の下に配置するその他の情報） */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8 mb-8">
                  {/* 読書開始日 / 終了日 */}
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <CalendarArrowUp className="w-4 h-4 inline-block mr-1 mb-1" />
                      読書開始日
                    </div>
                    <div className="text-base font-semibold text-gray-800">
                      {formatJapaneseDate(book.startDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <CalendarArrowDown className="w-4 h-4 inline-block mr-1 mb-1" />
                      読書終了日
                    </div>
                    <div className="text-base font-semibold text-gray-800">
                      {formatJapaneseDate(book.endDate)}
                    </div>
                  </div>
                </div>

                {/* あらすじ */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Book className="w-5 h-5 text-amber-600" />
                    あらすじ
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {(() => {
                      const summaryText =
                        book.summary || book.description || "";
                      const limit = 150;
                      const isLong = summaryText.length > limit;
                      if (!summaryText) return "あらすじはありません";
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
                              className="ml-3 text-sm text-amber-600 hover:underline"
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
                <div className="mb-8 p-4 bg-white-50 rounded-xl border border-orange-200">
                  <div className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-yellow-600" />
                    あなたのレビュー・メモ
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {(() => {
                      const reviewText = book.review || "";
                      const limit = 150;
                      const isLong = reviewText.length > limit;
                      if (!reviewText) return "レビューはありません";
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
                              className="ml-3 text-sm text-amber-600 hover:underline"
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
                <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-500">
                  <div>
                    <span className="font-medium">追加日:</span>
                    <span className="ml-2">
                      {formatJapaneseDate(book.addedDate || book.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">最終更新日:</span>
                    <span className="ml-2">
                      {book?.updatedAt
                        ? formatJapaneseDate(book.updatedAt)
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">ISBN:</span>
                    <span className="ml-2">{book.isbn || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* メインのカードコンテナ (L257で開いたdiv) の閉じタグを追加 */}
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
