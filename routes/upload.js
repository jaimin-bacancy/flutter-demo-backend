const express = require("express");
const router = express.Router();
const { uploadMedia, getMedia } = require("../controllers/user.controllers");
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
  res.send("Upload route testing!");
});

router.post("/", upload.single("image"), uploadMedia);

router.get("/", getMedia);

module.exports = router;
