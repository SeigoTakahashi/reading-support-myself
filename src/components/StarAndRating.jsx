import { Star } from "lucide-react";

// 星評価の表示
// rating: 数値（1〜5の範囲、小数点可）
// ratingに応じて星の色の付け方を変える
export default function StarAndRating({ rating }) {
  if (rating === null || rating === undefined) return <div />;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : star - 0.5 <= rating
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};
