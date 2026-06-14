import { Navigate } from "react-router-dom";
import { AuthContextConsumer } from "../../AuthContext";
import FullScreenLoading from "./FullScreenLoading";

// 子要素を認証状態に応じて表示またはリダイレクトする
export default function ProtectedRoute({ children }) {
  // 現在のユーザー情報を取得
  const { loginUser } = AuthContextConsumer();

  // loginUser が undefined の間は認証状態をまだ読み込んでいるとみなす
  // AuthContext の useEffect では初期値を undefined にしているため。
  if (loginUser === undefined) {
    return <FullScreenLoading />;
  }

  // 未ログインの場合は /login にリダイレクト
  if (!loginUser) {
    return <Navigate to="/login" replace />;
  }

  // 認証済み
  return children;
};
