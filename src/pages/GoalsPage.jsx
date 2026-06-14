import { useState, useEffect } from "react";
import { Calendar, Edit3, Save, Trophy, Zap } from "lucide-react";
import BaseTemplate from "../components/BaseTemplate";
import Breadcrumb from "../components/Breadcrumb";
import GoalCard from "../components/GoalCard";
import ProgressBar from "../components/ProgressBar";
import Toast from "../components/Toast";
import { GoalCardSkeleton } from "../components/Skeleton";
import { AuthContextConsumer } from "../../AuthContext";
import { upsertUserGoals } from "../utils/handle-database";
import { useUserGoals } from "../hooks/useUserGoals";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { useMultipleLoading } from "../hooks/useMultipleLoading";
import { computeMonthlyStats, computeYearlyStats } from "../utils/stats";

export default function GoalsPage() {
  const { loginUser } = AuthContextConsumer();

  // カスタムフックからデータを取得
  const userLibraryResult = useUserLibrary(loginUser?.uid);
  const userGoalsResult = useUserGoals(loginUser?.uid);

  // 目標の編集モード状態（統一管理）
  const [editingState, setEditingState] = useState({
    monthly: false,
    yearly: false,
  });

  // 編集状態のトグル関数
  const toggleEditing = (type) => {
    setEditingState((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // 目標データ
  const [monthlyGoal, setMonthlyGoal] = useState(null);
  const [yearlyGoal, setYearlyGoal] = useState(null);

  // ローディング状態（カード別に細かく管理）
  const { loading, setAllLoading } = useMultipleLoading(["monthly", "yearly"]);

  // トーストメッセージ表示状態
  const [toastMessage, setToastMessage] = useState(null);
  const [toastId, setToastId] = useState(0);

  // ユーザーライブラリ（read from DB）
  const userRecords = userLibraryResult.data || [];

  // カスタムフックのローディング状態を総合ローディング状態に反映
  useEffect(() => {
    setAllLoading(userLibraryResult.loading);
  }, [userLibraryResult.loading]);

  // 目標データを取得してローカルステートに反映
  useEffect(() => {
    if (!userGoalsResult.loading && userGoalsResult.data) {
      setMonthlyGoal(userGoalsResult.data.monthly ?? null);
      setYearlyGoal(userGoalsResult.data.yearly ?? null);
    }
  }, [userGoalsResult.loading, userGoalsResult.data]);

  // 共通の目標保存処理（type: 'monthly' | 'yearly'）
  const handleSaveGoal = async (type) => {
    if (!loginUser || !loginUser.uid) return;

    try {
      const messages = {
        monthly: "月間目標を設定しました",
        yearly: "年間目標を設定しました",
      };

      const payload =
        type === "monthly" ? { monthly: monthlyGoal } : { yearly: yearlyGoal };
      await upsertUserGoals(loginUser.uid, payload);

      setToastMessage(messages[type]);
      toggleEditing(type);
      setToastId(Date.now());
    } catch (e) {
      console.warn(`Failed to save ${type} goal:`, e);
    }
  };

  // 統計値は utils で計算（records を渡して内部で進捗を集計する）
  // 月間・年間の統計情報を取得
  const monthlyStats = computeMonthlyStats(userRecords, monthlyGoal);
  const yearlyStats = computeYearlyStats(userRecords, yearlyGoal);

  return (
    <>
      {toastMessage && <Toast message={toastMessage} toastId={toastId} />}
      <BaseTemplate childrenPath={"/goals"}>
        <div className="overflow-x-hidden">
          {/* パンくずリスト */}
          <Breadcrumb items={["メイン", "読書目標"]} />

          {/* ヘッダーセクション */}
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  読書目標 🎯
                </h1>
                <p className="text-gray-500 text-lg">
                  目標を設定して、読書習慣を継続しよう
                </p>
              </div>
            </div>
          </div>

          {/* 目標設定グリッド */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 月間目標 */}
            <GoalCard
              title="月間読了目標"
              icon={Calendar}
              color="border-blue-100/50"
              gradient="to-blue-50/30"
            >
              {loading.monthly ? (
                <GoalCardSkeleton count={1} />
              ) : (
                // 月間目標コンテンツ
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-transparent rounded-xl border border-blue-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">目標冊数</p>
                      {/* 月間目標編集モード */}
                      {editingState.monthly ? (
                        <input
                          type="number"
                          value={monthlyGoal ?? ""}
                          onChange={(e) =>
                            setMonthlyGoal(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                          className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 w-20 outline-none"
                        />
                      ) : (
                        // 月間目標表示
                        <p className="text-3xl font-bold text-gray-900">
                          {/* 未設定の場合 */}
                          {monthlyGoal === null ? (
                            <span className="text-base text-gray-500">
                              未設定
                            </span>
                          ) : (
                            // 目標冊数表示
                            <>
                              {monthlyGoal}
                              <span className="text-xl text-gray-500 ml-1">
                                冊/月
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    {/* 月間目標編集ボタン */}
                    <button
                      onClick={() => {
                        if (editingState.monthly) {
                          handleSaveGoal("monthly");
                        } else {
                          toggleEditing("monthly");
                        }
                      }}
                      className={`p-3 rounded-xl transition-all ${
                        editingState.monthly
                          ? "bg-blue-500 text-white"
                          : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                    >
                      {editingState.monthly ? (
                        <Save className="w-5 h-5" />
                      ) : (
                        <Edit3 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <ProgressBar
                    current={monthlyStats?.progress ?? 0}
                    target={monthlyGoal ?? 0}
                    color="bg-gradient-to-r from-blue-500 to-blue-700"
                  />

                  {/* 月間統計情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600">残り日数</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {monthlyStats.remainingDaysText === "-" ? (
                          <span className="text-base text-gray-500">-</span>
                        ) : (
                          <>{monthlyStats.remainingDaysText}</>
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-gray-600">
                          必要ペース
                        </span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {monthlyStats.neededPaceText === "-" ? (
                          <span className="text-base text-gray-500">-</span>
                        ) : (
                          <>{monthlyStats.neededPaceText}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </GoalCard>

            {/* 年間目標 */}
            <GoalCard
              title="年間読了目標"
              icon={Trophy}
              color="border-purple-100/50"
              gradient="to-purple-50/30"
            >
              {loading.yearly ? (
                <GoalCardSkeleton count={1} />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-purple-50 to-transparent rounded-xl border border-purple-100">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">目標冊数</p>
                      {editingState.yearly ? (
                        <input
                          type="number"
                          value={yearlyGoal ?? ""}
                          onChange={(e) =>
                            setYearlyGoal(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                          className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-500 w-24 outline-none"
                        />
                      ) : (
                        <p className="text-3xl font-bold text-gray-900">
                          {yearlyGoal === null ? (
                            <span className="text-base text-gray-500">
                              未設定
                            </span>
                          ) : (
                            <>
                              {yearlyGoal}
                              <span className="text-xl text-gray-500 ml-1">
                                冊/年
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    {/* 年間目標編集ボタン */}
                    <button
                      onClick={() => {
                        if (editingState.yearly) {
                          handleSaveGoal("yearly");
                        } else {
                          toggleEditing("yearly");
                        }
                      }}
                      className={`p-3 rounded-xl transition-all ${
                        editingState.yearly
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                      }`}
                    >
                      {editingState.yearly ? (
                        <Save className="w-5 h-5" />
                      ) : (
                        <Edit3 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <ProgressBar
                    current={yearlyStats?.progress ?? 0}
                    target={yearlyGoal ?? 0}
                    color="bg-gradient-to-r from-purple-500 to-pink-500"
                  />

                  {/* 年間統計情報 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600">残り日数</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {yearlyStats.remainingDaysText === "-" ? (
                          <span className="text-base text-gray-500">-</span>
                        ) : (
                          <>{yearlyStats.remainingDaysText}</>
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-linear-to-br from-amber-50 to-orange-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-gray-600">
                          必要ペース
                        </span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-900">
                        {yearlyStats.neededPaceText === "-" ? (
                          <span className="text-base text-gray-500">-</span>
                        ) : (
                          <>{yearlyStats.neededPaceText}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </GoalCard>
          </div>
        </div>
      </BaseTemplate>
    </>
  );
}
