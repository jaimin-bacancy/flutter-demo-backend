let mongoose = require("mongoose");

let mongoURI = process.env.MONGO_URL;
let connectToMongo = async () => {
  try {
    let result = await mongoose.connect(mongoURI);
    if (result.connection.readyState === 1) {
      console.log("Database connected successfully");
    }
  } catch (e) {
    console.log("Connection to database failed");
    mongoose.connection.on("error", (err) => {
      console.log(err);
    });
  }
};

module.exports = connectToMongo;
