import express from "express";
import { authRequired, requireRoles } from "../middleware/auth.js";
import { listUsers, listDrivers, removeUser, adminResetPassword, updateEmail, updateProfile } from "../controllers/userController.js";

const router = express.Router();

// Staff: list users (optional ?role=driver/client/admin/operator)
router.get("/", authRequired, requireRoles("admin", "operator"), listUsers);

// Admin: list drivers only
router.get("/drivers", authRequired, requireRoles("admin", "operator"), listDrivers);

// Authenticated user: update email
router.patch('/email', authRequired, updateEmail);

// Authenticated user: update profile
router.patch('/profile', authRequired, updateProfile);

// Admin: reset user password
router.post("/:id/password", authRequired, requireRoles("admin", "operator"), adminResetPassword);

// Admin: delete user
router.delete("/:id", authRequired, requireRoles("admin", "operator"), removeUser);

export default router;
