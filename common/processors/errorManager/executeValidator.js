module.exports = (value, field, condition, process) => {
  const validationError = `Field '${field}' expected to be ${condition}. Got: ${value}`;
  try {
    if (process()) return validationError;
  } catch (error) {
    return validationError;
  }
};
