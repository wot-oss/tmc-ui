import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect, useRef } from 'react';
import { SEARCH_ENDPOINT } from '../utils/constants';

const DEBOUNCE_MS = 350;

interface SearchProps {
  query: string;
  onSearch: (value: string) => void;
  onResultsChange: (items: Item[]) => void;
  baseItems: Item[];
  authorizationHeader?: string | null;
  authEnabled: boolean;
  authLoading: boolean;
  authError?: string | null;
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred during the search.';

const Search: React.FC<SearchProps> = ({
  query,
  onSearch,
  onResultsChange,
  baseItems,
  authorizationHeader,
  authEnabled,
  authLoading,
  authError,
}) => {
  const [loading, setLoading] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const progressHideTimeoutRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (progressHideTimeoutRef.current) {
      window.clearTimeout(progressHideTimeoutRef.current);
      progressHideTimeoutRef.current = null;
    }

    if (!loading) {
      if (!progressVisible) {
        setProgressWidth('0%');
        return;
      }

      setProgressWidth('100%');
      progressHideTimeoutRef.current = window.setTimeout(() => {
        setProgressVisible(false);
        setProgressWidth('0%');
        progressHideTimeoutRef.current = null;
      }, 1000);

      return () => {
        if (progressHideTimeoutRef.current) {
          window.clearTimeout(progressHideTimeoutRef.current);
          progressHideTimeoutRef.current = null;
        }
      };
    }

    setProgressVisible(true);
    setProgressWidth('0%');
    const frameId = window.requestAnimationFrame(() => {
      setProgressWidth('90%');
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [loading, progressVisible]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (!query.trim()) {
      onResultsChange(baseItems);
      setLoading(false);
      setError('');
      return;
    }

    if (authEnabled && authLoading && !authorizationHeader) {
      setLoading(true);
      return;
    }

    if (authEnabled && !authorizationHeader) {
      setLoading(false);
      setError(authError || DEFAULT_ERROR_MESSAGE);
      onResultsChange([]);
      return;
    }

    setLoading(true);
    setError('');

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    debounceRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      const qs = encodeURIComponent(query.trim());

      try {
        const res = await fetch(`${__API_BASE__}/${SEARCH_ENDPOINT}${qs}`, {
          signal: controller.signal,
          headers: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
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
          if (requestIdRef.current === requestId) {
            setError(json.detail || DEFAULT_ERROR_MESSAGE);
            onResultsChange([]);
          }
          return;
        }

        const results = Array.isArray(json.data) ? json.data : [];
        if (requestIdRef.current === requestId) {
          onResultsChange(results);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;

        if (requestIdRef.current === requestId) {
          setError(DEFAULT_ERROR_MESSAGE);
          onResultsChange([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [authorizationHeader, authEnabled, authError, authLoading, baseItems, onResultsChange, query]);

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          autoFocus
          value={query}
          className={`h-12 w-full rounded-md bg-inputBg pr-10 text-base text-inputText placeholder:text-gray-500 focus:outline-inputOnFocus sm:text-sm ${loading ? 'pl-32' : 'pl-11'}`}
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search inventory"
        />
        {loading ? (
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-2 text-textLabel">
            <span aria-hidden="true">
              <ArrowPathIcon className="size-5 animate-spin text-textLabel" />
            </span>
            <span className="text-sm">Searching</span>
          </div>
        ) : (
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-textLabel"
            aria-hidden="true"
          />
        )}

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
      {progressVisible && (
        <div className="h-1.5 w-full overflow-hidden rounded-full border border-border bg-bgBodyPrimary">
          <div
            className="h-full rounded-full bg-success"
            style={{
              width: progressWidth,
              transition: loading ? 'width 9s linear' : 'width 150ms ease-out',
            }}
          />
        </div>
      )}
      <>{error && <div className="mt-2 h-5 text-sm text-error">{error}</div>}</>
    </>
  );
};

export default Search;
