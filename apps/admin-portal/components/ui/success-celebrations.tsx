'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SuccessCelebrationProps {
  show: boolean
  title: string
  message: string
  onComplete?: () => void
  type?: 'order' | 'user' | 'product' | 'payment' | 'generic'
  duration?: number
}

const celebrationConfig = {
  order: {
    icon: '📦',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7'
    },
    particles: 16,
    confettiColors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0']
  },
  user: {
    icon: '👥',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#C4B5FD'
    },
    particles: 12,
    confettiColors: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE']
  },
  product: {
    icon: '🎁',
    colors: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      accent: '#FCD34D'
    },
    particles: 14,
    confettiColors: ['#F59E0B', '#FBBF24', '#FCD34D', '#FEF3C7']
  },
  payment: {
    icon: '💰',
    colors: {
      primary: '#059669',
      secondary: '#10B981',  
      accent: '#34D399'
    },
    particles: 18,
    confettiColors: ['#059669', '#10B981', '#34D399', '#A7F3D0']
  },
  generic: {
    icon: '✨',
    colors: {
      primary: '#003049',
      secondary: '#669BBC',
      accent: '#C1121F'
    },
    particles: 20,
    confettiColors: ['#003049', '#669BBC', '#C1121F', '#FDF0D5']
  }
}

export function SuccessCelebration({
  show,
  title,
  message,
  onComplete,
  type = 'generic',
  duration = 3000
}: SuccessCelebrationProps) {
  const config = celebrationConfig[type]
  
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, duration)
      return () => clearTimeout(timer)
    }
  }, [show, onComplete, duration])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: config.particles }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: config.confettiColors[i % config.confettiColors.length],
                  left: '50%',
                  top: '50%'
                }}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  rotate: 0
                }}
                animate={{
                  scale: [0, 1, 0.8, 0],
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 600,
                  rotate: [0, 360, 720],
                  opacity: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 2.5,
                  ease: "easeOut",
                  delay: i * 0.05
                }}
              />
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full text-center relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.1 
            }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.secondary})`
              }}
            />
            
            {/* Success icon */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                delay: 0.3 
              }}
            >
              <div 
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-lg"
                style={{ backgroundColor: config.colors.primary }}
              >
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: 0.5,
                    repeat: 1
                  }}
                >
                  {config.icon}
                </motion.span>
              </div>
              
              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-4"
                style={{ borderColor: config.colors.secondary }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.6
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: config.colors.accent }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: 0.9
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              className="text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {message}
            </motion.p>

            {/* Algerian touch */}
            <motion.div
              className="flex items-center justify-center text-sm text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="mr-2">🇩🇿</span>
              <span>Growing Algeria's digital marketplace together</span>
            </motion.div>

            {/* Auto-close indicator */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
              style={{ backgroundColor: config.colors.primary }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for easy success celebrations
export function useSuccessCelebration() {
  const [celebration, setCelebration] = useState<{
    show: boolean
    title: string
    message: string
    type: 'order' | 'user' | 'product' | 'payment' | 'generic'
  }>({
    show: false,
    title: '',
    message: '',
    type: 'generic'
  })

  const celebrate = (
    title: string, 
    message: string, 
    type: 'order' | 'user' | 'product' | 'payment' | 'generic' = 'generic'
  ) => {
    setCelebration({ show: true, title, message, type })
  }

  const hideCelebration = () => {
    setCelebration(prev => ({ ...prev, show: false }))
  }

  return {
    celebration,
    celebrate,
    hideCelebration,
    SuccessCelebrationComponent: () => (
      <SuccessCelebration
        show={celebration.show}
        title={celebration.title}
        message={celebration.message}
        type={celebration.type}
        onComplete={hideCelebration}
      />
    )
  }
}

// Quick celebration messages for common actions
export const celebrationMessages = {
  orderCreated: {
    title: "Order Created Successfully!",
    message: "The new order has been added and retailers will be notified. Another step towards connecting Algeria's businesses!",
    type: 'order' as const
  },
  userAdded: {
    title: "Welcome New Team Member!",
    message: "The user has been successfully added to the platform. Our community grows stronger together!",
    type: 'user' as const
  },
  productAdded: {
    title: "Product Added to Catalog!",
    message: "Your new product is now available to retailers across Algeria. Let's help businesses thrive!",
    type: 'product' as const
  },
  paymentProcessed: {
    title: "Payment Processed!",
    message: "The payment has been successfully recorded. Keeping Algeria's commerce flowing smoothly!",
    type: 'payment' as const
  },
  dataUpdated: {
    title: "Changes Saved Successfully!",
    message: "Your updates have been applied and are now live. Excellence in every detail!",
    type: 'generic' as const
  }
}