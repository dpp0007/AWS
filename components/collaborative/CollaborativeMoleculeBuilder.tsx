
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Atom as AtomIcon } from 'lucide-react'
import { useCollab } from '@/app/context/CollabContext'
import dynamic from 'next/dynamic'
import { Atom, Bond } from '@/types/molecule'
import { PERIODIC_TABLE } from '@/lib/periodicTable'
import MoleculeDropZone from '@/components/MoleculeDropZone'
import AtomBondDialog from '@/components/AtomBondDialog'
import { calculateBonds, canFormBond } from '@/lib/bondingLogic'

const EnhancedMolecule3DViewer = dynamic(() => import('@/components/EnhancedMolecule3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-elixra-charcoal/10 dark:bg-white/10 animate-pulse rounded-lg flex items-center justify-center text-elixra-secondary">
      Loading 3D Viewer...
    </div>
  )
})

export default function CollaborativeMoleculeBuilder() {
  const { moleculeState, sendMoleculeAction, currentUser, otherUsers } = useCollab()
  
  // Local UI state
  const [selectedAtomId, setSelectedAtomId] = useState<string | null>(null)
  const [selectedBondId, setSelectedBondId] = useState<string | null>(null)
  const [showBondDialog, setShowBondDialog] = useState(false)
  const [pendingDropElement, setPendingDropElement] = useState<any>(null)
  const [pendingDropPosition, setPendingDropPosition] = useState<any>(null)
  
  const atoms: Atom[] = moleculeState?.atoms || []
  const bonds: Bond[] = moleculeState?.bonds || []

  // Sync helpers
  const updateStructure = (newAtoms: Atom[], newBonds: Bond[]) => {
    sendMoleculeAction('update_structure', { atoms: newAtoms, bonds: newBonds })
  }

  const addAtom = useCallback((element: any, position?: any, bondsToCreate?: any) => {
    // Basic positioning logic (simplified from full page)
    let finalPosition = position || { x: 0, y: 0, z: 0 }
    
    if (!position && atoms.length > 0) {
        // Random offset if no position
        finalPosition = {
            x: Math.random() * 4 - 2,
            y: Math.random() * 4 - 2,
            z: Math.random() * 4 - 2
        }
    }

    const newAtom: Atom = {
      id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      element: element.symbol,
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z,
      color: element.color
    }

    const updatedAtoms = [...atoms, newAtom]
    let updatedBonds = [...bonds]

    if (bondsToCreate) {
        // ... bonding logic
    } else {
        // Auto bond
        const newCalculatedBonds = calculateBonds(updatedAtoms)
        updatedBonds = newCalculatedBonds
    }

    updateStructure(updatedAtoms, updatedBonds)
  }, [atoms, bonds, sendMoleculeAction])

  const removeAtom = useCallback((id: string) => {
    const updatedAtoms = atoms.filter(a => a.id !== id)
    const updatedBonds = bonds.filter(b => b.from !== id && b.to !== id)
    updateStructure(updatedAtoms, updatedBonds)
    setSelectedAtomId(null)
  }, [atoms, bonds, sendMoleculeAction])

  return (
    <div className="h-full flex flex-col relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="glass-panel bg-white/80 dark:bg-black/50 backdrop-blur-md p-2 rounded-xl border border-elixra-border-subtle flex gap-2">
            {PERIODIC_TABLE.slice(0, 5).map(el => (
                <button
                    key={el.symbol}
                    onClick={() => addAtom(el)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: el.color }}
                    title={`Add ${el.name}`}
                >
                    {el.symbol}
                </button>
            ))}
            <button 
                className="w-10 h-10 rounded-lg bg-elixra-bunsen/10 border border-elixra-bunsen/30 flex items-center justify-center text-elixra-bunsen hover:bg-elixra-bunsen hover:text-white transition-colors"
                title="More Elements (Not implemented in demo)"
            >
                <Plus className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 bg-gradient-to-b from-transparent to-black/5 rounded-3xl overflow-hidden relative border border-elixra-border-subtle">
        <MoleculeDropZone onDrop={(el, pos) => addAtom(el, pos)}>
            <EnhancedMolecule3DViewer
                atoms={atoms}
                bonds={bonds}
                onSelectAtom={setSelectedAtomId}
                onSelectBond={setSelectedBondId}
                selectedAtomId={selectedAtomId}
                selectedBondId={selectedBondId}
                onCanvasClick={() => { setSelectedAtomId(null); setSelectedBondId(null) }}
            />
        </MoleculeDropZone>
        
        {/* Empty State */}
        {atoms.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-elixra-secondary">
                    <AtomIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Drag elements here or click toolbar to build</p>
                </div>
            </div>
        )}
      </div>

      {/* Selected Item Controls */}
      <AnimatePresence>
        {(selectedAtomId) && (
            <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 glass-panel bg-white/90 dark:bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-elixra-border-subtle shadow-xl flex gap-4 items-center"
            >
                <div className="text-sm font-bold text-elixra-charcoal dark:text-white">
                    {atoms.find(a => a.id === selectedAtomId)?.element}
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <button
                    onClick={() => removeAtom(selectedAtomId!)}
                    className="p-2 bg-elixra-error/10 text-elixra-error hover:bg-elixra-error hover:text-white rounded-lg transition-colors"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
