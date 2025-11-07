'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, CheckCircle, XCircle, Award, AlertTriangle } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Quiz {
  questions: Question[]
  passingScore: number
}

export default function SafetyTrainingPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [training, setTraining] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchQuiz()
  }, [])
  
  const fetchQuiz = async () => {
    try {
      const response = await fetch('/api/safety/training')
      const data = await response.json()
      setQuiz(data.quiz)
      setTraining(data.training)
      setAnswers(new Array(data.quiz.questions.length).fill(-1))
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }
  
  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }
  
  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/safety/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading safety training...</p>
        </div>
      </div>
    )
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Failed to load quiz</p>
        </div>
      </div>
    )
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
              <Shield className="h-6 w-6 mr-2 text-yellow-600" />
              Safety Training
            </h1>
            
            <div className="w-24"></div>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Already Completed Banner */}
        {training?.completed && !showResults && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                  Safety Certified!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You scored {training.score}% on {new Date(training.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results View */}
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <div className="text-center mb-8">
                {results.passed ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Congratulations!
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      You passed the safety training!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Not Quite There
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      You need {quiz.passingScore}% to pass
                    </p>
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {results.score}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Your Score
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {results.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Correct
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {results.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Link
                  href="/lab"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Back to Lab
                </Link>
                {!results.passed && (
                  <button
                    onClick={() => {
                      setShowResults(false)
                      setCurrentQuestion(0)
                      setAnswers(new Array(quiz.questions.length).fill(-1))
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                  <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Question */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {quiz.questions[currentQuestion].question}
              </h2>
              
              {/* Options */}
              <div className="space-y-3 mb-8">
                {quiz.questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      answers[currentQuestion] === index
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {answers[currentQuestion] === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
                
                {currentQuestion === quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={answers.includes(-1)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={answers[currentQuestion] === -1}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Info Box */}
        {!showResults && (
          <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                  Important Information
                </h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• You need {quiz.passingScore}% to pass this safety training</li>
                  <li>• Answer all questions before submitting</li>
                  <li>• You can retake the quiz if you don't pass</li>
                  <li>• Passing earns you 200 XP and a safety certificate</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
