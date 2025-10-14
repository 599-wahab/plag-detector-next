import { useState } from 'react';
import Router from 'next/router';
import Navbar from '../components/Navbar';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be 6+ characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();

      if (resp.ok) {
        localStorage.setItem('userId', data.userId || '');
        localStorage.setItem('role', data.role || '');
        localStorage.setItem('email', data.email || '');
        const redirectPath =
          data.role === 'interviewer'
            ? '/dashboard/interviewer'
            : data.role === 'candidate'
            ? '/dashboard/candidate'
            : '/';
        Router.push(redirectPath);
      } else {
        setErrors({ general: data.error || 'Invalid credentials' });
      }
    } catch (err) {
      setErrors({ general: 'Network error: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="animated-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center bg-transparent pt-16 px-4 relative z-10">
        <div className="max-w-md w-full">
          <div className="relative backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-gray-200">Enter your details to continue</p>
            </div>

            <form onSubmit={doLogin} className="space-y-6">
              <div>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm ${
                    errors.email ? 'border-red-400' : ''
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-300">{errors.email}</p>}
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange} 
                  placeholder="Password"
                  className={`w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm pr-12 ${
                    errors.password ? 'border-red-400' : ''
                  }`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                {errors.password && <p className="mt-2 text-sm text-red-300">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="bg-red-400/20 border border-red-400/50 rounded-lg p-3 backdrop-blur-sm">
                  <p className="text-red-300 text-sm">{errors.general}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full rainbow-btn py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Enter Advanced Interview Era'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-200">
                New Here?{' '}
                <a href="/signup" className="text-white font-semibold hover:underline transition-colors">
                  Signup First
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}