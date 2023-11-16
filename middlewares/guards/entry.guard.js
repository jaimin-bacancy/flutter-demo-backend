const { checkToken } = require("./auth.guard");

const validateEntry = async (req, res, next) => {
  await checkToken(req, res, next);
};

module.exports = {
  validateEntry,
};
