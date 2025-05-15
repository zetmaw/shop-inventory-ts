import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/login';
import AdminPage from './pages/admin';
import InventoryPage from './pages/InventoryPage';
import Redirector from './pages/Redirector';
import AuthGuard from './components/AuthGuard';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Redirector />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminPage />
            </AuthGuard>
          }
        />
        <Route
          path="/inventory"
          element={
            <AuthGuard>
              <InventoryPage />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
