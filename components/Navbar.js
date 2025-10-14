// components/Navbar.js
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaChevronDown,
  FaHome,
  FaInfoCircle,
  FaEnvelope,
  FaSignInAlt,
} from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userId = localStorage.getItem("userId");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");

        if (userId && email) {
          setUser({ userId, email, role });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    setUser(null);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);

    router.push("/");
  };

  const handleLogin = () => {
    router.push("/login");
    setIsMenuOpen(false);
  };

  const handleSignup = () => {
    router.push("/signup");
    setIsMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: <FaHome className="text-sm" /> },
    { path: "/about-us", label: "About", icon: <FaInfoCircle className="text-sm" /> },
    { path: "/contact", label: "Contact", icon: <FaEnvelope className="text-sm" /> },
  ];

  const getUserDisplayName = () => {
    if (!user?.email) return "User";
    return user.email.split("@")[0];
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 flex-shrink-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaUser className="text-white text-lg" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Skill Scanner
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 mx-8 flex-1 justify-center">
              {navItems.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  href={path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(path)
                      ? "text-blue-600 bg-blue-50 border border-blue-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={`${isActive(path) ? "text-blue-500" : "text-gray-400"}`}>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center space-x-3 relative">
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen((s) => !s)}
                    className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl px-4 py-2 hover:shadow-md transition-all duration-300"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-xs" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.role || "user"}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{getUserDisplayName()}</p>
                    </div>
                    <FaChevronDown className={`text-gray-400 text-sm transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* User Dropdown (desktop) */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[60]">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 capitalize">{user.role || "user"}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        href={user.role === "interviewer" ? "/dashboard/interviewer" : user.role === "candidate" ? "/dashboard/candidate" : "/dashboard"}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaHome className="text-gray-400 text-sm" />
                        <span>Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FaSignInAlt className="text-red-400 text-sm" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button onClick={handleLogin} className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                    Sign In
                  </button>
                  <button onClick={handleSignup} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg">
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center space-x-3">
              {/* Mobile avatar: make it clickable to open user menu (if logged in) */}
              {!isLoading && user && (
                <button
                  onClick={() => setIsUserMenuOpen((s) => !s)}
                  className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  aria-expanded={isUserMenuOpen}
                  aria-label="Open user menu"
                >
                  <FaUser className="text-white text-xs" />
                </button>
              )}

              <button onClick={() => setIsMenuOpen((s) => !s)} className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" aria-expanded={isMenuOpen} aria-label="Toggle menu">
                {isMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-16 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50">
              {/* Navigation Links */}
              <div className="space-y-1 px-3">
                {navItems.map(({ path, label, icon }) => (
                  <Link
                    key={path}
                    href={path}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium ${isActive(path) ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className={isActive(path) ? "text-blue-500" : "text-gray-400"}>{icon}</span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              {/* Auth Section - Mobile */}
              <div className="border-t border-gray-200 mt-3 pt-3 px-3">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 capitalize">{user.role || "user"}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <Link
                      href={user.role === "interviewer" ? "/dashboard/interviewer" : user.role === "candidate" ? "/dashboard/candidate" : "/dashboard"}
                      className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaHome className="text-gray-400 text-sm w-5" />
                      <span>Dashboard</span>
                    </Link>

                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50">
                      <FaSignInAlt className="text-red-400 text-sm w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button onClick={handleLogin} className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                      <FaSignInAlt className="text-gray-400" />
                      <span>Sign In</span>
                    </button>
                    <button onClick={handleSignup} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-xl py-3">
                      Get Started Free
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backdrop for mobile menu */}
          {isMenuOpen && <div className="lg:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setIsMenuOpen(false)} />}

          {/* Backdrop for user dropdown */}
          {isUserMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setIsUserMenuOpen(false)} />}
        </div>

        {/* Desktop/User dropdown for mobile toggle needs own container so it's not clipped */}
        {/* Rendered outside nav inner container to ensure z-index correctness */}
        {isUserMenuOpen && user && (
          <div className="fixed top-20 right-4 z-50">
            <div className="w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 capitalize">{user.role || "user"}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              <Link
                href={user.role === "interviewer" ? "/dashboard/interviewer" : user.role === "candidate" ? "/dashboard/candidate" : "/dashboard"}
                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <FaHome className="text-gray-400 text-sm" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <FaSignInAlt className="text-red-400 text-sm" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Add padding to content below fixed navbar */}
      <div className="h-16" />
    </>
  );
}
