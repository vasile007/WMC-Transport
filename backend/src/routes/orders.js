import express from "express";
import {
  createOrder,
  listOrders,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = express.Router();

/**
 * ============================================================
 * 📦 ORDERS ROUTES
 * ============================================================
 */

// 🧍‍♂️ Client / Admin — creează comandă nouă
router.post(
  "/",
  authRequired,
  requireRoles("client", "admin"),
  createOrder
);


// 👀 Oricine logat — listează comenzile potrivite rolului
router.get("/", authRequired, listOrders);

// 🔄 Client / Driver / Admin — actualizează statusul propriu
router.patch("/:id", authRequired, updateOrder);

// ✅ Admin — marchează ca livrat / anulat
router.patch(
  "/:id/status",
  authRequired,
  requireRoles("admin", "operator"),
  updateOrderStatus
);

// 🗑️ Admin — șterge complet o comandă
router.delete("/:id", authRequired, requireRoles("admin", "operator"), deleteOrder);

export default router;



