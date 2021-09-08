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
}

module.exports = commentService
