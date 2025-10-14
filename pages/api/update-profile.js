// pages/api/update-profile.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, fullName, phone, address, qualification, recentStudied, gender } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing userId' });
    }

    // ✅ Check if profile exists
    const check = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);

    if (check.rows.length > 0) {
      // ✅ Update existing profile
      await query(
        `UPDATE user_profiles
         SET full_name = $1, phone = $2, address = $3, qualification = $4, recent_studied = $5, gender = $6, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7`,
        [fullName, phone, address, qualification, recentStudied, gender, userId]
      );
    } else {
      // ✅ Insert new profile if not exists
      await query(
        `INSERT INTO user_profiles (user_id, full_name, phone, address, qualification, recent_studied, gender)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, fullName, phone, address, qualification, recentStudied, gender]
      );
    }

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
