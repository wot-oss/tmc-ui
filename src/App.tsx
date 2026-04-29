import { useCallback, useEffect, useMemo, useState } from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CredentialsPrompt } from './components/CredentialsPrompt';
import Details from './pages/Details';
import FourZeroFourNotFound from './components/404NotFound';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import LayoutLoadData from './pages/LayoutLoadData';

const CLIENT_ID_SESSION_KEY = 'tmc-ui.client-id';
const CLIENT_SECRET_SESSION_KEY = 'tmc-ui.client-secret';
const CREDENTIALS_SUBMITTED_SESSION_KEY = 'tmc-ui.credentials-submitted';

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

function AppShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function AppShellError() {
  return (
    <>
      <Navbar />
      <FourZeroFourNotFound error={'Settings not defined'} />
    </>
  );
}

interface AuthenticatedRouterProps {
  readonly router: ReturnType<typeof createHashRouter>;
  readonly onAuthenticationError: () => void;
}

function AuthenticatedRouter({ router, onAuthenticationError }: AuthenticatedRouterProps) {
  const { error, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || !error) {
      return;
    }

    onAuthenticationError();
  }, [error, isLoading, onAuthenticationError]);

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

function App() {
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

  const tokenUrl = (import.meta.env.VITE_TOKEN_URL ?? '') as string;
  const credentialsReady =
    credentialsSubmitted && clientId.trim().length > 0 && clientSecret.trim().length > 0;
  const shouldPromptForCredentials =
    __DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && Boolean(tokenUrl) && !credentialsReady;
  const authIsEnabled = Boolean(tokenUrl) && !shouldPromptForCredentials;

  const handleClientIdChange = useCallback((value: string) => {
    setStoredSessionValue(CLIENT_ID_SESSION_KEY, value);
    setStoredCredentialsSubmitted(false);
    setCredentialsSubmitted(false);
    setClientId(value);
  }, []);

  const handleClientSecretChange = useCallback((value: string) => {
    setStoredSessionValue(CLIENT_SECRET_SESSION_KEY, value);
    setStoredCredentialsSubmitted(false);
    setCredentialsSubmitted(false);
    setClientSecret(value);
  }, []);

  const handleCredentialsSubmit = useCallback(() => {
    setStoredCredentialsSubmitted(true);
    setCredentialsSubmitted(true);
  }, []);

  const handleAuthenticationError = useCallback(() => {
    clearStoredCredentialsSession();
    setClientId('');
    setClientSecret('');
    setCredentialsSubmitted(false);
  }, []);

  const router = useMemo(
    () =>
      createHashRouter(
        [
          {
            element: <AppShell />,
            errorElement: <AppShellError />,
            children: shouldPromptForCredentials
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
      handleCredentialsSubmit,
      shouldPromptForCredentials,
    ],
  );

  if (shouldPromptForCredentials) {
    return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
  }

  return (
    <AuthProvider
      tokenUrl={tokenUrl}
      clientId={clientId}
      clientSecret={clientSecret}
      enabled={authIsEnabled}
    >
      <AuthenticatedRouter router={router} onAuthenticationError={handleAuthenticationError} />
    </AuthProvider>
  );
}

export default App;
