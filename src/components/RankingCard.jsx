import React from "react";

// 共通ランキングカード
// props:
// - title: カードのタイトル
// - icon: React コンポーネント（lucide icon など）
// - items: 配列のアイテム
// - renderItem: (item, idx) => JSX
// - emptyText: 表示する空状態テキスト
// - fromColor/toColor: メインアイコンのグラデーション色（16進数）
// - bubbleFrom/bubbleTo: 右上の円のグラデーション色（16進数）
export default function RankingCard({
  title,
  icon: Icon,
  items = [],
  renderItem,
  emptyText = "データがありません",
  fromColor = "#6366F1",
  toColor = "#8B5CF6",
  bubbleFrom = "#EEF2FF",
  bubbleTo = "#F3E8FF",
  loading = false,
}) {

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100/60 shadow-lg transition-shadow duration-300 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-40 z-0"
        style={{
          background: `linear-gradient(135deg, ${bubbleFrom}, ${bubbleTo})`,
        }}
      />
      <div className="relative z-10">
        {loading ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="h-6 w-32 bg-gray-200 rounded-md"></div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gray-200 rounded"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gray-200 rounded"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-4 bg-gray-200 rounded"></div>
                  <div className="w-40 h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="w-12 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              {Icon ? (
                <div
                  style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
                  className="w-12 h-12 p-3 rounded-2xl flex items-center justify-center shadow-lg text-white"
                >
                  <Icon className="w-6 h-6" strokeWidth={2.2} />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-2xl" />
              )}
              <div className="text-base text-gray-700 font-semibold">{title}</div>
            </div>

            <div className="mt-3 space-y-2">
          {(!items || items.length === 0) ? (
            <div className="text-gray-400">{emptyText}</div>
          ) : (
            items.map((it, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-sm ${isFirst ? 'text-yellow-600 font-bold' : 'text-gray-500 font-semibold'}`}>#{idx + 1}</div>
                    <div className={`${isFirst ? 'text-lg font-bold text-gray-900' : 'text-sm text-gray-700'} truncate`} style={{ maxWidth: '240px' }}>
                      {renderItem ? renderItem(it, idx) : (it.title || it.genre || it.author || "無題")}
                    </div>
                  </div>
                  <div className={`${isFirst ? 'text-gray-900 font-semibold' : 'text-sm text-gray-500'}`}>
                    {it.pages ? `${it.pages}p` : it.count ? `${it.count}冊` : it.days !== undefined ? `${it.days}日` : ""}
                  </div>
                </div>
              );
            })
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
