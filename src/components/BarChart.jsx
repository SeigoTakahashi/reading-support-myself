import { ChevronLeft, ChevronRight } from "lucide-react";

// 共通棒グラフコンポーネント
// props:
// - title: グラフタイトル
// - icon: lucide icon コンポーネント
// - data: [{ label, count }, ...] 配列
// - onNext: 次ボタンコールバック
// - onPrev: 前ボタンコールバック
// - hasPrev / hasNext: ボタン表示制御
// - loading: ローディング状態
// - fromColor / toColor: アイコンのグラデーション色
export default function BarChart({
  title,
  icon: Icon,
  data = [],
  onNext,
  onPrev,
  hasPrev = false,
  hasNext = false,
  loading = false,
  fromColor = "#10b981",
  toColor = "#14b8a6",
}) {
  // データから最大値を算出（y軸スケール決定用）
  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);
  const scale = Math.ceil(maxCount / 5) * 5; // 5の倍数でスケール設定

  // グラフのサイズ（カード全幅対応）
  const chartWidth = 380;
  const chartHeight = 220;
  const padding = 40;
  const barSpacing = (chartWidth - padding * 2) / (data.length || 1);
  const barWidth = Math.max(barSpacing * 0.7, 20);

  // スケルトンローダー
  if (loading) {
    return (
      <div className="group relative bg-white rounded-2xl p-6 border border-gray-100/60 shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-50 to-blue-50 rounded-full -mr-16 -mt-16 opacity-40 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
              <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-100 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-2xl p-6 border border-gray-100/60 shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-50 to-blue-50 rounded-full -mr-16 -mt-16 opacity-40 z-0"></div>
      <div className="relative z-10">
        {/* ヘッダー（アイコン + タイトル + 前次ボタン） */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
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
            <h3 className="text-base font-semibold text-gray-700">{title}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className={`p-2 rounded-lg transition ${
                hasPrev
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`p-2 rounded-lg transition ${
                hasNext
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* グラフ */}
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            データがありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="mx-auto"
            >
              {/* Y軸 */}
              <line
                x1={padding}
                y1={padding}
                x2={padding}
                y2={chartHeight - padding}
                stroke="#e5e7eb"
                strokeWidth={2}
              />
              {/* X軸 */}
              <line
                x1={padding}
                y1={chartHeight - padding}
                x2={chartWidth - padding}
                y2={chartHeight - padding}
                stroke="#e5e7eb"
                strokeWidth={2}
              />

              {/* Y軸目盛り表示 */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const y = chartHeight - padding - (i * (chartHeight - padding * 2)) / 5;
                const val = (i * scale) / 5;
                return (
                  <g key={`y-${i}`}>
                    <line
                      x1={padding - 5}
                      y1={y}
                      x2={padding}
                      y2={y}
                      stroke="#d1d5db"
                      strokeWidth={1}
                    />
                    <text
                      x={padding - 12}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={12}
                      fill="#9ca3af"
                    >
                      {Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* バー */}
              {data.map((d, idx) => {
                const barHeight = (d.count / scale) * (chartHeight - padding * 2);
                const x = padding + idx * barSpacing + (barSpacing - barWidth) / 2;
                const y = chartHeight - padding - barHeight;

                return (
                  <g key={`bar-${idx}`}>
                    {/* バー */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="#10b981"
                      rx={2}
                    />
                    {/* ラベル */}
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight - padding + 20}
                      textAnchor="middle"
                      fontSize={12}
                      fill="#6b7280"
                    >
                      {d.label}
                    </text>
                    {/* 値表示 */}
                    {d.count > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 5}
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight="bold"
                        fill="#1f2937"
                      >
                        {d.count}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
