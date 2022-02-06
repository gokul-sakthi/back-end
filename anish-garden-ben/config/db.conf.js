const mongoose = require("mongoose");

let MONGO_URL = process.env.MONGO_URL;

const mongoOptions = {};

mongoose
  .connect(MONGO_URL, mongoOptions)
  .then((response) => {
    console.log("Mongoose connection Successful");
  })
  .catch((err) => {
    console.log("Mongoose connection Error ***********\n", err);
  });
