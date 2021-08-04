const Validations = require('../validations');

module.exports = () => ({
  name: [Validations.isEmpty()],
  description: [Validations.isEmpty()],
  isPrivate: [Validations.isBool()],
});
