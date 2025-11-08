'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Atom, Plus, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

interface Atom {
  id: string
  element: string
  x: number
  y: number
  z: number
  color: string
}

interface Bond {
  id: string
  from: string
  to: string
  type: 'single' | 'double' | 'triple'
}

const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', color: '#FFFFFF' },
  { symbol: 'C', name: 'Carbon', color: '#909090' },
  { symbol: 'N', name: 'Nitrogen', color: '#3050F8' },
  { symbol: 'O', name: 'Oxygen', color: '#FF0D0D' },
  { symbol: 'S', name: 'Sulfur', color: '#FFFF30' },
  { symbol: 'P', name: 'Phosphorus', color: '#FF8000' },
  { symbol: 'Cl', name: 'Chlorine', color: '#1FF01F' },
  { symbol: 'Br', name: 'Bromine', color: '#A62929' },
]

const COMMON_MOLECULES = [
  {
    name: 'Water (H₂O)',
    formula: 'H₂O',
    atoms: [
      { id: '1', element: 'O', x: 0, y: 0, z: 0, color: '#FF0D0D' },
      { id: '2', element: 'H', x: -1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '3', element: 'H', x: 1, y: 1, z: 0, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
    ]
  },
  {
    name: 'Methane (CH₄)',
    formula: 'CH₄',
    atoms: [
      { id: '1', element: 'C', x: 0, y: 0, z: 0, color: '#909090' },
      { id: '2', element: 'H', x: 1, y: 1, z: 1, color: '#FFFFFF' },
      { id: '3', element: 'H', x: -1, y: -1, z: 1, color: '#FFFFFF' },
      { id: '4', element: 'H', x: -1, y: 1, z: -1, color: '#FFFFFF' },
      { id: '5', element: 'H', x: 1, y: -1, z: -1, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
      { id: 'b3', from: '1', to: '4', type: 'single' as const },
      { id: 'b4', from: '1', to: '5', type: 'single' as const },
    ]
  },
  {
    name: 'Carbon Dioxide (CO₂)',
    formula: 'CO₂',
    atoms: [
      { id: '1', element: 'C', x: 0, y: 0, z: 0, color: '#909090' },
      { id: '2', element: 'O', x: -2, y: 0, z: 0, color: '#FF0D0D' },
      { id: '3', element: 'O', x: 2, y: 0, z: 0, color: '#FF0D0D' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'double' as const },
      { id: 'b2', from: '1', to: '3', type: 'double' as const },
    ]
  },
  {
    name: 'Ammonia (NH₃)',
    formula: 'NH₃',
    atoms: [
      { id: '1', element: 'N', x: 0, y: 0, z: 0, color: '#3050F8' },
      { id: '2', element: 'H', x: 1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '3', element: 'H', x: -1, y: 1, z: 0, color: '#FFFFFF' },
      { id: '4', element: 'H', x: 0, y: -1, z: 1, color: '#FFFFFF' },
    ],
    bonds: [
      { id: 'b1', from: '1', to: '2', type: 'single' as const },
      { id: 'b2', from: '1', to: '3', type: 'single' as const },
      { id: 'b3', from: '1', to: '4', type: 'single' as const },
    ]
  },
]

export default function MoleculesPage() {
  const [atoms, setAtoms] = useState<Atom[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [selectedElement, setSelectedElement] = useState('C')
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [moleculeName, setMoleculeName] = useState('Custom Molecule')
  const [analysis, setAnalysis] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)
  
  const loadMolecule = (molecule: typeof COMMON_MOLECULES[0]) => {
    setAtoms(molecule.atoms)
    setBonds(molecule.bonds)
    setMoleculeName(molecule.name)
  }
  
  const addAtom = () => {
    const element = ELEMENTS.find(e => e.symbol === selectedElement)
    if (!element) return
    
    const newAtom: Atom = {
      id: `atom-${Date.now()}`,
      element: element.symbol,
      x: Math.random() * 4 - 2,
      y: Math.random() * 4 - 2,
      z: Math.random() * 4 - 2,
      color: element.color
    }
    setAtoms([...atoms, newAtom])
  }
  
  const removeAtom = (id: string) => {
    setAtoms(atoms.filter(a => a.id !== id))
    setBonds(bonds.filter(b => b.from !== id && b.to !== id))
  }
  
  const clearAll = () => {
    setAtoms([])
    setBonds([])
    setMoleculeName('Custom Molecule')
  }
  
  const getMolecularFormula = () => {
    const elementCounts: Record<string, number> = {}
    atoms.forEach(atom => {
      elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1
    })
    
    return Object.entries(elementCounts)
      .sort(([a], [b]) => {
        // C first, then H, then alphabetical
        if (a === 'C') return -1
        if (b === 'C') return 1
        if (a === 'H') return -1
        if (b === 'H') return 1
        return a.localeCompare(b)
      })
      .map(([element, count]) => `${element}${count > 1 ? count : ''}`)
      .join('')
  }
  
  const analyzeMolecule = async () => {
    if (atoms.length === 0) return
    
    setAnalyzing(true)
    try {
      const formula = getMolecularFormula()
      const response = await fetch('/api/molecules/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formula, atoms })
      })
      
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalyzing(false)
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Element Selector */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">
                Elements
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {ELEMENTS.map(element => (
                  <button
                    key={element.symbol}
                    onClick={() => setSelectedElement(element.symbol)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedElement === element.symbol
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: element.color }}
                    >
                      {element.symbol}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {element.name}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={addAtom}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Atom</span>
              </button>
            </div>
            
            {/* Common Molecules */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-4">
                Common Molecules
              </h2>
              <div className="space-y-2">
                {COMMON_MOLECULES.map(molecule => (
                  <button
                    key={molecule.name}
                    onClick={() => loadMolecule(molecule)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {molecule.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {molecule.formula}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              {/* Controls */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {moleculeName}
                  </h2>
                  {atoms.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {getMolecularFormula()}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {atoms.length > 0 && (
                    <button
                      onClick={analyzeMolecule}
                      disabled={analyzing}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {analyzing ? 'Analyzing...' : 'AI Analysis'}
                    </button>
                  )}
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setRotation({ x: 0, y: 0 })}
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* 3D Viewer */}
              <div 
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden"
                style={{ height: '500px' }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="-10 -10 20 20"
                  className="cursor-move"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) {
                      setRotation({
                        x: rotation.x + e.movementY * 0.5,
                        y: rotation.y + e.movementX * 0.5
                      })
                    }
                  }}
                >
                  <g transform={`scale(${zoom}) rotate(${rotation.y})`}>
                    {/* Bonds */}
                    {bonds.map(bond => {
                      const fromAtom = atoms.find(a => a.id === bond.from)
                      const toAtom = atoms.find(a => a.id === bond.to)
                      if (!fromAtom || !toAtom) return null
                      
                      return (
                        <line
                          key={bond.id}
                          x1={fromAtom.x}
                          y1={fromAtom.y}
                          x2={toAtom.x}
                          y2={toAtom.y}
                          stroke="#666"
                          strokeWidth={bond.type === 'triple' ? 0.3 : bond.type === 'double' ? 0.2 : 0.15}
                          className="dark:stroke-gray-400"
                        />
                      )
                    })}
                    
                    {/* Atoms */}
                    {atoms.map(atom => (
                      <g key={atom.id}>
                        <circle
                          cx={atom.x}
                          cy={atom.y}
                          r={0.8}
                          fill={atom.color}
                          stroke="#333"
                          strokeWidth={0.1}
                          className="cursor-pointer hover:opacity-80"
                          onClick={() => removeAtom(atom.id)}
                        />
                        <text
                          x={atom.x}
                          y={atom.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="0.6"
                          fill={atom.element === 'H' ? '#000' : '#fff'}
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {atom.element}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>
                
                {atoms.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Atom className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Add atoms or load a common molecule
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {atoms.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Atoms
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {bonds.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Bonds
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {new Set(atoms.map(a => a.element)).size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Elements
                  </div>
                </div>
              </div>
              
              {/* AI Analysis Results */}
              {analysis && (
                <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                    AI Analysis Results
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Name</h4>
                      <p className="text-gray-700 dark:text-gray-300">{analysis.commonName}</p>
                      {analysis.iupacName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">IUPAC: {analysis.iupacName}</p>
                      )}
                    </div>
                    
                    {analysis.properties && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Properties</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Geometry</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.properties.geometry}</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <div className="text-xs text-gray-600 dark:text-gray-400">Polarity</div>
                            <div className="font-medium text-gray-900 dark:text-white">{analysis.properties.polarity}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {analysis.uses && analysis.uses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Uses</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {analysis.uses.slice(0, 3).map((use: string, i: number) => (
                            <li key={i}>{use}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
