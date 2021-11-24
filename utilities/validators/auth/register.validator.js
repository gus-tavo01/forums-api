const Validations = require('../../../common/constants/validations');

module.exports = () => ({
  username: [Validations.isEmpty()],
  password: [Validations.isEmpty(), Validations.isLength({ min: 3 })],
  email: [Validations.isEmpty(), Validations.isEmail()],
  dateOfBirth: [Validations.isEmpty(), Validations.isDate()],
});
