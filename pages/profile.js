// pages/profile.js
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState(null);

  async function fetchProfile() {
    const resp = await fetch(`/api/get-profile?userId=${encodeURIComponent(userId)}`);
    const data = await resp.json();
    setProfile(data);
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Get Profile</h2>
        <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="userId" />
        <button onClick={fetchProfile}>Get</button>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </>
  );
}
