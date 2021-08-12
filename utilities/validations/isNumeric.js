const validator = require('validator');
const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key, opts) =>
  executeValidator(
    value,
    key,
    'Numeric',
    () => !validator.isNumeric(value.toString(), opts)
  );
