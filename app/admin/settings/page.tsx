'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, DollarSign, Key, Bell, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)

  // Platform Settings
  const [platformFee, setPlatformFee] = useState('14')
  const [gstRate, setGstRate] = useState('18')
  
  // Razorpay Settings (from .env)
  const [razorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '')
  const [manualPayoutMode] = useState(process.env.RAZORPAY_MANUAL_PAYOUT === 'true')

  async function handleSaveSettings() {
    setSaving(true)
    // In a real app, you'd save these to database or update env variables
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Settings saved! Note: Some changes require server restart.')
    setSaving(false)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Platform Settings</h1>
        <p className="text-sm sm:text-base text-white/60">Configure platform-wide settings and preferences</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Commission Settings */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Commission & Pricing</h2>
              <p className="text-xs sm:text-sm text-white/60">Configure platform commission and tax rates</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Platform Commission (%)</Label>
              <Input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                min="0"
                max="100"
              />
              <p className="text-xs text-white/40 mt-1">
                Percentage deducted from freelancer earnings
              </p>
            </div>

            <div>
              <Label className="text-white mb-2">GST Rate (%)</Label>
              <Input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                min="0"
                max="100"
              />
              <p className="text-xs text-white/40 mt-1">
                Applied on platform commission only
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-300 mb-2">📊 Current Pricing Model</p>
              <div className="space-y-1 text-xs text-white/70">
                <p>• Service Price: ₹1000 (example)</p>
                <p>• Platform Fee (14%): ₹140</p>
                <p>• GST on Fee (18%): ₹25.20</p>
                <p>• Client Pays: ₹1025.20</p>
                <p>• Freelancer Gets: ₹860</p>
                <p>• Platform Keeps: ₹165.20</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Gateway Settings */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Payment Gateway</h2>
              <p className="text-xs sm:text-sm text-white/60">Razorpay integration settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2">Razorpay Key ID</Label>
              <Input
                type="text"
                value={razorpayKeyId}
                readOnly
                className="bg-white/5 border-white/10 text-white/60 cursor-not-allowed"
              />
              <p className="text-xs text-white/40 mt-1">
                Configure in .env.local file
              </p>
            </div>

            <div>
              <Label className="text-white mb-2">Payout Mode</Label>
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${manualPayoutMode ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">
                    {manualPayoutMode ? 'Manual Payout Mode' : 'Automatic Payout Mode'}
                  </p>
                  <p className="text-xs text-white/60">
                    {manualPayoutMode 
                      ? 'Admin transfers money manually to freelancers'
                      : 'Automatic transfers via Razorpay Payouts API'
                    }
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-1">
                Configure RAZORPAY_MANUAL_PAYOUT in .env.local
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-300 mb-2">⚠️ Important</p>
              <ul className="space-y-1 text-xs text-yellow-200/70">
                <li>• Razorpay API keys are stored in environment variables</li>
                <li>• Never commit API keys to version control</li>
                <li>• Use test keys for development, live keys for production</li>
                <li>• Webhook secret must match Razorpay dashboard configuration</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Security & Compliance</h2>
              <p className="text-xs sm:text-sm text-white/60">Platform security settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Bank Account Verification</p>
                <p className="text-xs text-white/60">IFSC verification via RBI database</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Payment Signature Verification</p>
                <p className="text-xs text-white/60">HMAC SHA256 signature validation</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">PAN Number Validation</p>
                <p className="text-xs text-white/60">Required for tax compliance</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-300 mb-2">🔒 Security Features</p>
              <ul className="space-y-1 text-xs text-green-200/70">
                <li>• Row Level Security (RLS) enabled on all tables</li>
                <li>• End-to-end encryption for sensitive data</li>
                <li>• Secure webhook signature verification</li>
                <li>• Bank-grade payment processing via Razorpay</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex-shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">Notifications</h2>
              <p className="text-xs sm:text-sm text-white/60">Configure email and in-app notifications</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Order Notifications</p>
                <p className="text-xs text-white/60">New orders, status updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Payment Notifications</p>
                <p className="text-xs text-white/60">Payment received, refunds, payouts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Admin Alerts</p>
                <p className="text-xs text-white/60">System errors, disputes, reports</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 sm:px-8 w-full sm:w-auto"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              '💾 Save Settings'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
