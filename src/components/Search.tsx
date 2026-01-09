import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect, useRef } from 'react';
import { SEARCH_ENDPOINT } from '../utils/constants';

const DEBOUNCE_MS = 350;

interface SearchProps {
  query: string;
  onSearch: (value: string) => void;
  onResultsChange: (items: Item[]) => void;
  baseItems: Item[];
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred during the search.';

const Search: React.FC<SearchProps> = ({ query, onSearch, onResultsChange, baseItems }) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResultsChange(baseItems);
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);

    debounceRef.current = window.setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const qs = encodeURIComponent(query.trim());

      try {
        const res = await fetch(`${__API_BASE__}/${SEARCH_ENDPOINT}${qs}`, {
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok && res.status === 400) {
          json as {
            code: string;
            detail: string;
            instance: string;
            status: number;
            title: string;
          };
          setError(json.detail || DEFAULT_ERROR_MESSAGE);
          onResultsChange([]);
          return;
        }

        const results = Array.isArray(json.data) ? json.data : [];
        onResultsChange(results);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, baseItems, onResultsChange]);

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={query}
          className="h-12 w-full rounded-md bg-inputBg pl-11 pr-10 text-base text-inputText placeholder:text-gray-500 focus:outline-inputOnFocus sm:text-sm"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search inventory"
        />
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-textLabel"
          aria-hidden="true"
        />

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onSearch('');
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-buttonPrimary hover:bg-buttonPrimary hover:text-white"
          >
            <XMarkIcon className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
      <>{error && <div className="mt-2 h-5 text-sm text-error">{error}</div>}</>
      <div className="mt-2 h-5 text-sm text-textGray" aria-live="polite" aria-atomic="true">
        {loading && 'Searching...'}
      </div>
    </>
  );
};

export default Search;
