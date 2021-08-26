const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
    const { file } = req
    //如果有圖片上傳，就將圖片路徑存到image欄位
    if (file) {
      //呼叫imgur去讀取用戶上傳的檔案位置，並取得檔案資料
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null
        })
          .then(restaurant => {
            restaurant = restaurant.toJSON()
            req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
            res.redirect('/admin/restaurants')
          })
      })
      // 將圖片上傳到imgur圖庫，拿到網址存進db
    } else {
      return Restaurant.create({ name, tel, address, opening_hours, description, image: null })
        .then(restaurant => {
          restaurant = restaurant.toJSON()
          req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
          res.redirect('/admin/restaurants')
        })
    }
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
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then(restaurant => {
            restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image
            })
              .then(restaurant => {
                restaurant = restaurant.toJSON()
                req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
                return res.redirect('/admin/restaurants')
              })
              .catch(err => console.log(err))
          })
      })
    } else {
      //如果圖片沒修改
      return Restaurant.findByPk(req.params.id)
        .then(restaurant => {
          restaurant.update({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: restaurant.image //圖片沒更動，維持原圖片路徑
          })
            .then(restaurant => {
              restaurant = restaurant.toJSON()
              req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
              return res.redirect('/admin/restaurants')
            })
            .catch(err => console.log(err))
        })
    }
  },

  deleteRestaurant: (req, res) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => res.redirect('/admin/restaurants'))
      })
  }
}

module.exports = adminController