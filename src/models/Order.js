module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    total: DataTypes.FLOAT,
    status: DataTypes.ENUM("pending", "awaiting_treatment", "paid", "shipped", "delivered", "cancelled"),
    paymentMethod: DataTypes.STRING
  });
};