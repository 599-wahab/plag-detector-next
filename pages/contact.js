"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // In production: send this data to your backend (API route, form handler, etc.)
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    
    <div className="min-h-screen bg-transparent text-gray-900 pt-28">
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
          Contact Us
        </h1>
        <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto lg:mx-0 leading-relaxed">
          Have questions or need assistance? Reach out to us and our team will
          get back to you promptly.
        </p>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-6xl mx-auto mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-envelope text-white text-2xl"></i>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold mb-2">Email</h3>
          <p className="text-gray-600">support@skillscanner.com</p>
        </div>

        <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-phone text-white text-2xl"></i>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold mb-2">Phone</h3>
          <p className="text-gray-600">+1 (123) 456-7890</p>
        </div>

        <div className="p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-white border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-map-marker-alt text-white text-2xl"></i>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold mb-2">Address</h3>
          <p className="text-gray-600">
            123 Skill Scanner Blvd, Tech City, USA
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-4xl mx-auto mb-20 bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <h2 className="text-4xl md:text-5xl font-semibold text-center mb-10 text-gray-900">
          Send Us a Message
        </h2>
        {submitted && (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 text-center">
            Your message has been sent successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                errors.name ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-2 text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                errors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-2 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              rows="6"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                errors.message ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="mt-2 text-red-500 text-sm">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Send Message
          </button>
        </form>
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
