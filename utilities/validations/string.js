const validator = require('validator');

module.exports = {
  isMongoId: (prop, value) => ({
    validation: 'isMongoId',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to be a valid mongo id. Got: ${value}`,
    execute: () => validator.isMongoId(value),
  }),
  isLength: (prop, value, conf) => ({
    validation: 'isLength',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to have length ${JSON.stringify(
      conf
    )}. Got: ${value}`,
    execute: () => validator.isLength(value, conf),
  }),
  isEmail: (prop, value) => ({
    validation: 'isEmail',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to be a valid email. Got: ${value}`,
    execute: () => validator.isEmail(value),
  }),
};
