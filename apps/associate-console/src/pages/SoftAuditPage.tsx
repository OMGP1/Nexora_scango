import { useState, useEffect } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, CheckCircle, AlertTriangle, ChevronLeft, ShoppingCart, ListChecks } from 'lucide-react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface SessionDetails {
  sessionId: string;
  riskTier: number;
  status: string;
  totalAmount: number;
  cart: CartItem[];
}

export function SoftAuditPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        // Assume API gateway is set up or use full URL. Using typical relative path for React app.
        const response = await axios.get(`/api/v1/sessions/${sessionId}`);
        setSession(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch session details');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchSessionDetails();
  }, [sessionId]);

  const handleResolve = async (action: 'approve' | 'escalate') => {
    setActionLoading(true);
    try {
      await axios.post(`/api/v1/verification/${sessionId}/resolve`, {
        action,
        reason: action === 'escalate' ? 'Suspicious activity observed during soft audit' : undefined
      });
      navigate('/verification-queue');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve session');
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading audit details...</div>;
  }

  if (error || !session) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p>{error || 'Session not found'}</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soft Audit</h1>
          <p className="text-sm text-gray-500">Session ID: {session.sessionId}</p>
        </div>
        <div className="ml-auto">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${session.riskTier >= 3 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
            Tier {session.riskTier} Risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-blue-600" />
            Audit Checklist
          </h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" />
              <div>
                <p className="font-medium text-gray-900">Verify High-Value Items</p>
                <p className="text-sm text-gray-500">Check for 3 most expensive items in the cart</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" />
              <div>
                <p className="font-medium text-gray-900">Random Item Scan</p>
                <p className="text-sm text-gray-500">Physically verify 5 random items match the digital cart</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300" />
              <div>
                <p className="font-medium text-gray-900">Bag Check</p>
                <p className="text-sm text-gray-500">Ensure no un-scanned items are hidden in reusable bags</p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            Expected Cart ({session.cart.reduce((acc, item) => acc + item.quantity, 0)} items)
          </h2>
          <div className="flex-1 overflow-y-auto max-h-64 space-y-3">
            {session.cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="font-medium text-gray-600">Total Value</span>
            <span className="text-xl font-bold text-gray-900">${session.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={() => handleResolve('approve')}
          disabled={actionLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-5 h-5" />
          Mark Clear
        </button>
        <button
          onClick={() => handleResolve('escalate')}
          disabled={actionLoading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <ShieldAlert className="w-5 h-5" />
          Escalate to LP
        </button>
      </div>
    </div>
  );
}
