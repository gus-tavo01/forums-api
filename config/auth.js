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
    loginsRepository.findById(jwt_payload.sub).then((account) => {
      if (account) {
        done(null, account);
      } else {
        done('Error getting the user account', false);
      }
    });
  });
  passport.use(jwtStrategy);
}

module.exports = configureAuth;
