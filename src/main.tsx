import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './pages/login';
import AdminPage from './pages/admin';
import InventoryPage from './pages/InventoryPage';
import Redirector from './pages/Redirector';
import AuthGuard from './components/AuthGuard';
import { Navbar } from './components/Navbar';
import { GuitarSpecManager } from './components/GuitarSpecManager';
import { BuildPlanner } from './components/BuildPlanner';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="p-4">{children}</div>
    </>
  );
}

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
              <AppLayout>
                <AdminPage />
              </AppLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/inventory"
          element={
            <AuthGuard>
              <AppLayout>
                <InventoryPage />
              </AppLayout>
            </AuthGuard>
          }
        />
       <Route
  path="/planner"
  element={
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          <GuitarSpecManager />
          <BuildPlanner />
        </div>
      </AppLayout>
    </AuthGuard>
  }
/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);