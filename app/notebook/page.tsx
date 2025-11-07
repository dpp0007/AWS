'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LabNotebook from '@/components/features/LabNotebook'

export default function NotebookPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/lab"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Lab</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lab Notebook
            </h1>
            
            <div className="w-24"></div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <LabNotebook />
      </div>
    </div>
  )
}
