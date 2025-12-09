require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./models/db');
const cors = require('cors');
const passport = require('./auth/passport');
const glyphRoutes = require('./routes/glyphRoutes');
const authRoutes = require('./routes/authRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const { initializeCache } = require('./controllers/glyphController');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_BASE_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use(glyphRoutes);

app.use(express.static(path.join(__dirname, 'react-client/dist')));

// get requrest to get the frontend index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'react-client/dist/index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initializeCache();
});

