const GeneralModel = require("../models/db/homepage.model");

const router = require("express").Router();

router.get("/", (req, res) => {
  GeneralModel.find()
    .exec()
    .then((response) => {
      res.json(new Response("General Data Display", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("General Data Display", "ERR", null, err));
    });
});

router.post("/", (req, rees) => {
  let newGeneralData = new GeneralModel(req.body);

  GeneralModel.findOne({ name: req.body.name })
    .exec()
    .then((response) => {
      if (response) {
        res.json(
          new Response("General Data Save", "ERR", null, {
            message: "Duplicate data group found :" + req.body.name,
          })
        );
      } else {
        newGeneralData
          .save()
          .then((response) => {
            res.json(new Response("General Data Save", "OK", response, null));
          })
          .catch((err) => {
            res.json(new Response("General Data Save", "ERR", null, err));
          });
      }
    })
    .catch((err) => {
      res.json(new Response("General Data Save", "ERR", null, err));
    });
});

router.put("/", (req, res) => {
  GeneralModel.findOneAndUpdate(
    { name: req.query.name },
    { $set: { relatedTo: req.body } }
  )
    .exec()
    .then((response) => {
      res.json(new Response("General Data Update", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("General Data Update", "ERR", null, err));
    });
});

router.delete("/", (req, res) => {
  GeneralModel.deleteMany({})
    .exec()
    .then((response) => {
      res.json(new Response("General Data Delete", "OK", response, null));
    })
    .catch((err) => {
      res.json(new Response("General Data Delete", "ERR", null, err));
    });
});

module.exports = router;
