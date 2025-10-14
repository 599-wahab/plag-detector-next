"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    router.push("/");
  };

  const isActive = (path) => router.pathname === path;

  return (
    <>
      <nav className="bg-white/20 backdrop-blur-lg border-b border-white/30 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Skill Scanner
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {[
                { path: "/", label: "Home" },
                { path: "/about-us", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  href={path}
                  className={`relative px-4 py-2 rounded-full text-black transition-all duration-300 border-2 border-transparent hover:border-black ${
                    isActive(path) ? "font-semibold border-black" : ""
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-black focus:outline-none"
              >
                <i
                  className={`fas ${
                    isMenuOpen ? "fa-times" : "fa-bars"
                  } text-xl`}
                ></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-2 bg-white/80 backdrop-blur-md rounded-lg shadow-lg">
              {[
                { path: "/", label: "Home" },
                { path: "/about-us", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  href={path}
                  className={`block px-4 py-2 text-black hover:text-blue-600 ${
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
                className="block w-full text-left px-4 py-2 text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
