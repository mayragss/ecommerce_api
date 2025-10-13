module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Address", {
    zip: DataTypes.STRING,
    street: DataTypes.STRING,
    number: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    complement: DataTypes.STRING,
    type: DataTypes.ENUM("residential", "commercial")
  });
};