import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {/* 403 Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-white mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Access Forbidden</h2>
          <p className="text-gray-400 mb-8">
            You don't have permission to access this page. Please check your account permissions or contact support.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <button className="w-full sm:w-auto px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-all font-semibold">
                Go to Events
              </button>
            </Link>
            <Link href="/">
              <button className="w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">
                Go Home
              </button>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-gray-500 text-sm">
          If you believe this is an error, please{' '}
          <Link href="/settings" className="text-blue-400 hover:text-blue-300 underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
