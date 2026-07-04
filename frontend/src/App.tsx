import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

import { queryClient } from './lib/queryClient';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/shared/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import NewBusinessPage from './pages/dashboard/NewBusinessPage';
import BusinessReportsPage from './pages/report/BusinessReportsPage';
import ReportPage from './pages/report/ReportPage';
import SettingsPage from './pages/settings/SettingsPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Protected routes ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard"              element={<DashboardPage />} />
              <Route path="/new-business"           element={<NewBusinessPage />} />
              <Route path="/business/:id"           element={<BusinessReportsPage />} />
              <Route path="/reports/:reportId"      element={<ReportPage />} />
              <Route path="/settings"               element={<SettingsPage />} />
            </Route>
          </Route>

          {/* ── Fallbacks ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
