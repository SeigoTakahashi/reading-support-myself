import { expect } from "vitest";
// @testing-library/jest-dom v6は、バンドラーやインターロップによって
// マッチャーをデフォルトエクスポートまたは名前付きエクスポートとして提供する。
// どちらの形にも対応できるように正規化する。
import matchersModule from "@testing-library/jest-dom/matchers";

// matchersがdefaultプロパティを持っていればそれを使い、なければそのまま使う
const matchers = matchersModule && matchersModule.default ? matchersModule.default : matchersModule;

// ガード: matchersがオブジェクトでなければTypeErrorを避けるため拡張をスキップする
if (matchers && typeof matchers === "object") {
    expect.extend(matchers);
}
