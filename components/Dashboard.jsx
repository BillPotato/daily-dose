"use client";

// components/Dashboard.jsx
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import MedicationTracker from '@/components/MedicationTracker';
import { useTheme } from '@/contexts/ThemeContext';
import InteractiveStatBox from '@/components/InteractiveMoodbox';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ tasks = [], onUpdateTask, onDeleteTask }) {
  const [surveys, setSurveys] = useState([]);
  const [chartType, setChartType] = useState('mood');
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();
  const { isDark } = useTheme();

  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('surveys') || '[]');
    setSurveys(s);
  }, []);

  const stats = useMemo(() => {
    const totalSurveys = surveys.length;
    const avgMood = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.mood || 0), 0) / surveys.length).toFixed(1)
      : 0;
    const avgPain = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.pain || 0), 0) / surveys.length).toFixed(1)
      : 0;
    const avgExercise = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.exercise || 0), 0) / surveys.length).toFixed(0)
      : 0;
    const avgSleep = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + Number(s.answers.sleep || 0), 0) / surveys.length).toFixed(1)
      : 0;

    return { totalSurveys, avgMood, avgPain, avgExercise, avgSleep };
  }, [surveys]);

  const chartData = useMemo(() => {
    const sortedSurveys = [...surveys].sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedSurveys.map(survey =>
      new Date(survey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    const data = sortedSurveys.map(survey => {
      switch (chartType) {
        case 'mood': return Number(survey.answers.mood || 0);
        case 'pain': return Number(survey.answers.pain || 0);
        case 'exercise': return Number(survey.answers.exercise || 0);
        case 'sleep': return Number(survey.answers.sleep || 0);
        default: return 0;
      }
    });

    const chartConfig = {
      mood: {
        label: 'Mood Level',
        color: isDark ? 'rgba(96, 165, 250, 0.8)' : 'rgba(59, 130, 246, 0.8)',
        bgColor: isDark ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        max: 5
      },
      pain: {
        label: 'Pain Level',
        color: isDark ? 'rgba(248, 113, 113, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        bgColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        max: 10
      },
      exercise: {
        label: 'Exercise (minutes)',
        color: isDark ? 'rgba(52, 211, 153, 0.8)' : 'rgba(16, 185, 129, 0.8)',
        bgColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        max: Math.max(...data, 60)
      },
      sleep: {
        label: 'Sleep Quality',
        color: isDark ? 'rgba(167, 139, 250, 0.8)' : 'rgba(139, 92, 246, 0.8)',
        bgColor: isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        max: 5
      }
    };

    const config = chartConfig[chartType];

    return {
      labels,
      datasets: [
        {
          label: config.label,
          data,
          borderColor: config.color,
          backgroundColor: config.bgColor,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: config.color,
          pointBorderColor: isDark ? '#1f2937' : '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        }
      ]
    };
  }, [surveys, chartType, isDark]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `Your ${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Trend`,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: isDark ? '#f9fafb' : '#1f2937'
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f9fafb' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: chartData.datasets[0]?.data.length > 0 ? Math.max(...chartData.datasets[0].data) * 1.1 : 10,
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      }
    }
  };

  const ChartTypeButton = ({ type, label, icon, isActive }) => (
    <button
      onClick={() => setChartType(type)}
      className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${isActive
        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
        : `${isDark
          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          : 'bg-white/80 text-gray-700 hover:bg-white'
        } hover:shadow-md`
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const TabButton = ({ tab, label, icon, isActive }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all ${isActive
        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
        : `${isDark
          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
          : 'bg-white text-gray-700 hover:bg-gray-50'
        }`
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 pt-4">
      {/* Welcome Section - Simplified without header elements */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user.name || 'there'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Here's your health overview for today</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4">
        <TabButton
          tab="overview"
          label="Overview"
          icon="📊"
          isActive={activeTab === 'overview'}
        />
        <TabButton
          tab="medications"
          label="Medications"
          icon="💊"
          isActive={activeTab === 'medications'}
        />
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' ? (
        <>
          {/* Stats Grid - ALL CARDS ARE NOW INTERACTIVE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <InteractiveStatBox
              title="Total Surveys"
              value={stats.totalSurveys}
              subtitle="This month"
              icon="📊"
              gradient="from-blue-500 to-cyan-500"
              type="surveys"
            />

            <InteractiveStatBox
              title="Average Mood"
              value={stats.avgMood}
              subtitle="Out of 5"
              icon="😊"
              gradient="from-green-500 to-emerald-500"
              type="mood"
              additionalData={{ exercise: stats.avgExercise }}
            />

            <InteractiveStatBox
              title="Average Pain"
              value={stats.avgPain}
              subtitle="Out of 10"
              icon="🎯"
              gradient="from-orange-500 to-red-500"
              type="pain"
            />

            <InteractiveStatBox
              title="Avg Exercise"
              value={`${stats.avgExercise}`}
              subtitle="Minutes daily"
              icon="💪"
              gradient="from-purple-500 to-pink-500"
              type="exercise"
              additionalData={{ surveys: stats.totalSurveys }}
            />
          </div>

          {/* Chart Section */}
          <div className={`${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/60'
            } backdrop-blur-sm rounded-3xl shadow-xl border p-8`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'
                } mb-4 lg:mb-0`}>Health Trends</h2>

              {/* Chart Type Selector */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <ChartTypeButton
                  type="mood"
                  label="Mood"
                  icon="😊"
                  isActive={chartType === 'mood'}
                />
                <ChartTypeButton
                  type="pain"
                  label="Pain"
                  icon="🎯"
                  isActive={chartType === 'pain'}
                />
                <ChartTypeButton
                  type="exercise"
                  label="Exercise"
                  icon="💪"
                  isActive={chartType === 'exercise'}
                />
                <ChartTypeButton
                  type="sleep"
                  label="Sleep"
                  icon="😴"
                  isActive={chartType === 'sleep'}
                />
              </div>
            </div>

            <div className="h-80">
              {surveys.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📈</div>
                    <p className="text-lg mb-2">No survey data yet</p>
                    <p className="text-sm">Complete your first survey to see trends</p>
                    <button
                      onClick={() => router.push('/survey')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      Take First Survey
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Tasks */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Tasks Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tasks Card */}
              <div className={`${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/60'
                } backdrop-blur-sm rounded-3xl shadow-xl border p-8`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>Medication Tasks</h3>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full">
                    {tasks.filter(task => task.isActive).length} active tasks
                  </span>
                </div>

                {tasks.filter(task => task.isActive).length > 0 ? (
                  <div className="space-y-4">
                    {tasks.filter(task => task.isActive).slice(0, 5).map((task) => (
                      <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${isDark
                        ? 'bg-gray-700/50 border-gray-600 hover:border-blue-400'
                        : 'bg-gradient-to-r from-gray-50 to-blue-50/30 border-gray-200/60 hover:border-blue-300'
                        }`}>
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${task.completed && task.completed.some(comp => new Date(comp.timestamp).toDateString() === new Date().toDateString())
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                            }`}></div>
                          <div>
                            <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'
                              }`}>{task.title}</span>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                {task.times?.join(', ') || 'No times set'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-xs rounded-full ${task.frequency === 'daily'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                            }`}>
                            {task.frequency}
                          </span>
                          {task.completed && task.completed.some(comp => new Date(comp.timestamp).toDateString() === new Date().toDateString()) && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {tasks.filter(task => task.isActive).length > 5 && (
                      <p className={`text-center text-sm mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        +{tasks.filter(task => task.isActive).length - 5} more tasks
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💊</div>
                    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>No medication tasks yet</p>
                    <button
                      onClick={() => router.push('/medication-parser')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      Add Medications
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Surveys */}
              <div className={`${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/60'
                } backdrop-blur-sm rounded-3xl shadow-xl border p-8`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'
                  } mb-6`}>Recent Surveys</h3>
                {surveys.slice(0, 5).map((survey) => (
                  <div key={survey.id} className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200/60'
                    } last:border-0`}>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                        {new Date(survey.date).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Mood: {survey.answers.mood}/5 • Pain: {survey.answers.pain}/10
                      </p>
                    </div>
                    <div className="text-2xl">
                      {Number(survey.answers.mood) >= 4 ? '😊' :
                        Number(survey.answers.mood) >= 3 ? '😐' : '😔'}
                    </div>
                  </div>
                ))}
                {surveys.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>No surveys completed yet</p>
                    <button
                      onClick={() => router.push('/survey')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
                    >
                      Take First Survey
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              <div className={`${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-white/60'
                } backdrop-blur-sm rounded-3xl shadow-xl border p-8`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'
                  } mb-6`}>Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/survey')}
                    className={`w-full flex items-center space-x-4 p-6 rounded-xl transition-all duration-300 border hover:shadow-lg transform hover:scale-[1.02] text-left ${isDark
                      ? 'bg-gray-700/50 border-gray-600 hover:border-blue-400'
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50/50 border-blue-200/60 hover:border-blue-300'
                      }`}
                  >
                    <div className="text-2xl">📝</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>Daily Survey</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Complete your check-in</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/feeling-analyzer')}
                    className={`w-full flex items-center space-x-4 p-6 rounded-xl transition-all duration-300 border hover:shadow-lg transform hover:scale-[1.02] text-left ${isDark
                      ? 'bg-gray-700/50 border-gray-600 hover:border-green-400'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50/50 border-green-200/60 hover:border-green-300'
                      }`}
                  >
                    <div className="text-2xl">😊</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>Feeling Analyzer</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Get insights</p>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/medication-parser')}
                    className={`w-full flex items-center space-x-4 p-6 rounded-xl transition-all duration-300 border hover:shadow-lg transform hover:scale-[1.02] text-left ${isDark
                      ? 'bg-gray-700/50 border-gray-600 hover:border-purple-400'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50/50 border-purple-200/60 hover:border-purple-300'
                      }`}
                  >
                    <div className="text-2xl">💊</div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>Add Medications</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>Manage your prescriptions</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Health Tips */}
              <div className={`bg-gradient-to-br rounded-3xl p-8 border shadow-lg ${isDark
                ? 'from-emerald-900/50 to-green-800/50 border-emerald-700'
                : 'from-emerald-50 to-green-100/50 border-emerald-200/60'
                }`}>
                <h3 className={`font-semibold mb-4 flex items-center text-lg ${isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                  <span className="text-2xl mr-3">💡</span>
                  Health Tips
                </h3>
                <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}>•</span>
                    <span className="leading-relaxed">Stay hydrated throughout the day</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}>•</span>
                    <span className="leading-relaxed">Take regular breaks if sitting for long</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}>•</span>
                    <span className="leading-relaxed">Practice deep breathing exercises</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className={`mt-1 text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-500'
                      }`}>•</span>
                    <span className="leading-relaxed">Maintain consistent sleep schedule</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Medications Tab Content */
        <MedicationTracker
          tasks={tasks}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
}
