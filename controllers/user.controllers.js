const User = require("../models/User");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const responses = require("../utils/responses");
const Media = require("../models/Media");
const MyUser = require("../models/MyUser");
const { getGoogleUser } = require("../services/GoogleSignIn.service");
const { generateToken } = require("../services/Token.service");
const { updateUser } = require("../services/User.service");

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

    return responses.successResponse(res, newData, "Register successfully");
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

    const data = await newImage.save();

    return responses.successResponse(res, data, "Image uploaded successfully");
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function getMedia(req, res) {
  try {
    const files = await Media.find();

    return responses.successResponse(res, files, "Image get successfully");
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
    } else if (user.socialType != "4") {
      return responses.authFailureResponse(
        res,
        "It appears you may have signed up with a different method"
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

      const token = generateToken({
        _id: user._id,
        email: user.email,
        name: user.name,
        lastLogin: updatedUser.lastLogin,
      });

      return responses.successResponse(
        res,
        {
          user: {
            _id: updatedUser._id,
            email: updatedUser.email,
            name: updatedUser.name,
            socialType: updatedUser.socialType,
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

async function handleGoogleSignIn(req, res) {
  try {
    const { idToken } = req.body;

    const { name, email } = await getGoogleUser(idToken);

    let user = await User.findOne({ email: email });

    if (user) {
      const data = {
        _id: user._id,
        email: user.email,
        name: user.name,
        socialType: user.socialType,
      };

      return await updateUser(data, res, "Login successfully");
    }

    const newData = await User.create({
      name: name,
      email: email,
      password: null,
      socialType: "1",
    });

    const data = {
      _id: newData._id,
      email: newData.email,
      name: newData.name,
      socialType: newData.socialType,
    };

    return await updateUser(data, res, "Login successfully");
  } catch (error) {
    return responses.internalFailureResponse(
      res,
      error,
      "Invalid token signature"
    );
  }
}

async function socialLogin(req, res) {
  try {
    let { socialType } = req.query;

    if (socialType == "1") {
      return await handleGoogleSignIn(req, res);
    }
  } catch (error) {
    return responses.internalFailureResponse(res, error);
  }
}

async function getMyUsers(req, res) {
  try {
    const searchText = req.query.query;

    const query = {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.userId),
      },
    };

    if (searchText) {
      query.$match.$and = [
        {
          name: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    let user = await MyUser.aggregate([
      query,
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profile: 1,
          dob: 1,
          createdBy: 1,
        },
      },
    ]);
    const totalLength = user.length;
    const offset = req.query.offset ?? 0;
    const limit = offset + (req.query.limit ?? 10);
    const paginatedData = user.slice(offset, limit);

    return responses.paginatedResponse(
      res,
      paginatedData,
      totalLength,
      parseInt(offset, 10)
    );
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
  socialLogin,
  getGoogleUser,
  getMyUsers,
  addMyUser,
  removeMyUser,
  updateMyUser,
  uploadMedia,
  getMedia,
};
