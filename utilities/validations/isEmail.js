const validator = require('validator');

module.exports = (value, key) => {
  const validationError = `Key '${key}' is not a valid email, got '${value}'`;
  if (!validator.isEmail(value)) return validationError;
};
