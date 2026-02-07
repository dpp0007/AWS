'use client'

import { useState, useCallback } from 'react'
import { Activity, Waves, Atom as AtomIcon, Plus, AlertCircle, Loader2 } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import SpectrumGraph from '@/components/SpectrumGraph'
import SpectrumExplanation from '@/components/SpectrumExplanation'
import SpectrumMoleculeLinker from '@/components/SpectrumMoleculeLinker'
import SpectrumComparison from '@/components/SpectrumComparison'
import { Peak, Sample, SpectroscopyType } from '@/types/spectroscopy'
import { getAllSamples } from '@/lib/spectrumData'
import { formatSpectrumForDisplay } from '@/lib/spectrumHandlers'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'
import Toast, { ToastMessage } from '@/components/Toast'

const SPECTROSCOPY_TYPES = [
  {
    id: 'uv-vis' as SpectroscopyType,
    name: 'UV-Vis Spectroscopy',
    description: 'Measures absorption of ultraviolet and visible light',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'ir' as SpectroscopyType,
    name: 'IR Spectroscopy',
    description: 'Identifies functional groups via infrared absorption',
    icon: Waves,
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 'nmr' as SpectroscopyType,
    name: 'NMR Spectroscopy',
    description: 'Nuclear magnetic resonance for molecular structure',
    icon: AtomIcon,
    color: 'from-green-500 to-emerald-500',
  },
]

// Helper function to get spectrum
function getSpectrum(sampleId: string, type: SpectroscopyType) {
  const allSamples = getAllSamples()
  const sample = allSamples.find(s => s.id === sampleId)
  if (!sample) return null
  return sample.spectra[type]
}

// Helper function to get sample
function getSample(sampleId: string) {
  const allSamples = getAllSamples()
  return allSamples.find(s => s.id === sampleId)
}

export default function SpectroscopyPage() {
  const allSamples = getAllSamples()
  const [selectedSampleId, setSelectedSampleId] = useState('water')
  const [selectedType, setSelectedType] = useState<SpectroscopyType>('uv-vis')
  const [selectedPeak, setSelectedPeak] = useState<Peak | null>(null)
  const [useCustom, setUseCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customFormula, setCustomFormula] = useState('')
  const [customSamples, setCustomSamples] = useState<Sample[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  
  // Comparison State
  const [comparisonSpectrum, setComparisonSpectrum] = useState<any | null>(null)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side')

  const selectedSample = useCustom 
    ? customSamples.find(s => s.id === selectedSampleId)
    : getSample(selectedSampleId)
  
  const spectrum = selectedSample ? (useCustom ? selectedSample.spectra[selectedType] : getSpectrum(selectedSample.id, selectedType)) : null
  const formattedSpectrum = spectrum ? formatSpectrumForDisplay(spectrum) : null
  const spectType = SPECTROSCOPY_TYPES.find((t) => t.id === selectedType)!

  const addToast = useCallback((type: 'success' | 'warning' | 'error' | 'info', title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, type, title, message, duration }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleAddCustom = async () => {
    if (!customName || !customFormula) return
    
    setIsGenerating(true)
    const tempId = `custom-generating-${Date.now()}`
    
    // Create a temporary placeholder
    const placeholderSample: Sample = {
      id: tempId,
      name: customName,
      formula: customFormula,
      spectra: {
        'uv-vis': { type: 'uv-vis', sampleName: customName, xMin: 200, xMax: 800, yMin: 0, yMax: 2.5, xLabel: 'Wavelength (nm)', yLabel: 'Absorbance', peaks: [] },
        'ir': { type: 'ir', sampleName: customName, xMin: 400, xMax: 4000, yMin: 0, yMax: 100, xLabel: 'Wavenumber (cm⁻¹)', yLabel: 'Transmittance (%)', xInverted: true, peaks: [] },
        'nmr': { type: 'nmr', sampleName: customName, xMin: 0, xMax: 10, yMin: 0, yMax: 100, xLabel: 'Chemical Shift (ppm)', yLabel: 'Intensity', peaks: [] }
      }
    }
    
    // Optimistically add to UI
    setCustomSamples(prev => [...prev, placeholderSample])
    setSelectedSampleId(tempId)
    setUseCustom(true)
    
    try {
      const response = await fetch('/api/spectroscopy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compound: customName,
          formula: customFormula,
          techniques: ["uv-vis", "ir", "nmr"]
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate data')
      }
      
      const data = result.data

      // Transform API data to frontend format
      const newSample: Sample = {
        id: `custom-${Date.now()}`,
        name: data.compound,
        formula: data.formula,
        spectra: {
          'uv-vis': {
            type: 'uv-vis',
            sampleName: data.compound,
            xMin: 200, xMax: 800, yMin: 0, yMax: 2.5,
            xLabel: 'Wavelength (nm)', yLabel: 'Absorbance',
            peaks: (data.uvVis?.peaks || []).map((p: any) => ({
              id: `uv-${Math.random().toString(36).substr(2, 9)}`,
              x: Number(p.wavelength),
              y: Number(p.absorbance || (p.intensity === 'strong' ? 2.0 : 1.0)),
              label: p.label || '',
              interpretation: p.assignment || '',
              transitionType: p.label
            }))
          },
          'ir': {
            type: 'ir',
            sampleName: data.compound,
            xMin: 400, xMax: 4000, yMin: 0, yMax: 100, xLabel: 'Wavenumber (cm⁻¹)', yLabel: 'Transmittance (%)',
            xInverted: true,
            peaks: (data.ir?.peaks || []).map((p: any) => ({
              id: `ir-${Math.random().toString(36).substr(2, 9)}`,
              x: Number(p.wavenumber),
              y: Number(p.transmittance || (p.intensity === 'strong' ? 10 : p.intensity === 'medium' ? 40 : 70)),
              label: p.label || '',
              interpretation: p.assignment || '',
              functionalGroup: p.label
            }))
          },
          'nmr': {
            type: 'nmr',
            sampleName: data.compound,
            xMin: 0, xMax: 14, yMin: 0, yMax: 100, xLabel: 'Chemical Shift (ppm)', yLabel: 'Intensity',
            peaks: (data.nmr?.peaks || []).map((p: any) => ({
              id: `nmr-${Math.random().toString(36).substr(2, 9)}`,
              x: Number(p.shift),
              y: Number(p.intensity || 80),
              label: p.label || '',
              interpretation: p.assignment || '',
              integration: p.integration,
              multiplicity: p.splitting
            }))
          }
        }
      }
      
      // Replace placeholder with real data
      // IMPORTANT: Update state in one go to avoid race conditions
      setCustomSamples(prev => {
        const filtered = prev.filter(s => s.id !== tempId)
        return [...filtered, newSample]
      })
      setSelectedSampleId(newSample.id)
      addToast('success', 'Analysis Complete', `Successfully generated spectra for ${data.compound}`)
      
    } catch (error) {
      console.error('Spectroscopy generation failed:', error)
      // Remove placeholder on error
      setCustomSamples(prev => prev.filter(s => s.id !== tempId))
      addToast('error', 'Analysis Failed', error instanceof Error ? error.message : 'Could not generate spectroscopy data. Please try again.')
    } finally {
      setIsGenerating(false)
      setCustomName('')
      setCustomFormula('')
    }
  }

  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />
      <div className="grain-overlay" />

      <ModernNavbar />

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-elixra-charcoal dark:text-white mb-2 tracking-tight">{spectType.name}</h1>
          <p className="text-elixra-secondary text-lg">{spectType.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Spectroscopy Type */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
               <StaticGrid className="opacity-30" />
               <div className="relative z-10">
                <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white mb-4">Analysis Type</h2>
                <div className="space-y-3">
                    {SPECTROSCOPY_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                        <button
                        key={type.id}
                        onClick={() => {
                            setSelectedType(type.id)
                            setSelectedPeak(null)
                        }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group/btn ${
                            selectedType === type.id
                            ? 'border-elixra-bunsen bg-elixra-bunsen/10 shadow-lg shadow-elixra-bunsen/20'
                            : 'border-elixra-border-subtle bg-white/50 dark:bg-white/5 hover:border-elixra-bunsen/30 hover:bg-white/80 dark:hover:bg-white/10'
                        }`}
                        >
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl transition-colors ${
                                selectedType === type.id ? 'bg-elixra-bunsen text-white' : 'bg-elixra-charcoal/10 dark:bg-white/10 text-elixra-secondary group-hover/btn:text-elixra-bunsen'
                            }`}>
                            <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                            <div className={`font-semibold text-sm ${selectedType === type.id ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-white'}`}>
                                {type.name.split(' ')[0]}
                            </div>
                            <div className="text-xs text-elixra-secondary">
                                {type.name.split(' ').slice(1).join(' ')}
                            </div>
                            </div>
                        </div>
                        </button>
                    )
                    })}
                </div>
              </div>
            </div>

            {/* Sample Selection */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-lg font-bold text-elixra-charcoal dark:text-white mb-4">Sample</h2>
              
              <div className="flex gap-2 mb-4 p-1 bg-white/50 dark:bg-white/5 rounded-lg border border-elixra-border-subtle">
                <button
                  onClick={() => setUseCustom(false)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                    !useCustom
                      ? 'bg-elixra-bunsen text-white shadow-sm'
                      : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white'
                  }`}
                >
                  Preset Library
                </button>
                <button
                  onClick={() => setUseCustom(true)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                    useCustom
                      ? 'bg-elixra-bunsen text-white shadow-sm'
                      : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white'
                  }`}
                >
                  Custom
                </button>
              </div>

              {!useCustom ? (
                <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto pr-2 custom-scrollbar">
                  {allSamples.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setSelectedSampleId(sample.id)
                        setSelectedPeak(null)
                        setUseCustom(false)
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedSampleId === sample.id && !useCustom
                          ? 'border-elixra-bunsen bg-elixra-bunsen/10 shadow-sm'
                          : 'border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className={`font-semibold text-sm ${selectedSampleId === sample.id && !useCustom ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-white'}`}>{sample.name}</div>
                      <div className="text-xs text-elixra-secondary font-mono">{sample.formula}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-elixra-secondary uppercase mb-1 block">Compound Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Acetaminophen"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-elixra-secondary uppercase mb-1 block">Chemical Formula</label>
                      <input
                        type="text"
                        placeholder="e.g., C8H9NO2"
                        value={customFormula}
                        onChange={(e) => setCustomFormula(e.target.value)}
                        className="input-field text-sm font-mono"
                      />
                    </div>
                    <button
                      onClick={handleAddCustom}
                      disabled={!customName || !customFormula || isGenerating}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                    >
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {isGenerating ? 'Analyzing...' : 'Generate Spectra'}
                    </button>
                  </div>

                  {customSamples.length > 0 && (
                    <div className="pt-4 border-t border-elixra-border-subtle">
                      <div className="text-xs text-elixra-secondary uppercase font-semibold mb-2">History</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {customSamples.map((sample) => (
                          <button
                            key={sample.id}
                            onClick={() => {
                              setSelectedSampleId(sample.id)
                              setSelectedPeak(null)
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedSampleId === sample.id && useCustom
                                ? 'border-elixra-bunsen bg-elixra-bunsen/10 shadow-sm'
                                : 'border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                            }`}
                          >
                            <div className={`font-semibold text-sm ${selectedSampleId === sample.id && useCustom ? 'text-elixra-bunsen-dark dark:text-elixra-bunsen-light' : 'text-elixra-charcoal dark:text-white'}`}>
                              {sample.name}
                              {sample.id.startsWith('custom-generating') && <Loader2 className="h-3 w-3 inline ml-2 animate-spin text-elixra-secondary" />}
                            </div>
                            <div className="text-xs text-elixra-secondary font-mono">{sample.formula}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center Canvas & Right Panel */}
          <div className="lg:col-span-3 space-y-6">
            {selectedSample ? (
              <>
                {/* Sample Info Banner */}
                <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white">{selectedSample.name}</h2>
                      <div className="font-mono text-elixra-copper font-medium">{selectedSample.formula}</div>
                    </div>
                  </div>
                  {useCustom && (
                    <div className="px-3 py-1 rounded-full bg-elixra-bunsen/10 border border-elixra-bunsen/20 text-xs font-semibold text-elixra-bunsen-dark dark:text-elixra-bunsen-light flex items-center gap-1">
                      <AtomIcon className="h-3 w-3" />
                      AI Generated
                    </div>
                  )}
                </div>

                {formattedSpectrum ? (
                  <>
                    {/* Interactive Graph Area */}
                    {comparisonMode === 'side-by-side' && comparisonSpectrum ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Primary Graph */}
                            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 bg-elixra-bunsen/20 px-2 py-1 rounded text-xs font-bold text-elixra-bunsen-dark dark:text-elixra-bunsen-light backdrop-blur-md">
                                    Primary: {selectedSample?.name}
                                </div>
                                <SpectrumGraph
                                    spectrum={formattedSpectrum}
                                    onPeakSelected={setSelectedPeak}
                                    selectedPeakId={selectedPeak?.id}
                                />
                            </div>
                            {/* Comparison Graph */}
                            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border-2 border-dashed border-elixra-border dark:border-white/10">
                                <div className="absolute top-4 left-4 z-10 bg-orange-500/20 px-2 py-1 rounded text-xs font-bold text-orange-700 dark:text-orange-300 backdrop-blur-md">
                                    Comparison: {comparisonSpectrum.sampleName}
                                </div>
                                <SpectrumGraph
                                    spectrum={comparisonSpectrum}
                                    // Comparison graph is read-only for now
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                            {comparisonSpectrum && (
                                <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
                                    <div className="bg-elixra-bunsen/20 px-2 py-1 rounded text-xs font-bold text-elixra-bunsen-dark dark:text-elixra-bunsen-light backdrop-blur-md">
                                        Primary: {selectedSample?.name}
                                    </div>
                                    <div className="bg-orange-500/20 px-2 py-1 rounded text-xs font-bold text-orange-700 dark:text-orange-300 backdrop-blur-md">
                                        Comparison: {comparisonSpectrum.sampleName}
                                    </div>
                                </div>
                            )}
                            <SpectrumGraph
                                spectrum={formattedSpectrum}
                                comparisonSpectrum={comparisonSpectrum}
                                onPeakSelected={setSelectedPeak}
                                selectedPeakId={selectedPeak?.id}
                            />
                        </div>
                    )}

                    {/* Lower Panels Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Explanation */}
                       <SpectrumExplanation peak={selectedPeak} spectroscopyType={selectedType} />
                       
                       {/* Linker */}
                       <SpectrumMoleculeLinker
                        selectedPeak={selectedPeak}
                        spectroscopyType={selectedType}
                      />
                    </div>

                    {/* Comparison Tool */}
                    <SpectrumComparison
                        currentSpectrum={formattedSpectrum}
                        currentSample={selectedSample}
                        allSamples={[...allSamples, ...customSamples]}
                        spectroscopyType={selectedType}
                        onComparisonChange={setComparisonSpectrum}
                        onModeChange={setComparisonMode}
                    />
                  </>
                ) : (
                  <div className="glass-panel rounded-2xl p-12 text-center border-dashed border-2 border-elixra-border-subtle">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-elixra-charcoal/5 dark:bg-white/5 mb-4">
                        <AlertCircle className="h-8 w-8 text-elixra-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-elixra-charcoal dark:text-white mb-2">No Data Available</h3>
                    <p className="text-elixra-secondary max-w-md mx-auto">
                      This sample does not have {spectType.name} data available. Try selecting a different technique or generating a custom analysis.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                 <div className="animate-float mb-6">
                    <AtomIcon className="h-24 w-24 text-elixra-bunsen opacity-50" />
                 </div>
                 <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">Ready to Analyze</h2>
                 <p className="text-elixra-secondary max-w-md">
                    Select a compound from the library or enter a custom formula to generate a spectroscopic analysis.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
