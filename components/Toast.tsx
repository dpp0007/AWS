'use client'

import React, { useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

interface ToastProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onDismiss])

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-right-full duration-300 w-80 ${bgColors[toast.type]}`}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{toast.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{toast.message}</p>
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Toast
