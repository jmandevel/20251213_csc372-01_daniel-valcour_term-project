const userModel = require('../models/userModel');

// handle oath after google authentication
function oauthCallback(req, res) {
  const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:5173';
  const returnTo = req.session.returnTo || '';
  delete req.session.returnTo;
  res.redirect(`${CLIENT_BASE_URL}${returnTo}`);
}

// get current authenticated user info
async function getMe(req, res) {
  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
      const googleId = req.user.id;
      const user = await userModel.getUserById(googleId);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// logout user from website
function logout(req, res) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
}

module.exports = {
  oauthCallback,
  getMe,
  logout,
};
