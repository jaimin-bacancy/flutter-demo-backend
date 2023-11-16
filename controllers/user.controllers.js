const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const responses = require("../utils/responses");
const jwt = require("jsonwebtoken");

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

      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        process.env.MONGO_URL
      );

      return responses.successResponse(res, { token }, "Login successfully");
    });
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function getMyUsers(req, res) {
  try {
    let user = await User.findById(req.userId);

    return responses.successResponse(res, user.myUsers);
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function addMyUser(req, res) {
  try {
    let checkAlreadyExist = await User.findById(req.userId);

    let findMyUser = checkAlreadyExist.myUsers.find((item, index) => {
      return item.email == req.body.email;
    });

    if (findMyUser) {
      return responses.badRequestResponse(res, "User already exists");
    }

    let user = await User.findByIdAndUpdate(
      req.userId,
      {
        $addToSet: {
          myUsers: req.body,
        },
      },
      { new: true }
    );

    return responses.successResponse(res, user.myUsers, "User added");
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function removeMyUser(req, res) {
  try {
    let user = await User.findByIdAndUpdate(
      req.userId,
      {
        $pull: {
          myUsers: {
            _id: new mongoose.Types.ObjectId(req.params.userId),
          },
        },
      },
      { new: true }
    );

    return responses.successResponse(res, user.myUsers);
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function updateMyUser(req, res) {
  try {
    let checkAlreadyExist = await User.findById(req.userId);

    let findMyUser = checkAlreadyExist.myUsers.find((item, index) => {
      return item.email == req.body.email && item._id != req.params.userId;
    });

    if (findMyUser) {
      return responses.badRequestResponse(res, "User already exists");
    }

    let user = await User.findOneAndUpdate(
      {
        _id: req.userId,
        "myUsers._id": new mongoose.Types.ObjectId(req.params.userId),
      },
      {
        $set: {
          "myUsers.$.name": req.body.name,
          "myUsers.$.email": req.body.email,
        },
      },
      { new: true }
    );

    return responses.successResponse(
      res,
      user.myUsers,
      "User update successfully"
    );
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

module.exports = {
  register,
  login,
  getMyUsers,
  addMyUser,
  removeMyUser,
  updateMyUser,
};
