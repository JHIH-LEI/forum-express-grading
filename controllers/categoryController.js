const db = require('../models')
const categoryService = require('../services/categoryService')
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

  postCategories: (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('/admin/categories')
      }
      req.flash('success_messages', `${data.message}`)
      return res.redirect('/admin/categories')
    })
  },

  putCategory: (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', `${data.message}`)
        return res.redirect('back')
      }
      req.flash('success_messages', `${data.message}`)
      return res.redirect('/admin/categories')
    })
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