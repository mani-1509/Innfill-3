'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/lib/actions/auth'

export default function OnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const validateUsername = (value: string) => {
    if (!value) {
      setUsernameError('Username is required')
      return false
    }
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return false
    }
    if (value.length > 30) {
      setUsernameError('Username must be less than 30 characters')
      return false
    }
    if (!/^[a-z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain lowercase letters, numbers, and underscores')
      return false
    }
    setUsernameError(null)
    return true
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    setUsername(value)
    if (value) validateUsername(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    if (!validateUsername(username)) {
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await completeOnboarding(selectedRole, username)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      // Success - will redirect via middleware or action
      router.push('/events')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">INN</span>
            <span className="text-blue-500">FILL</span>
          </h1>
          <p className="text-gray-400">Complete your profile to get started</p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to INNFILL!</h2>
            <p className="text-gray-400">Just a couple more steps to complete your profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What brings you to INNFILL?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('freelancer')}
                  disabled={isLoading}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'freelancer'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-2">💼</div>
                  <h3 className="font-semibold text-lg text-white">Offer Services</h3>
                  <p className="text-sm text-gray-400 mt-1">I'm a freelancer</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  disabled={isLoading}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'client'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold text-lg text-white">Hire Talent</h3>
                  <p className="text-sm text-gray-400 mt-1">I'm looking to hire</p>
                </button>
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Choose a Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="johndoe"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                autoComplete="off"
              />
              {usernameError && (
                <p className="text-sm text-red-400 mt-1">{usernameError}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                3-30 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedRole || !username || !!usernameError}
              className="w-full py-3 px-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
            >
              {isLoading ? 'Completing Setup...' : 'Continue to INNFILL'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
