
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Trophy,
  Users
} from 'lucide-react'
import { useCollab } from '@/app/context/CollabContext'

export default function CollaborativeQuiz() {
  const { 
    quizState, 
    sendQuizAction, 
    currentUser, 
    otherUsers,
    roomId
  } = useCollab()

  const [localAnswer, setLocalAnswer] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Derived state from shared quizState
  const isActive = quizState?.active || false
  const currentQuestionIndex = quizState?.current_question || 0
  const questions = quizState?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const answers = quizState?.answers?.[currentQuestionIndex] || {} // { user_sid: answer }
  
  const hasAnswered = currentUser && answers[currentUser.sid]
  
  // Calculate if everyone has answered
  const allUsers = [currentUser, ...otherUsers].filter(u => u)
  const totalParticipants = allUsers.length
  const answeredCount = Object.keys(answers).length
  const everyoneAnswered = totalParticipants > 0 && answeredCount >= totalParticipants

  const handleStartQuiz = () => {
    // Generate some mock questions for now (in real app, fetch from API)
    const mockQuestions = [
      {
        id: 1,
        question_text: "What is the pH of pure water at 25°C?",
        options: ["0", "7", "14", "1"],
        correct_answer: "7",
        explanation: "Pure water is neutral, having a pH of 7 at 25°C.",
        topic: "Acids & Bases"
      },
      {
        id: 2,
        question_text: "Which element has the symbol 'Fe'?",
        options: ["Fluorine", "Francium", "Iron", "Fermium"],
        correct_answer: "Iron",
        explanation: "Fe stands for Ferrum, which is Latin for Iron.",
        topic: "Periodic Table"
      },
      {
        id: 3,
        question_text: "What is the main gas found in the air we breathe?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correct_answer: "Nitrogen",
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere.",
        topic: "Atmosphere"
      }
    ]
    sendQuizAction('start', { questions: mockQuestions })
  }

  const handleAnswer = (answer: string) => {
    if (!hasAnswered) {
      setLocalAnswer(answer)
      sendQuizAction('answer', { question_index: currentQuestionIndex, answer })
    }
  }

  const handleNextQuestion = () => {
    sendQuizAction('next', {})
    setLocalAnswer(null)
  }

  if (!isActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-elixra-bunsen/10 p-6 rounded-full mb-6">
          <Trophy className="h-12 w-12 text-elixra-bunsen" />
        </div>
        <h2 className="text-3xl font-bold text-elixra-charcoal dark:text-white mb-4">
          Collaborative Quiz
        </h2>
        <p className="text-elixra-secondary mb-8 max-w-md">
          Challenge your peers in real-time! Everyone will see the same questions simultaneously.
        </p>
        <button
          onClick={handleStartQuiz}
          className="btn-primary px-8 py-4 text-lg shadow-xl shadow-elixra-bunsen/20 hover:scale-105 transition-transform flex items-center gap-3"
        >
          <Play className="h-6 w-6 fill-current" />
          Start Quiz for Everyone
        </button>
        
        <div className="mt-8 flex -space-x-2">
          {otherUsers.map((u, i) => (
            <div key={u.sid} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: u.color }}>
              {u.name.charAt(0)}
            </div>
          ))}
        </div>
        {otherUsers.length > 0 && (
          <p className="text-sm text-elixra-secondary mt-2">
            {otherUsers.length} other(s) waiting...
          </p>
        )}
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-4">Quiz Complete!</h2>
        <button
            onClick={() => sendQuizAction('start', { questions: [] })} // Reset (hacky)
            className="btn-primary"
        >
            Start New Quiz
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-elixra-bunsen/10 text-elixra-bunsen text-sm font-bold uppercase tracking-wider border border-elixra-bunsen/20">
            Question {currentQuestionIndex + 1} / {questions.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-elixra-copper/10 text-elixra-copper text-sm font-bold uppercase tracking-wider border border-elixra-copper/20">
            {currentQuestion.topic}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
           <Users className="h-4 w-4 text-elixra-secondary" />
           <span className="text-sm font-medium text-elixra-charcoal dark:text-white">
             {answeredCount}/{totalParticipants || 1} Answered
           </span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-3xl font-bold text-elixra-charcoal dark:text-white mb-10 leading-tight">
          {currentQuestion.question_text}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected = localAnswer === option
            // Reveal answers if everyone has answered or user has answered (depending on mode, let's say reveal when everyone answers)
            const showCorrect = everyoneAnswered
            const isCorrect = option === currentQuestion.correct_answer
            
            let buttonClass = "bg-white/50 dark:bg-white/5 border-elixra-border-subtle hover:bg-white/80 dark:hover:bg-white/10"
            if (isSelected) buttonClass = "bg-elixra-bunsen/20 border-elixra-bunsen text-elixra-bunsen-dark dark:text-white"
            
            if (showCorrect) {
                if (isCorrect) buttonClass = "bg-elixra-success/20 border-elixra-success text-elixra-success-dark dark:text-white"
                else if (isSelected && !isCorrect) buttonClass = "bg-elixra-error/20 border-elixra-error text-elixra-error-dark dark:text-white"
                else buttonClass = "opacity-50"
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!hasAnswered}
                className={`p-6 rounded-xl border-2 text-left transition-all text-lg font-medium ${buttonClass}`}
              >
                <div className="flex justify-between items-center">
                    <span>{option}</span>
                    {showCorrect && isCorrect && <CheckCircle className="h-5 w-5 text-elixra-success" />}
                    {showCorrect && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-elixra-error" />}
                    
                    {/* Show avatars of who picked this (if revealed) */}
                    {everyoneAnswered && (
                        <div className="flex -space-x-1 ml-2">
                            {allUsers.map(u => {
                                if (answers[u.sid] === option) {
                                    return (
                                        <div key={u.sid} className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: u.color }} title={u.name}>
                                            {u.name.charAt(0)}
                                        </div>
                                    )
                                }
                                return null
                            })}
                        </div>
                    )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer / Progression */}
      {everyoneAnswered && (
        <div className="mt-auto pt-6 border-t border-elixra-border-subtle flex justify-end">
            <button
                onClick={handleNextQuestion}
                className="btn-primary flex items-center gap-2"
            >
                Next Question
                <Play className="h-4 w-4" />
            </button>
        </div>
      )}
      
      {hasAnswered && !everyoneAnswered && (
          <div className="mt-auto text-center text-elixra-secondary animate-pulse">
              Waiting for others to answer...
          </div>
      )}
    </div>
  )
}
