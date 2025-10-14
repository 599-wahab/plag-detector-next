// pages/dashboard/settings.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';

function Settings() {
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
      if (data.success && data.profile) {
        setProfile({
          fullName: data.profile.fullName || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          qualification: data.profile.qualification || '',
          recentStudied: data.profile.recentStudied || '',
          gender: data.profile.gender || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userId = localStorage.getItem('userId');

    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profile }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile: ' + data.error);
      }
    } catch (err) {
      alert('Failed to update profile.');
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
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } bg-gray-100 border-r border-gray-300 transition-all duration-300 min-h-screen fixed left-0 top-16`}
        >
          <div className="p-4 flex flex-col h-full">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-black hover:bg-gray-200 rounded-lg mb-4"
            >
              <i
                className={`fas fa-bars text-xl ${
                  sidebarCollapsed ? 'rotate-90' : ''
                } transition-transform`}
              ></i>
            </button>

            <nav className="space-y-2 flex-1">
              <button
                onClick={() => router.push('/dashboard/candidate')}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-200 rounded-lg"
              >
                <i className="fas fa-tachometer-alt mr-3"></i>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>

              <button
                onClick={() => router.push('/dashboard/settings')}
                className="w-full flex items-center px-4 py-3 bg-gray-200 rounded-lg"
              >
                <i className="fas fa-cog mr-3"></i>
                {!sidebarCollapsed && <span>Settings</span>}
              </button>
            </nav>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-100 rounded-lg border border-red-300"
              >
                <i className="fas fa-sign-out-alt mr-3"></i>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}
        >
          <h1 className="text-3xl font-bold mb-6 text-black">Settings</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-gray-100 p-6 rounded-xl border border-gray-300 max-w-3xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="p-3 rounded-lg border border-gray-300"
              />
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="p-3 rounded-lg border border-gray-300"
              />
              <input
                name="qualification"
                value={profile.qualification}
                onChange={handleChange}
                placeholder="Qualification"
                className="p-3 rounded-lg border border-gray-300"
              />
              <input
                name="recentStudied"
                value={profile.recentStudied}
                onChange={handleChange}
                placeholder="Recent Studied"
                className="p-3 rounded-lg border border-gray-300"
              />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Address"
                rows="3"
                className="p-3 rounded-lg border border-gray-300 md:col-span-2"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Settings);
