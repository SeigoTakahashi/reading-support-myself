import { useEffect, useState } from "react";
import { BookOpen, BookMarked, Target } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";
import BaseTemplate from "../components/BaseTemplate";
import { StatCardSkeleton } from "../components/Skeleton";
import { AuthContextConsumer } from "../../AuthContext";
import { computeMonthlyStats } from "../utils/stats";
import { useUserGoals } from "../hooks/useUserGoals";
import { useUserLibrary } from "../hooks/useUserLibrary";

export default function DashboardPage() {
  const { loginUser } = AuthContextConsumer();

  const { data: libraryRecords, loading: loadingLibrary } = useUserLibrary(
    loginUser?.uid,
  );

  const { data: goals } = useUserGoals(loginUser?.uid);

  const [stats, setStats] = useState({
    monthly: null,
  });

  // 統計計算
  useEffect(() => {
    if (!libraryRecords) return;

    try {
      const monthlyStats = computeMonthlyStats(
        libraryRecords,
        goals?.monthly ?? null,
        new Date(),
      );

      setStats({
        monthly: monthlyStats,
      });
    } catch (e) {
      console.warn("Failed to calculate dashboard stats:", e);
    }
  }, [libraryRecords, goals]);

  const readingCount = libraryRecords
    ? libraryRecords.filter((r) => r.status === "読書中").length
    : null;

  return (
    <BaseTemplate childrenPath={"/"}>
      <div className="overflow-x-hidden">
        <Breadcrumb items={["メイン", "ダッシュボード"]} />

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                おかえりなさい、読書家さん！
              </h1>
              <p className="text-gray-500 text-lg">
                今日も素敵な読書の旅を続けましょう 📖✨
              </p>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        {loadingLibrary ? (
          <StatCardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            {/* 今月の読了冊数 */}
            <div className="group relative bg-white rounded-2xl p-6 border border-blue-100/50 shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              {loadingLibrary ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-12 w-15 bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen
                        className="w-6 h-6 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs text-blue-600 font-bold px-3 py-1 bg-blue-50 rounded-full">
                      今月
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.monthly?.progress ?? 0}
                    <span className="text-2xl text-gray-400 ml-1">冊</span>
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    読了した本
                  </p>
                </div>
              )}
            </div>

            {/* 読書中の本の冊数 */}
            <div className="group relative bg-white rounded-2xl p-6 border border-amber-100/50 shadow-lg transition-shadow duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100 to-orange-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              {loadingLibrary ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                    <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="h-12 w-15 bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded-md"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookMarked
                        className="w-6 h-6 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs text-amber-600 font-bold px-3 py-1 bg-amber-50 rounded-full">
                      進行中
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    {readingCount ?? 0}
                    <span className="text-2xl text-gray-400 ml-1">冊</span>
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    読書中の本
                  </p>
                </div>
              )}
            </div>

            {/* 読書目標の進捗 */}
            <div className="group relative bg-linear-to-br from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg border border-emerald-400/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              {loadingLibrary ? (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl"></div>
                    <div className="h-5 w-12 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="h-9 w-20 bg-white/20 rounded-md mb-2 animate-pulse" />
                  <div className="h-4 w-24 bg-white/20 rounded-md animate-pulse" />
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Target
                        className="w-6 h-6 text-white"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs text-white font-bold px-3 py-1 bg-white/20 rounded-full">
                      達成率
                    </span>
                  </div>
                  <p className="text-4xl font-bold text-white mb-2">
                    {stats.monthly?.achievementRateText ?? "-"}
                  </p>
                  <p className="text-sm text-white/90 font-medium">
                    {goals?.monthly == null
                      ? "目標未設定"
                      : Math.max(
                            goals.monthly - (stats.monthly?.progress ?? 0),
                            0,
                          ) <= 0
                        ? "目標達成！"
                        : `月間目標まであと${Math.max(
                            goals.monthly - (stats.monthly?.progress ?? 0),
                            0,
                          )}冊！`}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseTemplate>
  );
}
