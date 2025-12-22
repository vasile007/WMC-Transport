import pkg from "sequelize";
const { Op } = pkg;
import { Order, User } from "../models/index.js";
import { getIO } from "../sockets/bus.js";
import { calculateQuote } from "../services/pricingService.js";
import { sendEmail } from "../services/email.js";

async function notifyCancellation(order) {
  try {
    const client = await User.findByPk(order.userId);
    if (!client?.email) return;
    const subject = `Your order #${order.id} has been cancelled`;
    const text = `Hello ${client.name || "customer"},\n\nYour order #${order.id} was cancelled by our team. If you completed a payment, the refund will be processed within 3 business days.\n\nIf you have questions, please reply to this email.\n\nThank you,\nWMC TRANSPORT LTD`;
    await sendEmail(client.email, subject, text);
  } catch (err) {
    console.warn("Failed to send cancellation email", err?.message || err);
  }
}

/**
 * ============================================================
 * 📦 CREATE ORDER (CLIENT)
 * ============================================================
 */
export async function createOrder(req, res) {
  try {
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      price,
      serviceType,
    } = req.body;

    if (!pickupAddress || !dropoffAddress) {
      return res
        .status(400)
        .json({ error: "Pickup and dropoff addresses are required." });
    }

    let finalPrice = price ?? null;

    if (finalPrice === null) {
      try {
        const quote = await calculateQuote({
          pickupAddress,
          pickupLat,
          pickupLng,
          dropoffAddress,
          dropoffLat,
          dropoffLng,
          serviceType,
        });
        finalPrice = quote.totalPrice;
      } catch (pricingErr) {
        console.error("ƒ?O Auto-pricing error:", pricingErr);
        return res.status(400).json({
          error:
            pricingErr.message === "Missing Google Maps API key"
              ? "Unable to calculate price: missing Google Maps API key."
              : "Unable to calculate price for the provided addresses.",
        });
      }
    }

    const normalizedPrice =
      finalPrice === null ? null : Number.parseFloat(finalPrice);
    if (normalizedPrice !== null && Number.isNaN(normalizedPrice)) {
      return res.status(400).json({ error: "Invalid price value." });
    }

    const order = await Order.create({
      pickupAddress: pickupAddress.trim(),
      pickupLat,
      pickupLng,
      dropoffAddress: dropoffAddress.trim(),
      dropoffLat,
      dropoffLng,
      price: normalizedPrice,
      userId: req.user?.id || req.body.userId,


      status: "pending",
      paymentStatus: "pending",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("❌ Create order error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * ============================================================
 * 📋 LIST ORDERS
 * ============================================================
 */
export async function listOrders(req, res) {
  try {
    const { status } = req.query;
    const where = {};

    if (status) where.status = status;
    if (req.user.role === "client") where.userId = req.user.id;
    if (req.user.role === "driver") where.driverId = req.user.id;

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: "client", attributes: ["id", "name", "email", "phone"] },
        { model: User, as: "driver", attributes: ["id", "name", "email", "phone"] },
      ],
      order: [["id", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error("❌ List orders error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * ============================================================
 * 🔄 UPDATE ORDER
 * ============================================================
 */
export async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    /**
     * 🧍 CLIENT LOGIC
     */
    if (req.user.role === "client") {
      if (order.userId !== req.user.id)
        return res
          .status(403)
          .json({ error: "You are not authorized to modify this order." });

      if (
        status === "cancelled" &&
        order.status === "pending" &&
        !order.driverId
      ) {
        order.status = "cancelled";
        await order.save();
        return res.json({
          message: "Order cancelled successfully.",
          order,
        });
      }

      return res.status(403).json({
        error:
          "You can only cancel pending orders that have not yet been assigned to a driver.",
      });
    }

    /**
     * 🚚 DRIVER LOGIC
     */
    if (req.user.role === "driver") {
      if (order.driverId !== req.user.id)
        return res
          .status(403)
          .json({ error: "This order is not assigned to you." });

      const transitions = {
        pending: "assigned", // allow driver to accept a pending job assigned to them
        assigned: "picked_up",
        picked_up: "in_transit",
        in_transit: "delivered",
      };

      if (transitions[order.status] !== status) {
        return res.status(400).json({
          error: `Invalid transition: cannot move from "${order.status}" to "${status}".`,
        });
      }

      order.status = status;
      await order.save();
      if (status === "delivered") {
        const io = getIO();
        io?.to("staff").emit("order:delivered", {
          orderId: order.id,
          referenceNumber: order.referenceNumber,
          driverId: order.driverId,
          clientId: order.userId,
        });
      }
      return res.json({
        message: "Order status updated successfully.",
        order,
      });
    }

    /**
     * 👨‍💼 ADMIN LOGIC
     */
    if (["admin", "operator"].includes(req.user.role)) {
      if (status === "delivered") {
        return res
          .status(403)
          .json({ error: "Only drivers can mark orders as delivered." });
      }
      if (typeof driverId !== "undefined") {
        order.driverId = driverId || null;
        if (driverId && order.status === "pending") {
          order.status = "assigned";
        }
      }

      const validStatuses = ["pending", "assigned", "picked_up", "in_transit", "cancelled"];

      if (status && validStatuses.includes(status)) {
        // 🚫 Protejăm comenzile livrate sau anulate
        if (order.status === "cancelled") {
          return res
            .status(400)
            .json({ error: "Cannot modify a cancelled order." });
        }

        if (order.status === "delivered") {
          return res
            .status(400)
            .json({ error: "Cannot modify a delivered order." });
        }

        // ✅ Permitem doar tranziții logice
        const allowedTransitions = {
          pending: ["assigned", "cancelled"],
          assigned: ["picked_up", "cancelled"],
          picked_up: ["in_transit", "cancelled"],
          in_transit: ["cancelled"],
        };

        const current = order.status;
        const allowed = allowedTransitions[current] || [];

        if (!allowed.includes(status)) {
          return res.status(400).json({
            error: `Invalid transition from "${current}" to "${status}".`,
          });
        }

        order.status = status;
        if (status === "cancelled") {
          await notifyCancellation(order);
        }
      }

      await order.save();
      return res.json({
        message: "Order updated successfully by admin.",
        order,
      });
    }

    return res.status(403).json({ error: "Unauthorized role." });
  } catch (err) {
    console.error("❌ Update order error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * ============================================================
 * ✅ COMPLETE / CANCEL / DELETE ORDER (ADMIN)
 * ============================================================
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (!["cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    order.status = status;
    if (status === "cancelled") {
      await notifyCancellation(order);
    }
    await order.save();

    res.json({ message: `Order marked as ${status}.`, order });
  } catch (err) {
    console.error("❌ Update order status error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * ============================================================
 * 🗑️ DELETE ORDER (ADMIN)
 * ============================================================
 */
export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const io = getIO();
    const payload = {
      orderId: order.id,
      referenceNumber: order.referenceNumber,
      userId: order.userId,
      paymentStatus: order.paymentStatus,
    };

    await order.destroy();
    io?.to(`user:${payload.userId}`).emit("order:deleted", payload);
    res.json({ message: "Order deleted successfully." });
  } catch (err) {
    console.error("??O Delete order error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
}
