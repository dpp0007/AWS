'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Microscope, Activity, Waves, Atom as AtomIcon, BarChart3 } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

interface Spectrum {
  name: string
  type: string
  data: { x: number; y: number }[]
  peaks: { x: number; label: string }[]
  color: string
}

const SAMPLE_COMPOUNDS = [
  {
    name: 'Water (H₂O)',
    formula: 'H₂O',
    spectra: {
      uvVis: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 200 + i * 6,
          y: Math.random() * 20 + 5
        })),
        peaks: [],
        color: '#3B82F6'
      },
      ir: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 400 + i * 36,
          y: i === 30 ? 85 : i === 70 ? 90 : Math.random() * 30 + 10
        })),
        peaks: [
          { x: 1480, label: 'O-H bend' },
          { x: 2920, label: 'O-H stretch' }
        ],
        color: '#EF4444'
      },
      nmr: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i * 0.1,
          y: i === 50 ? 100 : Math.random() * 10
        })),
        peaks: [{ x: 4.8, label: 'H₂O' }],
        color: '#10B981'
      }
    }
  },
  {
    name: 'Ethanol (C₂H₅OH)',
    formula: 'C₂H₅OH',
    spectra: {
      uvVis: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 200 + i * 6,
          y: Math.random() * 25 + 5
        })),
        peaks: [],
        color: '#3B82F6'
      },
      ir: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 400 + i * 36,
          y: i === 25 ? 80 : i === 45 ? 85 : i === 75 ? 90 : Math.random() * 30 + 10
        })),
        peaks: [
          { x: 1300, label: 'C-O stretch' },
          { x: 2050, label: 'C-H stretch' },
          { x: 3100, label: 'O-H stretch' }
        ],
        color: '#EF4444'
      },
      nmr: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i * 0.1,
          y: i === 10 ? 100 : i === 35 ? 80 : i === 50 ? 60 : Math.random() * 10
        })),
        peaks: [
          { x: 1.2, label: 'CH₃' },
          { x: 3.7, label: 'CH₂' },
          { x: 5.3, label: 'OH' }
        ],
        color: '#10B981'
      }
    }
  },
  {
    name: 'Acetone (CH₃COCH₃)',
    formula: 'CH₃COCH₃',
    spectra: {
      uvVis: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 200 + i * 6,
          y: i === 40 ? 80 : Math.random() * 25 + 5
        })),
        peaks: [{ x: 280, label: 'n→π*' }],
        color: '#3B82F6'
      },
      ir: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: 400 + i * 36,
          y: i === 40 ? 95 : i === 70 ? 85 : Math.random() * 30 + 10
        })),
        peaks: [
          { x: 1715, label: 'C=O stretch' },
          { x: 2920, label: 'C-H stretch' }
        ],
        color: '#EF4444'
      },
      nmr: {
        data: Array.from({ length: 100 }, (_, i) => ({
          x: i * 0.1,
          y: i === 20 ? 100 : Math.random() * 10
        })),
        peaks: [{ x: 2.1, label: 'CH₃' }],
        color: '#10B981'
      }
    }
  }
]

const SPECTROSCOPY_TYPES = [
  {
    id: 'uv-vis',
    name: 'UV-Vis Spectroscopy',
    description: 'Measures absorption of ultraviolet and visible light',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    xLabel: 'Wavelength (nm)',
    yLabel: 'Absorbance'
  },
  {
    id: 'ir',
    name: 'IR Spectroscopy',
    description: 'Identifies functional groups via infrared absorption',
    icon: Waves,
    color: 'from-red-500 to-orange-500',
    xLabel: 'Wavenumber (cm⁻¹)',
    yLabel: 'Transmittance (%)'
  },
  {
    id: 'nmr',
    name: 'NMR Spectroscopy',
    description: 'Nuclear magnetic resonance for molecular structure',
    icon: AtomIcon,
    color: 'from-green-500 to-emerald-500',
    xLabel: 'Chemical Shift (ppm)',
    yLabel: 'Intensity'
  }
]

export default function SpectroscopyPage() {
  const [selectedCompound, setSelectedCompound] = useState(SAMPLE_COMPOUNDS[0])
  const [selectedType, setSelectedType] = useState('uv-vis')
  const [customCompound, setCustomCompound] = useState('')
  const [customFormula, setCustomFormula] = useState('')
  const [generating, setGenerating] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  
  const getSpectrumData = () => {
    switch (selectedType) {
      case 'uv-vis':
        return selectedCompound.spectra.uvVis
      case 'ir':
        return selectedCompound.spectra.ir
      case 'nmr':
        return selectedCompound.spectra.nmr
      default:
        return selectedCompound.spectra.uvVis
    }
  }
  
  const spectrum = getSpectrumData()
  const spectType = SPECTROSCOPY_TYPES.find(t => t.id === selectedType)!
  
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
            {/* Spectroscopy Type */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Analysis Type
              </h2>
              <div className="space-y-2">
                {SPECTROSCOPY_TYPES.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedType === type.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${type.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {type.name.split(' ')[0]}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {type.name.split(' ').slice(1).join(' ')}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Sample Selection */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Sample
              </h2>
              <div className="space-y-2">
                {SAMPLE_COMPOUNDS.map(compound => (
                  <button
                    key={compound.name}
                    onClick={() => {
                      setSelectedCompound(compound)
                      setShowCustomInput(false)
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedCompound.name === compound.name && !showCustomInput
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {compound.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {compound.formula}
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {showCustomInput ? 'Hide Custom' : 'Analyze Custom Compound'}
              </button>
              
              {showCustomInput && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Compound name (e.g., Benzene)"
                    value={customCompound}
                    onChange={(e) => setCustomCompound(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Formula (e.g., C₆H₆)"
                    value={customFormula}
                    onChange={(e) => setCustomFormula(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <button
                    onClick={async () => {
                      if (!customCompound || !customFormula) return
                      setGenerating(true)
                      try {
                        const response = await fetch('/api/spectroscopy/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            compound: customCompound, 
                            formula: customFormula 
                          })
                        })
                        const result = await response.json()
                        if (result.success && result.data) {
                          // Convert AI data to our format
                          const aiData = result.data
                          const newCompound = {
                            name: customCompound,
                            formula: customFormula,
                            spectra: {
                              uvVis: {
                                data: Array.from({ length: 100 }, (_, i) => ({
                                  x: 200 + i * 6,
                                  y: Math.random() * 30 + 10
                                })),
                                peaks: aiData.uvVis?.peaks?.map((p: any) => ({
                                  x: p.wavelength,
                                  label: p.label
                                })) || [],
                                color: '#3B82F6'
                              },
                              ir: {
                                data: Array.from({ length: 100 }, (_, i) => ({
                                  x: 400 + i * 36,
                                  y: Math.random() * 40 + 10
                                })),
                                peaks: aiData.ir?.peaks?.map((p: any) => ({
                                  x: p.wavenumber,
                                  label: p.label
                                })) || [],
                                color: '#EF4444'
                              },
                              nmr: {
                                data: Array.from({ length: 100 }, (_, i) => ({
                                  x: i * 0.1,
                                  y: Math.random() * 20
                                })),
                                peaks: aiData.nmr?.peaks?.map((p: any) => ({
                                  x: p.shift,
                                  label: p.label
                                })) || [],
                                color: '#10B981'
                              }
                            }
                          }
                          
                          // Add to compounds list and select it
                          SAMPLE_COMPOUNDS.push(newCompound)
                          setSelectedCompound(newCompound)
                          setShowCustomInput(false)
                          setCustomCompound('')
                          setCustomFormula('')
                        } else {
                          alert('Failed to generate spectra. Please try again.')
                        }
                      } catch (error) {
                        console.error('Generation failed:', error)
                        alert('Error generating spectra. Please check your input and try again.')
                      } finally {
                        setGenerating(false)
                      }
                    }}
                    disabled={generating || !customCompound || !customFormula}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {generating ? 'Generating AI Data...' : 'Generate Spectra'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Main Viewer */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
              {/* Info */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {spectType.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {spectType.description}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sample: </span>
                    <span className="font-bold text-purple-600">{selectedCompound.name}</span>
                  </div>
                  <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Formula: </span>
                    <span className="font-mono font-bold text-blue-600">{selectedCompound.formula}</span>
                  </div>
                </div>
              </div>
              
              {/* Spectrum Display */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 mb-6">
                <svg
                  width="100%"
                  height="400"
                  viewBox="0 0 800 400"
                  className="bg-white dark:bg-gray-900 rounded-lg"
                >
                  {/* Grid */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <line
                        x1={80}
                        y1={40 + i * 32}
                        x2={760}
                        y2={40 + i * 32}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        className="dark:stroke-gray-700"
                      />
                      <line
                        x1={80 + i * 68}
                        y1={40}
                        x2={80 + i * 68}
                        y2={360}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        className="dark:stroke-gray-700"
                      />
                    </g>
                  ))}
                  
                  {/* Axes */}
                  <line x1={80} y1={360} x2={760} y2={360} stroke="#374151" strokeWidth="2" />
                  <line x1={80} y1={40} x2={80} y2={360} stroke="#374151" strokeWidth="2" />
                  
                  {/* Spectrum Line */}
                  <path
                    d={spectrum.data.map((point, i) => {
                      const x = 80 + (i / spectrum.data.length) * 680
                      const y = 360 - (point.y / 100) * 320
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                    }).join(' ')}
                    fill="none"
                    stroke={spectrum.color}
                    strokeWidth="3"
                  />
                  
                  {/* Peak Labels */}
                  {spectrum.peaks.map((peak, i) => {
                    const xPos = 80 + (peak.x / (spectrum.data[spectrum.data.length - 1]?.x || 10)) * 680
                    return (
                      <g key={i}>
                        <line
                          x1={xPos}
                          y1={40}
                          x2={xPos}
                          y2={360}
                          stroke={spectrum.color}
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.5"
                        />
                        <text
                          x={xPos}
                          y={30}
                          textAnchor="middle"
                          fontSize="12"
                          fill={spectrum.color}
                          fontWeight="bold"
                        >
                          {peak.label}
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Labels */}
                  <text
                    x={420}
                    y={390}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#6B7280"
                    className="dark:fill-gray-400"
                  >
                    {spectType.xLabel}
                  </text>
                  <text
                    x={30}
                    y={200}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#6B7280"
                    transform="rotate(-90 30 200)"
                    className="dark:fill-gray-400"
                  >
                    {spectType.yLabel}
                  </text>
                </svg>
              </div>
              
              {/* Peak Information */}
              {spectrum.peaks.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Identified Peaks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {spectrum.peaks.map((peak, i) => (
                      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">
                            {peak.x} {spectType.xLabel.match(/\(([^)]+)\)/)?.[1]}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {peak.label}
                          </span>
                        </div>
                      </div>
                    ))}
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
