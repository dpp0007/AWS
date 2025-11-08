'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Atom, Menu, X } from 'lucide-react'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Lab', path: '/lab' },
  { name: 'Features', path: '/features' },
  { name: 'Quiz', path: '/quiz' },
  { name: 'Molecules', path: '/molecules' },
  { name: 'Equipment', path: '/equipment' },
  { name: 'Spectroscopy', path: '/spectroscopy' },
  { name: 'Collaborate', path: '/collaborate' }
]

export default function ModernNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg">
                <Atom className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-lg font-bold text-white">ChemLab AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl"
        >
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </header>
  )
}
