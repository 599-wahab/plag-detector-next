// pages/landing.js
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    if (userId && role) {
      setUser({ role });
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      {/* ===== Section 1: Intro ===== */}
      <section className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Smart Plagiarism,
                <br />
                Detection for Live
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Interviews
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl">
                Ensure originality and integrity during interviews with our
                AI-powered plagiarism detection system.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Link
                    href={
                      user.role === "interviewer"
                        ? "/dashboard/interviewer"
                        : "/dashboard/candidate"
                    }
                    className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-lg bg-transparent hover:bg-white hover:text-purple-600 transition-all duration-300 text-center"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-lg bg-transparent hover:bg-white hover:text-purple-600 transition-all duration-300 text-center"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-lg bg-white text-purple-600 hover:bg-transparent hover:text-white transition-all duration-300 text-center"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
              <div className="relative">
                <div className="w-full max-w-md lg:max-w-lg">
                  <img
                    src="/assets/Interview.svg"
                    alt="Interview Illustration"
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
                {/* Floating circles */}
                <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-yellow-300/30 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-pink-300/30 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 -left-6 w-10 h-10 sm:w-12 sm:h-12 bg-blue-300/30 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 2: Features ===== */}
      <section className="py-16 sm:py-20 relative z-10 bg-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-video text-white text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Live Video Interviews
              </h3>
              <p className="text-gray-200 text-sm sm:text-base">
                Conduct real-time video interviews with integrated plagiarism detection.
              </p>
            </div>

            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search-plus text-white text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI Detection
              </h3>
              <p className="text-gray-200 text-sm sm:text-base">
                Advanced AI algorithms to detect plagiarism in real-time.
              </p>
            </div>

            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-alt text-white text-xl sm:text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Detailed Reports
              </h3>
              <p className="text-gray-200 text-sm sm:text-base">
                Generate comprehensive reports for interview analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="bg-black/30 backdrop-blur-md border-t border-white/20 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Skill Scanner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}