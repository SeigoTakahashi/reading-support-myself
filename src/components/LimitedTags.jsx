// タグ表示を制限して余りを +N で表示するコンポーネント
export default function LimitedTags({ tags = [], limit = 3, className = "" }) {
  // 表示するタグと余りの数を計算
  const visible = tags.slice(0, limit);

  // 残りのタグ数を計算
  const remaining = tags.length - visible.length;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 表示するタグをレンダリング */}
      {visible.map((tag, i) => (
        <span
          key={i}
          className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium truncate max-w-36"
          title={tag}
        >
          #{tag}
        </span>
      ))}
      {/* 余りのタグ数を +N で表示 */}
      {remaining > 0 && (
        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-500 rounded-md text-xs font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
};
