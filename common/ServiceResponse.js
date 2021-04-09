class ServiceResponse {
  result = null;
  fields = [];

  addValidationErrors = (validationErrors) => {
    if (validationErrors && validationErrors.length) {
      this.fields = validationErrors.filter((v) => v !== null);
    }
  };
}

module.exports = ServiceResponse;
