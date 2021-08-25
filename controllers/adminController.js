const db = require('../models')
const restaurant = require('../models/restaurant')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, next: true }).then(restaurants => {
      return res.render('admin/restaurants', {
        restaurants: restaurants
      })
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', '餐廳名稱是必填欄位')
      return res.redirect('back')
    }
    return Restaurant.create({ name, tel, address, opening_hours, description })
      .then(restaurant => {
        restaurant = restaurant.toJSON()
        req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
        res.redirect('admin/restaurants')
      })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        res.render('admin/create', { restaurant: restaurant.toJSON() })
      })
  },

  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_messages', 'name didn\'t exit')
      return res.redirect('back')
    }

    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.update({
          name,
          tel,
          address,
          opening_hours,
          description
        })
          .then(restaurant => {
            restaurant = restaurant.toJSON()
            req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
            res.redirect('/admin/restaurants')
          })
      })
  }
}

module.exports = adminController