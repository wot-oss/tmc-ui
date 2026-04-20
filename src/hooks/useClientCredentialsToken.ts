import { useCallback, useEffect, useRef, useState } from 'react';

interface UseClientCredentialsTokenOptions {
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly enabled?: boolean;
}

interface ClientCredentialsTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
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

const TOKEN_EXPIRY_SKEW_MS = 30_000;

async function buildTokenRequestError(response: Response): Promise<Error> {
  let message = `Token request failed with status ${response.status}`;
  const fallback = await response.text().catch(() => '');
  if (fallback) {
    message = fallback;
  }
  return new Error(message);
}

export function useClientCredentialsToken(
  options: UseClientCredentialsTokenOptions,
): UseClientCredentialsTokenResult {
  const { tokenUrl, clientId, clientSecret, enabled = false } = options;

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearToken = useCallback(() => {
    setAccessToken(null);
    setTokenType(null);
    setExpiresAt(null);
    setError(null);
  }, []);

  const requestToken = useCallback(async (): Promise<void> => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw await buildTokenRequestError(response);
      }

      const payload = (await response.json()) as ClientCredentialsTokenResponse;
      const nextAccessToken = payload.access_token;

      if (!nextAccessToken) {
        throw new Error('Token endpoint did not return an access_token');
      }

      const nextTokenType = payload.token_type ?? 'Bearer';
      const nextExpiresAt =
        typeof payload.expires_in === 'number'
          ? Date.now() + Math.max(payload.expires_in * 1000 - TOKEN_EXPIRY_SKEW_MS, 0)
          : null;

      setAccessToken(nextAccessToken);
      setTokenType(nextTokenType);
      setExpiresAt(nextExpiresAt);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      const message = err instanceof Error ? err.message : 'Unknown token request error';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [clientId, clientSecret, tokenUrl]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void requestToken().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
    });
  }, [enabled, requestToken]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const isExpired = expiresAt !== null && expiresAt <= Date.now();
  const authorizationHeader = accessToken && tokenType ? `${tokenType} ${accessToken}` : null;

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
