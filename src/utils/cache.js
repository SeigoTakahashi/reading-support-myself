/**
 * キャッシュ管理ユーティリティ
 * localStorage を使用して、ユーザーごとのデータをキャッシュします
 */

// キャッシュの有効期限(24時間)
export const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

/**
 * ユーザーIDとキー名からキャッシュキーを生成
 * @param {string} userId - ユーザーID
 * @param {string} keyName - キーの名前
 * @returns {string} キャッシュキー
 */
export const generateCacheKey = (userId, keyName) => {
  return `cache_${userId}_${keyName}`;
};

/**
 * ユーザーIDのタイムスタンプキーを生成
 * @param {string} userId - ユーザーID
 * @returns {string} タイムスタンプキー
 */
const getTimestampKey = (userId) => {
  return `cache_timestamp_${userId}`;
};

/**
 * 値をキャッシュに保存
 * @param {string} userId - ユーザーID
 * @param {string} keyName - キーの名前
 * @param {*} value - 保存する値（JSON化可能なオブジェクト）
 */
export const setCacheValue = (userId, keyName, value) => {
  try {
    const cacheKey = generateCacheKey(userId, keyName);
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(cacheKey, serializedValue);
    localStorage.setItem(getTimestampKey(userId), Date.now().toString());
  } catch (err) {
    console.warn("Cache write error:", err);
  }
};

/**
 * キャッシュから値を取得
 * @param {string} userId - ユーザーID
 * @param {string} keyName - キーの名前
 * @param {boolean} parseJson - JSON パースするかどうか（デフォルト: true）
 * @returns {*} キャッシュされた値、またはnull
 */
export const getCacheValue = (userId, keyName, parseJson = true) => {
  try {
    const cacheKey = generateCacheKey(userId, keyName);
    const cachedValue = localStorage.getItem(cacheKey);
    
    if (!cachedValue) return null;
    
    return parseJson ? JSON.parse(cachedValue) : cachedValue;
  } catch (err) {
    console.warn("Cache read error:", err);
    return null;
  }
};

/**
 * キャッシュが有効かどうかを判定
 * @param {string} userId - ユーザーID
 * @param {number} expiryTime - キャッシュの有効期限（ミリ秒）
 * @returns {boolean} キャッシュが有効ならtrue
 */
export const isCacheValid = (userId, expiryTime = CACHE_EXPIRY) => {
  try {
    const timestampKey = getTimestampKey(userId);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    const now = Date.now();
    
    if (!cachedTimestamp) return false;
    
    return now - parseInt(cachedTimestamp) < expiryTime;
  } catch (err) {
    console.warn("Cache validation error:", err);
    return false;
  }
};

/**
 * ユーザーのすべてのキャッシュをクリア
 * @param {string} userId - ユーザーID
 */
export const clearUserCache = (userId) => {
  try {
    // localStorageのすべてのキーを列挙（Object.keysは使わない）
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`cache_${userId}_`)) {
        keys.push(key);
      }
    }
    // キャッシュを削除
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem(getTimestampKey(userId));
  } catch (err) {
    console.warn("Cache clear error:", err);
  }
};
