module.exports = (sequelize) => {
  return sequelize.define("Favorite", {}, { timestamps: false });
};