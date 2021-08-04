const Validations = require('../../utilities/validations');

const executeValidation = async (value, key, validation) => {
  const { validator, opts } = validation;

  if (!Validations[validator]) {
    throw new Error('Invalid validation, does not exist');
  }

  return Validations[validator](value, key, opts);
};

module.exports = async (entity, validationModel) => {
  const validations = validationModel();
  const resultsValidations = Object.keys(validations)
    .map((key) =>
      validations[key].map((v) => executeValidation(entity[key], key, v))
    )
    .flat();
  const rawFields = await Promise.all(resultsValidations);
  const fields = rawFields.filter((f) => f !== undefined);

  return {
    isValid: fields.length === 0,
    fields,
  };
};
