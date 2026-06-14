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

// チャレンジキーの定数
export const CHALLENGE_KEYS = {
  DEBUT: "debut",
  GENRE_EXPLORER: "genre_explorer",
  SPEED_READER: "speed_reader",
  REVIEW_MASTER: "review_master",
  SEVEN_DAY_STREAK: "7day_streak",
  THIRTY_DAY_STREAK: "30day_streak",
  AUTHOR_FAN: "author_fan",
  NEW_GENRE_PIONEER: "new_genre_pioneer",
  MONTHLY_CHAMPION: "monthly_champion",
  AVID_READER_50: "avid_reader_50",
  ANNUAL_CHAMPION: "annual_champion",
  BOOKWORM_1000: "bookworm_1000",
};

// チャレンジ目標値
export const CHALLENGE_TOTALS = {
  [CHALLENGE_KEYS.DEBUT]: 1,
  [CHALLENGE_KEYS.GENRE_EXPLORER]: 5,
  [CHALLENGE_KEYS.SPEED_READER]: 3,
  [CHALLENGE_KEYS.REVIEW_MASTER]: 10,
  [CHALLENGE_KEYS.SEVEN_DAY_STREAK]: 7,
  [CHALLENGE_KEYS.THIRTY_DAY_STREAK]: 30,
  [CHALLENGE_KEYS.AUTHOR_FAN]: 5,
  [CHALLENGE_KEYS.NEW_GENRE_PIONEER]: 3,
  [CHALLENGE_KEYS.MONTHLY_CHAMPION]: 10,
  [CHALLENGE_KEYS.AVID_READER_50]: 50,
  [CHALLENGE_KEYS.ANNUAL_CHAMPION]: 100,
  [CHALLENGE_KEYS.BOOKWORM_1000]: 1000,
};

// チャレンジアイコンマップ
export const CHALLENGE_ICON_MAP = {
  [CHALLENGE_KEYS.DEBUT]: "BookOpen",
  [CHALLENGE_KEYS.GENRE_EXPLORER]: "BookOpen",
  [CHALLENGE_KEYS.SPEED_READER]: "Zap",
  [CHALLENGE_KEYS.REVIEW_MASTER]: "Star",
  [CHALLENGE_KEYS.SEVEN_DAY_STREAK]: "Flame",
  [CHALLENGE_KEYS.THIRTY_DAY_STREAK]: "Flame",
  [CHALLENGE_KEYS.AUTHOR_FAN]: "BookOpen",
  [CHALLENGE_KEYS.NEW_GENRE_PIONEER]: "BookOpen",
  [CHALLENGE_KEYS.MONTHLY_CHAMPION]: "Trophy",
  [CHALLENGE_KEYS.AVID_READER_50]: "Star",
  [CHALLENGE_KEYS.ANNUAL_CHAMPION]: "Trophy",
  [CHALLENGE_KEYS.BOOKWORM_1000]: "Star",
};

// チャレンジグラデーションカラーマップ
export const CHALLENGE_GRADIENT_MAP = {
  [CHALLENGE_KEYS.DEBUT]: "from-blue-500 to-cyan-500",
  [CHALLENGE_KEYS.GENRE_EXPLORER]: "from-blue-500 to-cyan-500",
  [CHALLENGE_KEYS.SPEED_READER]: "from-amber-500 to-orange-500",
  [CHALLENGE_KEYS.REVIEW_MASTER]: "from-purple-500 to-pink-500",
  [CHALLENGE_KEYS.SEVEN_DAY_STREAK]: "from-orange-500 to-rose-500",
  [CHALLENGE_KEYS.THIRTY_DAY_STREAK]: "from-amber-500 to-orange-500",
  [CHALLENGE_KEYS.AUTHOR_FAN]: "from-emerald-500 to-teal-400",
  [CHALLENGE_KEYS.NEW_GENRE_PIONEER]: "from-emerald-400 to-green-400",
  [CHALLENGE_KEYS.MONTHLY_CHAMPION]: "from-amber-500 to-yellow-500",
  [CHALLENGE_KEYS.AVID_READER_50]: "from-purple-500 to-pink-500",
  [CHALLENGE_KEYS.ANNUAL_CHAMPION]: "from-purple-600 to-indigo-500",
  [CHALLENGE_KEYS.BOOKWORM_1000]: "from-sky-500 to-blue-500",
};

// チャレンジ絵文字マップ
export const CHALLENGE_EMOJI_MAP = {
  [CHALLENGE_KEYS.DEBUT]: "📚",
  [CHALLENGE_KEYS.GENRE_EXPLORER]: "🌍",
  [CHALLENGE_KEYS.SPEED_READER]: "⚡",
  [CHALLENGE_KEYS.REVIEW_MASTER]: "⭐",
  [CHALLENGE_KEYS.SEVEN_DAY_STREAK]: "🔥",
  [CHALLENGE_KEYS.THIRTY_DAY_STREAK]: "🔥",
  [CHALLENGE_KEYS.AUTHOR_FAN]: "✍️",
  [CHALLENGE_KEYS.NEW_GENRE_PIONEER]: "🚀",
  [CHALLENGE_KEYS.MONTHLY_CHAMPION]: "🏆",
  [CHALLENGE_KEYS.AVID_READER_50]: "⭐",
  [CHALLENGE_KEYS.ANNUAL_CHAMPION]: "🏆",
  [CHALLENGE_KEYS.BOOKWORM_1000]: "🐛",
};

// チャレンジラベルと説明のマップ
export const CHALLENGE_LABELS_MAP = {
  [CHALLENGE_KEYS.DEBUT]: {
    label: "読書デビュー",
    description: "最初の1冊を読了",
  },
  [CHALLENGE_KEYS.GENRE_EXPLORER]: {
    label: "ジャンル探検家",
    description: "5つの異なるジャンルを読破",
  },
  [CHALLENGE_KEYS.SPEED_READER]: {
    label: "スピードリーダー",
    description: "1週間で3冊読了",
  },
  [CHALLENGE_KEYS.REVIEW_MASTER]: {
    label: "レビューマスター",
    description: "10冊にレビューを投稿",
  },
  [CHALLENGE_KEYS.SEVEN_DAY_STREAK]: {
    label: "継続は力なり",
    description: "7日連続で読書",
  },
  [CHALLENGE_KEYS.THIRTY_DAY_STREAK]: {
    label: "ルーティンマスター",
    description: "30日連続で読書",
  },
  [CHALLENGE_KEYS.AUTHOR_FAN]: {
    label: "著者ファン",
    description: "同じ著者の本を5冊読了",
  },
  [CHALLENGE_KEYS.NEW_GENRE_PIONEER]: {
    label: "新境地開拓者",
    description: "初めて読むジャンルで3冊読了",
  },
  [CHALLENGE_KEYS.MONTHLY_CHAMPION]: {
    label: "月間チャンピオン",
    description: "月に10冊読了",
  },
  [CHALLENGE_KEYS.AVID_READER_50]: {
    label: "多読家",
    description: "合計50冊読了",
  },
  [CHALLENGE_KEYS.ANNUAL_CHAMPION]: {
    label: "年間チャンピオン",
    description: "年に100冊読了",
  },
  [CHALLENGE_KEYS.BOOKWORM_1000]: {
    label: "本の虫",
    description: "合計1000冊読了",
  },
};

export const BGM_LIBRARY = {
  リラックス: [
    {
      level: 1,
      name: "穏やかなピアノとパッド",
      file: "reading_bgm/ambient_piano_pad.mp3",
    },
    {
      level: 2,
      name: "ピアノとストリングスの静寂",
      file: "reading_bgm/ambient_piano_and_strings.mp3",
    },
    {
      level: 3,
      name: "ゆったりとしたピアノソロ",
      file: "reading_bgm/ambient_piano_solo.mp3",
    },
    {
      level: 4,
      name: "深呼吸したくなるピアノ",
      file: "reading_bgm/the_realization.mp3",
    },
  ],
  カフェ: [
    {
      level: 1,
      name: "カフェローファイ – やさしい午後",
      file: "reading_bgm/lofi_study_chill.mp3",
    },
    {
      level: 2,
      name: "スムーズローファイ – まったり時間",
      file: "reading_bgm/lofi_chill_smooth.mp3",
    },
    {
      level: 3,
      name: "チルローファイ – 背景に溶ける音",
      file: "reading_bgm/chill_lofi_background.mp3",
    },
    {
      level: 4,
      name: "チルホップ – 軽やかな夜",
      file: "reading_bgm/lofi_chillhop.mp3",
    },
  ],
  自然: [
    {
      level: 1,
      name: "雨音 – 心を静めるサウンド",
      file: "reading_bgm/nature_rain.mp3",
    },
    {
      level: 2,
      name: "しとしと雨のアンビエント",
      file: "reading_bgm/light_rain_ambient.mp3",
    },
    {
      level: 3,
      name: "森の鳥たちのさえずり",
      file: "reading_bgm/forest_birds.mp3",
    },
    {
      level: 4,
      name: "波の音 – ゆるやかな浜辺",
      file: "reading_bgm/ocean_waves.mp3",
    },
  ],
  集中: [
    {
      level: 1,
      name: "ディープフォーカス – 穏やかなビート",
      file: "reading_bgm/deep_focus.mp3",
    },
    {
      level: 2,
      name: "ソフトピアノ × Lo-fiビート",
      file: "reading_bgm/soft_piano_lofi_v2.mp3",
    },
    {
      level: 3,
      name: "スタディフォーカス – 静かな集中",
      file: "reading_bgm/study_focus.mp3",
    },
    {
      level: 4,
      name: "ピースフルピアノ – 集中と安らぎ",
      file: "reading_bgm/peaceful_piano_focus.mp3",
    },
  ],
};
