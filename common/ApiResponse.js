class ApiResponse {
  statusCode = 200;
  message = 'Success';
  errorMessage = null;
  fields = [];
  payload = null;

  ok = (payload) => {
    this.statusCode = 200;
    this.message = 'Ok';
    this.payload = payload;
  };

  created = (payload) => {
    this.statusCode = 201;
    this.message = 'Created';
    this.payload = payload;
  };

  accepted = () => {
    this.statusCode = 202;
    this.message = 'Accepted';
    this.payload = null;
  };

  badRequest = (errorMessage, fields) => {
    this.statusCode = 400;
    this.message = 'Bad_Request';
    this.errorMessage =
      errorMessage ?? 'The request contains validation errors';
    this.fields = fields;
  };

  unauthorized = (errorMessage) => {
    this.statusCode = 401;
    this.message = 'Unauthorized';
    this.errorMessage = errorMessage;
  };

  forbidden = (errorMessage) => {
    this.statusCode = 403;
    this.message = 'Forbidden';
    this.errorMessage =
      errorMessage ?? 'This action requires additional permissions';
  };

  notFound = (errorMessage) => {
    this.statusCode = 404;
    this.message = 'Not_Found';
    this.errorMessage = errorMessage ?? 'Resource is not found';
  };

  conflict = (errorMessage) => {
    this.statusCode = 409;
    this.message = 'Conflict';
    this.errorMessage = errorMessage ?? 'Resource already exists';
  };

  unprocessableEntity = (errorMessage, fields = []) => {
    this.statusCode = 422;
    this.message = 'Unprocessable_Entity';
    this.errorMessage =
      errorMessage ?? 'Resource cannot be processed, try again later';
    this.fields = fields;
  };

  internalServerError = (errorMessage) => {
    this.statusCode = 500;
    this.message = 'Internal_Server_Error';
    this.errorMessage = errorMessage ?? 'Something went wrong';
  };
}

module.exports = ApiResponse;
