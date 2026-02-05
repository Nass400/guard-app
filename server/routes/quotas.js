import { Router } from 'express';
import pool, { getDefaultQuota } from '../data/db.js';
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

// Get all custom quota overrides for a staff
router.get('/:staffId', getUser, async (req, res) => {
  try {
    const { rows: memberCheck } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [req.params.staffId, req.user.id]
    );

    if (memberCheck.length === 0) {
      return res.status(403).json({ error: 'Not a member of this staff' });
    }

    const { rows: quotas } = await pool.query(
      `SELECT staff_id AS "staffId", date::text, quota::float FROM day_quotas WHERE staff_id = $1`,
      [req.params.staffId]
    );

    res.json({
      quotas,
      defaultQuotas: { weekday: 1, saturday: 1.5, sunday: 2 }
    });
  } catch (err) {
    console.error('Get quotas error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update or create a custom quota for a specific date
router.put('/:staffId/:date', getUser, async (req, res) => {
  try {
    if (!(await isMod(req.params.staffId, req.user.id))) {
      return res.status(403).json({ error: 'Only staff creator or moderators can update quotas' });
    }

    const { quota } = req.body;

    if (typeof quota !== 'number' || quota <= 0) {
      return res.status(400).json({ error: 'Quota must be a positive number' });
    }

    const { rows } = await pool.query(
      `INSERT INTO day_quotas (staff_id, date, quota) VALUES ($1, $2, $3)
       ON CONFLICT (staff_id, date) DO UPDATE SET quota = $3
       RETURNING staff_id AS "staffId", date::text, quota::float`,
      [req.params.staffId, req.params.date, quota]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error('Update quota error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quota dashboard - per-member totals
router.get('/:staffId/dashboard', getUser, async (req, res) => {
  try {
    const { rows: memberCheck } = await pool.query(
      'SELECT 1 FROM staff_members WHERE staff_id = $1 AND user_id = $2',
      [req.params.staffId, req.user.id]
    );

    if (memberCheck.length === 0) {
      return res.status(403).json({ error: 'Not a member of this staff' });
    }

    // Get all shifts for this staff
    const { rows: shifts } = await pool.query(
      'SELECT user_id, date::text FROM shifts WHERE staff_id = $1',
      [req.params.staffId]
    );

    // Get all custom quotas for this staff
    const { rows: customQuotas } = await pool.query(
      'SELECT date::text, quota::float FROM day_quotas WHERE staff_id = $1',
      [req.params.staffId]
    );

    const customQuotaMap = {};
    customQuotas.forEach(q => { customQuotaMap[q.date] = q.quota; });

    // Compute per-member totals
    const memberTotals = {};
    shifts.forEach(shift => {
      if (!memberTotals[shift.user_id]) {
        memberTotals[shift.user_id] = { totalQuota: 0, shiftCount: 0 };
      }
      const quota = customQuotaMap[shift.date] !== undefined
        ? customQuotaMap[shift.date]
        : getDefaultQuota(shift.date);
      memberTotals[shift.user_id].totalQuota += quota;
      memberTotals[shift.user_id].shiftCount += 1;
    });

    // Get all members with user info
    const { rows: members } = await pool.query(
      `SELECT u.id AS "userId", u.first_name AS "firstName", u.last_name AS "lastName", u.position
       FROM users u JOIN staff_members sm ON u.id = sm.user_id
       WHERE sm.staff_id = $1`,
      [req.params.staffId]
    );

    const dashboard = members.map(m => ({
      ...m,
      totalQuota: memberTotals[m.userId]?.totalQuota || 0,
      shiftCount: memberTotals[m.userId]?.shiftCount || 0
    }));

    res.json(dashboard);
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
