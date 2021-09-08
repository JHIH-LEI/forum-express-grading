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

  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('/admin/users')
      }
      if (data.status === 'success') {
        req.flash('success_messages', `${data.message}`)
        return res.redirect('/admin/users')
      }
    })
  }
}

module.exports = adminController