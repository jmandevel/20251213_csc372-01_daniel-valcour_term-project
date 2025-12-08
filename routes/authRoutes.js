const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require('../models/userModel');

// get client base URL from environment variables
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:5173';

// utility function to save returnTo URL in session
const saveReturnTo = (req, res, next) => {
  const returnTo = req.query.returnTo || '/';
  req.session.returnTo = returnTo;
  next();
};

// initiate Google OAuth2 authentication
router.get(
  '/google',
  saveReturnTo,
  passport.authenticate('google', {
    keepSessionInfo: true,
    scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
);

// handle Google OAuth2 callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    keepSessionInfo: true,
    failureRedirect: `${CLIENT_BASE_URL}/login`,
  }),
  (req, res, next) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return next(err);
      }
      require('../controllers/authController').oauthCallback(req, res);
    });
  }
);

// get current authenticated user info
router.get('/me', require('../controllers/authController').getMe);

// logout user
router.post('/logout', require('../controllers/authController').logout);

module.exports = router;
