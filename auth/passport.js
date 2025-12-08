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
  done(null, user.id);
});

// deserialize user for session management
passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user ID:', id);
    const user = await userModel.getUserById(id);
    console.log('User found:', user ? 'Yes' : 'No');
    done(null, user);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error);
  }
});

module.exports = passport;
