// 目標カードコンポーネント
export default function GoalCard({ title, icon, color, gradient, children }) {
  const IconComp = icon;

  // グラデーションとカラーの設定
  const gradientClass = gradient.includes("blue")
    ? "from-blue-50/30"
    : gradient.includes("purple")
    ? "from-purple-50/30"
    : gradient.includes("amber")
    ? "from-amber-50/30"
    : gradient.includes("pink")
    ? "from-pink-50/30"
    : "from-emerald-50/30";

  // アイコンのグラデーション設定
  const iconGradient = gradient.includes("blue")
    ? "from-blue-500 to-cyan-500"
    : gradient.includes("purple")
    ? "from-purple-500 to-pink-500"
    : gradient.includes("amber")
    ? "from-amber-500 to-orange-500"
    : gradient.includes("pink")
    ? "from-pink-500 to-rose-500"
    : "from-emerald-500 to-teal-500";

  return (
    <div
      className={`bg-white rounded-2xl border ${color} shadow-lg overflow-hidden`}
    >
      <div
        className={`p-6 border-b border-gray-100 bg-linear-to-r from-white ${gradientClass}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 bg-linear-to-br ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}
          >
            {/* 渡されたアイコンコンポーネントをレンダリング */}
            <IconComp className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
