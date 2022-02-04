const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../../../models/db/user.model");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email })
      .exec()
      .then((user) => {
        if (!user) {
          const newUser = new User({ email, password });

          /*
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hashedString) => {
              if (err) throw err;

              newUser.password = hashedString;
              newUser
                .save()
                .then((userToBeSaved) => {
                  done(null, userToBeSaved);
                })
                .catch((err) => {
                  done(null, false, { message: err });
                });
            });
          });

          */

          done(null, false, {
            message: "No user found",
          });
        } else {
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            return isMatch
              ? done(null, user)
              : done(null, false, {
                  message: "Incorrect Credentials",
                });
          });
        }
      })
      .catch((err) => {
        return done(null, false, { message: err });
      });
  })
);

module.exports = passport;
