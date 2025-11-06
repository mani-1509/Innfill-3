'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { signup } from '@/lib/actions/auth'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'client' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const selectRole = (role: 'freelancer' | 'client') => {
    setSelectedRole(role)
    setValue('role', role)
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await signup(
      data.email,
      data.password,
      data.username,
      data.displayName,
      data.role
    )

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
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
          <p className="text-gray-400">Join thousands of freelancers and clients</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">I want to</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => selectRole('freelancer')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'freelancer'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-4xl mb-2">💼</div>
                  <h3 className="font-semibold text-lg text-white">Offer Services</h3>
                  <p className="text-sm text-gray-400 mt-1">I'm a freelancer</p>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('client')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedRole === 'client'
                      ? 'border-white bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-4xl mb-2">🎯</div>
                  <h3 className="font-semibold text-lg text-white">Hire Talent</h3>
                  <p className="text-sm text-gray-400 mt-1">I'm looking to hire</p>
                </button>
              </div>
              {errors.role && (
                <p className="text-sm text-red-400 mt-1">{errors.role.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  id="displayName"
                  placeholder="John Doe"
                  {...register('displayName')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                />
                {errors.displayName && (
                  <p className="text-sm text-red-400 mt-1">{errors.displayName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  placeholder="johndoe"
                  {...register('username')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                  onChange={(e) => {
                    e.target.value = e.target.value.toLowerCase()
                  }}
                />
                {errors.username && (
                  <p className="text-sm text-red-400 mt-1">{errors.username.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  3-30 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              />
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:text-gray-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
