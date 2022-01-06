const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  userId: String,
  title: {
    type: String,
    require: true
  },
  firstname: String,
  middlename: String,
  lastname: String,
  username: String,
  company: String,
  mobile: String,
  passport: String,
  nid: String,
  address: String
}, {
  timestamps: true
})

module.exports = mongoose.model("Card", cardSchema);