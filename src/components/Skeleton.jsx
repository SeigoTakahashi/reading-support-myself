/**
 * スケルトンローダーコンポーネント
 * 複数ページで繰り返されるローディング表示を統一
 */

/**
 * カード型スケルトンローダー
 * @param {number} count - 表示する数（デフォルト: 1）
 * @param {string} variant - スタイルバリアント（'default' | 'goal' | 'challenge'）
 */
export const CardSkeleton = ({ count = 1, variant = "default" }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "goal":
        return "bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200";
      case "challenge":
        return "bg-gray-50 border border-gray-100";
      default:
        return "bg-gray-100 border border-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`p-4 rounded-xl animate-pulse ${getVariantClasses()}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0"></div>
            <div className="flex-1">
              <div className="w-2/3 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/3 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ハイライトカード用スケルトン
 * @param {number} count - 表示する数（デフォルト: 3）
 */
export const HighlightSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded-md mb-3"></div>
          <div className="h-8 w-32 bg-gray-200 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * グラフ・チャート用スケルトン
 */
export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-6 bg-gray-200 rounded-md"></div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <div className="h-64 bg-gray-100 rounded-xl"></div>
    </div>
  );
};

/**
 * ゴールカード用スケルトン
 */
export const GoalCardSkeleton = ({ count = 1 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-linear-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 animate-pulse"
        >
          <div className="flex-1">
            <div className="w-2/3 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-full shrink-0 ml-4"></div>
        </div>
      ))}
    </div>
  );
};

/**
 * インラインスケルトン（テーブル・リスト用）
 */
export const InlineSkeleton = ({ count = 5, height = "h-4" }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} w-full bg-gray-200 rounded animate-pulse`}
        ></div>
      ))}
    </div>
  );
};

/**
 * 統計カード用スケルトン（ダッシュボードなどの小さいカード）
 */
export const StatCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-6 border shadow-lg border-gray-100 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
            <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-12 w-16 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
        </div>
      ))}
    </div>
  );
};
