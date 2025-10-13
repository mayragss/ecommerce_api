module.exports = (sequelize, DataTypes) => {
  return sequelize.define("OrderItem", {
    quantity: DataTypes.INTEGER,
    unitPrice: DataTypes.FLOAT
  }, { timestamps: false });
};
