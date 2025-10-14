// pages/dashboard/candidate.js
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';
import Navbar from "../../components/Navbar";
import useSWR from 'swr';

// fetcher for SWR
const fetcher = (url) => fetch(url).then((r) => r.json());

const CandidateDashboard = () => {
  const router = useRouter();

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fullName, setFullName] = useState('Candidate');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // userId (safe for SSR)
  const [userId, setUserId] = useState(null);
  const userIdRef = useRef(null);

  // SWR: only fetch when we have userId
  const { data, error, mutate } = useSWR(
    userId ? `/api/get-my-interviews-by-id?userId=${userId}` : null,
    fetcher,
    { revalidateOnFocus: true }
  );

  const interviews = data?.interviews || [];

  // run on mount: set userId, sidebar state, profile, resize handlers
  useEffect(() => {
    // responsive check
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // sidebar collapsed saved state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);

    // get userId from localStorage (client-side)
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (uid) {
      setUserId(uid);
      userIdRef.current = uid;
      // fetch profile (not via SWR to keep your original behavior)
      fetchProfile(uid);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optional: realtime notification (if NEXT_PUBLIC_SIGNALING_SERVER set)
  useEffect(() => {
    if (!userId) return;
    const SIGNALING = process.env.NEXT_PUBLIC_SIGNALING_SERVER;
    if (!SIGNALING) return; // not configured; skip socket

    // import dynamically to avoid SSR issues
    let socket;
    (async () => {
      const { io } = await import('socket.io-client');
      socket = io(SIGNALING, { transports: ['websocket'] });

      socket.on('connect', () => {
        // Optionally join a personal room if your server supports it
        // socket.emit('join-personal', userId);
        // Listen for scheduled interview notifications
        socket.on('scheduled-interview', (payload) => {
          try {
            // payload expected: { userId, meetingRoomId, scheduledAt }
            if (!payload) return;
            if (payload.userId && payload.userId.toString() === userId.toString()) {
              // notify and revalidate SWR
              alert(`Interview scheduled. Room ID: ${payload.meetingRoomId || 'TBD'}`);
              mutate(); // re-fetch interview list
            }
          } catch (e) {
            console.error('socket scheduled-interview handler error', e);
          }
        });
      });

      socket.on('connect_error', (err) => {
        console.warn('Socket connect error', err);
      });
    })();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [userId, mutate]);

  // fetch profile for fullname
  const fetchProfile = async (uid) => {
    try {
      const res = await fetch(`/api/get-profile?userId=${uid}`);
      const json = await res.json();
      if (json.success) setFullName(json.profile.fullName || 'Candidate');
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setFullName('Candidate');
    }
  };

  // join meeting navigation
  const joinMeeting = (roomId) => {
    if (!roomId) {
      alert('No meeting room ID available');
      return;
    }
    router.push(`/meeting/${roomId}`);
  };

  // toggle sidebar and persist
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  // logout handler
  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  // format helpers (kept from your code)
  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: '', full: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString(),
    };
  };

  const getStatusColor = (status, scheduledAt) => {
    if (!scheduledAt) return 'bg-yellow-100 text-yellow-800';
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    if (scheduledDate > now) return 'bg-blue-100 text-blue-800';
    if (status === 'completed') return 'bg-green-100 text-green-800';
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status, scheduledAt) => {
    if (!scheduledAt) return 'Pending';
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    if (scheduledDate > now) return 'Scheduled';
    if (status === 'completed') return 'Completed';
    if (status === 'cancelled') return 'Cancelled';
    return 'Pending';
  };

  // UI for loading / errors (SWR)
  const loadingInterviews = !data && !error;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar Component */}
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
        />

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-72'
          } p-4 md:p-6`}
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Welcome back, {fullName}!
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your interviews and track your progress
              </p>
            </div>

            {/* Search Bar - Hidden on mobile to save space */}
            <div className="hidden md:flex items-center bg-white rounded-full px-4 py-2 min-w-80 border border-gray-200 shadow-sm">
              <input
                type="text"
                placeholder="Search jobs, interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm"
              />
              <i className="fas fa-search text-gray-400 ml-2"></i>
            </div>
          </div>

          {/* Recent Interviews Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-blue-500 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recent Interviews</h2>
                  <p className="text-gray-500 text-sm hidden md:block">
                    Your upcoming and completed interviews
                  </p>
                </div>
              </div>

              {/* Mobile Search Button */}
              <button className="md:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                <i className="fas fa-search text-gray-600"></i>
              </button>
            </div>

            {loadingInterviews ? (
              <div className="py-12 text-center text-gray-600">Loading interviews...</div>
            ) : error ? (
              <div className="py-12 text-center text-red-600">Failed to load interviews.</div>
            ) : interviews.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-gray-900">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Contact</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Position</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((interview) => {
                        const formattedDate = formatDate(interview.scheduledAt);
                        const statusText = getStatusText(interview.status, interview.scheduledAt);
                        const statusColor = getStatusColor(interview.status, interview.scheduledAt);

                        return (
                          <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{formattedDate.date}</div>
                              <div className="text-xs text-gray-500">{formattedDate.time}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.phone || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.position || 'Not specified'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {interview.meetingRoomId ? (
                                <button
                                  onClick={() => joinMeeting(interview.meetingRoomId)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded"
                                >
                                  Join
                                </button>
                              ) : (
                                <span className="text-gray-500">No room yet</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {interviews.map((interview) => {
                    const formattedDate = formatDate(interview.scheduledAt);
                    const statusText = getStatusText(interview.status, interview.scheduledAt);
                    const statusColor = getStatusColor(interview.status, interview.scheduledAt);

                    return (
                      <div key={interview.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-1">
                              {interview.position || 'Interview'}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                              <i className="fas fa-calendar text-gray-400"></i>
                              <span>{formattedDate.date}</span>
                              <i className="fas fa-clock text-gray-400 ml-2"></i>
                              <span>{formattedDate.time}</span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor} flex-shrink-0 ml-2`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-phone text-gray-400"></i>
                            <span className="text-gray-600">{interview.phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-building text-gray-400"></i>
                            <span className="text-gray-600">{interview.company || 'N/A'}</span>
                          </div>
                        </div>

                        {(interview.notes || interview.interviewer) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            {interview.interviewer && (
                              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-1">
                                <i className="fas fa-user-tie text-gray-400"></i>
                                <span>With {interview.interviewer}</span>
                              </div>
                            )}
                            {interview.notes && (
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {interview.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Mobile join button area */}
                        <div className="mt-3 flex justify-end">
                          {interview.meetingRoomId ? (
                            <button
                              onClick={() => joinMeeting(interview.meetingRoomId)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                            >
                              Join
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm">No room yet</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              // Empty State (keeps your original empty state)
              <div className="text-center py-8 md:py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clipboard-list text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No interviews scheduled
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                  Your upcoming interviews will appear here once scheduled. Check back later or contact your recruiter.
                </p>
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <i className="fas fa-video"></i>
                  <span>Join Meeting</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats - Hidden on mobile */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{interviews.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-calendar-check text-blue-500 text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {interviews.filter(i => i.scheduledAt && new Date(i.scheduledAt) > new Date()).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-clock text-green-500 text-lg"></i>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {interviews.filter(i => i.status === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-check-circle text-purple-500 text-lg"></i>
                </div>
              </div>
            </div>
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

          <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></div>

          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
            Join Meeting Room
            <div className="absolute top-full right-3 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>

      {/* Meeting Room Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Join Meeting Room</h3>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Room ID
              </label>
              <input
                type="text"
                value={meetingRoomId}
                onChange={(e) => setMeetingRoomId(e.target.value)}
                placeholder="Enter room ID (e.g., 1yixqfpsh6a)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && joinMeeting(meetingRoomId)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter the meeting ID provided by your interviewer
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => { setShowMeetingModal(false); joinMeeting(meetingRoomId); }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <i className="fas fa-sign-in-alt"></i>
                <span>Join Meeting</span>
              </button>
              <button
                onClick={() => setShowMeetingModal(false)}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors rounded-xl hover:bg-gray-100"
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
