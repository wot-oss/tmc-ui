import { useCallback, useEffect, useMemo, useState } from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import CredentialsPrompt from './components/SetupCredentials';
import Loader from './components/base/Loader';
import Details from './pages/Details';
import FourZeroFourNotFound from './components/404NotFound';
import { AuthProvider } from './context/AuthContext';
import LayoutLoadData from './pages/LayoutLoadData';
import Settings from './pages/Settings';
import {
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from './services/auth';
import {
  CLIENT_ID_SESSION_KEY,
  CLIENT_SECRET_SESSION_KEY,
  CREDENTIALS_SUBMITTED_SESSION_KEY,
} from './utils/constants';

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getStoredSessionValue = (key: string): string => {
  return getSessionStorage()?.getItem(key) ?? '';
};

const setStoredSessionValue = (key: string, value: string): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  if (value.trim().length === 0) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, value);
};

const hasStoredCredentials = (): boolean => {
  return (
    getStoredSessionValue(CLIENT_ID_SESSION_KEY).trim().length > 0 &&
    getStoredSessionValue(CLIENT_SECRET_SESSION_KEY).trim().length > 0
  );
};

const getStoredCredentialsSubmitted = (): boolean => {
  return (
    getStoredSessionValue(CREDENTIALS_SUBMITTED_SESSION_KEY) === 'true' && hasStoredCredentials()
  );
};

const setStoredCredentialsSubmitted = (submitted: boolean): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  if (!submitted) {
    storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
    return;
  }

  storage.setItem(CREDENTIALS_SUBMITTED_SESSION_KEY, 'true');
};

const clearStoredCredentialsSession = (): void => {
  const storage = getSessionStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(CLIENT_ID_SESSION_KEY);
  storage.removeItem(CLIENT_SECRET_SESSION_KEY);
  storage.removeItem(CREDENTIALS_SUBMITTED_SESSION_KEY);
};

const AppShell: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const AppShellError: React.FC = () => {
  return (
    <>
      <Navbar />
      <FourZeroFourNotFound error={'Settings not defined'} />
    </>
  );
};

const App: React.FC = () => {
  if (__DEBUG__) {
    console.warn('Vite globals', {
      __API_BASE__,
      __CATALOG_URL__,
      __DEBUG__,
      __SERVER_AVAILABLE__,
      __APP_REPO_URL__,
      __CATALOG_REPO_URL__,
      __DEPLOY_TYPE__,
    });
  }

  const [clientId, setClientId] = useState(() => getStoredSessionValue(CLIENT_ID_SESSION_KEY));
  const [clientSecret, setClientSecret] = useState(() =>
    getStoredSessionValue(CLIENT_SECRET_SESSION_KEY),
  );
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(() =>
    getStoredCredentialsSubmitted(),
  );
  const [seedToken, setSeedToken] = useState<RequestClientCredentialsTokenResult | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [isValidatingStartupCredentials, setIsValidatingStartupCredentials] = useState(false);

  const tokenUrl = (import.meta.env.VITE_TOKEN_URL ?? '') as string;
  const credentialsReady =
    credentialsSubmitted && clientId.trim().length > 0 && clientSecret.trim().length > 0;
  const showSetupCredentials =
    __DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && Boolean(tokenUrl) && !credentialsReady;
  const shouldValidateStoredCredentials =
    __DEPLOY_TYPE__ === 'SERVER_AVAILABLE' &&
    Boolean(tokenUrl) &&
    credentialsReady &&
    seedToken === null;
  const authIsEnabled =
    Boolean(tokenUrl) && !showSetupCredentials && !shouldValidateStoredCredentials;

  const handleClientIdChange = useCallback((value: string) => {
    setStoredSessionValue(CLIENT_ID_SESSION_KEY, value);
    setStoredCredentialsSubmitted(false);
    setCredentialsSubmitted(false);
    setStartupError(null);
    setClientId(value);
  }, []);

  const handleClientSecretChange = useCallback((value: string) => {
    setStoredSessionValue(CLIENT_SECRET_SESSION_KEY, value);
    setStoredCredentialsSubmitted(false);
    setCredentialsSubmitted(false);
    setStartupError(null);
    setClientSecret(value);
  }, []);

  const handleCredentialsCommit = useCallback(
    (
      nextClientId: string,
      nextClientSecret: string,
      validatedToken: RequestClientCredentialsTokenResult,
    ) => {
      setStoredSessionValue(CLIENT_ID_SESSION_KEY, nextClientId);
      setStoredSessionValue(CLIENT_SECRET_SESSION_KEY, nextClientSecret);
      setStoredCredentialsSubmitted(true);
      setSeedToken(validatedToken);
      setStartupError(null);
      setClientId(nextClientId);
      setClientSecret(nextClientSecret);
      setCredentialsSubmitted(true);
    },
    [],
  );

  const handleCredentialsSubmit = useCallback(async () => {
    setIsValidatingStartupCredentials(true);
    setStartupError(null);

    try {
      const validatedToken = await requestClientCredentialsToken({
        tokenUrl,
        clientId,
        clientSecret,
      });

      handleCredentialsCommit(clientId, clientSecret, validatedToken);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      setStartupError(err instanceof Error ? err.message : 'Failed to validate credentials.');
    } finally {
      setIsValidatingStartupCredentials(false);
    }
  }, [clientId, clientSecret, handleCredentialsCommit, tokenUrl]);

  useEffect(() => {
    if (!shouldValidateStoredCredentials) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    setIsValidatingStartupCredentials(true);
    setStartupError(null);

    void requestClientCredentialsToken({
      tokenUrl,
      clientId,
      clientSecret,
      signal: controller.signal,
    })
      .then((validatedToken) => {
        if (!isActive) {
          return;
        }

        setSeedToken(validatedToken);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (!isActive) {
          return;
        }

        clearStoredCredentialsSession();
        setClientId('');
        setClientSecret('');
        setCredentialsSubmitted(false);
        setStartupError(err instanceof Error ? err.message : 'Failed to validate credentials.');
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setIsValidatingStartupCredentials(false);
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [clientId, clientSecret, shouldValidateStoredCredentials, tokenUrl]);

  const router = useMemo(
    () =>
      createHashRouter(
        [
          {
            element: <AppShell />,
            errorElement: <AppShellError />,
            children: showSetupCredentials
              ? [
                  {
                    index: true,
                    element: (
                      <CredentialsPrompt
                        clientId={clientId}
                        clientSecret={clientSecret}
                        onClientIdChange={handleClientIdChange}
                        onClientSecretChange={handleClientSecretChange}
                        onSubmit={handleCredentialsSubmit}
                        errorMessage={startupError}
                        isSubmitting={isValidatingStartupCredentials}
                      />
                    ),
                  },
                  {
                    path: '*',
                    element: (
                      <CredentialsPrompt
                        clientId={clientId}
                        clientSecret={clientSecret}
                        onClientIdChange={handleClientIdChange}
                        onClientSecretChange={handleClientSecretChange}
                        onSubmit={handleCredentialsSubmit}
                        errorMessage={startupError}
                        isSubmitting={isValidatingStartupCredentials}
                      />
                    ),
                  },
                ]
              : [
                  {
                    index: true,
                    element: <LayoutLoadData />,
                    errorElement: <FourZeroFourNotFound error={'Catalog not found'} />,
                  },
                  {
                    path: 'details/*',
                    element: <Details />,
                    errorElement: <FourZeroFourNotFound error={'Details not found'} />,
                  },
                  {
                    path: 'settings',
                    element: (
                      <Settings
                        clientId={clientId}
                        clientSecret={clientSecret}
                        tokenUrl={tokenUrl}
                        onCommitCredentials={handleCredentialsCommit}
                      />
                    ),
                    errorElement: <FourZeroFourNotFound error={'Settings not found'} />,
                  },
                ],
          },
        ],
        {
          future: {
            v7_relativeSplatPath: true,
          },
        },
      ),
    [
      clientId,
      clientSecret,
      handleClientIdChange,
      handleClientSecretChange,
      handleCredentialsCommit,
      handleCredentialsSubmit,
      isValidatingStartupCredentials,
      startupError,
      tokenUrl,
      showSetupCredentials,
    ],
  );

  if (showSetupCredentials) {
    return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
  }

  if (shouldValidateStoredCredentials) {
    return (
      <main className="min-h-dvh bg-surface-canvas px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl items-center justify-center">
          <Loader text="Validating saved credentials..." />
        </div>
      </main>
    );
  }

  return (
    <AuthProvider
      tokenUrl={tokenUrl}
      clientId={clientId}
      clientSecret={clientSecret}
      enabled={authIsEnabled}
      seedToken={seedToken}
    >
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
};

export default App;
