'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Clock,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  BarChart3,
  Lightbulb,
  Trophy,
  Zap,
  Target
} from 'lucide-react'
import Link from 'next/link'
import ModernNavbar from '@/components/ModernNavbar'

type QuizStage = 'config' | 'loading' | 'quiz' | 'results'
type Difficulty = 'easy' | 'medium' | 'hard'
type QuestionType = 'mcq' | 'explanation' | 'complete_reaction' | 'balance_equation' | 'guess_product'

interface QuizConfig {
  difficulty: Difficulty
  num_questions: number
  question_types: QuestionType[]
  include_timer: boolean
  time_limit_per_question: number | null
}

interface QuizQuestion {
  id: number
  question_text: string
  question_type: string
  options?: string[]
  correct_answer: string
  explanation: string
  topic: string
}

interface UserAnswer {
  question_id: number
  user_answer: string
  time_taken: number
  suggestions?: string
}

interface QuizResult {
  question_id: number
  question_text: string
  question_type: string
  user_answer: string
  correct_answer: string
  is_correct: boolean
  explanation: string
  topic: string
  time_taken: number
  suggestions: string
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'mcq', label: 'Multiple Choice', icon: '📋' },
  { value: 'explanation', label: 'Explanation', icon: '📝' },
  { value: 'complete_reaction', label: 'Complete Reaction', icon: '⚗️' },
  { value: 'balance_equation', label: 'Balance Equation', icon: '⚖️' },
  { value: 'guess_product', label: 'Guess Product', icon: '🎯' }
]

export default function QuizPage() {
  const [stage, setStage] = useState<QuizStage>('config')
  const [config, setConfig] = useState<QuizConfig>({
    difficulty: 'medium',
    num_questions: 5,
    question_types: ['mcq'],
    include_timer: false,
    time_limit_per_question: null
  })

  const [sessionId, setSessionId] = useState<string>('')
  const [questions, setQuestions] = useState<{ [key: number]: QuizQuestion }>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(0)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(0)

  // Timer effect
  useEffect(() => {
    if (!config.include_timer || !timeLeft || stage !== 'quiz') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          handleSubmitAnswer()
          return null
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, stage, config.include_timer])

  const handleStartQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      if (!response.ok) {
        throw new Error(`Failed to generate quiz: ${response.status}`)
      }

      const data = await response.json()
      setSessionId(data.session_id)
      setTotalQuestions(data.total_questions)
      
      // Start with just the first question, store by index
      const firstQuestion = data.first_question
      setQuestions({ 0: firstQuestion })
      setCurrentQuestionIndex(0)
      setUserAnswers([])
      setCurrentAnswer('')
      setShowFeedback(false)
      setQuestionStartTime(Date.now())
      if (config.include_timer && config.time_limit_per_question) {
        setTimeLeft(config.time_limit_per_question)
      }
      setStage('quiz')
    } catch (error) {
      console.error('Failed to start quiz:', error)
      alert('Failed to start quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadQuestion = async (sessionId: string, index: number) => {
    try {
      const response = await fetch(`/api/quiz/session/${sessionId}/question/${index}`)
      if (!response.ok) throw new Error('Failed to load question')
      const data = await response.json()
      return data.question
    } catch (error) {
      console.error('Failed to load question:', error)
      return null
    }
  }

  const getQuestion = (index: number): QuizQuestion | null => {
    return questions[index] || null
  }

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer')
      return
    }

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000)
    const newAnswer: UserAnswer = {
      question_id: currentQuestionIndex + 1,
      user_answer: currentAnswer,
      time_taken: timeTaken
    }

    // Update local state handling existing answers
    setUserAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.question_id === newAnswer.question_id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newAnswer
        return updated
      }
      return [...prev, newAnswer]
    })
    setShowFeedback(true)

    // Submit to backend
    try {
      const response = await fetch(`/api/quiz/session/${sessionId}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnswer)
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.suggestions) {
          setUserAnswers(prev => {
            const updated = [...prev]
            const idx = updated.findIndex(a => a.question_id === newAnswer.question_id)
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], suggestions: data.suggestions }
            }
            return updated
          })
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1
      
      // Load next question if not already loaded
      if (!questions[nextIndex]) {
        const nextQuestion = await loadQuestion(sessionId, nextIndex)
        if (nextQuestion) {
          setQuestions(prev => ({ ...prev, [nextIndex]: nextQuestion }))
        }
      }
      
      setCurrentQuestionIndex(nextIndex)
      const nextAnswer = userAnswers.find(a => a.question_id === nextIndex + 1)
      setCurrentAnswer(nextAnswer?.user_answer || '')
      setShowFeedback(!!nextAnswer)
      setQuestionStartTime(Date.now())
      if (config.include_timer && config.time_limit_per_question) {
        setTimeLeft(config.time_limit_per_question)
      }
    } else {
      handleFinishQuiz()
    }
  }

  const handlePreviousQuestion = async () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1
      
      // Load previous question if not already loaded
      if (!questions[prevIndex]) {
        const prevQuestion = await loadQuestion(sessionId, prevIndex)
        if (prevQuestion) {
          setQuestions(prev => ({ ...prev, [prevIndex]: prevQuestion }))
        }
      }
      
      setCurrentQuestionIndex(prevIndex)
      const prevAnswer = userAnswers.find(a => a.question_id === prevIndex + 1)
      setCurrentAnswer(prevAnswer?.user_answer || '')
      setShowFeedback(!!prevAnswer)
    }
  }

  const handleJumpToQuestion = async (index: number) => {
    // Load question if not already loaded
    if (!questions[index]) {
      const jumpQuestion = await loadQuestion(sessionId, index)
      if (jumpQuestion) {
        setQuestions(prev => ({ ...prev, [index]: jumpQuestion }))
      }
    }
    
    setCurrentQuestionIndex(index)
    const prevAnswer = userAnswers.find(a => a.question_id === index + 1)
    setCurrentAnswer(prevAnswer?.user_answer || '')
    setShowFeedback(!!prevAnswer)
  }

  const handleFinishQuiz = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/quiz/session/${sessionId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userAnswers)
      })

      const data = await response.json()
      setResults(data)
      setStage('results')
    } catch (error) {
      console.error('Failed to finish quiz:', error)
      alert('Failed to finish quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Config Stage
  if (stage === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
        </div>

        <ModernNavbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            {/* Left Side: Configuration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Quiz Configuration</h1>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                        <button
                          key={level}
                          onClick={() => setConfig({ ...config, difficulty: level })}
                          className={`py-3 px-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                            config.difficulty === level
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Number of Questions
                      </label>
                      <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full text-sm">
                        {config.num_questions}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={config.num_questions}
                      onChange={(e) => setConfig({ ...config, num_questions: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                  </div>
                </div>

                {/* Question Types */}
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                    Question Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {QUESTION_TYPE_OPTIONS.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          const types = config.question_types.includes(type.value)
                            ? config.question_types.filter(t => t !== type.value)
                            : [...config.question_types, type.value]
                          setConfig({ ...config, question_types: types })
                        }}
                        className={`p-4 rounded-xl text-left transition-all duration-300 border ${
                          config.question_types.includes(type.value)
                            ? 'bg-purple-500/20 text-white border-purple-500/50 shadow-lg shadow-purple-500/20'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="text-2xl mb-2">{type.icon}</div>
                        <div className="text-sm font-medium truncate">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 h-full">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.include_timer ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'}`}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-medium text-white">Enable Timer</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.include_timer}
                        onChange={(e) => setConfig({ ...config, include_timer: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {config.include_timer && (
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-semibold text-gray-400">
                          Seconds per Question
                        </label>
                        <span className="text-blue-400 font-bold">{config.time_limit_per_question || 60}s</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={config.time_limit_per_question || 60}
                        onChange={(e) => setConfig({ ...config, time_limit_per_question: parseInt(e.target.value) })}
                        className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartQuiz}
                  disabled={loading || config.question_types.length === 0}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="h-5 w-5 fill-current" />
                  {loading ? 'Starting Quiz...' : 'Start Quiz'}
                </button>
              </div>
            </motion.div>

{/* Visual removed */}
          </div>
        </div>
      </div>
    )
  }

  // Loading Stage
  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Generating AI-powered quiz questions...</p>
        </div>
      </div>
    )
  }

  // Quiz Stage
  if (stage === 'quiz' && Object.keys(questions).length > 0) {
    const question = questions[currentQuestionIndex]
    if (!question) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Loading question...</p>
          </div>
        </div>
      )
    }
    const isAnswered = userAnswers.some(a => a.question_id === currentQuestionIndex + 1)
    const currentUserAnswer = userAnswers.find(a => a.question_id === currentQuestionIndex + 1)

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        </div>

        <ModernNavbar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Question & Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                      Question {currentQuestionIndex + 1} / {totalQuestions}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider border border-purple-500/20">
                      {question.topic}
                    </span>
                  </div>
                </div>
                {config.include_timer && timeLeft !== null && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    timeLeft <= 10 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' 
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white leading-relaxed">{question.question_text}</h3>
              </div>

              {/* MCQ Options */}
              {question.options && (
                <div className="space-y-4 mb-8">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showFeedback && setCurrentAnswer(option)}
                      disabled={showFeedback}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                        currentAnswer === option
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      } ${showFeedback ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                          currentAnswer === option
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-white/20 text-gray-400 group-hover:border-white/40 group-hover:text-white'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`text-lg ${currentAnswer === option ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input */}
              {!question.options && (
                <div className="mb-8">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => !showFeedback && setCurrentAnswer(e.target.value)}
                    disabled={showFeedback}
                    placeholder="Type your answer here..."
                    className="w-full p-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all resize-none text-lg"
                    rows={4}
                  />
                </div>
              )}

              {/* Feedback Section */}
              <AnimatePresence>
                {showFeedback && currentUserAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={`rounded-xl border overflow-hidden ${
                      currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                        ? 'bg-green-500/10 border-green-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase() ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <XCircle className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold mb-1 ${
                            currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}>
                            {currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                              ? 'Correct Answer!'
                              : 'Incorrect Answer'}
                          </h4>
                          <p className="text-gray-300 leading-relaxed mb-3">{question.explanation}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
                            <Clock className="h-3 w-3" />
                            Time taken: {formatTime(currentUserAnswer.time_taken)}
                          </div>
                          
                          {currentUserAnswer.suggestions && (
                            <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3 items-start">
                              <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                              <div className="text-sm text-blue-300">
                                <p className="font-semibold mb-1">Learning Tip:</p>
                                <p>{currentUserAnswer.suggestions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span>Previous</span>
                </button>

                {!showFeedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim()}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <>
                        <span>Next Question</span>
                        <ChevronRight className="h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <span>View Results</span>
                        <BarChart3 className="h-5 w-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right Side: Question Navigator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 sticky top-24"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
                <h4 className="text-white font-bold mb-6 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  Question Navigator
                </h4>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const status = userAnswers.find(a => a.question_id === idx + 1)
                      ? (userAnswers.find(a => a.question_id === idx + 1)?.user_answer.toLowerCase() === questions[idx]?.correct_answer?.toLowerCase() ? 'correct' : 'incorrect')
                      : (idx === currentQuestionIndex ? 'current' : 'pending');
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleJumpToQuestion(idx)}
                        className={`aspect-square rounded-xl font-bold text-sm transition-all flex items-center justify-center border ${
                          status === 'current'
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-110 z-10'
                            : status === 'correct'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : status === 'incorrect'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Results Stage
  if (stage === 'results' && results) {
    const scorePercentage = results.score_percentage
    const isPassed = scorePercentage >= 70

    return (
      <div className="min-h-screen lg:h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col overflow-auto lg:overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        </div>

        <div className="flex-shrink-0 relative z-20">
          <ModernNavbar />
        </div>

        <div className="flex-1 relative z-10 max-w-7xl mx-auto px-6 py-6 w-full min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-full h-auto">
            {/* Left Side: Summary Card */}
            <div className="lg:col-span-5 lg:h-full h-auto">
              <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-full flex flex-col overflow-hidden shadow-2xl">
                <div className="lg:flex-1 lg:overflow-y-auto overflow-visible custom-scrollbar p-6 lg:p-10 flex flex-col">
                  {/* Score Visual */}
                  <div className="text-center mb-10 flex-shrink-0">
                  <div className={`relative w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    isPassed ? 'bg-green-500/10 ring-4 ring-green-500/20' : 'bg-orange-500/10 ring-4 ring-orange-500/20'
                  }`}>
                    <div className={`absolute inset-0 rounded-full blur-xl ${isPassed ? 'bg-green-500/20' : 'bg-orange-500/20'}`}></div>
                    <Trophy className={`relative z-10 h-16 w-16 ${isPassed ? 'text-green-400' : 'text-orange-400'}`} />
                  </div>
                  
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {isPassed ? 'Great Job!' : 'Keep Practicing!'}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    You scored <span className={isPassed ? 'text-green-400 font-bold' : 'text-orange-400 font-bold'}>{Math.round(scorePercentage)}%</span>
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-blue-400 mb-1">{results.correct_answers}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Correct</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-purple-400 mb-1">{results.total_questions - results.correct_answers}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Incorrect</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-green-400 mb-1">{Math.round(scorePercentage)}%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Accuracy</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-3xl font-bold text-pink-400 mb-1">{formatTime(results.total_time_seconds)}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Time</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 mt-auto flex-shrink-0 pb-2">
                  <button
                    onClick={() => {
                      setStage('config')
                      setConfig({
                        difficulty: 'medium',
                        num_questions: 5,
                        question_types: ['mcq'],
                        include_timer: false,
                        time_limit_per_question: null
                      })
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Zap className="h-5 w-5" />
                    Try Another Quiz
                  </button>
                  <Link
                    href="/lab"
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Return to Lab
                  </Link>
                </div>
                </div>
              </div>
            </div>

            {/* Right Side: Detailed Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7 lg:h-full h-auto flex flex-col lg:min-h-0"
            >
              <div className="flex items-center gap-4 flex-shrink-0 mb-3 bg-slate-900/40 p-4 rounded-2xl border border-white/10 backdrop-blur-xl">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Detailed Analysis</h3>
                  <p className="text-gray-400 text-sm">Review your answers and explanations</p>
                </div>
              </div>

              <div className="space-y-4 lg:overflow-y-auto overflow-visible pr-0 lg:pr-2 custom-scrollbar lg:flex-1 pb-4">
                {results.results.map((result: QuizResult, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 + 0.3 }}
                    className={`p-6 rounded-3xl border transition-all ${
                      result.is_correct
                        ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                        : 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full flex-shrink-0 mt-1 ${
                        result.is_correct ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.is_correct ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-white">Question {idx + 1}</h4>
                          <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            {formatTime(result.time_taken)}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-4 leading-relaxed font-medium">{result.question_text}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className={`p-3 rounded-xl border ${
                            result.is_correct 
                              ? 'bg-green-500/10 border-green-500/20' 
                              : 'bg-red-500/10 border-red-500/20'
                          }`}>
                            <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Your Answer</span>
                            <span className={`font-semibold ${result.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                              {result.user_answer}
                            </span>
                          </div>
                          
                          {!result.is_correct && (
                            <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/5">
                              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Correct Answer</span>
                              <span className="text-green-400 font-semibold">{result.correct_answer}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <p className="text-sm text-gray-400 italic">
                            <span className="font-semibold text-blue-400 not-italic mr-2">Explanation:</span>
                            {result.explanation}
                          </p>
                        </div>

                        {result.suggestions && (
                          <div className="mt-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex gap-3 items-start">
                            <Lightbulb className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-300">
                              <p className="font-semibold mb-1">Learning Tip:</p>
                              <p>{result.suggestions}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
