import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  X,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { AuthContextConsumer } from "../../AuthContext";

export default function SignupPage() {
  // ナビゲーション
  const navigation = useNavigate();

  // AuthContextから関数を取得
  const { signup, googleLogin } = AuthContextConsumer();

  // パスワードの表示/非表示切替
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);

  // フォームデータの状態管理
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // 入力変更時の処理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // フォーム送信時の処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    // ここで新規登録処理を実装
    try {
      setIsLoading(true);
      // パスワードの一致チェック
      if (formData.password !== formData.confirmPassword) {
        setAuthError({
          title: "パスワードが一致しません",
          detail:
            "確認用パスワードが入力と違います。もう一度同じパスワードを入力してください。",
        });
        return;
      }
      await signup(formData.email, formData.password, formData.username);
      navigation("/"); // ログイン成功後にホームへリダイレクト
    } catch (error) {
      console.error(error);
      setAuthError({
        title: "登録できませんでした",
        detail:
          "入力内容に誤りがあるか、同じメールアドレスが既に使われている可能性があります。内容を確認して再度お試しください。",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Googleアカウントでのログイン処理
  const signInwithGoogle = async () => {
    try {
      await googleLogin();
      navigation("/"); // ログイン成功後にホームへリダイレクト
    } catch (error) {
      console.error(error);
      setAuthError({
        title: "Googleで登録できませんでした",
        detail:
          "ブラウザのポップアップがブロックされているか、ネットワークに問題がある可能性があります。設定を確認してください。",
      });
    }
  };

  // 認証エラー状態
  const [authError, setAuthError] = useState(null);

  // エラーメッセージを閉じる
  const dismissError = () => setAuthError(null);

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4 overflow-y-hidden">
        {/* 背景装飾要素 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-br from-purple-300 to-pink-300 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-tr from-blue-300 to-indigo-300 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* メイン新規登録カード */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 border border-white/20 animate-fadeIn">
            {/* スペース */}
            <div className="mb-8"></div>

            {/* 新規登録フォーム */}
            {/* エラーメッセージ */}
            {authError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        {authError.title}
                      </p>
                      <p className="mt-1 text-xs text-red-600 leading-relaxed">
                        {authError.detail}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={dismissError}
                    aria-label="メッセージを閉じる"
                    className="p-1 rounded hover:bg-red-100 text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* ユーザー名入力 */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  ユーザー名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200 hover:bg-white"
                    placeholder="ユーザー名を入力"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* メールアドレス入力 */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200 hover:bg-white"
                    placeholder="your@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* パスワード入力 */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200 hover:bg-white"
                    placeholder="パスワードを入力"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* 確認用パスワード入力 */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  確認用パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50/50 backdrop-blur-sm transition-all duration-200 hover:bg-white"
                    placeholder="確認用パスワードを入力"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* 新規登録ボタン */}
              <button
                className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 transform hover:scale-[1.02]"
                onClick={handleSubmit}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                  </div>
                ) : (
                  "新規登録"
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">または</span>
                </div>
              </div>
            </div>

            {/* ソーシャルログインボタン */}
            <div>
              <button
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                onClick={signInwithGoogle}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </button>
            </div>

            {/* 新規登録リンク */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                すでにアカウントをお持ちの方は{" "}
                <Link
                  to="/login"
                  className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200"
                >
                  ログイン
                </Link>
              </p>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>&copy; 2026 Bookworm. | All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};
