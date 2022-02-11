const multer = require("multer");
const fs = require("fs");

const diskStoragePathFunction = function (req, file, cb) {
  cb(null, path.join(__dirname, "../tmp/uploads/products"));
};

const diskStorageFilenameFunction = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, `${Date.now()}.${file.mimetype.split("/")[1]}`);
  } else {
    cb(null, Date.now());
  }
};

const diskStorageConfig = {
  destination: diskStoragePathFunction,
  filename: diskStorageFilenameFunction,
};

const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Only Jpeg/PNG supported" });
  }
};

const multerUpload = multer({
  limits: { fileSize: "2MB" },
  fileFilter: fileFilter,
});

module.exports = {
  multerUpload: multerUpload,
};
