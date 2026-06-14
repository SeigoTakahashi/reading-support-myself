import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { navigateWithToast } from '../../src/utils/navigation';

/**
 * テスト設計思想：安定性重視
 * - React Router の navigate 関数をモック化
 * - 関数呼び出しの引数や戻り値の構造を確認
 * - エッジケース（null, 空文字列）をテスト
 */

describe('navigation.js', () => {
  let mockNavigate;

  beforeEach(() => {
    // navigate 関数をモック化
    mockNavigate = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // navigateWithToast
  // ============================================================
  describe('navigateWithToast', () => {
    it('関数が存在する', () => {
      expect(typeof navigateWithToast).toBe('function');
    });

    it('navigate が path を第1引数で呼び出す', () => {
      const testPath = '/my-library';
      navigateWithToast(mockNavigate, testPath, 'Success');

      expect(mockNavigate).toHaveBeenCalledOnce();
      expect(mockNavigate.mock.calls[0][0]).toBe(testPath);
    });

    it('navigate の第2引数に state オブジェクトを渡す', () => {
      const testPath = '/dashboard';
      const testMessage = 'Book added';

      navigateWithToast(mockNavigate, testPath, testMessage);

      expect(mockNavigate).toHaveBeenCalledOnce();
      const callArgs = mockNavigate.mock.calls[0];
      expect(callArgs.length).toBe(2);
      expect(typeof callArgs[1]).toBe('object');
      expect('state' in callArgs[1]).toBe(true);
    });

    it('state に toastMessage が含まれる', () => {
      const testMessage = 'Test message';
      navigateWithToast(mockNavigate, '/page', testMessage);

      const stateArg = mockNavigate.mock.calls[0][1];
      expect(stateArg.state.toastMessage).toBe(testMessage);
    });

    it('state に toastId が含まれる', () => {
      navigateWithToast(mockNavigate, '/page', 'message');

      const stateArg = mockNavigate.mock.calls[0][1];
      expect('toastId' in stateArg.state).toBe(true);
      expect(typeof stateArg.state.toastId).toBe('number');
    });

    it('toastId は数値であり、タイムスタンプとして妥当', () => {
      const beforeCall = Date.now();
      navigateWithToast(mockNavigate, '/page', 'message');
      const afterCall = Date.now();

      const stateArg = mockNavigate.mock.calls[0][1];
      const toastId = stateArg.state.toastId;

      // toastId は Date.now() で生成されるため、呼び出し前後のタイムスタンプ内に収まる
      expect(toastId).toBeGreaterThanOrEqual(beforeCall);
      expect(toastId).toBeLessThanOrEqual(afterCall);
    });

    it('複数回呼び出すと異なる toastId が生成される', () => {
      navigateWithToast(mockNavigate, '/page1', 'message1');
      const toastId1 = mockNavigate.mock.calls[0][1].state.toastId;

      // 少し時間を置く（Date.now() の差を作る）
      vi.useFakeTimers();
      vi.advanceTimersByTime(1);
      vi.useRealTimers();

      navigateWithToast(mockNavigate, '/page2', 'message2');
      const toastId2 = mockNavigate.mock.calls[1][1].state.toastId;

      expect(toastId1).not.toBe(toastId2);
    });

    it('空のメッセージでも動作する', () => {
      navigateWithToast(mockNavigate, '/page', '');

      expect(mockNavigate).toHaveBeenCalledOnce();
      const stateArg = mockNavigate.mock.calls[0][1];
      expect(stateArg.state.toastMessage).toBe('');
    });

    it('長いメッセージも処理できる', () => {
      const longMessage = 'a'.repeat(500);
      navigateWithToast(mockNavigate, '/page', longMessage);

      const stateArg = mockNavigate.mock.calls[0][1];
      expect(stateArg.state.toastMessage).toBe(longMessage);
      expect(stateArg.state.toastMessage.length).toBe(500);
    });

    it('特殊文字を含むメッセージを処理できる', () => {
      const specialMessage = '本が追加されました！ 📚';
      navigateWithToast(mockNavigate, '/page', specialMessage);

      const stateArg = mockNavigate.mock.calls[0][1];
      expect(stateArg.state.toastMessage).toBe(specialMessage);
    });

    it('ネストされたパスに遷移できる', () => {
      const nestedPath = '/books/detail/isbn-123/edit';
      navigateWithToast(mockNavigate, nestedPath, 'Editing book');

      expect(mockNavigate.mock.calls[0][0]).toBe(nestedPath);
    });

    it('クエリパラメータ付きパスに遷移できる', () => {
      const pathWithQuery = '/search?q=fantasy&sort=rating';
      navigateWithToast(mockNavigate, pathWithQuery, 'Search results');

      expect(mockNavigate.mock.calls[0][0]).toBe(pathWithQuery);
    });

    it('navigate が呼び出されたときに undefined を返す', () => {
      const result = navigateWithToast(mockNavigate, '/page', 'message');

      expect(result).toBeUndefined();
    });

    it('navigate が複数回呼び出されても各呼び出しが独立している', () => {
      navigateWithToast(mockNavigate, '/page1', 'msg1');
      navigateWithToast(mockNavigate, '/page2', 'msg2');
      navigateWithToast(mockNavigate, '/page3', 'msg3');

      expect(mockNavigate).toHaveBeenCalledTimes(3);

      // 各呼び出しが正しいパスとメッセージを持つ
      expect(mockNavigate.mock.calls[0][0]).toBe('/page1');
      expect(mockNavigate.mock.calls[0][1].state.toastMessage).toBe('msg1');

      expect(mockNavigate.mock.calls[1][0]).toBe('/page2');
      expect(mockNavigate.mock.calls[1][1].state.toastMessage).toBe('msg2');

      expect(mockNavigate.mock.calls[2][0]).toBe('/page3');
      expect(mockNavigate.mock.calls[2][1].state.toastMessage).toBe('msg3');
    });

    it('state オブジェクトが toastMessage と toastId のみを含む', () => {
      navigateWithToast(mockNavigate, '/page', 'message');

      const stateArg = mockNavigate.mock.calls[0][1];
      const stateKeys = Object.keys(stateArg.state);

      expect(stateKeys).toContain('toastMessage');
      expect(stateKeys).toContain('toastId');
      expect(stateKeys.length).toBe(2);
    });

    it('異なる navigate 関数を使用できる', () => {
      const navigate1 = vi.fn();
      const navigate2 = vi.fn();

      navigateWithToast(navigate1, '/page1', 'msg1');
      navigateWithToast(navigate2, '/page2', 'msg2');

      expect(navigate1).toHaveBeenCalledOnce();
      expect(navigate2).toHaveBeenCalledOnce();

      expect(navigate1.mock.calls[0][0]).toBe('/page1');
      expect(navigate2.mock.calls[0][0]).toBe('/page2');
    });
  });

  // ============================================================
  // 統合テスト
  // ============================================================
  describe('統合テスト', () => {
    it('ページ遷移と同時にトーストが表示される状態を再現', () => {
      // シナリオ：本の追加後、ライブラリページに遷移してトーストを表示
      const navigate = vi.fn();
      const successMessage = '本が正常に追加されました';

      navigateWithToast(navigate, '/my-library', successMessage);

      // navigate が呼ばれた
      expect(navigate).toHaveBeenCalledOnce();

      // 遷移先が /my-library
      expect(navigate.mock.calls[0][0]).toBe('/my-library');

      // state にトーストメッセージが含まれている
      const passedState = navigate.mock.calls[0][1];
      expect(passedState.state.toastMessage).toBe(successMessage);

      // toastId が存在
      expect(typeof passedState.state.toastId).toBe('number');
    });

    it('エラーメッセージも同じ方法で遷移できる', () => {
      const navigate = vi.fn();
      const errorMessage = 'エラーが発生しました。もう一度お試しください';

      navigateWithToast(navigate, '/dashboard', errorMessage);

      expect(navigate).toHaveBeenCalledOnce();
      expect(navigate.mock.calls[0][1].state.toastMessage).toBe(errorMessage);
    });
  });
});
