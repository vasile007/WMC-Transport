import pkg from 'sequelize';
const { Sequelize } = pkg;
import { config } from '../config/config.js';

let sequelize;
if (config.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      dialect: config.db.dialect,
      logging: false,
    }
  );
}

export { sequelize };
