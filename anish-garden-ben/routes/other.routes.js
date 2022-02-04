const globalData = require("../globalData");
const Response = require("../models/network/response.model");

const router = require("express").Router();

router.get("/homepagedata", (req, res) => {
  res.json(
    new Response(
      "Hompage Data Display",
      "OK",
      { homepage: globalData.homepage },
      null
    )
  );
});

router.put("/homepagedata", (req, res) => {
  globalData.homepage.carousel.images = req.body.images;
  globalData.homepage.discountSection.text = req.body.discounttext;

  res.json(
    new Response(
      "Hompage Data Update",
      "OK",
      { homepage: globalData.homepage },
      null
    )
  );
});

module.exports = router;
