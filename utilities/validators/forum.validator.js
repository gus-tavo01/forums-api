const Validations = require('../../common/constants/validations');

module.exports = () => ({
  topic: [Validations.isEmpty()],
  description: [Validations.isEmpty()],
  isPrivate: [Validations.isBool()],
  isActive: [Validations.isBool()],
});
