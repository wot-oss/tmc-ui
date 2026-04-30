import { useCallback, useEffect, useRef, useState } from 'react';
import {
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from '../services/auth';

interface UseClientCredentialsTokenOptions {
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly enabled?: boolean;
  readonly seedToken?: RequestClientCredentialsTokenResult | null;
}

interface UseClientCredentialsTokenResult {
  readonly accessToken: string | null;
  readonly authorizationHeader: string | null;
  readonly expiresAt: number | null;
  readonly isExpired: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly requestToken: () => Promise<void>;
  readonly clearToken: () => void;
}

export function useClientCredentialsToken(
  options: UseClientCredentialsTokenOptions,
): UseClientCredentialsTokenResult {
  const { tokenUrl, clientId, clientSecret, enabled = false, seedToken = null } = options;
  const credentialsKey = `${tokenUrl}::${clientId}::${clientSecret}`;

  const [accessToken, setAccessToken] = useState<string | null>(seedToken?.accessToken ?? null);
  const [expiresAt, setExpiresAt] = useState<number | null>(seedToken?.expiresAt ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const credentialsKeyRef = useRef(credentialsKey);

  useEffect(() => {
    credentialsKeyRef.current = credentialsKey;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setAccessToken(null);
    setExpiresAt(null);
    setError(null);
    setIsLoading(false);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [credentialsKey]);

  useEffect(() => {
    if (!seedToken) {
      return;
    }

    setAccessToken(seedToken.accessToken);
    setExpiresAt(seedToken.expiresAt);
    setError(null);
  }, [seedToken]);

  const clearToken = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setAccessToken(null);
    setExpiresAt(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const requestToken = useCallback(async (): Promise<void> => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    const requestCredentialsKey = credentialsKey;
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const token = await requestClientCredentialsToken({
        tokenUrl,
        clientId,
        clientSecret,
        signal: controller.signal,
      });

      if (
        abortControllerRef.current !== controller ||
        controller.signal.aborted ||
        credentialsKeyRef.current !== requestCredentialsKey
      ) {
        return;
      }

      setAccessToken(token.accessToken);
      setExpiresAt(token.expiresAt);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      const message = err instanceof Error ? err.message : 'Unknown token request error';
      if (
        abortControllerRef.current === controller &&
        credentialsKeyRef.current === requestCredentialsKey
      ) {
        setError(message);
      }

      throw new Error(message);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      if (credentialsKeyRef.current === requestCredentialsKey) {
        setIsLoading(false);
      }
    }
  }, [clientId, clientSecret, credentialsKey, tokenUrl]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const seededSessionIsUsable =
      seedToken && seedToken.expiresAt !== null && seedToken.expiresAt > Date.now();

    if (seededSessionIsUsable) {
      return;
    }
    void requestToken().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
    });
  }, [enabled, requestToken, seedToken]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const isExpired = expiresAt !== null && expiresAt <= Date.now();
  const authorizationHeader = accessToken ? `Bearer ${accessToken}` : null;

  return {
    accessToken,
    authorizationHeader,
    expiresAt,
    isExpired,
    isLoading,
    error,
    requestToken,
    clearToken,
  };
}
