const passport = require('passport');
const ApiResponse = require('../common/ApiResponse');

function useJwtAuth(req, res, next) {
  return passport.authenticate('jwt', { session: false }, (err, user) => {
    const apiResponse = new ApiResponse();

    if (err) {
      apiResponse.unauthorized(err);
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
