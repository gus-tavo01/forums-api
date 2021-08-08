const Validations = require('../../../utilities/validations');
const executeValidations = require('./executeValidations');

const generateValidation = async (value, key, validation) => {
  const { validator, opts } = validation;
  const validationFunc = Validations[validator];
  if (!validationFunc) {
    throw new Error(`Invalid validation, does not exist, '${validator}'`);
  }
  return validationFunc(value, key, opts);
};

// TODO
// -> implement isOptional validation
// if isOptional validation is found on model.prop, that prop will not be validated if not present on model
// find isOptional validation { name: [{validation}] }
// -> implement extra props checker
// if entity has extra properties generate fields ['key' is not an expected field]

module.exports = async (entity, validationModel) => {
  const validations = validationModel();
  const resultsValidations = Object.keys(validations)
    .map((key) =>
      validations[key].map((v) => generateValidation(entity[key], key, v))
    )
    .flat();
  return executeValidations(resultsValidations);
};
