import express from "express";
import authRoutes from "./auth.js";
import orderRoutes from "./orders.js";
import paymentRoutes from "./payments.js";
import userRoutes from "./users.js";
import quoteRoutes from "./quotes.js";

const router = express.Router();

/**
 * ============================================================
 * 🚀 MAIN API ROUTES — prefixate cu /api/ în app.js
 * ============================================================
 */

// 🔐 Autentificare (register / login)
router.use("/auth", authRoutes);

// 📦 Comenzi (creare, listare, update, delete)
router.use("/orders", orderRoutes);


router.use("/quotes", quoteRoutes);

// 💳 Plăți (Stripe, webhook)
router.use("/payments", paymentRoutes);

// 👨‍💼 Utilizatori (doar admin)
router.use("/users", userRoutes);

// Authenticated: change password
import { authRequired } from "../middleware/auth.js";
import { changePassword } from "../controllers/userController.js";
router.post('/change-password', authRequired, changePassword);



export default router;


