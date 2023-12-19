const jwt = require("jsonwebtoken");

function generateToken(data, expiresIn = "7d") {
  const token = jwt.sign(data, process.env.MONGO_URL, {
    expiresIn,
  });

  return token;
}

module.exports = {
  generateToken,
};
