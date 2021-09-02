const { tr } = require('faker/lib/locales')
const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true })
      // 如果是編輯頁，要將待編輯的資料傳到前端
      if (req.params.id) {
        const category = await Category.findByPk(req.params.id)
        return res.render('admin/categories', { categories, category: category.toJSON() })
      } else {
        res.render('admin/categories', { categories })
      }
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
  },

  putCategory: async (req, res) => {
    try {
      const { name } = req.body
      if (!name.trim()) {
        req.flash('error_messages', 'you need type in category name')
        return res.redirect('back')
      }
      // 拿到id，確認是要修改哪個類別
      const category = await Category.findByPk(req.params.id)
      await category.update({ name }) //修改類別名稱
      res.redirect('/admin/categories')
    }
    catch (err) {
      console.warn(err)
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id)
      category.destroy()
      res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = categoryController