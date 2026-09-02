import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { CartProvider } from './contexts/CartContext';
import { EntryPage } from './pages/EntryPage';
import { ScanPage } from './pages/ScanPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { VerificationPage } from './pages/VerificationPage';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationBanner } from './components/NotificationBanner';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <NotificationProvider>
          <CartProvider>
            <NotificationBanner />
            <Routes>
              <Route path="/" element={<EntryPage />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/receipt" element={<ReceiptPage />} />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;
