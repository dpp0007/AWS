'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, GraduationCap, BookOpen, Clock, Target, CheckCircle } from 'lucide-react'
import { CURRICULUM_LESSONS } from '@/lib/curriculum'

export default function CurriculumPage() {
  const [selectedGrade, setSelectedGrade] = useState<'all' | 'high-school' | 'undergraduate' | 'graduate'>('all')
  
  const filteredLessons = selectedGrade === 'all' 
    ? CURRICULUM_LESSONS 
    : CURRICULUM_LESSONS.filter(lesson => lesson.gradeLevel === selectedGrade)
  
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'high-school': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'undergraduate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'graduate': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/lab"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Lab</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
              Curriculum
            </h1>
            
            <div className="w-24"></div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Filter by Grade Level
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedGrade === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setSelectedGrade('high-school')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedGrade === 'high-school'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              High School
            </button>
            <button
              onClick={() => setSelectedGrade('undergraduate')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedGrade === 'undergraduate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Undergraduate
            </button>
            <button
              onClick={() => setSelectedGrade('graduate')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedGrade === 'graduate'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Graduate
            </button>
          </div>
        </div>
        
        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGradeColor(lesson.gradeLevel)}`}>
                  {lesson.gradeLevel.replace('-', ' ')}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {lesson.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {lesson.subject}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  {lesson.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Target className="h-4 w-4 mr-2" />
                  {lesson.objectives.length} objectives
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Learning Objectives:
                </h4>
                <ul className="space-y-1">
                  {lesson.objectives.slice(0, 3).map((objective, i) => (
                    <li key={i} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                  {lesson.objectives.length > 3 && (
                    <li className="text-xs text-blue-600 dark:text-blue-400">
                      +{lesson.objectives.length - 3} more...
                    </li>
                  )}
                </ul>
              </div>
              
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Start Lesson
              </button>
            </motion.div>
          ))}
        </div>
        
        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No lessons found for this grade level
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
