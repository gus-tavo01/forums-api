const validator = require('validator');

module.exports = (value, key, opts) => {
  const validationError = `Key '${key}' is not a number, got '${value}'`;
  if (validator.isNumeric(value, opts)) return validationError;
};
