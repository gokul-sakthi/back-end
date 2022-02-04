const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subCategory: {
    type: [String],
    default: ["All"],
  },
});

const categoryModel = mongoose.model("category", categorySchema);

module.exports = categoryModel;
