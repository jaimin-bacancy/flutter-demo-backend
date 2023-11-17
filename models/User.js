const mongoose = require("mongoose");
const MyUser = require("./MyUser");
const Media = require("./Media");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
      default: "",
    },
    myUsers: {
      type: [MyUser.schema],
      default: [],
    },
    profile: {
      type: Media.schema,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
