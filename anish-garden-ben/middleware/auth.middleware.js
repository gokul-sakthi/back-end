const passport = require("passport");

const auth = () => {
  return (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) res.status(400).json({ statusCode: "101", message: err });
      req.login(user, function (error) {
        if (error) return next(error);
        next();
      });
    })(req, res, next);
  };
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res
    .status(400)
    .json({ statusCode: 400, message: "not authenticated" });
};

module.exports = {
  auth,
  isLoggedIn,
};
