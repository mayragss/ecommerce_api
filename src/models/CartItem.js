module.exports = (sequelize, DataTypes) => {
  return sequelize.define("CartItem", {
    quantity: DataTypes.INTEGER
  }, { timestamps: false });
};