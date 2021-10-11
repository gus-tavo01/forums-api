const Validations = require('../../common/constants/validations');

module.exports = () => ({
  selfDescription: [Validations.isOptional, Validations.isString],
  language: [Validations.isOptional, Validations.isString],
  appTheme: [Validations.isOptional, Validations.isString],
});
