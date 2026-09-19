import { useState } from "react";
import {
  Book,
  Calendar,
  Star,
  Tag,
  Hash,
  Image,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
} from "lucide-react";
import { PREDEFINED_GENRES, PREDEFINED_TAGS } from "../../const";
import { fetchImageUrl } from "../utils/fetch-image-url";

export default function BookForm({
  formData,
  setFormData,
  validationErrors,
  refs,
  hoverRating,
  setHoverRating,
  handleClear,
}) {
  // 詳細入力の折りたたみ状態
  const [showDetails, setShowDetails] = useState(false);

  // 画像アップロード中の状態
  const [isUploading, setIsUploading] = useState(false);

  // タグの追加/削除
  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  // 画像ファイル選択時のハンドラ
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await fetchImageUrl(file);
      setFormData({ ...formData, thumbnail: url });
    } catch (error) {
      console.error("アップロード失敗:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本情報セクション */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Book className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">基本情報</h2>
          </div>
          {/* フォームクリアボタン */}
          {handleClear && (
            <button
              onClick={handleClear}
              type="button"
              className="px-3 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs text-zinc-600 shadow-2xs cursor-pointer"
              title="フォームをクリア"
            >
              <X className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">クリア</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 画像 */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              表紙画像
            </label>
            <div className="relative group aspect-2/3">
              {isUploading ? (
                <div className="w-full h-full bg-zinc-50 rounded-xl flex flex-col items-center justify-center border border-zinc-200">
                  <Loader2 className="w-8 h-8 text-zinc-500 animate-spin mb-2" />
                  <p className="text-xs text-zinc-500 font-medium">
                    アップロード中...
                  </p>
                </div>
              ) : formData.thumbnail ? (
                <div className="relative overflow-hidden rounded-xl shadow-md border border-zinc-200/60 w-full h-full">
                  <img
                    src={formData.thumbnail}
                    alt="Book cover"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="text-white w-6 h-6" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                <label className="w-full h-full bg-zinc-50/60 rounded-xl flex flex-col items-center justify-center border border-dashed border-zinc-300 cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all">
                  <div className="text-center p-4">
                    <Image className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-zinc-600">
                      クリックしてアップロード
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              )}
            </div>
          </div>

          {/* 右側: フォーム */}
          <div className="lg:col-span-2 space-y-4">
            {/* タイトル */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                ref={(el) => (refs.current.title = el)}
                placeholder="タイトルを入力"
                className={`w-full px-3.5 py-2.5 text-base bg-white border rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all ${
                  validationErrors.title
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-zinc-200"
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 著者 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  著者
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) =>
                    setFormData({ ...formData, authors: e.target.value })
                  }
                  placeholder="著者を入力"
                  className="w-full px-3.5 py-2.5 text-base bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all"
                />
              </div>

              {/* ページ数 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  ページ数
                </label>
                <input
                  type="number"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData({ ...formData, pages: e.target.value })
                  }
                  ref={(el) => (refs.current.pages = el)}
                  placeholder="ページ数を入力"
                  className={`w-full px-3.5 py-2.5 text-base bg-white border rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all ${
                    validationErrors.pages
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-zinc-200"
                  }`}
                />
                {validationErrors.pages && (
                  <div
                    className="mt-1.5 inline-flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 bg-red-50 border border-red-200"
                    role="alert"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-700">
                      {validationErrors.pages}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 出版社 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  出版社
                </label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publisher: e.target.value,
                    })
                  }
                  placeholder="出版社を入力"
                  className="w-full px-3.5 py-2.5 text-base bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all"
                />
              </div>

              {/* 出版日 */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  出版日（例: 2023-05-01）
                </label>
                <input
                  type="text"
                  value={formData.publishedDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      publishedDate: e.target.value,
                    })
                  }
                  ref={(el) => (refs.current.publishedDate = el)}
                  placeholder="出版日を入力"
                  className={`w-full px-3.5 py-2.5 text-base bg-white border rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all ${
                    validationErrors.publishedDate
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-zinc-200"
                  }`}
                />
                {validationErrors.publishedDate && (
                  <div
                    className="mt-1.5 inline-flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 bg-red-50 border border-red-200"
                    role="alert"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-700">
                      {validationErrors.publishedDate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* あらすじ */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                あらすじ
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="書籍のあらすじや概要を入力"
                rows={3}
                className="w-full px-3.5 py-2.5 text-base bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none resize-none transition-all"
              />
            </div>

            {/* ジャンル */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                ジャンル
              </label>
              <select
                value={formData.genre}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    genre: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 text-base bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none appearance-none cursor-pointer"
              >
                <option value="">選択してください</option>
                {Object.entries(PREDEFINED_GENRES).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細入力の表示/非表示トグル */}
      <div className="flex items-center justify-center my-6">
        <button
          onClick={() => setShowDetails((s) => !s)}
          type="button"
          aria-expanded={showDetails}
          className="px-4 py-2 bg-white hover:bg-zinc-50 rounded-full border border-zinc-200 flex items-center gap-2 font-medium text-xs text-zinc-700 shadow-2xs transition-all cursor-pointer"
          title={showDetails ? "詳細を閉じる" : "詳細を表示"}
        >
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
          <span>詳細情報を入力する</span>
        </button>
      </div>

      {/* 読書状況セクション */}
      {showDetails && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">読書状況</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                ステータス
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {["未読", "読書中", "読了"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status }))}
                    className={`w-full px-4 py-2.5 rounded-xl text-base font-medium transition-all cursor-pointer ${
                      formData.status === status
                        ? "bg-zinc-900 text-white shadow-2xs"
                        : "bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  読書開始日
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value,
                    })
                  }
                  ref={(el) => (refs.current.startDate = el)}
                  className={`w-full px-2.5 sm:px-3.5 py-2.5 text-base bg-white border rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all box-border ${
                    validationErrors.dateOrder
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-zinc-200"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  読書終了日
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value,
                    })
                  }
                  className={`w-full px-2.5 sm:px-3.5 py-2.5 text-base bg-white border rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none transition-all box-border ${
                    validationErrors.dateOrder
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-zinc-200"
                  }`}
                />
              </div>
            </div>
            {validationErrors.dateOrder && (
              <div
                className="mt-2 inline-flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 bg-red-50 border border-red-200"
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700">
                  {validationErrors.dateOrder}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* タグセクション */}
      {showDetails && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">タグ</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  formData.tags.includes(tag)
                    ? "bg-zinc-900 text-white shadow-2xs"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/80"
                }`}
              >
                <Hash className="w-3 h-3 inline mr-0.5 opacity-70" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 評価・感想セクション */}
      {showDetails && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-zinc-100">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
              <Star className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">評価・感想</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                評価
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 cursor-pointer p-1"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || formData.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-zinc-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                感想・メモ
              </label>
              <textarea
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                placeholder="この本についての感想やメモを自由に記入してください..."
                rows={5}
                className="w-full px-3.5 py-2.5 text-zinc-600 text-base bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 outline-none resize-none transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
