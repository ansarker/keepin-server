const Password = require('../models/model.password');
const { encrypt } = require('../helpers/helper');
const { ObjectId } = require('bson');

exports.post_password = async (req, res) => {
  const { category, title, email, username, password } = req.body;
  const encPass = encrypt(password);
  const { iv: salt, encryptedData: watchword } = encPass;
  const passwordManager = new Password({
    userId: req.user.email, category, title, email, username, salt, watchword
  })
  let result = await passwordManager.save();

  res.status(201).json({
    success: true,
    result,
    msg: "Successfully added data"
  })
}

exports.get_password = (req, res) => {
  if (req.query.q) {
    const searchValue = new RegExp(req.query.q, "i");
    Password.find({
      userId: req.user.email,
      $or: [
        { title: searchValue },
        { category: searchValue },
        { email: searchValue },
        { username: searchValue }
      ]
    }).then(data => {
      res.status(201).json({
        success: true,
        data
      });
    }).catch((err) => {
      res.status(401).json({
        success: false,
        msg: 'Nothing found :('
      })
    })
  } else {
    Password.find({ userId: req.user.email }).then((data) => {
      res.status(201).json({
        success: true,
        data,
        msg: 'Showing all the data'
      });
    }).catch((err) => {
      res.status(401).json({
        success: false,
        msg: 'No data available :('
      })
    })
  }
}

exports.delete_password = (req, res) => {
  const { _id } = req.body;
  const deleteId = { _id: ObjectId(_id) };
  Password.deleteOne(deleteId, (err, result) => {
    if (err) throw err
    res.status(201).json({
      success: true,
      result,
      msg: 'Deletion success'
    });
  })
}

exports.update_password = (req, res) => {
  const updateId = { _id: ObjectId(req.params.id) }
  const { category, title, email, username, password } = req.body;
  if (password === undefined) {
    Password.updateOne(updateId, {
      $set: req.body
    }).then((response) => {
      res.status(201).json({
        success: true,
        response,
        msg: 'Updated successfully'
      })
    })
  } else {
    const encPass = encrypt(password);
    const { iv: salt, encryptedData: watchword } = encPass;

    Password.updateOne(updateId, {
      $set: { category, title, email, username, salt, watchword }
    }).then((response) => {
      res.status(201).json({
        success: true,
        response,
        msg: 'Updated successfully'
      })
    })
  }
}

exports.find_by_id = (req, res) => {
  const _id = req.params.id;
  Password.findById(_id)
    .then((data) => {
      res.status(201).json({
        success: true,
        data
      });
    })
}