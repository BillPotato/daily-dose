"use client";

// components/MedicationParser.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { generateGoogleCalendarUrl } from '@/lib/googleCalendarUrl';
import { toast } from 'react-toastify';

export default function MedicationParser({ onSave }) {
  const [text, setText] = useState('');
  const [parsedTasks, setParsedTasks] = useState([]);
  const [calendarLinks, setCalendarLinks] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const router = useRouter();
  const { isDark } = useTheme();

  const examples = [
    `Lisinopril 10mg - once daily
Metformin 500mg - twice daily with meals
Atorvastatin 20mg - at bedtime
Aspirin 81mg - once daily`,

    `Vitamin D 1000 IU daily
Omega-3 1000mg twice daily
Calcium 600mg with breakfast
Multivitamin once daily`
  ];

  function parseToTasks(input) {
    return input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const lowerLine = line.toLowerCase();
        let frequency = 'as-directed';
        let type = 'medication';
        let defaultTime = '08:00';

        if (/\b(once|1x|one time)\b/.test(lowerLine)) {
          frequency = 'once-daily';
        } else if (/\b(twice|2x|two times|bid)\b/.test(lowerLine)) {
          frequency = 'twice-daily';
          defaultTime = '08:00,20:00';
        } else if (/\b(three times|3x|tid)\b/.test(lowerLine)) {
          frequency = 'three-times-daily';
          defaultTime = '08:00,13:00,20:00';
        } else if (/\b(daily|every day|qd)\b/.test(lowerLine)) {
          frequency = 'daily';
        } else if (/\b(weekly|once weekly)\b/.test(lowerLine)) {
          frequency = 'weekly';
        } else if (/\b(as needed|prn|when needed)\b/.test(lowerLine)) {
          frequency = 'as-needed';
        }

        if (/\b(morning|breakfast)\b/.test(lowerLine)) {
          defaultTime = '08:00';
        } else if (/\b(lunch|noon|midday)\b/.test(lowerLine)) {
          defaultTime = '12:00';
        } else if (/\b(dinner|evening|supper)\b/.test(lowerLine)) {
          defaultTime = '18:00';
        } else if (/\b(bedtime|night|sleep)\b/.test(lowerLine)) {
          defaultTime = '22:00';
        }

        if (/\b(vitamin|supplement|omega|calcium|multivitamin)\b/.test(lowerLine)) {
          type = 'supplement';
        }

        return {
          id: `${Date.now()}-${i}`,
          title: line,
          frequency,
          type,
          defaultTime,
          times: defaultTime.split(','),
          completed: [],
          createdAt: new Date().toISOString(),
          isActive: true,
          parsed: true
        };
      });
  }

  function handleParse() {
    if (!text.trim()) return;

    toast.info('Parsing tasks...');

    setIsParsing(true);
    setTimeout(() => {
      const tasks = parseToTasks(text);
      setParsedTasks(tasks);
      setIsParsing(false);
    }, 1000);
  }

  function handleTimeChange(taskId, timeIndex, newTime) {
    setParsedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newTimes = [...task.times];
        newTimes[timeIndex] = newTime;
        return { ...task, times: newTimes };
      }
      return task;
    }));
  }

  function addTimeSlot(taskId) {
    setParsedTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, times: [...task.times, '08:00'] };
      }
      return task;
    }));
  }

  function removeTimeSlot(taskId, timeIndex) {
    setParsedTasks(prev => prev.map(task => {
      if (task.id === taskId && task.times.length > 1) {
        const newTimes = task.times.filter((_, index) => index !== timeIndex);
        return { ...task, times: newTimes };
      }
      return task;
    }));
  }

  function handleSave() {
    if (parsedTasks.length === 0) return;

    onSave(parsedTasks);
    setText('');
    setParsedTasks([]);
    router.push('/dashboard');
    toast.success('Tasks saved successfully!');
  }

  function loadExample(exampleText) {
    setText(exampleText);
    setParsedTasks([]);
    setCalendarLinks([]);
  }

  const getFrequencyColor = (frequency) => {
    const colors = {
      'once-daily': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'twice-daily': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'three-times-daily': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'daily': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'weekly': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'as-needed': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      'as-directed': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    };
    return colors[frequency] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'medication': '💊',
      'supplement': '🌿'
    };
    return icons[type] || '💊';
  };

  const addToCalendar = () => {
    if (parsedTasks.length === 0) return;

    const now = new Date();

    try {
      const links = parsedTasks.flatMap(task => {
        const times = Array.isArray(task.times) && task.times.length > 0 ? task.times : ['08:00'];

        return times.map((time) => {
          const [hourText, minuteText] = String(time).split(':');
          const hours = Number(hourText);
          const minutes = Number(minuteText);
          const start = new Date(now);
          start.setDate(start.getDate() + 1);
          start.setHours(Number.isNaN(hours) ? 8 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);

          const end = new Date(start.getTime() + 60 * 60 * 1000);

          return generateGoogleCalendarUrl({
            title: `Medication: ${task.title}`,
            description: `Medication Reminder\n\nFrequency: ${task.frequency.replace(/-/g, ' ')}\nType: ${task.type}\nTime: ${time}`,
            start,
            end,
          });
        });
      });

      setCalendarLinks(links);

      toast.success('Google Calendar links generated successfully!');
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error('Failed to generate Google Calendar links.');
    }
  }

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-slate-900' : 'bg-gradient-to-br from-gray-50 to-blue-50/30'}`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button - Aligned to the left */}
          <button
            onClick={() => router.push('/dashboard')}
            className={`inline-flex items-center space-x-2 mb-6 transition-all duration-300 hover:scale-105 px-4 py-2 rounded-lg border ${isDark
              ? 'text-gray-400 hover:text-white bg-gray-800/80 border-gray-700 hover:border-gray-500'
              : 'text-gray-600 hover:text-gray-900 bg-white/80 border-gray-300 hover:border-gray-400'
              }`}
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>

          {/* Title and Description - Still centered */}
          <div className="text-center">
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Medication Parser
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Paste your medication list and we'll automatically create manageable tasks with reminders
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <div className="mb-4">
                <label className={`block text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                  Paste Medication List
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none font-mono text-sm ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  placeholder={`Example:
Lisinopril 10mg - once daily
Metformin 500mg - twice daily with meals
Vitamin D 1000 IU - daily
Ibuprofen 400mg - as needed for pain`}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleParse}
                  disabled={isParsing || !text.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isParsing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Parsing...
                    </>
                  ) : (
                    'Parse Medications'
                  )}
                </button>

                {parsedTasks.length > 0 && (
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    Save {parsedTasks.length} Tasks
                  </button>
                )}
              </div>
            </div>

            {/* Examples */}
            <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Try these examples:</h3>
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(example)}
                    className={`w-full text-left p-4 rounded-lg transition-all border ${isDark
                      ? 'bg-gray-700 hover:bg-blue-900/30 border-gray-600 hover:border-blue-500 text-gray-300'
                      : 'bg-gray-50 hover:bg-blue-50 border-transparent hover:border-blue-200 text-gray-700'
                      }`}
                  >
                    <div className="font-mono text-sm whitespace-pre-line">
                      {example.split('\n').slice(0, 2).join('\n')}
                      {example.split('\n').length > 2 && '...'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {parsedTasks.length > 0 ? (
              <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    Parsed Medications ({parsedTasks.length})
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm px-3 py-1 rounded-full">
                      Ready to save
                    </span>
                    <button
                      onClick={addToCalendar}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                      </svg>
                      <span>Add to Calendar</span>
                    </button>
                  </div>
                </div>

                {calendarLinks.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">Open and save your generated tasks:</p>
                    <div className="space-y-2">
                      {calendarLinks.map((link, index) => (
                        <a
                          key={`${link}-${index}`}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-emerald-700 dark:text-emerald-300 hover:underline"
                        >
                          Open Google Calendar task #{index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {parsedTasks.map((task) => (
                    <div key={task.id} className={`p-4 rounded-lg border transition-colors ${isDark
                      ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getTypeIcon(task.type)}</span>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>{task.title}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getFrequencyColor(task.frequency)}`}>
                          {task.frequency.replace(/-/g, ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {task.type.replace(/-/g, ' ')}
                        </span>
                      </div>

                      {/* Time Scheduling */}
                      <div className="space-y-3">
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                          Reminder Times:
                        </label>
                        <div className="space-y-2">
                          {task.times.map((time, timeIndex) => (
                            <div key={timeIndex} className="flex items-center space-x-2">
                              <input
                                type="time"
                                value={time}
                                onChange={(e) => handleTimeChange(task.id, timeIndex, e.target.value)}
                                className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${isDark
                                  ? 'bg-gray-600 border-gray-500 text-white'
                                  : 'bg-white border-gray-300 text-gray-900'
                                  }`}
                              />
                              {task.times.length > 1 && (
                                <button
                                  onClick={() => removeTimeSlot(task.id, timeIndex)}
                                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={() => addTimeSlot(task.id)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
                          >
                            <span>+ Add another time</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> These tasks will be added to your dashboard with automatic reminders.
                  </p>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl shadow-sm border p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <div className="text-6xl mb-4">💊</div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                  No medications parsed yet
                </h3>
                <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paste your medication list and click "Parse Medications"
                </p>
                <div className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  <p>• Supports multiple formats</p>
                  <p>• Automatically detects frequency</p>
                  <p>• Creates trackable tasks with reminders</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
