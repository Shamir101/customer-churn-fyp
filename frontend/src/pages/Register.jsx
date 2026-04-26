import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/;

function getPasswordStrength(password) {
  if (!password) return { level: 'weak', percentage: 0, label: 'Too weak' };
  if (password.length < 8) return { level: 'weak', percentage: 33, label: 'Too weak' };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { level: 'medium', percentage: 66, label: 'Medium' };
  }
  return { level: 'strong', percentage: 100, label: 'Strong' };
}

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: 'weak', percentage: 0 });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time password strength calculation
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars with 1 number and 1 letter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    return newErrors;
  };

  const isFormValid =
    formData.fullName &&
    formData.email &&
    PASSWORD_REGEX.test(formData.password) &&
    formData.password === formData.confirmPassword &&
    agreedToTerms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      toast.success('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      if (error.response?.data?.message?.includes('email')) {
        setErrors({ email: 'An account with this email already exists' });
      } else {
        setErrors({ form: message });
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const strengthColor =
    passwordStrength.level === 'weak'
      ? 'from-red-500 to-red-600'
      : passwordStrength.level === 'medium'
      ? 'from-orange-500 to-orange-600'
      : 'from-green-500 to-green-600';

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
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-gray-400">Join ChurnSense to get started</p>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.form}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full bg-[#0A1628] border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.fullName ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full bg-[#0A1628] border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-[#0A1628] border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak'
                        ? 'text-red-400'
                        : passwordStrength.level === 'medium'
                        ? 'text-orange-400'
                        : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${strengthColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${passwordStrength.percentage}%` }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-[#0A1628] border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors({ ...errors, terms: '' });
                  }
                }}
                className="h-4 w-4 mt-1 bg-[#0A1628] border-gray-700 rounded cursor-pointer accent-blue-600 flex-shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
                I agree to the <span className="text-blue-400">Terms of Service</span> and{' '}
                <span className="text-blue-400">Privacy Policy</span>
              </label>
            </div>
            {errors.terms && <p className="text-red-400 text-xs">{errors.terms}</p>}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:-translate-y-0 mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#162032] text-gray-500">or</span>
            </div>
          </div>

          {/* Footer Link */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
