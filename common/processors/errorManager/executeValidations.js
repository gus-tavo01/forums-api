module.exports = async (validations) => {
  const rawFields = await Promise.all(validations);
  const fields = rawFields.filter((field) => field !== undefined);
  return {
    isValid: fields.length === 0,
    fields,
  };
};
