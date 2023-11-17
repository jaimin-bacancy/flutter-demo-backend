const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMyUsers,
  addMyUser,
  removeMyUser,
  updateMyUser,
  uploadMedia,
} = require("../controllers/user.controllers");
const { validateEntry } = require("../middlewares/guards/entry.guard");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the folder where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Use a unique filename
  },
});

const upload = multer({ storage: storage });

// add a dummy api for testing
router.get("/test", (req, res) => {
  res.send("User route testing!");
});

router.post("/register", [], register);

router.post("/upload", upload.single("image"), uploadMedia);

router.get("/login", [], login);

router.get("/myUsers", validateEntry, getMyUsers);

router.post("/addUser", validateEntry, addMyUser);

router.put("/:userId/updateUser", validateEntry, updateMyUser);

router.delete("/:userId/removeUser", validateEntry, removeMyUser);

module.exports = router;
