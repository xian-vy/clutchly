'use client'

import { FiMail, FiAlertCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { AuthLayout } from './AuthLayout'

export function VerifyEmailForm() {
  return (
    <AuthLayout mode="signup">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Check Your Email</h2>
            <p className="mt-2 text-muted-foreground">
              We&apos;ve sent you a verification link. Please check your inbox to complete your registration.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/50 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FiMail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Verification Email Sent</h3>
                <p className="text-sm text-muted-foreground">Click the link in the email to verify your account</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Can&apos;t find the email? Please:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Allow a few minutes for the email to arrive</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
    </AuthLayout>
  )
} 