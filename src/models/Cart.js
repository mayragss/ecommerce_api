module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Cart", {
    totalItems: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'ordered'),
      defaultValue: 'active'
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  });
};