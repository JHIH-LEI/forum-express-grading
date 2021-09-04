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

      // 一個使用者可以追蹤很多使用者（查他追蹤了哪些人）
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followingId',
        as: 'Followers'
      })

      // 一個使用者可以被很多人追蹤，要查被哪些人追蹤，固定被追蹤的欄位
      User.belongsToMany(User, {
        through: models.Followship,
        foreignKey: 'followerId',
        as: 'Followings'
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