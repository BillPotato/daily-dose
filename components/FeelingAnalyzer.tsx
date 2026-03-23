"use client";

// components/FeelingAnalyzer.jsx
import { useState } from 'react';
import { feelingAnalyzerAPI } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { generateGoogleCalendarUrl } from '@/lib/googleCalendarUrl';
import { mapGeminiTasksToAppTasks } from '@/lib/taskMapper';
import TaskCard from '@/components/TaskCard';
import { toast } from 'react-toastify';
import type { Task } from '@/types';

type FeelingAnalysis = {
  issue: string;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  emoji: string;
  color: string;
  source: string;
  timestamp: string;
};

type FeelingAnalyzerProps = {
  onTasksGenerated?: (tasks: Task[]) => void;
  onAnalysisComplete?: (analysis: FeelingAnalysis) => void;
};

export default function FeelingAnalyzer({ onTasksGenerated, onAnalysisComplete }: FeelingAnalyzerProps) {
  const [feelingText, setFeelingText] = useState('');
  const [analysis, setAnalysis] = useState<FeelingAnalysis | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [calendarLinks, setCalendarLinks] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rateLimitReached, setRateLimitReached] = useState(false);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  const suggestions = [
    "I've been having headaches and feeling tired lately",
    "My stomach hurts and I can't sleep well",
    "Feeling anxious about work and having trouble focusing",
    "Joint pain in the morning and low energy throughout the day",
    "Stress from school and feeling overwhelmed"
  ];

  const analyzeFeeling = async () => {
    if (!feelingText.trim()) return;

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);
    toast.info('Analyzing feeling...');

    try {
      const result = await feelingAnalyzerAPI.analyzeSymptoms(feelingText);
      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      toast.success('Feeling analysis completed successfully!');
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to analyze symptoms. Please try again.');
      toast.error('Error analyzing feeling. Please try again.');
      const localResult = localAnalyze(feelingText);
      setAnalysis(localResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const localAnalyze = (text: string): FeelingAnalysis => {
    // ... (your existing local analysis logic)
    const t = text.toLowerCase();
    const recs: string[] = [];
    let issue = 'General wellness check';
    let severity: FeelingAnalysis['severity'] = 'low';
    let emoji = '🤔';
    let color = 'blue';

    if (/\b(pain|ache|hurt|sore|tender)\b/.test(t)) {
      if (/\b(head|headache|migraine)\b/.test(t)) {
        issue = 'Head pain or discomfort';
        recs.push('Track headache frequency and triggers in your daily survey');
        recs.push('Ensure proper hydration and consider over-the-counter pain relief if appropriate');
        recs.push('Consult healthcare provider if headaches persist or worsen');
      }
    }

    return {
      issue,
      recommendations: recs,
      severity,
      emoji,
      color,
      source: 'local-fallback',
      timestamp: new Date().toISOString()
    };
  };

  const getSeverityColor = (severity: FeelingAnalysis['severity']) => {
    switch (severity) {
      case 'high': return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200';
      case 'medium': return 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200';
      default: return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
    }
  };

  const stripCodeFence = (raw: unknown) => {
    if (typeof raw !== 'string') return raw;
    return raw
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim();
  };

  const addToCalendar = async (content: string) => {
    if (isAnalyzing) return;
    console.log(`Passed to parser: ${content}`)
    setIsAnalyzing(true);
    setError('');

    try {
        const eventsText = await feelingAnalyzerAPI.analyzeSymptoms(content);
        console.log('Raw Gemini Output:', eventsText);

        const cleaned = typeof eventsText === 'string' ? stripCodeFence(eventsText) : eventsText;
        const parsed = typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned;
        const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];

        // Map Gemini tasks to app tasks and save to state/localStorage
        if (tasks.length > 0) {
          const appTasks = mapGeminiTasksToAppTasks(tasks);
          setGeneratedTasks(appTasks);
          
          // Call the callback to save tasks to parent/localStorage
          if (onTasksGenerated) {
            onTasksGenerated(appTasks);
            toast.success(`Generated ${appTasks.length} health task${appTasks.length !== 1 ? 's' : ''} and added to your task list!`);
          }
        }

        const generatedLinks = tasks.map((task, index) => {
          const summary = String(task?.summary ?? `Health Task ${index + 1}`);
          const description = String(task?.description ?? '');
          const location = String(task?.location ?? '');

          const start = task?.start?.dateTime ?? task?.start?.date ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
          const end = task?.end?.dateTime ?? task?.end?.date ?? new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

          return generateGoogleCalendarUrl({
            title: summary,
            description,
            location,
            start,
            end,
          });
        });

        setCalendarLinks(generatedLinks);
        if (generatedLinks.length === 0) {
          toast.info("No calendar tasks could be generated from the analysis.");
        } else {
          toast.info("Calendar links ready for review");
        }
    } catch (err: unknown) {
      console.error("Task generation failed:", err);
        if (
          typeof err === 'object'
          && err !== null
          && 'response' in err
          && typeof (err as { response?: { status?: number } }).response?.status === 'number'
          && (err as { response?: { status?: number } }).response?.status === 429
        ) {
          const quotaMessage = 'You have reached your limit of 15 queries. Please try again later.';
          setRateLimitReached(true);
          setError(quotaMessage);
          toast.error(quotaMessage);
        } else {
          toast.error("Failed to generate calendar links")
        }
    } finally {
      setIsAnalyzing(false);
    }
    
  }

  const handleClick = async (content: string) => {
    await analyzeFeeling();
    await addToCalendar(content)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-[#252A27] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)] border border-stone-200 dark:border-white/15 p-8">
        <div className="mb-6">
          <label className="block text-xl font-semibold text-emerald-950 dark:text-[#F1F3F2] mb-4">
            How are you feeling today?
          </label>
          <textarea
            value={feelingText}
            onChange={(e) => setFeelingText(e.target.value)}
            placeholder="Describe your symptoms, emotions, or concerns in detail..."
            className="w-full h-48 p-6 border border-stone-300 dark:border-white/15 rounded-2xl focus:ring-4 focus:ring-emerald-500/40 focus:border-emerald-500 outline-none transition-all duration-300 resize-none bg-stone-50 dark:bg-[#2A312D] text-stone-900 dark:text-[#F1F3F2]"
            rows={6}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-stone-500 dark:text-[#D9DDDC]">
              {feelingText.length}/500 characters
            </span>
            <button
              onClick={() => setFeelingText('')}
              className="text-sm text-stone-500 dark:text-[#D9DDDC] hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors duration-200 hover:scale-110"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-700 dark:text-stone-200">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={() => handleClick(feelingText)}
            disabled={isAnalyzing || !feelingText.trim() || rateLimitReached}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 dark:disabled:bg-stone-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-emerald-100 border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing with AI...</span>
              </div>
            ) : (
              'Generate Calendar Tasks'
            )}
          </button>
        </div>

        {calendarLinks.length > 0 && (
          <div className="mt-6">
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-stone-100' : 'text-emerald-950'}`}>
                Generated Health Tasks
              </h3>
              <p className={`text-sm ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                These tasks have been added to your dashboard. Click "Add" to save them to Google Calendar.
              </p>
            </div>
            <div className={`rounded-[2rem] p-6 border ${isDark ? 'bg-[#252A27] border-white/15 shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)]' : 'bg-stone-50 border-stone-200'} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                {generatedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showActionButtons={false}
                  compact={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white dark:bg-[#252A27] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_-15px_rgba(4,43,21,0.08)] border border-stone-200 dark:border-white/15 p-8">
        <h3 className="font-semibold text-emerald-950 dark:text-[#F1F3F2] mb-6 text-lg">Need inspiration? Try these examples:</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFeelingText(suggestion)}
              className="w-full text-left p-4 bg-stone-50 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 rounded-xl transition-all duration-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-300 hover:shadow-md transform hover:scale-[1.02]"
            >
              <span className="text-stone-700 dark:text-stone-300">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white dark:bg-stone-900 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-200 dark:border-stone-800 overflow-hidden transform transition-all duration-500 animate-in fade-in-0 zoom-in-95">
          <div className="bg-emerald-800 p-8 text-white">
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{analysis.emoji}</span>
              <div>
                <h3 className="font-bold text-xl">Analysis Complete</h3>
                <p className="text-emerald-100/90 text-sm">
                  {analysis.source === 'local-fallback' ? 'Local Analysis (API Unavailable)' : 'AI-powered health insights'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Potential Issue</h4>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSeverityColor(analysis.severity)}`}>
                  {analysis.severity === 'high' ? 'High Priority' :
                    analysis.severity === 'medium' ? 'Moderate Priority' : 'General Concern'}
                </span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">{analysis.issue}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">Recommendations</h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                    <div className="w-3 h-3 bg-emerald-700 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
              <p className="text-emerald-800 dark:text-emerald-200 text-sm leading-relaxed">
                <strong>Note:</strong> This analysis is for informational purposes only.
                Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}