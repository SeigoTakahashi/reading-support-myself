import { useState, useEffect, useRef } from "react";
import {
  Book,
  BookOpen,
  X,
  Search,
  Camera,
  Save,
  Scan,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import BarcodeScanner from "../components/BarcodeScanner";
import BaseTemplate from "../components/BaseTemplate";
import BookForm from "../components/BookForm";
import { validateForm, focusFirstError } from "../utils/validation";
import { upsertBookAndCreateUserBook } from "../utils/handle-database";
import { navigateWithToast } from "../utils/navigation";
import { AuthContextConsumer } from "../../AuthContext";
import { MyLibraryContextConsumer } from "../../MyLibraryContext";
import { ensureHttps } from "../utils/secure-url";

// フォームデータのデフォルト値
const getDefaultFormData = () => ({
  isbn: "",
  title: "",
  authors: "",
  publisher: "",
  publishedDate: "",
  genre: "",
  thumbnail: "",
  pages: "",
  description: "",
  startDate: "",
  endDate: "",
  rating: 0,
  review: "",
  status: "未読",
  tags: [],
  isPublic: false,
});

// メイン入力フォーム
export default function BookInfoInputPage() {
  const navigate = useNavigate();
  const { loginUser } = AuthContextConsumer();
  const { incrementMylibraryCount } = MyLibraryContextConsumer();
  const location = useLocation();

  const [showScanner, setShowScanner] = useState(false);
  const [isLoadingIsbn, setIsLoadingIsbn] = useState(false);
  const [isLoadingTitle, setIsLoadingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMode, setInputMode] = useState("scan");
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState(getDefaultFormData());

  const refs = useRef({
    search: null,
    isbn: null,
    title: null,
    pages: null,
    publishedDate: null,
    startDate: null,
  });

  // ルート経由で事前入力が渡された場合に反映
  useEffect(() => {
    try {
      const prefill = location?.state?.prefill;
      if (prefill && typeof prefill === "object") {
        setFormData((prev) => ({
          ...prev,
          isbn: prefill.isbn || prev.isbn,
          title: prefill.title || prev.title,
          authors: prefill.authors || prev.authors,
          publisher: prefill.publisher || prev.publisher,
          publishedDate: prefill.publishedDate || prev.publishedDate,
          thumbnail: prefill.thumbnail || prev.thumbnail,
          pages: prefill.pages != null ? String(prefill.pages) : prev.pages,
          description: prefill.description || prev.description,
        }));
      }
    } catch (err) {
      console.warn("prefill failed", err);
    }
  }, [location?.state]);

  // 外部クリックで検索結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refs.current.search && !refs.current.search.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchResults]);

  // ISBN入力時の自動補完
  useEffect(() => {
    if (formData.isbn.length === 10 || formData.isbn.length === 13) {
      fetchByIsbn(formData.isbn);
    }
  }, [formData.isbn]);

  // エラーメッセージをセット
  const setErrorMessage = (message) => {
    setSaveError(true);
    setSaveErrorMessage(message);
  };

  // 検索結果をクリア
  const clearSearchResults = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // ISBN検索
  const fetchByIsbn = async (isbn) => {
    if (!isbn || isbn.trim() === "") return;

    setIsLoadingIsbn(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GIN_API_URL}/books?searchQuery=${encodeURIComponent(`isbn:${isbn}`)}&maxResults=1`,
      );

      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();

      if (!data.items || data.items.length === 0) return;

      const book = data.items[0].volumeInfo;
      setFormData((prev) => ({
        ...prev,
        title: book.title || prev.title,
        authors: book.authors ? book.authors.join(", ") : prev.authors,
        publisher: book.publisher || prev.publisher,
        publishedDate: book.publishedDate || prev.publishedDate,
        genre: book.categories ? book.categories.join(", ") : prev.genre,
        thumbnail: ensureHttps(book.imageLinks?.thumbnail) || prev.thumbnail,
        pages: book.pageCount?.toString() || prev.pages,
        description: book.description || prev.description,
      }));
    } catch (err) {
      console.error("書籍情報の取得に失敗", err);
    } finally {
      setIsLoadingIsbn(false);
    }
  };

  // タイトル検索
  const fetchByTitle = async (title) => {
    if (!title || title.trim() === "") return;

    setIsLoadingTitle(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GIN_API_URL}/books?searchQuery=${encodeURIComponent(`intitle:${title}`)}&maxResults=40`,
      );

      if (!response.ok) throw new Error("Failed to fetch books");
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        setSearchResults([]);
        setShowSearchResults(true);
        return;
      }

      const results = data.items.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title || "",
        authors: item.volumeInfo.authors
          ? item.volumeInfo.authors.join(", ")
          : "",
        publisher: item.volumeInfo.publisher || "",
        publishedDate: item.volumeInfo.publishedDate || "",
        genre: item.volumeInfo.categories
          ? item.volumeInfo.categories.join(", ")
          : "",
        thumbnail: ensureHttps(item.volumeInfo.imageLinks?.thumbnail) || null,
        pages: item.volumeInfo.pageCount?.toString() || "",
        description: item.volumeInfo.description || "",
        isbn:
          item.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_13",
          )?.identifier ||
          item.volumeInfo.industryIdentifiers?.find(
            (id) => id.type === "ISBN_10",
          )?.identifier ||
          "",
      }));

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      console.error("書籍情報の取得に失敗", err);
    } finally {
      setIsLoadingTitle(false);
    }
  };

  // 検索結果から本を選択
  const selectBookFromSearch = (book) => {
    setFormData((prev) => ({
      ...prev,
      isbn: book.isbn,
      title: book.title,
      authors: book.authors,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      genre: book.genre,
      thumbnail: book.thumbnail,
      pages: book.pages,
      description: book.description || prev.description,
    }));
    clearSearchResults();
    setSearchQuery(book.title || "");
  };

  // バーコードスキャン結果
  const handleBarcodeResult = (isbn) => {
    setFormData((prev) => ({ ...prev, isbn }));
    clearSearchResults();
  };

  // フォームをリセット
  const handleClear = () => {
    setFormData(getDefaultFormData());
    clearSearchResults();
    setShowScanner(false);
    setSaveError(false);
    setValidationErrors({});
    setHoverRating(0);
  };

  // 本の保存処理
  const handleSave = async () => {
    setIsSaving(true);
    setValidationErrors({});
    setSaveError(false);
    setSaveErrorMessage("");

    const { valid, errors } = validateForm(formData);
    if (!valid) {
      setValidationErrors(errors);
      focusFirstError(errors, refs);
      setIsSaving(false);
      return;
    }

    try {
      const bookData = {
        title: formData.title,
        thumbnail: formData.thumbnail,
        authors: formData.authors,
        pages: formData.pages,
        publisher: formData.publisher,
        publishedDate: formData.publishedDate,
        description: formData.description,
        isbn: formData.isbn,
      };

      const userBookData = {
        genre: formData.genre,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        rating: formData.rating,
        review: formData.review,
        tags: formData.tags,
      };

      const res = await upsertBookAndCreateUserBook(
        bookData,
        userBookData,
        loginUser.uid,
      );

      if (!res.success) {
        if (res.error?.code === "duplicate_userbook") {
          setErrorMessage(res.error.message);
        } else {
          setErrorMessage(
            "本の保存に失敗しました。時間をおいて再度お試しください。",
          );
        }
        return;
      }

      incrementMylibraryCount();

      navigateWithToast(
        navigate,
        "/mylibrary",
        "本をライブラリに追加しました！",
      );
    } catch (e) {
      console.error(e);
      setErrorMessage("書籍情報の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseTemplate childrenPath={"/mylibrary/input"}>
      <Breadcrumb items={["メイン", "マイライブラリ", "本を追加"]} />

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">本を追加</h1>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-8">
          {/* ISBN/バーコード入力セクション */}
          <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg ring-1 ring-amber-100">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <Scan className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                書籍情報を取得
              </h2>
            </div>

            {/* モード切替 */}
            <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1 w-full max-w-sm mx-auto mb-8">
              <button
                onClick={() => {
                  setInputMode("scan");
                  clearSearchResults();
                }}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  inputMode === "scan"
                    ? "bg-white text-orange-600 shadow-md"
                    : "text-gray-600 hover:text-orange-500"
                }`}
                aria-pressed={inputMode === "scan"}
              >
                <Camera className="w-4 h-4" />
                <span className="md:hidden">スキャン</span>
                <span className="hidden md:inline">バーコードスキャン</span>
              </button>

              <button
                onClick={() => {
                  setInputMode("title");
                  clearSearchResults();
                }}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-300 ${
                  inputMode === "title"
                    ? "bg-white text-orange-600 shadow-md"
                    : "text-gray-600 hover:text-orange-500"
                }`}
                aria-pressed={inputMode === "title"}
              >
                <Search className="w-4 h-4" />
                <span className="md:hidden">検索</span>
                <span className="hidden md:inline">タイトル検索</span>
              </button>
            </div>

            {/* スキャンモード */}
            {inputMode === "scan" ? (
              <div className="flex flex-col items-center justify-center p-6 bg-amber-50 rounded-xl border border-amber-200 shadow-inner">
                <Camera className="w-12 h-12 text-amber-600 mb-4" />
                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full sm:w-80 px-6 py-3 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-3 justify-center shadow-lg shadow-orange-300/50 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300"
                  type="button"
                  aria-label="バーコードスキャナーを開く"
                >
                  <Camera className="w-6 h-6" />
                  <span className="md:hidden">起動</span>
                  <span className="hidden md:inline">スキャナーを起動</span>
                </button>
                {isLoadingIsbn && (
                  <div className="mt-4 flex items-center gap-2 text-amber-600 text-sm font-medium">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>書籍情報を取得中...</span>
                  </div>
                )}
              </div>
            ) : (
              // タイトル検索モード
              <div
                className="relative w-full"
                ref={(el) => (refs.current.search = el)}
              >
                <div className="flex rounded-xl shadow-lg focus-within:ring-2 focus-within:ring-orange-300 transition-shadow">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="例: 吾輩は猫である"
                    className={`w-full px-4 py-3 border-y border-gray-200 outline-none text-gray-800 ${
                      searchQuery ? "border-l-0" : "rounded-l-xl"
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchByTitle(searchQuery);
                      }
                    }}
                    aria-label="タイトルで検索"
                    disabled={isLoadingTitle}
                  />

                  <button
                    onClick={() => fetchByTitle(searchQuery)}
                    disabled={isLoadingTitle || !searchQuery}
                    className="shrink-0 px-4 py-3 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-r-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold focus:outline-none"
                    title="検索実行"
                    aria-label="検索実行"
                  >
                    {isLoadingTitle ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* 検索結果ドロップダウン */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-[40vh] overflow-y-auto">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0">
                      <span className="text-sm font-semibold text-gray-700">
                        検索結果 ({searchResults.length}件)
                      </span>
                      <button
                        onClick={() => setShowSearchResults(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label="検索結果を閉じる"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map((book, index) => (
                        <div
                          key={book.id || index}
                          onClick={() => selectBookFromSearch(book)}
                          className="p-4 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors flex gap-4 items-center"
                          role="button"
                          tabIndex={0}
                        >
                          {book.thumbnail ? (
                            <img
                              src={book.thumbnail}
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded shadow-md shrink-0 border border-gray-100"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x150/fca5a5/ffffff?text=No+Cover";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center shrink-0 shadow-md">
                              <Book className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base line-clamp-2">
                              {book.title}
                            </h4>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {book.authors} / {book.publisher}
                            </p>
                            {book.isbn && (
                              <p className="text-xs text-gray-400 font-mono mt-0.5">
                                ISBN: {book.isbn}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        {isLoadingTitle ? (
                          <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>検索中...</span>
                          </div>
                        ) : (
                          <>
                            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-orange-400" />
                            <p className="text-base font-medium">
                              該当する書籍が見つかりませんでした
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              キーワードを変えて再度お試しください。
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 本の入力フォーム */}
          <BookForm
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
            refs={refs}
            handleClear={handleClear}
            hoverRating={hoverRating}
            setHoverRating={setHoverRating}
          />

          {/* 保存ボタン */}
          <div className="flex flex-col gap-3 pt-4">
            {saveError && (
              <div
                className="w-full rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-left text-sm text-red-800 flex items-start gap-3"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">保存に失敗しました</div>
                  <div className="mt-1 text-sm text-red-700">
                    {saveErrorMessage ||
                      "保存中にエラーが発生しました。時間をおいて再度お試しください。"}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={
                isLoadingIsbn || isLoadingTitle || isSaving || !formData.title
              }
              className="flex-1 px-6 py-4 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>ライブラリに追加</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* バーコードスキャナーモーダル */}
      {showScanner && (
        <BarcodeScanner
          onClose={() => setShowScanner(false)}
          onScan={handleBarcodeResult}
        />
      )}
    </BaseTemplate>
  );
}
