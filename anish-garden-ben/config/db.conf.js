const mongoose = require("mongoose");

let MONGO_URL;

if (process.argv.includes("test")) {
  MONGO_URL = "mongodb://localhost:27017/agarden";
} else {
  MONGO_URL = process.env.MONGO_URL;
}

const mongoOptions = {};

mongoose
  .connect(MONGO_URL, mongoOptions)
  .then((response) => {
    console.log("Mongoose connection Successful");
  })
  .catch((err) => {
    console.log("Mongoose connection Error", err);
  });
