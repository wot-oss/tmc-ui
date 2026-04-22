import React from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Details from './pages/Details';
import FourZeroFourNotFound from './components/404NotFound';
import { AuthProvider } from './context/AuthContext';
import LayoutLoadData from './pages/LayoutLoadData';

const router = createHashRouter(
  [
    {
      element: (
        <>
          <Navbar />
          <Outlet />
        </>
      ),
      errorElement: (
        <>
          <Navbar />
          <FourZeroFourNotFound error={'Settings not defined'} />
        </>
      ),
      children: [
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
);

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
  const authIsEnabled = Boolean(
    import.meta.env.VITE_TOKEN_URL &&
      import.meta.env.VITE_CLIENT_ID &&
      import.meta.env.VITE_CLIENT_SECRET,
  );

  return (
    <AuthProvider
      tokenUrl={(import.meta.env.VITE_TOKEN_URL ?? '') as string}
      clientId={(import.meta.env.VITE_CLIENT_ID ?? '') as string}
      clientSecret={(import.meta.env.VITE_CLIENT_SECRET ?? '') as string}
      enabled={authIsEnabled}
    >
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </AuthProvider>
  );
};
export default App;
