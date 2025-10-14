// pages/dashboard/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';

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
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } bg-white/90 backdrop-blur-md border-r border-gray-300 transition-all duration-300 min-h-screen fixed left-0 top-16 z-40`}
        >
          <div className="p-4 flex flex-col h-full">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-black hover:bg-gray-200 rounded-lg transition-colors mb-4"
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
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                } py-3 text-black hover:bg-gray-200 rounded-lg`}
              >
                <i
                  className={`fas fa-tachometer-alt ${
                    sidebarCollapsed ? 'text-xl' : 'mr-3'
                  }`}
                ></i>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>

              <button
                onClick={() => router.push('/dashboard/profile')}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                } py-3 text-black bg-gray-100 rounded-lg`}
              >
                <i
                  className={`fas fa-user-circle ${
                    sidebarCollapsed ? 'text-xl' : 'mr-3'
                  }`}
                ></i>
                {!sidebarCollapsed && <span>Profile</span>}
              </button>
            </nav>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                } py-3 text-red-600 hover:bg-red-100 rounded-lg border border-red-300`}
              >
                <i
                  className={`fas fa-sign-out-alt ${
                    sidebarCollapsed ? 'text-xl' : 'mr-3'
                  }`}
                ></i>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>

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
