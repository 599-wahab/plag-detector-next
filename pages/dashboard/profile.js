import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';
import Navbar from "../../components/Navbar";

const ProfilePage = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    address: '',
    qualification: '',
    recentStudied: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);

    const userId = localStorage.getItem('userId');
    if (userId) fetchProfile(userId);
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/get-profile?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.profile) setProfile(data.profile);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const userId = localStorage.getItem('userId');
    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profile }),
      });
      const data = await res.json();

      if (data.success) setSuccessMsg('Profile updated successfully!');
      else setErrorMsg('Failed to update profile.');
    } catch {
      setErrorMsg('Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />
      <div className="flex">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}
        >
          <h1 className="text-3xl font-bold mb-6 text-black">My Profile</h1>
          <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(profile).map(([key, value]) => (
                key === 'gender' ? (
                  <select
                    key={key}
                    value={value}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : key === 'address' ? (
                  <textarea
                    key={key}
                    placeholder="Address"
                    value={value}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg col-span-1 md:col-span-2"
                  />
                ) : (
                  <input
                    key={key}
                    type="text"
                    placeholder={key.replace(/([A-Z])/g, ' $1')}
                    value={value}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg"
                  />
                )
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Saving...' : 'Update Profile'}
              </button>

              {successMsg && <p className="text-green-600 font-medium">{successMsg}</p>}
              {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);
