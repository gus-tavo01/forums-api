const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const AccountsRepository = require('../repositories/Accounts.Repository');

function configureAuth() {
  const accountsRepository = new AccountsRepository();
  const options = {
    ignoreExpiration: false,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  };
  const jwtStrategy = new JwtStrategy(options, (jwt_payload, done) => {
    // token belongs to an existing user
    accountsRepository
      .findById(jwt_payload.sub)
      .then((account) => {
        if (account) {
          return done(null, account);
        } else {
          return done(null, null, 'Error getting the user account');
        }
      })
      .catch((err) => {
        return done(err, null);
      });
  });
  passport.use(jwtStrategy);
}

module.exports = configureAuth;
