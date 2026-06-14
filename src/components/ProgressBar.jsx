// 進捗バーコンポーネント
export default function ProgressBar({ current, target, color }) {
  // 進捗率を計算（分母が0の場合は0%とする）
  const percentage = target === 0 ? 0 : Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      {/* 進捗状況 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">進捗状況</span>
        <span className="font-bold text-gray-900">
          {current}/{target}冊
        </span>
      </div>

      {/* 進捗バー */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* 達成率と残り冊数 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {percentage.toFixed(0)}% 達成
        </span>
        <span className="text-xs font-semibold text-gray-700">
          残り {Math.max(target - current, 0)}冊
        </span>
      </div>
    </div>
  );
}
