
import React from 'react'

interface OrbitalDiagramProps {
  transitionType: string
}

export default function OrbitalDiagram({ transitionType }: OrbitalDiagramProps) {
  const isPiPi = transitionType.toLowerCase().includes('π→π') || transitionType.toLowerCase().includes('pi-pi')
  const isNPi = transitionType.toLowerCase().includes('n→π') || transitionType.toLowerCase().includes('n-pi')
  
  if (!isPiPi && !isNPi) return null

  return (
    <div className="bg-elixra-charcoal/50 rounded-lg p-4 border border-white/10 flex flex-col items-center">
      <div className="text-xs text-elixra-secondary mb-2 uppercase tracking-wide">
        Energy Diagram: {isPiPi ? 'π → π*' : 'n → π*'}
      </div>
      
      <svg width="120" height="100" viewBox="0 0 120 100" className="overflow-visible">
        {/* Y Axis (Energy) */}
        <line x1="10" y1="90" x2="10" y2="10" stroke="#9CA3AF" strokeWidth="1" markerEnd="url(#arrow)" />
        <text x="0" y="50" transform="rotate(-90 0,50)" fill="#9CA3AF" fontSize="10">Energy</text>
        
        {/* Levels */}
        {isPiPi ? (
          <>
            {/* Pi Level (HOMO) */}
            <line x1="30" y1="70" x2="90" y2="70" stroke="#2E6B6B" strokeWidth="2" />
            <text x="100" y="73" fill="#2E6B6B" fontSize="10">π (HOMO)</text>
            <circle cx="50" cy="70" r="3" fill="#F5F1E8" />
            <circle cx="70" cy="70" r="3" fill="#F5F1E8" />
            
            {/* Pi* Level (LUMO) */}
            <line x1="30" y1="30" x2="90" y2="30" stroke="#C97B49" strokeWidth="2" strokeDasharray="4 2" />
            <text x="100" y="33" fill="#C97B49" fontSize="10">π* (LUMO)</text>
            
            {/* Arrow */}
            <line x1="60" y1="65" x2="60" y2="35" stroke="#F5F1E8" strokeWidth="1.5" markerEnd="url(#arrow-white)" strokeDasharray="2 2" />
          </>
        ) : (
          <>
            {/* n Level (HOMO) */}
            <line x1="30" y1="60" x2="90" y2="60" stroke="#2E6B6B" strokeWidth="2" />
            <text x="100" y="63" fill="#2E6B6B" fontSize="10">n (HOMO)</text>
            <circle cx="60" cy="60" r="3" fill="#F5F1E8" />
            
            {/* Pi* Level (LUMO) */}
            <line x1="30" y1="30" x2="90" y2="30" stroke="#C97B49" strokeWidth="2" strokeDasharray="4 2" />
            <text x="100" y="33" fill="#C97B49" fontSize="10">π* (LUMO)</text>
            
            {/* Arrow */}
            <line x1="60" y1="55" x2="60" y2="35" stroke="#F5F1E8" strokeWidth="1.5" markerEnd="url(#arrow-white)" strokeDasharray="2 2" />
          </>
        )}

        {/* Definitions */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#9CA3AF" />
          </marker>
          <marker id="arrow-white" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#F5F1E8" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}
