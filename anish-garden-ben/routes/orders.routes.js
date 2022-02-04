const { isValidObjectId } = require("mongoose");
const OrderModel = require("../models/db/orders.model");
const Response = require("../models/network/response.model");
const mongoose = require("mongoose");
const ProductModel = require("../models/db/product.model");
const router = require("express").Router();

const getOrdersForAdmin = (req, res) => {
  OrderModel.aggregate([
    {
      $group: {
        _id: "$status",
        orders: {
          $push: "$$ROOT",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ])
    .exec()
    .then((response) => {
      res.json(new Response("Orders Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Display", "ERR", null, err));
    });
};

router.get("/", (req, res) => {
  let query = {};
  let projection = {};

  let admin = req.query.admin || true;

  if (admin) {
    getOrdersForAdmin(req, res);
    return;
  }

  if (req.query.id) {
    if (!isValidObjectId(req.query.id)) {
      res.json(new Response("Orders Display", "ERR", null, "INVALID ID"));
      return;
    } else {
      query._id = mongoose.Types.ObjectId(req.query.id);
    }
  }

  OrderModel.find(query, projection)
    .populate("productId")
    .exec()
    .then((response) => {
      res.json(new Response("Orders Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Display", "ERR", null, err));
    });
});

router.get("/select", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("Orders Display", "ERR", null, "INVALID ID"));
    return;
  }
  OrderModel.findById(req.query.id)
    .populate("productId", { images: false, thumbnail: false })
    .populate("userId", { password: false, wishlist: false })
    .exec()
    .then((response) => {
      res.json(new Response("Orders Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Display", "ERR", null, err));
    });
});

router.get("/user", (req, res) => {
  OrderModel.find({
    userId: mongoose.Types.ObjectId(req.user._id),
  })
    .sort({ createdAt: -1 })
    .populate("productId")
    .exec()
    .then((response) => {
      res.json(new Response("Orders Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Display", "ERR", null, err));
    });
});

router.post("/", (req, res) => {
  let errors = false;
  let orderFrombody = req.body.orders || [];
  let productIDsFromOrders = [];
  let newOrders = [];

  orderFrombody.every((item) => {
    if (isValidObjectId(item.productId)) {
      // productIDsFromOrders.push(mongoose.Types.ObjectId(item.productId));
      productIDsFromOrders.push(item.productId);
    } else {
      res.json(
        new Response("Orders Save", "ERR", null, {
          message: "Invalid id for product",
          item: item,
        })
      );
      errors = true;
      return false;
    }
  });

  // console.log(productIDsFromOrders);

  if (errors) return;

  ProductModel.find()
    .where("_id")
    .in(productIDsFromOrders)
    .exec()
    .then((response) => {
      // console.log("found");
      let allInStock = true;
      // console.log(response);

      for (let item of response) {
        let quantity = getQuantityFromOrdersBody(
          item._id.toString(),
          orderFrombody
        ).quantity;
        if (item.stocks - quantity >= 0) {
          // console.log("Instock");
          let Itemprice = item.price * quantity;
          newOrders.push(
            new OrderModel({
              userId: mongoose.Types.ObjectId(req.user._id),
              productId: mongoose.Types.ObjectId(item._id),
              amount: Itemprice,
              quantity: quantity,
              discountedAmount: computeDiscountedPrice(
                Itemprice,
                item.discountedPrice
              ),
            })
          );
        } else {
          res.json(
            new Response("Orders Save", "ERR", item, {
              message: "product out of stock",
            })
          );
          allInStock = false;
          break;
        }
      }

      // res.json("All Ok");
      if (allInStock) {
        console.log(newOrders);
        OrderModel.insertMany(newOrders)
          .then((response) => {
            // console.log(response);
            res.json(new Response("Orders Save", "OK", response, null));
            reduceStocksCount([...newOrders]);
          })
          .catch((err) => {
            console.log(err);
            res.json(new Response("Orders Save", "ERR", null, err));
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(new Response("Orders Save", "ERR", null, err));
    });
});

router.put("/update", (req, res) => {
  if (!isValidObjectId(req.body.id)) {
    res.json(new Response("Orders Display", "ERR", null, "INVALID ID"));
    return;
  }

  if (
    !["CANCELLED", "APPROVED", "DELIVERED"].includes(
      req.body.status.toUpperCase()
    )
  ) {
    res.json(new Response("Orders Display", "ERR", null, "INVALID OPTION"));
    return;
  }

  OrderModel.findByIdAndUpdate(
    req.body.id,
    { $set: { status: req.body.status.toUpperCase() } },
    { new: true }
  )
    .exec()
    .then((response) => {
      // console.log(response);
      res.json(new Response("Order Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Update", "ERR", null, err));
    });
});

router.delete("/all", (req, res) => {
  OrderModel.deleteMany({})
    .exec()
    .then((response) => {
      // console.log(response);
      res.json(new Response("Orders Delete", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("Orders Delete", "ERR", null, err));
    });
});

const computeDiscountedPrice = (price, discount) => {
  if (discount < 1) {
    return 0;
  } else {
    return price - price * (discount / 100).toFixed(2);
  }
};

const getQuantityFromOrdersBody = (id, orderFrombody) =>
  orderFrombody.find((item) => item.productId === id);

const reduceStocksCount = (orders) => {
  orders.forEach((order) => {
    ProductModel.findOneAndUpdate(
      { _id: order.productId },
      { $inc: { stocks: -1 * order.quantity } }
    )
      .then((response) => {
        // console.log(response.stocks);
        console.log("product stock reduced");
      })
      .catch((err) => {
        console.log("product stock reduction error");
      });
  });
};

module.exports = router;
