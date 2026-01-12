import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// 🧩 1️⃣ Asigurăm că fișierul .env este încărcat din folderul backend
// ============================================================
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

// ✅ Debug — vezi ce se încarcă (poți șterge după ce merge)
///console.log("✅ ENV file path:", envPath);
///console.log("✅ JWT_SECRET loaded:", process.env.JWT_SECRET);
///console.log("DB_DIALECT from .env:", process.env.DB_DIALECT);

// ============================================================
// ⚙️ 2️⃣ Config general
// ============================================================
const dbDialect = (process.env.DB_DIALECT || "sqlite").toLowerCase();

const config = {
  // 🌍 Environment
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),

  // 🔐 JWT
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  // 💳 Payments
  payments: {
    stripeSecret: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
    currency: process.env.CURRENCY || "gbp",
  },

  // 🗄️ Database
  db: {
    dialect: dbDialect,
    ...(dbDialect === "sqlite"
      ? {
          storage: process.env.DB_STORAGE || "data/quikmove.sqlite",
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(
            process.env.DB_PORT ||
              (dbDialect === "mysql" ? "3306" : "5432"),
            10
          ),
          database: process.env.DB_NAME || "quikmove",
          username:
            process.env.DB_USER ||
            (dbDialect === "mysql" ? "root" : "postgres"),
          password: process.env.DB_PASS || "",
        }),
    logging: false,
  },
};

export { config };






