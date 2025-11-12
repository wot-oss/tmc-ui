import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Layout from './pages/Layout';
import Settings from './pages/Settings';
import { BrowserRouter } from 'react-router-dom';

const App = () => {
  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Layout />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
