import {
  Home,
  Book,
  Clock,
  Target,
  Sparkles,
  Users,
  BarChart3,
  Trophy,
} from "lucide-react";

export const NAVIGATION = [
  {
    groupName: "メイン",
    items: [
      { path: "/", label: "ダッシュボード", icon: Home },
      {
        path: "/mylibrary",
        label: "マイライブラリ",
        icon: Book,
        // バッジの値はランタイムで BaseTemplate 側から差し込むのでキーだけ置いておく
        badgeKey: "mylibraryCount",
      },
      { path: "/analysis", label: "統計・分析", icon: BarChart3 },
      { path: "/goals", label: "読書目標", icon: Target },
    ],
  },
];

// NAVIGATION からラベル -> path のマップを作成（パンくずリスト用）
export const LABEL_TO_PATH = NAVIGATION.reduce((map, group) => {
  // 各 item の label -> path を登録
  group.items.forEach((it) => {
    if (it.label && it.path) map[it.label] = it.path;
  });

  // groupName を押したときは、そのグループの最初の item に遷移させたい
  // 例: "メイン" -> "ダッシュボード" の path
  const first = group.items && group.items[0];
  if (group.groupName && first && first.path) {
    map[group.groupName] = first.path;
  }

  return map;
}, {});

// 事前定義されたタグの選択肢
export const PREDEFINED_TAGS = [
  "積読",
  "新作",
  "話題作",
  "名作",
  "再読希望",
  "おすすめ",
  "難解",
  "読みやすい",
  "衝撃的",
  "笑える",
  "感動的",
  "泣ける",
  "癒される",
  "伏線回収",
  "勉強になる",
  "重厚な内容",
  "考えさせられる",
  "テンポが良い",
  "世界観が良い",
  "文章が美しい",
  "キャラが魅力的",
  "どんでん返し",
  "没入感がある",
  "人生観に影響",
];
// ジャンルの選択肢（APIのカテゴリは使いづらいため固定リストから選択）
export const PREDEFINED_GENRES = {
  小説系: [
    "純文学",
    "現代小説",
    "恋愛小説",
    "青春小説",
    "ヒューマンドラマ",
    "ミステリ",
    "サスペンス",
    "ホラー",
    "SF",
    "ファンタジー",
    "歴史小説",
    "時代小説",
    "冒険小説",
    "短編集",
    "ライトノベル",
  ],
  "専門・実用系": [
    "ビジネス",
    "自己啓発",
    "経済・社会",
    "哲学・思想",
    "心理学",
    "教育・学習法",
    "科学・テクノロジー",
    "医療・健康",
    "芸術・デザイン",
    "法律・政治",
  ],
  "教養・ライフスタイル": [
    "エッセイ",
    "ノンフィクション",
    "紀行文",
    "料理・グルメ",
    "暮らし・実用",
  ],
};
