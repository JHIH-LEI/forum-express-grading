const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a == b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },
  fromNow: function (time) {
    return moment(time).fromNow()
  },
  isnt: function (a, b, options) {
    if (a != b) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  }
}