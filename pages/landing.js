// pages/landing.js
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate reading user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* ===== Section 1: Intro ===== */}
      <section className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight">
                Smart Plagiarism,
                <br />
                Detection for Live
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  Interviews
                </span>
              </h1>
              <p className="text-lg text-gray-800 mb-8 leading-relaxed">
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
                    className="border-2 border-black text-black px-8 py-4 rounded-lg font-semibold text-lg bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="border-2 border-black text-black px-8 py-4 rounded-lg font-semibold text-lg bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="border-2 border-black text-black px-8 py-4 rounded-lg font-semibold text-lg bg-transparent hover:bg-black hover:text-white transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-full max-w-lg">
                  <img
                    src="/assets/Interview.svg"
                    alt="Interview Illustration"
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
                {/* Floating circles */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-400/20 rounded-full animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 -left-8 w-12 h-12 bg-pink-400/20 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 2: Features ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-video text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Live Video Interviews
              </h3>
              <p className="text-gray-700">
                Conduct real-time video interviews with integrated plagiarism
                detection.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search-plus text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                AI Detection
              </h3>
              <p className="text-gray-700">
                Advanced AI algorithms to detect plagiarism in real-time.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl border border-gray-300 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-file-alt text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">
                Detailed Reports
              </h3>
              <p className="text-gray-700">
                Generate comprehensive reports for interview analysis.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Footer ===== */}
        <footer className="mt-20 bg-white border-t border-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} Skill Scanner. All rights reserved.</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
