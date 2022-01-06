const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema(
  {
    email: String,
    username: String,
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    salt: String,
    hash: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    photo: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ username: this.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.getRefreshToken = function () {
  return jwt.sign({ username: this.username }, process.env.JWT_REFRESH_TOKEN, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
