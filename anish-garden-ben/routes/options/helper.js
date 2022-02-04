const mongoose = require("mongoose");

const fieldOptions = {
  users: {
    _id: true,
  },
  products: {
    _id: true,
    collectionId: true,
  },
  collections: {
    _id: true,
  },
};

const convertFieldToObjectId = (modelType, options = {}) => {
  if (!fieldOptions[modelType]) return options;

  let fieldsToConvert = fieldOptions[modelType];

  Object.keys.apply(fieldsToConvert).forEach((field) => {
    if (options[field]) {
      options[field] = mongoose.Types.ObjectId(options[field]);
    }
  });

  return options;
};

module.exports = {
  convertFieldToObjectId,
};
