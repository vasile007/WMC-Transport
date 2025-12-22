import pkg from 'sequelize';
const { DataTypes, Model } = pkg;

export class HelpMessage extends Model {}

export function initHelpMessage(sequelize) {
  HelpMessage.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      conversationId: { type: DataTypes.INTEGER, allowNull: false },
      from: { type: DataTypes.ENUM('client','admin','operator'), allowNull: false },
      text: { type: DataTypes.STRING(1000), allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: true },
    },
    { sequelize, modelName: 'helpMessage', tableName: 'help_messages', timestamps: true }
  );
  return HelpMessage;
}
