import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

// トーストメッセージコンポーネント
export default function Toast({ message, duration = 5000, toastId }) {
  // トーストの表示・非表示状態
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // マウント時にスライドイン
    setIsVisible(true);

    // 指定時間後にスライドアウト
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, toastId]);

  const toast = (
    <div className="fixed inset-x-0 bottom-8 flex justify-center px-4 pointer-events-none z-50">
      {/* トーストメッセージ本体（画面下部に表示） */}
      <div
        className={`
          bg-gray-900 text-white px-6 py-4 rounded-lg shadow-lg
          flex items-center gap-3 max-w-md w-full
          transition-all duration-500 ease-out pointer-events-auto
          ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }
        `}
      >
        <div className="shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
    </div>
  );

  // コンポーネントの位置によらず body にポータルで出すことで
  // overflow:hidden や z-index による切り抜きを回避する
  if (typeof document !== "undefined") {
    return createPortal(toast, document.body);
  }

  return toast;
}
