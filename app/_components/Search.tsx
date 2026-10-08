import { ArrowPathIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import React, { useState, useRef, useCallback } from 'react';
import Input from './base/Input';
import { SEARCH_ENDPOINT } from '@/lib/utils/constants';
import { useAuth } from '@/lib/hooks/useAuth';

interface SearchProps {
  onSearchResponse: (items: InventoryItem[], query: string) => void;
  baseInventory: InventoryItem[];
  setError: (message: string) => void;
}

interface ProgressState {
  progress: number;
  duration: number;
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred during the search.';

export function Search({ onSearchResponse, baseInventory, setError }: SearchProps) {
  const { authorizationHeader } = useAuth();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [progressState, setProgressState] = useState<ProgressState>({ progress: 0, duration: 0 });

  // TODO: loading animation

  // TODO: search error is causing app error. Check filters too

  const search = useCallback(async () => {
    setError('');
    abortRef.current?.abort();
    setLoading(true);
    setProgressState({ progress: 0, duration: 0 });

    const controller = new AbortController();
    abortRef.current = controller;

    const qs = encodeURIComponent(query.trim());

    try {
      setProgressState({ progress: 80, duration: 4 });
      const res = await fetch(`${process.env.API_BASE}/${SEARCH_ENDPOINT}${qs}`, {
        signal: controller.signal,
        headers: authorizationHeader ? { Authorization: authorizationHeader } : undefined,
      });

      const json = await res.json();

      if (!res.ok && res.status === 400) {
        throw new Error();
      }

      const results = Array.isArray(json.data) ? json.data : [];
      onSearchResponse(results, query);
    } catch {
      if (abortRef.current?.signal.aborted) return;
      setError(DEFAULT_ERROR_MESSAGE);
      onSearchResponse([], query);
    } finally {
      setProgressState({ progress: 100, duration: 0.2 });
      setLoading(false);
    }
  }, [authorizationHeader, onSearchResponse, query]);

  return (
    <>
      <div className="relative overflow-hidden">
        <Input
          ref={inputRef}
          type="text"
          autoFocus
          value={query}
          className="h-12 pr-10 pl-11 text-base sm:text-sm"
          placeholder="Search..."
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim() === '') {
              onSearchResponse(baseInventory, '');
              setError('');
            }
          }}
          aria-label="Search inventory"
          onKeyDown={async (event) => {
            if (event.key === 'Enter') {
              await search();
            }
          }}
        />
        {loading ? (
          <div className="text-text-secondary pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2">
            <span aria-hidden="true">
              <ArrowPathIcon className="text-text-secondary size-5 animate-spin" />
            </span>
          </div>
        ) : (
          <MagnifyingGlassIcon
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
            aria-hidden="true"
          />
        )}

        {query && !loading && (
          <>
            <div
              className="text-text-secondary absolute top-1/2 aspect-square h-7 -translate-y-1/2"
              style={{ left: 55 + query.length * 7.7 + 'px', transition: 'left 0.02s ease-out' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 280"
                role="img"
                aria-label="Enter key"
              >
                <style>
                  {`
                    .key     { fill: var(--color-surface-panel, #ffffff); stroke: var(--color-border-default, #333333); stroke-width: 10; stroke-linejoin: round; }
                    .head    { fill: var(--color-text-primary, #333333); stroke: var(--color-text-primary, #333333); stroke-width: 12; stroke-linejoin: round; }
                    .hook    { fill: none; stroke: var(--color-text-primary, #333333); stroke-width: 20; stroke-linecap: round; stroke-linejoin: round; }
                    `}
                </style>
                <path
                  className="key"
                  d="M170 10H266A22 22 0 0 1 288 32V248A22 22 0 0 1 266 270H32A22 22 0 0 1 10 248V152A22 22 0 0 1 32 130H132A16 16 0 0 0 148 114V32A22 22 0 0 1 170 10Z"
                />
                <path className="head" d="M70 200L108 175V225Z" />
                <path className="hook" d="M108 200H232V120" />
              </svg>
            </div>
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
          </>
        )}
      </div>
      <div
        className="border-text-primary bg-surface-canvas h-1.5 w-full overflow-hidden rounded-b-full border"
        style={{
          opacity: loading ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        <div
          className="bg-status-success h-full rounded-b-full"
          style={{
            display: loading ? 'block' : 'none',
            transition: `width ${progressState.duration}s linear`,
            width: progressState.progress + '%',
          }}
        />
      </div>
    </>
  );
}
