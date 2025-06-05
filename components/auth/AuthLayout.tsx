import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { CircleCheck,  Zap } from 'lucide-react'
import { APP_NAME } from '@/lib/constants/app'

interface AuthLayoutProps {
  children: ReactNode
  mode: 'signin' | 'signup'
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full flex overflow-hidden">
      {/* Left Hero Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-center w-1/2 p-12 2xl:p-24 bg-gradient-to-br from-primary/5 to-accent/5"
      >
        <div className="max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-6 text-[#333] dark:text-foreground"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {APP_NAME}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm lg:text-lg text-muted-foreground mb-8"
          >
            {mode === 'signin' 
              ? "Welcome back! Sign in to continue your herping journey and manage your reptile data with ease."
              : "Join our community of reptile enthusiasts and start managing your collection with our powerful tools."}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6 max-w-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CircleCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Easy Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your collection</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
               <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Real-time Data</h3>
                <p className="text-sm text-muted-foreground">Instant updates</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center p-8"
      >
        {children}
      </motion.div>
    </div>
  )
} 