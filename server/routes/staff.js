import { Router } from 'express';
import pool, { generateCode } from '../data/db.js';
import { getUser } from '../middleware/auth.js';

const router = Router();

// Helper: build staff response object with memberIds and moderatorIds
async function buildStaffResponse(staff) {
  const { rows: members } = await pool.query(
    'SELECT user_id, is_moderator FROM staff_members WHERE staff_id = $1',
    [staff.id]
  );
  return {
    id: staff.id,
    code: staff.code,
    name: staff.name,
    hospital: staff.hospital,
    service: staff.service,
    startDate: staff.start_date,
    endDate: staff.end_date,
    creatorId: staff.creator_id,
    memberIds: members.map(m => m.user_id),
    moderatorIds: members.filter(m => m.is_moderator).map(m => m.user_id)
  };
}

// Create new staff
router.post('/', getUser, async (req, res) => {
  const { name, hospital, service, startDate, endDate } = req.body;

  if (!name || !hospital || !service || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const code = generateCode();
    const { rows } = await client.query(
      `INSERT INTO staffs (code, name, hospital, service, start_date, end_date, creator_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [code, name, hospital, service, startDate, endDate, req.user.id]
    );

    const staff = rows[0];

    await client.query(
      'INSERT INTO staff_members (staff_id, user_id) VALUES ($1, $2)',
      [staff.id, req.user.id]
    );

    await client.query('COMMIT');

    res.status(201).json(await buildStaffResponse(staff));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Toggle moderator status for a member (creator only)
router.put('/:id/moderator', getUser, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    const { rows: staffRows } = await pool.query('SELECT * FROM staffs WHERE id = $1', [req.params.id]);
    if (staffRows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const staff = staffRows[0];

    if (staff.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Only staff creator can manage moderators' });
    }

    if (userId === staff.creator_id) {
      return res.status(400).json({ error: 'Creator is already an admin' });
    }

    const { rows: memberRows } = await pool.query(
      'SELECT * FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [staff.id, userId]
    );

    if (memberRows.length === 0) {
      return res.status(400).json({ error: 'User is not a member of this staff' });
    }

    // Toggle
    await pool.query(
      'UPDATE staff_members SET is_moderator = NOT is_moderator WHERE staff_id = $1 AND user_id = $2',
      [staff.id, userId]
    );

    // Return full staff details with members
    const staffRes = await buildStaffResponse(staff);
    const { rows: memberDetails } = await pool.query(
      `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName", u.phone, u.position
       FROM users u JOIN staff_members sm ON u.id = sm.user_id
       WHERE sm.staff_id = $1`,
      [staff.id]
    );

    res.json({ ...staffRes, members: memberDetails });
  } catch (err) {
    console.error('Toggle moderator error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join staff with code
router.post('/join', getUser, async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code required' });
  }

  try {
    const { rows: staffRows } = await pool.query(
      'SELECT * FROM staffs WHERE code = $1',
      [code.toUpperCase()]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({ error: 'Staff not found with this code' });
    }

    const staff = staffRows[0];

    const { rows: existing } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [staff.id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Already a member of this staff' });
    }

    await pool.query(
      'INSERT INTO staff_members (staff_id, user_id) VALUES ($1, $2)',
      [staff.id, req.user.id]
    );

    res.json(await buildStaffResponse(staff));
  } catch (err) {
    console.error('Join staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List user's staffs
router.get('/', getUser, async (req, res) => {
  try {
    const { rows: staffRows } = await pool.query(
      `SELECT s.* FROM staffs s
       JOIN staff_members sm ON s.id = sm.staff_id
       WHERE sm.user_id = $1`,
      [req.user.id]
    );

    const results = await Promise.all(staffRows.map(s => buildStaffResponse(s)));
    res.json(results);
  } catch (err) {
    console.error('List staffs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get staff details with members
router.get('/:id', getUser, async (req, res) => {
  try {
    const { rows: staffRows } = await pool.query('SELECT * FROM staffs WHERE id = $1', [req.params.id]);

    if (staffRows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const staff = staffRows[0];

    const { rows: memberCheck } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [staff.id, req.user.id]
    );

    if (memberCheck.length === 0) {
      return res.status(403).json({ error: 'Not a member of this staff' });
    }

    const staffRes = await buildStaffResponse(staff);

    const { rows: members } = await pool.query(
      `SELECT u.id, u.email, u.first_name AS "firstName", u.last_name AS "lastName", u.phone, u.position
       FROM users u JOIN staff_members sm ON u.id = sm.user_id
       WHERE sm.staff_id = $1`,
      [staff.id]
    );

    res.json({ ...staffRes, members });
  } catch (err) {
    console.error('Get staff error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
