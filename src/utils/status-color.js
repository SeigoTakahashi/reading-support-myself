// ステータスバッジの色クラスを取得する関数
export const getStatusColor = (status) => {
  switch (status) {
    case "読書中":
      return "bg-sky-50 text-sky-700 border-sky-200/60";
    case "読了":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "未読":
      return "bg-zinc-100 text-zinc-600 border-zinc-200/80";
    default:
      return "bg-zinc-100 text-zinc-600 border-zinc-200/80";
  }
};

// ドットの色
export const getStatusDotColor = (status) => {
  switch (status) {
    case "読書中":
      return "bg-sky-500";
    case "読了":
      return "bg-emerald-500";
    case "未読":
      return "bg-zinc-400";
    default:
      return "bg-zinc-400";
  }
};
