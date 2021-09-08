const db = require('../models')
const Category = db.Category

const categoryService = {
  getCategories: async (req, res, cb) => {
    try {
      const categories = await Category.findAll({ raw: true })
      // 如果是編輯頁，要將待編輯的資料傳到前端
      if (req.params.id) {
        const category = await Category.findByPk(req.params.id)
        cb({ categories, category: category.toJSON() })
      } else {
        cb({ categories })
      }
    }
    catch (err) {
      console.warn(err)
    }
  },

  postCategories: async (req, res, cb) => {
    try {
      const { name } = req.body

      if (!name) {
        return cb({ status: 'error', message: 'you need type in category name' })
      }

      if (!name.trim()) {
        return cb({ status: 'error', message: '類別名稱不能為空白' })
      }
      await Category.create({ name })
      return cb({ status: 'success', message: '類別新增成功' })
    }
    catch (err) {
      console.warn(err)
      return cb({ status: 'error', message: `${err}` })
    }
  },

  putCategory: async (req, res, cb) => {
    try {
      const { name } = req.body
      if (!name) {
        return cb({ status: 'error', message: 'you need type in category name' })
      }

      if (!name.trim()) {
        return cb({ status: 'error', message: '類別不能為空白' })
      }
      // 拿到id，確認是要修改哪個類別
      const category = await Category.findByPk(req.params.id)
      await category.update({ name }) //修改類別名稱
      return cb({ status: 'success', message: '修改成功' })
    }
    catch (err) {
      console.warn(err)
      return cb({ status: 'error', message: `${err}` })
    }
  },

  deleteCategory: async (req, res, cb) => {
    try {
      const category = await Category.findByPk(req.params.id)

      if (!category) {
        return cb({ status: 'error', message: '查無此類別' })
      }
      await category.destroy()
      return cb({ status: 'success', message: '類別刪除成功' })
    } catch (err) {
      console.warn(err)
      cb({ status: 'error', message: `${err}` })
    }
  }
}

module.exports = categoryService