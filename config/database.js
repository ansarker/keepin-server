require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const connection = mongoose.connect(uri, dbOptions)
  .then(() => {
    console.log('connection to database success')
  }).catch(err => {
    console.log('Database err: ', err)
  })

module.exports = { connection };