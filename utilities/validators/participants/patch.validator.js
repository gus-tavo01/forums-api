const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  role: [Validations.common.isOptional(), Validations.string.isNotEmpty()],
});
