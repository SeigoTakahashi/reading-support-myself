// Ginサーバーに画像をアップロードし、URLを取得するユーティリティ関数
export const fetchImageUrl = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  // 自分のGinサーバーに送信
  const res = await fetch(`${import.meta.env.VITE_GIN_API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.url; // Ginから返ってきたURL
};