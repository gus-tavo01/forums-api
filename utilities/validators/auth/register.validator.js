const Validations = require('js-validation-tool/core/validations');

module.exports = (e) => ({
  username: [Validations.string.isNotEmpty('username', e.username)],
  password: [
    Validations.string.isNotEmpty('password', e.password),
    Validations.string.isLength('password', e.password, { min: 3 }),
  ],
  email: [
    Validations.string.isNotEmpty('email', e.email),
    Validations.string.isEmail('email', e.email),
  ],
  dateOfBirth: [
    Validations.string.isNotEmpty('dateOfBirth', e.dateOfBirth),
    Validations.string.isDate('dateOfBirth', e.dateOfBirth),
  ],
  avatar: [
    Validations.common.isOptional('avatar'),
    Validations.string.isString('avatar', e.avatar),
  ],
});
