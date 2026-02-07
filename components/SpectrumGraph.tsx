'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Peak, TooltipData, SpectrumViewport } from '@/types/spectroscopy'
import { ZoomIn, ZoomOut, RotateCcw, Move, MousePointer2 } from 'lucide-react'

interface SpectrumData {
  type: 'uv-vis' | 'ir' | 'nmr'
  sampleName: string
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xLabel: string
  yLabel: string
  xInverted?: boolean
  peaks: Peak[]
}

interface SpectrumGraphProps {
  spectrum: SpectrumData
  comparisonSpectrum?: SpectrumData | null
  onPeakSelected?: (peak: Peak) => void
  selectedPeakId?: string | null
}

export default function SpectrumGraph({
  spectrum,
  comparisonSpectrum,
  onPeakSelected,
  selectedPeakId,
}: SpectrumGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [viewport, setViewport] = useState<SpectrumViewport>({
    xMin: spectrum.xMin,
    xMax: spectrum.xMax,
    yMin: spectrum.yMin,
    yMax: spectrum.yMax,
    zoom: 1,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [interactionMode, setInteractionMode] = useState<'pan' | 'select'>('select')

  // Reset viewport when spectrum changes
  useEffect(() => {
    setViewport({
      xMin: spectrum.xMin,
      xMax: spectrum.xMax,
      yMin: spectrum.yMin,
      yMax: spectrum.yMax,
      zoom: 1,
    })
  }, [spectrum])

  // Padding for canvas
  const PADDING = { top: 40, right: 40, bottom: 60, left: 80 }

  // Color config based on type
  const getThemeColors = (type: string, isComparison = false) => {
    if (isComparison) {
      return {
        stroke: '#F59E0B', // Amber 500
        fillStart: 'rgba(245, 158, 11, 0.2)',
        fillEnd: 'rgba(245, 158, 11, 0.05)',
        highlight: '#FCD34D'
      }
    }
    
    switch (type) {
      case 'uv-vis':
        return {
          stroke: '#2E6B6B', // Bunsen Blue
          fillStart: 'rgba(46, 107, 107, 0.4)',
          fillEnd: 'rgba(46, 107, 107, 0.05)',
          highlight: '#4A9E9E'
        }
      case 'ir':
        return {
          stroke: '#C97B49', // Copper Flame
          fillStart: 'rgba(201, 123, 73, 0.4)',
          fillEnd: 'rgba(201, 123, 73, 0.05)',
          highlight: '#E8A87C'
        }
      case 'nmr':
        return {
          stroke: '#C9A9C9', // Indicator Pink
          fillStart: 'rgba(201, 169, 201, 0.4)',
          fillEnd: 'rgba(201, 169, 201, 0.05)',
          highlight: '#E0C0E0'
        }
      default:
        return {
          stroke: '#2E6B6B',
          fillStart: 'rgba(46, 107, 107, 0.4)',
          fillEnd: 'rgba(46, 107, 107, 0.05)',
          highlight: '#4A9E9E'
        }
    }
  }

  // Find nearest peak to mouse position
  const findNearestPeak = useCallback(
    (canvasX: number, canvasY: number): Peak | null => {
      if (!canvasRef.current) return null

      const canvas = canvasRef.current
      const width = canvas.width
      const height = canvas.height
      const graphWidth = width - PADDING.left - PADDING.right
      const graphHeight = height - PADDING.top - PADDING.bottom

      // Find nearest peak within threshold
      let nearest: Peak | null = null
      let minDistance = 60 // Increased threshold for better hit detection (approx 30px on retina)

      const checkPeaks = (peaks: Peak[]) => {
        peaks.forEach((peak) => {
            // Calculate canvas coordinates for this peak
            let normalizedX = (peak.x - viewport.xMin) / (viewport.xMax - viewport.xMin)
            if (spectrum.xInverted) normalizedX = 1 - normalizedX
            
            const peakCanvasX = PADDING.left + normalizedX * graphWidth
            const peakCanvasY = PADDING.top + ((viewport.yMax - peak.y) / (viewport.yMax - viewport.yMin)) * graphHeight

            // Only consider peaks currently visible in viewport (roughly)
            if (peakCanvasX >= PADDING.left - 20 && peakCanvasX <= width - PADDING.right + 20) {
               const distance = Math.sqrt(Math.pow(canvasX - peakCanvasX, 2) + Math.pow(canvasY - peakCanvasY, 2))
               
               if (distance < minDistance) {
                 minDistance = distance
                 nearest = peak
               }
            }
        })
      }

      checkPeaks(spectrum.peaks)
      if (comparisonSpectrum) {
        checkPeaks(comparisonSpectrum.peaks)
      }

      return nearest
    },
    [spectrum.peaks, comparisonSpectrum, viewport, spectrum.xInverted]
  )

  // Handle mouse move for tooltip & panning
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      // Scale for high DPI displays
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const graphWidth = canvas.width - PADDING.left - PADDING.right
      const graphHeight = canvas.height - PADDING.top - PADDING.bottom

      // Calculate data coordinates
      let normalizedX = (x - PADDING.left) / graphWidth
      if (spectrum.xInverted) normalizedX = 1 - normalizedX
      
      const dataX = viewport.xMin + normalizedX * (viewport.xMax - viewport.xMin)
      const dataY = viewport.yMax - ((y - PADDING.top) / graphHeight) * (viewport.yMax - viewport.yMin)

      // Handle Panning
      if (isDragging && dragStart && interactionMode === 'pan') {
        const deltaXPixels = x - dragStart.x
        // const deltaYPixels = y - dragStart.y // Optional: Enable Y panning

        const xRange = viewport.xMax - viewport.xMin
        const deltaDataX = (deltaXPixels / graphWidth) * xRange * (spectrum.xInverted ? 1 : -1)

        setViewport((prev) => ({
          ...prev,
          xMin: prev.xMin + deltaDataX,
          xMax: prev.xMax + deltaDataX,
        }))

        setDragStart({ x, y })
        return
      }

      // Handle Tooltip & Hover
      if (
        x >= PADDING.left &&
        x <= canvas.width - PADDING.right &&
        y >= PADDING.top &&
        y <= canvas.height - PADDING.bottom
      ) {
        const peak = findNearestPeak(x, y)
        if (peak) {
          // Snap tooltip to peak
          let peakNormX = (peak.x - viewport.xMin) / (viewport.xMax - viewport.xMin)
          if (spectrum.xInverted) peakNormX = 1 - peakNormX
          
          const peakCanvasX = PADDING.left + peakNormX * graphWidth
          const peakCanvasY = PADDING.top + ((viewport.yMax - peak.y) / (viewport.yMax - viewport.yMin)) * graphHeight

          setTooltip({
            x: peakCanvasX / scaleX, // Convert back to CSS pixels for DOM tooltip
            y: peakCanvasY / scaleY,
            xValue: peak.x,
            yValue: peak.y,
            peakLabel: peak.label,
            interpretation: peak.interpretation,
            visible: true,
          })
          
          // Change cursor to pointer if hovering peak in select mode
          if (interactionMode === 'select') {
             canvas.style.cursor = 'pointer'
          }
        } else {
          setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            xValue: dataX,
            yValue: dataY,
            peakLabel: '',
            interpretation: '',
            visible: true,
          })
          canvas.style.cursor = interactionMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair'
        }
      } else {
        setTooltip(null)
        canvas.style.cursor = 'default'
      }
    },
    [viewport, isDragging, dragStart, findNearestPeak, interactionMode, spectrum.xInverted]
  )

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (interactionMode === 'pan') {
      setIsDragging(true)
      setDragStart({ x, y })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false)
    setDragStart(null)
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (interactionMode !== 'select') return
    
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const peak = findNearestPeak(x, y)
    if (peak) {
      onPeakSelected?.(peak)
    }
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    
    const x = (e.clientX - rect.left) * scaleX
    const graphWidth = canvasRef.current.width - PADDING.left - PADDING.right

    // Only zoom if inside graph horizontally
    if (x < PADDING.left || x > canvasRef.current.width - PADDING.right) return

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    
    // Calculate focus point in data coordinates
    let normalizedX = (x - PADDING.left) / graphWidth
    if (spectrum.xInverted) normalizedX = 1 - normalizedX
    
    const focusDataX = viewport.xMin + normalizedX * (viewport.xMax - viewport.xMin)

    const currentRange = viewport.xMax - viewport.xMin
    const newRange = currentRange * zoomFactor
    
    // Clamp zoom
    const maxRange = (spectrum.xMax - spectrum.xMin) * 1.5
    const minRange = (spectrum.xMax - spectrum.xMin) * 0.05
    
    if (newRange > maxRange || newRange < minRange) return

    // Calculate new bounds keeping focus point stationary
    const newXMin = focusDataX - normalizedX * newRange
    const newXMax = newXMin + newRange

    setViewport(prev => ({
      ...prev,
      xMin: newXMin,
      xMax: newXMax,
      zoom: (spectrum.xMax - spectrum.xMin) / newRange
    }))
  }

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    // Set actual size in memory
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const width = canvas.width
    const height = canvas.height
    
    // Background - Deep Charcoal #2A2D3A
    ctx.fillStyle = '#2A2D3A'
    ctx.fillRect(0, 0, width, height)

    const graphWidth = width - PADDING.left - PADDING.right
    const graphHeight = height - PADDING.top - PADDING.bottom

    // Draw Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    
    // Vertical grid lines
    const xGridCount = 10
    for (let i = 0; i <= xGridCount; i++) {
      const x = PADDING.left + (i / xGridCount) * graphWidth
      ctx.moveTo(x, PADDING.top)
      ctx.lineTo(x, height - PADDING.bottom)
    }
    
    // Horizontal grid lines
    const yGridCount = 5
    for (let i = 0; i <= yGridCount; i++) {
      const y = PADDING.top + (i / yGridCount) * graphHeight
      ctx.moveTo(PADDING.left, y)
      ctx.lineTo(width - PADDING.right, y)
    }
    ctx.stroke()

    // Draw Axes
    ctx.strokeStyle = '#F5F1E8' // Cream
    ctx.lineWidth = 2
    ctx.beginPath()
    // X Axis
    ctx.moveTo(PADDING.left, height - PADDING.bottom)
    ctx.lineTo(width - PADDING.right, height - PADDING.bottom)
    // Y Axis
    ctx.moveTo(PADDING.left, PADDING.top)
    ctx.lineTo(PADDING.left, height - PADDING.bottom)
    ctx.stroke()

    // Helper: Draw a single spectrum
    const drawCurve = (spec: SpectrumData, isComparison: boolean) => {
        const theme = getThemeColors(spec.type, isComparison)
        const resolution = graphWidth / 2 // 1 point every 2 pixels
        
        ctx.beginPath()
        
        // Helper to get canvas X from data X
        const getCanvasX = (dataX: number) => {
          let normX = (dataX - viewport.xMin) / (viewport.xMax - viewport.xMin)
          if (spectrum.xInverted) normX = 1 - normX
          return PADDING.left + normX * graphWidth
        }

        // Helper to get canvas Y from data Y
        const getCanvasY = (dataY: number) => {
          return PADDING.top + ((viewport.yMax - dataY) / (viewport.yMax - viewport.yMin)) * graphHeight
        }

        // Generate curve points
        for (let i = 0; i <= resolution; i++) {
          const canvasX = PADDING.left + (i / resolution) * graphWidth
          
          // Convert canvasX back to dataX
          let normX = i / resolution
          if (spectrum.xInverted) normX = 1 - normX
          const dataX = viewport.xMin + normX * (viewport.xMax - viewport.xMin)
          
          // Calculate Y sum of Gaussians
          let ySum = 0
          // Base noise
          ySum += Math.random() * (viewport.yMax - viewport.yMin) * 0.005 
          
          spec.peaks.forEach(peak => {
            // Approximate width based on spectrum type
            let width = (viewport.xMax - viewport.xMin) * 0.02
            if (spec.type === 'ir') width = 20
            if (spec.type === 'nmr') width = 0.015 // Narrower for NMR
            if (spec.type === 'uv-vis') width = 30

            // Handle NMR Multiplets
            if (spec.type === 'nmr' && peak.multiplicity) {
               const J = 0.03 // Visual coupling constant in ppm
               const m = peak.multiplicity.toLowerCase()
               
               const addGaussian = (center: number, height: number) => {
                   const contribution = height * Math.exp(-Math.pow(dataX - center, 2) / (2 * Math.pow(width, 2)))
                   ySum += contribution
               }

               if (m.includes('doublet')) {
                   addGaussian(peak.x - J/2, peak.y * 0.5)
                   addGaussian(peak.x + J/2, peak.y * 0.5)
                } else if (m.includes('triplet')) {
                   addGaussian(peak.x - J, peak.y * 0.25)
                   addGaussian(peak.x, peak.y * 0.5)
                   addGaussian(peak.x + J, peak.y * 0.25)
                } else if (m.includes('quartet')) {
                   addGaussian(peak.x - 1.5*J, peak.y * 0.125)
                   addGaussian(peak.x - 0.5*J, peak.y * 0.375)
                   addGaussian(peak.x + 0.5*J, peak.y * 0.375)
                   addGaussian(peak.x + 1.5*J, peak.y * 0.125)
                } else if (m.includes('quintet') || m.includes('multiplet')) {
                   // Approx 1:4:6:4:1
                   addGaussian(peak.x - 2*J, peak.y * 0.06)
                   addGaussian(peak.x - J, peak.y * 0.25)
                   addGaussian(peak.x, peak.y * 0.38)
                   addGaussian(peak.x + J, peak.y * 0.25)
                   addGaussian(peak.x + 2*J, peak.y * 0.06)
               } else if (m.includes('broad')) {
                   // Broad singlet
                   const broadWidth = width * 3
                   ySum += peak.y * Math.exp(-Math.pow(dataX - peak.x, 2) / (2 * Math.pow(broadWidth, 2)))
               } else {
                   // Singlet
                   addGaussian(peak.x, peak.y)
               }
            } else {
               // Standard Gaussian for other types
               const contribution = peak.y * Math.exp(-Math.pow(dataX - peak.x, 2) / (2 * Math.pow(width, 2)))
               
               if (spec.type === 'ir') {
                  // Handled below in dipSum logic
               } else {
                  ySum += contribution
               }
            }
          })
          
          // Special handling for IR reconstruction (inverted peaks)
          let dataY = ySum
          if (spec.type === 'ir') {
             // Baseline is 100
             let dipSum = 0
             spec.peaks.forEach(peak => {
                const width = 30 // cm-1
                const depth = 100 - peak.y
                const contribution = depth * Math.exp(-Math.pow(dataX - peak.x, 2) / (2 * Math.pow(width, 2)))
                dipSum += contribution
             })
             dataY = 100 - dipSum
             if (dataY > 100) dataY = 100
             if (dataY < 0) dataY = 0
          }

          const canvasY = getCanvasY(dataY)
          
          if (i === 0) ctx.moveTo(canvasX, canvasY)
          else ctx.lineTo(canvasX, canvasY)
        }
        
        // Stroke the curve
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.strokeStyle = theme.stroke
        ctx.lineWidth = 3
        if (isComparison) {
            ctx.setLineDash([5, 5]) // Dashed line for comparison
        } else {
            ctx.setLineDash([])
        }
        ctx.stroke()
        ctx.setLineDash([]) // Reset

        // Fill area under curve (only for primary to avoid clutter)
        if (!isComparison) {
            ctx.lineTo(width - PADDING.right, height - PADDING.bottom)
            ctx.lineTo(PADDING.left, height - PADDING.bottom)
            ctx.closePath()
            const gradient = ctx.createLinearGradient(0, PADDING.top, 0, height - PADDING.bottom)
            gradient.addColorStop(0, theme.fillStart)
            gradient.addColorStop(1, theme.fillEnd)
            ctx.fillStyle = gradient
            ctx.fill()
        }

        // Draw Peaks Markers & Labels
        spec.peaks.forEach(peak => {
           const x = getCanvasX(peak.x)
           const y = getCanvasY(peak.y)
           
           if (x >= PADDING.left && x <= width - PADDING.right) {
              const isSelected = peak.id === selectedPeakId
              
              // Marker
              ctx.beginPath()
              ctx.arc(x, y, isSelected ? 9 : 6, 0, Math.PI * 2)
              ctx.fillStyle = isSelected ? '#C9A9C9' : theme.stroke 
              ctx.fill()
              ctx.strokeStyle = '#F5F1E8'
              ctx.lineWidth = 2
              ctx.stroke()
              
              // Label (Only for primary spectrum to reduce clutter)
              if (!isComparison && (isSelected || (interactionMode === 'select' && tooltip?.peakLabel === peak.label))) {
                 ctx.fillStyle = '#F5F1E8'
                 ctx.font = 'bold 12px "IBM Plex Sans"'
                 ctx.textAlign = 'center'
                 ctx.fillText(peak.label, x, y - 15)
              }
           }
        })
    }

    // Draw curves
    if (comparisonSpectrum) {
        drawCurve(comparisonSpectrum, true)
    }
    drawCurve(spectrum, false)

    // Draw Labels
    ctx.fillStyle = '#9CA3AF' // Text secondary
    ctx.font = '14px "IBM Plex Sans"'
    ctx.textAlign = 'center'
    ctx.fillText(spectrum.xLabel, PADDING.left + graphWidth / 2, height - 10)
    
    ctx.save()
    ctx.translate(20, PADDING.top + graphHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(spectrum.yLabel, 0, 0)
    ctx.restore()

    // Draw Ticks
    ctx.fillStyle = '#9CA3AF'
    ctx.font = '12px "IBM Plex Sans"'
    const tickCount = 5
    for (let i = 0; i <= tickCount; i++) {
       const norm = i / tickCount
       const x = PADDING.left + norm * graphWidth
       
       // Calculate value
       let valNorm = norm
       if (spectrum.xInverted) valNorm = 1 - valNorm
       const val = viewport.xMin + valNorm * (viewport.xMax - viewport.xMin)
       
       ctx.fillText(val.toFixed(0), x, height - PADDING.bottom + 20)
    }

  }, [spectrum, comparisonSpectrum, viewport, selectedPeakId, interactionMode, tooltip])

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 rounded-lg p-1 border border-elixra-border dark:border-white/10">
           <button
             onClick={() => setInteractionMode('select')}
             className={`p-2 rounded-md transition-colors ${interactionMode === 'select' ? 'bg-elixra-bunsen text-white' : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white'}`}
             title="Select Peaks"
           >
             <MousePointer2 className="h-4 w-4" />
           </button>
           <button
             onClick={() => setInteractionMode('pan')}
             className={`p-2 rounded-md transition-colors ${interactionMode === 'pan' ? 'bg-elixra-bunsen text-white' : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white'}`}
             title="Pan View"
           >
             <Move className="h-4 w-4" />
           </button>
        </div>

        <div className="text-xs text-elixra-secondary font-mono">
          {tooltip?.visible ? (
             <span>
                {spectrum.xLabel.split(' ')[0]}: <span className="text-elixra-bunsen-dark dark:text-elixra-bunsen-light">{tooltip.xValue.toFixed(1)}</span> | 
                {spectrum.yLabel}: <span className="text-elixra-bunsen-dark dark:text-elixra-bunsen-light">{tooltip.yValue.toFixed(1)}</span>
             </span>
          ) : (
             <span>Zoom: {viewport.zoom.toFixed(1)}x</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.min(10, prev.zoom * 1.2),
              }))
            }
            className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-elixra-charcoal dark:text-white rounded-lg transition-colors border border-elixra-border dark:border-white/10"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setViewport((prev) => ({
                ...prev,
                zoom: Math.max(1, prev.zoom / 1.2),
              }))
            }
            className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-elixra-charcoal dark:text-white rounded-lg transition-colors border border-elixra-border dark:border-white/10"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewport({ xMin: spectrum.xMin, xMax: spectrum.xMax, yMin: spectrum.yMin, yMax: spectrum.yMax, zoom: 1 })}
            className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-elixra-charcoal dark:text-white rounded-lg transition-colors border border-elixra-border dark:border-white/10"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl border border-white/10 overflow-hidden shadow-inner bg-[#2A2D3A]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '400px' }}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
             setTooltip(null)
             setIsDragging(false)
          }}
          onClick={handleClick}
          onWheel={handleWheel}
          className="w-full h-[400px] block touch-none"
        />

        {/* Tooltip DOM Element */}
        {tooltip?.visible && (() => {
          // Smart positioning logic
          const isNearTop = tooltip.y < 120; // If closer than 120px to top, flip down
          const isNearLeft = tooltip.x < 100;
          const isNearRight = canvasRef.current ? tooltip.x > canvasRef.current.offsetWidth - 100 : false;
          
          let transform = 'translate(-50%, -120%)'; // Default: centered above
          let arrowClass = '-bottom-1.5 border-r border-b'; // Default: arrow at bottom pointing down
          
          if (isNearTop) {
             transform = 'translate(-50%, 20%)'; // Flip to below
             arrowClass = '-top-1.5 border-l border-t'; // Arrow at top pointing up
          }
          
          // Horizontal clamping adjustments could be added here if needed, 
          // but vertical is the critical one for peaks.
          
          return (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-200 ease-out"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: transform,
              }}
            >
              <div className="bg-[#2A2D3A]/90 backdrop-blur-md border border-elixra-bunsen/30 rounded-lg p-3 shadow-xl relative">
                <div className="text-xs text-elixra-secondary font-mono mb-1">
                  {spectrum.xLabel.split(' ')[0]}: {tooltip.xValue.toFixed(1)}
                </div>
                {tooltip.peakLabel && (
                  <>
                    <div className="text-sm font-bold text-white">
                      {tooltip.peakLabel}
                    </div>
                    <div className="text-xs text-elixra-bunsen-light mt-1 max-w-[200px]">
                      {tooltip.interpretation}
                    </div>
                  </>
                )}
                
                {/* Arrow */}
                <div className={`w-3 h-3 bg-[#2A2D3A]/90 border-elixra-bunsen/30 transform rotate-45 absolute left-1/2 -translate-x-1/2 ${arrowClass}`}></div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  )
}
