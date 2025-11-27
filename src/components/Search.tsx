import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect, useRef } from 'react';
import { getLocalStorage } from '../utils/utils';
import { SETTINGS_URL_CATALOG, SEARCH_ENDPOINT } from '../utils/constants';

const DEBOUNCE_MS = 350;

interface SearchProps {
  query: string;
  onSearch: (query: string) => void;
  onResultsChange: (items: Item[]) => void;
  baseItems: Item[];
}

const Search: React.FC<SearchProps> = ({ query, onSearch, onResultsChange, baseItems }) => {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResultsChange(baseItems);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = window.setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const tmcUrl = getLocalStorage(SETTINGS_URL_CATALOG);
      const qs = encodeURIComponent(query.trim());

      fetch(`${tmcUrl}/${SEARCH_ENDPOINT}${qs}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json) => {
          const results = Array.isArray(json.data) ? json.data : [];
          onResultsChange(results);
          setLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, baseItems, onResultsChange]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        autoFocus
        value={query}
        className="h-12 w-full rounded-md bg-gray-900 pl-11 pr-10 text-base text-white placeholder:text-gray-500 sm:text-sm"
        placeholder="Search..."
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search inventory"
      />
      <MagnifyingGlassIcon
        className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-500"
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
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <XMarkIcon className="size-5" aria-hidden="true" />
        </button>
      )}

      {loading && (
        <div className="mt-2 text-sm text-gray-400" aria-live="polite">
          Searching...
        </div>
      )}
    </div>
  );
};

export default Search;
