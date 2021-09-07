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
  }
}

module.exports = categoryService