import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { Conversation, HelpMessage, User } from '../models/index.js';
import { setIO } from './bus.js';

const normalizeFrom = (from) => (from === 'operator' ? 'admin' : from);
const isStaff = (role) => role === 'admin' || role === 'operator';

async function getOrCreateConversationForUser(user) {
  let conv = await Conversation.findOne({ where: { userId: user.id, open: true } });
  if (!conv) {
    conv = await Conversation.create({ userId: user.id, operatorId: null, open: true, lastMessageAt: new Date(), lastMessageSnippet: '' });
  }
  return conv;
}

async function pushMessage(conversationId, from, text, userId) {
  const safeFrom = normalizeFrom(from);
  const msg = await HelpMessage.create({ conversationId, from: safeFrom, text, userId: userId || null });
  await Conversation.update({ lastMessageAt: new Date(), lastMessageSnippet: String(text || '').slice(0, 120), lastMessageFrom: safeFrom }, { where: { id: conversationId } });
  return { from: msg.from, text: msg.text, ts: msg.createdAt };
}

async function listConversations({ open = true, q = '', page = 1, limit = 50 } = {}) {
  const where = { open };
  const offset = Math.max(0, (Number(page) - 1) * Number(limit));
  const { rows } = await Conversation.findAndCountAll({ where, order: [['lastMessageAt','DESC']], offset, limit: Number(limit) });
  const userIds = Array.from(new Set(rows.map(r => r.userId)));
  const users = await User.findAll({ where: { id: userIds }, attributes: ['id','name','email'] });
  const byId = new Map(users.map(u => [u.id, u]));
  return rows.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: byId.get(r.userId)?.name || `User #${r.userId}`,
    operatorId: r.operatorId || 0,
    open: r.open,
    lastMessageAt: r.lastMessageAt?.getTime?.() || Date.parse(r.lastMessageAt || 0),
    lastMessageSnippet: r.lastMessageSnippet || '',
    lastMessageFrom: normalizeFrom(r.lastMessageFrom || null),
  }));
}

export function setupSocket(server) {
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  setIO(io);

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Missing token'));
      const payload = verifyToken(token);
      socket.user = payload;
      next();
    } catch (e) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Group sockets by role for targeted emits
    if (isStaff(socket.user?.role)) socket.join('staff');
    if (socket.user?.id) socket.join(`user:${socket.user.id}`);

    // Client can join rooms per order/driver for tracking
    socket.on('tracking:subscribe', ({ orderId, driverId }) => {
      if (orderId) socket.join(`order:${orderId}`);
      if (driverId) socket.join(`driver:${driverId}`);
    });

    socket.on('location:update', ({ orderId, driverId, lat, lng }) => {
      if (!driverId || !orderId) return;
      const payload = { driverId, orderId, lat, lng, ts: Date.now() };
      // Broadcast to rooms for that order/driver
      socket.to(`order:${orderId}`).emit('location', payload);
      socket.to(`driver:${driverId}`).emit('location', payload);
    });

    // ============== HELP CHAT EVENTS ==============
    // Client joins or creates a conversation and receives history
    socket.on('help:join', async (_payload, cb) => {
      try {
        const conv = await getOrCreateConversationForUser({ id: socket.user.id, name: socket.user.name });
        socket.join(`conv:${conv.id}`);
        const msgs = await HelpMessage.findAll({ where: { conversationId: conv.id }, order: [['createdAt','ASC']] });
        const history = msgs.map(m => ({ from: normalizeFrom(m.from), text: m.text, ts: m.createdAt }));
        cb && cb({ ok: true, conversationId: conv.id, history });
        io.to('staff').emit('help:conversation', { id: conv.id, userId: conv.userId, userName: socket.user.name || `User #${socket.user.id}`, operatorId: conv.operatorId || 0, open: conv.open, lastMessageAt: conv.lastMessageAt?.getTime?.() || Date.now(), lastMessageSnippet: conv.lastMessageSnippet || '', lastMessageFrom: normalizeFrom(conv.lastMessageFrom || null) });
      } catch (e) { cb && cb({ ok: false, error: 'Failed to join help' }); }
    });

    // Staff lists open and closed conversations
    socket.on('help:list', async (payloadOrCb, maybeCb) => {
      if (!isStaff(socket.user?.role)) return;
      const cb = typeof payloadOrCb === 'function' ? payloadOrCb : maybeCb;
      const payload = typeof payloadOrCb === 'function' ? {} : (payloadOrCb || {});
      const items = await listConversations({ open: true, page: payload.page, limit: payload.limit, q: payload.q });
      cb && cb(items);
    });
    socket.on('help:listClosed', async (payloadOrCb, maybeCb) => {
      if (!isStaff(socket.user?.role)) return;
      const cb = typeof payloadOrCb === 'function' ? payloadOrCb : maybeCb;
      const payload = typeof payloadOrCb === 'function' ? {} : (payloadOrCb || {});
      const items = await listConversations({ open: false, page: payload.page, limit: payload.limit, q: payload.q });
      cb && cb(items);
    });

    // Staff subscribes to a conversation and fetches history
    socket.on('help:subscribe', (id) => {
      if (!id) return;
      socket.join(`conv:${id}`);
    });
    socket.on('help:history', async (id, cb) => {
      const msgs = await HelpMessage.findAll({ where: { conversationId: id }, order: [['createdAt','ASC']], limit: 200 });
      const history = msgs.map(m => ({ from: normalizeFrom(m.from), text: m.text, ts: m.createdAt }));
      cb && cb(history);
    });

    // Any side sends a message
    socket.on('help:message', async ({ conversationId, text }) => {
      try {
        let convId = conversationId;
        if (!convId && socket.user?.role === 'client') {
          const conv = await getOrCreateConversationForUser({ id: socket.user.id, name: socket.user.name });
          convId = conv.id;
        }
        if (!convId || !text) return;
        const from = isStaff(socket.user?.role) ? 'admin' : 'client';
        const msg = await pushMessage(convId, from, text, socket.user?.id);
        io.to(`conv:${convId}`).emit('help:message', msg);
        const conv = await Conversation.findByPk(convId);
        if (conv) io.to('staff').emit('help:conversation', { id: conv.id, userId: conv.userId, operatorId: conv.operatorId || 0, open: conv.open, lastMessageAt: conv.lastMessageAt?.getTime?.() || Date.now(), lastMessageSnippet: conv.lastMessageSnippet || '', lastMessageFrom: normalizeFrom(conv.lastMessageFrom || null) });
      } catch {}
    });

    // Assign an operator to a conversation
    socket.on('help:assignOperator', async ({ conversationId, operatorId }, cb) => {
      if (!isStaff(socket.user?.role)) return;
      try {
        const conv = await Conversation.findByPk(conversationId);
        if (!conv) return cb && cb({ ok: false });
        conv.operatorId = Number(operatorId || 0) || null;
        await conv.save();
        io.to('staff').emit('help:conversation', { id: conv.id, userId: conv.userId, operatorId: conv.operatorId || 0, open: conv.open, lastMessageAt: conv.lastMessageAt?.getTime?.() || Date.now(), lastMessageSnippet: conv.lastMessageSnippet || '' });
        cb && cb({ ok: true });
      } catch { cb && cb({ ok: false }); }
    });

    // Close or reopen
    socket.on('help:close', async (id, cb) => {
      const conv = await Conversation.findByPk(id);
      if (conv) {
        conv.open = false;
        await conv.save();
        // notify client conversation room
        io.to(`conv:${id}`).emit('help:closed', { id });
        io.to('staff').emit('help:closed', { id });
        cb && cb({ ok: true });
      } else cb && cb({ ok: false });
    });
    socket.on('help:reopen', async (id, cb) => {
      const conv = await Conversation.findByPk(id);
      if (conv) {
        conv.open = true;
        await conv.save();
        io.to('staff').emit('help:reopen', { id });
        cb && cb({ ok: true });
      } else cb && cb({ ok: false });
    });

    // Delete a conversation
    socket.on('help:delete', async (id, cb) => {
      if (!isStaff(socket.user?.role)) return;
      try {
        const conv = await Conversation.findByPk(id);
        if (!conv) return cb && cb({ ok: false });
        await Conversation.destroy({ where: { id } });
        io.to(`conv:${id}`).emit('help:deleted', { id });
        io.to('staff').emit('help:deleted', { id });
        cb && cb({ ok: true });
      } catch {
        cb && cb({ ok: false });
      }
    });
  });

  return io;
}
