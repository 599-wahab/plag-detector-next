// pages/api/schedule-interview.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const { userId, scheduledAt } = req.body || {};
    if (!userId || !scheduledAt) return res.status(400).json({ success: false, error: 'Missing fields' });

    const exists = parseInt((await query('SELECT COUNT(*) FROM scheduled_interviews WHERE user_id = $1', [userId])).rows[0].count, 10);
    if (exists > 0) return res.status(400).json({ success: false, error: 'Interview already scheduled' });

    const row = (await query(
      `SELECT u.email, COALESCE(NULLIF(p.full_name,''),'Unnamed') as full_name, COALESCE(NULLIF(p.phone,''),'N/A') as phone
       FROM users u LEFT JOIN user_profiles p ON u.id=p.user_id WHERE u.id=$1`,
      [userId]
    )).rows[0];

    if (!row) return res.status(404).json({ success: false, error: 'Candidate not found' });

    await query(
      `INSERT INTO scheduled_interviews (user_id, full_name, email, phone, scheduled_at, status)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, row.full_name, row.email, row.phone, scheduledAt, 'Scheduled']
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
