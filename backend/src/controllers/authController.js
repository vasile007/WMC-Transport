import { User } from "../models/index.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";
import { sendEmail } from "../services/email.js";

// ✅ Client self-register
export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role: "client" });
  const token = signToken({ id: user.id, role: user.role });
  res.status(201).json({ user, token });
}

// ✅ Login (verifică mustReset)
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, role: user.role });
  res.json({ user, token, mustReset: user.mustReset });
}

// ✅ Admin create user (driver or client)
export async function adminCreateUser(req, res) {
  const { name, email, role } = req.body;
  const safeRole = ["driver", "operator"].includes(role) ? role : "driver";

  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ error: "Email already exists" });

  const tempPass = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(tempPass);
  const user = await User.create({ name, email, passwordHash, role: safeRole, mustReset: true });

  await sendEmail(
    email,
    "Your WMC TRANSPORT LTD Account",
    `Welcome ${name},\n\nYou’ve been added as a ${safeRole}.\nEmail: ${email}\nTemporary password: ${tempPass}\nPlease change it at first login.\n\n- WMC TRANSPORT LTD Team`
  );

  const payload = { ok: true, user };
  try {
    if ((process.env.NODE_ENV || 'development') !== 'production') {
      payload.tempPassword = tempPass;
    }
  } catch {}
  res.status(201).json(payload);
}

// ✅ Reset password (for mustReset users)
export async function resetPassword(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const passwordHash = await hashPassword(password);
  user.passwordHash = passwordHash;
  user.mustReset = false;
  await user.save();

  res.json({ ok: true, message: "Password updated" });
}
