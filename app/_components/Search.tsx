import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useEffect, useRef } from 'react';
import Input from './base/Input';
import { SEARCH_ENDPOINT } from '@/lib/utils/constants';
import { useAuth } from '@/lib/hooks/useAuth';

const DEBOUNCE_MS = 350;

interface SearchProps {
  onSearch: (items: InventoryItem[], query: string) => void;
  baseItems: InventoryItem[];
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred during the search.';

export function Search({ onSearch, baseItems }: SearchProps) {
  return;
  // TODO
  /*
  const { authorizationHeader } = useAuth();

  const [query, setQuery] = useState('');
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
      onSearch(baseItems, query);
      setLoading(false);
      setError('');
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
        const res = await fetch(`${process.env.API_BASE}/${SEARCH_ENDPOINT}${qs}`, {
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
            onSearch([], query);
          }
          return;
        }

        const results = Array.isArray(json.data) ? json.data : [];
        if (requestIdRef.current === requestId) {
          onSearch(results, query);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;

        if (requestIdRef.current === requestId) {
          setError(DEFAULT_ERROR_MESSAGE);
          onSearch([], query);
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
  }, [authorizationHeader, baseItems, onSearch, query]);

  return (
    <>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          autoFocus
          value={query}
          className={`h-12 pr-10 text-base sm:text-sm ${loading ? 'pl-32' : 'pl-11'}`}
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search inventory"
        />
        {loading ? (
          <div className="text-text-secondary pointer-events-none absolute inset-y-0 left-3 flex items-center gap-2">
            <span aria-hidden="true">
              <ArrowPathIcon className="text-text-secondary size-5 animate-spin" />
            </span>
            <span className="text-sm">Searching</span>
          </div>
        ) : (
          <MagnifyingGlassIcon
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
        )}

        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="text-interactive-support hover:bg-interactive-support hover:text-text-primary absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
          >
            <XMarkIcon className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>
      {progressVisible && (
        <div className="border-text-primary bg-surface-canvas h-1.5 w-full overflow-hidden rounded-full border">
          <div
            className="bg-status-success h-full rounded-full"
            style={{
              width: progressWidth,
              transition: loading ? 'width 9s linear' : 'width 150ms ease-out',
            }}
          />
        </div>
      )}
      <>{error && <div className="text-status-error mt-2 h-5 text-sm">{error}</div>}</>
    </>
  );
  */
}
