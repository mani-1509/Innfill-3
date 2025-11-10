'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser,
  FiBell,
  FiLock,
  FiCreditCard,
  FiShield,
  FiMail,
  FiEye,
  FiEyeOff,
  FiSave,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi'
import { updatePassword } from '@/lib/actions/auth'
import { updateBankDetails, getBankDetails } from '@/lib/actions/payments'

type TabType = 'account' | 'notifications' | 'security' | 'payment' | 'privacy'

interface NotificationSettings {
  order_updates: boolean
  payment_updates: boolean
  message_notifications: boolean
  rating_notifications: boolean
  email_notifications: boolean
  marketing_emails: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('account')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  
  // Account Settings
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  
  // Security Settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    order_updates: true,
    payment_updates: true,
    message_notifications: true,
    rating_notifications: true,
    email_notifications: true,
    marketing_emails: false,
  })
  
  // Payment Settings
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankIfsc, setBankIfsc] = useState('')
  const [bankAccountHolderName, setBankAccountHolderName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [panNumber, setPanNumber] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setDisplayName(profileData.display_name || '')
        setEmail(user.email || '')
        setBio(profileData.bio || '')
        
        // Set payment details
        setBankAccountNumber(profileData.bank_account_number || '')
        setBankIfsc(profileData.bank_ifsc || '')
        setBankAccountHolderName(profileData.bank_account_holder_name || '')
        setUpiId(profileData.upi_id || '')
        setPanNumber(profileData.pan_number || '')
      }
    }
    setLoading(false)
  }

  const handleUpdateAccount = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (updateError) {
      setError('Failed to update account settings')
    } else {
      setSuccess('Account settings updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
  }

  const handleUpdatePassword = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setSaving(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setSaving(false)
      return
    }

    const result = await updatePassword(newPassword)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
  }

  const handleUpdateNotifications = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    // TODO: Implement notification settings storage
    setSuccess('Notification settings updated!')
    setTimeout(() => setSuccess(''), 3000)
    setSaving(false)
  }

  const handleUpdatePayment = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    const result = await updateBankDetails({
      accountNumber: bankAccountNumber,
      ifscCode: bankIfsc,
      accountHolderName: bankAccountHolderName,
      upiId: upiId,
      panNumber: panNumber,
    })

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Payment details updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </motion.div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-3"
            >
              <FiCheck className="text-green-400 w-5 h-5" />
              <p className="text-green-400">{success}</p>
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3"
            >
              <FiAlertCircle className="text-red-400 w-5 h-5" />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'account', label: 'Account', icon: FiUser },
                  { id: 'notifications', label: 'Notifications', icon: FiBell },
                  { id: 'security', label: 'Security', icon: FiLock },
                  { id: 'payment', label: 'Payment', icon: FiCreditCard },
                  { id: 'privacy', label: 'Privacy', icon: FiShield },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Account Settings</h2>
                    <p className="text-gray-400 mb-6">Update your account information</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                      placeholder="Your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Email cannot be changed for security reasons
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile?.role || ''}
                      disabled
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed capitalize"
                    />
                  </div>

                  <button
                    onClick={handleUpdateAccount}
                    disabled={saving}
                    className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Notification Preferences</h2>
                    <p className="text-gray-400 mb-6">
                      Choose what notifications you want to receive
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'order_updates' as keyof NotificationSettings,
                        label: 'Order Updates',
                        description: 'Get notified about order status changes',
                      },
                      {
                        key: 'payment_updates' as keyof NotificationSettings,
                        label: 'Payment Updates',
                        description: 'Notifications about payments and payouts',
                      },
                      {
                        key: 'message_notifications' as keyof NotificationSettings,
                        label: 'Messages',
                        description: 'New message notifications',
                      },
                      {
                        key: 'rating_notifications' as keyof NotificationSettings,
                        label: 'Ratings & Reviews',
                        description: 'When someone rates or reviews your work',
                      },
                      {
                        key: 'email_notifications' as keyof NotificationSettings,
                        label: 'Email Notifications',
                        description: 'Receive important updates via email',
                      },
                      {
                        key: 'marketing_emails' as keyof NotificationSettings,
                        label: 'Marketing Emails',
                        description: 'Tips, offers, and platform updates',
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{setting.label}</h3>
                          <p className="text-sm text-gray-400">{setting.description}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [setting.key]: !notificationSettings[setting.key],
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            notificationSettings[setting.key]
                              ? 'bg-blue-500'
                              : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings[setting.key]
                                ? 'translate-x-6'
                                : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleUpdateNotifications}
                    disabled={saving}
                    className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Security Settings</h2>
                    <p className="text-gray-400 mb-6">Manage your password and security options</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? (
                            <FiEyeOff className="w-5 h-5" />
                          ) : (
                            <FiEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                    className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    <FiLock className="w-5 h-5" />
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>

                  <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                    <div className="flex gap-3">
                      <FiShield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-blue-400 font-medium mb-1">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-blue-300">
                          Add an extra layer of security to your account (Coming soon)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Payment Settings</h2>
                    <p className="text-gray-400 mb-6">
                      {profile?.role === 'freelancer'
                        ? 'Manage your payment and withdrawal methods'
                        : 'Manage your payment methods'}
                    </p>
                  </div>

                  {profile?.role === 'freelancer' && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Bank Account Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Account Holder Name
                            </label>
                            <input
                              type="text"
                              value={bankAccountHolderName}
                              onChange={(e) => setBankAccountHolderName(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                              placeholder="Full name as per bank account"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Account Number
                            </label>
                            <input
                              type="text"
                              value={bankAccountNumber}
                              onChange={(e) => setBankAccountNumber(e.target.value)}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                              placeholder="Bank account number"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              value={bankIfsc}
                              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                              placeholder="IFSC code (e.g., SBIN0001234)"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">UPI Details</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            UPI ID
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                            placeholder="yourname@paytm or mobile@ybl"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            For quick withdrawals via UPI
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Tax Information</h3>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            PAN Number
                          </label>
                          <input
                            type="text"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
                            placeholder="PAN number (required for withdrawals)"
                            maxLength={10}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Required for tax compliance and withdrawals
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleUpdatePayment}
                        disabled={saving}
                        className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        <FiSave className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Payment Details'}
                      </button>
                    </>
                  )}

                  {profile?.role === 'client' && (
                    <div className="text-center py-12">
                      <FiCreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg mb-2">
                        Payment methods are managed during checkout
                      </p>
                      <p className="text-sm text-gray-500">
                        Your payment information is securely handled by Razorpay
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Privacy Settings</h2>
                    <p className="text-gray-400 mb-6">Control your privacy and data preferences</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-2">Profile Visibility</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Your profile is visible to all users on the platform
                      </p>
                      <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Learn more about profile visibility
                      </button>
                    </div>

                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-2">Data Export</h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Download a copy of your data including orders, messages, and account information
                      </p>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                        Request Data Export
                      </button>
                    </div>

                    <div className="p-4 bg-red-500/20 rounded-lg border border-red-500">
                      <h3 className="text-red-400 font-medium mb-2">Delete Account</h3>
                      <p className="text-sm text-red-300 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
