import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthContextProvider, AuthContextConsumer } from "../../AuthContext";

/**
 * Firebase モジュールのモック化
 * 本番の Firebase には接続せず、AuthContext が内部で呼び出す関数だけを模倣する。
 */
vi.mock("../../firebase", () => {
  return {
    auth: {
      // AuthContext の初期化時に呼ばれる onAuthStateChanged をモック
      onAuthStateChanged: (cb) => {
        cb(null); // 最初は「ログインしていない状態」としてコールバックを実行
        return () => {}; // 解除関数（unsubscribe）を返す
      },
    },
    provider: {}, // Google 認証などで使われる provider のモック
  };
});

/**
 * firebase/auth の関数をモック化
 * 各関数が Promise を返すようにし、実際の通信は行わない。
 */
/* eslint-disable no-unused-vars */
vi.mock("firebase/auth", async () => {
  return {
    // Google ログイン
    signInWithPopup: vi.fn(async (_auth, _provider) => ({
      user: { uid: "google-uid", displayName: "Google User" },
    })),

    // メール・パスワードでのログイン
    signInWithEmailAndPassword: vi.fn(async (_auth, email, _password) => ({
      user: { uid: "email-uid", email },
    })),

    // 新規登録（サインアップ）
    createUserWithEmailAndPassword: vi.fn(async (_auth, email, _password) => ({
      user: { uid: "new-uid", email },
    })),

    // ログアウト
    signOut: vi.fn(async (_auth) => true),

    // プロフィール更新
    updateProfile: vi.fn(async (user, data) => ({ ...user, ...data })),
  };
});
/* eslint-enable no-unused-vars */

import * as firebaseAuth from "firebase/auth";

/**
 * AuthContext の単体テスト群
 * - 各関数が Firebase の適切なメソッドを呼び出すか
 * - 状態 (loginUser) が正しく更新されるか
 * を検証する。
 */
describe("AuthContext", () => {
  beforeEach(() => {
    // 各テスト実行前にモックをリセット
    vi.clearAllMocks();
  });

  /**
   * ログイン機能のテスト
   * signInWithEmailAndPassword が正しく呼ばれ、
   * loginUser が設定されることを確認。
   */
  it("login should call signInWithEmailAndPassword and set loginUser", async () => {
    const wrapper = ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );
    const { result } = renderHook(() => AuthContextConsumer(), { wrapper });

    // act() で状態変更を含む処理を実行
    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    // Firebase 関数の呼び出し確認
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      "test@example.com",
      "password123"
    );

    // loginUser の値を検証
    expect(result.current.loginUser).toBeDefined();
    expect(result.current.loginUser.email).toBe("test@example.com");
  });

  /**
   * サインアップ（新規登録）機能のテスト
   * createUserWithEmailAndPassword と updateProfile の呼び出し、
   * loginUser の更新を確認。
   */
  it("signup should call createUserWithEmailAndPassword, updateProfile and set loginUser", async () => {
    const wrapper = ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );
    const { result } = renderHook(() => AuthContextConsumer(), { wrapper });

    await act(async () => {
      await result.current.signup("new@example.com", "pass", "NewUser");
    });

    // Firebase 関数の呼び出し確認
    expect(firebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      "new@example.com",
      "pass"
    );
    expect(firebaseAuth.updateProfile).toHaveBeenCalled();

    // loginUser の内容確認
    expect(result.current.loginUser).toBeDefined();
    expect(result.current.loginUser.email).toBe("new@example.com");
  });

  /**
   * Google ログイン機能のテスト
   * signInWithPopup が呼ばれ、loginUser が更新されることを確認。
   */
  it("googleLogin should call signInWithPopup and set loginUser", async () => {
    const wrapper = ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );
    const { result } = renderHook(() => AuthContextConsumer(), { wrapper });

    await act(async () => {
      await result.current.googleLogin();
    });

    expect(firebaseAuth.signInWithPopup).toHaveBeenCalled();
    expect(result.current.loginUser).toBeDefined();
    expect(result.current.loginUser.uid).toBe("google-uid");
  });

  /**
   * ログアウト機能のテスト
   * signOut が呼ばれ、loginUser が null に戻ることを確認。
   */
  it("logout should call signOut and clear loginUser", async () => {
    const wrapper = ({ children }) => (
      <AuthContextProvider>{children}</AuthContextProvider>
    );
    const { result } = renderHook(() => AuthContextConsumer(), { wrapper });

    // まずログイン状態を作る
    await act(async () => {
      await result.current.login("test@example.com", "password123");
    });

    // その後ログアウト処理
    await act(async () => {
      await result.current.logout();
    });

    expect(firebaseAuth.signOut).toHaveBeenCalled();
    expect(result.current.loginUser).toBeNull();
  });
});
