'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  illustration?: 'orders' | 'products' | 'users' | 'data' | 'search' | 'generic'
}

const illustrations = {
  orders: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center"
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </motion.div>
      {/* Floating elements */}
      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
      />
    </div>
  ),
  
  products: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center"
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 1, -1, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-0 right-0 w-6 h-6 bg-orange-400 rounded-lg rotate-12"
        animate={{ 
          rotate: [12, 20, 12],
          y: [0, -3, 0]
        }}
        transition={{ duration: 2.2, repeat: Infinity }}
      />
    </div>
  ),
  
  users: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center"
        animate={{ 
          y: [0, -6, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute -top-1 left-2 w-3 h-3 bg-blue-400 rounded-full"
        animate={{ 
          x: [0, 4, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2.8, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  ),
  
  data: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl flex items-center justify-center"
        animate={{ 
          rotate: [0, 3, -3, 0],
          scale: [1, 1.03, 1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.7 }}
      />
    </div>
  ),
  
  search: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-200 rounded-2xl flex items-center justify-center"
        animate={{ 
          y: [0, -5, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute -bottom-1 right-2 w-4 h-1 bg-amber-400 rounded-full"
        animate={{ 
          scaleX: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  ),
  
  generic: (
    <div className="relative">
      <motion.div
        className="w-24 h-24 bg-gradient-to-br from-[#FDF0D5] to-[#669BBC] rounded-2xl flex items-center justify-center"
        animate={{ 
          scale: [1, 1.05, 1],
          y: [0, -4, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-12 h-12 bg-[#003049] rounded-xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">L</span>
        </div>
      </motion.div>
    </div>
  )
}

const algerianMessages = {
  orders: {
    title: "No orders yet",
    description: "When retailers start placing orders, they'll appear here. Ready to connect Algeria's businesses!",
    emptyAction: "Create First Order"
  },
  products: {
    title: "Product catalog is empty",
    description: "Start building your inventory with products that Algerian retailers need most.",
    emptyAction: "Add Products"
  },
  users: {
    title: "No users to display",
    description: "Your community of retailers and admin users will show up here as they join.",
    emptyAction: "Invite Users"
  },
  data: {
    title: "No data available yet",
    description: "As your marketplace grows, you'll see insights and analytics here. Every great business starts somewhere!",
    emptyAction: "Refresh Data"
  },
  search: {
    title: "No results found",
    description: "Try adjusting your search terms or filters. Sometimes the best finds take a little patience!",
    emptyAction: "Clear Filters"
  },
  generic: {
    title: "Nothing here yet",
    description: "This space is ready for great things. Stay tuned as we build Algeria's marketplace together!",
    emptyAction: "Get Started"
  }
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  illustration = 'generic' 
}: EmptyStateProps) {
  const messages = algerianMessages[illustration]
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Illustration */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {icon || illustrations[illustration]}
      </motion.div>
      
      {/* Title */}
      <motion.h3 
        className="text-xl font-semibold text-gray-900 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {title || messages.title}
      </motion.h3>
      
      {/* Description */}
      <motion.p 
        className="text-gray-600 mb-6 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {description || messages.description}
      </motion.p>
      
      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            action.variant === 'secondary'
              ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
              : 'bg-[#003049] text-white hover:bg-[#003049]/90 focus:ring-[#003049] shadow-lg hover:shadow-xl'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label || messages.emptyAction}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      )}
      
      {/* Encouraging message */}
      <motion.div 
        className="mt-6 text-xs text-gray-500 flex items-center space-x-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span>🇩🇿</span>
        <span>Building Algeria's digital marketplace, one step at a time</span>
      </motion.div>
    </motion.div>
  )
}

// Specialized empty states
export function EmptyOrdersState({ onCreateOrder }: { onCreateOrder?: () => void }) {
  return (
    <EmptyState
      illustration="orders"
      title="No orders yet"
      description="When retailers start placing orders, they'll appear here. Ready to connect Algeria's businesses!"
      action={onCreateOrder ? {
        label: "Create First Order",
        onClick: onCreateOrder
      } : undefined}
    />
  )
}

export function EmptyProductsState({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      illustration="products"
      title="Product catalog is empty"
      description="Start building your inventory with products that Algerian retailers need most."
      action={onAddProduct ? {
        label: "Add Products",
        onClick: onAddProduct
      } : undefined}
    />
  )
}

export function EmptySearchState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      illustration="search"
      title="No results found"
      description="Try adjusting your search terms or filters. Sometimes the best finds take a little patience!"
      action={onClearFilters ? {
        label: "Clear Filters",
        onClick: onClearFilters,
        variant: 'secondary'
      } : undefined}
    />
  )
}