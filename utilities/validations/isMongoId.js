const validator = require('validator');

module.exports = async (value, key) => {
  const validationError = `Field '${key}' is not a valid ID, got '${value}'`;
  if (validator.isMongoId(value)) return validationError;
};
