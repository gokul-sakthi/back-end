const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    billingAddress: {
      type: String,
    },
    phone: {
      type: String,
    },
    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "products",
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
