const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  username: [Validations.string.isNotEmpty()],
  password: [
    Validations.string.isNotEmpty(),
    Validations.string.isLength({ min: 3 }),
  ],
  email: [Validations.string.isNotEmpty(), Validations.string.isEmail()],
  dateOfBirth: [Validations.string.isNotEmpty(), Validations.string.isDate()],
  avatar: [Validations.common.isOptional(), Validations.string.isString()],
});
