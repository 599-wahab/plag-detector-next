"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";


export default function AboutUs() {
  return (
    <div className="min-h-screen  bg-transparent text-gray-900 pt-28">
        {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>
      {/* Navbar */}
          <Navbar />
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center lg:text-left mb-20">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          About Skill Scanner
        </h1>
        <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto lg:mx-0 leading-relaxed">
          Skill Scanner is an AI-powered platform designed to ensure integrity and originality in live interviews. 
          Our platform helps interviewers monitor candidates, detect plagiarism, and generate detailed reports for transparency.
        </p>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto mb-20">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12 text-gray-900">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "fas fa-video",
              title: "Live Interviews",
              description:
                "Conduct real-time video interviews while monitoring candidates for plagiarism.",
            },
            {
              icon: "fas fa-search-plus",
              title: "AI Detection",
              description:
                "Advanced AI algorithms ensure authenticity and detect plagiarism in real-time.",
            },
            {
              icon: "fas fa-file-alt",
              title: "Detailed Reports",
              description:
                "Generate comprehensive reports for each interview providing insights and transparency.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white border border-gray-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <i className={`${item.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold mb-3 text-center">
                {item.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting Started Section */}
      <section className="max-w-4xl mx-auto mb-20">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-12 text-gray-900">
          Getting Started
        </h2>
        <ol className="space-y-8 text-gray-700 text-lg md:text-xl leading-relaxed list-decimal list-inside">
          <li>
            <span className="font-semibold">Sign Up:</span> Create an account as
            an interviewer or candidate.
          </li>
          <li>
            <span className="font-semibold">Schedule / Join Interviews:</span>{" "}
            Interviewers can schedule interviews; candidates can join securely.
          </li>
          <li>
            <span className="font-semibold">Live Monitoring:</span> AI monitors
            live interviews to detect plagiarism.
          </li>
          <li>
            <span className="font-semibold">Generate Reports:</span>{" "}
            Comprehensive reports for record-keeping and transparency.
          </li>
        </ol>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 md:px-0">
          <span className="font-bold text-2xl mb-6 md:mb-0">Skill Scanner</span>
          <div className="flex space-x-6 mb-6 md:mb-0">
            <Link
              href="/"
              className="hover:underline hover:text-gray-200 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="hover:underline hover:text-gray-200 transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              className="hover:underline hover:text-gray-200 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="hover:underline hover:text-gray-200 transition-colors"
            >
              Contact
            </Link>
          </div>
          <span className="text-gray-200 text-sm md:text-base">
            &copy; {new Date().getFullYear()} Skill Scanner. All rights
            reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
