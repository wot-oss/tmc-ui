import React from 'react';

import Button from './base/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  const goToPage = (p: number) => onPageChange(Math.min(Math.max(1, p), totalPages));

  const visiblePages = (() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, totalPages];
    }

    if (page >= totalPages - 3) {
      return [1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, page - 1, page, page + 1, totalPages];
  })();

  const paginationButtonClassName =
    'h-8 w-8 items-center justify-center gap-[10px] border-border-interactive text-interactive-primary hover:border-border-interactive-hover hover:bg-surface-input-hover hover:text-interactive-hover';

  return (
    <nav aria-label="Pagination" className={className ?? 'mt-8 flex flex-col items-center gap-4'}>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => goToPage(1)}
          disabled={page === 1}
          aria-label="Go to first page"
          className={paginationButtonClassName}
          variant="default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M10 6L11.4 7.4L6.9 12L11.4 16.6L10 18L4 12L10 6Z" fill="currentColor" />
            <path
              d="M16.98 6L18.38 7.4L13.88 12L18.38 16.6L16.98 18L10.98 12L16.98 6Z"
              fill="currentColor"
            />
          </svg>
        </Button>
        <Button
          type="button"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
          className={paginationButtonClassName}
          variant="default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M13 6L14.4 7.4L9.9 12L14.4 16.6L13 18L7 12L13 6Z" fill="currentColor" />
          </svg>
        </Button>
        <div className="flex flex-wrap gap-1">
          {visiblePages.map((p, idx) => {
            const prev = visiblePages[idx - 1];
            const gap = prev && p - prev > 1;
            return (
              <React.Fragment key={p}>
                {gap && <span className="px-2 text-text-primary">…</span>}
                <Button
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={
                    p === page
                      ? 'h-8 w-8 items-center justify-center gap-[10px] border-border-interactive-hover bg-interactive-hover text-text-inverse-strong hover:border-border-interactive-hover hover:bg-interactive-hover hover:text-text-inverse-strong'
                      : paginationButtonClassName
                  }
                  variant="none"
                >
                  {p}
                </Button>
              </React.Fragment>
            );
          })}
        </div>
        <Button
          type="button"
          onClick={() => goToPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className={paginationButtonClassName}
          variant="default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M11 18L9.6 16.6L14.1 12L9.6 7.4L11 6L17 12L11 18Z" fill="currentColor" />
          </svg>
        </Button>
        <Button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          aria-label="Go to last page"
          className={paginationButtonClassName}
          variant="default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M14 18L12.6 16.6L17.1 12L12.6 7.4L14 6L20 12L14 18Z" fill="currentColor" />
            <path
              d="M7.02 18L5.62 16.6L10.12 12L5.62 7.4L7.02 6L13.02 12L7.02 18Z"
              fill="currentColor"
            />
          </svg>
        </Button>
      </div>
      <p className="text-xs text-text-secondary">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
};

export default Pagination;
