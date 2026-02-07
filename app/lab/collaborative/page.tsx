'use client'

import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Users, Wifi, WifiOff, Copy, CheckCircle, Beaker, BrainCircuit, Atom } from 'lucide-react'
import LabTable, { LabTableRef } from '@/components/LabTable'
import ChemicalShelf from '@/components/ChemicalShelf'
import ReactionPanel from '@/components/ReactionPanel'
import CollaborationNotifications from '@/components/features/CollaborationNotifications'
import CollaborativeQuiz from '@/components/collaborative/CollaborativeQuiz'
import CollaborativeMoleculeBuilder from '@/components/collaborative/CollaborativeMoleculeBuilder'
import { useCollaboration } from '@/hooks/useCollaboration'
import { useCollab } from '@/app/context/CollabContext'
import { Experiment, ReactionResult } from '@/types/chemistry'

function CollaborativeLabContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = searchParams.get('room')
  
  // Use the high-level hook for session logic
  const {
    session,
    isConnected,
    error,
    userId,
    joinSession,
    updateExperiment
    // Removed local updateCursor to rely on global CursorOverlay
  } = useCollaboration(roomCode)

  // Use direct context for module switching and socket access
  const { activeModule, changeModule, socket, sendLabAction } = useCollab()
  
  const labTableRef = useRef<LabTableRef>(null)
  
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null)
  const [reactionResult, setReactionResult] = useState<ReactionResult | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [userName, setUserName] = useState('')
  const [hasJoined, setHasJoined] = useState(false)
  const [copied, setCopied] = useState(false)
  const [addChemicalCallback, setAddChemicalCallback] = useState<((chemical: any) => void) | null>(null)
  
  useEffect(() => {
    if (!roomCode) {
      router.push('/collaborate')
    }
  }, [roomCode, router])
  
  // Listen for incoming lab actions
  useEffect(() => {
    if (!socket) return

    const handleLabUpdate = (data: any) => {
        if (data.type === 'add_chemical') {
            const { glasswareId, chemical, amount, unit } = data
            // Apply to local table without triggering another broadcast
            labTableRef.current?.addChemicalExternal(glasswareId, chemical, amount, unit)
        }
    }

    socket.on('lab_update', handleLabUpdate)

    return () => {
        socket.off('lab_update', handleLabUpdate)
    }
  }, [socket])
  
  useEffect(() => {
    if (session?.experiment) {
      setCurrentExperiment(session.experiment)
      if (session.experiment.reactionResult) {
        setReactionResult(session.experiment.reactionResult)
      }
    }
  }, [session?.experiment])
  
  const handleJoin = async () => {
    if (userName.trim()) {
      await joinSession(userName)
      setHasJoined(true)
    }
  }
  
  const handleReaction = async (experiment: Experiment) => {
    setIsReacting(true)
    setCurrentExperiment(experiment)
    
    try {
      const response = await fetch('/api/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experiment)
      })
      
      if (response.ok) {
        const result = await response.json()
        setReactionResult(result)
        
        // Update shared experiment with reaction result
        await updateExperiment({
          ...experiment,
          reactionResult: result
        })
      }
    } catch (error) {
      console.error('Reaction failed:', error)
    } finally {
      setIsReacting(false)
    }
  }

  const handleChemicalAdded = useCallback((glasswareId: string, chemical: any, amount: number, unit: string) => {
    // Broadcast to others
    sendLabAction({
        type: 'add_chemical',
        glasswareId,
        chemical,
        amount,
        unit
    })
  }, [sendLabAction])
  
  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel bg-white/40 dark:bg-elixra-warm-gray/60 backdrop-blur-2xl border border-elixra-border-subtle rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-elixra-bunsen/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-elixra-bunsen/20">
              <Users className="h-8 w-8 text-elixra-bunsen" />
            </div>
            <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">
              Join Collaboration
            </h2>
            <p className="text-elixra-secondary">
              Room: <span className="font-mono font-bold">{roomCode}</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-elixra-secondary mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/60 dark:bg-white/5 border border-elixra-border-subtle rounded-xl focus:border-elixra-bunsen focus:ring-1 focus:ring-elixra-bunsen/50 transition-all text-elixra-charcoal dark:text-white placeholder-elixra-secondary"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleJoin}
              disabled={!userName.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Session
            </button>
            
            <Link
              href="/collaborate"
              className="block text-center text-sm text-elixra-secondary hover:text-elixra-bunsen transition-colors"
            >
              Back to Collaboration Hub
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }
  
  return (
    <div 
      className="h-screen bg-elixra-cream dark:bg-elixra-charcoal overflow-hidden flex flex-col transition-colors duration-300"
    >
      {/* Header */}
      <header className="bg-white/80 dark:bg-elixra-charcoal/80 backdrop-blur-xl border-b border-elixra-border-subtle z-40 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link
                  href="/collaborate"
                  className="p-2 rounded-lg hover:bg-white/10 text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white transition-colors"
                  title="Leave Session"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                
                <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-elixra-border-subtle">
                    <span className="text-xs font-bold text-elixra-secondary uppercase tracking-wider">Room</span>
                    <span className="font-mono font-bold text-elixra-charcoal dark:text-white">{roomCode}</span>
                    <button
                      onClick={copyRoomCode}
                      className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors"
                    >
                      {copied ? <CheckCircle className="h-3 w-3 text-elixra-success" /> : <Copy className="h-3 w-3 text-elixra-secondary" />}
                    </button>
                </div>
            </div>
            
            {/* Module Switcher */}
            <div className="flex bg-white/50 dark:bg-white/5 p-1 rounded-xl border border-elixra-border-subtle">
                {[
                    { id: 'lab', label: 'Virtual Lab', icon: Beaker },
                    { id: 'quiz', label: 'Quiz', icon: BrainCircuit },
                    { id: 'molecule', label: 'Molecules', icon: Atom }
                ].map(module => (
                    <button
                        key={module.id}
                        onClick={() => changeModule(module.id)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                            activeModule === module.id
                                ? 'bg-elixra-bunsen text-white shadow-md'
                                : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <module.icon className="h-4 w-4" />
                        {module.label}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                isConnected 
                  ? 'bg-elixra-success/10 border-elixra-success/20 text-elixra-success'
                  : 'bg-elixra-error/10 border-elixra-error/20 text-elixra-error'
              }`}>
                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </div>
              
              <div className="flex -space-x-2">
                {session?.participants.map((participant) => (
                  <div
                    key={participant.userId}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-elixra-charcoal flex items-center justify-center text-xs font-bold text-white shadow-sm tooltip-trigger relative group"
                    style={{ backgroundColor: participant.color }}
                  >
                    {participant.name.charAt(0)}
                    {/* Tooltip */}
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {participant.name} {participant.userId === userId && '(You)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
            {activeModule === 'lab' && (
                <motion.div 
                    key="lab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full overflow-y-auto lg:overflow-hidden p-4 lg:p-6"
                >
                    <div className="max-w-[1920px] mx-auto h-auto lg:h-full flex flex-col">
                        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full overflow-visible lg:overflow-hidden">
                          {/* Scrollable Shelf */}
                          <div className="w-full lg:w-72 flex-shrink-0 h-[400px] lg:h-full overflow-y-auto custom-scrollbar rounded-2xl bg-white/50 dark:bg-white/5 border border-elixra-border-subtle">
                            <ChemicalShelf 
                              onAddChemicalToTestTube={(chemical) => {
                                if (addChemicalCallback) {
                                  addChemicalCallback(chemical)
                                }
                              }}
                            />
                          </div>
                          
                          {/* Main Table */}
                          <div className="flex-1 min-h-[500px] h-auto lg:h-full overflow-visible lg:overflow-hidden">
                            <LabTable 
                              ref={labTableRef}
                              onReaction={handleReaction}
                              reactionResult={reactionResult}
                              isReacting={isReacting}
                              onAddChemicalToTestTube={setAddChemicalCallback}
                              onChemicalAdded={handleChemicalAdded}
                            />
                          </div>
                          
                          {/* Scrollable Results */}
                          <div className="w-full lg:w-80 flex-shrink-0 h-auto lg:h-full overflow-visible lg:overflow-y-auto custom-scrollbar rounded-2xl bg-white/50 dark:bg-white/5 border border-elixra-border-subtle">
                            <ReactionPanel 
                              experiment={currentExperiment}
                              result={reactionResult}
                              isLoading={isReacting}
                            />
                          </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeModule === 'quiz' && (
                <motion.div 
                    key="quiz"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full overflow-y-auto"
                >
                    <CollaborativeQuiz />
                </motion.div>
            )}

            {activeModule === 'molecule' && (
                <motion.div 
                    key="molecule"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full p-4"
                >
                    <CollaborativeMoleculeBuilder />
                </motion.div>
            )}
        </AnimatePresence>
      </main>
      
      {/* Collaboration Notifications */}
      <CollaborationNotifications session={session} userId={userId} />
    </div>
  )
}

export default function CollaborativeLabPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-elixra-bunsen border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-elixra-secondary">Loading collaboration...</p>
        </div>
      </div>
    }>
      <CollaborativeLabContent />
    </Suspense>
  )
}
