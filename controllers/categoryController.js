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
  }
}

module.exports = categoryController