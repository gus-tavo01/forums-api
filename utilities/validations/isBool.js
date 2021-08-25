const validator = require('validator');
const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key) =>
  executeValidator(
    value,
    key,
    'Boolean',
    () => !validator.isBoolean(value.toString())
  );
