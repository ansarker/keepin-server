const Password = require("../models/model.password");
const { encrypt } = require("../helpers/helper");
const { ObjectId } = require("bson");
const ErrorResponse = require("../lib/errorResponse");

exports.post_password = async (req, res, next) => {
  const { title, email, username, url, password } = req.body;
  if (!title) {
    return next(new ErrorResponse("Title can't be empty", 400));
  }
  if (!username) {
    return next(new ErrorResponse("Username can't be empty", 400));
  }
  if (!password) {
    return next(new ErrorResponse("Password can't be empty", 400));
  }
  const encPass = encrypt(password);
  const { iv: salt, encryptedData: watchword } = encPass;
  const passwordManager = new Password({
    userId: req.user.email,
    title,
    email,
    username,
    url,
    salt,
    watchword,
  });
  let result = await passwordManager.save();

  res.status(201).json({
    success: true,
    result,
    msg: "Successfully added data",
  });
};

exports.get_password = (req, res) => {
  if (req.query.q) {
    const searchValue = new RegExp(req.query.q, "i");
    Password.find({
      userId: req.user.email,
    })
      .where({
        $or: [
          { title: searchValue },
          { email: searchValue },
          { username: searchValue },
        ],
      })
      .then((data) => {
        res.status(201).json({
          success: true,
          data,
        });
      })
      .catch((err) => {
        res.status(401).json({
          success: false,
          msg: "Nothing found :(",
        });
      });
  } else {
    Password.find({ userId: req.user.email })
      .then((data) => {
        res.status(201).json({
          success: true,
          data,
          msg: "Showing all the data",
        });
      })
      .catch((err) => {
        res.status(401).json({
          success: false,
          msg: "No data available :(",
        });
      });
  }
};

exports.favorites = (req, res) => {
  let data__ = [];

  Password.find({ userId: req.user.email })
    .then((data) => {
      data.filter((item) => {
        if (item.favorite === true) {
          data__.push(item);
        }
      });
      res.status(201).json({
        success: true,
        data: data__,
        msg: "Showing all the data",
      });
    })
    .catch((err) => {
      res.status(401).json({
        success: false,
        msg: "No data available :(",
      });
    });
};

exports.delete_password = (req, res) => {
  const { _id } = req.body;
  const deleteId = { _id: ObjectId(_id) };
  Password.deleteOne(deleteId, (err, result) => {
    if (err) throw err;
    res.status(201).json({
      success: true,
      result,
      msg: "Deletion success",
    });
  });
};

exports.update_password = (req, res) => {
  const updateId = { _id: ObjectId(req.params.id) };
  const { title, email, username, url, password } = req.body;
  if (password === undefined) {
    Password.updateOne(updateId, {
      $set: req.body,
    }).then((response) => {
      res.status(201).json({
        success: true,
        response,
        msg: "Updated successfully",
      });
    });
  } else {
    const encPass = encrypt(password);
    const { iv: salt, encryptedData: watchword } = encPass;

    Password.updateOne(updateId, {
      $set: { title, email, username, url, salt, watchword },
    }).then((response) => {
      res.status(201).json({
        success: true,
        response,
        msg: "Updated successfully",
      });
    });
  }
};

exports.add_to_favorite = (req, res) => {
  const { _id, favorite } = req.body;
  const updateId = { _id: ObjectId(_id) };

  Password.updateOne(updateId, { $set: { favorite } }).then((response) => {
    res.status(200).json({ response });
  });
};

exports.find_by_id = (req, res) => {
  const _id = req.params.id;
  Password.findById(_id).then((data) => {
    res.status(201).json({
      success: true,
      data,
    });
  });
};
