const validator = require('validator');

module.exports = async (value, key) => {
  const validationError = `Field '${key}' is not a string or is empty`;
  if (typeof value !== 'string' || validator.isEmpty(value))
    return validationError;
};
