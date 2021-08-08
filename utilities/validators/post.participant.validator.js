const Validations = require('../../common/constants/validations');

module.exports = () => ({
  username: [Validations.isEmpty()],
  role: [Validations.isEmpty()],
});
