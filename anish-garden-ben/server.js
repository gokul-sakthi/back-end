require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

const Response = require("./models/network/response.model");
const userRoutes = require("./routes/users.routes");
const productRoutes = require("./routes/products.routes");
const collectionRoutes = require("./routes/collections.routes");
const categoryRoutes = require("./routes/category.routes");
const discountRoutes = require("./routes/discount.routes");
const orderRoutes = require("./routes/orders.routes");
const authRoutes = require("./routes/authentication/auth.routes");
const testRoutes = require("./routes/test.routes");
const otherRoutes = require("./routes/other.routes");
const passport = require("passport");

const PORT = process.env.PORT || 8000;
const app = express();

// modules

require("./config/db.conf");
require("./routes/authentication/passport/setup");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("*/products", express.static("tmp/uploads/products"));

// session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/agarden",
    }),
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/collections", collectionRoutes);
app.use("/category", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/discounts", discountRoutes);
app.use("/orders", orderRoutes);
app.use("/test", testRoutes);
app.use("/others", otherRoutes);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

// error
// app.use((err, req, res, next) => {
//   res.status(err.statusCode || 500);
//   if (res.headersSent) {
//     return next(err);
//   }
//   res.json(new Response("An error occured", err.statusCode, undefined, err));
// });

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
