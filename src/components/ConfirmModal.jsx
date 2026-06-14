import { createPortal } from "react-dom";

// 汎用確認モーダル
export default function ConfirmModal({
  isOpen, 
  title = "確認", 
  message = "実行しますか？", 
  confirmLabel = "はい", 
  cancelLabel = "キャンセル", 
  onConfirm = () => {},
  onCancel = () => {},
  loading = false,
}) {
  if (!isOpen) return null;

  const modal = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* 背景を fixed にして document.body に置くことで、アプリ全体（Sidebar/Header を含む）を暗くできる */}
      <div className="fixed inset-0 bg-black opacity-40" onClick={onCancel}></div>

      {/* モーダルをやや上に移動して表示 */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 z-10000 transform -translate-y-10">
        <div className="p-6">
          {/* タイトルとメッセージ */}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="mt-3 text-sm text-gray-700">{message}</div>

          <div className="mt-6 flex justify-end gap-3">
            {/* キャンセルボタン */}
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              disabled={loading}
            >
              {cancelLabel}
            </button>
            {/* 確認ボタン */}
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              disabled={loading}
            >
              {loading ? "処理中..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // document が存在する環境でポータルを使って body に挿入
  // これにより、モーダルが他のコンテンツの上に正しく表示される
  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }

  return modal;
};
