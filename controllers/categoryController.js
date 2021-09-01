const { tr } = require('faker/lib/locales')
const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true })
      res.render('admin/categories', { categories })
    }
    catch (err) {
      console.warn(err)
    }
  },
  postCategories: async (req, res) => {
    try {
      const { name } = req.body
      if (!name.trim()) {
        req.flash('error_messages', 'you need type in category name')
        return res.redirect('/admin/categories')
      }
      await Category.create({ name })
      res.redirect('/admin/categories')
    }
    catch (err) {
      console.warn(err)
    }
  }
}

module.exports = categoryController