const validator = require('validator');
const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key, opts) =>
  executeValidator(
    value,
    key,
    'numeric',
    () => !validator.isNumeric(value, opts)
  );
