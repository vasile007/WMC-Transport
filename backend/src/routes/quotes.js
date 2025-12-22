import express from "express";
import { getQuote } from "../controllers/quoteController.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authRequired, getQuote);

export default router;
