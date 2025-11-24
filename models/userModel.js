const pool = require('./db');

// get all users from the database
async function getAllUsers() {
  const queryText = "SELECT * FROM users";
  const result = await pool.query(queryText);
  return result.rows;
}

// delete a user by id
async function deleteUser(id) {
  let queryText = "DELETE FROM users WHERE id = $1";
  const values = [id];
  const result = await pool.query(queryText, values);
  return result.rowCount;
}

// get a user by their Google ID
async function getUserById(googleId) {
  const queryText = "SELECT * FROM users WHERE google_id = $1";
  const values = [googleId];
  const result = await pool.query(queryText, values);
  return result.rows[0];
}

// create a new user in the database

async function createNewUser([googleId, name, email]) {
  const queryText = "INSERT INTO users (google_id, name, email) VALUES ($1, $2, $3) RETURNING *";
  const values = [googleId, name, email];
  const result = await pool.query(queryText, values);
  return result.rows[0];
}

module.exports = {
  getAllUsers,
  deleteUser,
  getUserById,
  createNewUser
};
