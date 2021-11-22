const Validations = require('js-validation-tool/core/validations');

module.exports = (entity) => ({
  image: [
    Validations.common.isOptional('image', entity.image),
    Validations.string.isString('image', entity.image),
    Validations.string.isNotEmpty('image', entity.image),
  ],
  topic: [Validations.string.isNotEmpty('topic', entity.topic)],
  description: [
    Validations.string.isNotEmpty('description', entity.description),
  ],
  isPrivate: [Validations.boolean.isBool('isPrivate', entity.isPrivate)],
});
