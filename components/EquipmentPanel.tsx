'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus } from 'lucide-react'
import { EQUIPMENT_CONFIG, Equipment } from '@/lib/equipment-config'

interface EquipmentPanelProps {
  onEquipmentChange?: (equipment: Equipment[]) => void
  hideFloatingButton?: boolean
  externalIsOpen?: boolean
  onClose?: () => void
}

export default function EquipmentPanel({ onEquipmentChange, hideFloatingButton = false, externalIsOpen, onClose }: EquipmentPanelProps) {
  // Initialize with all 8 equipment types from config
  const [equipment, setEquipment] = useState<Equipment[]>(
    EQUIPMENT_CONFIG.map(eq => ({ ...eq }))
  )

  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

  // Handle closing - use external handler if provided
  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setInternalIsOpen(false)
    }
  }

  // Handle opening (for internal button)
  const handleOpen = () => {
    setInternalIsOpen(true)
  }

  const toggleEquipment = (id: string) => {
    const updated = equipment.map(eq =>
      eq.id === id ? { ...eq, active: !eq.active } : eq
    )
    console.log('EquipmentPanel: Equipment toggled', {
      id,
      updated: updated.filter(eq => eq.active),
      hasCallback: !!onEquipmentChange
    })
    setEquipment(updated)
    onEquipmentChange?.(updated)
  }

  const updateValue = (id: string, change: number) => {
    const updated = equipment.map(eq => {
      if (eq.id === id && eq.value !== undefined && eq.min !== undefined && eq.max !== undefined) {
        const step = eq.step || 10
        const newValue = Math.max(eq.min, Math.min(eq.max, eq.value + change))
        return { ...eq, value: newValue }
      }
      return eq
    })
    setEquipment(updated)
    onEquipmentChange?.(updated)
  }

  const activeEquipment = equipment.filter(eq => eq.active)

  return (
    <>
      {/* Floating Button - Hidden when integrated into Features menu */}
      {!hideFloatingButton && (
        <motion.button
          onClick={handleOpen}
          className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          {/* Use first active equipment icon or default */}
          {activeEquipment.length > 0 ? (
            (() => {
              const FirstIcon = activeEquipment[0].icon
              return <FirstIcon className="h-6 w-6" />
            })()
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
          {activeEquipment.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center">
              {activeEquipment.length}
            </span>
          )}
        </motion.button>
      )}

      {/* Equipment Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center justify-between z-10">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <div>
                    <h2 className="text-lg font-bold">Lab Equipment</h2>
                    <p className="text-xs text-white/80">{equipment.length} devices available</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Equipment List */}
              <div className="p-4 space-y-4">
                {equipment.map((eq) => {
                  const Icon = eq.icon
                  return (
                    <div
                      key={eq.id}
                      className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border-2 transition-all flex flex-col ${eq.active
                        ? 'border-green-500 shadow-lg shadow-green-500/20'
                        : 'border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`relative p-2 rounded-lg bg-gradient-to-br ${eq.color} ${eq.active ? 'animate-pulse' : ''}`}>
                          <Icon className={`h-5 w-5 text-white ${
                            eq.active && (eq.id === 'magnetic-stirrer' || eq.id === 'centrifuge') 
                              ? 'animate-spin' 
                              : eq.active && (eq.id === 'bunsen-burner' || eq.id === 'hot-plate')
                              ? 'animate-bounce'
                              : ''
                          }`} />
                          {eq.active && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                              {eq.name}
                            </h3>
                            {eq.active && (
                              <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                                ON
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {eq.category} • {eq.active ? '⚡ Active' : '○ Inactive'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        {eq.description}
                      </p>

                      {/* Controls */}
                      {eq.active && eq.value !== undefined && (
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 relative overflow-hidden">
                          {/* Animated background for active equipment */}
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 animate-pulse"></div>
                          
                          <div className="relative flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                              Setting:
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {eq.value} {eq.unit}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateValue(eq.id, -(eq.step || 10))}
                              className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Minus className="h-4 w-4 mx-auto" />
                            </button>

                            <div className="flex-1">
                              <input
                                type="range"
                                min={eq.min}
                                max={eq.max}
                                step={eq.step || 1}
                                value={eq.value}
                                onChange={(e) => {
                                  const updated = equipment.map(item =>
                                    item.id === eq.id
                                      ? { ...item, value: parseFloat(e.target.value) }
                                      : item
                                  )
                                  setEquipment(updated)
                                  onEquipmentChange?.(updated)
                                }}
                                className="w-full"
                              />
                            </div>

                            <button
                              onClick={() => updateValue(eq.id, (eq.step || 10))}
                              className="flex-1 p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <Plus className="h-4 w-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Activity Indicator */}
                      {eq.active && (
                        <div className="mt-3 mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                            <span>Status</span>
                            <span className="text-green-600 dark:text-green-400 font-semibold">Operating</span>
                          </div>
                          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Toggle Button at Bottom */}
                      <button
                        onClick={() => toggleEquipment(eq.id)}
                        className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${eq.active
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/50'
                          }`}
                      >
                        {eq.active ? '⏸ Turn Off' : '▶ Turn On'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Active Equipment Summary */}
              {activeEquipment.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                    Active Equipment ({activeEquipment.length})
                  </h3>
                  <div className="space-y-1">
                    {activeEquipment.map(eq => (
                      <div key={eq.id} className="text-sm text-green-800 dark:text-green-200">
                        • {eq.name}: {eq.value} {eq.unit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Turn on equipment before performing reactions.
                  Active equipment will affect your experiment results!
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
