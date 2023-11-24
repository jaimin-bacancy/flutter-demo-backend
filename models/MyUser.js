const mongoose = require("mongoose");
const Media = require("./Media");

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
    profile: {
      type: Media.schema,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const MyUser = mongoose.models.MyUser || mongoose.model("MyUser", myUserSchema);
module.exports = MyUser;
