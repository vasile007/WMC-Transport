import http from 'http';
import { config } from './config/config.js';
import app from './app.js';
import { setupSocket } from './sockets/index.js';
import { sequelize, Order } from './models/index.js';
import fs from 'fs';
import path from 'path';

// 🔐 ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing. Server will not start.");
  process.exit(1);
} else {
  console.log("✅ JWT configured");
}

async function start() {

  // create sqlite dir if ever used
  if (config.db.dialect === 'sqlite' && config.db.storage) {
    const dir = path.dirname(config.db.storage);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // sync DB depending on environment
  if (process.env.NODE_ENV === "production") {
    await sequelize.sync();
  } else {
    await sequelize.sync({ alter: true });
  }

  // backfill reference numbers (silent if fails)
  try {
    const missingRefs = await Order.findAll({ where: { referenceNumber: null } });
    for (const order of missingRefs) {
      await order.save();
    }
  } catch (err) {
    console.warn('Reference number backfill failed', err?.message || err);
  }

  const server = http.createServer(app);
  setupSocket(server);

  server.listen(config.port, () => {
    console.log(`WMC TRANSPORT LTD API listening on :${config.port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

