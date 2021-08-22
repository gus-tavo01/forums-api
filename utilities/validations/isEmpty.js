const validator = require('validator');

module.exports = async (value, key) => {
  // possible validation errors
  const notString = `Field '${key}' is not a string`;
  const isEmpty = `Field '${key}' is empty`;

  if (typeof value !== 'string') return notString;
  if (validator.isEmpty(value)) return isEmpty;
};
