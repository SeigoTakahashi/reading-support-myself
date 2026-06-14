import { createContext, useState, useEffect, useContext } from "react";
import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { ensureUserGoals } from "./src/utils/handle-database";

// Context生成(ログインに関する情報を管理)
const AuthContext = createContext();

// AuthContextProvider (Provider)
export const AuthContextProvider = ({ children }) => {
  // ログインユーザ
  const [loginUser, setLoginUser] = useState();

  // 起動時ログイン処理(既にログインしてる場合, ユーザ設定)
  useEffect(() => {
    // テスト環境向けフック: Playwright から事前に window.__PLAYWRIGHT_TEST_USER を注入
    // これがある場合は Firebase の実ネットワークを使わずにローカルでログイン状態を模倣する
    try {
      if (typeof window !== "undefined" && window.__PLAYWRIGHT_TEST_USER) {
        setLoginUser(window.__PLAYWRIGHT_TEST_USER);
        return;
      }
    } catch {
      // ignore
    }

    // auth 初期化時にログインユーザ設定
    auth.onAuthStateChanged((user) => {
      setLoginUser(user);
      // 初回ログイン時に userGoals と users ドキュメントを確実に作成しておく
      if (user && user.uid) {
        // fire-and-forget だがエラーはコンソールに記録
        ensureUserGoals(user.uid).catch((e) =>
          console.warn("ensureUserGoals failed:", e),
        );
      }
    });
  }, []);

  // パスワードログイン処理
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    setLoginUser(user);
  };

  // Googleログイン処理
  const googleLogin = async () => {
    // Google ログインのポップアップ表示して認証結果取得
    const result = await signInWithPopup(auth, provider);
    // 認証結果より user 設定
    setLoginUser(result.user);
  };

  // サインアップ処理
  const signup = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: username });
    setLoginUser(user);
    // サインアップ直後は明示的に goals とプロフィールを初期化
    try {
      await ensureUserGoals(user.uid);
    } catch (e) {
      console.warn("ensureUserGoals after signup failed:", e);
    }
  };

  // ログアウト処理
  const logout = async () => {
    await signOut(auth);
    setLoginUser(null);
  };

  // ログイン情報設定したProvider
  return (
    <AuthContext.Provider
      value={{
        loginUser,
        login,
        googleLogin,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// AuthContextConsumer (useContext) # Provider で囲った範囲で使う必要あり
export const AuthContextConsumer = () => {
  return useContext(AuthContext);
};
