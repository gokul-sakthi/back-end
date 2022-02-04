const { isValidObjectId, Types: MongooseTypes, Types } = require("mongoose");

var mongoose = require("mongoose");

const User = require("../models/db/user.model");
const Response = require("../models/network/response.model");

const router = require("express").Router();
// mongoose.set("debug", true);
// Find Query
router.get("/", (req, res) => {
  User.find()
    .exec()
    .then((response) => {
      res.json(new Response("User Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("User Display", "ERR", null, err));
    });
});

router.post("/", (req, res) => {
  let newUser = new User(req.body);

  newUser
    .save()
    .then((response) => {
      res.json(new Response("User Save", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("User Save", "ERR", null, err));
    });
});

// ******************************* Wishlist ********************************

// get wishlist
router.get("/wishlist", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("User Wishlist Display", "ERR", null, "Invalid ID"));

    return;
  }

  User.findById(req.query.id, { wishlist: true })
    .populate("wishlist")
    .exec()
    .then((response) => {
      if (response) {
        console.log(response);
        res.json(new Response("User Wishlist Display", "OK", response, null));
      } else
        res.json(
          new Response(
            "User Wishlist Display",
            "ERR",
            null,
            "User doesn't exist"
          )
        );
    })
    .catch((err) => {
      res.json(new Response("User Wishlist Display", "ERR", null, err));
    });
});

// update wishlist

router.put("/wishlist", (req, res) => {
  if (!req.query.id || !isValidObjectId(req.query.id)) {
    res.json(new Response("User Wishlist Update", "ERR", null, "Invalid ID"));
    return;
  }

  if (!req.query.userid || !isValidObjectId(req.query.userid)) {
    res.json(
      new Response("User Wishlist Update", "ERR", null, "Invalid User ID")
    );
    return;
  }

  let operationType = req.query.operation || "add";
  // console.log(`OperationType = ${req.query.operation}`);
  // console.log(req.query);
  let productID = Types.ObjectId(req.query.id);
  let updateBody =
    operationType === "add"
      ? {
          $addToSet: { wishlist: productID },
        }
      : {
          $pull: { wishlist: productID },
        };

  User.findOneAndUpdate({ _id: Types.ObjectId(req.query.userid) }, updateBody)
    .setOptions({ new: true, projection: { wishlist: true } })
    .populate("wishlist")
    .exec()
    .then((response) => {
      // console.log("After Update", response);
      res.json(new Response("User Wishlist Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("User Wishlist Update", "ERR", null, err));
    });
});

module.exports = router;
