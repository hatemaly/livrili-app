'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LoadingSpinner, 
  DelightfulLoading, 
  TableLoadingState, 
  LoadingSkeleton 
} from '../../../components/ui/loading-states'
import { 
  EmptyState, 
  EmptyOrdersState, 
  EmptyProductsState, 
  EmptySearchState 
} from '../../../components/ui/empty-states'
import { 
  SmartButton, 
  RefreshButton, 
  SaveButton, 
  DeleteButton, 
  CreateButton 
} from '../../../components/ui/smart-buttons'
import { 
  SuccessCelebration, 
  useSuccessCelebration, 
  celebrationMessages 
} from '../../../components/ui/success-celebrations'
import { Toast } from '../../../components/ui/toast'

export default function PlaygroundPage() {
  const [showLoading, setShowLoading] = useState(false)
  const [showEmptyState, setShowEmptyState] = useState('orders')
  const [hasChanges, setHasChanges] = useState(false)
  const { celebration, celebrate, SuccessCelebrationComponent } = useSuccessCelebration()

  // Demo functions
  const mockAsyncAction = () => new Promise(resolve => setTimeout(resolve, 2000))
  const mockFailingAction = () => new Promise((_, reject) => setTimeout(reject, 1500))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Component Playground</h1>
                <p className="text-gray-600">Interactive showcase of delightful UI components</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-8">
        {/* Loading States Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <motion.div 
              className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⚡
            </motion.div>
            Loading States
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Basic Spinner */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Basic Spinner</h3>
              <div className="flex justify-center py-4">
                <LoadingSpinner size="md" color="primary" message="Loading..." />
              </div>
            </div>

            {/* Delightful Loading */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Delightful Loading</h3>
              <button
                onClick={() => setShowLoading(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show Loading
              </button>
              {showLoading && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <DelightfulLoading 
                    message="Processing your request..."
                    submessage="This won't take long!"
                  />
                  <button
                    onClick={() => setShowLoading(false)}
                    className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Hide
                  </button>
                </div>
              )}
            </div>

            {/* Skeleton Loading */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Skeleton Loading</h3>
              <div className="space-y-3">
                <LoadingSkeleton variant="text" width="80%" />
                <LoadingSkeleton variant="text" width="60%" />
                <LoadingSkeleton variant="rectangular" height="100px" />
              </div>
            </div>
          </div>
        </section>

        {/* Empty States Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              📭
            </div>
            Empty States
          </h2>
          
          <div className="mb-4">
            <select 
              value={showEmptyState}
              onChange={(e) => setShowEmptyState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="orders">Orders</option>
              <option value="products">Products</option>
              <option value="search">Search Results</option>
              <option value="generic">Generic</option>
            </select>
          </div>

          <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 min-h-[300px] flex items-center justify-center">
            {showEmptyState === 'orders' && (
              <EmptyOrdersState onCreateOrder={() => alert('Create order clicked!')} />
            )}
            {showEmptyState === 'products' && (
              <EmptyProductsState onAddProduct={() => alert('Add product clicked!')} />
            )}
            {showEmptyState === 'search' && (
              <EmptySearchState onClearFilters={() => alert('Clear filters clicked!')} />
            )}
            {showEmptyState === 'generic' && (
              <EmptyState
                title="Custom Empty State"
                description="This is a customizable empty state component with Algerian flair!"
                action={{
                  label: "Take Action",
                  onClick: () => alert('Action taken!')
                }}
              />
            )}
          </div>
        </section>

        {/* Smart Buttons Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              🎯
            </div>
            Smart Buttons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Smart Button */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Smart Button</h3>
              <SmartButton
                onClick={mockAsyncAction}
                successMessage="Task completed!"
                celebration={true}
              >
                Click me!
              </SmartButton>
              <SmartButton
                onClick={mockFailingAction}
                variant="destructive"
                errorMessage="Oops, that failed!"
              >
                This will fail
              </SmartButton>
            </div>

            {/* Save Button */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Save Button</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasChanges}
                    onChange={(e) => setHasChanges(e.target.checked)}
                  />
                  <span>Has unsaved changes</span>
                </label>
                <SaveButton
                  onSave={mockAsyncAction}
                  hasChanges={hasChanges}
                />
              </div>
            </div>

            {/* Create Button */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Create Button</h3>
              <CreateButton
                onCreate={mockAsyncAction}
                label="Create New Item"
              />
            </div>

            {/* Delete Button */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Delete Button</h3>
              <DeleteButton
                onDelete={mockAsyncAction}
                confirmMessage="Really delete?"
              />
            </div>

            {/* Refresh Button */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <h3 className="font-medium text-gray-900">Refresh Button</h3>
              <RefreshButton
                onRefresh={mockAsyncAction}
                lastUpdated={new Date()}
              />
            </div>
          </div>
        </section>

        {/* Success Celebrations Section */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              🎉
            </div>
            Success Celebrations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => celebrate("Order Created!", "Successfully created a new order for the retailer.", 'order')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <div className="font-medium text-green-800">🛍️ Order Success</div>
              <div className="text-sm text-green-600">Celebrate new orders</div>
            </button>
            
            <button
              onClick={() => celebrate("User Added!", "Welcome to the team! New user successfully onboarded.", 'user')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <div className="font-medium text-purple-800">👥 User Success</div>
              <div className="text-sm text-purple-600">Welcome new users</div>
            </button>
            
            <button
              onClick={() => celebrate("Product Added!", "New product is now available to retailers!", 'product')}
              className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left"
            >
              <div className="font-medium text-orange-800">📦 Product Success</div>
              <div className="text-sm text-orange-600">New inventory added</div>
            </button>
            
            <button
              onClick={() => celebrate("Payment Processed!", "Transaction completed successfully.", 'payment')}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-left"
            >
              <div className="font-medium text-emerald-800">💰 Payment Success</div>
              <div className="text-sm text-emerald-600">Money matters handled</div>
            </button>
            
            <button
              onClick={() => celebrate("Amazing Work!", "You're doing great things for Algeria's marketplace!", 'generic')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-medium text-blue-800">✨ Generic Success</div>
              <div className="text-sm text-blue-600">General celebrations</div>
            </button>
          </div>
        </section>

        {/* Table Loading State */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              📊
            </div>
            Table Loading States
          </h2>
          <TableLoadingState rows={5} columns={4} />
        </section>
      </div>

      {/* Success celebration component */}
      <SuccessCelebrationComponent />
    </div>
  )
}