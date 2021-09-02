const db = require('../models')
const Comment = db.Comment

const commentController = {
  postComment: async (req, res) => {
    try {
      // 使用者新增某餐廳的評論
      const RestaurantId = Number(req.params.restaurantsId)
      const { text } = req.body
      const { id: UserId } = req.user
      await Comment.create({ text, UserId, RestaurantId })
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      return res.redirect(`/restaurants/${comment.RestaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  },

  putComment: async (req, res) => {
    try {
      const { id, restaurantId } = req.params
      const { text } = req.body
      const comment = await Comment.findByPk(id)
      comment.text = text
      await comment.save()
      return res.redirect(`/restaurants/${restaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = commentController