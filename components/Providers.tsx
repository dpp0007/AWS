'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CollabProvider } from '@/app/context/CollabContext'
import UsernameSetupModal from '@/components/UsernameSetupModal'
import CursorOverlay from '@/components/CursorOverlay'

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        <CollabProvider>
          {children}
          <CursorOverlay />
          <UsernameSetupModal />
        </CollabProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
