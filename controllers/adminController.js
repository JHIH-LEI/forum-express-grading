const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
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

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('back')
      }
      req.flash('success_messages', `${data.message}`)
      return res.redirect('/admin/restaurants')
    })
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

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('back')
      }
      req.flash('success_messages', `${data.message}`)
      return res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data.status === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  // 與操作使用者有關
  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', '系統錯誤無法顯示所有使用者')
        return res.redirect('/admin/users')
      }
      return res.render('admin/users', data)
    })
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