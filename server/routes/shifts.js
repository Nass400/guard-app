import { Router } from 'express';
import pool from '../data/db.js';
import { getUser } from '../middleware/auth.js';

const router = Router();

// Helper: check if user is creator or moderator
async function isMod(staffId, userId) {
  const { rows } = await pool.query('SELECT creator_id FROM staffs WHERE id = $1', [staffId]);
  if (rows.length === 0) return false;
  if (rows[0].creator_id === userId) return true;

  const { rows: memberRows } = await pool.query(
    'SELECT is_moderator FROM staff_members WHERE staff_id = $1 AND user_id = $2',
    [staffId, userId]
  );
  return memberRows.length > 0 && memberRows[0].is_moderator;
}

// Helper: get user info for shift response
async function getUserInfo(userId) {
  const { rows } = await pool.query(
    `SELECT id, first_name AS "firstName", last_name AS "lastName", position FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// Get all shifts for a staff
router.get('/:staffId', getUser, async (req, res) => {
  try {
    const { rows: memberCheck } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [req.params.staffId, req.user.id]
    );

    if (memberCheck.length === 0) {
      return res.status(403).json({ error: 'Not a member of this staff' });
    }

    const { rows: shifts } = await pool.query(
      `SELECT s.id, s.staff_id AS "staffId", s.user_id AS "userId", s.date::text, s.start_time AS "startTime",
              s.end_time AS "endTime", s.notes,
              json_build_object('id', u.id, 'firstName', u.first_name, 'lastName', u.last_name, 'position', u.position) AS user
       FROM shifts s
       JOIN users u ON s.user_id = u.id
       WHERE s.staff_id = $1`,
      [req.params.staffId]
    );

    res.json(shifts);
  } catch (err) {
    console.error('Get shifts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create shift
router.post('/', getUser, async (req, res) => {
  const { staffId, userId, date, startTime, endTime, notes } = req.body;

  if (!staffId || !userId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    if (!(await isMod(staffId, req.user.id))) {
      return res.status(403).json({ error: 'Only staff creator or moderators can add shifts' });
    }

    const { rows: memberCheck } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [staffId, userId]
    );
    if (memberCheck.length === 0) {
      return res.status(400).json({ error: 'User is not a member of this staff' });
    }

    const { rows } = await pool.query(
      `INSERT INTO shifts (staff_id, user_id, date, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, staff_id AS "staffId", user_id AS "userId", date::text, start_time AS "startTime",
                 end_time AS "endTime", notes`,
      [staffId, userId, date, startTime, endTime, notes || '']
    );

    const shift = rows[0];
    shift.user = await getUserInfo(userId);

    res.status(201).json(shift);
  } catch (err) {
    console.error('Create shift error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shift
router.put('/:id', getUser, async (req, res) => {
  try {
    const { rows: shiftRows } = await pool.query(
      'SELECT * FROM shifts WHERE id = $1', [req.params.id]
    );
    if (shiftRows.length === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const shift = shiftRows[0];

    if (!(await isMod(shift.staff_id, req.user.id))) {
      return res.status(403).json({ error: 'Only staff creator or moderators can update shifts' });
    }

    const { userId, date, startTime, endTime, notes } = req.body;

    const { rows } = await pool.query(
      `UPDATE shifts SET
        user_id = COALESCE($1, user_id),
        date = COALESCE($2, date),
        start_time = COALESCE($3, start_time),
        end_time = COALESCE($4, end_time),
        notes = CASE WHEN $5::text IS NOT NULL THEN $5 ELSE notes END
       WHERE id = $6
       RETURNING id, staff_id AS "staffId", user_id AS "userId", date::text, start_time AS "startTime",
                 end_time AS "endTime", notes`,
      [userId || null, date || null, startTime || null, endTime || null, notes !== undefined ? notes : null, req.params.id]
    );

    const updated = rows[0];
    updated.user = await getUserInfo(updated.userId);

    res.json(updated);
  } catch (err) {
    console.error('Update shift error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete shift
router.delete('/:id', getUser, async (req, res) => {
  try {
    const { rows: shiftRows } = await pool.query(
      'SELECT * FROM shifts WHERE id = $1', [req.params.id]
    );
    if (shiftRows.length === 0) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const shift = shiftRows[0];

    if (!(await isMod(shift.staff_id, req.user.id))) {
      return res.status(403).json({ error: 'Only staff creator or moderators can delete shifts' });
    }

    await pool.query('DELETE FROM shifts WHERE id = $1', [req.params.id]);
    res.json({ message: 'Shift deleted' });
  } catch (err) {
    console.error('Delete shift error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
