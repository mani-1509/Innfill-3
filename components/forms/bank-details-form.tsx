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
    panNumber?: string
  }
  onSuccess?: () => void
}

export function BankDetailsForm({ initialData, onSuccess }: BankDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      accountNumber: initialData?.accountNumber || '',
      confirmAccountNumber: initialData?.accountNumber || '',
      ifscCode: initialData?.ifscCode || '',
      accountHolderName: initialData?.accountHolderName || '',
      panNumber: initialData?.panNumber || '',
    },
  })

  async function onSubmit(data: BankDetailsFormValues) {
    setIsSubmitting(true)

    try {
      const result = await updateBankDetails({
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        accountHolderName: data.accountHolderName,
        panNumber: data.panNumber,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Bank details saved successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting bank details:', error)
      toast.error('An error occurred while saving bank details')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save Bank Details'}
          </Button>

          {initialData && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-2">🔒 Your information is secure</p>
          <ul className="space-y-1 text-xs">
            <li>• Bank details are encrypted and stored securely</li>
            <li>• Used only for transferring your earnings</li>
            <li>• We never store CVV or card details</li>
            <li>• Complies with RBI and IT Act guidelines</li>
          </ul>
        </div>
      </form>
    </Form>
  )
}
