const CollectionModel = require("../models/db/collection.model");
const Response = require("../models/network/response.model");
const mongoose = require("mongoose");

const router = require("express").Router();

router.get("/", (req, res) => {
  CollectionModel.find()
    .exec()
    .then((response) => {
      res.json(new Response("Collection Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Collection Display", "ERR", null, err.message));
    });
});

router.get("/products", (req, res) => {
  if (!req.query.id || !mongoose.isValidObjectId(req.query.id)) {
    res.json(new Response("Collection Display", "ERR", null, "Invalid ID"));
    return;
  }

  CollectionModel.findById(req.query.id, { products: true, name: true })
    .populate("products")
    .exec()
    .then((response) => {
      res.json(new Response("Collection Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Collection Display", "OK", null, err));
    });
});

router.post("/", (req, res) => {
  req.body.products.forEach((productId) => {
    if (!mongoose.isValidObjectId(productId)) {
      res.json(
        new Response("Collection Save", "ERR", null, "Invalid ID in response")
      );
    }
  });

  let newcollection = new CollectionModel({
    name: req.body.name,
    description: req.body.description,
    products: req.body.products,
  });

  newcollection
    .save()
    .then((response) => {
      res.json(new Response("Collection Save", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Collection Save", "ERR", null, err.message));
    });
});

router.put("/", (req, res) => {
  if (!req.query.id || !mongoose.isValidObjectId(req.query.id)) {
    res.json(new Response("Collection Update", "ERR", null, "Invalid ID"));
  }

  let updatebody = req.body;

  CollectionModel.findByIdAndUpdate(req.query.id, updatebody)
    .setOptions({ new: true })
    .exec()
    .then((response) => {
      res.json(new Response("Collection Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Collection Update", "ERR", null, err.message));
    });
});

router.delete("/", (req, res) => {
  if (req.query.id && !mongoose.isValidObjectId(req.query.id)) {
    res.json(new Response("Category Delete", "ERR", null, "Invalid ID"));
  } else if (!req.query.id && !req.query.all) {
    res.json(new Response("Category Delete", "ERR", null, "Invalid Options"));
  }

  let func = req.query.all
    ? CollectionModel.deleteMany({})
    : CollectionModel.findByIdAndDelete(req.query.id);

  func
    .exec()
    .then((result) => {
      res.json(new Response("Collection Delete", "OK", result, null));
    })
    .catch((err) => {
      res.json(new Response("Collection Delete", "ERR", null, err.message));
    });
});

module.exports = router;
