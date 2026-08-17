import { useCallback, useEffect, useMemo, useState } from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import CredentialsPrompt from './components/SetupCredentials';
import Loader from './components/base/Loader';
import Details from './pages/Details';
import AppError from './components/AppError';
import { AuthProvider } from './context/AuthContext';
import LayoutLoadData from './pages/LayoutLoadData';
import Settings from './pages/Settings';
import {
  requestClientCredentialsToken,
  type RequestClientCredentialsTokenResult,
} from './services/auth';
import {
  getStoredSessionValue,
  setStoredSessionValue,
  getStoredCredentialsSubmitted,
  setStoredCredentialsSubmitted,
  clearStoredCredentialsSession,
} from './utils/utils';
import { CLIENT_ID_SESSION_KEY, CLIENT_SECRET_SESSION_KEY } from './utils/constants';

const AppShell: React.FC<{ isServerDeployment: boolean }> = ({ isServerDeployment }) => {
  return (
    <>
      <Navbar isServerDeployment={isServerDeployment} />
      <Outlet />
    </>
  );
};

const AppShellError: React.FC<{
  codeError: number;
  titleError: string;
  descriptionError?: string;
  isServerDeployment: boolean;
}> = ({ codeError, titleError, descriptionError, isServerDeployment }) => {
  return (
    <>
      <Navbar isServerDeployment={isServerDeployment} />
      <AppError codeError={codeError} titleError={titleError} descriptionError={descriptionError} />
    </>
  );
};

const App: React.FC = () => {
  const [clientId, setClientId] = useState<string>(() =>
    getStoredSessionValue(CLIENT_ID_SESSION_KEY),
  );
  const [clientSecret, setClientSecret] = useState<string>(() =>
    getStoredSessionValue(CLIENT_SECRET_SESSION_KEY),
  );
  const [credentialsSubmitted, setCredentialsSubmitted] = useState<boolean>(() =>
    getStoredCredentialsSubmitted(),
  );
  const [seedToken, setSeedToken] = useState<RequestClientCredentialsTokenResult | null>(null);

  const [startupError, setStartupError] = useState<string | null>(null);
  const [isValidatingStartupCredentials, setIsValidatingStartupCredentials] =
    useState<boolean>(false);

  const tokenUrl = (import.meta.env.VITE_TOKEN_URL ?? '') as string;
  const serverUrl = (import.meta.env.VITE_SERVER_URL ?? '') as string;

  const isServerDeployment = __DEPLOY_TYPE__ === 'SERVER_AVAILABLE';

  const hasServerUrl = serverUrl.trim().length > 0;
  const hasTokenUrl = tokenUrl.trim().length > 0;

  const authConfigured = isServerDeployment && hasServerUrl && hasTokenUrl;

  const missingRequiredEnvConfig = isServerDeployment && !hasServerUrl;

  const credentialsReady =
    credentialsSubmitted && clientId.trim().length > 0 && clientSecret.trim().length > 0;

  const showSetupCredentials = authConfigured && !credentialsReady;

  const shouldValidateStoredCredentials = authConfigured && credentialsReady && seedToken === null;

  const authIsEnabled = authConfigured && !showSetupCredentials && !shouldValidateStoredCredentials;

  if (__DEBUG__) {
    console.warn('Vite globals', {
      api_base: __API_BASE__,
      catalog_url: __CATALOG_REPO_URL__,
      debug: __DEBUG__,
      server_available: __DEPLOY_SERVER_AVAILABLE__,
      app_repo_url: __APP_REPO_URL__,
      catalog_repo_url: __CATALOG_REPO_URL__,
      deploy_type: __DEPLOY_TYPE__,
      authConfigured: authConfigured,
      authIsEnabled: authIsEnabled,
      showSetupCredentials: showSetupCredentials,
      shouldValidateStoredCredentials: shouldValidateStoredCredentials,
    });
  }

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
        missingRequiredEnvConfig
          ? [
              {
                path: '*',
                element: (
                  <AppShellError
                    titleError={'Environment not configured'}
                    descriptionError={
                      'Required deployment variables are missing. Please contact the deployment administrator to resolve this configuration issue.'
                    }
                    isServerDeployment={isServerDeployment}
                    codeError={401}
                  />
                ),
              },
            ]
          : [
              {
                element: <AppShell isServerDeployment={isServerDeployment} />,
                errorElement: (
                  <AppShellError
                    titleError={'Settings not found'}
                    codeError={401}
                    isServerDeployment={isServerDeployment}
                  />
                ),
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
                        errorElement: <AppError titleError={'Catalog not found'} codeError={404} />,
                      },
                      {
                        path: 'details/*',
                        element: <Details />,
                        errorElement: <AppError titleError={'Details not found'} codeError={404} />,
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
                        errorElement: (
                          <AppError titleError={'Settings not found'} codeError={404} />
                        ),
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
      missingRequiredEnvConfig,
      startupError,
      tokenUrl,
      showSetupCredentials,
      isServerDeployment,
    ],
  );

  if (showSetupCredentials) {
    return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
  }

  if (missingRequiredEnvConfig) {
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
