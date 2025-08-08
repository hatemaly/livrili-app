'use client'

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useLanguage, useRTL } from '@livrili/ui'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
  position?: 'top' | 'bottom'
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
  clearAll: () => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
  defaultDuration?: number
  defaultPosition?: 'top' | 'bottom'
}

export function ToastProvider({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000,
  defaultPosition = 'top'
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      id,
      duration: defaultDuration,
      position: defaultPosition,
      ...toast,
    }

    setToasts(current => {
      // Remove oldest toast if we exceed maxToasts
      const newToasts = current.length >= maxToasts ? current.slice(1) : current
      return [...newToasts, newToast]
    })

    // Auto-remove toast after duration (unless persistent or loading)
    if (!newToast.persistent && newToast.type !== 'loading' && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [maxToasts, defaultDuration, defaultPosition])

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(current =>
      current.map(toast =>
        toast.id === id ? { ...toast, ...updates } : toast
      )
    )
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast, clearAll, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const topToasts = toasts.filter(toast => toast.position === 'top')
  const bottomToasts = toasts.filter(toast => toast.position === 'bottom')

  return (
    <>
      {/* Top Toasts */}
      {topToasts.length > 0 && (
        <div className="fixed top-4 left-4 right-4 z-50 flex flex-col items-center space-y-2 pointer-events-none">
          {topToasts.map((toast) => (
            <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}

      {/* Bottom Toasts */}
      {bottomToasts.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 flex flex-col items-center space-y-2 pointer-events-none">
          {bottomToasts.map((toast) => (
            <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </div>
      )}
    </>
  )
}

interface ToastComponentProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastComponent({ toast, onRemove }: ToastComponentProps) {
  const { language, t } = useLanguage()
  const { isRTL } = useRTL()
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconPath: (
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          )
        }
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconPath: (
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          )
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconPath: (
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          )
        }
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconPath: (
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          )
        }
      case 'loading':
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconPath: null // Will show spinner instead
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          iconPath: null
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving
          ? 'translate-y-0 opacity-100 scale-100'
          : isRemoving
          ? 'translate-y-2 opacity-0 scale-95'
          : 'translate-y-2 opacity-0 scale-95'
        }
      `}
    >
      <div className={`rounded-xl border shadow-lg backdrop-blur-sm ${styles.bg}`}>
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className={`flex-shrink-0 ${styles.icon}`}>
              {toast.type === 'loading' ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  {styles.iconPath}
                </svg>
              )}
            </div>

            {/* Content */}
            <div className={`ml-3 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className={`text-sm font-semibold ${styles.title}`}>
                {toast.title}
              </h3>
              {toast.message && (
                <p className={`mt-1 text-sm ${styles.message}`}>
                  {toast.message}
                </p>
              )}
              
              {/* Action Button */}
              {toast.action && (
                <div className="mt-3">
                  <button
                    onClick={toast.action.onClick}
                    className={`
                      text-sm font-medium underline hover:no-underline transition-all
                      ${toast.type === 'success' ? 'text-green-700 hover:text-green-800' :
                        toast.type === 'error' ? 'text-red-700 hover:text-red-800' :
                        toast.type === 'warning' ? 'text-yellow-700 hover:text-yellow-800' :
                        'text-blue-700 hover:text-blue-800'
                      }
                    `}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            {!toast.persistent && toast.type !== 'loading' && (
              <button
                onClick={handleRemove}
                className={`
                  flex-shrink-0 ml-2 rounded-lg p-1.5 transition-colors
                  ${toast.type === 'success' ? 'hover:bg-green-100 text-green-500' :
                    toast.type === 'error' ? 'hover:bg-red-100 text-red-500' :
                    toast.type === 'warning' ? 'hover:bg-yellow-100 text-yellow-500' :
                    'hover:bg-blue-100 text-blue-500'
                  }
                `}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar for Timed Toasts */}
        {!toast.persistent && toast.type !== 'loading' && toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-black/10 rounded-b-xl overflow-hidden">
            <div
              className={`h-full transition-all ease-linear ${
                toast.type === 'success' ? 'bg-green-500' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{
                animation: `toast-progress ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper hook for common toast patterns
export function useToastHelpers() {
  const { addToast, updateToast } = useToast()
  
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'success', title, message, ...options }), [addToast])
  
  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'error', title, message, duration: 7000, ...options }), [addToast])
  
  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'warning', title, message, ...options }), [addToast])
  
  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => 
    addToast({ type: 'info', title, message, ...options }), [addToast])
  
  const loading = useCallback((title: string, message?: string) => 
    addToast({ type: 'loading', title, message, persistent: true }), [addToast])
  
  const promise = useCallback(async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ): Promise<T> => {
    const loadingToastId = loading(messages.loading)
    
    try {
      const result = await promise
      updateToast(loadingToastId, {
        type: 'success',
        title: typeof messages.success === 'function' 
          ? messages.success(result) 
          : messages.success,
        persistent: false,
        duration: 5000
      })
      return result
    } catch (error) {
      updateToast(loadingToastId, {
        type: 'error',
        title: typeof messages.error === 'function' 
          ? messages.error(error) 
          : messages.error,
        persistent: false,
        duration: 7000
      })
      throw error
    }
  }, [addToast, updateToast, loading])

  return {
    success,
    error,
    warning,
    info,
    loading,
    promise,
  }
}

// CSS for progress bar animation
const toastStyles = `
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = toastStyles
  document.head.appendChild(style)
}