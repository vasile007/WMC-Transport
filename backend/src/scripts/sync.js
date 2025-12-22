import { sequelize } from '../models/index.js';

async function run() {
  await sequelize.sync({ alter: true });
  // eslint-disable-next-line no-console
  console.log('Database synced');
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

