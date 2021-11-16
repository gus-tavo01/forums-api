const validator = require('validator');

module.exports = {
  isNumeric: (prop, value, opts) => ({
    validation: 'isNumeric',
    property: prop,
    onFailureMessage: `Field '${prop}', expected to be numeric. Got: ${value}`,
    execute: () => !validator.isNumeric(value.toString(), opts),
  }),
};
