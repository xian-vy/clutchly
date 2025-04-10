import { AuthLayout } from '@/components/auth/AuthLayout'
import { FiAlertTriangle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface ErrorMessages {
  [key: string]: {
    title: string
    message: string
    action: string
    actionLink: string
  }
}

const errorMessages: ErrorMessages = {
  unauthorized: {
    title: 'Unauthorized Access',
    message: 'You do not have permission to access this resource.',
    action: 'Sign In',
    actionLink: '/auth/signin',
  },
  invalid_credentials: {
    title: 'Invalid Credentials',
    message: 'The provided credentials are incorrect. Please try again.',
    action: 'Try Again',
    actionLink: '/auth/signin',
  },
  email_not_verified: {
    title: 'Email Not Verified',
    message: 'Please verify your email address before signing in.',
    action: 'Resend Verification',
    actionLink: '/auth/verify-email',
  },
  server_error: {
    title: 'Server Error',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'Go Back',
    actionLink: '/auth/signin',
  },
  default: {
    title: 'Authentication Error',
    message: 'An error occurred during authentication.',
    action: 'Try Again',
    actionLink: '/auth/signin',
  },
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string; error_description?: string }
}) {
  const error = searchParams.error || 'default'
  const errorDetails = errorMessages[error] || errorMessages.default
  const customMessage = searchParams.error_description

  return (
    <AuthLayout mode="signin">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-destructive">
            {errorDetails.title}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {customMessage || errorDetails.message}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-destructive/5 border border-destructive/10 rounded-lg p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-destructive">Error Details</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {customMessage || errorDetails.message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href={errorDetails.actionLink}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/30"
            >
              {errorDetails.action}
            </Link>
          </div>
        </motion.div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
} 