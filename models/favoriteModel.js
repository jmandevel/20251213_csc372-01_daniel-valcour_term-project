const pool = require('./db');

// get all favorite codepoints for a user
async function getUserFavorites(userId) {
  const queryText = "SELECT codepoint FROM favorites WHERE user_id = $1";
  const values = [userId];
  const result = await pool.query(queryText, values);
  return result.rows.map(row => row.codepoint);
}

// add a favorite codepoint for a user
async function addFavorite(userId, codepoint) {
  const queryText = "INSERT INTO favorites (user_id, codepoint) VALUES ($1, $2) ON CONFLICT (user_id, codepoint) DO NOTHING RETURNING *";
  const values = [userId, codepoint];
  const result = await pool.query(queryText, values);
  return result.rows[0];
}

// remove a favorite codepoint for a user
async function removeFavorite(userId, codepoint) {
  const queryText = "DELETE FROM favorites WHERE user_id = $1 AND codepoint = $2";
  const values = [userId, codepoint];
  const result = await pool.query(queryText, values);
  return result.rowCount;
}

// check if a codepoint is favorited by a user
async function isFavorite(userId, codepoint) {
  const queryText = "SELECT 1 FROM favorites WHERE user_id = $1 AND codepoint = $2";
  const values = [userId, codepoint];
  const result = await pool.query(queryText, values);
  return result.rows.length > 0;
}

module.exports = {
  getUserFavorites,
  addFavorite,
  removeFavorite,
  isFavorite
};
