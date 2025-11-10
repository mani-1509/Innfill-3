'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { confirmManualTransfer } from '@/lib/actions/payments'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface PendingPayout {
  id: string
  amount: number
  razorpay_transfer_id: string | null
  transfer_pending_manual: boolean
  order: {
    id: string
    price: number
    plan_tier: string
    created_at: string
    service_plan: {
      title: string
    }
    freelancer: {
      username: string
      display_name: string
      bank_account_holder_name: string | null
      bank_account_number: string | null
      bank_ifsc: string | null
      upi_id: string | null
    }
  }
}

export default function ManualPayoutsPage() {
  const [pending, setPending] = useState<PendingPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [transactionIds, setTransactionIds] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPendingPayouts()
  }, [])

  async function loadPendingPayouts() {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        razorpay_transfer_id,
        transfer_pending_manual,
        order:orders!inner(
          id,
          price,
          plan_tier,
          created_at,
          service_plan:service_plans(
            title
          ),
          freelancer:profiles!orders_freelancer_id_fkey(
            username,
            display_name,
            bank_account_holder_name,
            bank_account_number,
            bank_ifsc,
            upi_id
          )
        )
      `)
      .eq('transfer_pending_manual', true)
      .eq('transferred_to_freelancer', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading pending payouts:', error)
    } else {
      setPending(data as any || [])
    }
    setLoading(false)
  }

  async function handleMarkTransferred(orderId: string, transactionId: string) {
    setProcessing(orderId)
    
    const result = await confirmManualTransfer(orderId, transactionId || undefined)
    
    if (result.success) {
      // Remove from list
      setPending(prev => prev.filter(p => p.order.id !== orderId))
      setTransactionIds(prev => {
        const newIds = { ...prev }
        delete newIds[orderId]
        return newIds
      })
      alert('✅ Transfer confirmed successfully!')
    } else {
      alert('❌ Error: ' + result.error)
    }
    
    setProcessing(null)
  }

  function calculateFreelancerAmount(totalAmount: number): number {
    // Freelancer gets 86% of the service amount
    // Client paid: service + (service * 0.14 * 0.18)
    // We need to reverse this to get original service amount
    const serviceAmount = totalAmount / 1.0252 // Remove GST on commission
    return serviceAmount * 0.86
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    alert('✅ Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white/60">Loading pending payouts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            💰 Manual Payouts
          </h1>
          <p className="text-white/60">
            Transfer money to freelancers manually and mark as completed
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">How Manual Payouts Work</h3>
              <p className="text-sm text-white/70 mb-3">
                1. Use your bank app/UPI to transfer money to the freelancer<br />
                2. Copy their bank details from below<br />
                3. After transfer, enter the transaction ID and click "Mark as Transferred"
              </p>
              <p className="text-xs text-white/50">
                💡 Tip: Keep your transaction IDs recorded for future reference
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payouts */}
        {pending.length === 0 ? (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Pending Payouts
            </h3>
            <p className="text-white/60">
              All payouts have been processed!
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {pending.map((payout) => {
              const freelancer = payout.order.freelancer
              const freelancerAmount = calculateFreelancerAmount(payout.amount)
              
              return (
                <Card 
                  key={payout.id} 
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/10 p-6 hover:border-white/20 transition-all"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {payout.order.service_plan?.title || 'Service Order'}
                        </h3>
                        <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          Pending Manual Transfer
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                          {payout.order.plan_tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/60">
                        Order ID: <span className="font-mono">{payout.order.id.slice(0, 13)}...</span>
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        Created: {new Date(payout.order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/60">Total Payment</p>
                      <p className="text-2xl font-bold text-white">₹{payout.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Bank Details */}
                    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <h4 className="text-sm font-semibold text-white">🏦 Transfer To:</h4>
                        <Badge className="bg-green-500/20 text-green-300 text-xs">
                          ₹{freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </div>

                      {/* Warning if bank details missing */}
                      {(!freelancer.bank_account_number || !freelancer.bank_ifsc || !freelancer.bank_account_holder_name) && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <p className="text-xs text-red-300 font-semibold mb-1">⚠️ Missing Bank Details</p>
                          <p className="text-xs text-red-200/80">
                            Freelancer has not provided complete bank details. Contact them to update their profile.
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-white/50 mb-1">Account Holder Name</p>
                          <div className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                            <p className="font-mono text-white text-sm">
                              {freelancer.bank_account_holder_name || 'Not provided'}
                            </p>
                            {freelancer.bank_account_holder_name && (
                              <button
                                onClick={() => copyToClipboard(freelancer.bank_account_holder_name!)}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-white/50 mb-1">Account Number</p>
                          <div className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                            <p className="font-mono text-white text-sm">
                              {freelancer.bank_account_number || 'Not provided'}
                            </p>
                            {freelancer.bank_account_number && (
                              <button
                                onClick={() => copyToClipboard(freelancer.bank_account_number!)}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-white/50 mb-1">IFSC Code</p>
                          <div className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                            <p className="font-mono text-white text-sm">
                              {freelancer.bank_ifsc || 'Not provided'}
                            </p>
                            {freelancer.bank_ifsc && (
                              <button
                                onClick={() => copyToClipboard(freelancer.bank_ifsc!)}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        </div>

                        {/* UPI ID (if provided) */}
                        {freelancer.upi_id && (
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-3">
                            <p className="text-xs text-purple-300 mb-1 flex items-center gap-1">
                              <span>📱</span> UPI ID (For Quick Transfer)
                            </p>
                            <div className="flex justify-between items-center bg-black/20 rounded px-3 py-2">
                              <p className="font-mono text-white text-sm">
                                {freelancer.upi_id}
                              </p>
                              <button
                                onClick={() => copyToClipboard(freelancer.upi_id!)}
                                className="text-purple-400 hover:text-purple-300 text-xs font-semibold"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-[10px] text-purple-200/60 mt-1">
                              💡 Instant transfer via PhonePe, Paytm, Google Pay, etc.
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-white/50 mb-1">Freelancer</p>
                          <div className="bg-white/5 rounded px-3 py-2">
                            <p className="text-white text-sm">
                              {freelancer.display_name || 'No name'}
                            </p>
                            <p className="text-white/50 text-xs">
                              @{freelancer.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Breakdown & Action */}
                    <div className="flex flex-col justify-between">
                      {/* Breakdown */}
                      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-5 mb-4">
                        <h4 className="text-sm font-semibold text-white mb-3">💵 Payment Breakdown</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Client Paid:</span>
                            <span className="text-white font-mono">₹{payout.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Platform Fee (14%):</span>
                            <span className="text-red-300 font-mono">-₹{(payout.amount * 0.14).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="h-px bg-white/10 my-2" />
                          <div className="flex justify-between">
                            <span className="text-white/80 font-semibold">Freelancer Gets:</span>
                            <span className="text-green-300 font-mono font-bold">₹{freelancerAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-white/60 mb-2 block">
                            Transaction ID / UTR (Optional)
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g., UPI123456789 or 412912345678"
                            value={transactionIds[payout.order.id] || ''}
                            onChange={(e) => setTransactionIds(prev => ({
                              ...prev,
                              [payout.order.id]: e.target.value
                            }))}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                            disabled={processing === payout.order.id}
                          />
                        </div>

                        <Button
                          onClick={() => handleMarkTransferred(payout.order.id, transactionIds[payout.order.id] || '')}
                          disabled={
                            processing === payout.order.id || 
                            !freelancer.bank_account_number || 
                            !freelancer.bank_ifsc || 
                            !freelancer.bank_account_holder_name
                          }
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === payout.order.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                            </div>
                          ) : !freelancer.bank_account_number || !freelancer.bank_ifsc || !freelancer.bank_account_holder_name ? (
                            '❌ Missing Bank Details'
                          ) : (
                            '✅ Mark as Transferred'
                          )}
                        </Button>

                        <p className="text-xs text-white/40 text-center">
                          {(!freelancer.bank_account_number || !freelancer.bank_ifsc || !freelancer.bank_account_holder_name) 
                            ? 'Freelancer must add bank details before payout'
                            : 'This will update the freelancer\'s balance and mark the order as paid'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={loadPendingPayouts}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            🔄 Refresh
          </Button>
          <Button
            onClick={() => window.open('/MANUAL_PAYOUT_GUIDE.md', '_blank')}
            variant="outline"
            className="border-white/10 text-white hover:bg-white/5"
          >
            📖 View Guide
          </Button>
        </div>
      </div>
    </div>
  )
}
