import { MoreVertical, Info, Edit, Trash2 } from "lucide-react";

// 汎用アクションメニュー（3点リーダー）
export default function ActionMenu({
  id, // メニューのルート要素を識別するためのID
  openMenuId, // 現在開いているメニューのID
  setOpenMenuId, // メニューの開閉を制御するための関数
  onDetail = () => {}, // 詳細表示のコールバック関数
  onEdit = () => {}, // 編集のコールバック関数
  onDelete = () => {}, // 削除のコールバック関数
  alignCenter = false, // true のとき縦中央に配置する（グリッドとリスト表示で別の表示にするため）
}) {
  const isOpen = openMenuId === id; // このメニューが開いているかどうかの判定

  return (
    <div
      className={
        alignCenter
          ? "absolute right-3 top-0 bottom-0 flex items-center"
          : "absolute top-3 right-3"
      }
      data-menu-root-id={id}
    >
      <div className="relative inline-block">
        {/* メニュー開閉ボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : id);
          }}
          className="p-2 bg-white/90 hover:bg-white z-10 rounded-lg transition-all cursor-pointer"
          aria-expanded={isOpen}
          aria-controls={`menu-${id}`}
        >
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>

        <div
          id={`menu-${id}`}
          className={`absolute right-0 mt-2 w-40 z-50 bg-white border border-gray-100 rounded-xl shadow-lg transition-all ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <ul className="py-2">
            {
              // アクション定義を配列化して map でレンダリングすることで重複を回避
            }
            {[
              {
                key: "detail",
                label: "詳細",
                Icon: Info,
                textClass: "text-gray-700",
                iconClass: "text-gray-400",
                handler: onDetail,
              },
              {
                key: "edit",
                label: "編集",
                Icon: Edit,
                textClass: "text-gray-700",
                iconClass: "text-gray-400",
                handler: onEdit,
              },
              {
                key: "delete",
                label: "削除",
                Icon: Trash2,
                textClass: "text-red-600",
                iconClass: "text-red-500",
                handler: onDelete,
              },
            ].map((action) => (
              // アクションメニューアイテム
              // 詳細・編集・削除を繰り返し処理で表示
              <li key={action.key}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(null);
                    action.handler();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${action.textClass} hover:bg-gray-50 cursor-pointer flex items-center gap-2`}
                >
                  <action.Icon className={`w-4 h-4 ${action.iconClass}`} />
                  <span>{action.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
