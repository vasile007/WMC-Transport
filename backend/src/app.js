import "express-async-errors";
import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";

import { config } from "./config/config.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { stripeWebhook } from "./controllers/paymentController.js";

const app = express();

/**
 * ============================================================
 *  STRIPE WEBHOOKS (MUST BE FIRST – BEFORE ANY JSON PARSER)
 * ============================================================
 */
app.post(
  "/api/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

// Backward-compatible / alternate path
app.post(
  "/api/payments/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

/**
 * ============================================================
 *  GLOBAL MIDDLEWARES
 * ============================================================
 */
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));


const allowedOrigins = [
  "https://wmc-transport-5r0t69ach-vasile007s-projects.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
/**
 * ============================================================
 *  BASIC ROUTES (health check + root)
 * ============================================================
 */
app.get("/", (req, res) => {
  res.send("🚀 WMC TRANSPORT LTD API is running ✅");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/**
 * ============================================================
 *  SWAGGER / OPENAPI DOCS
 * ============================================================
 */
app.get("/openapi.yaml", (req, res) => {
  res.type("application/yaml");
  res.sendFile(path.resolve(process.cwd(), "openapi.yaml"));
});

app.get("/docs", (req, res) => {
  res.type("html").send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>WMC TRANSPORT LTD API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
      #swagger-ui { height: 100vh; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: 'BaseLayout',
      });
    </script>
  </body>
</html>`);
});

/**
 * ============================================================
 *  API ROUTES
 * ============================================================
 */
app.use("/api", routes);

/**
 * ============================================================
 *ERROR HANDLER (LAST)
 * ============================================================
 */
app.use(errorHandler);


export default app;
