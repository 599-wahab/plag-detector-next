// pages/api/get-candidates.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });
  try {
    const rows = (await query(
      `SELECT u.id, u.email, u.role,
       COALESCE(NULLIF(p.full_name,''),'Unnamed') AS full_name,
       COALESCE(NULLIF(p.phone,''),'N/A') AS phone
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.role='candidate'`
    )).rows;
    return res.json({ success: true, candidates: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
