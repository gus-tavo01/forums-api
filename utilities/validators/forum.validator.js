const Validations = require('../../common/constants/validations');

module.exports = () => ({
  name: [Validations.isEmpty()],
  description: [Validations.isEmpty()],
  isPrivate: [Validations.isBool()],
});
