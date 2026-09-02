import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { SessionsListPage } from './pages/SessionsListPage';
import { VerificationQueuePage } from './pages/VerificationQueuePage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sessions" element={<SessionsListPage />} />
          <Route path="verification-queue" element={<VerificationQueuePage />} />
        </Route>
      </Routes>
    </Router>
  );
}
