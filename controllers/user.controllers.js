const User = require("../models/User");
const bcrypt = require("bcrypt");
const responses = require("../utils/responses");

async function register(req, res) {
  try {
    let { name, email, password } = req.body;
    let user = await User.findOne({ email: email });

    if (user) {
      return responses.badRequestResponse(res, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newData = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return responses.successResponse(res, null, "Register successfully");
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function login(req, res) {
  try {
    let { email, password } = req.query;
    let user = await User.findOne({ email: email });

    if (!user) {
      return responses.authFailureResponse(
        res,
        "User does't exist with provided credentials"
      );
    }

    bcrypt.compare(password, user.password, function (err, result) {
      if (!result) {
        return responses.authFailureResponse(
          res,
          "User does't exist with provided credentials"
        );
      }

      return responses.successResponse(res, null, "Login successfully");
    });
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

module.exports = {
  register,
  login,
};
