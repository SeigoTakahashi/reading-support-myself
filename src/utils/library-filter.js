import { toMilliseconds } from "./format-datetime";

// books: Array of book records
// options: { filterStatus, searchQuery, sortBy }
export function applyFilters(books = [], options = {}) {
  const {
    filterStatus = "all",
    searchQuery = "",
    sortBy = "created-newest",
  } = options;
  let filteredBooks = Array.isArray(books) ? [...books] : [];

  // 1) ステータスフィルター
  if (filterStatus && filterStatus !== "all") {
    const statusMap = { reading: "読書中", completed: "読了", unread: "未読" };
    const targetStatus = statusMap[filterStatus] || null;
    if (targetStatus) {
      filteredBooks = filteredBooks.filter(
        (b) => (b.status || "") === targetStatus
      );
    }
  }

  // 2) 検索クエリ
  const query = (searchQuery || "").trim().toLowerCase();
  if (query) {
    filteredBooks = filteredBooks.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const authors = (b.authors || "").toLowerCase();
      const tags = (b.tags || []).join(" ").toLowerCase();
      const genre = (b.genre || "").toLowerCase();
      return (
        title.includes(query) ||
        authors.includes(query) ||
        tags.includes(query) ||
        genre.includes(query)
      );
    });
  }

  // 3) ソート
  switch (sortBy) {
    case "created-newest":
      filteredBooks.sort(
        (a, b) => toMilliseconds(b.createdAt) - toMilliseconds(a.createdAt)
      );
      break;
    case "created-oldest":
      filteredBooks.sort(
        (a, b) => toMilliseconds(a.createdAt) - toMilliseconds(b.createdAt)
      );
      break;
    case "title":
      filteredBooks.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
      break;
    case "rating":
      filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case "published-newest":
      filteredBooks.sort(
        (a, b) =>
          toMilliseconds(b.publishedDate) - toMilliseconds(a.publishedDate)
      );
      break;
    case "published-oldest":
      filteredBooks.sort(
        (a, b) =>
          toMilliseconds(a.publishedDate) - toMilliseconds(b.publishedDate)
      );
      break;
    case "likes":
      filteredBooks.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    default:
      break;
  }

  return filteredBooks;
}
