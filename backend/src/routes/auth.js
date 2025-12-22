import express from "express";
import {
  login,
  register,
  adminCreateUser,
  resetPassword,
} from "../controllers/authController.js";
import { authRequired, requireRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/admin/create-user", authRequired, requireRoles("admin", "operator"), adminCreateUser);

export default router;


