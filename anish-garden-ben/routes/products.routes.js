const router = require("express").Router();
const path = require("path");
const mongoose = require("mongoose");
const streamifier = require("streamifier");
const fs = require("fs");
const { multerUpload } = require("../config/multer");
const ProductModel = require("../models/db/product.model");
const { isValidObjectId } = require("mongoose");
const Response = require("../models/network/response.model");
const cloudinary = require("../config/cloudinary");

// multer

const cpUpload = multerUpload.fields([
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

  let projectionfields = {};
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

// *********************** Utility functions *************************

const uploadToCloudinary = (item, image = true) => {
  if (!image) {
    console.log("Thumbnail", item);
  }

  if (!item)
    return new Promise((res, rej) => rej(new Error("No Buffer item found")));
  else
    return new Promise((resolve, reject) => {
      let cld_upload_stream = cloudinary.uploader.upload_stream(
        {
          folder: "eplants",
        },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      console.log("ITEM BUFF + ++ + + +", item.buffer);
      streamifier.createReadStream(item.buffer).pipe(cld_upload_stream);
    });
};

const startUploadFiles = async (imageFiles = [], thumbnailFile) => {
  let tempImages = [];
  let tempThumbnail = {};
  let resultFromUpload = undefined;
  let errorEncountered = {
    status: false,
    data: null,
  };

  await imageFiles.every((item) => {
    uploadToCloudinary(item)
      .then((result) => {
        tempImages.push({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      })
      .catch((err) => {
        console.log("Error = ", err);
        errorEncountered = {
          status: true,
          data: err,
        };
      });
    if (errorEncountered.status) return false;
    return true;
  });

  if (errorEncountered.status) {
    return {
      tempImages,
      tempThumbnail,
      errorEncountered,
    };
  } else {
    await uploadToCloudinary(thumbnailFile[0], false)
      .then((result) => {
        tempThumbnail = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      })
      .catch((err) => {
        errorEncountered = {
          status: true,
          data: err,
        };
      });
  }

  return {
    tempImages,
    tempThumbnail,
    errorEncountered,
  };
};

// ***************************************************************

router.post("/addproduct", cpUpload, async (req, res) => {
  console.log(req.files.thumbnail);
  const result = await startUploadFiles(req.files.images, req.files.thumbnail);

  if (result.errorEncountered.status) {
    res.json(
      new Response("Product Save", "ERR", null, result.errorEncountered.data)
    );
    return;
  }

  const newProduct = await new ProductModel({
    name: req.body.name,
    description: req.body.description,
    images: result.tempImages,
    category: req.body.category,
    subCategory: req.body.subCategory,
    thumbnail: result.tempThumbnail,
    price: req.body.price,
    stocks: req.body.stocks,
    tags: req.body.price,
  });

  await newProduct
    .save()
    .then((response) => {
      res.json(new Response("Product Save", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Product Save", "ERR", null, err.message));
    });
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
      await res.json(new Response("Product Delete", "OK", response, null));
      removeGarbageImages([...response.images, response.thumbnail]);
    })
    .catch((err) => {
      res.json(new Response("Product Delete", "ERR", null, err.message));
    });
});

module.exports = router;

// Utility methods ***************************************************

const removeGarbageImages = (images = []) => {
  images.forEach((image) => {
    cloudinary.uploader.destroy(image.public_id, {}, (err, result) => {
      console.log(result);
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
