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
    id: 'sleep',
    text: 'How did you sleep last night?',
    description: 'Quality matters more than quantity',
    type: 'scale',
    min: 1,
    max: 5,
    labels: ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']
  },
]

const SURVEY_WINDOW_SIZE = 7

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
    const parsed = JSON.parse(localStorage.getItem('surveys') || '[]')
    const existing = Array.isArray(parsed) ? parsed : []
    const chronological = [...existing].sort((a, b) => new Date(a.date) - new Date(b.date))
    const updatedSurveys = [...chronological, payload].slice(-SURVEY_WINDOW_SIZE)
    localStorage.setItem('surveys', JSON.stringify(updatedSurveys))
    onSubmit && onSubmit(payload)

    setAnswers(() => {
      const init = {}
      defaultQuestions.forEach((q) => (init[q.id] = ''))
      return init
    })
    setCurrentStep(0)

    alert('Thank you for sharing! Your responses help us support you better.')
    router.push('/')
  }

  const currentQuestion = defaultQuestions[currentStep]
  const progress = ((currentStep + 1) / defaultQuestions.length) * 100

  const renderInput = (question) => {
    switch (question.type) {
      case 'scale':
        const range = question.max - question.min + 1
        return (
          <div className="space-y-8">
            <div className={`grid gap-4 ${range <= 5 ? 'grid-cols-5' : 'grid-cols-11'}`}>
              {Array.from({ length: range }, (_, i) => {
                const value = i + question.min
                const isSelected = answers[question.id] === value.toString()
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange(question.id, value.toString())}
                    className={`group relative rounded-[2rem] px-2 py-6 font-medium transition-all duration-300 ${isSelected
                      ? 'bg-emerald-800 text-white shadow-lg scale-105'
                      : `bg-white border border-stone-200 text-stone-600 dark:bg-[#252A27] dark:border-white/15 dark:text-[#D9DDDC] hover:-translate-y-1 hover:shadow-lg`
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
              <div className="flex justify-between px-2 text-xs text-stone-500 dark:text-[#D9DDDC]">
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
                className="w-full rounded-[2rem] bg-white px-8 py-6 text-center text-2xl font-medium text-stone-700 border border-stone-200 outline-none transition-all focus:ring-4 focus:ring-emerald-500/30 dark:bg-[#252A27] dark:border-white/15 dark:text-[#F1F3F2]"
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
    <section className={`min-h-screen px-4 py-10 ${isDark ? 'bg-stone-950' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-5xl">
        <div className={`${isDark ? 'bg-[#252A27] border border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]' : 'bg-white border border-stone-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]'} overflow-hidden rounded-[2rem]`}>
          <div className="relative overflow-hidden bg-emerald-800 p-10 text-white">

            <button
              onClick={() => router.push('/')}
              className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </button>

            <h1 className="relative text-5xl font-semibold text-white dark:text-[#F1F3F2]">Daily Wellness Check-In</h1>
            <p className="relative mt-3 text-lg text-white/90">A calm moment to understand how your body and mood are doing today.</p>
          </div>

          <div className="p-10">
            <div className="mb-10 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`${isDark ? 'text-[#D9DDDC]' : 'text-stone-600'}`}>Step {currentStep + 1} of {defaultQuestions.length}</span>
                <span className="font-semibold text-emerald-900 dark:text-emerald-300">{Math.round(progress)}% complete</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-700">
                <div
                  className="h-full rounded-full bg-emerald-700 transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4 text-center">
                <span className="inline-flex rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                  Question {currentStep + 1}
                </span>
                <h2 className={`text-4xl font-semibold leading-tight ${isDark ? 'text-white' : 'text-emerald-950'}`}>
                  {currentQuestion.text}
                </h2>
                <p className={`${isDark ? 'text-[#D9DDDC]' : 'text-stone-600'} text-lg`}>
                  {currentQuestion.description}
                </p>
              </div>

              <div>{renderInput(currentQuestion)}</div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-8 dark:border-white/10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`inline-flex items-center gap-2 rounded-full px-7 py-4 transition-all duration-300 ${currentStep === 0
                    ? 'cursor-not-allowed bg-stone-100 text-stone-400 dark:bg-stone-700 dark:text-stone-400'
                    : 'bg-stone-100 text-stone-700 hover:-translate-y-1 hover:bg-stone-200 hover:shadow-lg dark:bg-[#2A312D] dark:text-[#D9DDDC] dark:hover:bg-[#333C37]'
                    }`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                {currentStep === defaultQuestions.length - 1 ? (
                  <button
                    onClick={submit}
                    disabled={!answers[currentQuestion.id]}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:shadow-none"
                  >
                    <span>Complete Check-In</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={!answers[currentQuestion.id]}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-800 px-8 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-stone-300 dark:disabled:bg-stone-700 disabled:shadow-none"
                  >
                    <span>Continue</span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-6 text-center text-sm ${isDark ? 'text-[#D9DDDC]' : 'text-stone-500'}`}>
          <p>Your responses are private and help us understand your health better</p>
        </div>
      </div>
    </section>
  )
}
