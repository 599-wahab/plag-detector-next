// pages/dashboard/candidate.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';

const CandidateDashboard = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [fullName, setFullName] = useState('Candidate');

  // Fetch user data after mounting
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);

    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchInterviews(userId);
      fetchProfile(userId);
    }
  }, []);

  const fetchInterviews = async (userId) => {
    try {
      const res = await fetch(`/api/get-my-interviews-by-id?userId=${userId}`);
      const data = await res.json();
      if (data.success) setInterviews(data.interviews);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    }
  };

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/get-profile?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setFullName(data.profile.fullName || 'Candidate');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setFullName('Candidate');
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

  const sidebarItems = [
    { id: 1, name: 'Home', icon: 'fas fa-tachometer-alt', path: '/dashboard/candidate' },
    { id: 2, name: 'Profile', icon: 'fas fa-user-circle', path: '/dashboard/profile' },
    { id: 3, name: 'Settings', icon: 'fas fa-cog', path: '/dashboard/settings' },
  ];

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
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                  } py-3 text-black hover:bg-gray-200 rounded-lg transition-all duration-300 ${
                    router.pathname === item.path ? 'bg-gray-100 shadow-lg' : ''
                  }`}
                >
                  <i
                    className={`${item.icon} ${
                      sidebarCollapsed ? 'text-xl' : 'mr-3'
                    } ${sidebarCollapsed ? '' : 'w-6'}`}
                  ></i>
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </button>
              ))}
            </nav>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                } py-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 border border-red-300`}
              >
                <i
                  className={`fas fa-sign-out-alt ${
                    sidebarCollapsed ? 'text-xl' : 'mr-3'
                  } ${sidebarCollapsed ? '' : 'w-6'}`}
                ></i>
                {!sidebarCollapsed && <span className="font-medium">Logout</span>}
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black mb-1">
                {fullName}
              </h1>
              <p className="text-gray-700 text-lg">
                Welcome back to your dashboard!
              </p>
            </div>

            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 min-w-80">
              <input
                type="text"
                placeholder="Search jobs, interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-black placeholder-gray-500 focus:outline-none"
              />
              <i className="fas fa-search text-gray-600 ml-2"></i>
            </div>
          </div>

          {/* Recent Interviews Section */}
          <div className="bg-gray-100 rounded-xl border border-gray-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <i className="fas fa-calendar-alt text-2xl text-blue-400"></i>
                <h2 className="text-2xl font-bold text-black">Recent Interviews</h2>
              </div>
            </div>

            {interviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-black">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Date & Time</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.map((interview) => {
                      const scheduledDate = new Date(interview.scheduledAt);
                      const now = new Date();
                      let displayStatus = interview.status;
                      if (scheduledDate > now) displayStatus = 'Scheduled';

                      return (
                        <tr key={interview.id} className="border-b border-gray-300">
                          <td className="px-4 py-2">
                            {scheduledDate.toLocaleString()}
                          </td>
                          <td className="px-4 py-2">{displayStatus}</td>
                          <td className="px-4 py-2">{interview.phone}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-clipboard-list text-6xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No recent interviews found
                </h3>
                <p className="text-gray-600">
                  Your interview history will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected route (only for "candidate" role)
export default withAuth(CandidateDashboard, 'candidate');
