import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import withAuth from '../../lib/withAuth';
import Sidebar from '../../components/Sidebar';
import Navbar from "../../components/Navbar";

const ProfilePage = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    qualification: '',
    recentStudied: '',
    gender: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') setSidebarCollapsed(true);

    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('email');
    if (userId) {
      fetchProfile(userId);
      // Set email from localStorage immediately
      setProfile(prev => ({ ...prev, email: userEmail || '' }));
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const res = await fetch(`/api/get-profile?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(prev => ({ ...prev, ...data.profile }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg('Failed to load profile');
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
        // Update localStorage name if changed
        if (profile.fullName) {
          localStorage.setItem('name', profile.fullName);
        }
      } else {
        setErrorMsg(data.message || 'Failed to update profile.');
      }
    } catch {
      setErrorMsg('Network error updating profile.');
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

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    // Clear messages when user starts typing
    if (successMsg) setSuccessMsg('');
    if (errorMsg) setErrorMsg('');
  };

  return (
    <>
      <Head>
        <title>My Profile - Skill Scanner</title>
        <meta name="description" content="Manage your profile information on Skill Scanner" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
        <Navbar />
        <div className="flex">
          <Sidebar
            sidebarCollapsed={sidebarCollapsed}
            toggleSidebar={toggleSidebar}
            handleLogout={handleLogout}
          />

          <div
            className={`flex-1 transition-all duration-300 ${
              sidebarCollapsed ? 'ml-20' : 'ml-0 md:ml-72'
            } p-4 md:p-6`}
          >
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-gray-300 text-sm md:text-base">
                Manage your personal information and account settings
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-white/10">
                    Personal Information
                  </h2>
                </div>

                {[
                  { key: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'your.email@example.com', disabled: true },
                  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 123-4567' },
                  { key: 'gender', label: 'Gender', type: 'select', options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'] },
                  { key: 'qualification', label: 'Highest Qualification', type: 'text', placeholder: 'e.g., Bachelor\'s Degree' },
                  { key: 'recentStudied', label: 'Recent Education', type: 'text', placeholder: 'e.g., University Name' },
                ].map(({ key, label, type, placeholder, options, disabled }) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      {label}
                    </label>
                    {type === 'select' ? (
                      <select
                        value={profile[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        disabled={disabled}
                      >
                        {options.map(option => (
                          <option key={option} value={option} className="text-gray-800">
                            {option || 'Select gender'}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={profile[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={disabled}
                        className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 ${
                          disabled ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      />
                    )}
                  </div>
                ))}

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Address
                  </label>
                  <textarea
                    placeholder="Enter your complete address"
                    value={profile.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    placeholder="Tell us about yourself, your skills, and experience..."
                    value={profile.bio || ''}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 md:mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  {successMsg && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{successMsg}</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{errorMsg}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="px-6 py-3 text-gray-300 hover:text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(ProfilePage);