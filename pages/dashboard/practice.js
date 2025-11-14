import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';
import Navbar from "../../components/Navbar";

const PracticeSessionsPage = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    session_type: 'behavioral',
    difficulty: 'medium',
    duration_minutes: 30
  });

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);
    fetchPracticeSessions();
  }, []);

  const fetchPracticeSessions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/get-practice-sessions?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching practice sessions:', error);
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

  const createPracticeSession = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch('/api/create-practice-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newSession,
          user_id: userId
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewSession({
          title: '',
          description: '',
          session_type: 'behavioral',
          difficulty: 'medium',
          duration_minutes: 30
        });
        fetchPracticeSessions();
      }
    } catch (error) {
      console.error('Error creating practice session:', error);
    }
  };

  const startPracticeSession = (sessionId) => {
    router.push(`/practice/${sessionId}`);
  };

  const viewFeedback = (sessionId) => {
    router.push(`/dashboard/ai-feedback?practice=${sessionId}`);
  };

  const filteredSessions = sessions.filter(session => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return session.status === 'draft' || session.status === 'in_progress';
    if (activeTab === 'completed') return session.status === 'completed';
    return session.session_type === activeTab;
  });

  const sessionTypes = {
    behavioral: { name: 'Behavioral', color: 'purple', icon: '💬' },
    technical: { name: 'Technical', color: 'blue', icon: '💻' },
    coding: { name: 'Coding', color: 'green', icon: '🔢' },
    system_design: { name: 'System Design', color: 'orange', icon: '🏗️' }
  };

  const difficultyColors = {
    easy: 'green',
    medium: 'yellow',
    hard: 'orange',
    expert: 'red'
  };

  return (
    <>
      <Head>
        <title>Practice Sessions - Skill Scanner</title>
        <meta name="description" content="Practice and prepare for your interviews" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <Navbar />
        <div className="flex">
          <Sidebar
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            handleLogout={handleLogout}
          />

          <div className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-72'
          } p-4 md:p-6`}>
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Practice Sessions</h1>
                <p className="text-gray-300 text-sm md:text-base">
                  Prepare for interviews with AI-powered practice sessions
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Session</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Sessions', value: sessions.length, color: 'blue' },
                { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: 'green' },
                { label: 'In Progress', value: sessions.filter(s => s.status === 'in_progress').length, color: 'yellow' },
                { label: 'Avg Score', value: sessions.filter(s => s.score).reduce((acc, s) => acc + s.score, 0) / sessions.filter(s => s.score).length || 0, color: 'purple', isScore: true },
              ].map((stat, index) => (
                <div key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.isScore ? stat.value.toFixed(1) + '%' : stat.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-500/20' :
                      stat.color === 'green' ? 'bg-green-500/20' :
                      stat.color === 'yellow' ? 'bg-yellow-500/20' : 'bg-purple-500/20'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        stat.color === 'blue' ? 'text-blue-400' :
                        stat.color === 'green' ? 'text-green-400' :
                        stat.color === 'yellow' ? 'text-yellow-400' : 'text-purple-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-4 md:p-6 mb-6">
              <div className="flex flex-wrap gap-2">
                {['all', 'active', 'completed', 'behavioral', 'technical', 'coding', 'system_design'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions Grid */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-400">Loading sessions...</span>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No practice sessions found</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                    {activeTab !== 'all' 
                      ? `No ${activeTab.replace('_', ' ')} sessions found. Try creating a new session.`
                      : "You haven't created any practice sessions yet. Start practicing to improve your interview skills."}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create First Session</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSessions.map((session) => {
                    const sessionType = sessionTypes[session.session_type] || sessionTypes.behavioral;
                    const difficultyColor = difficultyColors[session.difficulty] || 'gray';
                    
                    return (
                      <div key={session.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              sessionType.color === 'purple' ? 'bg-purple-500/20' :
                              sessionType.color === 'blue' ? 'bg-blue-500/20' :
                              sessionType.color === 'green' ? 'bg-green-500/20' : 'bg-orange-500/20'
                            }`}>
                              <span className="text-xl">{sessionType.icon}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-white text-lg mb-1">{session.title}</h3>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                sessionType.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                sessionType.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                sessionType.color === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                                'bg-orange-500/20 text-orange-300 border-orange-500/30'
                              }`}>
                                {sessionType.name}
                              </span>
                            </div>
                          </div>
                          {session.score && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{session.score}%</div>
                              <div className="text-xs text-gray-400">Score</div>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {session.description || 'No description provided'}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{session.duration_minutes} min</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                              difficultyColor === 'green' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              difficultyColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              difficultyColor === 'orange' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>
                              {session.difficulty}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            session.status === 'completed' 
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : session.status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}>
                            {session.status.replace('_', ' ')}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {session.status === 'completed' ? (
                            <button
                              onClick={() => viewFeedback(session.id)}
                              className="flex-1 flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 border border-blue-500/30"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>View Feedback</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => startPracticeSession(session.id)}
                              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{session.status === 'in_progress' ? 'Continue' : 'Start'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-xl bg-gray-800/95 rounded-3xl border border-white/10 shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Create Practice Session</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Session Title</label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    placeholder="e.g., Behavioral Questions Practice"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newSession.description}
                    onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                    placeholder="Describe what you want to practice..."
                    rows="3"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={newSession.session_type}
                      onChange={(e) => setNewSession({...newSession, session_type: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="coding">Coding</option>
                      <option value="system_design">System Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                    <select
                      value={newSession.difficulty}
                      onChange={(e) => setNewSession({...newSession, difficulty: e.target.value})}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newSession.duration_minutes}
                    onChange={(e) => setNewSession({...newSession, duration_minutes: parseInt(e.target.value) || 30})}
                    min="5"
                    max="180"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 text-gray-300 hover:text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={createPracticeSession}
                  disabled={!newSession.title.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Create Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default withAuth(PracticeSessionsPage, 'candidate');