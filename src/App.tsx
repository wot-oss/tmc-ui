import React from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Layout from './pages/Layout';
import Details from './pages/Details';
import FourZeroFourNotFound from './components/404NotFound';
import { FilterProvider } from './context/FilterContext';

async function inventoryLoader() {
  if (!__API_BASE__) {
    throw new Response('Catalog URL not configured', { status: 400 });
  }

  const res = await fetch(`${__API_BASE__}/inventory`);

  if (!res.ok) {
    throw new Response('Failed to fetch inventory', { status: res.status });
  }

  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

const router = createHashRouter(
  [
    {
      element: (
        <>
          <Navbar />
          <Outlet />
        </>
      ),
      children: [
        {
          index: true,
          element: <Layout />,
          loader: inventoryLoader,
          errorElement: <FourZeroFourNotFound error={'Catalog not found'} />,
        },
        {
          path: 'details/*',
          element: <Details />,
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

const App = () => (
  <FilterProvider>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </FilterProvider>
);

export default App;
