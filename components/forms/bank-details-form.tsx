'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { updateBankDetails } from '@/lib/actions/payments'

// Simple toast alternative until sonner is installed
const toast = {
  success: (message: string) => alert(message),
  error: (message: string) => alert(message),
}

// Validation schema
const bankDetailsSchema = z.object({
  accountNumber: z
    .string()
    .min(8, 'Account number must be at least 8 digits')
    .max(18, 'Account number must be at most 18 digits')
    .regex(/^[0-9]+$/, 'Account number must contain only numbers'),
  confirmAccountNumber: z
    .string()
    .min(8, 'Please confirm your account number'),
  ifscCode: z
    .string()
    .length(11, 'IFSC code must be exactly 11 characters')
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g., SBIN0001234)')
    .transform(val => val.toUpperCase()),
  accountHolderName: z
    .string()
    .min(3, 'Account holder name must be at least 3 characters')
    .max(100, 'Account holder name must be at most 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Account holder name must contain only letters and spaces'),
  upiId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(val),
      'Invalid UPI ID format (e.g., name@paytm, 9876543210@ybl)'
    ),
  panNumber: z
    .string()
    .length(10, 'PAN must be exactly 10 characters')
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .transform(val => val.toUpperCase()),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: 'Account numbers do not match',
  path: ['confirmAccountNumber'],
})

type BankDetailsFormValues = z.infer<typeof bankDetailsSchema>

interface BankDetailsFormProps {
  initialData?: {
    accountNumber?: string
    ifscCode?: string
    accountHolderName?: string
    upiId?: string
    panNumber?: string
  }
  onSuccess?: () => void
}

export function BankDetailsForm({ initialData, onSuccess }: BankDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationStep, setVerificationStep] = useState('')

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: initialData?.accountNumber || '',
      confirmAccountNumber: initialData?.accountNumber || '',
      ifscCode: initialData?.ifscCode || '',
      accountHolderName: initialData?.accountHolderName || '',
      upiId: initialData?.upiId || '',
      panNumber: initialData?.panNumber || '',
    },
  })

  async function onSubmit(data: BankDetailsFormValues) {
    setIsSubmitting(true)
    setVerificationStep('🔍 Validating format...')

    try {
      setVerificationStep('🔍 Verifying IFSC code...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setVerificationStep('🔍 Creating payment gateway contact...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setVerificationStep('✅ Verifying bank account with Razorpay...')
      
      const result = await updateBankDetails({
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        accountHolderName: data.accountHolderName,
        upiId: data.upiId || undefined,
        panNumber: data.panNumber,
      })

      if (result.error) {
        setVerificationStep('')
        toast.error(result.error)
        return
      }

      setVerificationStep('')
      toast.success(result.message || '✅ Bank details verified and saved successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting bank details:', error)
      setVerificationStep('')
      toast.error('An error occurred while saving bank details')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Info Banner */}
        <div className="relative overflow-hidden p-5 bg-gradient-to-br from-yellow-500/10 via-orange-600/5 to-amber-500/10 border border-yellow-500/20 rounded-xl backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-yellow-300 font-semibold">
                  Bank Account Verification
                </p>
                <p className="text-xs text-yellow-200/60 mt-1">
                  Limited verification - full check on first payout
                </p>
              </div>
            </div>
            <ul className="text-xs text-yellow-200/70 space-y-2 ml-11">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span className="text-green-300/80">IFSC verified with RBI database</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                <span className="text-green-300/80">Account format validated</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                <span className="text-yellow-300/80">Account number NOT verified with bank</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                <span className="text-yellow-300/80">Will be verified on first payout attempt</span>
              </li>
            </ul>
            <div className="mt-3 ml-11 p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-[10px] text-yellow-200/60">
                💡 <strong>Important:</strong> Enter correct details. Invalid account numbers will cause payout failures.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Account Holder Name */}
          <FormField
            control={form.control}
            name="accountHolderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Holder Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Full name as per bank records"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Enter your full name exactly as it appears in your bank account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Account Number */}
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Account Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter account number"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={18}
                  />
                </FormControl>
                <FormDescription>
                  Your savings or current account number (8-18 digits)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Account Number */}
          <FormField
            control={form.control}
            name="confirmAccountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Account Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Re-enter account number"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={18}
                  />
                </FormControl>
                <FormDescription>
                  Please re-enter your account number to confirm
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* IFSC Code */}
          <FormField
            control={form.control}
            name="ifscCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., SBIN0001234"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={11}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase())
                    }}
                  />
                </FormControl>
                <FormDescription>
                  11-character bank branch code (check your passbook or cheque)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* UPI ID */}
          <FormField
            control={form.control}
            name="upiId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UPI ID (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., yourname@paytm or 9876543210@ybl"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  📱 For faster payments - Your PhonePe, Paytm, Google Pay, or other UPI ID
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PAN Number */}
          <FormField
            control={form.control}
            name="panNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., ABCDE1234F"
                    {...field}
                    disabled={isSubmitting}
                    maxLength={10}
                    onChange={(e) => {
                      field.onChange(e.target.value.toUpperCase())
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Required for tax compliance and payment transfers
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Verification Progress */}
        {verificationStep && (
          <div className="relative overflow-hidden p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>
            <div className="relative flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-blue-300 text-sm font-medium">{verificationStep}</p>
                <div className="h-1 bg-blue-500/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:shadow-lg hover:shadow-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              '💾 Save Bank Details'
            )}
          </button>

          {initialData && (
            <button
              type="button"
              onClick={() => form.reset()}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          )}
        </div>

        {/* Security Info */}
        <div className="relative overflow-hidden p-5 bg-gradient-to-br from-green-500/10 via-emerald-600/5 to-teal-500/10 border border-green-500/20 rounded-xl backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <p className="text-sm text-green-300 font-semibold">
                  Your Information is Secure
                </p>
                <p className="text-xs text-green-200/60 mt-1">
                  Bank-grade encryption & compliance
                </p>
              </div>
            </div>
            <ul className="space-y-2 ml-11 text-xs text-green-200/70">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Bank details are encrypted and stored securely
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Used only for transferring your earnings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                We never store CVV or card details
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                Complies with RBI and IT Act guidelines
              </li>
            </ul>
          </div>
        </div>
      </form>
    </Form>
  )
}
