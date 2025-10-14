// components/Navbar.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('email');
        const role = localStorage.getItem('role');
        
        if (userId && email) {
          setUser({ userId, email, role });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [pathname]);

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    
    setUser(null);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    
    // Redirect to home page
    router.push('/');
    router.refresh(); // Refresh to update server components if any
  };

  const handleLogin = () => {
    router.push('/login');
    setIsMenuOpen(false);
  };

  const handleSignup = () => {
    router.push('/signup');
    setIsMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: "fa-home" },
    { path: "/about-us", label: "About", icon: "fa-info-circle" },
    { path: "/contact", label: "Contact", icon: "fa-envelope" },
  ];

  // Get user display name (first part of email or full email)
  const getUserDisplayName = () => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  };

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/80 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Left */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 flex-shrink-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-shield-alt text-white text-lg"></i>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Skill Scanner
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-1 mx-8 flex-1 justify-center">
              {navItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  href={path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive(path) 
                      ? "text-blue-600 bg-blue-50 border border-blue-100" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <i className={`fas ${icon} ${isActive(path) ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'} text-sm`}></i>
                  <span>{label}</span>
                  {isActive(path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Section - Right */}
            <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
              {isLoading ? (
                // Loading skeleton
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                // User is logged in
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-xs"></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {user.role || 'user'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">
                        {getUserDisplayName()}
                      </p>
                    </div>
                    <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 backdrop-blur-lg z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {user.role || 'user'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <Link
                        href={user.role === 'interviewer' ? '/dashboard/interviewer' : user.role === 'candidate' ? '/dashboard/candidate' : '/dashboard'}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="fas fa-tachometer-alt text-gray-400 text-sm"></i>
                        <span>Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <i className="fas fa-sign-out-alt text-red-400 text-sm"></i>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLogin}
                    className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Show user avatar on mobile when logged in */}
              {!isLoading && user && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-xs"></i>
                </div>
              )}
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                aria-label="Toggle menu"
              >
                <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 mt-2 mb-4 py-3">
              {/* Navigation Links */}
              <div className="space-y-1 px-3">
                {navItems.map(({ path, label, icon }) => (
                  <Link
                    key={path}
                    href={path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(path) 
                        ? "text-blue-600 bg-blue-50 border border-blue-100" 
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`fas ${icon} ${isActive(path) ? 'text-blue-500' : 'text-gray-400'} text-sm w-5`}></i>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Auth Section - Mobile */}
              <div className="border-t border-gray-200 mt-3 pt-3 px-3">
                {isLoading ? (
                  <div className="flex flex-col space-y-2">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {user.role || 'user'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link
                      href={user.role === 'interviewer' ? '/dashboard/interviewer' : user.role === 'candidate' ? '/dashboard/candidate' : '/dashboard'}
                      className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <i className="fas fa-tachometer-alt text-gray-400 text-sm w-5"></i>
                      <span>Dashboard</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <i className="fas fa-sign-out-alt text-red-400 text-sm w-5"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleLogin}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-300"
                    >
                      <i className="fas fa-sign-in-alt text-gray-400"></i>
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={handleSignup}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl py-3 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      Get Started Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Backdrop for mobile menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Backdrop for user dropdown */}
        {isUserMenuOpen && (
          <div 
            className="fixed inset-0 z-30"
            onClick={() => setIsUserMenuOpen(false)}
          />
        )}
      </nav>

      {/* Add padding to content below fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}