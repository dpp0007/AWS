import { useState, useEffect, useCallback, useMemo } from 'react'
import { useCollab } from '@/app/context/CollabContext'

export interface Participant {
  userId: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  isActive: boolean
}

export interface CollaborationSession {
  roomCode: string
  hostId: string
  participants: Participant[]
  experiment: any
  isActive: boolean
}

export function useCollaboration(roomCode: string | null) {
  const { 
    socket, 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    updateCursor: socketUpdateCursor, 
    sendLabAction,
    currentUser,
    otherUsers,
    activeModule
  } = useCollab()

  // Map Socket users to legacy Participant interface
  const participants = useMemo(() => {
    const list: Participant[] = []
    
    if (currentUser) {
        list.push({
            userId: currentUser.sid,
            name: currentUser.name,
            color: currentUser.color,
            cursor: currentUser.cursor,
            isActive: true
        })
    }
    
    otherUsers.forEach(u => {
        list.push({
            userId: u.sid,
            name: u.name,
            color: u.color,
            cursor: u.cursor,
            isActive: true
        })
    })
    
    return list
  }, [currentUser, otherUsers])

  // Mock session object for compatibility
  const session: CollaborationSession | null = useMemo(() => {
    if (!roomCode) return null
    return {
        roomCode,
        hostId: 'host', // Todo: Implement host logic
        participants,
        experiment: null, // Todo: Sync experiment state
        isActive: true
    }
  }, [roomCode, participants])

  const joinSession = useCallback(async (userName: string) => {
    if (roomCode) {
        joinRoom(roomCode, userName)
    }
  }, [roomCode, joinRoom])

  const updateCursor = useCallback((x: number, y: number) => {
    socketUpdateCursor(x/100, y/100) // Convert 0-100% back to 0-1
  }, [socketUpdateCursor])

  const updateExperiment = useCallback(async (experiment: any) => {
    sendLabAction({ type: 'experiment_update', experiment })
  }, [sendLabAction])

  const leaveSession = useCallback(async () => {
    leaveRoom()
  }, [leaveRoom])

  // Cleanup on unmount handled by CollabContext provider usually, 
  // but if this hook is used per-page, we might want to leaveRoom on unmount
  // However, maintaining connection across pages is better.
  
  return {
    session,
    isConnected,
    error: isConnected ? null : (socket ? 'Connecting...' : 'Disconnected'),
    userId: currentUser?.sid || '',
    joinSession,
    updateCursor,
    updateExperiment,
    leaveSession
  }
}
