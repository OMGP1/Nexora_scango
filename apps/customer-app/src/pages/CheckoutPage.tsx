import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentIntent, simulateWebhook } from '../services/api/payment';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, Lock, Smartphone, Banknote, ArrowRight, Clock, Copy, Check } from 'lucide-react';
import { Button, Card, PageHeader, Spinner, Input } from '@scango/ui';

type PaymentMethod = 'upi' | 'card' | 'counter';

export const CheckoutPage: React.FC = () => {
  const { sessionId } = useSession();
  const { billSummary } = useCart();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [intent, setIntent] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    if (!sessionId || !billSummary || billSummary.grand_total === 0) {
      navigate('/cart');
    }
  }, [sessionId, billSummary, navigate]);

  const handleSelectMethod = async (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError('');
    setIntent(null);
    setLoading(true);
    try {
      const res = await createPaymentIntent(sessionId!, method, userProfile?.uid);
      setIntent(res.data);
    } catch (err: any) {
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!intent) return;
    setLoading(true);
    setError('');
    try {
      // In test mode, simulate the webhook callback
      await simulateWebhook(intent.gateway_ref || intent.payment_id);
      navigate('/receipt');
    } catch (_err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  const handleCopyOtp = () => {
    if (intent?.otp) {
      navigator.clipboard.writeText(intent.otp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const methodOptions = [
    { id: 'upi' as PaymentMethod, label: 'UPI', sublabel: 'GPay, PhonePe, Paytm', icon: Smartphone },
    { id: 'card' as PaymentMethod, label: 'Credit / Debit Card', sublabel: 'Visa, Mastercard, RuPay', icon: CreditCard },
    { id: 'counter' as PaymentMethod, label: 'Pay at Counter', sublabel: 'Show OTP/QR to cashier', icon: Banknote },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <PageHeader title="Checkout" onBack={() => navigate('/cart')} />

      <main style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
        {/* Amount card */}
        <Card padding="lg" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)', fontWeight: 500 }}>
            Amount to Pay
          </p>
          <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, margin: 0, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>
            ₹{billSummary?.grand_total}
          </h2>
        </Card>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Payment method selection */}
        {!selectedMethod && (
          <Card padding="lg">
            <h3 style={{ margin: '0 0 20px 0', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>
              Select Payment Method
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {methodOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectMethod(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '16px', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    width: '100%', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-card)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <opt.icon size={22} style={{ color: 'var(--color-text)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>{opt.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{opt.sublabel}</p>
                  </div>
                  <ArrowRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Loading state */}
        {selectedMethod && loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner size={32} />
          </div>
        )}

        {/* UPI Payment */}
        {selectedMethod === 'upi' && intent && !loading && (
          <Card padding="lg">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>
              <Smartphone size={20} /> Pay with UPI
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <Input label="UPI ID" placeholder="yourname@upi" />
            </div>
            <Button onClick={handlePayOnline} disabled={loading} fullWidth size="lg">
              <Lock size={16} /> Pay ₹{billSummary?.grand_total}
            </Button>
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '12px' }}>
              Razorpay Test Mode
            </p>
            <button onClick={() => { setSelectedMethod(null); setIntent(null); }} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500 }}>
              ← Change payment method
            </button>
          </Card>
        )}

        {/* Card Payment */}
        {selectedMethod === 'card' && intent && !loading && (
          <Card padding="lg">
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>
              <CreditCard size={20} /> Card Payment
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); handlePayOnline(); }}>
              <div style={{ marginBottom: '16px' }}>
                <Input label="Card Number" defaultValue="4242 4242 4242 4242" readOnly style={{ fontFamily: 'var(--font-family-mono)' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                <Input label="Expiry" defaultValue="12/26" readOnly />
                <Input label="CVC" defaultValue="123" readOnly style={{ fontFamily: 'var(--font-family-mono)' }} />
              </div>
              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? (
                  <><Spinner size={18} color="var(--color-text-inverse)" /> Processing...</>
                ) : (
                  <><Lock size={16} /> Pay ₹{billSummary?.grand_total}</>
                )}
              </Button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '12px' }}>
              Razorpay Test Mode
            </p>
            <button onClick={() => { setSelectedMethod(null); setIntent(null); }} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500 }}>
              ← Change payment method
            </button>
          </Card>
        )}

        {/* Pay at Counter */}
        {selectedMethod === 'counter' && intent && !loading && (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text)' }}>
              <Banknote size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              Pay at Counter
            </h3>
            <p style={{ color: 'var(--color-text-muted)', margin: '0 0 24px 0', fontSize: 'var(--font-size-sm)' }}>
              Show this OTP or QR code to the cashier
            </p>

            {/* OTP Display */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              backgroundColor: 'var(--color-bg)', padding: '16px 24px',
              borderRadius: 'var(--radius-lg)', marginBottom: '20px',
            }}>
              <span style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 700, letterSpacing: '0.3em', fontFamily: 'var(--font-family-mono)', color: 'var(--color-text)' }}>
                {intent.otp}
              </span>
              <button
                onClick={handleCopyOtp}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-muted)' }}
              >
                {copiedOtp ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <Copy size={18} />}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>or scan</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border-light)' }} />
            </div>

            {/* QR Code */}
            <div style={{ display: 'inline-block', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-lg)' }}>
              <QRCodeSVG value={JSON.stringify({ session_id: sessionId, otp: intent.otp })} size={180} level="H" />
            </div>

            {/* Expiry warning */}
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)', marginTop: '20px', fontWeight: 500 }}>
              <Clock size={14} /> Expires in 30 minutes
            </p>

            <button onClick={() => { setSelectedMethod(null); setIntent(null); }} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', fontWeight: 500 }}>
              ← Change payment method
            </button>
          </Card>
        )}
      </main>
    </div>
  );
};
