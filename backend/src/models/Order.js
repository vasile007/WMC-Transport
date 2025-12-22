// ✅ backend/models/Order.js
import pkg from "sequelize";
const { DataTypes, Model } = pkg;

export class Order extends Model {}

export function initOrder(sequelize) {
  const generateReferenceNumber = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `QM-${ts}-${rand}`;
  };

  Order.init(
    {
      // 🔢 Primary Key
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      referenceNumber: {
        type: DataTypes.STRING(32),
        allowNull: true,
        unique: true,
      },

      // 📦 Order Status
      status: {
        type: DataTypes.ENUM(
          "pending",     // creată de client
          "assigned",    // alocată unui driver
          "picked_up",   // ridicată de șofer
          "in_transit",  // pe drum
          "delivered",   // livrată cu succes
          "cancelled"    // anulată
        ),
        allowNull: false,
        defaultValue: "pending",
      },

      // 🚚 Pickup Location
      pickupAddress: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [5, 255],
        },
      },
      pickupCity: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      pickupPostalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      pickupLat: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: -90,
          max: 90,
        },
      },
      pickupLng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: -180,
          max: 180,
        },
      },

      // 🎯 Dropoff Location
      dropoffAddress: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [5, 255],
        },
      },
      dropoffCity: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      dropoffPostalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      dropoffLat: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: -90,
          max: 90,
        },
      },
      dropoffLng: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          min: -180,
          max: 180,
        },
      },

      // 💰 Payment & Pricing
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
      },
      paymentStatus: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        allowNull: false,
        defaultValue: "pending",
      },

      // 👥 Relationships
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // 🕒 Tracking timestamps
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "order",
      tableName: "orders",
      timestamps: true,
      hooks: {
        beforeValidate: (order) => {
          if (!order.referenceNumber) {
            order.referenceNumber = generateReferenceNumber();
          }
        },
      },
      indexes: [
        { fields: ["status"] },
        { fields: ["userId"] },
        { fields: ["driverId"] },
        { fields: ["pickupCity"] },
        { fields: ["dropoffCity"] },
        { fields: ["referenceNumber"], unique: true },
      ],
    }
  );

  return Order;
}


