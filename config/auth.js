const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LoginsRepository = require('../repositories/Logins.Repository');

function configureAuth() {
  const loginsRepository = new LoginsRepository();
  const options = {
    ignoreExpiration: false,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  const jwtStrategy = new JwtStrategy(options, (jwt_payload, done) => {
    // verify token has expired
    if (Date.now() > jwt_payload.exp) {
      return done('Token has expired', null);
    }

    // token belongs to an existing user
    loginsRepository.findById(jwt_payload.sub).then((account) => {
      if (account) {
        return done(null, account);
      } else {
        return done('Error getting the user account', false);
      }
    });
  });
  passport.use(jwtStrategy);
}

module.exports = configureAuth;
