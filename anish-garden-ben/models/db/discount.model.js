const mongoose = require("mongoose");

const discountSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    discountPrice: {
      type: String,
    },
    products: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "products",
      default: [],
    },
  },
  { timestamps: true }
);

const DiscountModel = mongoose.model("discount", discountSchema);

module.exports = DiscountModel;
