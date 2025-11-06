'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth'
import { forgotPassword } from '@/lib/actions/auth'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await forgotPassword(data.email)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">INN</span>
              <span className="text-blue-500">FILL</span>
            </h1>
          </div>

          {/* Success Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3">Check your email</h2>
            <p className="text-gray-400 text-center mb-6">
              We've sent you a password reset link. Please check your email and follow the
              instructions to reset your password.
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg text-sm mb-6">
              <p className="font-semibold mb-1">⏰ Important:</p>
              <p>The reset link expires in 1 hour. Please reset your password soon.</p>
            </div>

            <Link href="/login" className="block">
              <button className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Back to login
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">INN</span>
            <span className="text-blue-500">FILL</span>
          </h1>
          <p className="text-gray-400">Reset your password</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Forgot password?</h2>
          <p className="text-gray-400 text-center mb-6 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-white/20"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>

            <Link href="/login" className="block">
              <button
                type="button"
                className="w-full py-3 px-4 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Back to login
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  )
}
