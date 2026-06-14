import {
  setCacheValue,
  getCacheValue,
  isCacheValid,
  clearUserCache,
  CACHE_EXPIRY,
} from '../../src/utils/cache';

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('cache utility (stable tests)', () => {
  const userId = 'user-1';

  // --- localStorage をテストファイル内で完全モック ---
  const createLocalStorageMock = () => {
    let store = {};

    return {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index) => Object.keys(store)[index] ?? null),
      get length() {
        return Object.keys(store).length;
      },
    };
  };

  beforeEach(() => {
    // globalThis に localStorage を差し替え
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      configurable: true,
    });

    vi.restoreAllMocks();
  });

  it('setCacheValue & getCacheValue（オブジェクト）', () => {
    const value = { a: 1 };

    setCacheValue(userId, 'test', value);
    const result = getCacheValue(userId, 'test');

    expect(result).toEqual(value);
  });

  it('string は parseJson=false でそのまま取得できる', () => {
    setCacheValue(userId, 'str', 'hello');

    const result = getCacheValue(userId, 'str', false);

    expect(result).toBe('hello');
  });

  it('キャッシュが存在しない場合は null', () => {
    const result = getCacheValue(userId, 'unknown');

    expect(result).toBeNull();
  });

  it('キャッシュが有効期限内なら true', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    setCacheValue(userId, 'test', {});

    vi.spyOn(Date, 'now').mockReturnValue(1000 + CACHE_EXPIRY - 1);

    expect(isCacheValid(userId)).toBe(true);
  });

  it('キャッシュが期限切れなら false', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    setCacheValue(userId, 'test', {});

    vi.spyOn(Date, 'now').mockReturnValue(1000 + CACHE_EXPIRY + 1);

    expect(isCacheValid(userId)).toBe(false);
  });

  it('clearUserCache は例外を出さずに削除する', () => {
    setCacheValue(userId, 'a', 1);
    setCacheValue(userId, 'b', 2);

    expect(() => clearUserCache(userId)).not.toThrow();
    expect(getCacheValue(userId, 'a')).toBeNull();
  });

  it('localStorage が壊れても throw しない', () => {
    vi.spyOn(globalThis.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('storage error');
    });

    expect(() => setCacheValue(userId, 'test', {})).not.toThrow();
  });
});
