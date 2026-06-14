import { useNavigate } from "react-router-dom";
import BaseTemplate from "../components/BaseTemplate";

// 404 ページ
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <BaseTemplate>
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-8 text-center">
            <div className="text-6xl font-extrabold text-amber-500">404</div>
            <h1 className="mt-4 text-2xl font-bold">ページが見つかりません</h1>
            <p className="mt-2 text-gray-600">すみません、探しているページは見つかりませんでした。</p>

            <div className="mt-6 flex items-center justify-center gap-3">

              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
              >
                ホームへ戻る
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              リンクが古いか、URLが間違っている可能性があります。
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
};

