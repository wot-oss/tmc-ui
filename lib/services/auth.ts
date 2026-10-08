import { isNonEmptyString } from '../utils/strings';

interface ClientCredentialsTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
}

interface RequestClientCredentialsTokenOptions {
  readonly tokenUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly signal?: AbortSignal;
}

export interface RequestClientCredentialsTokenResult {
  readonly accessToken: string;
  readonly expiresAt: number | null;
}

const TOKEN_EXPIRY_SKEW_MS = 30_000;

export async function requestClientCredentialsToken(
  options: RequestClientCredentialsTokenOptions,
): Promise<RequestClientCredentialsTokenResult> {
  const { tokenUrl, clientId, clientSecret, signal } = options;
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
    signal,
  });

  if (!response.ok) {
    const message =
      (await response.text().catch(() => '')) ??
      `Token request failed with status ${response.status}`;

    throw new Error(message);
  }

  const payload = (await response.json()) as ClientCredentialsTokenResponse;
  const nextAccessToken = payload.access_token;

  if (!nextAccessToken) {
    throw new Error('Token endpoint did not return an access_token');
  }

  const nextExpiresAt =
    typeof payload.expires_in === 'number'
      ? Date.now() + Math.max(payload.expires_in * 1000 - TOKEN_EXPIRY_SKEW_MS, 0)
      : null;

  return {
    accessToken: nextAccessToken,
    expiresAt: nextExpiresAt,
  };
}

export function isAuthenticationEnabled(
  serverUrl: string | undefined | null,
  tokenUrl: string | undefined | null,
) {
  return isNonEmptyString(serverUrl) && isNonEmptyString(tokenUrl);
}
