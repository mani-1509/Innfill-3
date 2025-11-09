'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi'
import { BankDetailsForm } from '@/components/forms/bank-details-form'
import { getBankDetails } from '@/lib/actions/payments'

interface FinanceSectionProps {
  userId: string
}

export function FinanceSection({ userId }: FinanceSectionProps) {
  const [bankDetails, setBankDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBankForm, setShowBankForm] = useState(false)

  useEffect(() => {
    fetchBankDetails()
  }, [userId])

  const fetchBankDetails = async () => {
    setLoading(true)

    // Fetch bank details
    const bankResult = await getBankDetails()
    if (!bankResult.error && bankResult.data) {
      setBankDetails(bankResult.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Bank Details Skeleton */}
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-3/4 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white text-3xl font-bold">BANK DETAILS</h2>
      </div>

      {/* Bank Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-white/5 rounded-lg border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FiCreditCard className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Bank Account Information</h3>
          </div>
          {bankDetails?.accountNumber && !showBankForm && (
            <button
              onClick={() => setShowBankForm(!showBankForm)}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Edit Details
            </button>
          )}
        </div>

        {showBankForm || !bankDetails?.accountNumber ? (
          <div>
            <BankDetailsForm
              initialData={bankDetails}
              onSuccess={() => {
                setShowBankForm(false)
                fetchBankDetails()
              }}
            />
            {bankDetails?.accountNumber && (
              <button
                onClick={() => setShowBankForm(false)}
                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bank Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Account Holder</p>
                <p className="text-white font-medium">{bankDetails.accountHolderName}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400 text-xs mb-1">Account Number</p>
                <p className="text-white font-medium">
                  •••• •••• {bankDetails.accountNumber?.slice(-4)}
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400 text-xs mb-1">IFSC Code</p>
                <p className="text-white font-medium">{bankDetails.ifscCode}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-400 text-xs mb-1">PAN Number</p>
                <p className="text-white font-medium">
                  {bankDetails.panNumber ? `${bankDetails.panNumber.slice(0, 4)}••••${bankDetails.panNumber.slice(-1)}` : 'Not provided'}
                </p>
              </div>
            </div>

            {/* KYC Status Card */}
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-lg border border-blue-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {bankDetails.kycVerified ? (
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <FiCheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-500/20 rounded-full">
                      <FiAlertCircle className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-semibold">KYC Verification Status</h4>
                    <p className={`text-sm ${bankDetails.kycVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {bankDetails.kycVerified ? 'Verified and Active' : 'Pending Verification'}
                    </p>
                  </div>
                </div>
              </div>
              
              {!bankDetails.kycVerified && (
                <div className="mt-4 p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏳</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-yellow-300">Under Review</p>
                      <p className="text-xs text-yellow-200/70 mt-1">
                        Your bank details are being verified. This usually takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-11 text-xs text-yellow-200/60">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                      Ensure all details are accurate
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                      PAN and bank account must be linked
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                      Account holder name must match PAN
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Razorpay Account Status */}
            {bankDetails.linkedAccountId && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-sm text-gray-400">Razorpay Account</p>
                </div>
                <p className="text-xs text-gray-500 font-mono">
                  {bankDetails.linkedAccountId}
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-blue-500/10 rounded-lg border border-blue-500/20"
      >
        <div className="space-y-3">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-blue-400" />
            About Bank Details
          </h4>
          <p className="text-gray-300 text-sm">
            Your bank details are used exclusively for transferring your earnings after order completion.
          </p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>All data is encrypted and stored securely</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Automatic T+2 settlements (2 business days)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>No minimum withdrawal amount required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>Complies with RBI and IT Act guidelines</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
