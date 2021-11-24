const Validations = require('js-validation-tool/core/validations');

module.exports = (entity) => ({
  password: [
    Validations.string.isNotEmpty('password', entity.password),
    Validations.string.isLength('password', entity.password, { min: 3 }),
  ],
});
