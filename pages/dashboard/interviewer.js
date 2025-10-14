import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';

function InterviewerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activePicker, setActivePicker] = useState(null);
  const [scheduleDates, setScheduleDates] = useState({});
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [editingRow, setEditingRow] = useState(null);
  const [user, setUser] = useState(null);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState('');

  const router = useRouter();

  const sidebarItems = [
    { id: 1, name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard/interviewer' },
    { id: 3, name: 'Report', icon: 'fas fa-chart-line', path: '/dashboard/report' },
    { id: 4, name: 'Plagiarism Detection', icon: 'fas fa-search-plus', path: '/dashboard/plagiarism' },
    { id: 5, name: 'Profile', icon: 'fas fa-user-circle', path: '/dashboard/profile' },
    { id: 6, name: 'Settings', icon: 'fas fa-cog', path: '/dashboard/settings' },
  ];

  // ✅ Load sidebar + user data
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);

    const userData = {
      id: localStorage.getItem('userId'),
      role: localStorage.getItem('role'),
      email: localStorage.getItem('email'),
    };
    setUser(userData);
    fetchScheduledInterviews();
  }, []);

  // ✅ Sidebar toggle
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // ✅ Create meeting
  const createMeeting = () => {
    const roomId = Math.random().toString(36).substring(2, 15);
    router.push(`/meeting/${roomId}`);
  };

  // ✅ Join existing meeting
  const joinMeeting = () => {
    if (!meetingRoomId.trim()) {
      alert('Please enter a meeting room ID');
      return;
    }
    router.push(`/meeting/${meetingRoomId.trim()}`);
  };

  // ✅ Fetch all candidates
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/get-candidates');
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        setShowCandidates(true);
      } else alert('Error fetching candidates: ' + data.error);
    } catch {
      alert('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch scheduled interviews
  const fetchScheduledInterviews = async () => {
    try {
      const res = await fetch('/api/get-scheduled-interviews');
      const data = await res.json();
      if (data.success) setScheduledInterviews(data.interviews);
      else alert('Error fetching scheduled interviews: ' + data.error);
    } catch {
      alert('Failed to fetch scheduled interviews');
    }
  };

  // ✅ Save new interview
  const saveInterview = async (candidate, index) => {
    if (!scheduleDates[index]) {
      alert('Please select a date & time first');
      return;
    }
    try {
      const res = await fetch('/api/schedule-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: candidate.id,
          scheduledAt: scheduleDates[index].toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Interview for ${candidate.fullName || candidate.email} scheduled successfully`);
        setActivePicker(null);
        setExpandedRow(null);
        fetchScheduledInterviews();
      } else alert('Failed to schedule interview: ' + data.error);
    } catch (err) {
      alert('Error scheduling interview: ' + err.message);
    }
  };

  // ✅ Dashboard cards
  const dashboardCards = [
    {
      id: 1,
      title: 'Create Meeting',
      description: 'Start a new interview session with candidates',
      icon: 'fas fa-video',
      gradient: 'from-cyan-500 to-blue-600',
      action: createMeeting,
    },
    {
      id: 2,
      title: 'Check Plagiarism',
      description: 'Analyze documents for plagiarism detection',
      icon: 'fas fa-search-plus',
      gradient: 'from-cyan-500 to-blue-600',
      action: () => alert('Plagiarism tool coming soon!'),
    },
    {
      id: 3,
      title: 'Generate Report',
      description: 'Create comprehensive interview reports',
      icon: 'fas fa-file-alt',
      gradient: 'from-cyan-500 to-blue-600',
      action: () => alert('Report generator coming soon!'),
    },
    {
      id: 4,
      title: 'Check Users',
      description: 'View all registered candidates in the system',
      icon: 'fas fa-briefcase',
      gradient: 'from-cyan-500 to-blue-600',
      action: fetchCandidates,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-black pt-16">
      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
          sidebarItems={sidebarItems}
          userRole="interviewer"
        />

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-72'
          } p-6`}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Interviewer Dashboard</h1>
              <p className="text-gray-700">Welcome back, {user?.email || 'User'}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {dashboardCards.map((card) => (
              <button
                key={card.id}
                onClick={card.action}
                className={`bg-gradient-to-r ${card.gradient} p-6 rounded-xl text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center justify-center mb-4">
                  <i className={`${card.icon} text-4xl`}></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-white/80 text-sm">{card.description}</p>
              </button>
            ))}
          </div>

          {/* Your existing table and modal content can remain here */}
          {/* ... rest of your interviewer-specific content ... */}
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
}

export default withAuth(InterviewerDashboard, 'interviewer');