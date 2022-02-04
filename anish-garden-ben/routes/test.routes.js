const router = require("express").Router();

const formidable = require("formidable");

router.post("/formFileUpload", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (error, fields, files) => {
    if (error) {
      console.log(error);
    }

    console.log(fields);
    console.log(files);
  });

  res.json({
    body: req.body,
  });
});

module.exports = router;
