const favoriteModel = require('../models/favoriteModel');

const userModel = require('../models/userModel');

// get list of user's favorite codepoints
async function getFavorites(req, res) {
  try {
    const favorites = await favoriteModel.getUserFavorites(req.user.id);
    res.json({ favorites });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
}

// add a new favorite codepoint for user
async function addFavorite(req, res) {
  try {
    const { codepoint } = req.body;

    if (!codepoint && codepoint !== 0) {
      return res.status(400).json({ error: 'Codepoint is required' });
    }

    const favorite = await favoriteModel.addFavorite(req.user.id, codepoint);
    res.json({ success: true, favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
}

// remove a favorite codepoint for user
async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const codepoint = parseInt(req.params.codepoint);

    if (isNaN(codepoint)) {
      return res.status(400).json({ error: 'Invalid codepoint' });
    }

    const userRecord = await userModel.getUserById(userId);
    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    await favoriteModel.removeFavorite(userRecord.id, codepoint);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
}

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};
