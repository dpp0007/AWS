'use client'

import React, { useState } from 'react'
import { SpectrumData, Sample, SpectroscopyType } from '@/types/spectroscopy'
import { Copy, X } from 'lucide-react'

interface SpectrumComparisonProps {
  currentSpectrum: SpectrumData
  currentSample: Sample
  allSamples: Sample[]
  spectroscopyType: SpectroscopyType
  onComparisonChange?: (spectrum2: SpectrumData | null) => void
  onModeChange?: (mode: 'side-by-side' | 'overlay') => void
}

export default function SpectrumComparison({
  currentSpectrum,
  currentSample,
  allSamples,
  spectroscopyType,
  onComparisonChange,
  onModeChange,
}: SpectrumComparisonProps) {
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>(
    'side-by-side'
  )
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)

  // Get available samples for comparison (must have the same spectroscopy type)
  const availableSamples = allSamples.filter(
    (s) =>
      s.id !== currentSample.id &&
      s.spectra[spectroscopyType] !== undefined
  )

  const handleSelectSample = (sample: Sample) => {
    setSelectedSample(sample)
    const spectrum2 = sample.spectra[spectroscopyType]
    if (spectrum2) {
      onComparisonChange?.(spectrum2)
    }
  }

  const handleModeChange = (mode: 'side-by-side' | 'overlay') => {
    setComparisonMode(mode)
    onModeChange?.(mode)
  }

  const handleClearComparison = () => {
    setIsComparing(false)
    setSelectedSample(null)
    onComparisonChange?.(null)
  }

  if (!isComparing) {
    return (
      <button
        onClick={() => setIsComparing(true)}
        className="w-full btn-primary shadow-lg flex items-center justify-center gap-2"
      >
        <Copy className="h-5 w-5" />
        Compare Spectra
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl border border-elixra-border dark:border-white/20 rounded-2xl p-6 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-elixra-charcoal dark:text-white flex items-center gap-2">
          <Copy className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          Compare Spectra
        </h3>
        <button
          onClick={handleClearComparison}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-elixra-secondary dark:text-gray-400" />
        </button>
      </div>

      {/* Mode Selection */}
      <div>
        <div className="text-xs text-elixra-secondary dark:text-gray-400 uppercase tracking-wide mb-2">
          Display Mode
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('side-by-side')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
              comparisonMode === 'side-by-side'
                ? 'bg-elixra-bunsen text-white shadow-md'
                : 'bg-white/50 dark:bg-white/10 text-elixra-charcoal dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => handleModeChange('overlay')}
            className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
              comparisonMode === 'overlay'
                ? 'bg-elixra-bunsen text-white shadow-md'
                : 'bg-white/50 dark:bg-white/10 text-elixra-charcoal dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/20'
            }`}
          >
            Overlay
          </button>
        </div>
      </div>

      {/* Sample Selection */}
      <div>
        <div className="text-xs text-elixra-secondary dark:text-gray-400 uppercase tracking-wide mb-2">
          Select Sample to Compare
        </div>
        {availableSamples.length === 0 ? (
          <div className="text-sm text-elixra-secondary dark:text-gray-400 p-4 bg-white/50 dark:bg-white/5 rounded-lg border border-elixra-border dark:border-white/10">
            No other samples available for {spectroscopyType.toUpperCase()} spectroscopy.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {availableSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedSample?.id === sample.id
                    ? 'border-orange-500 bg-orange-500/10 dark:bg-orange-500/20'
                    : 'border-transparent bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                }`}
              >
                <div className={`font-semibold text-sm ${selectedSample?.id === sample.id ? 'text-orange-700 dark:text-orange-300' : 'text-elixra-charcoal dark:text-white'}`}>
                  {sample.name}
                </div>
                <div className="text-xs text-elixra-secondary font-mono">
                  {sample.formula}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Selection Info */}
      {selectedSample && (
        <div className="bg-white/50 dark:bg-white/5 rounded-lg p-4 border border-elixra-border dark:border-white/10">
          <div className="text-xs text-elixra-secondary dark:text-gray-400 uppercase tracking-wide mb-2">
            Comparison Setup
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-elixra-secondary dark:text-gray-300">Spectrum 1:</span>
              <span className="text-elixra-bunsen-dark dark:text-elixra-bunsen-light font-semibold">{currentSample.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-elixra-secondary dark:text-gray-300">Spectrum 2:</span>
              <span className="text-orange-600 dark:text-orange-300 font-semibold">{selectedSample.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-elixra-secondary dark:text-gray-300">Mode:</span>
              <span className="text-elixra-charcoal dark:text-white font-semibold capitalize">
                {comparisonMode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3">
        <div className="text-xs text-blue-700 dark:text-blue-200">
          💡 Comparing spectra helps identify similarities and differences between molecules.
          Look for peaks that appear in one spectrum but not the other.
        </div>
      </div>
    </div>
  )
}
