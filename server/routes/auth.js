import { Router } from 'express';
import pool, { hashPassword, verifyPassword } from '../data/db.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, phone, position } = req.body;

  if (!email || !password || !firstName || !lastName || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, position)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name AS "firstName", last_name AS "lastName", phone, position`,
      [email, hashedPassword, firstName, lastName, phone || '', position]
    );

    const user = rows[0];
    res.status(201).json({ user, token: user.id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        position: user.position
      },
      token: user.id
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, email, first_name AS "firstName", last_name AS "lastName", phone, position
       FROM users WHERE id = $1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
