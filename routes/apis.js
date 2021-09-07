const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)
// 類別
router.get('/admin/categories', categoryController.getCategories)
router.get('/admin/categories/:id', categoryController.getCategories)

module.exports = router