const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = (value, key) =>
  executeValidator(value, key, 'Boolean', () => typeof value !== 'boolean');
