import pkg from 'sequelize';
const { DataTypes, Model } = pkg;

export class Payment extends Model {}

export function initPayment(sequelize) {
  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      provider: {
        type: DataTypes.ENUM('stripe', 'paypal', 'mock'),
        allowNull: false,
        defaultValue: 'mock',
      },

      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'usd',
      },

      status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },

      providerPaymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      raw: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'payment',
      tableName: 'payments',
    }
  );

  return Payment;
}

