const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  filename: {
    type: String,
  },
  path: {
    type: String,
  },
});

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);
module.exports = Media;
