module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define("Coupon", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM("fixed", "percentage"),
      allowNull: false
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: "coupons",
    timestamps: true
  });

  return Coupon;
};
