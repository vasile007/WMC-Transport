import { User } from '../models/index.js';
import { comparePassword, hashPassword } from '../utils/hash.js';

export async function listUsers(req, res) {
  const { role } = req.query;
  const where = {};
  if (role) where.role = role;
  const users = await User.findAll({ where, attributes: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'], order: [['id', 'ASC']] });
  res.json(users);
}

export async function listDrivers(req, res) {
  const drivers = await User.findAll({ where: { role: "driver" } });
  res.json(drivers);
}

export async function removeUser(req, res) {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  await user.destroy();
  res.json({ ok: true, message: 'User deleted' });
}

export async function adminResetPassword(req, res) {
  const { id } = req.params;
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.passwordHash = await hashPassword(password);
  user.mustReset = false;
  await user.save();
  res.json({ ok: true, message: 'Password updated' });
}

// Authenticated: update own email (ensures uniqueness)
export async function updateEmail(req, res) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });
  const exists = await User.findOne({ where: { email } });
  if (exists && exists.id !== req.user.id) return res.status(409).json({ error: 'Email already in use' });
  const me = await User.findByPk(req.user.id);
  if (!me) return res.status(404).json({ error: 'User not found' });
  me.email = email;
  await me.save();
  res.json({ ok: true, user: me });
}

// Authenticated: change own password (needs currentPassword and newPassword)
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing fields' });
  const me = await User.findByPk(req.user.id);
  if (!me) return res.status(404).json({ error: 'User not found' });
  const ok = await comparePassword(currentPassword, me.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid current password' });
  me.passwordHash = await hashPassword(newPassword);
  await me.save();
  res.json({ ok: true });
}

// Authenticated: update own profile details
export async function updateProfile(req, res) {
  const allowed = ['addressLine1','addressLine2','city','postcode','phone','name'];
  const me = await User.findByPk(req.user.id);
  if (!me) return res.status(404).json({ error: 'User not found' });
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body || {}, k)) me[k] = req.body[k];
  }
  await me.save();
  res.json({ ok: true, user: me });
}
