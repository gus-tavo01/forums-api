const Validations = require('js-validation-tool/core/modelValidations');

module.exports = () => ({
  image: [
    Validations.common.isOptional(),
    Validations.string.isString(),
    Validations.string.isNotEmpty(),
  ],
  topic: [Validations.string.isNotEmpty()],
  description: [Validations.string.isNotEmpty()],
  isPrivate: [Validations.boolean.isBool()],
});
