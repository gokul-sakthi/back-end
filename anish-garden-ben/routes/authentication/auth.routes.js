const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../../models/db/user.model");
const { response } = require("express");

const router = require("express").Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      res.json({ errors: err, info: info });
    } else {
      if (!user) res.json({ info: info });
      else {
        req.logIn(user, (err) => {
          if (err)
            res.json({
              errors: err,
              info: info,
            });
          else
            res
              .status(200)
              .json({ info: { message: "Login Successful" }, userId: user.id });
        });
      }
    }
  })(req, res, next);
});

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        res.json({ message: "User already exists, Please sign in" });
      } else {
        let newUser = new User(req.body);
        bcrypt
          .hash(newUser.password, 10)
          .then((hashedPassword) => {
            newUser.password = hashedPassword;
            newUser.save().then((response) => {
              res.json({
                message: "Registration Successful",
                user: response,
              });
            });
          })
          .catch((err) => {
            console.log(err);
            res.json({ message: "Error in registration", errors: err });
          });
      }
    })
    .catch((err) => {
      res.json({ errors: err });
    });
});

router.get("/status", (req, res) => {
  let responseData = {};
  responseData["statuscheck"] = req.isAuthenticated();
  if (req.user) {
    responseData.userId = req.user._id;
  }

  console.log(req.user);
  res.json(responseData);
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  req.logout();
  res.json({ message: "User logged out" });
});

module.exports = router;
