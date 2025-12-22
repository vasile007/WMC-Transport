import pkg from 'sequelize';
const { DataTypes, Model } = pkg;

export class User extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  }
}

export function initUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('client', 'driver', 'admin', 'operator'),
        allowNull: false,
        defaultValue: 'client',
      },
      mustReset: { type: DataTypes.BOOLEAN, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      addressLine1: { type: DataTypes.STRING, allowNull: true },
      addressLine2: { type: DataTypes.STRING, allowNull: true },
      city: { type: DataTypes.STRING, allowNull: true },
      postcode: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize, modelName: 'user' }
  );
  return User;
}
