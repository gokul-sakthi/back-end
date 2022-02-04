const mongoose = require("mongoose");

const collectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "products",
      default: [],
    },
  },
  { timestamps: true }
);

const CollectionModel = mongoose.model("collections", collectionSchema);

module.exports = CollectionModel;
