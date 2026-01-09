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
          className="rounded bg-buttonPrimary px-3 py-1 text-sm font-medium text-textWhite outline outline-1 outline-gray-300 hover:bg-buttonOnHover disabled:opacity-60"
        >
          Prev
        </button>
        <div className="flex flex-wrap gap-1">
          {visiblePages.map((p, idx) => {
            const prev = visiblePages[idx - 1];
            const gap = prev && p - prev > 1;
            return (
              <React.Fragment key={p}>
                {gap && <span className="px-2 text-textValue">…</span>}
                <button
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`rounded bg-bgBodySecondary px-3 py-1 text-sm font-medium outline outline-1 outline-gray-300 hover:bg-buttonOnHover hover:text-textWhite ${
                    p === page ? 'bg-buttonPrimary text-textWhite hover:bg-buttonOnHover' : ''
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
          className="rounded bg-buttonPrimary px-3 py-1 text-sm font-medium text-textWhite outline outline-1 outline-gray-300 hover:bg-buttonOnHover disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <p className="text-xs text-textLabel">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
};

export default Pagination;
