import { useState } from 'react';
import Navbar from '../components/Navbar';
import Router from 'next/router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [loading, setLoading] = useState(false);

  async function doSignup(e) {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !role) {
      alert('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword, role })
      });
      const data = await resp.json();
      if (resp.ok) {
        alert('Signed up');
        Router.push('/login');
      } else {
        alert('Error: ' + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="creative-bg pointer-events-none z-0">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      <Navbar />

      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="login-container w-full max-w-lg glass-card rounded-2xl p-8 relative">
          <div className="login-header text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-br from-primaryFrom to-primaryTo">
              Signup New User
            </h2>
            <p className="text-gray-600 italic mt-1">Enter your Details</p>
          </div>

          <form onSubmit={doSignup} className="space-y-5">
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  className="w-full rounded-xl px-4 py-4 text-gray-800 outline-none"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <div className="input-decoration mt-2 h-1 rounded-full"></div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper relative">
                <input
                  className="w-full rounded-xl px-4 py-4 text-gray-800 outline-none"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="input-decoration mt-2 h-1 rounded-full"></div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper relative">
                <input
                  className="w-full rounded-xl px-4 py-4 text-gray-800 outline-none"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <div className="input-decoration mt-2 h-1 rounded-full"></div>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-gray-800 outline-none bg-white"
                >
                  <option value="candidate">Candidate (Interviewee)</option>
                  <option value="interviewer">Interviewer</option>
                </select>
                <div className="input-decoration mt-2 h-1 rounded-full"></div>
              </div>
            </div>

            <button
              type="submit"
              className={`login-btn relative w-full rounded-xl py-4 font-semibold text-white ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="btn-bg"></span>
              <span className="btn-text">Signup</span>
              <span className="btn-loader">
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce delay-200 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce delay-400"></span>
              </span>
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account? <a href="/login" className="text-primaryFrom font-medium">Login Here</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
