import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  const goToPage = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => {
    if (totalPages <= 10) return true;
    if (p === 1 || p === totalPages) return true;
    if (Math.abs(p - page) <= 2) return true;
    return false;
  });

  return (
    <nav aria-label="Pagination" className={className ?? 'mt-8 flex flex-col items-center gap-4'}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="rounded px-3 py-1 text-sm font-medium outline outline-1 outline-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>
        <div className="flex flex-wrap gap-1">
          {visiblePages.map((p, idx) => {
            const prev = visiblePages[idx - 1];
            const gap = prev && p - prev > 1;
            return (
              <React.Fragment key={p}>
                {gap && <span className="px-2 text-gray-400">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`rounded px-3 py-1 text-sm font-medium outline outline-1 outline-gray-300 hover:bg-gray-100 ${
                    p === page ? 'bg-indigo-600 text-white hover:bg-indigo-600' : ''
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="rounded px-3 py-1 text-sm font-medium outline outline-1 outline-gray-300 hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
};

export default Pagination;
