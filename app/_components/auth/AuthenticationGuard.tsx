'use client';

import { type JSX, useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  isAuthenticationEnabled,
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from '../../../lib/services/auth';
import { CLIENT_ID_SESSION_KEY, CLIENT_SECRET_SESSION_KEY } from '../../../lib/utils/constants';
import {
  clearStoredCredentialsSession,
  getProcessedSessionStoreValue,
  setStoredSessionValue,
} from '../../../lib/utils/storage';
import { ValidationLoader } from '../ValidationLoader';
import { AuthenticationForm } from './AuthenticationForm';
import { Navbar } from '../Navbar';
import { AuthContext } from '@/lib/context';

interface AuthenticationGuardProps {
  readonly children: ReactNode;
  readonly serverUrl?: string;
  readonly tokenUrl?: string;
}

/**
 * Authentication guard component that ensures the user is authenticated before rendering the children. Renders a form for entering credentials if needed.
 */
export default function AuthenticationGuard({
  children,
  serverUrl = '',
  tokenUrl = '',
}: AuthenticationGuardProps) {
  const isAuthEnabled = isAuthenticationEnabled(serverUrl, tokenUrl);

  // Credentials
  const [clientIdInput, setClientIdInput] = useState('');
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [token, setToken] = useState<RequestClientCredentialsTokenResult | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(true);

  //Authentication states
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isValidatingCredentials, setIsValidatingCredentials] = useState(isAuthEnabled);

  // Authentication on load
  useEffect(() => {
    if (isAuthEnabled && isTokenExpired) {
      // Next.js requires getting store values on mount
      const storedClientId = getProcessedSessionStoreValue(CLIENT_ID_SESSION_KEY);
      const storedClientSecret = getProcessedSessionStoreValue(CLIENT_SECRET_SESSION_KEY);

      if (storedClientId && storedClientSecret) {
        const controller = new AbortController();
        void (async () => {
          try {
            const validatedTokenResponse = await requestClientCredentialsToken({
              tokenUrl,
              clientId: storedClientId,
              clientSecret: storedClientSecret,
              signal: controller.signal,
            });
            if (controller.signal.aborted) return;
            setClientIdInput(storedClientId);
            setClientSecretInput(storedClientSecret);
            setToken(validatedTokenResponse);
            setIsTokenExpired(false);
            if (validatedTokenResponse.expiresAt) {
              setTimeout(() => {
                setIsTokenExpired(true);
              }, validatedTokenResponse.expiresAt - Date.now());
            }
          } catch (caughtError: unknown) {
            if (controller.signal.aborted) return;
            setAuthErrorMessage(
              caughtError instanceof Error ? caughtError.message : 'Failed to validate credentials',
            );

            clearStoredCredentialsSession();
          } finally {
            // TODO: fix this
            // Needs a timeout to avoid UI flickering
            setTimeout(() => {
              setIsValidatingCredentials(false);
            }, 1000);
          }
        })();
        return () => {
          controller.abort();
        };
      } else {
        setIsValidatingCredentials(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenExpired]);

  const updateCredentials = useCallback(
    async (clientId: string, clientSecret: string) => {
      const validatedTokenResponse = await requestClientCredentialsToken({
        tokenUrl,
        clientId,
        clientSecret,
      });
      setStoredSessionValue(CLIENT_ID_SESSION_KEY, clientId);
      setStoredSessionValue(CLIENT_SECRET_SESSION_KEY, clientSecret);
      setClientIdInput(clientId);
      setClientSecretInput(clientSecret);
      setToken(validatedTokenResponse);
    },
    [tokenUrl],
  );

  const handleAuthSubmit = useCallback(async () => {
    setIsValidatingCredentials(true);
    setAuthErrorMessage(null);

    try {
      await updateCredentials(clientIdInput, clientSecretInput);
    } catch (caughtError: unknown) {
      setAuthErrorMessage(
        caughtError instanceof Error ? caughtError.message : 'Failed to validate credentials',
      );
    } finally {
      setIsValidatingCredentials(false);
    }
  }, [clientIdInput, clientSecretInput, updateCredentials]);

  // Page content based on authentication state
  let content: JSX.Element | null = (
    <AuthContext.Provider
      value={{
        authorizationHeader: token && `Bearer ${token.accessToken}`,
        isAuthenticationEnabled: isAuthEnabled,
        clientId: clientIdInput,
        clientSecret: clientSecretInput,
        updateCredentials,
        clearToken: () => {
          setToken(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
  if (isAuthEnabled) {
    if (isValidatingCredentials) {
      content = <ValidationLoader />;
    } else if (!token) {
      const setupCredentialsMessage =
        process.env.CREDENTIALS_SETUP_MESSAGE ||
        'The credentials are used for authenticated catalog requests. If you do not have credentials, contact the administrator.';
      content = (
        <main className="grid flex-1 place-items-center p-4">
          <div className="w-full max-w-xl pb-[30vh]">
            <AuthenticationForm
              eyebrow="API authentication"
              title="Enter API credentials"
              description={`${setupCredentialsMessage} Credentials stay available for this browser tab until it is closed.`}
              clientId={clientIdInput}
              clientSecret={clientSecretInput}
              onClientIdChange={setClientIdInput}
              onClientSecretChange={setClientSecretInput}
              onSubmit={handleAuthSubmit}
              submitText="Continue"
              errorMessage={authErrorMessage}
              autoFocusClientId
              isSubmitting={isValidatingCredentials}
              size="lg"
            />
          </div>
        </main>
      );
    }
  }

  return (
    <>
      <Navbar isAuthenticationEnabled={!!token} />
      {content}
    </>
  );
}
