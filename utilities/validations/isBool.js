module.exports = async (value, key) => {
  const validationError = `Field '${key}' is not a valid boolean`;
  if (typeof value !== 'boolean') return validationError;
};
