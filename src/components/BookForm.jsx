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
      // Ginサーバー（または直接ImgBB）のAPIを呼び出し
      const url = await fetchImageUrl(file);

      // formDataの状態を更新（親から渡されている場合はpropsの関数を呼ぶ）
      setFormData({ ...formData, thumbnail: url });
    } catch (error) {
      console.error("アップロード失敗:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 基本情報セクション */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">基本情報</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* フォームクリアボタン（編集画面では handleClear が渡されないため非表示） */}
            {handleClear && (
              <button
                onClick={handleClear}
                type="button"
                className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-gray-200 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                title="フォームをクリア"
              >
                <X className="w-4 h-4 text-gray-600" />
                <span className="hidden sm:inline text-gray-600">クリア</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側: 画像 */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              表紙画像
            </label>
            <div className="relative group aspect-2/3">
              {isUploading ? (
                // --- ローディング状態 ---
                <div className="w-full h-full bg-gray-100 rounded-xl flex flex-col items-center justify-center border-2 border-gray-200">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                  <p className="text-xs text-gray-500 font-medium">
                    アップロード中...
                  </p>
                </div>
              ) : formData.thumbnail ? (
                // --- 画像あり状態 ---
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={formData.thumbnail}
                    alt="Book cover"
                    className="w-full h-full object-cover"
                  />
                  {/* ホバー時に再アップロードボタンを表示 */}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="text-white w-8 h-8" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                // --- 画像なし（アップロード待ち）状態 ---
                <label className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-all">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                {/* タイトル */}
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`w-full flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${
                    validationErrors.title
                      ? "border-red-500 ring-red-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 著者 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  著者
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) =>
                    setFormData({ ...formData, authors: e.target.value })
                  }
                  placeholder="著者を入力"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border-gray-300"
                />
              </div>

              {/* ページ数 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${
                    validationErrors.pages
                      ? "border-red-500 ring-red-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.pages && (
                  <div
                    className="mt-2 inline-flex items-start gap-2 rounded-md px-3 py-2 bg-red-50 border border-red-100"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="text-sm text-red-700">
                      {validationErrors.pages}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 出版社 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none border-gray-300"
                />
              </div>

              {/* 出版日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none ${
                    validationErrors.publishedDate
                      ? "border-red-500 ring-red-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.publishedDate && (
                  <div
                    className="mt-2 inline-flex items-start gap-2 rounded-md px-3 py-2 bg-red-50 border border-red-100"
                    role="alert"
                    aria-live="polite"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <div className="text-sm text-red-700">
                      {validationErrors.publishedDate}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* あらすじ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            {/* ジャンル */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white appearance-none"
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

      {/* 詳細入力の表示/非表示トグル（基本情報の下、読書状況の間） */}
      <div className="mt-4 mb-6 flex items-center justify-center">
        <button
          onClick={() => setShowDetails((s) => !s)}
          type="button"
          aria-expanded={showDetails}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full border border-gray-200 flex items-center gap-2 font-semibold shadow-sm"
          title={showDetails ? "詳細を閉じる" : "詳細を表示"}
        >
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
          <span className="text-sm text-gray-700">詳細入力</span>
        </button>
      </div>

      {/* 読書記録セクション */}
      {showDetails && (
        <div className="rounded-xl p-6 border-2 border-blue-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">読書状況</h2>
          </div>

          <div className="space-y-4">
            {/* ステータス選択 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ステータス
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["未読", "読書中", "読了"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status }))}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all ${
                      formData.status === status
                        ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 読書開始日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none ${
                    validationErrors.dateOrder
                      ? "border-red-500 ring-red-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>

              {/* 読書終了日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white appearance-none ${
                    validationErrors.dateOrder
                      ? "border-red-500 ring-red-200 shadow-sm"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            {validationErrors.dateOrder && (
              <div
                className="mt-2 inline-flex items-start gap-2 rounded-md px-3 py-2 bg-red-50 border border-red-100"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <div className="text-sm text-red-700">
                  {validationErrors.dateOrder}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* タグセクション */}
      {showDetails && (
        <div className="rounded-xl p-6 border-2 border-purple-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">タグ</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {PREDEFINED_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  formData.tags.includes(tag)
                    ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Hash className="w-4 h-4 inline mr-1" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 評価・感想セクション */}
      {showDetails && (
        <div className="rounded-xl p-6 border-2 border-yellow-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-gray-900">評価・感想</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                評価
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || formData.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                感想・メモ
              </label>
              <textarea
                value={formData.review}
                onChange={(e) =>
                  setFormData({ ...formData, review: e.target.value })
                }
                placeholder="この本についての感想やメモを自由に記入してください..."
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
