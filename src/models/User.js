module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    passwordHash: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: { type: DataTypes.STRING, defaultValue: 'user' },
  });
};