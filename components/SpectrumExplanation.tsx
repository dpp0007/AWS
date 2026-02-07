'use client'

import React, { useState } from 'react'
import { Peak } from '@/types/spectroscopy'
import { ChevronDown, Lightbulb } from 'lucide-react'

interface SpectrumExplanationProps {
  peak: Peak | null
  spectroscopyType: 'uv-vis' | 'ir' | 'nmr'
}

export default function SpectrumExplanation({
  peak,
  spectroscopyType,
}: SpectrumExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!peak) {
    return (
      <div className="bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 backdrop-blur-2xl border border-elixra-border dark:border-white/20 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-elixra-charcoal dark:text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            Peak Explanation
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronDown
              className={`h-5 w-5 text-elixra-secondary dark:text-gray-400 transition-transform ${
                isExpanded ? '' : '-rotate-90'
              }`}
            />
          </button>
        </div>
        {isExpanded && (
          <div className="text-elixra-secondary dark:text-gray-400 text-sm">
            Click on a peak in the spectrum to see its explanation.
          </div>
        )}
      </div>
    )
  }

  // Generate educational explanation based on peak data
  const getExplanation = (): { title: string; description: string; feature: string } => {
    // Robust fallback for custom molecules
    let description = peak.interpretation || '';
    let feature = peak.molecularFeature || peak.functionalGroup || 'Feature';
    let title = peak.label || '';

    // If description is missing/short, generate it based on position
    if (!description || description.length < 5) {
       if (spectroscopyType === 'ir') {
          const wavenumber = peak.x;
          title = title || `${Math.round(wavenumber)} cm⁻¹`;
          if (wavenumber >= 3200 && wavenumber <= 3650) {
             description = `Broad, strong absorption characteristic of O-H stretching (alcohols, phenols) or N-H stretching (amines, amides). Hydrogen bonding often broadens this peak.`;
             feature = feature === 'Feature' ? 'O-H / N-H Stretch' : feature;
          } else if (wavenumber >= 2850 && wavenumber <= 3000) {
             description = `Sharp absorption peaks corresponding to C-H stretching vibrations in alkyl groups (alkanes).`;
             feature = feature === 'Feature' ? 'sp³ C-H Stretch' : feature;
          } else if (wavenumber >= 3000 && wavenumber <= 3100) {
             description = `Absorption due to C-H stretching in unsaturated systems (alkenes or aromatics).`;
             feature = feature === 'Feature' ? 'sp² C-H Stretch' : feature;
          } else if (wavenumber >= 1650 && wavenumber <= 1780) {
             description = `Strong, sharp absorption indicating a Carbonyl (C=O) stretching vibration. This is often the most distinct peak in the spectrum.`;
             feature = feature === 'Feature' ? 'C=O Stretch' : feature;
          } else if (wavenumber >= 1600 && wavenumber <= 1680) {
             description = `Absorption indicating C=C double bond stretching (alkenes) or aromatic ring breathing modes.`;
             feature = feature === 'Feature' ? 'C=C / Aromatic' : feature;
          } else if (wavenumber >= 1000 && wavenumber <= 1300) {
             description = `Absorption typically associated with C-O stretching (alcohols, ethers, esters) or C-N stretching.`;
             feature = feature === 'Feature' ? 'C-O / C-N Stretch' : feature;
          } else {
             description = `Peak in the fingerprint region (< 1500 cm⁻¹). These complex vibrations are unique to the specific molecular structure.`;
             feature = feature === 'Feature' ? 'Fingerprint Region' : feature;
          }
       } else if (spectroscopyType === 'nmr') {
          title = title || `${peak.x.toFixed(2)} ppm`;
          if (peak.x >= 6.5 && peak.x <= 8.5) {
             description = `Signal in the aromatic region, likely indicating protons attached to a benzene ring or similar aromatic system.`;
             feature = feature === 'Feature' ? 'Aromatic Protons' : feature;
          } else if (peak.x >= 9.0 && peak.x <= 10.0) {
             description = `Deshielded signal characteristic of an aldehyde proton.`;
             feature = feature === 'Feature' ? 'Aldehyde' : feature;
          } else if (peak.x >= 10.0 && peak.x <= 13.0) {
             description = `Highly deshielded signal characteristic of a carboxylic acid proton.`;
             feature = feature === 'Feature' ? 'Carboxylic Acid' : feature;
          } else if (peak.x >= 2.0 && peak.x <= 4.5) {
             description = `Signal likely from protons on carbon adjacent to an electronegative atom (O, N, Halogen) or a carbonyl group.`;
             feature = feature === 'Feature' ? 'Alpha-Protons' : feature;
          } else {
             description = `Signal in the alkyl region, typical of protons on sp³ carbons not heavily deshielded.`;
             feature = feature === 'Feature' ? 'Alkyl Protons' : feature;
          }
       } else if (spectroscopyType === 'uv-vis') {
          title = title || `${Math.round(peak.x)} nm`;
          description = `Electronic transition absorption at ${peak.x} nm.`;
          feature = feature === 'Feature' ? 'Electronic Transition' : feature;
       }
    }

    return {
       title: title || 'Selected Peak',
       description: description || 'No detailed interpretation available for this peak.',
       feature: feature
    }
  }

  const explanation = getExplanation()

  // Color coding based on type
  const getColorClasses = () => {
    switch (spectroscopyType) {
      case 'uv-vis':
        return {
          bg: 'from-blue-500/20 to-cyan-500/20',
          border: 'border-blue-400/30',
          text: 'text-elixra-charcoal dark:text-blue-200',
          title: 'text-elixra-charcoal dark:text-white',
          badge: 'bg-blue-500/30 text-blue-800 dark:text-blue-100',
          subtext: 'text-elixra-secondary dark:text-gray-400',
          panel: 'bg-white/50 dark:bg-white/5 border-elixra-border dark:border-white/10'
        }
      case 'ir':
        return {
          bg: 'from-red-500/20 to-orange-500/20',
          border: 'border-red-400/30',
          text: 'text-elixra-charcoal dark:text-red-200',
          title: 'text-elixra-charcoal dark:text-white',
          badge: 'bg-red-500/30 text-red-800 dark:text-red-100',
          subtext: 'text-elixra-secondary dark:text-gray-400',
          panel: 'bg-white/50 dark:bg-white/5 border-elixra-border dark:border-white/10'
        }
      case 'nmr':
        return {
          bg: 'from-green-500/20 to-emerald-500/20',
          border: 'border-green-400/30',
          text: 'text-elixra-charcoal dark:text-green-200',
          title: 'text-elixra-charcoal dark:text-white',
          badge: 'bg-green-500/30 text-green-800 dark:text-green-100',
          subtext: 'text-elixra-secondary dark:text-gray-400',
          panel: 'bg-white/50 dark:bg-white/5 border-elixra-border dark:border-white/10'
        }
      default:
        return {
          bg: 'from-purple-500/20 to-pink-500/20',
          border: 'border-purple-400/30',
          text: 'text-elixra-charcoal dark:text-purple-200',
          title: 'text-elixra-charcoal dark:text-white',
          badge: 'bg-purple-500/30 text-purple-800 dark:text-purple-100',
          subtext: 'text-elixra-secondary dark:text-gray-400',
          panel: 'bg-white/50 dark:bg-white/5 border-elixra-border dark:border-white/10'
        }
    }
  }

  const colors = getColorClasses()

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} backdrop-blur-2xl border ${colors.border} rounded-2xl p-6 transition-all duration-300 shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${colors.title} flex items-center gap-2`}>
          <Lightbulb className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          Peak Explanation
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronDown
            className={`h-5 w-5 ${colors.subtext} transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Peak Label */}
          <div>
            <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-2`}>
              Peak Identification
            </div>
            <div className={`text-2xl font-bold ${colors.title}`}>{explanation.title}</div>
          </div>

          {/* Molecular Feature */}
          <div>
            <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-2`}>
              Molecular Feature
            </div>
            <div className={`inline-block px-3 py-1 rounded-full ${colors.badge} text-sm font-semibold`}>
              {explanation.feature}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-2`}>
              Why This Peak Appears
            </div>
            <p className={`${colors.text} text-sm leading-relaxed`}>
              {explanation.description}
            </p>
          </div>

          {/* Additional Info */}
          {spectroscopyType === 'nmr' && peak.multiplicity && (
            <div className={`${colors.panel} rounded-lg p-3 border`}>
              <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-1`}>
                Multiplicity
              </div>
              <div className={`text-sm ${colors.title} font-mono`}>
                {peak.multiplicity.charAt(0).toUpperCase() + peak.multiplicity.slice(1)}
              </div>
              <div className={`text-xs ${colors.subtext} mt-1`}>
                {peak.multiplicity === 'singlet' && 'No neighboring protons'}
                {peak.multiplicity === 'doublet' && 'One neighboring proton'}
                {peak.multiplicity === 'triplet' && 'Two neighboring protons'}
                {peak.multiplicity === 'quartet' && 'Three neighboring protons'}
              </div>
            </div>
          )}

          {spectroscopyType === 'uv-vis' && peak.transitionType && (
            <div className={`${colors.panel} rounded-lg p-3 border`}>
              <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-1`}>
                Transition Type
              </div>
              <div className={`text-sm ${colors.title} font-mono`}>{peak.transitionType}</div>
              <div className={`text-xs ${colors.subtext} mt-1`}>
                {peak.transitionType === 'π→π*' && 'Aromatic or conjugated system'}
                {peak.transitionType === 'n→π*' && 'Carbonyl or heteroatom'}
              </div>
            </div>
          )}

          {spectroscopyType === 'ir' && peak.functionalGroup && (
            <div className={`${colors.panel} rounded-lg p-3 border`}>
              <div className={`text-xs ${colors.subtext} uppercase tracking-wide mb-1`}>
                Functional Group
              </div>
              <div className={`text-sm ${colors.title} font-mono`}>{peak.functionalGroup}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
