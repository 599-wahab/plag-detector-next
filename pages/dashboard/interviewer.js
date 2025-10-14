import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';

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

  const router = useRouter();

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

  // ✅ Cancel interview
  const cancelInterview = async (candidateId) => {
    try {
      const res = await fetch('/api/update-interview-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidateId, status: 'Cancelled' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Interview status updated to Cancelled');
        fetchScheduledInterviews();
      } else alert('Failed to cancel interview: ' + data.error);
    } catch (err) {
      alert('Error cancelling interview: ' + err.message);
    }
  };

  // ✅ Mark interview as completed
  const completeInterview = async (candidateId) => {
    try {
      const res = await fetch('/api/update-interview-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidateId, status: 'Completed' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Interview status updated to Completed');
        fetchScheduledInterviews();
      } else alert('Failed to complete interview: ' + data.error);
    } catch (err) {
      alert('Error completing interview: ' + err.message);
    }
  };

  // ✅ Edit interview time
  const editInterview = async (candidateId, newDate) => {
    try {
      const res = await fetch('/api/update-interview-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidateId, scheduledAt: newDate.toISOString() }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Interview time updated successfully');
        setEditingRow(null);
        fetchScheduledInterviews();
      } else alert('Failed to update interview time: ' + data.error);
    } catch (err) {
      alert('Error updating interview time: ' + err.message);
    }
  };

  // ✅ Helper: check if interview scheduled
  const isInterviewScheduled = (candidateId) => {
    return scheduledInterviews.some((i) => i.userId === candidateId);
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

  const sidebarItems = [
    { id: 1, name: 'Dashboard', icon: 'fas fa-tachometer-alt', active: true },
    { id: 3, name: 'Report', icon: 'fas fa-chart-line', active: false },
    { id: 4, name: 'Plagiarism Detection', icon: 'fas fa-search-plus', active: false },
    { id: 5, name: 'Profile', icon: 'fas fa-user-circle', active: false },
    { id: 6, name: 'Settings', icon: 'fas fa-cog', active: false },
  ];

  return (
    <div className="min-h-screen bg-white text-black pt-16">
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarCollapsed ? 'w-20' : 'w-72'
          } bg-gray-100 backdrop-blur-md border-r border-gray-300 transition-all duration-300 min-h-screen fixed left-0 top-16 z-40`}
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
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-2' : 'px-4'
                  } py-3 text-black hover:bg-gray-200 rounded-lg transition-all duration-300 ${
                    item.active ? 'bg-gray-300 shadow-lg' : ''
                  }`}
                >
                  <i
                    className={`${item.icon} ${
                      sidebarCollapsed ? 'text-xl' : 'mr-3'
                    } ${sidebarCollapsed ? '' : 'w-6'}`}
                  ></i>
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-4">
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

          {/* ✅ Your Scheduled Interviews table and Candidate modal remain unchanged below */}
          {/* You can keep your entire table and modal JSX from your previous code here */}
        </div>
      </div>
    </div>
  );
}

export default withAuth(InterviewerDashboard, 'interviewer');
