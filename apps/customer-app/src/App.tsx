import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { CartProvider } from './contexts/CartContext';
import { EntryPage } from './pages/EntryPage';
import { LoginPage } from './pages/LoginPage';
import { ScanPage } from './pages/ScanPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ExitScalePage } from './pages/ExitScalePage';
import { ReceiptPage } from './pages/ReceiptPage';
import { VerificationPage } from './pages/VerificationPage';
import { PurchaseHistoryPage } from './pages/PurchaseHistoryPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationBanner } from './components/NotificationBanner';
import { Spinner } from '@scango/ui';
import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <NotificationProvider>
          <CartProvider>
            <NotificationBanner />
            <Routes>
              <Route path="/" element={<EntryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/exit-scale" element={<ProtectedRoute><ExitScalePage /></ProtectedRoute>} />
              <Route path="/receipt" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
              <Route path="/receipt/:id" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><PurchaseHistoryPage /></ProtectedRoute>} />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
