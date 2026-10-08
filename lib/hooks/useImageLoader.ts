import { useCallback, useRef, useState } from 'react';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

interface UseImageLoaderOptions {
  src: string;
  fallbackSrc: string;
}

interface UseImageLoaderResult {
  currentSrc: string;
  isLoading: boolean;
  hasError: boolean;
  /** Attach to <img onLoad> */
  handleLoad: () => void;
  /** Attach to <img onError> */
  handleError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * Manages image retry with exponential backoff.
 *
 * The DOM `<img>` element is the only thing that fetches — no hidden
 * `new Image()` preload, so each URL is requested exactly once per attempt.
 * On error the hook waits, then forces a retry by cache-busting the URL.
 * After MAX_RETRIES it falls back to `fallbackSrc`.
 *
 * Concurrency is handled naturally by the browser's per-origin connection
 * limit combined with `loading="lazy"` on the `<img>`.
 */
export function useImageLoader({ src, fallbackSrc }: UseImageLoaderOptions): UseImageLoaderResult {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const attemptRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    attemptRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const attempt = attemptRef.current;

      if (attempt < MAX_RETRIES) {
        attemptRef.current = attempt + 1;
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);

        timerRef.current = setTimeout(() => {
          // Append a cache-busting param so the browser makes a fresh request
          const separator = src.includes('?') ? '&' : '?';
          setCurrentSrc(`${src}${separator}_retry=${attemptRef.current}`);
        }, delay);
      } else {
        // All retries exhausted — use fallback
        e.currentTarget.src = fallbackSrc;
        setCurrentSrc(fallbackSrc);
        setHasError(true);
        setIsLoading(false);
      }
    },
    [src, fallbackSrc],
  );

  return { currentSrc, isLoading, hasError, handleLoad, handleError };
}
