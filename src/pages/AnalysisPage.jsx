import { useEffect, useState } from "react";
import {
  Tag,
  TimerReset,
  BookOpenText,
  BookCheck,
  User,
  TrendingUp,
  Calendar,
} from "lucide-react";
import BaseTemplate from "../components/BaseTemplate";
import Breadcrumb from "../components/Breadcrumb";
import { AuthContextConsumer } from "../../AuthContext";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { useMultipleLoading } from "../hooks/useMultipleLoading";
import { HighlightSkeleton } from "../components/Skeleton";
import {
  computeHighlights,
  computePagesRanking,
  computeReadDurationRanking,
  computeGenreRanking,
  computeAuthorRanking,
  computeMonthlyCompletions,
  computeYearlyCompletions,
} from "../utils/analysis";
import RankingCard from "../components/RankingCard";
import BarChart from "../components/BarChart";

// 統計・分析ページ（ハイライト）
export default function AnalysisPage() {
  const { loginUser } = AuthContextConsumer();
  const { data: libraryRecords, loading: libraryLoading } = useUserLibrary(
    loginUser?.uid,
  );

  const { loading, setAllLoading } = useMultipleLoading([
    "pages_ranking",
    "duration_ranking",
    "genre_ranking",
    "author_ranking",
  ]);
  const [error, setError] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [rankings, setRankings] = useState({
    pages: [],
    duration: [],
    genres: [],
    authors: [],
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);

  useEffect(() => {
    // フックがローディング中なら、スケルトンローダーを表示
    if (libraryLoading) {
      setAllLoading(true);
      return;
    }

    // カスタムフックからのデータが取得完了したら分析を実行
    if (libraryRecords === null) return;

    setAllLoading(false);
    setError(null);

    // 分析ハイライト
    const h = computeHighlights(libraryRecords);
    setHighlights(h);

    // ランキングを計算
    const pagesRanking = computePagesRanking(libraryRecords, 5);
    const durationRanking = computeReadDurationRanking(libraryRecords, 5);
    const genreRanking = computeGenreRanking(libraryRecords, 5);
    const authorRanking = computeAuthorRanking(libraryRecords, 5);
    setRankings({
      pages: pagesRanking,
      duration: durationRanking,
      genres: genreRanking,
      authors: authorRanking,
    });
  }, [libraryLoading, libraryRecords]);

  // 月別グラフのデータのみ更新（他はリロードしない）
  useEffect(() => {
    if (libraryRecords === null) return;

    const monthly = computeMonthlyCompletions(libraryRecords, monthOffset, 6);
    setMonthlyData(monthly);
  }, [libraryRecords, monthOffset]);

  // 年別グラフのデータのみ更新（他はリロードしない）
  useEffect(() => {
    if (libraryRecords === null) return;

    const yearly = computeYearlyCompletions(libraryRecords, yearOffset, 6);
    setYearlyData(yearly);
  }, [libraryRecords, yearOffset]);

  return (
    <BaseTemplate childrenPath={"/analysis"}>
      <Breadcrumb items={["メイン", "統計・分析"]} />

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          統計・分析 📊
        </h1>
        <p className="text-gray-500 text-lg">
          読書の傾向を分析して、次の一冊を見つけよう
        </p>
      </div>

      {(!loginUser || !loginUser.uid) && (
        <div className="text-gray-600">
          ログインするとあなたの読書データを分析できます。
        </div>
      )}

      {loginUser && (
        <div>
          {error && (
            <div className="text-red-600">データの取得に失敗しました。</div>
          )}

          {/* 分析ハイライト */}
          {libraryLoading ? (
            <HighlightSkeleton count={3} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5">
              {/* 最も読んだジャンル */}
              <div className="group relative bg-white rounded-2xl p-6 border border-blue-100/50 shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-100 to-pink-100 rounded-full -mr-16 -mt-16 opacity-50 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Tag
                      className="w-12 h-12 p-3 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg text-white"
                      strokeWidth={2.5}
                    />
                    <span className="text-xs text-pink-600 font-bold px-3 py-1 bg-pink-50 rounded-full">
                      {highlights?.mostReadGenre?.count || 0}冊
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    最も読んだジャンル
                  </div>
                  <div className="mt-2 text-xl font-semibold">
                    {highlights?.mostReadGenre?.genre || "未設定"}
                  </div>
                </div>
              </div>

              {/* 合計ページ */}
              <div className="group relative bg-white rounded-2xl p-6 border border-amber-100/50 shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-100 to-lime-100 rounded-full -mr-16 -mt-16 opacity-50 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpenText
                      className="w-12 h-12 p-3 bg-linear-to-br from-green-500 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg text-white"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div className="text-sm text-gray-500">総読了ページ</div>
                  <div className="mt-2 text-xl font-semibold">
                    {highlights?.totalPages || 0} ページ
                  </div>
                </div>
              </div>

              {/* 読書状況 / 完了率 */}
              <div className="group relative bg-linear-to-br from-blue-500 to-sky-500 rounded-2xl p-6 shadow-lg border border-emerald-400/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100 to-sky-100 rounded-full -mr-16 -mt-16 opacity-20 z-0"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <BookCheck
                      className="w-12 h-12 p-3 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg text-white"
                      strokeWidth={2.5}
                    />
                    <span className="text-xs text-white font-bold px-3 py-1 bg-white/20 rounded-full">
                      {highlights?.completionRate || 0}%
                    </span>
                  </div>
                  <div className="text-sm text-white/90">読書状況</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    読了 {highlights?.statusCounts?.["読了"] || 0} /{" "}
                    {highlights?.totalItems || 0} 冊
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ランキング */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <RankingCard
                title="ページ数ランキング"
                icon={BookOpenText}
                items={rankings.pages}
                fromColor="#10B981"
                toColor="#84CC16"
                bubbleFrom="#D1FAE5"
                bubbleTo="#ECFCCB"
                renderItem={(it) => <>{it.title}</>}
                emptyText="該当データなし"
                loading={loading.pages_ranking}
              />

              <RankingCard
                title="読了期間ランキング"
                icon={TimerReset}
                items={rankings.duration}
                fromColor="#F59E0B"
                toColor="#F97316"
                bubbleFrom="#FFFBEB"
                bubbleTo="#FFF7ED"
                renderItem={(it) => <>{it.title}</>}
                emptyText="該当データなし"
                loading={loading.duration_ranking}
              />

              <RankingCard
                title="ジャンルランキング"
                icon={Tag}
                items={rankings.genres}
                renderItem={(it) => <>{it.genre}</>}
                emptyText="該当データなし"
                loading={loading.genre_ranking}
              />

              <RankingCard
                title="作者ランキング"
                icon={User}
                items={rankings.authors}
                fromColor="#EC4899"
                toColor="#EF4444"
                bubbleFrom="#FFF1F2"
                bubbleTo="#FFEEF0"
                renderItem={(it) => <>{it.author}</>}
                emptyText="該当データなし"
                loading={loading.author_ranking}
              />
            </div>
          </div>

          {/* グラフ */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <BarChart
                title="月間読了数"
                icon={Calendar}
                data={monthlyData}
                onPrev={() => setMonthOffset((prev) => prev + 1)}
                onNext={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
                hasPrev={true}
                hasNext={monthOffset > 0}
                loading={libraryLoading}
                fromColor="#10b981"
                toColor="#14b8a6"
              />

              <BarChart
                title="年間読了数"
                icon={TrendingUp}
                data={yearlyData}
                onPrev={() => setYearOffset((prev) => prev + 1)}
                onNext={() => setYearOffset((prev) => Math.max(0, prev - 1))}
                hasPrev={true}
                hasNext={yearOffset > 0}
                loading={libraryLoading}
                fromColor="#10b981"
                toColor="#14b8a6"
              />
            </div>
          </div>
        </div>
      )}
    </BaseTemplate>
  );
}
