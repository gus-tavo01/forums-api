const passport = require('passport');
const ApiResponse = require('../common/ApiResponse');

function useJwtAuth(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user, info) => {
    const apiResponse = new ApiResponse();

    if (err) {
      apiResponse.internalServerError(err);
      return res.response(apiResponse);
    }

    if (info) {
      apiResponse.unauthorized(info);
      return res.response(apiResponse);
    }

    if (!user) {
      apiResponse.unauthorized('Not authorized to perform this request');
      return res.response(apiResponse);
    }

    req.user = user;
    return next();
  })(req, res, next);
}

module.exports = useJwtAuth;
