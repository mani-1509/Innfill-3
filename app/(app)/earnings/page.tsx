'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FiDollarSign, 
  FiClock, 
  FiTrendingUp, 
  FiCalendar,
  FiArrowRight,
  FiArrowLeft,
} from 'react-icons/fi'
import {
  getEarningsSummary,
  getTransactionHistory,
} from '@/lib/actions/payments'
import { format } from 'date-fns'

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [transactionsPage, setTransactionsPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    fetchEarningsData()
  }, [])

  const fetchEarningsData = async () => {
    setLoading(true)

    // Fetch earnings summary
    const earningsResult = await getEarningsSummary()
    if (!earningsResult.error && earningsResult.data) {
      setEarnings(earningsResult.data)
    }

    // Fetch transaction history
    const transactionsResult = await getTransactionHistory(20, 0)
    if (!transactionsResult.error && transactionsResult.data) {
      setTransactions(transactionsResult.data)
    }

    setLoading(false)
  }

  const loadMoreTransactions = async () => {
    setLoadingMore(true)
    const nextPage = transactionsPage + 1
    const result = await getTransactionHistory(20, nextPage * 20)
    
    if (!result.error && result.data) {
      setTransactions([...transactions, ...result.data])
      setTransactionsPage(nextPage)
    }
    
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Earnings Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 bg-white/5 rounded-lg border border-white/10 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {/* Transactions Skeleton */}
          <div className="p-6 bg-white/5 rounded-lg border border-white/10 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 w-full bg-white/10 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/dashboard/freelancer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Earnings
          </h1>
          <p className="text-gray-400">
            Track your earnings, transactions, and financial overview
          </p>
        </motion.div>

        {/* Earnings Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Pending Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FiClock className="w-6 h-6 text-yellow-400" />
              <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Pending Balance</p>
            <p className="text-white text-2xl font-bold">
              ₹{earnings?.pendingBalance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">In active orders</p>
          </motion.div>

          {/* Available Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-500/20 hover:border-green-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FiDollarSign className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                Available
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <p className="text-white text-2xl font-bold">
              ₹{earnings?.availableBalance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">Ready for settlement</p>
          </motion.div>

          {/* Total Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FiTrendingUp className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
            <p className="text-white text-2xl font-bold">
              ₹{earnings?.totalEarnings?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </motion.div>

          {/* This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <FiCalendar className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                This Month
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">This Month</p>
            <p className="text-white text-2xl font-bold">
              ₹{earnings?.thisMonthEarnings?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-gray-500 mt-2">{format(new Date(), 'MMMM yyyy')}</p>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiDollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Transaction History</h3>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                <FiDollarSign className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No transactions yet</p>
              <p className="text-gray-500 text-sm">
                Your earnings from completed orders will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: any) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-500/20'
                            : transaction.status === 'failed'
                            ? 'bg-red-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          <FiDollarSign className={`w-4 h-4 ${
                            transaction.status === 'completed'
                              ? 'text-green-400'
                              : transaction.status === 'failed'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">
                            {transaction.order?.service_plan?.title || 'Service Order'}
                          </h4>
                          <p className="text-sm text-gray-400">
                            Order Payment
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 ml-11">
                        <span>{format(new Date(transaction.created_at), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span className="capitalize">{transaction.status}</span>
                        {transaction.transferred_to_freelancer && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">Transferred</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">
                        ₹{transaction.freelancer_amount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Platform: ₹{transaction.platform_fee?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {transactions.length >= 20 && (
                <button
                  onClick={loadMoreTransactions}
                  disabled={loadingMore}
                  className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 border border-white/10 rounded-lg hover:border-white/20"
                >
                  {loadingMore ? 'Loading...' : 'Load More Transactions'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Settlement Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-6 bg-blue-500/10 rounded-lg border border-blue-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-full flex-shrink-0">
              <FiArrowRight className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold mb-2">Automatic Settlements (T+2)</h4>
              <p className="text-gray-300 text-sm mb-3">
                Your earnings are automatically transferred to your bank account within 2 business days after order completion.
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>No minimum withdrawal amount required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Free and automatic transfers to your bank</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Track all transactions in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Secure and compliant with RBI guidelines</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
