/**
 * Equipment Positioning Utilities
 * Provides geometry-based positioning for equipment attachments
 */

export type AnchorPoint = 'top-center' | 'bottom-center' | 'center' | 'top-right' | 'top-left'

export interface TubeGeometry {
  x: number
  y: number
  width: number
  height: number
}

export interface EquipmentPosition {
  left: number
  top: number
  transform: string
}

/**
 * Z-Index hierarchy for equipment layering
 */
export const EQUIPMENT_Z_INDEX = {
  // Foundation layer
  balance: 95,
  balancePlatform: 96,
  balanceDisplay: 106,
  
  // Base equipment layer
  stirrerBase: 98,
  hotPlate: 99,
  bunsenBurner: 100,
  
  // Liquid effects layer
  liquidOverlay: 100,
  vortex: 101,
  bubbles: 101,
  colorShift: 101,
  stirBar: 102,
  
  // Measurement layer
  probes: 103,
  phMeterDisplay: 105,
  thermometerDisplay: 105,
  
  // UI overlay layer
  timer: 106,
  
  // Override layer (centrifuge)
  centrifugeVibration: 108,
  centrifugeBlur: 109,
  centrifugeChamber: 110,
  centrifugeDisplay: 111
} as const

/**
 * Calculate equipment position relative to tube geometry
 * Uses tube bounding box to anchor equipment precisely
 */
export function getEquipmentPosition(
  tubePosition: TubeGeometry,
  anchorPoint: AnchorPoint,
  offset: { x?: number; y?: number } = {}
): EquipmentPosition {
  const centerX = tubePosition.x + tubePosition.width / 2
  const centerY = tubePosition.y + tubePosition.height / 2
  
  const anchors = {
    'top-center': { x: centerX, y: tubePosition.y },
    'bottom-center': { x: centerX, y: tubePosition.y + tubePosition.height },
    'center': { x: centerX, y: centerY },
    'top-right': { x: tubePosition.x + tubePosition.width, y: tubePosition.y },
    'top-left': { x: tubePosition.x, y: tubePosition.y }
  }
  
  const anchor = anchors[anchorPoint]
  
  return {
    left: anchor.x + (offset.x || 0),
    top: anchor.y + (offset.y || 0),
    transform: 'translateX(-50%)' // Center horizontally by default
  }
}

/**
 * Scale equipment dimensions based on tube size
 * Maintains proportions relative to base tube width (96px)
 */
export function getScaledDimensions(
  tubeWidth: number,
  baseWidth: number,
  additionalMargin: number = 0
): { width: number; scaleFactor: number } {
  const BASE_TUBE_WIDTH = 96 // Standard tube width
  const scaleFactor = tubeWidth / BASE_TUBE_WIDTH
  
  return {
    width: baseWidth * scaleFactor + additionalMargin,
    scaleFactor
  }
}

/**
 * Get tube clip path ID for masking liquid effects
 */
export function getTubeClipPathId(tubeId: string): string {
  return `tube-clip-${tubeId}`
}

/**
 * Calculate flame height based on temperature
 * Ensures flame scales appropriately with tube size
 */
export function getFlameHeight(
  temperature: number,
  maxTemp: number,
  tubeHeight: number
): number {
  const minHeight = tubeHeight * 0.125 // 12.5% of tube height
  const maxHeight = tubeHeight * 0.5   // 50% of tube height
  
  return minHeight + (temperature / maxTemp) * (maxHeight - minHeight)
}

/**
 * Calculate platform width for base equipment
 * Ensures equipment is wider than tube for visual stability
 */
export function getPlatformWidth(
  tubeWidth: number,
  marginMultiplier: number = 1.2
): number {
  return tubeWidth * marginMultiplier
}

/**
 * Get liquid surface position for probe insertion
 * Calculates where probes should enter the liquid
 */
export function getLiquidSurfaceY(
  tubePosition: TubeGeometry,
  liquidHeightPercent: number
): number {
  const liquidHeight = tubePosition.height * (liquidHeightPercent / 100)
  return tubePosition.y + tubePosition.height - liquidHeight
}

/**
 * Calculate vortex depth based on RPM and tube dimensions
 */
export function getVortexDepth(
  rpm: number,
  maxRpm: number,
  tubeHeight: number
): number {
  const percentage = (rpm / maxRpm) * 100
  const maxDepth = tubeHeight * 0.3 // Max 30% of tube height
  
  return (percentage / 100) * maxDepth
}

/**
 * Get compression offset for balance platform
 * Simulates weight pressing down on platform
 */
export function getCompressionOffset(
  weight: number,
  maxWeight: number
): number {
  const maxCompression = 5 // Maximum 5px compression
  return Math.min((weight / maxWeight) * maxCompression, maxCompression)
}

/**
 * Calculate bubble spawn position within tube bounds
 * Ensures bubbles stay within tube geometry
 */
export function getBubbleSpawnPosition(
  tubePosition: TubeGeometry,
  randomSeed: number
): { x: number; y: number } {
  const margin = tubePosition.width * 0.1 // 10% margin from edges
  
  return {
    x: tubePosition.x + margin + (randomSeed * (tubePosition.width - 2 * margin)),
    y: tubePosition.y + tubePosition.height * 0.8 // Start near bottom
  }
}

/**
 * Get equipment glow radius based on intensity
 * Scales glow effect with tube size and intensity
 */
export function getGlowRadius(
  tubeWidth: number,
  intensityPercent: number
): number {
  const baseGlow = tubeWidth * 0.1
  const maxGlow = tubeWidth * 0.3
  
  return baseGlow + (intensityPercent / 100) * (maxGlow - baseGlow)
}
