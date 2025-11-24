require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userModel = require('../models/userModel');

// configure strategy for passport with google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.SERVER_BASE_URL + '/auth/google/callback',
    },
    async (token, tokenSecret, profile, done) => {
      const newUser = {
        googleId: profile.id,
        displayName: profile.displayName,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
      };
      
      const user = await userModel.getUserById(profile.id);
      if (!user) {
        await userModel.createNewUser(Object.values(newUser));
      }
      return done(null, profile);
    }
  )
);

// serialieze user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

// deserialize user for session management
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
