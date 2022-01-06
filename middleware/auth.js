const jwt = require("jsonwebtoken");
const User = require("../models/auth/model.user");
const ErrorResponse = require("../lib/errorResponse");

module.exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ErrorResponse("Not authorized to view any resources.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ username: decoded.username }).select(
      "-salt -hash"
    );
    if (!user) {
      return next(new ErrorResponse("User not found with this username.", 404));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access", 401));
  }
};
