import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SessionsListPage } from './pages/SessionsListPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';
import { InventoryPage } from './pages/InventoryPage';
import { ScanAndVerifyPage } from './pages/ScanAndVerifyPage';

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="sessions" element={<SessionsListPage />} />
            <Route path="verification-queue" element={<VerificationQueuePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="scan-verify" element={<ScanAndVerifyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
