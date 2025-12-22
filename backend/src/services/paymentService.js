import { config } from '../config/config.js';
import Stripe from 'stripe';
import paypal from 'paypal-rest-sdk';

/**
 * Initialize Stripe (SECRET KEY – backend only)
 */
const stripe = config.payments.stripeSecret
  ? new Stripe(config.payments.stripeSecret)
  : null;

/**
 * Initialize PayPal (optional)
 */
if (config.payments.paypalClientId && config.payments.paypalClientSecret) {
  paypal.configure({
    mode: config.env === 'production' ? 'live' : 'sandbox',
    client_id: config.payments.paypalClientId,
    client_secret: config.payments.paypalClientSecret,
  });
}

/**
 * Supported payment providers
 */
export const PaymentProviders = {
  MOCK: 'mock',
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
};

/**
 * PRICE CALCULATION (BACKEND ONLY)
 * NEVER crashes even if input is missing
 */
function calculateAmount(pricingInput = {}) {
  const {
    weightKg = 0,
    distanceKm = 0,
    service = 'standard',
  } = pricingInput;

  let amount = 0;

  amount += Number(weightKg) * 250;

  if (Number(distanceKm) > 100) {
    amount += 1500;
  }

  if (service === 'express') {
    amount += 2000;
  }

  if (amount < 100) {
    amount = 100;
  }

  return Math.round(amount);
}

/**
 * Create payment intent (SECURE)
 */
export async function createPaymentIntent({
  provider,
  currency = 'gbp',
  pricingInput,
  amount,
  metadata = {},
}) {
  const hasAmount = typeof amount !== 'undefined' && amount !== null;

  const resolvedAmount = hasAmount
    ? Math.round(Number(amount))
    : pricingInput
    ? calculateAmount(pricingInput)
    : null;

  if (
    resolvedAmount === null ||
    Number.isNaN(resolvedAmount) ||
    resolvedAmount <= 0
  ) {
    throw new Error('pricingInput or amount is required');
  }

  switch (provider) {
    /**
     * =====================
     * STRIPE
     * =====================
     */
    case PaymentProviders.STRIPE: {
      if (!stripe) {
        throw new Error('Stripe not configured');
      }

      if (!metadata.orderId) {
        throw new Error('orderId is required in metadata for Stripe payments');
      }

      const intent = await stripe.paymentIntents.create({
        amount: resolvedAmount,
        currency,
        metadata: {
          provider: 'stripe',
          orderId: String(metadata.orderId),
        },
        automatic_payment_methods: { enabled: true },
      });

      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        raw: intent,
      };
    }

    /**
     * =====================
     * PAYPAL (basic stub)
     * =====================
     */
    case PaymentProviders.PAYPAL: {
      return new Promise((resolve, reject) => {
        const createPaymentJson = {
          intent: 'sale',
          payer: { payment_method: 'paypal' },
          transactions: [
            {
              amount: {
                currency,
                total: (resolvedAmount / 100).toFixed(2),
              },
            },
          ],
          redirect_urls: {
            return_url: 'https://example.com/return',
            cancel_url: 'https://example.com/cancel',
          },
        };

        paypal.payment.create(createPaymentJson, (error, payment) => {
          if (error) return reject(error);
          resolve({ id: payment.id, raw: payment });
        });
      });
    }

    /**
     * =====================
     * MOCK (development)
     * =====================
     */
    case PaymentProviders.MOCK:
    default:
      return {
        id: `mock_${Date.now()}`,
        clientSecret: 'mock_secret',
        raw: { provider: 'mock', amount: resolvedAmount },
      };
  }
}

