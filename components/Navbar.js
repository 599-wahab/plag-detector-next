// components/Navbar.js
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Example logout logic
    router.push("/");
  };

  const isActive = (path) => router.pathname === path;

  return (
    <>
      {/* Inline CSS for rainbow animation */}
      <style>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .rainbow-border {
          background: linear-gradient(
            270deg,
            #ff0000,
            #ff7300,
            #fffb00,
            #48ff00,
            #00ffd5,
            #002bff,
            #7a00ff,
            #ff00ab,
            #ff0000
          );
          background-size: 200% 200%;
          animation: rainbow 5s linear infinite;
        }
        .active-link {
          font-weight: 600;
          border-color: #000;
        }
      `}</style>

      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-black">Skill Scanner</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {[
                { path: "/", label: "Home" },
                { path: "/about-us", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  href={path}
                  className={`relative px-4 py-2 rounded-full text-black transition-all duration-300 group border-2 border-transparent ${
                    isActive(path) ? "active-link" : ""
                  }`}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
                    {label}
                  </span>

                  {/* Rainbow hover ring */}
                  <span className="absolute -inset-1 rounded-full p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="absolute inset-0 rounded-full rainbow-border"></span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-black hover:text-blue-600 transition-colors"
              >
                <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/10 backdrop-blur-md rounded-lg mt-2">
                {[
                  { path: "/", label: "Home" },
                  { path: "/about-us", label: "About" },
                  { path: "/contact", label: "Contact" },
                ].map(({ path, label }) => (
                  <Link
                    key={path}
                    href={path}
                    className={`block px-3 py-2 text-black hover:text-blue-600 rounded ${
                      isActive(path) ? "font-semibold text-blue-600" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-500 hover:text-red-700 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
