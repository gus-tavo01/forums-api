const Validations = require('../../common/constants/validations');

module.exports = () => ({
  // TODO
  // image?
  topic: [Validations.isEmpty()],
  description: [Validations.isEmpty()],
  isPrivate: [Validations.isBool()],
});
