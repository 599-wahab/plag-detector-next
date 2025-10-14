import { useState } from 'react';
import Router from 'next/router';
import Navbar from '../components/Navbar';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Must be 6+ characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Select your role';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const doSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const resp = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();

      if (resp.ok) {
        alert('Signup successful! Please login.');
        Router.push('/login');
      } else {
        setErrors({ general: data.error || 'Signup failed' });
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
                <i className="fas fa-user-plus text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
              <p className="text-gray-600">Enter your details to get started</p>
            </div>

            <form onSubmit={doSignup} className="space-y-6">
              <input type="email" name="email" placeholder="Email Address" value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 shadow-sm" />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 shadow-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black">
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  placeholder="Confirm Password" value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 shadow-sm" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black">
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}

              <select name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 shadow-sm">
                <option value="" disabled>Select your role</option>
                <option value="candidate">Candidate (Interviewee)</option>
                <option value="interviewer">Interviewer</option>
              </select>
              {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}

              {errors.general && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-red-500 text-sm">{errors.general}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full rainbow-btn py-3 px-6 rounded-lg font-semibold text-black transition-all duration-300">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-black font-semibold hover:underline">Login Here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
