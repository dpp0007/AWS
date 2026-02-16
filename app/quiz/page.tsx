'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Target, Trophy, Flame, CheckCircle, XCircle, Clock } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'

interface QuizQuestion {
  id: string
  reactants: string[]
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  points: number
}

const DAILY_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    reactants: ['HCl', 'NaOH'],
    question: 'What is the product when Hydrochloric acid reacts with Sodium hydroxide?',
    options: ['NaCl + H₂O', 'Na₂O + HCl', 'NaH + ClO', 'No reaction'],
    correctAnswer: 0,
    explanation: 'This is a neutralization reaction. Acid + Base → Salt + Water. HCl + NaOH → NaCl + H₂O',
    points: 10
  },
  {
    id: 'q2',
    reactants: ['AgNO₃', 'NaCl'],
    question: 'What happens when Silver nitrate reacts with Sodium chloride?',
    options: ['No reaction', 'AgCl precipitate forms', 'Gas is released', 'Color change only'],
    correctAnswer: 1,
    explanation: 'This is a precipitation reaction. AgNO₃ + NaCl → AgCl↓ + NaNO₃. Silver chloride is insoluble and forms a white precipitate.',
    points: 10
  },
  {
    id: 'q3',
    reactants: ['CuSO₄', 'Zn'],
    question: 'What is the product when Zinc metal is added to Copper sulfate solution?',
    options: ['No reaction', 'ZnSO₄ + Cu', 'ZnO + CuS', 'Zn₂SO₄ + Cu₂'],
    correctAnswer: 1,
    explanation: 'This is a displacement reaction. Zinc is more reactive than copper, so it displaces copper from the solution. Zn + CuSO₄ → ZnSO₄ + Cu',
    points: 15
  },
  {
    id: 'q4',
    reactants: ['H₂SO₄', 'BaCl₂'],
    question: 'What forms when Sulfuric acid reacts with Barium chloride?',
    options: ['BaSO₄ precipitate', 'H₂O only', 'BaO + HCl', 'No reaction'],
    correctAnswer: 0,
    explanation: 'Barium sulfate is highly insoluble and forms a white precipitate. H₂SO₄ + BaCl₂ → BaSO₄↓ + 2HCl',
    points: 15
  },
  {
    id: 'q5',
    reactants: ['Fe', 'O₂'],
    question: 'What is formed when Iron reacts with Oxygen in the presence of moisture?',
    options: ['FeO', 'Fe₂O₃ (rust)', 'FeO₂', 'No reaction'],
    correctAnswer: 1,
    explanation: 'This is an oxidation reaction. Iron reacts with oxygen and water to form iron(III) oxide, commonly known as rust. 4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃ → 2Fe₂O₃',
    points: 20
  }
]

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DAILY_QUESTIONS)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(DAILY_QUESTIONS.length).fill(false))
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [loading, setLoading] = useState(true)
  const [generatingNew, setGeneratingNew] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [])

  useEffect(() => {
    if (quizCompleted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setQuizCompleted(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizCompleted, timeLeft])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      // Add timestamp to prevent caching
      const response = await fetch(`/api/quiz/generate?t=${Date.now()}`)
      const data = await response.json()

      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions)
        setAnsweredQuestions(new Array(data.questions.length).fill(false))
      } else {
        // If AI fails, use default questions but shuffle them
        const shuffled = [...DAILY_QUESTIONS].sort(() => Math.random() - 0.5)
        setQuestions(shuffled)
        setAnsweredQuestions(new Array(shuffled.length).fill(false))
      }
    } catch (error) {
      console.error('Failed to load questions:', error)
      // Use shuffled default questions on error
      const shuffled = [...DAILY_QUESTIONS].sort(() => Math.random() - 0.5)
      setQuestions(shuffled)
      setAnsweredQuestions(new Array(shuffled.length).fill(false))
    } finally {
      setLoading(false)
    }
  }

  const generateNewQuiz = async () => {
    setGeneratingNew(true)
    await loadQuestions()
    resetQuiz()
    setGeneratingNew(false)
  }

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return

    setSelectedAnswer(answerIndex)
    setShowResult(true)

    const question = questions[currentQuestion]
    const isCorrect = answerIndex === question.correctAnswer

    if (isCorrect) {
      setScore(score + question.points)
    }

    const newAnswered = [...answeredQuestions]
    newAnswered[currentQuestion] = true
    setAnsweredQuestions(newAnswered)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions(new Array(questions.length).fill(false))
    setQuizCompleted(false)
    setTimeLeft(300)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Generating AI-powered quiz questions...</p>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const percentage = Math.round((score / totalPoints) * 100)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background - matching features page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-1/4 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl top-1/3 right-1/4 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 left-1/2 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {quizCompleted ? (
          // Results Screen
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all duration-300"
          >
            <div className="text-center mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${percentage >= 70 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                <Trophy className={`h-12 w-12 ${percentage >= 70 ? 'text-green-600' : 'text-orange-600'
                  }`} />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Complete!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {percentage >= 70 ? 'Great job!' : 'Keep practicing!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {score}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Points Earned
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {percentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Score
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {answeredQuestions.filter(Boolean).length}/{questions.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
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
              <button
                onClick={generateNewQuiz}
                disabled={generatingNew}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {generatingNew ? 'Generating...' : 'New AI Quiz'}
              </button>
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        ) : (
          // Quiz Screen
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 hover:border-white/40 transition-all duration-300"
          >
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{question.points} points</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Reactants */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Reactants:
              </h3>
              <div className="flex items-center justify-center space-x-4">
                {question.reactants.map((reactant, index) => (
                  <div key={index} className="flex items-center">
                    <div className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl font-mono text-xl font-bold shadow-lg">
                      {reactant}
                    </div>
                    {index < question.reactants.length - 1 && (
                      <span className="mx-3 text-2xl text-gray-400">+</span>
                    )}
                  </div>
                ))}
                <span className="mx-3 text-2xl text-gray-400">→</span>
                <span className="text-3xl text-gray-400">?</span>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {question.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrect = index === question.correctAnswer
                const showCorrect = showResult && isCorrect
                const showWrong = showResult && isSelected && !isCorrect

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : showWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : isSelected
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white font-mono">
                        {option}
                      </span>
                      {showCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {showWrong && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-6 ${selectedAnswer === question.correctAnswer
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                >
                  <h3 className={`font-bold mb-2 ${selectedAnswer === question.correctAnswer
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                    }`}>
                    {selectedAnswer === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className={`text-sm ${selectedAnswer === question.correctAnswer
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                    }`}>
                    {question.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Current Score: <span className="font-bold text-blue-600">{score}</span> points
              </div>

              {showResult && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
