const express = require("express");
const router = express.Router();
const controller = require("./user.controller");
const verifyToken = require("../../Middleware/verifyToken");
const validate = require("../../Middleware/validate");
const { editProfileSchema } = require("./user.validation");
router.route("/me").get(verifyToken, controller.profile).patch(
  verifyToken,

  validate(editProfileSchema),

  controller.editProfile,
);

module.exports = router;
