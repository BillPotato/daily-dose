"use client";

// components/Survey.jsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

// Add this missing defaultQuestions array
const defaultQuestions = [
  {
    id: 'mood',
    text: 'How are you feeling today?',
    description: 'Take a moment to check in with yourself',
    type: 'scale',
    min: 1,
    max: 5,
    labels: ['Not great', 'Could be better', 'Okay', 'Good', 'Excellent']
  },
  {
    id: 'pain',
    text: 'Are you experiencing any discomfort?',
    description: "We'd like to understand how your body feels",
    type: 'scale',
    min: 0,
    max: 10,
    labels: ['None', 'Mild', 'Moderate', 'Severe']
  },
  {
    id: 'exercise',
    text: 'How much did you move today?',
    description: 'Any physical activity counts, even a short walk',
    type: 'number',
    placeholder: 'Minutes of activity'
  },
  {
    id: 'exercise',
    text: 'How much did you move today?',
    description: 'Any physical activity counts, even a short walk',
    type: 'number',
    placeholder: 'Minutes of activity'
  },
  {
    id: 'sleep',
    text: 'How did you sleep last night?',
    description: 'Quality matters more than quantity',
    type: 'scale',
    min: 1,
    max: 5,
    labels: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
  },
]

export default function Survey({ onSubmit }) {
  const [answers, setAnswers] = useState(() => {
    const init = {}
    defaultQuestions.forEach((q) => (init[q.id] = ''))
    return init
  })
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const { isDark } = useTheme()

  const handleChange = (id, value) => {
    setAnswers((s) => ({ ...s, [id]: value }))
  }

  const nextStep = () => {
    if (currentStep < defaultQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submit = () => {
    const payload = {
      id: Date.now(),
      date: new Date().toISOString(),
      answers
    }
    const existing = JSON.parse(localStorage.getItem('surveys') || '[]')
    localStorage.setItem('surveys', JSON.stringify([payload, ...existing]))
    onSubmit && onSubmit(payload)

    setAnswers(() => {
      const init = {}
      defaultQuestions.forEach((q) => (init[q.id] = ''))
      return init
    })
    setCurrentStep(0)

    alert('Thank you for sharing! Your responses help us support you better.')
    router.push('/dashboard')
  }

  const currentQuestion = defaultQuestions[currentStep]
  const progress = ((currentStep + 1) / defaultQuestions.length) * 100

  const renderInput = (question) => {
    switch (question.type) {
      case 'scale':
        const range = question.max - question.min + 1
        return (
          <div className="space-y-6">
            <div className={`grid gap-3 ${range <= 5 ? 'grid-cols-5' : 'grid-cols-11'}`}>
              {Array.from({ length: range }, (_, i) => {
                const value = i + question.min
                const isSelected = answers[question.id] === value.toString()
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange(question.id, value.toString())}
                    className={`group relative py-5 px-2 rounded-2xl font-medium transition-all duration-300 ${isSelected
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-105'
                      : `bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md`
                      }`}
                  >
                    <span className="text-xl block">{value}</span>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {question.labels && (
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
                <span>{question.labels[0]}</span>
                <span>{question.labels[question.labels.length - 1]}</span>
              </div>
            )}
          </div>
        )

      case 'number':
        return (
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="number"
                value={answers[question.id]}
                onChange={(e) => handleChange(question.id, e.target.value)}
                placeholder={question.placeholder}
                className="w-full px-6 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-all text-2xl text-center font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {answers[question.id] && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen py-8 px-4 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-3xl mx-auto">
        <div className={`${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 backdrop-blur-sm'} rounded-3xl shadow-2xl overflow-hidden border ${isDark ? 'border-gray-700' : 'border-white/20'}`}>
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-32 translate-y-32"></div>
            </div>

            {/* Back Button with Border */}
            <button
              onClick={() => router.push('/dashboard')}
              className="relative flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-white/30 hover:border-white/50 text-white/90 hover:text-white mb-6 transition-all duration-300 group backdrop-blur-sm bg-white/10 hover:bg-white/20"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">Your Daily Check-In</h1>
              <p className="text-white/90 text-lg">We're here to support your wellness journey</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 pt-8 pb-4">
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="font-medium">Step {currentStep + 1} of {defaultQuestions.length}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{Math.round(progress)}% complete</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="p-8 pt-6">
            <div className="text-center mb-10 space-y-3">
              <div className="inline-block px-4 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-2">
                Question {currentStep + 1}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white leading-tight">
                {currentQuestion.text}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{currentQuestion.description}</p>
            </div>

            <div className="mb-10">
              {renderInput(currentQuestion)}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${currentStep === 0
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              {currentStep === defaultQuestions.length - 1 ? (
                <button
                  onClick={submit}
                  disabled={!answers[currentQuestion.id]}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                >
                  <span>Complete Check-In</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!answers[currentQuestion.id]}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                >
                  <span>Continue</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Helper text */}
        <div className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
          <p>Your responses are private and help us understand your health better</p>
        </div>
      </div>
    </div>
  )
}
