import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Loader, BookOpen, AlertCircle } from "lucide-react";
import BaseTemplate from "../components/BaseTemplate";
import Breadcrumb from "../components/Breadcrumb";
import BookForm from "../components/BookForm";
import InlineLoading from "../components/InlineLoading";
import { AuthContextConsumer } from "../../AuthContext";
import {
  upsertBook,
  updateBook,
  updateUserBook,
} from "../utils/handle-database";
import { validateForm, focusFirstError } from "../utils/validation";
import { useUserLibrary } from "../hooks/useUserLibrary";

// フォームデータのデフォルト値
const getDefaultFormData = () => ({
  bookId: null,
  isbn: "",
  title: "",
  authors: "",
  publisher: "",
  publishedDate: "",
  thumbnail: "",
  pages: "",
  description: "",
  genre: "",
  status: "",
  startDate: "",
  endDate: "",
  rating: 0,
  review: "",
  tags: [],
  isPublic: false,
});

// 本の編集ページ（userBooks の id を受け取り、userBook と book を編集する）
export default function BookInfoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loginUser } = AuthContextConsumer();
  const { data: libraryData, loading: libraryLoading } = useUserLibrary(
    loginUser?.uid,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState(getDefaultFormData());

  const refs = useRef({
    title: null,
    pages: null,
    publishedDate: null,
    startDate: null,
  });

  // ライブラリデータから編集するレコードを取得
  useEffect(() => {
    if (libraryLoading || !libraryData?.length) return;

    const record = libraryData.find((r) => r.id === id);

    if (!record) {
      setSaveError(true);
      setSaveErrorMessage("該当の書籍が見つかりません");
      return;
    }

    setSaveError(false);
    setSaveErrorMessage("");
    setFormData({
      bookId: record.bookId || null,
      isbn: record.isbn || "",
      title: record.title || "",
      authors: record.authors || "",
      publisher: record.publisher || "",
      publishedDate: record.publishedDate || "",
      thumbnail: record.thumbnail || "",
      pages: record.pages || "",
      description: record.description || "",
      genre: record.genre || "",
      status: record.status || "",
      startDate: record.startDate || "",
      endDate: record.endDate || "",
      rating: record.rating ?? 0,
      review: record.review || "",
      tags: record.tags || [],
      isPublic: record.isPublic ?? false,
    });
  }, [id, libraryData, libraryLoading]);

  // エラーメッセージをセット
  const setErrorMessage = (message) => {
    setSaveError(true);
    setSaveErrorMessage(message);
  };

  // book を更新または作成して bookId を返す
  const saveBook = async () => {
    const bookData = {
      isbn: formData.isbn,
      title: formData.title,
      authors: formData.authors,
      publisher: formData.publisher,
      publishedDate: formData.publishedDate,
      thumbnail: formData.thumbnail,
      pages: formData.pages,
      description: formData.description,
    };

    let bookId = formData.bookId;

    if (bookId) {
      const res = await updateBook(bookId, bookData);
      if (!res.success) {
        throw new Error("書籍情報の更新に失敗しました");
      }
    } else {
      const res = await upsertBook(bookData);
      if (!res.success) {
        throw new Error("書籍情報の登録に失敗しました");
      }
      bookId = res.id;
    }

    return bookId;
  };

  // userBook を更新
  const saveUserBook = async (bookId) => {
    const userBookData = {
      bookId,
      genre: formData.genre,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      rating: formData.rating,
      review: formData.review,
      tags: formData.tags,
      isPublic: formData.isPublic,
    };

    const res = await updateUserBook(id, userBookData);
    if (!res.success) {
      throw new Error("書籍情報の更新に失敗しました");
    }
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
      const bookId = await saveBook();
      await saveUserBook(bookId);

      navigate("/mylibrary", {
        state: { toastMessage: "書籍情報を更新しました", toastId: Date.now() },
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "書籍情報の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseTemplate childrenPath={"/mylibrary"}>
      <Breadcrumb
        items={["メイン", "マイライブラリ", formData.title || "..."]}
      />

      {libraryLoading ? (
        <InlineLoading />
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-white text-2xl font-bold">本を編集</h1>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-8">
            <BookForm
              formData={formData}
              setFormData={setFormData}
              validationErrors={validationErrors}
              refs={refs}
              hoverRating={hoverRating}
              setHoverRating={setHoverRating}
            />

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
                disabled={isSaving}
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
                    <span>変更を保存</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </BaseTemplate>
  );
}
