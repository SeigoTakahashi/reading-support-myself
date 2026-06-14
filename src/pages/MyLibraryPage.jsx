import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Grid3x3,
  List,
  Filter,
  SlidersHorizontal,
  Search,
  Tag,
  Book,
  BookOpen,
  Globe,
  Heart,
} from "lucide-react";
import BaseTemplate from "../components/BaseTemplate";
import ConfirmModal from "../components/ConfirmModal";
import ActionMenu from "../components/ActionMenu";
import Pagination from "../components/Pagination";
import Breadcrumb from "../components/Breadcrumb";
import InlineLoading from "../components/InlineLoading";
import Toast from "../components/Toast";
import StarAndRating from "../components/StarAndRating";
import LimitedTags from "../components/LimitedTags";
import { deleteUserBook } from "../utils/handle-database";
import { applyFilters as applyFiltersUtil } from "../utils/library-filter";
import { getStatusColor } from "../utils/status-color";
import { AuthContextConsumer } from "../../AuthContext";
import { MyLibraryContextConsumer } from "../../MyLibraryContext";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { setCacheValue, getCacheValue } from "../utils/cache";

const PAGE_SIZE = 12;

// キャッシュ値の保存/読み込み
const loadUserPreferences = (userId) => {
  if (!userId)
    return { viewMode: "grid", filterStatus: "all", sortBy: "created-newest" };
  return {
    viewMode: getCacheValue(userId, "viewMode", false) || "grid",
    filterStatus: getCacheValue(userId, "filterStatus", false) || "all",
    sortBy: getCacheValue(userId, "sortBy", false) || "created-newest",
  };
};

const saveUserPreference = (userId, key, value) => {
  if (userId) setCacheValue(userId, key, value);
};

export default function MyLibraryPage() {
  const { loginUser } = AuthContextConsumer();
  const { decrementMylibraryCount } = MyLibraryContextConsumer();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: libraryData, loading } = useUserLibrary(loginUser?.uid);

  // UI状態
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created-newest");
  const [currentPage, setCurrentPage] = useState(1);

  // データ状態
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [paginatedBooks, setPaginatedBooks] = useState([]);

  // メニュー・削除状態
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // トースト状態
  const [toastMessage, setToastMessage] = useState(null);
  const [toastId, setToastId] = useState(0);

  // libraryDataをbooksに反映
  useEffect(() => {
    if (libraryData) setBooks(libraryData);
  }, [libraryData]);

  // 三点メニュー開閉管理
  useEffect(() => {
    const handleDocClick = (e) => {
      if (!e.target.closest("[data-menu-root-id]")) setOpenMenuId(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  // ユーザー設定を読み込み
  useEffect(() => {
    if (!loginUser) return;
    const prefs = loadUserPreferences(loginUser.uid);
    setViewMode(prefs.viewMode);
    setFilterStatus(prefs.filterStatus);
    setSortBy(prefs.sortBy);
  }, [loginUser]);

  // フィルタリング・ページネーション
  useEffect(() => {
    try {
      const filtered = applyFiltersUtil(books, {
        filterStatus,
        searchQuery,
        sortBy,
      });

      setFilteredBooks(filtered);

      const filteredCount = Array.isArray(filtered) ? filtered.length : 0;
      const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
        setPaginatedBooks([]);
        return;
      }

      setPaginatedBooks(
        filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
      );
    } catch (e) {
      console.error(e);
      const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
      if (currentPage > totalPages) setCurrentPage(totalPages);
    } finally {
      // スクロールをトップに戻す
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [books, currentPage, filterStatus, searchQuery, sortBy]);

  // ユーザー設定を保存
  useEffect(() => {
    saveUserPreference(loginUser?.uid, "viewMode", viewMode);
  }, [viewMode, loginUser?.uid]);

  useEffect(() => {
    saveUserPreference(loginUser?.uid, "filterStatus", filterStatus);
  }, [filterStatus, loginUser?.uid]);

  useEffect(() => {
    saveUserPreference(loginUser?.uid, "sortBy", sortBy);
  }, [sortBy, loginUser?.uid]);

  // 削除処理
  const handleDelete = async () => {
    if (!selectedToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteUserBook(selectedToDelete.id);

      if (!res.success) {
        console.error("Failed to delete userBook:", res.error);
        return;
      }

      setBooks((prev) => prev.filter((b) => b.id !== selectedToDelete.id));
      setToastMessage("本を削除しました");
      setToastId(Date.now());
      setCurrentPage((p) => Math.max(1, p));
      decrementMylibraryCount();
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedToDelete(null);
      setIsDeleting(false);
      setShowDeleteModal(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // フィルターをリセット
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setSortBy("created-newest");
    setCurrentPage(1);
  };

  return (
    <>
      {location.state?.toastMessage && (
        <Toast
          message={location.state.toastMessage}
          toastId={location.state.toastId}
        />
      )}
      {toastMessage && <Toast message={toastMessage} toastId={toastId} />}

      <BaseTemplate childrenPath={"/mylibrary"}>
        <Breadcrumb items={["メイン", "マイライブラリ"]} />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
              マイライブラリ 📚
            </h1>
            {loading ? (
              <p className="text-gray-500 text-base">本棚を読み込み中...</p>
            ) : (
              <p className="text-gray-500 text-base">
                {books.length !== 0
                  ? `あなたの本棚には ${books.length} 冊の本があります`
                  : "あなたの本棚には本がありません"}
              </p>
            )}
          </div>
          <Link
            to="/mylibrary/input"
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-semibold shadow-md transition transform hover:scale-102 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-200"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden lg:inline">本を追加</span>
          </Link>
        </div>

        {/* ツールバー */}
        <div className="bg-white rounded-2xl border border-gray-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)] p-4 mb-6 lg:sticky lg:top-22 lg:z-30 lg:bg-white/95 lg:backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* 左側：表示切り替えとフィルター */}
            <div className="flex items-center gap-3">
              {/* 表示切り替え */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">グリッド</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">リスト</span>
                </button>
              </div>

              {/* ステータスフィルター */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                >
                  <option value="all">すべて</option>
                  <option value="reading">読書中</option>
                  <option value="completed">読了</option>
                  <option value="unread">未読</option>
                </select>
                <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 右側：ソートと検索 */}
            <div className="flex items-center gap-3">
              {/* ソート */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                >
                  <option value="created-newest">追加日(新しい順)</option>
                  <option value="created-oldest">追加日(古い順)</option>
                  <option value="title">タイトル順</option>
                  <option value="rating">評価順</option>
                  <option value="published-newest">出版日(新しい順)</option>
                  <option value="published-oldest">出版日(古い順)</option>
                </select>
                <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* 検索 */}
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-64">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="検索..."
                  className="hidden sm:block bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        {loading ? (
          <InlineLoading />
        ) : (
          <>
            {filteredBooks.length === 0 ? (
              books.length === 0 ? (
                // ライブラリが空
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow p-8 mb-6 flex flex-col items-center text-center gap-6">
                  <div className="w-40 h-40 flex items-center justify-center text-gray-200">
                    <Book className="w-40 h-40" />
                  </div>
                  <div className="max-w-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                      まだ書籍が登録されていません。
                    </h2>
                    <p className="text-gray-500">
                      読みたい本を追加して、自分だけの本棚をつくろう。
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/mylibrary/input"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        本を追加
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // フィルター結果が0件
                <div className="bg-white rounded-2xl border border-gray-200/50 shadow p-8 mb-6 flex flex-col items-center text-center gap-6">
                  <div className="w-40 h-40 flex items-center justify-center text-gray-200">
                    <Book className="w-40 h-40" />
                  </div>
                  <div className="max-w-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                      該当する本が見つかりませんでした。
                    </h2>
                    <p className="text-gray-500">
                      検索ワードやフィルターを見直すか、条件をクリアしてみてください。
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={handleClearFilters}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold shadow-sm cursor-pointer"
                      >
                        フィルターをクリア
                      </button>
                      <Link
                        to="/mylibrary/input"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        本を追加
                      </Link>
                    </div>
                  </div>
                </div>
              )
            ) : (
              // グリッド表示
              viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {paginatedBooks.map((book) => (
                    <div
                      key={book.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/mylibrary/detail/${book.id}`)}
                      onKeyDown={(e) => {
                        if (["Enter", " ", "Spacebar"].includes(e.key))
                          navigate(`/mylibrary/detail/${book.id}`);
                      }}
                      className="relative group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                    >
                      <div className="relative h-72 bg-gray-50 overflow-hidden">
                        {book?.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book?.title ?? ""}
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Book className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              book?.status ?? "",
                            )} backdrop-blur-sm`}
                          >
                            <BookOpen className="w-3 h-3 text-current" />
                            {book?.status ?? ""}
                          </span>
                        </div>
                      </div>

                      <ActionMenu
                        id={book.id}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        onDetail={() =>
                          navigate(`/mylibrary/detail/${book.id}`)
                        }
                        onEdit={() => navigate(`/mylibrary/edit/${book.id}`)}
                        onDelete={() => {
                          setSelectedToDelete(book);
                          setShowDeleteModal(true);
                        }}
                        bottomRight={true}
                      />

                      <div className="p-4">
                        <div className="mb-2">
                          <h3
                            className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-600 transition-colors truncate"
                            title={book?.title ?? ""}
                          >
                            {book?.title ?? ""}
                          </h3>
                          <p
                            className="text-sm text-gray-500 truncate"
                            title={book?.authors ?? ""}
                          >
                            {book?.authors ?? ""}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <StarAndRating rating={book?.rating ?? null} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* リスト表示 */}
            {viewMode === "list" && filteredBooks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.08)] overflow-visible">
                <div className="divide-y divide-gray-100">
                  {paginatedBooks.map((book) => (
                    <div
                      key={book.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/mylibrary/detail/${book.id}`)}
                      onKeyDown={(e) => {
                        if (["Enter", " ", "Spacebar"].includes(e.key))
                          navigate(`/mylibrary/detail/${book.id}`);
                      }}
                      className="relative group p-5 hover:bg-linear-to-r hover:from-gray-50 hover:to-transparent transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-20 shrink-0 rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                          {book?.thumbnail ? (
                            <img
                              src={book.thumbnail}
                              alt={book?.title ?? ""}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Book className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors truncate"
                            title={book?.title ?? ""}
                          >
                            {book?.title ?? ""}
                          </h3>
                          <p
                            className="text-sm text-gray-500 mb-3 truncate"
                            title={book?.authors ?? ""}
                          >
                            {book?.authors ?? ""}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="w-20 flex items-center">
                              <StarAndRating rating={book?.rating ?? null} />
                            </div>

                            <div className="hidden sm:flex w-36 items-center ml-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                                <Tag className="w-3 h-3" />
                                {book?.genre ?? ""}
                              </span>
                            </div>
                            <div className="hidden sm:flex flex-1">
                              <LimitedTags tags={book.tags || []} limit={3} />
                            </div>
                          </div>
                        </div>

                        <div
                          className="relative flex items-center self-center"
                          data-menu-root-id={book.id}
                        >
                          <ActionMenu
                            id={book.id}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                            onDetail={() =>
                              navigate(`/mylibrary/detail/${book.id}`)
                            }
                            onEdit={() =>
                              navigate(`/mylibrary/edit/${book.id}`)
                            }
                            onDelete={() => {
                              setSelectedToDelete(book);
                              setShowDeleteModal(true);
                            }}
                            alignCenter={true}
                          />
                        </div>

                        <div className="absolute right-16 bottom-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              book.status,
                            )}`}
                          >
                            <BookOpen className="w-3 h-3 text-current" />
                            {book.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ページネーション */}
            {filteredBooks.length > 0 && (
              <Pagination
                total={filteredBooks.length}
                pageSize={PAGE_SIZE}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                visibleCount={5}
              />
            )}
          </>
        )}
      </BaseTemplate>

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={
          selectedToDelete
            ? `「${selectedToDelete.title}」を削除しますか？`
            : "本を削除しますか？"
        }
        message="この操作は元に戻せません。ライブラリから本を削除してもよろしいですか？"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        loading={isDeleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
