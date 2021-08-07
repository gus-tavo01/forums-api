const validator = require('validator');

module.exports = (value, key, opts) => {
  const validationError = `Key '${key}' is not a valid date, got '${value}'`;
  if (!validator.isDate(value, opts)) return validationError;
};
