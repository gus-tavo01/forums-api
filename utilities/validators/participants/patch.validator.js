const Validations = require('js-validation-tool/core/validations');

module.exports = (e) => ({
  role: [
    Validations.common.isOptional('role', e.role),
    Validations.string.isNotEmpty('role', e.role),
  ],
});
