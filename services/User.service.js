const User = require("../models/User");
const responses = require("../utils/responses");
const { generateToken } = require("./Token.service");

async function updateUser(
  tokenData,
  res,
  message = "User update successfully"
) {
  const updatedUser = await User.findByIdAndUpdate(
    tokenData._id,
    { lastLogin: new Date() },
    { new: true }
  );

  const token = generateToken({
    ...tokenData,
    lastLogin: updatedUser.lastLogin,
  });

  return responses.successResponse(
    res,
    {
      user: tokenData,
      token,
    },
    message
  );
}

module.exports = {
  updateUser,
};
