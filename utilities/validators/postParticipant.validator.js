const Validations = require('../validations');

module.exports = () => ({
  username: [Validations.isEmpty()],
  role: [Validations.isEmpty()],
});
