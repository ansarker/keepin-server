const Card = require("../models/model.card");
const { encrypt, decrypt } = require("../helpers/helper");
const ErrorResponse = require("../lib/errorResponse");
const { ObjectId } = require("bson");

exports.post_card = async (req, res, next) => {
  let {
    title,
    cardholder,
    number,
    brand,
    expiration_month,
    expiration_year,
    security_code,
    pincode,
  } = req.body;

  if (
    !title ||
    !cardholder ||
    !number ||
    !brand ||
    !expiration_month ||
    !expiration_year ||
    !security_code ||
    !pincode
  ) {
    return next(new ErrorResponse("Input fields cannot be empty", 400));
  }
  number = number.replace(/\s/g, "");

  try {
    const encPincode = encrypt(pincode);
    const { iv: salt, encryptedData: pin } = encPincode;
    const newCard = new Card({
      userId: req.user.email,
      title,
      cardholder,
      number,
      brand,
      expiration_month,
      expiration_year,
      security_code,
      salt,
      pin,
    });

    let result = await newCard.save();
    res.status(200).json({
      success: true,
      result,
      msg: "Successfully added data",
    });
  } catch (error) {
    next(error);
  }
};

exports.get_card = (req, res) => {
  if (req.query.q) {
    const searchValue = new RegExp(req.query.q, "i");
    Card.find({ userId: req.user.email })
      .where({
        $or: [
          { title: searchValue },
          { cardholder: searchValue },
          { brand: searchValue },
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
    Card.find({ userId: req.user.email })
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

  Card.find({ userId: req.user.email })
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

exports.delete_card = (req, res) => {
  const { _id } = req.body;
  const deleteId = { _id: ObjectId(_id) };
  Card.deleteOne(deleteId, (err, result) => {
    if (err) throw err;
    res.status(201).json({
      success: true,
      result,
      msg: "Deletion success",
    });
  });
};

exports.update_card = (req, res) => {
  const updateId = { _id: ObjectId(req.params.id) };
  const {
    title,
    cardholder,
    number,
    brand,
    expiration_month,
    expiration_year,
    security_code,
    pincode,
  } = req.body;
  if (pincode === undefined) {
    Card.updateOne(updateId, {
      $set: req.body,
    }).then((response) => {
      res.status(200).json({
        success: true,
        response,
        msg: "Updated successfully",
      });
    });
  } else {
    const encPincode = encrypt(pincode);
    const { iv: salt, encryptedData: pin } = encPincode;

    Card.updateOne(updateId, {
      $set: {
        title,
        cardholder,
        number,
        brand,
        expiration_month,
        expiration_year,
        security_code,
        salt,
        pin,
      },
    }).then((response) => {
      res.status(200).json({
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

  Card.updateOne(updateId, { $set: { favorite } }).then((response) => {
    res.status(200).json({ response });
  });
};

exports.find_by_id = (req, res) => {
  const _id = req.params.id;
  Card.findById(_id).then((data) => {
    res.status(200).json({
      success: true,
      data,
    });
  });
};

exports.show_pincode = (req, res) => {
  const { pin: encryptedData, salt: iv } = req.query;
  const result = decrypt({ iv, encryptedData });
  res.json(result);
};
