import Link from "next/link";

function buildPageHref(basePath, searchParams, page) {
  const params = new URLSearchParams(searchParams);
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function PaginationLinks({
  basePath,
  searchParams = {},
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemLabel = "items",
}) {
  if (!Number.isInteger(totalPages) || totalPages <= 1) {
    return null;
  }

  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600">
        Showing {startIndex}-{endIndex} of {totalItems} {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildPageHref(basePath, searchParams, 1)}
          aria-disabled={safePage === 1}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            safePage === 1
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          First
        </Link>
        <Link
          href={buildPageHref(basePath, searchParams, Math.max(1, safePage - 1))}
          aria-disabled={safePage === 1}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            safePage === 1
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          Previous
        </Link>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
          Page {safePage} of {totalPages}
        </span>

        <Link
          href={buildPageHref(basePath, searchParams, Math.min(totalPages, safePage + 1))}
          aria-disabled={safePage === totalPages}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            safePage === totalPages
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          Next
        </Link>
        <Link
          href={buildPageHref(basePath, searchParams, totalPages)}
          aria-disabled={safePage === totalPages}
          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            safePage === totalPages
              ? "pointer-events-none border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          Last
        </Link>
      </div>
    </div>
  );
}
