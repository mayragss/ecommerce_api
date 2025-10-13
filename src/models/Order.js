module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Order", {
    total: DataTypes.FLOAT,
    status: DataTypes.ENUM("pending", "paid", "shipped", "delivered", "cancelled"),
    paymentMethod: DataTypes.STRING
  });
};