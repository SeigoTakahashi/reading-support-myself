/**
 * トーストメッセージ付きでページ遷移
 * @param {function} navigate - useNavigate の戻り値
 * @param {string} path - 遷移先パス
 * @param {string} message - 表示するトーストメッセージ
 */
export const navigateWithToast = (navigate, path, message) => {
  navigate(path, {
    state: {
      toastMessage: message,
      toastId: Date.now(),
    },
  });
};
