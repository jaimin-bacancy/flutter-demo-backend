require("dotenv").config();
const express = require("express");
const cors = require("cors");

let connectToMongo = require("./database");
connectToMongo();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", require("./routes/user"));

let port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
