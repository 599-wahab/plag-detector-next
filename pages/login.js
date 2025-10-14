import { useState } from 'react';
import Router from 'next/router';
import Navbar from '../components/Navbar';
import '@/styles/AnimatedBackground.css';

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

      <div className="min-h-screen flex items-center justify-center bg-transparent pt-16 px-4">
        <div className="max-w-md w-full relative">
          <div className="relative backdrop-blur-md bg-white/70 rounded-2xl shadow-2xl border border-gray-200 p-8 z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <i className="fas fa-shield-alt text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Welcome Back</h2>
              <p className="text-gray-600">Enter your details to continue</p>
            </div>

            <form onSubmit={doLogin} className="space-y-6">
              <div>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 shadow-sm ${
                    errors.email ? 'border-red-400' : ''
                  }`} />
                {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={handleChange} placeholder="Password"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 shadow-sm ${
                    errors.password ? 'border-red-400' : ''
                  }`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
                {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-red-500 text-sm">{errors.general}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full rainbow-btn py-3 px-6 rounded-lg font-semibold text-black transition-all duration-300">
                {isLoading ? 'Signing In...' : 'Enter Advanced Interview Era'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New Here?{' '}
                <a href="/signup" className="text-black font-semibold hover:underline">
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
