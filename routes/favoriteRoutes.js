const express = require('express');
const router = express.Router();
const favoriteModel = require('../models/favoriteModel');

// middleware to ensure user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// import favorite controller
const favoriteController = require('../controllers/favoriteController');

// get list of user's favorite codepoints
router.get('/', requireAuth, favoriteController.getFavorites);

// add a new favorite codepoint for user
router.post('/', requireAuth, favoriteController.addFavorite);

// remove a favorite codepoint for user
router.delete('/:codepoint', requireAuth, favoriteController.removeFavorite);

module.exports = router;
