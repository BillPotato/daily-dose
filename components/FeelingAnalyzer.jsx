"use client";

// components/FeelingAnalyzer.jsx
import { useState } from 'react';
import { feelingAnalyzerAPI } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { generateGoogleCalendarUrl } from '@/lib/googleCalendarUrl';
import { mapGeminiTasksToAppTasks } from '@/lib/taskMapper';
import TaskCard from '@/components/TaskCard';
import { toast } from 'react-toastify';

export default function FeelingAnalyzer({ onTasksGenerated, onAnalysisComplete }) {
  const [feelingText, setFeelingText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [calendarLinks, setCalendarLinks] = useState([]);
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

  const localAnalyze = (text) => {
    // ... (your existing local analysis logic)
    const t = text.toLowerCase();
    const recs = [];
    let issue = 'General wellness check';
    let severity = 'low';
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300';
      default: return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300';
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'red': return 'from-red-500 to-orange-500';
      case 'orange': return 'from-orange-500 to-amber-500';
      case 'purple': return 'from-purple-500 to-indigo-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const stripCodeFence = (raw) => {
    if (typeof raw !== 'string') return raw;
    return raw
      .replace(/```(?:json)?\s*/gi, '')
      .replace(/```/g, '')
      .trim();
  };

  const addToCalendar = async (content) => {
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
    } catch (err) {
      console.error("Task generation failed:", err);
        if (err?.response?.status === 429) {
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

  const handleClick = async (content) => {
    // await analyzeFeeling()
    await addToCalendar(content)
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 dark:border-gray-700 p-8">
        <div className="mb-6">
          <label className="block text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How are you feeling today?
          </label>
          <textarea
            value={feelingText}
            onChange={(e) => setFeelingText(e.target.value)}
            placeholder="Describe your symptoms, emotions, or concerns in detail..."
            className="w-full h-48 px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 resize-none shadow-inner bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={6}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {feelingText.length}/500 characters
            </span>
            <button
              onClick={() => setFeelingText('')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 hover:scale-110"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            onClick={(e)=>handleClick(feelingText)}
            disabled={isAnalyzing || !feelingText.trim() || rateLimitReached}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Generated Health Tasks
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                These tasks have been added to your dashboard. Click "Add" to save them to Google Calendar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 dark:border-gray-700 p-8">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6 text-lg">Need inspiration? Try these examples:</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFeelingText(suggestion)}
              className="w-full text-left p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700 dark:to-blue-900/20 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-800/30 dark:hover:to-purple-800/30 rounded-xl transition-all duration-300 border border-gray-200/60 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transform hover:scale-[1.02]"
            >
              <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/60 dark:border-gray-700 overflow-hidden transform transition-all duration-500 animate-in fade-in-0 zoom-in-95">
          <div className={`bg-gradient-to-r ${getColorClasses(analysis.color)} p-8 text-white`}>
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{analysis.emoji}</span>
              <div>
                <h3 className="font-bold text-xl">Analysis Complete</h3>
                <p className="text-blue-100/90 text-sm">
                  {analysis.source === 'local-fallback' ? 'Local Analysis (API Unavailable)' : 'AI-powered health insights'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Potential Issue</h4>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSeverityColor(analysis.severity)}`}>
                  {analysis.severity === 'high' ? 'High Priority' :
                    analysis.severity === 'medium' ? 'Moderate Priority' : 'General Concern'}
                </span>
                <span className="text-gray-900 dark:text-white font-medium">{analysis.issue}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h4>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-700 dark:to-blue-900/20 rounded-xl border border-gray-200/60 dark:border-gray-600">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50/30 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm leading-relaxed">
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