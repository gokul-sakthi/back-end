const { isValidObjectId } = require("mongoose");
const DiscountModel = require("../models/db/discount.model");
const mongoose = require("mongoose");
const Response = require("../models/network/response.model");
const ProductModel = require("../models/db/product.model");

const router = require("express").Router();

router.get("/", (req, res) => {
  (req.query.populateproducts
    ? DiscountModel.find().populate("products")
    : DiscountModel.find()
  )
    .exec()
    .then((response) => {
      res.json(new Response("Discount Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Discount Display", "ERR", null, err));
    });
});

router.get("/products", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("Discount Display", "ERR", response, null));
    return;
  }

  DiscountModel.findById(req.query.id)
    .populate("products")
    .exec()
    .then((response) => {
      res.json(new Response("Discount Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Discount Update", "ERR", null, err));
    });
});

router.post("/", (req, res) => {
  let data = req.body;

  data.products = (req.body.products || []).map((item) =>
    mongoose.Types.ObjectId(item)
  );

  let newDiscountPlan = new DiscountModel(req.body);

  newDiscountPlan
    .save()
    .then((response) => {
      updateProductsWithDiscounts(
        "Discount Save",
        data.products,
        data.discountPrice,
        res
      );
    })
    .catch((err) => {
      res.json(new Response("Discount Save", "ERR", null, err));
    });
});

router.put("/", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("Discount Update", "ERR", response, null));
    return;
  }

  DiscountModel.findByIdAndUpdate(req.query.id, { $set: req.body })
    .setOptions({ new: true })
    .exec()
    .then((response) => {
      updateProductsWithDiscounts(
        "Discount Update",
        req.body.products,
        req.body.discountPrice,
        res
      );
    })
    .catch((err) => {
      res.json(new Response("Discount Update", "ERR", null, err));
    });
});

router.delete("/", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("Discount Delete", "ERR", response, null));
    return;
  }

  DiscountModel.findByIdAndDelete(req.query.id)
    .exec()
    .then((response) => {
      res.json(new Response("Discount Delete", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Discount Delete", "ERR", null, err));
    });
});

// Utility Methods

const updateProductsWithDiscounts = (message, products, discountPrice, res) => {
  ProductModel.updateMany(
    { _id: products },
    { $set: { discountedPrice: discountPrice } }
  )
    .exec()
    .then((response) => {
      res.json(new Response(message, "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response(message, "ERR", null, err));
    });
};

module.exports = router;
