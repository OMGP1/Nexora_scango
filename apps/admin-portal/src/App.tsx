import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StoreConfigPage } from './pages/StoreConfigPage';
import { CatalogPage } from './pages/CatalogPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { InventoryPage } from './pages/InventoryPage';

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
            <Route path="config" element={<StoreConfigPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="health" element={<SystemHealthPage />} />
            <Route path="promotions" element={<div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Promotions Manager coming in Phase 16</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
