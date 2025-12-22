import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { payments } from '../services/payments.js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../services/authContext.jsx';
import { orders as ordersApi } from '../services/orders.js';

function StripePayInner({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) {
      setError('Card element is not ready yet.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    const { error: err, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });
    console.log('confirmCardPayment:', {
      error: err?.message,
      status: paymentIntent?.status,
      id: paymentIntent?.id,
      clientSecret: clientSecret ? 'present' : 'missing',
    });
    setLoading(false);
    if (err) setError(err.message || 'Payment failed');
    else if (paymentIntent?.status === 'succeeded') {
      setSuccess('Payment succeeded. Your order is confirmed. An administrator has been notified and will assign a driver shortly.');
      onSuccess?.(paymentIntent);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <CardElement options={{ hidePostalCode: true }} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      {success && (
        <div className="pt-2 text-sm">
          <Link to="/client/orders" className="text-blue-700 hover:underline">View my orders</Link>
        </div>
      )}
      <button disabled={loading || !stripe} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Processing…' : 'Pay'}
      </button>
    </form>
  );
}

export default function Pay() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [provider, setProvider] = useState('stripe');
  const [clientSecret, setClientSecret] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const stripePromise = useMemo(() => {
    const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!pk) return null;
    const flag = import.meta.env.VITE_STRIPE_ADVANCED_FRAUD_SIGNALS;
    const advancedFraudSignals = typeof flag === 'string' ? flag === 'true' : import.meta.env.PROD;
    return loadStripe(pk, { advancedFraudSignals });
  }, []);
  const [redirecting, setRedirecting] = useState(false);
  const handlePaid = async (paymentIntent) => {
    setError('');
    setMessage('Payment completed. Syncing status...');
    try {
      if (token && paymentIntent?.id) {
        await payments.confirmStripe(token, {
          orderId: Number(orderId),
          paymentIntentId: paymentIntent.id,
        });
        const list = await ordersApi.list(token);
        const found = (list || []).find(o => String(o.id) === String(orderId));
        if (found) setOrder(found);
      }
      setMessage("Payment completed. Redirecting to dashboard...");
      setRedirecting(true);
      setTimeout(() => navigate("/client-dashboard"), 2000);
    } catch (e) {
      setError(e.message || 'Payment succeeded but could not update status yet.');
    }
  };

  const create = async () => {
    setError(''); setMessage(''); setClientSecret(null);
    if (!token) {
      navigate(`/login?redirect=/pay/${orderId}`);
      return;
    }
    if (order?.status === 'cancelled') {
      setError('This order was cancelled. Payment is disabled. Refunds process within 3 business days if already paid.');
      return;
    }
    if (order?.paymentStatus && order.paymentStatus.toLowerCase() === 'paid') {
      setMessage('Payment already completed for this order. Redirecting to dashboard...');
      setRedirecting(true);
      setTimeout(() => navigate("/client-dashboard"), 2000);
      return;
    }
    try {
      const res = await payments.create(token, { orderId: Number(orderId), provider });
      setClientSecret(res.clientSecret || null);
      if (provider !== 'stripe') setMessage('Mock/PayPal initiated. For mock, you may test via webhook manually.');
    } catch (e) { setError(e.message); }
  };

  // Auto-create a payment intent when arriving from a new order
  const fromNewOrder = useMemo(() => searchParams.get('new') === '1', [searchParams]);

  useEffect(() => {
    (async () => {
      if (!token) return;
      try {
        const list = await ordersApi.list(token);
        const found = (list || []).find(o => String(o.id) === String(orderId));
        setOrder(found || null);
        if (found?.status === 'cancelled') {
          setError('This order was cancelled. Payment is disabled. Refunds process within 3 business days if already paid.');
        }
      } catch {}
    })();
  }, [token, orderId]);

  useEffect(() => {
    if (!orderId) return;
    if (provider === 'stripe' && stripePromise && fromNewOrder && !clientSecret) {
      create();
    }
  }, [orderId, provider, stripePromise, fromNewOrder]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F3EE]">
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur border-b border-white/10">
        <div className="max-w-md mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/client-dashboard" className="text-[#D4AF37] hover:text-[#B98B2D] font-medium">Back to Dashboard</Link>
          <div className="text-sm text-[#B9B3A8]">
            {order?.referenceNumber ? `Ref ${order.referenceNumber}` : `Order #${orderId}`}
          </div>
        </div>
      </div>
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        <h1 className="text-xl font-semibold">Pay for order #{orderId}</h1>
        {order?.referenceNumber && (
          <div className="text-sm text-[#B9B3A8]">Reference: {order.referenceNumber}</div>
        )}
        {order?.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 text-[#B98B2D] px-3 py-2 rounded">
            This order was cancelled. Payment is disabled. If a payment was completed, the refund will be processed within 3 business days.
          </div>
        )}
        <div className="bg-white/5 p-4 rounded border border-white/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Provider</label>
            <select className="border rounded p-1" value={provider} onChange={e=>setProvider(e.target.value)} disabled={order?.status === 'cancelled'}>
              <option value="stripe">Stripe</option>
              <option value="mock">Mock</option>
              <option value="paypal">PayPal</option>
            </select>
            <button onClick={create} disabled={order?.status === 'cancelled'} className="ml-auto bg-gray-800 text-white px-3 py-1 rounded disabled:opacity-60">
              Create Payment
            </button>
          </div>
          {message && <div className="text-sm text-[#E3DED5]">{message}</div>}
          {redirecting && (
            <div className="text-sm text-[#B9B3A8] flex items-center gap-2">
              <span className="inline-block h-4 w-4 border-2 border-white/15 border-t-red-600 rounded-full animate-spin" />
              Redirecting to dashboard...
            </div>
          )}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {provider === 'stripe' && clientSecret && stripePromise && (
        <Elements stripe={stripePromise}>
          <StripePayInner clientSecret={clientSecret} onSuccess={handlePaid} />
        </Elements>
      )}
          {provider !== 'stripe' && clientSecret && (
            <div className="text-sm text-green-700">Payment created with id/secret: {clientSecret}</div>
          )}
        </div>
      </div>
      {/* Confirmation helper */}
      {!clientSecret && message && (
        <div className="text-sm text-[#E3DED5]">{message}</div>
      )}
    </div>
  );
}



