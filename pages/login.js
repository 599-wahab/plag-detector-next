import { useState } from 'react';
import Navbar from '../components/Navbar';
import Router from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function doLogin(e) {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (resp.ok) {
        // Save IDs and role (if returned)
        if (data.userId) localStorage.setItem('userId', data.userId);
        if (data.role) localStorage.setItem('role', data.role);

        alert('Login OK');
        // redirect based on role if available
        if (data.role === 'candidate') Router.push('/dashboard/candidate');
        else if (data.role === 'interviewer') Router.push('/dashboard/interviewer');
        else Router.push('/');
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
        <div className="login-container w-full max-w-lg glass-card rounded-2xl p-8 relative z-10">
          <div className="card-decoration absolute top-0 left-0 right-0 h-2 overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-pink-400 via-teal-300 to-sky-400 animate-pulse"></div>
          </div>

          <div className="login-header text-center mb-6">
            <div className="creative-logo mx-auto mb-3 w-20 h-20 rounded-full flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-yellow-400 animate-spin-slow"></div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 bg-clip-text text-transparent bg-gradient-to-br from-primaryFrom to-primaryTo">
              Login Form
            </h2>
            <p className="text-gray-600 italic mt-1">Enter your Details</p>
          </div>

          <form onSubmit={doLogin} className="space-y-5">
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

            <div className="form-group relative">
              <div className="input-wrapper">
                <input
                  className="w-full rounded-xl px-4 py-4 text-gray-800 outline-none"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className="input-decoration mt-2 h-1 rounded-full"></div>
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-4 text-gray-500"
                  aria-label="Toggle password"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="w-4 h-4" />
                Remember Me
              </label>
              <a className="text-primaryFrom font-semibold hover:underline" href="#">Forgot password?</a>
            </div>

            <button
              type="submit"
              className={`login-btn relative w-full rounded-xl py-4 font-semibold text-white login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span className="btn-bg"></span>
              <span className="btn-text">Enter Advance Interview Era</span>
              <span className="btn-loader">
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce delay-200 mr-1"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-white animate-bounce delay-400"></span>
              </span>
            </button>

            <div className="text-center text-sm text-gray-600">
              New here? <a href="/signup" className="text-primaryFrom font-medium">Signup first</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
