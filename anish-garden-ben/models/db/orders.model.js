const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "INITIATED",
      enum: ["INITIATED", "APPROVED", "DELIVERED", "CANCELLED"],
    },
    amount: {
      type: Number,
      required: true,
    },
    discountedAmount: {
      type: String,
    },
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("order", ordersSchema);

module.exports = OrderModel;
