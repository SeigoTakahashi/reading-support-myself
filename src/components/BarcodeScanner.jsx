import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Scan, FlipHorizontal } from "lucide-react";
import { useZxing } from "react-zxing";
import { isValidIsbn } from "../utils/validation";

export default function BarcodeScanner({ onClose, onScan }) {
  const [error, setError] = useState("");
  const [isMirrored, setIsMirrored] = useState(false); // 画面反転の状態

  // ZXingのフックを使用してバーコードスキャンを実装
  const { ref } = useZxing({
    // バーコードが読み取られたときのコールバック
    onDecodeResult(result) {
      const isbn = result.getText();

      // ISBN チェック
      if (!isValidIsbn(isbn)) {
        setError("正しいISBNではありません");
        return;
      }

      // 成功時の処理
      onScan(isbn);
      onClose();
    },
    // カメラの設定
    constraints: {
      video: {
        facingMode: "environment", // デフォルトは外カメラ
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    // デコード試行の間隔（ミリ秒）
    timeBetweenDecodingAttempts: 300,
  });

  const modal = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-linear-to-r from-amber-50 to-orange-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                バーコードスキャン
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                ISBNバーコードを読み取ります
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* カメラプレビュー */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center">
          <div className="relative w-full rounded-xl overflow-hidden bg-black max-h-[80vh]">
            <video
              ref={ref}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
              style={isMirrored ? { transform: "scaleX(-1)" } : undefined}
            />
            {/* ガイド枠 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-4 border-amber-500 w-3/4 sm:w-2/3 h-32 sm:h-40 rounded-lg"></div>
            </div>

            {/* 下部メッセージ */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <div className="inline-block bg-black/80 text-white px-4 py-2 rounded-lg text-xs sm:text-sm">
                上段のバーコードを枠内に合わせてください
              </div>
            </div>
          </div>

          {/* 反転ボタン */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setIsMirrored((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-md transition-all active:scale-95"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-sm">左右反転</span>
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
