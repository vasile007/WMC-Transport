import { sequelize } from '../db/index.js';
import { initUser, User } from './User.js';
import { initOrder, Order } from './Order.js';
import { initPayment, Payment } from './Payment.js';
import { initConversation, Conversation } from './Conversation.js';
import { initHelpMessage, HelpMessage } from './HelpMessage.js';

// Initialize models
initUser(sequelize);
initOrder(sequelize);
initPayment(sequelize);
initConversation(sequelize);
initHelpMessage(sequelize);

// Associations
User.hasMany(Order, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Order.belongsTo(User, { as: 'client', foreignKey: { name: 'userId', allowNull: false } });

User.hasMany(Order, { foreignKey: { name: 'driverId', allowNull: true }, as: 'driverOrders' });
Order.belongsTo(User, { as: 'driver', foreignKey: { name: 'driverId', allowNull: true } });

Order.hasMany(Payment, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: { name: 'orderId', allowNull: false } });

// Help chat associations
Conversation.belongsTo(User, { as: 'client', foreignKey: { name: 'userId', allowNull: false } });
Conversation.belongsTo(User, { as: 'operator', foreignKey: { name: 'operatorId', allowNull: true } });
Conversation.hasMany(HelpMessage, { foreignKey: { name: 'conversationId', allowNull: false }, onDelete: 'CASCADE' });
HelpMessage.belongsTo(Conversation, { foreignKey: { name: 'conversationId', allowNull: false } });
HelpMessage.belongsTo(User, { as: 'sender', foreignKey: { name: 'userId', allowNull: true } });

export { sequelize, User, Order, Payment, Conversation, HelpMessage };
