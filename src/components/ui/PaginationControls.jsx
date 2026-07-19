"use client";

function buttonBase(active = false) {
  return active
    ? "bg-blue-700 text-white border-blue-700"
    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700";
}

function pageButtonLabel(page) {
  return `Page ${page}`;
}

export function PaginationControls({
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemLabel = "items",
  onPageChange,
}) {
  if (!Number.isInteger(totalPages) || totalPages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const canGoBack = safePage > 1;
  const canGoForward = safePage < totalPages;

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {startIndex}-{endIndex} of {totalItems} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!canGoBack}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonBase(false)}`}
        >
          First
        </button>
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canGoBack}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonBase(false)}`}
        >
          Previous
        </button>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
          {pageButtonLabel(safePage)} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canGoForward}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonBase(false)}`}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoForward}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonBase(false)}`}
        >
          Last
        </button>
      </div>
    </div>
  );
}
