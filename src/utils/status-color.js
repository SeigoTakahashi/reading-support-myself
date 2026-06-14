// ステータスバッジの色クラスを取得する関数
export const getStatusColor = (status) => {
  switch (status) {
    case "読書中":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "読了":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "未読":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};
