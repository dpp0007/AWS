
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useRouter } from 'next/navigation'

interface User {
  sid: string
  name: string
  color: string
  cursor: { x: number; y: number }
  joined_at: number
}

interface RoomState {
  users: Record<string, User>
  active_module: string
  lab_state: any
  quiz_state: any
  molecule_state: any
}

interface CollabContextType {
  socket: Socket | null
  isConnected: boolean
  roomId: string | null
  currentUser: User | null
  otherUsers: User[]
  joinRoom: (roomId: string, name: string) => void
  leaveRoom: () => void
  updateCursor: (x: number, y: number) => void
  changeModule: (module: string) => void
  sendLabAction: (action: any) => void
  sendQuizAction: (type: string, payload: any) => void
  sendMoleculeAction: (type: string, structure: any) => void
  activeModule: string
  quizState: any
  moleculeState: any
}

const CollabContext = createContext<CollabContextType | undefined>(undefined)

export function CollabProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<Record<string, User>>({})
  const [activeModule, setActiveModule] = useState<string>('lab')
  
  // State for modules
  const [quizState, setQuizState] = useState<any>(null)
  const [moleculeState, setMoleculeState] = useState<any>(null)
  
  // Throttle cursor updates
  const lastCursorUpdate = useRef(0)

  useEffect(() => {
    // Initialize Socket.io connection
    const socketInstance = io('http://localhost:8000', {
      transports: ['websocket', 'polling'], // Fallback to polling
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to Collab Server', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from Collab Server')
      setIsConnected(false)
    })

    socketInstance.on('room_state', (state: RoomState) => {
      console.log('📦 Received Room State:', state)
      if (state) {
        setUsers(state.users)
        setActiveModule(state.active_module)
        setQuizState(state.quiz_state)
        setMoleculeState(state.molecule_state)
      }
    })

    socketInstance.on('user_joined', (user: User) => {
      console.log('👋 User Joined:', user)
      setUsers(prev => ({ ...prev, [user.sid]: user }))
    })

    socketInstance.on('user_left', ({ sid }: { sid: string }) => {
      console.log('👋 User Left:', sid)
      setUsers(prev => {
        const newUsers = { ...prev }
        delete newUsers[sid]
        return newUsers
      })
    })

    socketInstance.on('cursor_update', ({ sid, x, y }: { sid: string, x: number, y: number }) => {
      setUsers(prev => {
        if (!prev[sid]) return prev
        return {
          ...prev,
          [sid]: {
            ...prev[sid],
            cursor: { x, y }
          }
        }
      })
    })

    socketInstance.on('module_changed', ({ module, by }: { module: string, by: string }) => {
      console.log('🔄 Module Changed to:', module, 'by', by)
      setActiveModule(module)
    })
    
    socketInstance.on('quiz_update', (data: any) => {
        console.log('📝 Quiz Update:', data)
        setQuizState((prev: any) => {
            if (data.type === 'start') return data.state
            if (data.type === 'next_question') return { ...prev, current_question: data.index }
            if (data.type === 'user_answered') {
                const newAnswers = { ...(prev?.answers || {}) }
                if (!newAnswers[data.question_index]) newAnswers[data.question_index] = {}
                newAnswers[data.question_index][data.sid] = true // Mark as answered
                return { ...prev, answers: newAnswers }
            }
            return prev
        })
    })

    socketInstance.on('molecule_update', ({ structure, by }: { structure: any, by: string }) => {
        console.log('⚛️ Molecule Updated by', by)
        setMoleculeState(structure)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const joinRoom = useCallback((newRoomId: string, name: string) => {
    if (socket) {
      socket.emit('join_room', { room_id: newRoomId, name })
      setRoomId(newRoomId)
      // Optimistic user set? We wait for room_state usually, but can set partial
    }
  }, [socket])

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect() // Or specific leave event
      socket.connect() // Reconnect fresh
      setRoomId(null)
      setUsers({})
    }
  }, [socket])

  const updateCursor = useCallback((x: number, y: number) => {
    if (socket && roomId) {
      const now = Date.now()
      if (now - lastCursorUpdate.current > 30) { // 30ms throttle (~30fps)
        socket.emit('cursor_move', { room_id: roomId, x, y })
        lastCursorUpdate.current = now
      }
    }
  }, [socket, roomId])

  const changeModule = useCallback((module: string) => {
    if (socket && roomId) {
      socket.emit('module_change', { room_id: roomId, module })
      setActiveModule(module)
    }
  }, [socket, roomId])

  const sendLabAction = useCallback((action: any) => {
    if (socket && roomId) {
      socket.emit('lab_action', { room_id: roomId, ...action })
    }
  }, [socket, roomId])
  
  const sendQuizAction = useCallback((type: string, payload: any) => {
    if (socket && roomId) {
        socket.emit('quiz_action', { room_id: roomId, type, payload })
    }
  }, [socket, roomId])

  const sendMoleculeAction = useCallback((type: string, structure: any) => {
    if (socket && roomId) {
        socket.emit('molecule_action', { room_id: roomId, type, structure })
        // Optimistic update
        setMoleculeState(structure)
    }
  }, [socket, roomId])

  const otherUsers = Object.values(users).filter(u => u.sid !== socket?.id)

  return (
    <CollabContext.Provider value={{
      socket,
      isConnected,
      roomId,
      currentUser,
      otherUsers,
      joinRoom,
      leaveRoom,
      updateCursor,
      changeModule,
      sendLabAction,
      sendQuizAction,
      sendMoleculeAction,
      activeModule,
      quizState,
      moleculeState
    }}>
      {children}
    </CollabContext.Provider>
  )
}

export function useCollab() {
  const context = useContext(CollabContext)
  if (context === undefined) {
    throw new Error('useCollab must be used within a CollabProvider')
  }
  return context
}
