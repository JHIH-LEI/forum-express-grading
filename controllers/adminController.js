const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      next: true,
      attributes: ['id', 'name']
    })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
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
    return Restaurant.findByPk(req.params.id, { attributes: ['id', 'name', 'tel', 'address', 'opening_hours', 'description', 'image'] })
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
  },

  // 與操作使用者有關
  getUsers: (req, res) => {
    User.findAll({
      raw: true,
      nest: true,
      attributes: ['id', 'name', 'email', 'isAdmin']
    })
      .then(users => res.render('admin/users', { users }))
      .catch(err => console.log(err))
  },

  toggleAdmin: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        user.isAdmin = !user.isAdmin //切換權限
        const authority = user.isAdmin ? 'admin' : 'user' //權限名稱

        // 如果是要變更成使用者，必須先檢查是不是只有一個管理員 
        if (authority === 'user') {
          return User.count({
            where: {
              isAdmin: true
            }
          })
            .then(count => {
              if (count === 1) {
                // 如果已經是最後一位管理員就跳出警告，並不執行變更身份 
                req.flash('error_messages', '變更失敗，因為管理員數量不能為0')
                return res.redirect('/admin/users')
              }
              user.update({ isAdmin: user.isAdmin })
                .then(user => {
                  req.flash('success_messages', `已成功將${user.name}設為${authority}`)
                  res.redirect('/admin/users')
                })
            })
            .catch(err => console.log(err))
        }

        user.update({ isAdmin: user.isAdmin })
          .then(user => {
            req.flash('success_messages', `已成功將${user.name}設為${authority}`)
            res.redirect('/admin/users')
          })
          .catch(err => console.log(err))
      })
  }
}

module.exports = adminController