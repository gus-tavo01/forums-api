const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  password: [
    Validations.string.isNotEmpty(),
    Validations.string.isLength({ min: 3 }),
  ],
});
