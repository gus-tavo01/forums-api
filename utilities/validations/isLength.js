const validator = require('validator');

module.exports = (value, key, opts) => {
  const validationError = `Key '${key}' does not have the required length`;
  if (!validator.isLength(value, opts)) return validationError;
};
