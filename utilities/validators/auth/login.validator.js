const Validations = require('js-validation-tool/core/validations');

module.exports = (e) => ({
  username: [Validations.string.isNotEmpty('username', e.username)],
  password: [Validations.string.isNotEmpty('password', e.password)],
});
