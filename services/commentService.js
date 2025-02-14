const db = require('../models')
const Comment = db.Comment

const commentService = {
  postComment: async (req, res, cb) => {
    try {
      // 使用者新增某餐廳的評論
      const RestaurantId = Number(req.params.restaurantsId)
      const { text } = req.body
      const { id: UserId } = req.user
      if (!text) {
        return cb({ status: 'error', message: '評論不能為空' })
      }
      // 如果使用者已經評論過，就不能再評論，請他直接編輯
      const comment = await Comment.findOne({ where: { UserId, RestaurantId }, attributes: ['id', 'RestaurantId'] })
      if (comment) {
        return cb({ status: 'error', message: '一家餐廳只能評論一次', RestaurantId, commentId: comment.id })
      }
      await Comment.create({ text, UserId, RestaurantId })
      return cb({ status: 'success', message: '新增評論成功' })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  },

  deleteComment: async (req, res, cb) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      if (!comment) {
        return cb({ status: 'error', message: '評論不存在，故無法刪除' })
      }
      await comment.destroy()
      return cb({ status: 'success', RestaurantId: comment.RestaurantId })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  },

  putComment: async (req, res, cb) => {
    try {
      const { id, restaurantId } = req.params
      const { text } = req.body
      const comment = await Comment.findByPk(id)
      comment.text = text || comment.text
      await comment.save()
      return cb({ status: 'success', message: '留言更新成功', restaurantId })
    } catch (err) {
      console.warn(err)
      return cb({ status: 'server error', message: `${err}` })
    }
  }
}

module.exports = commentService
