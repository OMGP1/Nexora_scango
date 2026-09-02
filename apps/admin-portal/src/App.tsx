import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { StoreConfigPage } from './pages/StoreConfigPage';
import { CatalogPage } from './pages/CatalogPage';
import { SystemHealthPage } from './pages/SystemHealthPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="config" element={<StoreConfigPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="health" element={<SystemHealthPage />} />
          <Route path="promotions" element={<div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>Promotions Manager coming in Phase 16</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
