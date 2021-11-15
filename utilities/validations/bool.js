const validator = require('validator');

module.exports = {
  isBool: (prop, value) => ({
    validation: 'isBool',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to be Boolean. Got: ${value}`,
    execute: () => !validator.isBoolean(value.toString()),
  }),
};
