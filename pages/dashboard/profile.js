import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';

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

  const sidebarItems = [
    { id: 1, name: 'Home', icon: 'fas fa-tachometer-alt', path: '/dashboard/candidate' },
    { id: 2, name: 'Profile', icon: 'fas fa-user-circle', path: '/dashboard/profile' },
    { id: 3, name: 'Settings', icon: 'fas fa-cog', path: '/dashboard/settings' },
  ];

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

      if (data.success) {
        setSuccessMsg('Profile updated successfully!');
      } else {
        setErrorMsg('Failed to update profile.');
      }
    } catch (err) {
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
      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
          sidebarItems={sidebarItems}
          userRole="candidate"
        />

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}
        >
          <h1 className="text-3xl font-bold mb-6 text-black">My Profile</h1>

          <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Qualification"
                value={profile.qualification}
                onChange={(e) =>
                  setProfile({ ...profile, qualification: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Recent Studied"
                value={profile.recentStudied}
                onChange={(e) =>
                  setProfile({ ...profile, recentStudied: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg"
              />
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                placeholder="Address"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg col-span-1 md:col-span-2"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? 'Saving...' : 'Update Profile'}
              </button>

              {successMsg && (
                <p className="text-green-600 font-medium">{successMsg}</p>
              )}
              {errorMsg && <p className="text-red-600 font-medium">{errorMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ProfilePage);