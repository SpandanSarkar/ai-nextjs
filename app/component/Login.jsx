"use client"
import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(null)

  useEffect(() => {
    const lockoutData = localStorage.getItem('loginLockout')
    if (lockoutData) {
      const { attempts, timestamp } = JSON.parse(lockoutData)
      const lockoutDuration = 15 * 60 * 1000
      if (Date.now() - timestamp < lockoutDuration) {
        setIsLocked(true)
        setFailedAttempts(attempts)
        setLockoutTime(new Date(timestamp + lockoutDuration))
      } else {
        localStorage.removeItem('loginLockout')
      }
    }
  }, [])

  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        if (Date.now() >= lockoutTime.getTime()) {
          setIsLocked(false)
          setFailedAttempts(0)
          setLockoutTime(null)
          localStorage.removeItem('loginLockout')
          clearInterval(timer)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTime])

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleFailedAttempt = () => {
    const newAttempts = failedAttempts + 1
    setFailedAttempts(newAttempts)
    if (newAttempts >= 5) {
      setIsLocked(true)
      const lockoutTimestamp = Date.now()
      setLockoutTime(new Date(lockoutTimestamp + 15 * 60 * 1000))
      localStorage.setItem('loginLockout', JSON.stringify({
        attempts: newAttempts,
        timestamp: lockoutTimestamp
      }))
      setErrors({ general: 'Account locked due to too many failed attempts. Please try again in 15 minutes.' })
    } else {
      setErrors({ general: `Invalid credentials. ${5 - newAttempts} attempts remaining.` })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) {
      setErrors({ general: 'Account is locked. Please try again later.' })
      return
    }
    if (!validateForm()) return
    setIsLoading(true)
    setErrors({})
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setFailedAttempts(0)
        localStorage.removeItem('loginLockout')
        if (formData.rememberMe) {
          localStorage.setItem('authToken', data.token)
        } else {
          sessionStorage.setItem('authToken', data.token)
        }
        window.location.href = '/dashboard'
      } else {
        if (response.status === 401) {
          handleFailedAttempt()
        } else if (response.status >= 500) {
          setErrors({ general: 'System error, please try again later.' })
        } else {
          setErrors({ general: data.message || 'Login failed' })
        }
      }
    } catch (error) {
      setErrors({ general: 'System error, please try again later.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return ''
    const remaining = Math.ceil((lockoutTime.getTime() - Date.now()) / 1000 / 60)
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-gradient-to-br from-blue-900 to-blue-500 p-10 rounded-l-lg">
        <div>
          <div className="flex items-center mb-10">
            <div className="bg-white bg-opacity-10 rounded-full p-2 mr-3">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M12 8v4l3 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-white text-lg font-semibold tracking-wide">ERA Infotech</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Secure Banking for a Digital World</h2>
          <p className="text-blue-100 mb-8 max-w-md">Experience banking that's safe, simple, and designed for you.</p>
          <div className="flex gap-3">
            <div className="flex items-center bg-white bg-opacity-10 rounded px-3 py-2 text-white text-sm">
              <svg className="mr-2" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="2" fill="#fff" fillOpacity="0.2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Bank-grade Security
            </div>
            <div className="flex items-center bg-white bg-opacity-10 rounded px-3 py-2 text-white text-sm">
              <svg className="mr-2" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.2"/><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              24/7 Access
            </div>
            <div className="flex items-center bg-white bg-opacity-10 rounded px-3 py-2 text-white text-sm">
              <svg className="mr-2" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" fill="#fff" fillOpacity="0.2"/><path d="M11 18h2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Mobile Banking
            </div>
          </div>
        </div>
        <div className="text-blue-200 text-xs">&copy; 2023 SecureBank. All rights reserved.</div>
      </div>
      {/* Right Panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white rounded-r-lg shadow-lg">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-6">Please enter your details to access your account</p>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-2">
                <div className="flex">
                  <div className="ml-2">
                    <h3 className="text-sm font-medium text-red-800">
                      {errors.general}
                    </h3>
                    {isLocked && (
                      <p className="mt-1 text-xs text-red-600">
                        Time remaining: {getRemainingLockoutTime()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLocked}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLocked}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300'
                  } ${isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
            {/* Remember Me & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  disabled={isLocked}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>
            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || isLocked
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                <>
                  Log in securely
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </>
              )}
            </button>
            {/* Help */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Need help? <a href="#" className="text-blue-600 hover:underline">Contact support</a></span>
            </div>
            {/* Security Notice */}
            <div className="flex justify-center mt-4">
              <span className="text-gray-400 text-xs">Protected by advanced encryption and multi-factor authentication</span>
            </div>
            <div className="flex justify-center gap-2 mt-2 text-gray-300">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#60a5fa" fillOpacity="0.3"/></svg>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="7" rx="2" fill="#60a5fa" fillOpacity="0.3"/></svg>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2" fill="#60a5fa" fillOpacity="0.3"/></svg>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login