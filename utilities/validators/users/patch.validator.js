const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  selfDescription: [
    Validations.common.isOptional(),
    Validations.string.isString(),
  ],
  language: [Validations.common.isOptional(), Validations.string.isNotEmpty()],
  appTheme: [Validations.common.isOptional(), Validations.string.isNotEmpty()],
});
