import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "replace-with-strong-secret";

// 🔑 Creează token
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// 🔍 Verifică token (opțional)
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}





