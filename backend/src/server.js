import http from 'http';
import { config } from './config/config.js';
import app from './app.js';
import { setupSocket } from './sockets/index.js';
import { sequelize, Order } from './models/index.js';
import fs from 'fs';
import path from 'path';

async function start() {
  if (config.db.dialect === 'sqlite' && config.db.storage) {
    const dir = path.dirname(config.db.storage);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  // Ensure DB schema matches models in dev/staging.
  // This will add missing columns like `mustReset` without dropping data.
////  await sequelize.sync({ alter: true });
  try {
    const missingRefs = await Order.findAll({ where: { referenceNumber: null } });
    for (const order of missingRefs) {
      await order.save();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Reference number backfill failed', err?.message || err);
  }
  const server = http.createServer(app);
setupSocket(server);

const PORT = 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`WMC TRANSPORT LTD API listening on :${PORT}`);
});

}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});
