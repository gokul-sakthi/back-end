const mongoose = require("mongoose");

const MONGO_URL = "mongodb://localhost:27017/agarden";
const mongoOptions = {};

mongoose
  .connect(MONGO_URL, mongoOptions)
  .then((response) => {
    console.log("Mongoose connection Successful");
  })
  .catch((err) => {
    console.log("Mongoose connection Error", err);
  });
