import pool from '../data/db.js';

export async function getUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, first_name, last_name, phone, position FROM users WHERE id = $1',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
