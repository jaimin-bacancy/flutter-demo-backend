const jwt = require("jsonwebtoken");
const { authFailureResponse } = require("../../utils/responses");

const TAG = "auth.guard";

const checkToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization && !req.headers.Authorization)
      return authFailureResponse(res, "Please provide bearer token!");

    const auth = req.headers.authorization || req.headers.Authorization;
    const token = auth.split(" ")[1];
    const result = jwt.verify(token, process.env.MONGO_URL, {
      complete: true,
    });
    // console.log("result :>> ", result);

    if (result.payload) {
      let payload = result.payload;

      req.payload = payload;
      req.userId = payload._id;
      next();
    } else {
      return authFailureResponse(res);
    }
  } catch (err) {
    console.log("auth.guard: ", err.message);
    return authFailureResponse(
      res,
      err.message
        ? err.message.includes("expired")
          ? "Token has expired! Please signin again."
          : err.message.includes("malformed")
          ? "You've entered an invalid token!"
          : "Either token is invalid or has expired!"
        : "Either token is invalid or has expired!"
    );
  }
};

module.exports = {
  checkToken,
};
