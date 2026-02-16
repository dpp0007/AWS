'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Users, Plus, LogIn, Copy, CheckCircle } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

export default function CollaboratePage() {
  const [roomCode, setRoomCode] = useState('')
  const [createdRoom, setCreatedRoom] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const createSession = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/collaboration/session', {
        method: 'POST'
      })
      const data = await response.json()
      if (data.success) {
        setCreatedRoom(data.roomCode)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert('Failed to create collaboration session')
    } finally {
      setLoading(false)
    }
  }
  
  const joinSession = async () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch(`/api/collaboration/session?roomCode=${roomCode}`)
      const data = await response.json()
      
      if (data.roomCode) {
        // Redirect to collaborative lab
        window.location.href = `/lab/collaborative?room=${roomCode}`
      } else {
        alert('Room not found')
      }
    } catch (error) {
      console.error('Failed to join session:', error)
      alert('Failed to join collaboration session')
    } finally {
      setLoading(false)
    }
  }
  
  const copyRoomCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start a new collaboration session and invite others
              </p>
            </div>
            
            {createdRoom ? (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Session created successfully!
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-white dark:bg-gray-700 rounded-lg px-4 py-3 font-mono text-2xl text-center">
                      {createdRoom}
                    </div>
                    <button
                      onClick={copyRoomCode}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Link
                  href={`/lab/collaborative?room=${createdRoom}`}
                  className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
                >
                  Enter Lab
                </Link>
                
                <button
                  onClick={() => setCreatedRoom(null)}
                  className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Create Another
                </button>
              </div>
            ) : (
              <button
                onClick={createSession}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            )}
          </motion.div>
          
          {/* Join Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Join Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter a room code to join an existing session
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-center text-2xl uppercase"
                />
              </div>
              
              <button
                onClick={joinSession}
                disabled={loading || !roomCode.trim()}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Session'}
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-blue-500/10 backdrop-blur-xl border border-blue-400/30 rounded-xl p-6"
        >
          <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3">
            How Collaboration Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Create a session or join with a room code</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Share the room code with your lab partners</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Work together on experiments in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>See each other's actions and results instantly</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
