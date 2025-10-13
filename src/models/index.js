const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql"
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
const User = require("./User")(sequelize, DataTypes);
const Product = require("./Product")(sequelize, DataTypes);
const Order = require("./Order")(sequelize, DataTypes);
const OrderItem = require("./OrderItem")(sequelize, DataTypes);
const Cart = require("./Cart")(sequelize, DataTypes);
const CartItem = require("./CartItem")(sequelize, DataTypes);
const Address = require("./Address")(sequelize, DataTypes);
const Favorite = require("./Favorite")(sequelize, DataTypes);
const Coupon = require("./Coupon")(sequelize, DataTypes);

// Associations
User.hasMany(Address);
Address.belongsTo(User);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.hasMany(CartItem);
CartItem.belongsTo(Cart);

Product.hasMany(CartItem);
CartItem.belongsTo(Product);

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

User.hasMany(Favorite);
Favorite.belongsTo(User);

Product.hasMany(Favorite);
Favorite.belongsTo(Product);

module.exports = { sequelize, Sequelize, User, Product, Order, OrderItem, Cart, CartItem, Address, Favorite, Coupon };
