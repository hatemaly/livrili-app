'use client'

import { Modal, Button } from '@livrili/ui'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface BatchProgressDialogProps {
  operation: {
    type: string
    progress: number
    total: number
    isVisible: boolean
  }
  onClose: () => void
}

export function BatchProgressDialog({ operation, onClose }: BatchProgressDialogProps) {
  const progressPercentage = (operation.progress / operation.total) * 100
  const isComplete = operation.progress >= operation.total

  const getOperationLabel = (type: string) => {
    switch (type) {
      case 'activate':
        return 'Activating suppliers'
      case 'deactivate':
        return 'Deactivating suppliers'
      case 'suspend':
        return 'Suspending suppliers'
      case 'set_preferred':
        return 'Setting preferred status'
      case 'remove_preferred':
        return 'Removing preferred status'
      case 'update_terms':
        return 'Updating payment terms'
      case 'delete':
        return 'Deleting suppliers'
      default:
        return 'Processing suppliers'
    }
  }

  const getOperationIcon = () => {
    if (isComplete) {
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />
    }
    return <ExclamationCircleIcon className="w-6 h-6 text-blue-500" />
  }

  return (
    <Modal
      isOpen={operation.isVisible}
      onClose={onClose}
      title="Batch Operation Progress"
      size="sm"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {getOperationIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              {getOperationLabel(operation.type)}
            </h3>
            <p className="text-sm text-gray-600">
              {isComplete 
                ? `Completed ${operation.total} suppliers`
                : `Processing ${operation.progress} of ${operation.total} suppliers`
              }
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-center text-sm text-gray-600">
          {Math.round(progressPercentage)}% complete
        </div>

        {isComplete && (
          <div className="flex justify-center">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}