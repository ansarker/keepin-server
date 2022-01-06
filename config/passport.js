const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/auth/model.user');
const validPassword = require('../lib/passwordStrategy').validPassword;

const customFields = {
  usernameField: 'uname',
  passwordField: 'pw'
}

const verifyCallback = (username, password, done) => {
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isValid = validPassword(password, user.hash, user.salt)
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    })
    .catch((err) => done(err))
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  console.log('UID ', userId)
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch(err => done(err))
});