const mongoose = require("mongoose");
const categoryModel = require("../models/db/category.model");
const Response = require("../models/network/response.model");

const router = require("express").Router();

router.get("/", (req, res) => {
  categoryModel
    .find()
    .exec()
    .then((result) => {
      let response = new Response("Category Display", "OK", result, null);
      res.json(response);
    })
    .catch((err) => {
      let response = new Response("Category Display", "ERR", null, err.message);
      res.json(response);
    });
});

router.post("/", (req, res) => {
  let newCategory = new categoryModel({
    name: req.body.name,
    subCategory: req.body.subCategory,
  });

  newCategory
    .save()
    .then((result) => {
      let response = new Response("Category Save", "OK", result, null);
      res.json(response);
    })
    .catch((err) => {
      let response = new Response("Category Save", "ERR", null, err.message);
      res.json(response);
    });
});

router.put("/", (req, res) => {
  if (!req.query.id || !mongoose.isValidObjectId(req.query.id)) {
    res.json(new Response("Category Update", "ERR", null, "Invalid ID"));
  }

  let updatebody = {
    name: req.body.name,
    subCategory: req.body.subCategory,
  };

  categoryModel
    .findByIdAndUpdate(req.query.id, { $set: updatebody }, { new: true })
    .exec()
    .then((result) => {
      res.json(new Response("Category Update", "OK", result, null));
    })
    .catch((err) => {
      res.json(new Response("Category Update", "ERR", null, err.message));
    });
});

router.delete("/", (req, res) => {
  if (req.query.id && !mongoose.isValidObjectId(req.query.id)) {
    res.json(new Response("Category Delete", "ERR", null, "Invalid ID"));
  } else if (!req.query.id && !req.query.all) {
    res.json(new Response("Category Delete", "ERR", null, "Invalid Options"));
  }

  let func = req.query.all
    ? categoryModel.deleteMany({})
    : categoryModel.findByIdAndDelete(req.query.id);

  func
    .exec()
    .then((result) => {
      res.json(new Response("Category Delete", "OK", result, null));
    })
    .catch((err) => {
      res.json(new Response("Category Delete", "ERR", null, err.message));
    });
});

module.exports = router;
