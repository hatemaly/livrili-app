'use client'

import { useEffect, useState } from 'react'
import { Modal, Button } from '@livrili/ui'
import { CheckCircle, XCircle, Settings } from 'lucide-react'

interface BatchOperation {
  type: string
  progress: number
  total: number
  isVisible: boolean
}

interface BatchProgressDialogProps {
  operation: BatchOperation
  onClose: () => void
}

export function BatchProgressDialog({ operation, onClose }: BatchProgressDialogProps) {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Simulate progress updates
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const newProgress = Math.min(prev + Math.random() * 20, operation.total)
        if (newProgress >= operation.total) {
          setIsComplete(true)
          clearInterval(interval)
        }
        return newProgress
      })
    }, 500)

    return () => clearInterval(interval)
  }, [operation.total])

  const progressPercentage = Math.round((currentProgress / operation.total) * 100)

  const getOperationTitle = (type: string) => {
    switch (type) {
      case 'activate':
        return 'Activating Products'
      case 'deactivate':
        return 'Deactivating Products'
      case 'updatePrice':
        return 'Updating Prices'
      case 'updateStock':
        return 'Updating Stock'
      case 'delete':
        return 'Deleting Products'
      default:
        return 'Processing Products'
    }
  }

  const getOperationDescription = (type: string) => {
    switch (type) {
      case 'activate':
        return 'Making selected products active...'
      case 'deactivate':
        return 'Making selected products inactive...'
      case 'updatePrice':
        return 'Updating prices for selected products...'
      case 'updateStock':
        return 'Updating stock levels for selected products...'
      case 'delete':
        return 'Deleting selected products...'
      default:
        return 'Processing selected products...'
    }
  }

  return (
    <Modal
      isOpen={operation.isVisible}
      onClose={isComplete ? onClose : undefined}
      title={getOperationTitle(operation.type)}
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center">
          {isComplete ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Operation Complete
              </h3>
              <p className="text-sm text-gray-600">
                Successfully processed {operation.total} product{operation.total !== 1 ? 's' : ''}
              </p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Operation Failed
              </h3>
              <p className="text-sm text-gray-600">
                An error occurred while processing the products
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Settings className="h-16 w-16 text-blue-500 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {getOperationTitle(operation.type)}
              </h3>
              <p className="text-sm text-gray-600">
                {getOperationDescription(operation.type)}
              </p>
            </div>
          )}
        </div>

        {!isComplete && !hasError && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(currentProgress)} of {operation.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-center text-sm text-gray-500">
              {progressPercentage}% complete
            </div>
          </div>
        )}

        {/* Detailed progress items (optional) */}
        {!isComplete && !hasError && (
          <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Validating products...</span>
                <CheckCircle className="h-3 w-3 text-green-500" />
              </div>
              <div className="flex justify-between">
                <span>Updating database...</span>
                {currentProgress > operation.total * 0.3 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full animate-pulse" />
                )}
              </div>
              <div className="flex justify-between">
                <span>Refreshing cache...</span>
                {currentProgress > operation.total * 0.7 ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
              </div>
              <div className="flex justify-between">
                <span>Finalizing changes...</span>
                {isComplete ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <div className="h-3 w-3 border border-gray-300 rounded-full" />
                )}
              </div>
            </div>
          </div>
        )}

        {(isComplete || hasError) && (
          <div className="flex justify-center pt-4">
            <Button onClick={onClose}>
              {isComplete ? 'Done' : 'Close'}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}