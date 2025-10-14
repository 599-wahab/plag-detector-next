// pages/dashboard/interviewer.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import withAuth from "../../lib/withAuth";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function InterviewerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [scheduleDates, setScheduleDates] = useState({});
  const [meetingRoomInputs, setMeetingRoomInputs] = useState({});
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loadingScheduled, setLoadingScheduled] = useState(false);
  const [savingIdx, setSavingIdx] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'candidates'
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") setSidebarCollapsed(true);
    fetchScheduledInterviews();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState.toString());
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await fetch("/api/get-candidates");
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates || []);
        if (isMobile) {
          setActiveTab('candidates');
        } else {
          setShowCandidatesModal(true);
        }
      } else {
        alert("Error: " + (data.error || "Failed to load candidates"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error fetching candidates");
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchScheduledInterviews = async () => {
    setLoadingScheduled(true);
    try {
      const res = await fetch("/api/get-scheduled-interviews");
      const data = await res.json();
      if (data.success) setScheduledInterviews(data.interviews || []);
      else alert("Error loading scheduled interviews: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Failed to load scheduled interviews.");
    } finally {
      setLoadingScheduled(false);
    }
  };

  const saveInterview = async (candidate, index) => {
    const dt = scheduleDates[index];
    if (!dt) return alert("Select date & time first");

    const { createRoom, meetingRoomId } = meetingRoomInputs[index] || { createRoom: false, meetingRoomId: '' };

    setSavingIdx(index);
    try {
      const res = await fetch("/api/schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: candidate.id,
          scheduledAt: new Date(dt).toISOString(),
          meetingRoomId: (meetingRoomId && meetingRoomId.trim()) ? meetingRoomId.trim() : undefined,
          createRoom: !!createRoom
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Interview scheduled for ${candidate.full_name || candidate.email}`);
        if (data.meetingRoomId) {
          alert(`Meeting Room ID: ${data.meetingRoomId}. Share it with the candidate.`);
        }
        await fetchScheduledInterviews();
        // Reset form for this candidate
        setScheduleDates(prev => ({ ...prev, [index]: '' }));
        setMeetingRoomInputs(prev => ({ ...prev, [index]: { createRoom: false, meetingRoomId: '' } }));
      } else {
        alert("Failed to schedule: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Error scheduling interview");
    } finally {
      setSavingIdx(null);
    }
  };

  const createInstantMeeting = () => {
    const roomId = Math.random().toString(36).slice(2, 12);
    router.push(`/meeting/${roomId}`);
  };

  const copyMeetingLink = (roomId) => {
    const meetingLink = `${window.location.origin}/meeting/${roomId}`;
    navigator.clipboard.writeText(meetingLink);
    alert('Meeting link copied to clipboard!');
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString()
    };
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sidebarItems = [
    { id: 1, name: 'Dashboard', icon: 'fas fa-tachometer-alt', path: '/dashboard/interviewer' },
    { id: 2, name: 'Profile', icon: 'fas fa-user-circle', path: '/dashboard/profile' },
    { id: 3, name: 'Settings', icon: 'fas fa-cog', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
          sidebarItems={sidebarItems}
          userRole="interviewer"
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-72'
        } p-4 md:p-6`}>
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Interviewer Dashboard
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage candidates and schedule interviews
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={fetchCandidates}
                disabled={loadingCandidates}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              >
                <i className={`fas ${loadingCandidates ? 'fa-spinner animate-spin' : 'fa-users'} text-sm`}></i>
                <span>{loadingCandidates ? 'Loading...' : 'Candidates'}</span>
              </button>
              
              <button 
                onClick={fetchScheduledInterviews}
                className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <i className="fas fa-refresh text-sm"></i>
                <span>Refresh</span>
              </button>
              
              <button 
                onClick={createInstantMeeting}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <i className="fas fa-video text-sm"></i>
                <span>Instant Meet</span>
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          {isMobile && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'scheduled'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Scheduled
                </button>
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                    activeTab === 'candidates'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className="fas fa-users mr-2"></i>
                  Candidates
                </button>
              </div>
            </div>
          )}

          {/* Scheduled Interviews Section */}
          {(activeTab === 'scheduled' || !isMobile) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 mb-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-calendar-check text-blue-500 text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">Scheduled Interviews</h2>
                    <p className="text-gray-500 text-sm hidden md:block">
                      View and manage upcoming interviews
                    </p>
                  </div>
                </div>
                
                {/* Mobile counter badge */}
                {isMobile && scheduledInterviews.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {scheduledInterviews.length}
                  </span>
                )}
              </div>

              {loadingScheduled ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading interviews...</span>
                </div>
              ) : scheduledInterviews.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-calendar-times text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No interviews scheduled
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                    Schedule interviews with candidates to see them here.
                  </p>
                  <button
                    onClick={fetchCandidates}
                    className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-users"></i>
                    <span>View Candidates</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full text-gray-900">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Candidate</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date & Time</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Room ID</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scheduledInterviews.map((interview) => {
                          const formattedDate = formatDate(interview.scheduledAt);
                          return (
                            <tr key={interview.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {interview.fullName || interview.email}
                                </div>
                                {interview.email && (
                                  <div className="text-xs text-gray-500">{interview.email}</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{formattedDate.date}</div>
                                <div className="text-xs text-gray-500">{formattedDate.time}</div>
                              </td>
                              <td className="px-4 py-3">
                                {interview.meetingRoomId ? (
                                  <div className="flex items-center space-x-2">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                                      {interview.meetingRoomId}
                                    </code>
                                    <button
                                      onClick={() => copyMeetingLink(interview.meetingRoomId)}
                                      className="text-blue-500 hover:text-blue-700"
                                      title="Copy meeting link"
                                    >
                                      <i className="fas fa-copy text-sm"></i>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(interview.status)}`}>
                                  {interview.status || 'Scheduled'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {interview.meetingRoomId && (
                                  <button
                                    onClick={() => router.push(`/meeting/${interview.meetingRoomId}`)}
                                    className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <i className="fas fa-video text-xs"></i>
                                    <span>Join</span>
                                  </button>
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
                    {scheduledInterviews.map((interview) => {
                      const formattedDate = formatDate(interview.scheduledAt);
                      return (
                        <div key={interview.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                {interview.fullName || interview.email}
                              </h3>
                              {interview.email && (
                                <p className="text-xs text-gray-500 mb-2">{interview.email}</p>
                              )}
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <i className="fas fa-calendar text-gray-400"></i>
                                <span>{formattedDate.date}</span>
                                <i className="fas fa-clock text-gray-400 ml-2"></i>
                                <span>{formattedDate.time}</span>
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(interview.status)} flex-shrink-0 ml-2`}>
                              {interview.status || 'Scheduled'}
                            </span>
                          </div>
                          
                          {interview.meetingRoomId && (
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <div className="flex items-center space-x-2">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                  {interview.meetingRoomId}
                                </code>
                                <button
                                  onClick={() => copyMeetingLink(interview.meetingRoomId)}
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                >
                                  <i className="fas fa-copy text-xs"></i>
                                </button>
                              </div>
                              <button
                                onClick={() => router.push(`/meeting/${interview.meetingRoomId}`)}
                                className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                <i className="fas fa-video text-xs"></i>
                                <span>Join</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Candidates Section (Mobile Tab) */}
          {(activeTab === 'candidates' && isMobile) && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-users text-purple-500 text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Candidates</h2>
                    <p className="text-gray-500 text-sm">Schedule interviews with candidates</p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {candidates.length}
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-slash text-gray-400 text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No candidates found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    There are no candidates available to schedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {candidates.map((candidate, idx) => (
                    <div key={candidate.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                          {candidate.full_name || candidate.email}
                        </h3>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-envelope text-gray-400"></i>
                            <span>{candidate.email}</span>
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-phone text-gray-400"></i>
                              <span>{candidate.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Schedule Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            value={scheduleDates[idx] || ""}
                            onChange={(e) => setScheduleDates(prev => ({ ...prev, [idx]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={!!(meetingRoomInputs[idx]?.createRoom)}
                              onChange={(e) => setMeetingRoomInputs(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), createRoom: e.target.checked } }))}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Create new meeting room</span>
                          </label>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Or use existing Room ID
                            </label>
                            <input
                              type="text"
                              placeholder="Enter room ID"
                              value={(meetingRoomInputs[idx]?.meetingRoomId) || ""}
                              onChange={(e) => setMeetingRoomInputs(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), meetingRoomId: e.target.value } }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => saveInterview(candidate, idx)}
                          disabled={savingIdx === idx || !scheduleDates[idx]}
                          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                          {savingIdx === idx ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Scheduling...</span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-calendar-plus"></i>
                              <span>Schedule Interview</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Candidates Modal (Desktop) */}
      {showCandidatesModal && !isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl p-6 my-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="fas fa-users text-purple-500 text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Schedule Interviews</h3>
                  <p className="text-gray-500 text-sm">Select candidates and schedule interviews</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCandidatesModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No candidates found.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {candidates.map((candidate, idx) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{candidate.full_name || candidate.email}</div>
                      <div className="text-sm text-gray-600">
                        {candidate.email} {candidate.phone && `• ${candidate.phone}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="datetime-local"
                        value={scheduleDates[idx] || ""}
                        onChange={(e) => setScheduleDates(prev => ({ ...prev, [idx]: e.target.value }))}
                        className="border border-gray-300 p-2 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={!!(meetingRoomInputs[idx]?.createRoom)}
                            onChange={(e) => setMeetingRoomInputs(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), createRoom: e.target.checked } }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Create Room
                        </label>
                        <input
                          type="text"
                          placeholder="Or enter room id"
                          value={(meetingRoomInputs[idx]?.meetingRoomId) || ""}
                          onChange={(e) => setMeetingRoomInputs(prev => ({ ...prev, [idx]: { ...(prev[idx]||{}), meetingRoomId: e.target.value } }))}
                          className="border border-gray-300 p-2 rounded-lg w-32 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <button
                        onClick={() => saveInterview(candidate, idx)}
                        disabled={savingIdx === idx || !scheduleDates[idx]}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors min-w-32 justify-center"
                      >
                        {savingIdx === idx ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-calendar-plus"></i>
                            <span>Schedule</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(InterviewerDashboard, "interviewer");