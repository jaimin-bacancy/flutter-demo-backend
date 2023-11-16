const mongoose = require("mongoose");

const myUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const MyUser = mongoose.models.MyUser || mongoose.model("MyUser", myUserSchema);
module.exports = MyUser;
