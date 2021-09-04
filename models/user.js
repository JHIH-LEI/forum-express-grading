'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Comment)
      User.belongsToMany(models.Restaurant, {
        through: models.Favorite, //透過這個model找到關係
        foreignKey: 'UserId', //透過（固定）UserId去找
        as: 'FavoritedRestaurants' //model可透過這個方法找到關聯的資料,也就是找到後的資料要存到model資料底下的什麼變數
      })
      User.belongsToMany(models.Restaurant, {
        through: models.Like,
        foreignKey: 'UserId',
        as: 'LikedRestaurants'
      })
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    avatar: DataTypes.STRING,
    banner: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};