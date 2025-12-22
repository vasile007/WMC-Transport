import pkg from 'sequelize';
const { DataTypes, Model } = pkg;

export class Conversation extends Model {}

export function initConversation(sequelize) {
  Conversation.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      operatorId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      open: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      lastMessageAt: { type: DataTypes.DATE, allowNull: true },
      lastMessageSnippet: { type: DataTypes.STRING(255), allowNull: true },
      lastMessageFrom: { type: DataTypes.ENUM('client','admin','operator'), allowNull: true },
    },
    { sequelize, modelName: 'conversation', tableName: 'conversations' }
  );
  return Conversation;
}
