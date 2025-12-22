import { Payment, Order } from "../models/index.js";
import { createPaymentIntent, PaymentProviders } from "../services/paymentService.js";
import { config } from "../config/config.js";
import Stripe from "stripe";

/**
 * ============================================================
 * CREATE PAYMENT
 * ============================================================
 */
export async function createPayment(req, res) {
  try {
    const { orderId, provider = "mock" } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Access control
    if (req.user.role === "client" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const amount = Math.round(Number(order.price || 0) * 100);
    const currency = config.payments.currency || "gbp";

    // IMPORTANT: metadata MUST contain orderId AS STRING
    const intent = await createPaymentIntent({
      provider,
      amount,
      currency,
      metadata: {
        orderId: String(order.id),
        userId: String(req.user.id),
      },
    });

    const isMock = provider === PaymentProviders.MOCK || provider === "mock";

    const payment = await Payment.create({
      orderId: order.id,
      provider,
      amount,
      currency,
      status: isMock ? "succeeded" : "pending",
      providerPaymentId: intent.id,
      raw: intent.raw || null,
    });

    if (isMock) {
      order.paymentStatus = "paid";
      await order.save();
    }

    return res.status(201).json({
      payment,
      clientSecret: intent.clientSecret,
    });
  } catch (err) {
    console.error("Create Payment Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================================================
 * GENERIC WEBHOOK (MOCK / PAYPAL)
 * ============================================================
 */
export async function webhook(req, res) {
  try {
    const { providerPaymentId, status } = req.body;

    if (!providerPaymentId || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const payment = await Payment.findOne({
      where: { providerPaymentId },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = status;
    await payment.save();

    const order = await Order.findByPk(payment.orderId);
    if (order) {
      order.paymentStatus = status === "succeeded" ? "paid" : "failed";
      await order.save();
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================================================
 * STRIPE CONFIRM (SERVER-SIDE VERIFY)
 * ============================================================
 */
export async function confirmStripePayment(req, res) {
  try {
    const { orderId, paymentIntentId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ error: "Missing orderId" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (req.user.role === "client" && order.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const key = config.payments.stripeSecret;
    if (!key) {
      return res.status(500).json({ error: "Stripe not configured" });
    }

    const payment = await Payment.findOne({
      where: { orderId, provider: "stripe" },
      order: [["id", "DESC"]],
    });

    const intentId = paymentIntentId || payment?.providerPaymentId;
    if (!intentId) {
      return res.status(400).json({ error: "Missing payment intent id" });
    }

    const stripe = new Stripe(key);
    const intent = await stripe.paymentIntents.retrieve(intentId);

    if (intent?.metadata?.orderId && String(intent.metadata.orderId) !== String(orderId)) {
      return res.status(400).json({ error: "Order mismatch for payment intent" });
    }

    if (!intent || !intent.status) {
      return res.status(400).json({ error: "Unable to retrieve payment intent" });
    }

    if (intent.status !== "succeeded") {
      return res.status(400).json({ error: `Payment not succeeded: ${intent.status}` });
    }

    if (payment) {
      payment.status = "succeeded";
      payment.raw = intent;
      await payment.save();
    } else {
      await Payment.create({
        orderId: order.id,
        provider: "stripe",
        amount: intent.amount,
        currency: intent.currency,
        status: "succeeded",
        providerPaymentId: intent.id,
        raw: intent,
      });
    }

    order.paymentStatus = "paid";
    await order.save();

    return res.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error("Confirm Stripe Payment Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ============================================================
 * STRIPE WEBHOOK (SIGNATURE VERIFIED)
 * ============================================================
 */
export async function stripeWebhook(req, res) {
  const secret = config.payments.stripeWebhookSecret;
  const key = config.payments.stripeSecret;

  if (!secret || !key) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const stripe = new Stripe(key);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  console.log("[Stripe Webhook] Received event:", event.type);

  if (
    event.type === "payment_intent.succeeded" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const intent = event.data.object;
    const status =
      event.type === "payment_intent.succeeded" ? "succeeded" : "failed";

    const orderId = intent?.metadata?.orderId;

    console.log(
      "[Stripe Webhook] intent",
      intent.id,
      "status",
      status,
      "orderId",
      orderId
    );

    // Update or create payment
    let payment = await Payment.findOne({
      where: { providerPaymentId: intent.id },
    });

    if (!payment && orderId) {
      payment = await Payment.create({
        orderId: Number(orderId),
        provider: "stripe",
        amount: intent.amount,
        currency: intent.currency,
        status,
        providerPaymentId: intent.id,
        raw: intent,
      });
    } else if (payment) {
      payment.status = status;
      await payment.save();
    }

    if (!orderId) {
      console.warn(
        "Stripe webhook missing orderId metadata for intent",
        intent.id
      );
    } else {
      const order = await Order.findByPk(orderId);
      if (order) {
        order.paymentStatus = status === "succeeded" ? "paid" : "failed";
        await order.save();
        console.log(
          "[Stripe Webhook] Order updated",
          orderId,
          "->",
          order.paymentStatus
        );
      } else {
        console.warn("Stripe webhook order not found:", orderId);
      }
    }
  }

  return res.json({ received: true });
}
