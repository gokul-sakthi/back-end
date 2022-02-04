const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stocks: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      get: (price) => {
        return Math.floor(price);
      },

      required: true,
    },
    discountedPrice: {
      type: Number,
      default: "0",
    },
    images: [
      {
        type: Object,
        required: true,
      },
    ],
    thumbnail: {
      type: Object,
      required: true,
    },
    category: {
      type: String,
      default: "others",
    },
    subCategory: {
      type: String,
      default: "others",
    },
    tags: {
      type: [String],
      default: [],
    },
    relatedTo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("products", productSchema);

module.exports = ProductModel;
