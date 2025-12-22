import express from "express";
import { authRequired } from "../middleware/auth.js";
import {
  confirmStripePayment,
  createPayment,
  webhook,
} from "../controllers/paymentController.js";

const router = express.Router();

/**
 * ============================================================
 * ÐY'ü PAYMENTS ROUTES
 * ============================================================
 */

// Clientul creeazŽŸ un PaymentIntent (Stripe, Mock, etc.)
router.post("/", authRequired, createPayment);

// Stripe confirm (server-side verify after client success)
router.post("/confirm/stripe", authRequired, confirmStripePayment);

// Webhook generic pentru test / mock payments
router.post("/webhook", webhook);

export default router;
