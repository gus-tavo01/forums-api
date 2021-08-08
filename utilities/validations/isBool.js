const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key) =>
  executeValidator(value, key, 'boolean', () => typeof value !== 'boolean');
