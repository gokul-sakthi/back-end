const mongoose = require("mongoose");

const collectionSchema = mongoose.Schema(
  {
    appName: {
      type: string,
      default: Date.now() + "-AG",
    },
  },
  { timestamps: true }
);

const CollectionModel = mongoose.model("collections", collectionSchema);

module.exports = CollectionModel;
