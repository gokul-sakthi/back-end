const router = require("express").Router();
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");

const ProductModel = require("../models/db/product.model");
const { isValidObjectId } = require("mongoose");
const Response = require("../models/network/response.model");

// multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../tmp/uploads/products"));
  },
  filename: function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, `${Date.now()}.${file.mimetype.split("/")[1]}`);
    } else {
      cb(null, Date.now());
    }
  },
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Only Jpeg/PNG supported" });
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: "2MB" },
  fileFilter: fileFilter,
});

const cpUpload = upload.fields([
  { name: "images", maxCount: 4 },
  { name: "thumbnail", maxCount: 1 },
]);

// ******************************************

router.get("/", (req, res) => {
  let query = {};

  // if (req.query) {
  //   console.log(req.query.id);
  //   if (!isValidObjectId(req.query.id)) {
  //     res.json(new Response("Product Display", "ERR", null, "Invalid ID"));
  //     return;
  //   } else {
  //     query._id = mongoose.Types.ObjectId(req.query.id);
  //   }
  // }

  let projectionfields = {
    images: {
      mimetype: false,
      path: false,
    },
    thumbnail: {
      mimetype: false,
      path: false,
    },
  };
  console.log(query);
  ProductModel.find(query, projectionfields)
    .exec()
    .then((response) => {
      res.json(new Response("Product Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Display", "ERR", null, err));
    });
});

router.get("/featured", (req, res) => {
  ProductModel.find({ tags: "featured" }, {})
    .exec()
    .then((response) => {
      res.json(new Response("Product Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Display", "ERR", null, err));
    });
});

router.get("/one", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("Product Display", "ERR", null, "Invalid ID"));
    return;
  }
  ProductModel.findById(req.query.id, {})
    .exec()
    .then((response) => {
      res.json(new Response("Product Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Display", "ERR", null, err));
    });
});

router.post("/query", (req, res) => {
  console.log("Body", req.body);
  let query = constructQueryForProducts(req.body.query);
  console.log(query);
  ProductModel.find(query)
    .exec()
    .then((response) => {
      res.json(new Response("Product Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Display", "ERR", null, err));
    });
});

router.post("/addproduct", cpUpload, (req, res) => {
  const imageFromBody = req.files.images.map((image) => {
    return {
      filename: image.filename,
      path: image.path,
      mimetype: image.mimetype,
      originalName: image.originalname,
      size: image.size,
    };
  });
  const thumbnailFromBody = req.files.thumbnail.map((image) => {
    return {
      filename: image.filename,
      path: image.path,
      mimetype: image.mimetype,
      originalName: image.originalname,
      size: image.size,
    };
  })[0];

  const newProduct = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    images: imageFromBody,
    category: req.body.category,
    subCategory: req.body.subCategory,
    thumbnail: thumbnailFromBody,
    price: req.body.price,
    stocks: req.body.stocks,
    tags: req.body.price,
  });

  newProduct
    .save()
    .then((response) => {
      res.json(new Response("Product Save", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Save", "ERR", null, err.message));
    });

  // console.log(req.files);
  // console.log(req.body);
  // res.json({
  //   files: req.files,
  //   fields: req.body,
  // });
});

router.put("/", cpUpload, (req, res) => {
  checkIdValidityAndSendResponse(req.query.id, req, res);

  console.log("Id = ", req.query.id);
  let updateBody = {};
  let projectionfields = {
    "images.path": true,
    "thumbnail.path": true,
  };

  if (req.files.images) {
    updateBody.images = req.files.images.map((image) => {
      return {
        filename: image.filename,
        path: image.path,
        mimetype: image.mimetype,
        originalName: image.originalname,
        size: image.size,
      };
    });
  }

  if (req.files.thumbnail) {
    updateBody.thumbnail = req.files.thumbnail.map((image) => {
      return {
        filename: image.filename,
        path: image.path,
        mimetype: image.mimetype,
        originalName: image.originalname,
        size: image.size,
      };
    })[0];
  }
  updateBody = { ...updateBody, ...req.body };

  console.log(updateBody);
  ProductModel.findByIdAndUpdate(
    req.query.id,
    { $set: updateBody },
    { projection: projectionfields }
  )
    .exec()
    .then(async (oldProduct) => {
      // console.log("Old Product");
      await res.json(new Response("Product Update", "OK", null, null));
      await removeGarbageImages([...oldProduct.images, oldProduct.thumbnail]);
    })
    .catch((err) => {
      res.json(new Response("Product Update", "ERR", null, err.message));
    });
});

router.put("/stocks", (req, res) => {
  checkIdValidityAndSendResponse(req.body.id, req, res);
  let projectionfields = {
    name: true,
    stocks: true,
    price: true,
  };
  let stockCount = req.body.stockCount || 0;

  ProductModel.findByIdAndUpdate(req.body.id, {
    $set: { stocks: stockCount },
  })
    .setOptions({ new: true, projection: projectionfields })
    .exec()
    .then((response) => {
      res.json(new Response("Product Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Update", "ERR", null, err.message));
    });
});

router.delete("/", (req, res) => {
  let query;

  if (req.query.ids) {
    query = {
      $in: req.query.ids,
    };
  } else if (req.query.all) {
    query = {};
  } else {
    res.json(
      new Response(
        "Product Delete",
        "ERR",
        null,
        "Please provide valid option in qs"
      )
    );
  }

  ProductModel.deleteMany(query, null, (err) => {
    res.json(new Response("Product Delete", "ERR", null, err.message));
  });
});

router.delete("/id", (req, res) => {
  checkIdValidityAndSendResponse(req.query.id, req, res);

  ProductModel.findByIdAndDelete(req.query.id)
    .exec()
    .then(async (response) => {
      console.log(response.images);
      await res.json(new Response("Product Delete", "OK", response, null));
      await removeGarbageImages([...response.images, response.thumbnail]);
    })
    .catch((err) => {
      res.json(new Response("Product Delete", "ERR", null, err.message));
    });
});

module.exports = router;

// Utility methods ***************************************************

const removeGarbageImages = (images = []) => {
  images.forEach((image) => {
    fs.unlink(image.path, (err) => {
      console.log("Err in unlinking file -> " + image.path);
    });
  });
};

const checkIdValidityAndSendResponse = (id, req, res) => {
  if (!id || !isValidObjectId(id))
    res.json(new Response("Product Update", "ERR", null, "Invalid ID"));
};

const constructQueryForProducts = (filterData) => {
  console.log(filterData);

  let query = {};

  if (filterData.name) {
    let name = filterData.name.toString().split(" ").join("|");
    query["name"] = new RegExp(name, "i");
  }
  if (filterData.category && filterData.category.length > 0) {
    query["category"] = { $in: filterData.category };
  }
  if (filterData.subCategory && filterData.subCategory.length > 0) {
    query["subCategory"] = { $in: filterData.subCategory };
  }
  if (filterData.stocks) {
    if (filterData.stocks.gte && filterData.stocks.lte) {
      query["stocks"] = {
        stocks: { $lte: filterData.stocks.lte, $gte: filterData.stocks.gte },
      };
    } else if (filterData.stocks.gte) {
      query["stocks"] = {
        stocks: { $gte: filterData.stocks.gte },
      };
    } else if (filterData.stocks.lte) {
      query["stocks"] = {
        stocks: { $lte: filterData.stocks.lte },
      };
    }
  }
  if (filterData.price) {
    if (filterData.price.gte && filterData.price.lte) {
      query["price"] = {
        $lte: filterData.price.lte,
        $gte: filterData.price.gte,
      };
    } else if (filterData.price.gte) {
      query["price"] = {
        $gte: filterData.price.gte,
      };
    } else if (filterData.price.lte) {
      query["price"] = {
        $lte: filterData.price.lte,
      };
    }
  }

  return query;
};
