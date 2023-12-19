const express = require("express");
const router = express.Router();
const {
  register,
  login,
  socialLogin,
  getGoogleUser,
  getMyUsers,
  addMyUser,
  removeMyUser,
  updateMyUser,
} = require("../controllers/user.controllers");
const { validateEntry } = require("../middlewares/guards/entry.guard");

// add a dummy api for testing
router.get("/test", (req, res) => {
  res.send("User route testing!");
});

router.post("/register", [], register);

router.get("/login", [], login);

router.post("/socialLogin", [], socialLogin);

router.get("/myUsers", validateEntry, getMyUsers);

router.post("/addUser", validateEntry, addMyUser);

router.put("/:userId/updateUser", validateEntry, updateMyUser);

router.delete("/:userId/removeUser", validateEntry, removeMyUser);

module.exports = router;
