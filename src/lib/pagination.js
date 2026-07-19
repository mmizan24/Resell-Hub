export const DEFAULT_PAGE_SIZE = 12;

export function normalizePage(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function paginateItems(items = [], page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const safeItems = Array.isArray(items) ? items : [];
  const safePageSize = Math.max(1, Number.parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE);
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(Math.max(1, normalizePage(page, 1)), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * safePageSize;
  const endIndex = totalItems === 0 ? 0 : Math.min(startIndex + safePageSize, totalItems);

  return {
    items: safeItems.slice(startIndex, endIndex),
    page: currentPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    startIndex: totalItems === 0 ? 0 : startIndex + 1,
    endIndex,
  };
}
