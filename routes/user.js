const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/user.controllers");

// add a dummy api for testing
router.get("/test", (req, res) => {
  res.send("User route testing!");
});

router.post("/register", [], register);

router.get("/login", [], login);

module.exports = router;
