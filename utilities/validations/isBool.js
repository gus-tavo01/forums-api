const validator = require('validator');

module.exports = async (value, key) => {
  // TODO handle data types
  if (validator.isBoolean(value)) return `${key} is not a valid boolean`;
};
