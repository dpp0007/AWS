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

    setUserAnswers([...userAnswers, newAnswer])
    setShowFeedback(true)
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
      setCurrentAnswer('')
      setShowFeedback(false)
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
      setShowFeedback(false)
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
    setShowFeedback(false)
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
          <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
        </div>

        <ModernNavbar />

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Quiz Configuration</h1>
            </div>

            <div className="space-y-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setConfig({ ...config, difficulty: level })}
                      className={`p-3 rounded-lg font-medium transition-all ${
                        config.difficulty === level
                          ? 'bg-blue-600 text-white border-2 border-blue-400'
                          : 'bg-white/10 text-gray-300 border-2 border-white/20 hover:border-white/40'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Number of Questions: {config.num_questions}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.num_questions}
                  onChange={(e) => setConfig({ ...config, num_questions: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Question Types */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Question Types
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {QUESTION_TYPE_OPTIONS.map(type => (
                    <button
                      key={type.value}
                      onClick={() => {
                        const types = config.question_types.includes(type.value)
                          ? config.question_types.filter(t => t !== type.value)
                          : [...config.question_types, type.value]
                        setConfig({ ...config, question_types: types })
                      }}
                      className={`p-3 rounded-lg text-left transition-all ${
                        config.question_types.includes(type.value)
                          ? 'bg-purple-600 text-white border-2 border-purple-400'
                          : 'bg-white/10 text-gray-300 border-2 border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.include_timer}
                    onChange={(e) => setConfig({ ...config, include_timer: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold text-gray-300">Enable Timer</span>
                </label>

                {config.include_timer && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Time per Question (seconds): {config.time_limit_per_question || 60}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={config.time_limit_per_question || 60}
                      onChange={(e) => setConfig({ ...config, time_limit_per_question: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartQuiz}
                disabled={loading || config.question_types.length === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                {loading ? 'Starting Quiz...' : 'Start Quiz'}
              </button>
            </div>
          </motion.div>
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </h2>
                <p className="text-gray-400 text-sm mt-1">{question.topic}</p>
              </div>
              {config.include_timer && timeLeft !== null && (
                <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-blue-400'}`}>
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">{question.question_text}</h3>

              {/* MCQ Options */}
              {question.options && (
                <div className="space-y-3">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => !showFeedback && setCurrentAnswer(option)}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        currentAnswer === option
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="text-white">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input */}
              {!question.options && (
                <textarea
                  value={currentAnswer}
                  onChange={(e) => !showFeedback && setCurrentAnswer(e.target.value)}
                  disabled={showFeedback}
                  placeholder="Enter your answer..."
                  className="w-full p-4 rounded-lg bg-white/10 border-2 border-white/20 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  rows={4}
                />
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && currentUserAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg mb-6 border-2 ${
                    currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                      ? 'bg-green-500/20 border-green-500'
                      : 'bg-red-500/20 border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase() ? (
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h4 className={`font-bold mb-2 ${
                        currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                          ? 'text-green-300'
                          : 'text-red-300'
                      }`}>
                        {currentUserAnswer.user_answer.toLowerCase() === question.correct_answer.toLowerCase()
                          ? 'Correct!'
                          : 'Incorrect'}
                      </h4>
                      <p className="text-gray-300 text-sm mb-2">{question.explanation}</p>
                      <p className="text-gray-400 text-xs">Time taken: {formatTime(currentUserAnswer.time_taken)}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {!showFeedback ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      Next <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === totalQuestions - 1 || !showFeedback}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Question Navigator */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: totalQuestions }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${
                    idx === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : userAnswers.some(a => a.question_id === idx + 1)
                      ? 'bg-green-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Results Stage
  if (stage === 'results' && results) {
    const scorePercentage = results.score_percentage
    const isPassed = scorePercentage >= 70

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        </div>

        <ModernNavbar />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8"
          >
            {/* Score Summary */}
            <div className="text-center mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isPassed ? 'bg-green-500/20' : 'bg-orange-500/20'
              }`}>
                <Trophy className={`h-12 w-12 ${isPassed ? 'text-green-400' : 'text-orange-400'}`} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {isPassed ? 'Great Job!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-400">Quiz Complete</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-300">{results.correct_answers}</div>
                <div className="text-xs text-gray-400">Correct</div>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">{results.total_questions - results.correct_answers}</div>
                <div className="text-xs text-gray-400">Incorrect</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-300">{Math.round(scorePercentage)}%</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="bg-pink-500/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-pink-300">{formatTime(results.total_time_seconds)}</div>
                <div className="text-xs text-gray-400">Total Time</div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
              {results.results.map((result: QuizResult, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-lg border-2 ${
                    result.is_correct
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">Question {idx + 1}</h4>
                        <span className="text-xs text-gray-400">{formatTime(result.time_taken)}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{result.question_text}</p>
                      <div className="text-xs space-y-1">
                        <p><span className="text-gray-500">Your answer:</span> <span className="text-white">{result.user_answer}</span></p>
                        {!result.is_correct && (
                          <p><span className="text-gray-500">Correct answer:</span> <span className="text-green-400">{result.correct_answer}</span></p>
                        )}
                        <p className="text-gray-400 italic">{result.explanation}</p>
                        {result.suggestions && (
                          <div className="mt-2 p-2 bg-blue-500/20 rounded border-l-2 border-blue-500">
                            <p className="text-blue-300"><Lightbulb className="h-3 w-3 inline mr-1" />Suggestion: {result.suggestions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <Link
                href="/lab"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Back to Lab
              </Link>
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
              >
                New Quiz
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return null
}
