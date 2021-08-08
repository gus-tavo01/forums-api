const validator = require('validator');
const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key, opts) => {
  executeValidator(
    value,
    key,
    `length ${JSON.stringify(opts)}`,
    () => !validator.isLength(value, opts)
  );
};
