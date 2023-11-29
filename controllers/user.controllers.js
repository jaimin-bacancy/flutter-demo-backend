const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const responses = require("../utils/responses");
const jwt = require("jsonwebtoken");
const Media = require("../models/Media");
const MyUser = require("../models/MyUser");

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

async function uploadMedia(req, res) {
  try {
    const newImage = new Media({
      filename: req.file.filename,
      path: req.file.path,
    });

    await newImage.save();

    return responses.successResponse(res, null, "Image uploaded successfully");
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

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { lastLogin: new Date() },
      { new: true }
    );

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
          lastLogin: updatedUser.lastLogin,
        },
        process.env.MONGO_URL,
        {
          expiresIn: "7d",
        }
      );

      return responses.successResponse(
        res,
        {
          user: {
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
          },
          token,
        },
        "Login successfully"
      );
    });
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function getMyUsers(req, res) {
  try {
    let user = await MyUser.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(req.userId),
        },
      },
    ]);

    return responses.successResponse(res, user);
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function addMyUser(req, res) {
  try {
    let checkAlreadyExist = await MyUser.find({
      email: req.body.email,
      createdBy: new mongoose.Types.ObjectId(req.userId),
    });

    // let findMyUser = checkAlreadyExist.myUsers.find((item, index) => {
    //   return item.email == req.body.email;
    // });

    if (checkAlreadyExist.length != 0) {
      return responses.badRequestResponse(res, "User already exists");
    }

    let user = await MyUser.create({
      ...req.body,
      createdBy: req.userId,
    });

    return responses.successResponse(res, user, "User added");
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function removeMyUser(req, res) {
  try {
    let user = await MyUser.findByIdAndDelete(
      new mongoose.Types.ObjectId(req.params.userId),
      { new: true }
    );

    return responses.successResponse(res, user);
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function updateMyUser(req, res) {
  try {
    let checkAlreadyExist = await MyUser.find({
      email: req.body.email,
      createdBy: new mongoose.Types.ObjectId(req.userId),
    });

    if (checkAlreadyExist.length > 1) {
      return responses.badRequestResponse(res, "User already exists");
    }

    let user = await MyUser.findByIdAndUpdate(
      req.params.userId,
      {
        ...req.body,
      },
      { new: true }
    );

    return responses.successResponse(res, user, "User update successfully");
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
  uploadMedia,
};
