import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('If an account exists, a reset link has been sent');
    } catch (err) {
      // Always show the same message for security
      setSubmitted(true);
      toast.success('If an account exists, a reset link has been sent');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center py-12 px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <div className="bg-[#162032] rounded-2xl border border-gray-800 p-8 shadow-2xl backdrop-blur text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-cyan-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
            <p className="text-gray-400 mb-8">
              If an account exists with the email <span className="font-medium text-white">{email}</span>, we've sent
              a password reset link.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                Back to Login
              </button>
              <button
                onClick={() => window.open('https://mail.google.com', '_blank')}
                className="w-full py-3 px-4 bg-[#0A1628] border border-gray-700 hover:border-gray-600 text-white font-medium rounded-lg transition-all"
              >
                Open Gmail
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-6">Didn't receive the email? Check your spam folder.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center py-12 px-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        <div className="bg-[#162032] rounded-2xl border border-gray-800 p-8 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
            <p className="text-gray-400">Enter your email to receive a reset link</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-[#0A1628] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:-translate-y-0 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mt-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
