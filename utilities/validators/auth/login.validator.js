const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  username: [Validations.string.isNotEmpty()],
  password: [Validations.string.isNotEmpty()],
});
