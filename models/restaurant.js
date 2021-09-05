'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Restaurant.belongsTo(models.Category)
      Restaurant.hasMany(models.Comment)
      //設定多對多關係
      Restaurant.belongsToMany(models.User, {
        through: models.Favorite, //透過這張join table找到關係
        foreignKey: 'RestaurantId', //透過這個FK找，並固定他（這家餐廳的）,
        as: 'FavoritedUsers', //找完之後的命名
      })
      Restaurant.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'RestaurantId',
        as: 'LikedUsers' //預設：Restaurant.Users，重新為關係命名
      })

      Restaurant.hasMany(models.Favorite)
    }
  };
  Restaurant.init({
    name: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    opening_hours: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    CategoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Restaurant',
  });
  return Restaurant;
};