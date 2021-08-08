const validator = require('validator');
const executeValidator = require('../../common/processors/errorManager/executeValidator');

module.exports = async (value, key) =>
  executeValidator(value, key, 'GUID', () => !validator.isMongoId(value));
