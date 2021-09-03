const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name'],
        include: [Category]
      })
      return res.render('admin/restaurants', { restaurants })
    } catch (err) {
      console.warn(err)
    }
  },

  createRestaurant: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('admin/create', { categories })
    }
    catch (err) {
      console.warn(err)
    }
  },

  postRestaurant: async (req, res) => {
    try {
      const { name, tel, address, opening_hours, description, categoryId } = req.body
      if (!name) {
        req.flash('error_messages', '餐廳名稱是必填欄位')
        return res.redirect('back')
      }
      const { file } = req
      //如果有圖片上傳，就將圖片路徑存到image欄位
      if (file) {
        //呼叫imgur去讀取用戶上傳的檔案位置，並取得檔案資料
        imgur.setClientID(IMGUR_CLIENT_ID)
        await imgur.upload(file.path, async (err, img) => {
          try {
            let restaurant = await Restaurant.create({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : null,
              CategoryId: categoryId
            })
            restaurant = restaurant.toJSON()
            req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
            return res.redirect('/admin/restaurants')
          } catch (err) {
            console.warn(err)
          }
        })
        // 將圖片上傳到imgur圖庫，拿到網址存進db
      } else {
        const restaurant = await Restaurant.create({ name, tel, address, opening_hours, description, image: null, CategoryId: categoryId })
        req.flash('success_messages', `new restaurant：${restaurant.name} was successfully created`)
        return res.redirect('/admin/restaurants')
      }
    } catch (err) {
      console.warn(err)
    }
  },

  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id,
        {
          attributes: ['id', 'name', 'tel', 'address', 'opening_hours', 'description', 'image'],
          include: [Category]
        })
      return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  },

  editRestaurant: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      const restaurant = await Restaurant.findByPk(req.params.id)
      return res.render('admin/create', { restaurant: restaurant.toJSON(), categories })
    } catch (err) {
      console.warn(err)
    }
  },

  putRestaurant: async (req, res) => {
    try {
      const { name, tel, address, opening_hours, description, categoryId } = req.body
      if (!name) {
        req.flash('error_messages', 'name didn\'t exit')
        return res.redirect('back')
      }
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        await imgur.upload(file.path, async (err, img) => {
          try {
            const restaurant = await Restaurant.findByPk(req.params.id)
            await restaurant.update({
              name,
              tel,
              address,
              opening_hours,
              description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: categoryId
            })
            req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
            return res.redirect('/admin/restaurants')
          } catch (err) {
            console.warn(err)
          }
        })
      } else {
        //如果圖片沒修改
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: restaurant.image, //圖片沒更動，維持原圖片路徑
          CategoryId: categoryId
        })
        req.flash('success_messages', `restaurant: ${restaurant.name} was successfully to update`)
        return res.redirect('/admin/restaurants')
      }
    } catch (err) {
      console.warn(err)
    }
  },

  deleteRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      await restaurant.destroy()
      return res.redirect('/admin/restaurants')
    } catch (err) {
      console.warn(err)
    }
  },

  // 與操作使用者有關
  getUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name', 'email', 'isAdmin']
      })
      res.render('admin/users', { users })
    } catch (err) {
      console.warn(err)
    }
  },

  toggleAdmin: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)
      user.isAdmin = !user.isAdmin //切換權限
      const authority = user.isAdmin ? 'admin' : 'user' //權限名稱

      // 如果是要變更成使用者，必須先檢查是不是只有一個管理員 
      if (authority === 'user') {
        const count = await User.count({
          where: {
            isAdmin: true
          }
        })
        if (count === 1) {
          // 如果已經是最後一位管理員就跳出警告，並不執行變更身份 
          req.flash('error_messages', '變更失敗，因為管理員數量不能為0')
          return res.redirect('/admin/users')
        }
      }
      await user.update({ isAdmin: user.isAdmin })
      req.flash('success_messages', `已成功將${user.name}設為${authority}`)
      return res.redirect('/admin/users')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = adminController