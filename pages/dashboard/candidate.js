import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';

const CandidateDashboard = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [interviews, setInterviews] = useState([]);
  const [fullName, setFullName] = useState('Candidate');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState('');

  const sidebarItems = [
    { id: 1, name: 'Home', icon: 'fas fa-tachometer-alt', path: '/dashboard/candidate' },
    { id: 2, name: 'Profile', icon: 'fas fa-user-circle', path: '/dashboard/profile' },
    { id: 3, name: 'Settings', icon: 'fas fa-cog', path: '/dashboard/settings' },
  ];

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

  const joinMeeting = () => {
    if (!meetingRoomId.trim()) {
      alert('Please enter a meeting room ID');
      return;
    }
    router.push(`/meeting/${meetingRoomId.trim()}`);
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

      {/* Floating Meeting Room Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowMeetingModal(true)}
          className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group"
        >
          <i className="fas fa-video text-xl"></i>
          
          {/* Animated Ping Effect */}
          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75 group-hover:opacity-100"></div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-black text-white text-sm rounded py-1 px-2 whitespace-nowrap">
            Join Meeting Room
          </div>
        </button>
      </div>

      {/* Meeting Room Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Join Meeting Room</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Room ID
              </label>
              <input
                type="text"
                value={meetingRoomId}
                onChange={(e) => setMeetingRoomId(e.target.value)}
                placeholder="Enter room ID (e.g., 1yixqfpsh6a)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={joinMeeting}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Join Meeting
              </button>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(CandidateDashboard, 'candidate');