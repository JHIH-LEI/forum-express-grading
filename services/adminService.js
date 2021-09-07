const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: async (req, res, cb) => {
    try {
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name'],
        include: [Category]
      })
      cb({ restaurants }) //完成處理後呼叫cb,傳入data
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },

  getRestaurant: async (req, res, cb) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id,
        {
          attributes: ['id', 'name', 'tel', 'address', 'opening_hours', 'description', 'image'],
          include: [Category]
        })
      cb({ restaurant: restaurant.toJSON() })
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },

  deleteRestaurant: async (req, res, cb) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      await restaurant.destroy()
      cb({ status: 'success', message: '' })
    } catch (err) {
      cb({ status: 'error', message: `${err}` })
    }
  },

  postRestaurant: async (req, res, cb) => {
    try {
      const { name, tel, address, opening_hours, description, categoryId } = req.body
      if (!name) {
        return cb({ status: 'error', message: '餐廳名稱是必填欄位' })
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
            return cb({ status: 'success', message: `new restaurant：${restaurant.name} was successfully created` })
          } catch (err) {
            console.warn(err)
            cb({ status: 'error', message: `${err}` })
          }
        })
        // 將圖片上傳到imgur圖庫，拿到網址存進db
      } else {
        const restaurant = await Restaurant.create({ name, tel, address, opening_hours, description, image: null, CategoryId: categoryId })
        return cb({ status: 'success', message: `new restaurant：${restaurant.name} was successfully created` })
      }
    } catch (err) {
      console.warn(err)
      cb({ status: 'error', message: `${err}` })
    }
  },

  putRestaurant: async (req, res, cb) => {
    try {
      const { name, tel, address, opening_hours, description, categoryId } = req.body
      if (!name) {
        return cb({ status: 'error', message: 'name didn\'t exit' })
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
            return cb({ status: 'success', message: `restaurant: ${restaurant.name} was successfully to update` })
          } catch (err) {
            console.warn(err)
            return cb({ status: 'error', message: `${err}` })
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
        return cb({ status: 'success', message: `restaurant: ${restaurant.name} was successfully to update` })
      }
    } catch (err) {
      console.warn(err)
      return cb({ status: 'error', message: `${err}` })
    }
  },
}

module.exports = adminService