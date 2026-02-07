
'use client'

import React, { useEffect } from 'react'
import { useCollab } from '@/app/context/CollabContext'
import { MousePointer2 } from 'lucide-react'

export default function CursorOverlay() {
  const { isConnected, roomId, otherUsers, updateCursor } = useCollab()

  useEffect(() => {
    if (!isConnected || !roomId) return

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY

      if (e instanceof MouseEvent) {
          clientX = e.clientX
          clientY = e.clientY
      } else if (e instanceof TouchEvent && e.touches.length > 0) {
          clientX = e.touches[0].clientX
          clientY = e.touches[0].clientY
      } else {
          return
      }
      
      const x = clientX / window.innerWidth
      const y = clientY / window.innerHeight
      
      updateCursor(x, y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleMouseMove)
    return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('touchmove', handleMouseMove)
    }
  }, [isConnected, roomId, updateCursor])

  if (!isConnected || !roomId) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {otherUsers.map((user) => {
        if (!user.cursor) return null
        
        // Convert normalized coordinates back to pixels
        const left = user.cursor.x * window.innerWidth
        const top = user.cursor.y * window.innerHeight
        
        return (
          <div
            key={user.sid}
            className="absolute transition-all duration-100 ease-linear flex flex-col items-start"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              // Add a slight offset so the cursor tip matches the coordinate
              transform: 'translate(-2px, -2px)' 
            }}
          >
            <MousePointer2 
              className="h-6 w-6 fill-current drop-shadow-md" 
              style={{ color: user.color }}
            />
            <div 
              className="ml-4 -mt-4 px-2 py-1 rounded-full text-xs font-bold text-white shadow-md backdrop-blur-sm"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
