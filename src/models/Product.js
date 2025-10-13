module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Product", {
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.FLOAT,
    stock: DataTypes.INTEGER,
    category: DataTypes.STRING,
    collection: DataTypes.STRING,
    attributes: DataTypes.JSON,
    images: DataTypes.JSON,
    sold: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    priority: DataTypes.INTEGER,
  });
};