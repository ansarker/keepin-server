const crypto = require("crypto");
const passport = require("passport");
const User = require("../../models/auth/model.user");
const genPassword = require("../../lib/passwordStrategy").genPassword;
const validPassword = require("../../lib/passwordStrategy").validPassword;
const { decrypt } = require("../../helpers/helper");

const ErrorResponse = require("../../lib/errorResponse");
const sendEmail = require("../../lib/emailSender");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("bson");

exports.sign_pp = passport.authenticate("local", {
  failureRedirect: "/auth/signin-failure",
  successRedirect: "/auth/signin-success",
});

exports.signin = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new ErrorResponse("Username or password not given.", 400));
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return next(new ErrorResponse("User not found.", 400));
    }

    const isValid = validPassword(password, user.hash, user.salt);
    if (!isValid) {
      return next(new ErrorResponse("Password doesn't match", 400));
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.signup = (req, res, next) => {
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    return next(new ErrorResponse("Check input fields.", 400));
  }

  try {
    const saltHash = genPassword(password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    User.findOne(
      { $or: [{ email: email }, { username: username }] },
      (err, data) => {
        if (err) throw err;
        if (data) return next(new ErrorResponse("User already exists.", 302));
        if (!data) {
          const newUser = new User({
            email,
            username,
            salt: salt,
            hash: hash,
          });

          newUser.save().then((user) => {
            sendToken(user, 200, res);
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.forgot_password = async (req, res, next) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorResponse("Couldn't sent email.", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();
    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.reset_password = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid reset token", 400));
    }

    const saltHash = genPassword(req.body.password);
    user.salt = saltHash.salt;
    user.hash = saltHash.hash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: "Password reset success" });
  } catch (error) {
    next(error);
  }
};

exports.user_profile = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id }).select("-salt -hash");
  res.status(200).json({
    success: true,
    user,
    msg: "You are now signed in",
  });
};

exports.edit_profile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, _id } = req.body;
    const user = await User.findOne({ _id });
    if (user) {
      const any_user = await User.findOne({ email });
      if (any_user.email !== user.email) {
        return next(
          new ErrorResponse(
            "This email is associated with another account.",
            400
          )
        );
      }
    }
    const updateId = { _id: ObjectId(_id) };
    const response = await User.updateOne(updateId, {
      $set: {
        firstName: firstName,
        lastName: lastName,
        email: email,
      },
    }).exec();
    res.status(200).json({
      success: true,
      response,
      msg: "Updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.upload_photo = async (req, res, next) => {
  try {
    const { photo, _id } = req.body;
    const updateId = { _id: ObjectId(_id) };
    const response = await User.findByIdAndUpdate(updateId, {
      $set: { photo: photo },
    }).exec();
    res.status(200).json({
      success: true,
      response,
      msg: "Photo uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.decrypt = (req, res) => {
  const { salt: iv, watchword: encryptedData } = req.query;
  res.json(decrypt({ iv, encryptedData }));
};

exports.refresh_token = async (req, res, next) => {
  const refreshToken = req.body.refresh;
  if (!refreshToken) {
    return next(new ErrorResponse("Token not found!", 401));
  }

  try {
    const { username } = await jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN
    );
    // { username: 'nosu', iat: 1640156531, exp: 1640156541 }
    const user = await User.findOne({ username });
    if (!user) {
      return next(new ErrorResponse("User not found.", 400));
    }
    res.json(sendToken(user, 200, res));
  } catch (error) {
    next(error);
  }
};

const sendToken = (userInfo, statusCode, res) => {
  let access_token = userInfo.getSignedToken();
  let refresh_token = userInfo.getRefreshToken();
  // const { firstName, lastName, username, email, createdAt } = userInfo;
  // const user = { firstName, lastName, username, email, createdAt };
  res.status(statusCode).json({ access_token, refresh_token });
};
