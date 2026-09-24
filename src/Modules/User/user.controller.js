const User = require("./user.model");
const asyncWrapper = require("../../Middleware/errorHandler");
const appError = require("../../utils/appError");
const { sanitizeUser } = require("../../utils/sanitizeUser");

const profile = asyncWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById({ _id: userId }, { password: false }).exec();
  if (!user) {
    return next(new appError("User not found", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
});

const editProfile = asyncWrapper(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findByIdAndUpdate(userId, req.body, {
    returnDocument: "after",
  }).exec();
  if (!user) {
    return next(new appError("User not found", 404, "FAIL"));
  }
  return res.status(200).json({
    status: "success",
    data: {
      user: sanitizeUser(user),
    },
  });
});
module.exports = {
  profile,
  editProfile,
};
