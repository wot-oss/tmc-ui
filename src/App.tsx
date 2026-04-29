import { useCallback, useMemo, useState } from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CredentialsPrompt } from './components/CredentialsPrompt';
import Details from './pages/Details';
import FourZeroFourNotFound from './components/404NotFound';
import { AuthProvider } from './context/AuthContext';
import LayoutLoadData from './pages/LayoutLoadData';

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

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [credentialsSubmitted, setCredentialsSubmitted] = useState(false);

  const tokenUrl = (import.meta.env.VITE_TOKEN_URL ?? '') as string;
  const credentialsReady =
    credentialsSubmitted && clientId.trim().length > 0 && clientSecret.trim().length > 0;
  const shouldPromptForCredentials =
    __DEPLOY_TYPE__ === 'SERVER_AVAILABLE' && Boolean(tokenUrl) && !credentialsReady;
  const authIsEnabled = Boolean(tokenUrl) && !shouldPromptForCredentials;

  const handleClientIdChange = useCallback((value: string) => {
    setCredentialsSubmitted(false);
    setClientId(value);
  }, []);

  const handleClientSecretChange = useCallback((value: string) => {
    setCredentialsSubmitted(false);
    setClientSecret(value);
  }, []);

  const handleCredentialsSubmit = useCallback(() => {
    setCredentialsSubmitted(true);
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
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
}

export default App;
