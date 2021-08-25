const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')

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
      //讀取用戶上傳的檔案位置，並取得檔案資料
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('讀取檔案Error:', err)
        console.log(data)
        // 複製上傳的檔案到upload資料夾,並將路徑寫入image欄位
        fs.writeFile(`upload/${file.originalname}`, data, (err) => {
          if (err) console.log(`寫入檔案錯誤Error:${err}`)
          return Restaurant.create({
            name,
            tel,
            address,
            opening_hours,
            description,
            image: file ? `/upload/${file.originalname}` : null
          })
            .then(restaurant => {
              restaurant = restaurant.toJSON()
              req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
              res.redirect('/admin/restaurants')
            })
        })
      })
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
    const { name, tel, address, opening_hours, description, image } = req.body
    console.log(image)
    if (!name) {
      req.flash('error_messages', 'name didn\'t exit')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log(err)
        fs.writeFile(`upload/${file.originalname}`, data, (err) => {
          if (err) console.log(err)
          return Restaurant.findByPk(req.params.id)
            .then(restaurant => {
              restaurant.update({
                name,
                tel,
                address,
                opening_hours,
                description,
                image: file ? `/upload/${file.originalname}` : restaurant.image
              })
                .then(restaurant => {
                  restaurant = restaurant.toJSON()
                  req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
                  res.redirect('/admin/restaurants')
                })
            })
        })
      })
    }
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
            res.redirect('/admin/restaurants')
          })
      })
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